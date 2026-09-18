// VOLT Paywall Worker - Server-Side Payment Verifier Engine

import { Env, D1OrderRecord } from '../types';
import { DEV_PAYMENT_RECIPIENT, usdtToTokenUnits, ALLOW_LATE_DELIVERY } from '../config';
import {
  getRpcUrl,
  getChainId,
  getBlockNumber,
  getRpcChunkSize,
  getTokenContractAddress,
  getLogs,
  getTransactionReceipt,
  getBlockTimestamp,
  getFinalizedBlockNumber,
  isValidEvmAddress,
  RpcError,
} from './rpc';

const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

/**
 * Decodes an EVM address from a 32-byte topic.
 */
export function decodeTopicAddress(topic: string | null | undefined): string | null {
  if (!topic || typeof topic !== 'string' || !topic.startsWith('0x')) return null;
  const clean = topic.slice(2);
  if (clean.length !== 64) return null;
  return '0x' + clean.slice(24).toLowerCase();
}

/**
 * Decodes uint256 hex data into BigInt.
 */
export function decodeHexUint256(hexData: string | null | undefined): bigint {
  if (!hexData || typeof hexData !== 'string' || !hexData.startsWith('0x')) {
    return 0n;
  }
  try {
    return BigInt(hexData);
  } catch {
    return 0n;
  }
}

/**
 * Verifies if an order has received a valid on-chain payment on BSC Testnet.
 * Supports optional clientTxHash for instant direct verification.
 */
export async function verifyOrderPayment(orderId: string, env: Env, clientTxHash?: string | null): Promise<void> {
  const selectQuery = `SELECT * FROM orders WHERE id = ? LIMIT 1`;
  const record = await env.DB.prepare(selectQuery).bind(orderId).first<D1OrderRecord>();

  if (!record) {
    return;
  }

  // If already in final states, do not re-verify
  if (['PAID', 'PAID_LATE', 'CANCELLED', 'MANUAL_REVIEW'].includes(record.status)) {
    return;
  }

  const rpcUrl = getRpcUrl(env);
  if (!rpcUrl) {
    return; // Demo / offline mode without RPC
  }

  // Temporal Anchor: Validate record.created_at (fail-closed)
  const createdAtMs = record.created_at ? new Date(record.created_at).getTime() : NaN;
  if (isNaN(createdAtMs) || createdAtMs <= 0) {
    console.error(`[Verifier] Order '${orderId}' has missing or invalid created_at timestamp: '${record.created_at}'. Aborting verification (fail-closed).`);
    return;
  }

  // 1. Validate Network Chain ID (Defaults to 56 for BSC Mainnet, or 97 for Testnet if configured)
  const expectedChainId = record.chain_id || (env.CHAIN_ID ? parseInt(env.CHAIN_ID, 10) : 56);
  const chainId = await getChainId(env);
  if (chainId !== expectedChainId && chainId !== 56 && chainId !== 97) {
    throw new RpcError(`Chain ID mismatch during verification! Expected ${expectedChainId}, got ${chainId}`);
  }

  // 3. Get current block number
  const currentBlock = await getBlockNumber(env);

  // 2. Check and resolve created_block if null (dynamic fallback based on created_at)
  let resolvedCreatedBlock = record.created_block;
  if (resolvedCreatedBlock === null || resolvedCreatedBlock === undefined) {
    console.warn(`[Verifier] Order '${orderId}' has created_block = null. Running dynamic fallback derived from created_at...`);
    
    const nowMs = Date.now();
    const elapsedMs = Math.max(0, nowMs - createdAtMs);
    const BUFFER_MS = 15 * 60 * 1000; // 15 minutes safety buffer
    const totalSearchWindowMs = elapsedMs + BUFFER_MS;
    
    // BSC produces blocks approximately every 3 seconds.
    // Use conservative 1.5s per block (1500 ms) to absorb block time variations, bursts, and jitter.
    const estimatedBlocks = Math.ceil(totalSearchWindowMs / 1500);
    const MAX_SCAN_BLOCKS = 30000;
    const windowBlocks = Math.min(estimatedBlocks, MAX_SCAN_BLOCKS);
    
    resolvedCreatedBlock = Math.max(0, currentBlock - windowBlocks);
    console.log(
      `[Verifier] Dynamic fallback for order '${orderId}': resolvedCreatedBlock = ${resolvedCreatedBlock} (currentBlock: ${currentBlock}, window: ${windowBlocks} blocks derived from elapsed: ${elapsedMs}ms + 15m buffer)`
    );
  }

  if (currentBlock < resolvedCreatedBlock) {
    return; // No blocks mined since order creation
  }

  const tokenContract = getTokenContractAddress(env);
  const recipient = env.PAYMENT_RECIPIENT || DEV_PAYMENT_RECIPIENT;
  if (!isValidEvmAddress(recipient)) {
    throw new Error(`INVALID_PAYMENT_RECIPIENT: '${recipient}' is not a valid EVM address.`);
  }

  const expectedUnits = record.expected_units || usdtToTokenUnits(record.amount);
  const expectedUnitsBigInt = BigInt(expectedUnits);

  const chunkSize = getRpcChunkSize(env);
  const paddedRecipient = '0x000000000000000000000000' + recipient.toLowerCase().slice(2);

  let validCandidate: {
    txHash: string;
    fromAddress: string;
    toAddress: string;
    amountUnits: string;
    blockNumber: number;
    confirmations: number;
  } | null = null;

  // Path A: Direct validation if a client txHash is provided (EIP-1193 direct flow)
  if (clientTxHash && typeof clientTxHash === 'string' && clientTxHash.startsWith('0x') && clientTxHash.length === 66) {
    // 1. Anti-replay check: ensure txHash has never been assigned to any other order in D1
    const isDupeOrder = await env.DB.prepare(
      `SELECT id FROM orders WHERE tx_hash = ? AND id != ? LIMIT 1`
    ).bind(clientTxHash, orderId).first();
    const isDupePayment = await env.DB.prepare(
      `SELECT id FROM payments WHERE tx_hash = ? AND order_id != ? LIMIT 1`
    ).bind(clientTxHash, orderId).first();

    if (isDupeOrder || isDupePayment) {
      const error: any = new Error('Este hash de transacción ya fue utilizado en otra orden.');
      error.code = 'TRANSACTION_ALREADY_USED';
      error.status = 409;
      throw error;
    }

    try {
      const receipt = await getTransactionReceipt(env, clientTxHash);
      if (receipt) {
        const isSuccess = receipt.status === '0x1' || receipt.status === '0x01' || (receipt as any).status === true;
        if (!isSuccess) {
          const error: any = new Error('La transacción falló o fue revertida en la blockchain.');
          error.code = 'TRANSACTION_FAILED_ON_CHAIN';
          error.status = 400;
          throw error;
        }

        const logs = receipt.logs || [];
        let foundTransfer = false;
        let invalidRecipientFound = false;
        let amountTooLowFound = false;

        for (const log of logs) {
          // A. Verify contract address
          if (!log.address || log.address.toLowerCase() !== tokenContract.toLowerCase()) {
            continue;
          }
          // B. Verify Transfer event topic
          if (!log.topics || log.topics[0] !== TRANSFER_EVENT_TOPIC) {
            continue;
          }
          foundTransfer = true;

          // C. Verify recipient ("to" address in topics[2])
          const toAddr = decodeTopicAddress(log.topics[2]);
          if (!toAddr || toAddr !== recipient.toLowerCase()) {
            invalidRecipientFound = true;
            continue;
          }
          // D. Verify amount value
          const valBigInt = decodeHexUint256(log.data);
          if (valBigInt < expectedUnitsBigInt) {
            amountTooLowFound = true;
            continue;
          }
          // E. Verify block number >= resolvedCreatedBlock
          const blockNum = parseInt(log.blockNumber || receipt.blockNumber, 16);
          if (isNaN(blockNum) || blockNum < resolvedCreatedBlock) {
            continue;
          }

          const fromAddr = decodeTopicAddress(log.topics[1]) || receipt.from || '0x0000000000000000000000000000000000000000';
          const confirmations = Math.max(0, currentBlock - blockNum + 1);

          validCandidate = {
            txHash: clientTxHash,
            fromAddress: fromAddr,
            toAddress: recipient.toLowerCase(),
            amountUnits: expectedUnits,
            blockNumber: blockNum,
            confirmations,
          };
          break;
        }

        if (!validCandidate && foundTransfer) {
          if (amountTooLowFound) {
            const error: any = new Error('Monto pagado inferior al precio requerido (29 USDT).');
            error.code = 'INSUFFICIENT_AMOUNT';
            error.status = 400;
            throw error;
          }
          if (invalidRecipientFound) {
            const error: any = new Error('La transacción no transfirió los fondos a la wallet de cobro del comercio.');
            error.code = 'WRONG_RECIPIENT';
            error.status = 400;
            throw error;
          }
        } else if (!validCandidate && !foundTransfer && logs.length > 0) {
          // If logs exist but none for USDT contract
          const error: any = new Error('El token transferido no corresponde al contrato oficial de USDT (BEP-20) en BSC.');
          error.code = 'WRONG_TOKEN';
          error.status = 400;
          throw error;
        }
      }
    } catch (err: any) {
      if (err.code) {
        throw err;
      }
      console.warn(`Direct tx receipt verification failed for ${clientTxHash}:`, err);
    }
  }

  // Path B: Fallback Chunked log search from created_block to currentBlock (Manual payment flow)
  if (!validCandidate) {
    // To prevent Denial-of-Service (DoS) and RPC timeout abuses on old orders,
    // we restrict the chunk scan starting point to a safe maximum block range of 30,000 blocks (~25 hours of BSC testnet blocks).
    // If the payment occurred earlier, the user must provide clientTxHash for O(1) instant direct verification.
    const MAX_SCAN_BLOCKS = 30000;
    let chunkFrom = Math.max(resolvedCreatedBlock, currentBlock - MAX_SCAN_BLOCKS);
    while (chunkFrom <= currentBlock) {
      const chunkTo = Math.min(chunkFrom + chunkSize - 1, currentBlock);

      try {
        const logs = await getLogs(env, {
          fromBlock: chunkFrom,
          toBlock: chunkTo,
          address: tokenContract,
          topics: [TRANSFER_EVENT_TOPIC, null, paddedRecipient],
        });

        for (const log of logs) {
          // A. Verify contract address
          if (!log.address || log.address.toLowerCase() !== tokenContract.toLowerCase()) {
            continue;
          }

          // B. Verify recipient ("to" address in topic[2])
          const toAddr = decodeTopicAddress(log.topics?.[2]);
          if (!toAddr || toAddr !== recipient.toLowerCase()) {
            continue;
          }

          // C. Verify amount value
          const valBigInt = decodeHexUint256(log.data);
          if (valBigInt !== expectedUnitsBigInt) {
            continue;
          }

          const txHash = log.transactionHash;
          if (!txHash) continue;

          // E. Verify Transaction Receipt status
          const receipt = await getTransactionReceipt(env, txHash);
          if (!receipt) continue;

          const isSuccess = receipt.status === '0x1' || receipt.status === '0x01' || (receipt as unknown as { status: boolean }).status === true;
          if (!isSuccess) {
            continue; // Transaction failed on-chain
          }

          const blockNum = parseInt(log.blockNumber, 16);
          // F. Verify block number >= resolvedCreatedBlock
          if (isNaN(blockNum) || blockNum < resolvedCreatedBlock) {
            continue;
          }

          // G. Verify candidate on-chain timestamp >= createdAtMs
          const candidateBlockTimeSec = await getBlockTimestamp(env, blockNum);
          if (candidateBlockTimeSec !== null && candidateBlockTimeSec * 1000 < createdAtMs) {
            console.warn(
              `[Verifier] Candidate log tx '${txHash}' block timestamp (${candidateBlockTimeSec * 1000} ms) is strictly earlier than order created_at (${createdAtMs} ms). Skipping log candidate.`
            );
            continue;
          }

          // H. Verify tx is not already bound to another order
          const isDupe = await env.DB.prepare(
            `SELECT id FROM orders WHERE tx_hash = ? AND id != ? LIMIT 1`
          ).bind(txHash, orderId).first();
          if (isDupe) {
            continue;
          }

          const fromAddr = decodeTopicAddress(log.topics?.[1]) || receipt.from || '0x0000000000000000000000000000000000000000';
          const confirmations = Math.max(0, currentBlock - blockNum + 1);

          validCandidate = {
            txHash,
            fromAddress: fromAddr,
            toAddress: recipient.toLowerCase(),
            amountUnits: expectedUnits,
            blockNumber: blockNum,
            confirmations,
          };

          // Stop immediately on finding first valid candidate (Rule 14)
          break;
        }
      } catch (err) {
        console.warn(`RPC chunk scan error from ${chunkFrom} to ${chunkTo}:`, err);
      }

      if (validCandidate) {
        break;
      }

      chunkFrom = chunkTo + 1;
    }
  }

  if (!validCandidate) {
    return;
  }

  // 8. Duplicate Check: Ensure txHash is not already assigned to another order/payment
  const existingOrderCheck = await env.DB.prepare(
    `SELECT id FROM orders WHERE tx_hash = ? AND id != ? LIMIT 1`
  ).bind(validCandidate.txHash, orderId).first();

  const existingPaymentCheck = await env.DB.prepare(
    `SELECT id FROM payments WHERE tx_hash = ? AND order_id != ? LIMIT 1`
  ).bind(validCandidate.txHash, orderId).first();

  if (existingOrderCheck || existingPaymentCheck) {
    console.warn(`Duplicate txHash '${validCandidate.txHash}' attempted for order '${orderId}'`);
    return;
  }

  // 11. Mandatory Temporal Barrier & Late Payment Check
  const blockTimeSec = await getBlockTimestamp(env, validCandidate.blockNumber);
  
  if (blockTimeSec === null) {
    throw new Error(`RPC_TIMESTAMP_FETCH_FAILED: Failed to fetch on-chain block timestamp for block ${validCandidate.blockNumber}`);
  }

  const blockTimeMs = blockTimeSec * 1000;

  // Mandatory Temporal Barrier: Reject any transfer mined strictly prior to order creation
  if (blockTimeMs < createdAtMs) {
    console.warn(
      `[Verifier] Transaction '${validCandidate.txHash}' block timestamp (${blockTimeMs} ms) is strictly earlier than order created_at (${createdAtMs} ms). Payment rejected.`
    );
    return;
  }

  // Late Payment Check: Compare on-chain block timestamp vs expires_at
  const expiresAtMs = new Date(record.expires_at).getTime();
  const isLate = !isNaN(expiresAtMs) && blockTimeMs > expiresAtMs;

  let newStatus: string;
  if (isLate) {
    if (ALLOW_LATE_DELIVERY) {
      newStatus = 'PAID_LATE';
    } else {
      newStatus = 'MANUAL_REVIEW';
    }
  } else {
    // Primary mechanism: BSC Fast Finality (verifiable BFT finalization via 'finalized' block tag or eth_getFinalizedHeader)
    const finalizedBlock = await getFinalizedBlockNumber(env);
    const isFinalized = finalizedBlock !== null && validCandidate.blockNumber <= finalizedBlock;

    if (isFinalized) {
      newStatus = 'PAID';
    } else {
      // Conservative probabilistic depth fallback when BSC finality endpoint is unsupported or block is still pending finalization
      const FALLBACK_CONFIRMATIONS = 12;
      newStatus = validCandidate.confirmations >= FALLBACK_CONFIRMATIONS ? 'PAID' : 'CONFIRMING';
    }
  }

  const nowIso = new Date().toISOString();

  // 16. Atomic transaction update in D1
  const updateStmt = env.DB.prepare(`
    UPDATE orders
    SET status = ?, tx_hash = ?, confirmations = ?, buyer_address = ?,
        paid_at = CASE WHEN ? IN ('PAID', 'PAID_LATE') THEN COALESCE(paid_at, ?) ELSE paid_at END,
        updated_at = ?
    WHERE id = ? AND status IN ('PENDING', 'EXPIRED', 'CONFIRMING') AND (tx_hash IS NULL OR tx_hash = ?)
  `).bind(
    newStatus,
    validCandidate.txHash,
    validCandidate.confirmations,
    validCandidate.fromAddress,
    newStatus,
    nowIso,
    nowIso,
    orderId,
    validCandidate.txHash
  );

  const insertStmt = env.DB.prepare(`
    INSERT INTO payments (
      order_id, tx_hash, token_contract, from_address, to_address, amount, amount_units,
      block_number, confirmations, status, created_at, confirmed_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM orders WHERE id = ? AND tx_hash = ? AND status = ?
    ) AND NOT EXISTS (
      SELECT 1 FROM payments WHERE tx_hash = ? OR order_id = ?
    )
  `).bind(
    orderId,
    validCandidate.txHash,
    tokenContract,
    validCandidate.fromAddress,
    validCandidate.toAddress,
    record.amount,
    validCandidate.amountUnits,
    validCandidate.blockNumber,
    validCandidate.confirmations,
    newStatus,
    nowIso,
    nowIso,
    orderId,
    validCandidate.txHash,
    newStatus,
    validCandidate.txHash,
    orderId
  );

  try {
    await env.DB.batch([updateStmt, insertStmt]);
  } catch (err) {
    console.error(`D1 Atomic Transaction failed for order ${orderId}:`, err);
  }
}

/**
 * Scans D1 for active or recently expired orders and executes automated payment reconciliation.
 */
export async function reconcilePendingPayments(env: Env): Promise<void> {
  const rpcUrl = getRpcUrl(env);
  if (!rpcUrl) {
    return; // No-op if RPC is offline or demo mode
  }

  // Get orders that are PENDING, CONFIRMING or recently EXPIRED (within last 2 hours)
  const twoHoursAgoIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  
  try {
    const selectQuery = `
      SELECT id FROM orders
      WHERE status IN ('PENDING', 'CONFIRMING')
         OR (status = 'EXPIRED' AND created_at >= ?)
      ORDER BY created_at ASC
      LIMIT 15
    `;
    const records = await env.DB.prepare(selectQuery).bind(twoHoursAgoIso).all<{ id: string }>();
    if (!records || !records.results || records.results.length === 0) {
      return;
    }

    console.log(`[Reconciler] Found ${records.results.length} order candidates for autonomous verification.`);
    for (const record of records.results) {
      try {
        await verifyOrderPayment(record.id, env);
      } catch (err) {
        console.error(`[Reconciler] Failed to verify order '${record.id}':`, err);
      }
    }
  } catch (err) {
    console.error(`[Reconciler] Error selecting pending order candidates:`, err);
  }
}

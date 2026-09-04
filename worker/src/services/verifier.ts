// VOLT Paywall Worker - Server-Side Payment Verifier Engine

import { Env, D1OrderRecord } from '../types';
import { DEV_PAYMENT_RECIPIENT, usdtToTokenUnits } from '../config';
import {
  getRpcUrl,
  getChainId,
  getBlockNumber,
  getRpcChunkSize,
  getTokenContractAddress,
  getLogs,
  getTransactionReceipt,
  getBlockTimestamp,
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
 */
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

  // 1. Validate Network Chain ID == 97
  const chainId = await getChainId(rpcUrl);
  if (chainId !== 97) {
    throw new RpcError(`Chain ID mismatch during verification! Expected 97, got ${chainId}`);
  }

  // 2. Check created_block
  if (record.created_block === null || record.created_block === undefined) {
    throw new Error(`BLOCKCHAIN_VERIFICATION_ERROR: Order '${orderId}' has created_block = null but RPC is active.`);
  }

  // 3. Get current block number
  const currentBlock = await getBlockNumber(rpcUrl);
  if (currentBlock < record.created_block) {
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
    try {
      const receipt = await getTransactionReceipt(rpcUrl, clientTxHash);
      if (receipt) {
        const isSuccess = receipt.status === '0x1' || receipt.status === '0x01' || (receipt as any).status === true;
        if (isSuccess) {
          const logs = receipt.logs || [];
          for (const log of logs) {
            // A. Verify contract address
            if (!log.address || log.address.toLowerCase() !== tokenContract.toLowerCase()) {
              continue;
            }
            // B. Verify Transfer event topic
            if (!log.topics || log.topics[0] !== TRANSFER_EVENT_TOPIC) {
              continue;
            }
            // C. Verify recipient ("to" address in topics[2])
            const toAddr = decodeTopicAddress(log.topics[2]);
            if (!toAddr || toAddr !== recipient.toLowerCase()) {
              continue;
            }
            // D. Verify amount value
            const valBigInt = decodeHexUint256(log.data);
            if (valBigInt !== expectedUnitsBigInt) {
              continue;
            }
            // E. Verify block number >= created_block
            const blockNum = parseInt(log.blockNumber || receipt.blockNumber, 16);
            if (isNaN(blockNum) || blockNum < record.created_block) {
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
        }
      }
    } catch (err) {
      console.warn(`Direct tx receipt verification failed for ${clientTxHash}:`, err);
    }
  }

  // Path B: Fallback Chunked log search from created_block to currentBlock (Manual payment flow)
  if (!validCandidate) {
    // To prevent Denial-of-Service (DoS) and RPC timeout abuses on old orders,
    // we restrict the chunk scan starting point to a safe maximum block range of 30,000 blocks (~25 hours of BSC testnet blocks).
    // If the payment occurred earlier, the user must provide clientTxHash for O(1) instant direct verification.
    const MAX_SCAN_BLOCKS = 30000;
    let chunkFrom = Math.max(record.created_block, currentBlock - MAX_SCAN_BLOCKS);
    while (chunkFrom <= currentBlock) {
      const chunkTo = Math.min(chunkFrom + chunkSize - 1, currentBlock);

      try {
        const logs = await getLogs(rpcUrl, {
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
          const receipt = await getTransactionReceipt(rpcUrl, txHash);
          if (!receipt) continue;

          const isSuccess = receipt.status === '0x1' || receipt.status === '0x01' || (receipt as unknown as { status: boolean }).status === true;
          if (!isSuccess) {
            continue; // Transaction failed on-chain
          }

          const blockNum = parseInt(log.blockNumber, 16);
          // F. Verify block number >= created_block
          if (isNaN(blockNum) || blockNum < record.created_block) {
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

  // 11. Late Payment Check: Compare on-chain block timestamp vs expires_at
  const expiresAtMs = new Date(record.expires_at).getTime();
  const blockTimeSec = await getBlockTimestamp(rpcUrl, validCandidate.blockNumber);
  
  if (blockTimeSec === null) {
    throw new Error(`RPC_TIMESTAMP_FETCH_FAILED: Failed to fetch on-chain block timestamp for block ${validCandidate.blockNumber}`);
  }

  const blockTimeMs = blockTimeSec * 1000;
  const isLate = blockTimeMs > expiresAtMs;

  const REQUIRED_CONFIRMATIONS = 12;
  const newStatus = isLate
    ? 'PAID_LATE'
    : (validCandidate.confirmations >= REQUIRED_CONFIRMATIONS ? 'PAID' : 'CONFIRMING');
  const nowIso = new Date().toISOString();

  // 16. Atomic transaction update in D1
  const updateStmt = env.DB.prepare(`
    UPDATE orders
    SET status = ?, tx_hash = ?, confirmations = ?, buyer_address = ?, updated_at = ?
    WHERE id = ? AND status IN ('PENDING', 'EXPIRED', 'CONFIRMING') AND (tx_hash IS NULL OR tx_hash = ?)
  `).bind(
    newStatus,
    validCandidate.txHash,
    validCandidate.confirmations,
    validCandidate.fromAddress,
    nowIso,
    orderId,
    validCandidate.txHash
  );

  const insertStmt = env.DB.prepare(`
    INSERT INTO payments (
      order_id, tx_hash, token_contract, from_address, to_address, amount, amount_units,
      block_number, confirmations, status, created_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM orders WHERE id = ? AND tx_hash = ? AND status = ?
    ) AND NOT EXISTS (
      SELECT 1 FROM payments WHERE tx_hash = ?
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
    orderId,
    validCandidate.txHash,
    newStatus,
    validCandidate.txHash
  );

  try {
    await env.DB.batch([updateStmt, insertStmt]);
  } catch (err) {
    console.error(`D1 Atomic Transaction failed for order ${orderId}:`, err);
  }
}

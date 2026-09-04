// VOLT Paywall Worker - Orders Service (D1 Interactions)

import { Env, CreateOrderSuccessResponse, OrderStatusSuccessResponse, D1OrderRecord } from '../types';
import {
  PRODUCT,
  DEV_PAYMENT_RECIPIENT,
  ORDER_TTL_MS,
  generateExactAmount,
  generateOrderId,
  usdtToTokenUnits,
} from '../config';
import { getRpcUrl, getChainId, getBlockNumber, isValidEvmAddress } from './rpc';
import { verifyOrderPayment } from './verifier';

/**
 * Creates a new order and records it in D1.
 * Server is the sole authority on price, amount, recipient, paymentMode, and expiration.
 */
export async function createOrderInD1(
  productId: string,
  paymentMode: 'wallet' | 'manual' = 'manual',
  env: Env
): Promise<CreateOrderSuccessResponse> {
  if (productId !== PRODUCT.id) {
    throw new Error(`INVALID_PRODUCT_ID: Product '${productId}' is not supported.`);
  }

  const orderId = generateOrderId();
  const recipient = env.PAYMENT_RECIPIENT || DEV_PAYMENT_RECIPIENT;

  if (!isValidEvmAddress(recipient)) {
    throw new Error(`INVALID_PAYMENT_RECIPIENT: Recipient address '${recipient}' is not a valid 42-character EVM address.`);
  }

  const appEnv = (env.APP_ENV || 'development').toLowerCase();
  if (appEnv === 'production' && recipient === DEV_PAYMENT_RECIPIENT) {
    throw new Error(`INSECURE_RECIPIENT: Cannot use development placeholder recipient in production environment.`);
  }

  let amount: string;
  let expectedAmount: string;

  if (paymentMode === 'wallet') {
    amount = PRODUCT.price; // Exact "39" USDT
    expectedAmount = PRODUCT.price;
  } else {
    amount = generateExactAmount(parseInt(PRODUCT.price, 10)); // "39.XXXX"
    expectedAmount = amount;
  }

  // Exact BigInt calculation of 18-decimal token units (no floating point)
  const expectedUnits = usdtToTokenUnits(expectedAmount);

  const nowMs = Date.now();
  const createdAtIso = new Date(nowMs).toISOString();
  const expiresAtIso = new Date(nowMs + ORDER_TTL_MS).toISOString();

  // Obtain block number via RPC if configured (Objetivo 3 & Audit hardening)
  let createdBlock: number | null = null;
  const rpcUrl = getRpcUrl(env);
  if (rpcUrl) {
    // Real/Testnet blockchain flow: RPC is configured, so we MUST successfully fetch chainId and blockNumber
    try {
      const chainId = await getChainId(env);
      if (chainId !== 97) {
        throw new Error(`Chain ID mismatch! Expected 97, got ${chainId}`);
      }
      createdBlock = await getBlockNumber(env);
      if (typeof createdBlock !== 'number' || createdBlock < 0) {
        throw new Error(`Invalid block number received from RPC: ${createdBlock}`);
      }
    } catch (err) {
      throw new Error(`BLOCKCHAIN_RPC_FAILURE: Failed to obtain valid created_block from RPC: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    // Demo / offline mode without RPC configured: createdBlock remains null
    createdBlock = null;
  }

  // Insert into D1 database with payment_mode and created_block
  const insertQuery = `
    INSERT INTO orders (
      id, product_id, payment_mode, amount, expected_amount, expected_units, currency, network, chain_id,
      recipient, status, created_at, expires_at, created_block,
      paid_at, tx_hash, confirmations, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      NULL, NULL, NULL, ?
    )
  `;

  await env.DB.prepare(insertQuery)
    .bind(
      orderId,
      PRODUCT.id,
      paymentMode,
      amount,
      expectedAmount,
      expectedUnits,
      PRODUCT.currency,
      PRODUCT.network,
      PRODUCT.chainId,
      recipient,
      'PENDING',
      createdAtIso,
      expiresAtIso,
      createdBlock,
      createdAtIso
    )
    .run();

  return {
    orderId,
    productId: PRODUCT.id,
    paymentMode,
    amount,
    expectedAmount,
    expectedUnits,
    currency: PRODUCT.currency,
    network: PRODUCT.network,
    chainId: PRODUCT.chainId,
    recipient,
    expiresAt: expiresAtIso,
    status: 'PENDING',
    createdBlock,
  };
}

/**
 * Retrieves order status from D1.
 * Automatically checks and transitions expired pending orders.
 */
export async function getOrderStatusFromD1(
  orderId: string,
  env: Env,
  clientTxHash?: string | null
): Promise<OrderStatusSuccessResponse | null> {
  const selectQuery = `SELECT * FROM orders WHERE id = ? LIMIT 1`;
  const record = await env.DB.prepare(selectQuery).bind(orderId).first<D1OrderRecord>();

  if (!record) {
    return null;
  }

  // Attempt verification if pending, expired, or confirming (to update confirmations or transition to PAID)
  if (record.status === 'PENDING' || record.status === 'EXPIRED' || record.status === 'CONFIRMING') {
    try {
      await verifyOrderPayment(orderId, env, clientTxHash);
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  }

  // Re-fetch updated record after verification
  const freshRecord = await env.DB.prepare(selectQuery).bind(orderId).first<D1OrderRecord>() || record;

  let currentStatus = freshRecord.status;
  const nowMs = Date.now();
  const expiresAtMs = new Date(freshRecord.expires_at).getTime();

  // Handle server-side expiration check
  if (currentStatus === 'PENDING' && nowMs >= expiresAtMs) {
    currentStatus = 'EXPIRED';
    const updateQuery = `UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`;
    await env.DB.prepare(updateQuery).bind('EXPIRED', new Date(nowMs).toISOString(), orderId).run();
  }

  return {
    orderId: freshRecord.id,
    status: currentStatus,
    paymentMode: freshRecord.payment_mode || 'manual',
    amount: freshRecord.amount,
    expectedAmount: freshRecord.expected_amount || freshRecord.amount,
    expectedUnits: freshRecord.expected_units || usdtToTokenUnits(freshRecord.amount),
    currency: 'USDT',
    network: 'BSC',
    chainId: freshRecord.chain_id as 56 | 97,
    recipient: freshRecord.recipient,
    buyerAddress: freshRecord.buyer_address ?? null,
    expiresAt: freshRecord.expires_at,
    txHash: freshRecord.tx_hash ?? null,
    confirmations: freshRecord.confirmations ?? 0,
    createdBlock: freshRecord.created_block ?? null,
  };
}

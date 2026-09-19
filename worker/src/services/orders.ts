// VOLT Paywall Worker - Orders Service (D1 Interactions)

import { Env, CreateOrderSuccessResponse, OrderStatusSuccessResponse, D1OrderRecord } from '../types';
import {
  getProductById,
  DEFAULT_PRODUCT,
  DEV_PAYMENT_RECIPIENT,
  ORDER_TTL_MS,
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
  const cleanProductId = (productId || '').trim();
  if (!cleanProductId) {
    throw new Error('INVALID_PRODUCT: Product ID is required.');
  }

  const targetProduct = getProductById(cleanProductId);
  if (!targetProduct || !targetProduct.active) {
    throw new Error(`INVALID_PRODUCT: Product '${cleanProductId}' does not exist or is currently inactive. Orders cannot be created for inactive products.`);
  }

  const orderId = generateOrderId();
  const recipient = (env.PAYMENT_RECIPIENT || '').trim();

  // Strict anti-placeholder checks: prevent deploying or processing orders with fake/dead wallets
  const isPlaceholderOrDead = (addr: string): boolean => {
    const lower = addr.toLowerCase();
    if (!lower || lower.length !== 42) return true;
    if (lower === '0x0000000000000000000000000000000000000000') return true;
    if (lower === '0x000000000000000000000000000000000000dead') return true;
    if (/^0x(.)\1{39}$/i.test(lower)) return true; // e.g. 0x111111... or 0xaaaaaa...
    if (lower === '0x1234567890123456789012345678901234567890') return true;
    return false;
  };

  if (!recipient || !isValidEvmAddress(recipient) || isPlaceholderOrDead(recipient)) {
    throw new Error(
      `INSECURE_RECIPIENT: Set your real personal BSC/EVM wallet address in PAYMENT_RECIPIENT before accepting real payments. Placeholder or dead addresses ('${recipient}') are strictly blocked.`
    );
  }

  // Price is strictly server-side authoritative from catalog (e.g. "29" or "9" USDT)
  const amount = targetProduct.price;
  const expectedAmount = targetProduct.price;

  // Exact BigInt calculation of 18-decimal token units (no floating point)
  const expectedUnits = usdtToTokenUnits(expectedAmount);

  const nowMs = Date.now();
  const createdAtIso = new Date(nowMs).toISOString();
  const expiresAtIso = new Date(nowMs + ORDER_TTL_MS).toISOString();

  const activeChainId = env.CHAIN_ID ? parseInt(env.CHAIN_ID, 10) : 56;

  // Obtain block number via RPC if configured
  let createdBlock: number | null = null;
  const rpcConfigured = Boolean(
    env.BSC_RPC_URL &&
    !['', 'none', 'disabled'].includes(env.BSC_RPC_URL.trim().toLowerCase())
  );
  if (rpcConfigured) {
    try {
      const chainId = await getChainId(env);
      if (chainId !== activeChainId) {
        throw new Error(`Chain ID mismatch! Expected ${activeChainId}, got ${chainId}`);
      }
      createdBlock = await getBlockNumber(env);
      if (typeof createdBlock !== 'number' || createdBlock < 0) {
        throw new Error(`Invalid block number received from RPC: ${createdBlock}`);
      }
    } catch (err) {
      throw new Error(`BLOCKCHAIN_RPC_FAILURE: Failed to obtain valid created_block from RPC: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
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
      targetProduct.id,
      paymentMode,
      amount,
      expectedAmount,
      expectedUnits,
      targetProduct.currency,
      targetProduct.network,
      activeChainId,
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
    productId: targetProduct.id,
    productName: targetProduct.name,
    deliveryMode: targetProduct.deliveryMode,
    paymentMode,
    amount,
    expectedAmount,
    expectedUnits,
    currency: targetProduct.currency,
    network: targetProduct.network,
    chainId: activeChainId as 56 | 97,
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

  // Attempt verification if pending, expired, or confirming
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

  const product = getProductById(freshRecord.product_id) || DEFAULT_PRODUCT;

  return {
    orderId: freshRecord.id,
    productId: freshRecord.product_id || product.id,
    productName: product.name,
    deliveryMode: product.deliveryMode,
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

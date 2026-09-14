/**
 * VOLT Paywall — BEP-20 USDT (BNB Smart Chain) Web3 Payment Gateway & Deliverable Delivery Worker
 * Production-Grade Cloudflare Worker with Hono.js & Cloudflare D1
 */

import { Hono } from 'hono';
import { Env } from './types';
import { PRODUCT } from './config';
import { createOrderInD1, getOrderStatusFromD1 } from './services/orders';
import { getProjectBDeliverableFiles, buildZipArchive } from './services/zipBuilder';

const app = new Hono<{ Bindings: Env }>();

// ----------------------------------------------------------------------------
// CORS Middleware for API routes
// ----------------------------------------------------------------------------
app.use('/api/*', async (c, next) => {
  const allowedOriginsStr = c.env.ALLOWED_ORIGINS || '*';
  const origins = allowedOriginsStr.split(',').map((s) => s.trim());
  const originHeader = c.req.header('Origin') || '';
  const isAllowed = origins.includes('*') || origins.includes(originHeader);
  const allowOrigin = isAllowed ? (originHeader || '*') : (origins[0] || '*');

  await next();

  c.res.headers.set('Access-Control-Allow-Origin', allowOrigin);
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Max-Age', '86400');
});

app.options('/api/*', (c) => {
  const allowedOriginsStr = c.env.ALLOWED_ORIGINS || '*';
  const origins = allowedOriginsStr.split(',').map((s) => s.trim());
  const originHeader = c.req.header('Origin') || '';
  const isAllowed = origins.includes('*') || origins.includes(originHeader);
  const allowOrigin = isAllowed ? (originHeader || '*') : (origins[0] || '*');

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// ----------------------------------------------------------------------------
// Health & Configuration Endpoints
// ----------------------------------------------------------------------------
app.get('/api/health', (c) => {
  const chainId = c.env.CHAIN_ID ? parseInt(c.env.CHAIN_ID, 10) : 56;
  return c.json({
    status: 'ok',
    network: 'BSC',
    chainId,
    service: 'VOLT Paywall BSC USDT Engine',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/config', (c) => {
  const chainId = c.env.CHAIN_ID ? parseInt(c.env.CHAIN_ID, 10) : 56;
  return c.json({
    productId: PRODUCT.id,
    name: PRODUCT.name,
    price: PRODUCT.price,
    currency: PRODUCT.currency,
    network: PRODUCT.network,
    chainId,
  });
});

// ----------------------------------------------------------------------------
// Order Management Endpoints
// ----------------------------------------------------------------------------
app.post('/api/orders', async (c) => {
  try {
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON request body.' } }, 400);
    }

    const { productId, paymentMode } = body;
    const order = await createOrderInD1(productId, paymentMode, c.env);
    return c.json(order, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: 'ORDER_CREATION_FAILED', message } }, 500);
  }
});

app.get('/api/status', async (c) => {
  const orderId = c.req.query('orderId');
  const txHash = c.req.query('txHash');

  if (!orderId) {
    return c.json({ error: { code: 'MISSING_ORDER_ID', message: 'Parameter orderId is required.' } }, 400);
  }

  try {
    const status = await getOrderStatusFromD1(orderId, c.env, txHash);
    if (!status) {
      return c.json({ error: { code: 'ORDER_NOT_FOUND', message: `Order '${orderId}' not found.` } }, 404);
    }
    return c.json(status, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: 'ORDER_STATUS_FAILED', message } }, 500);
  }
});

// ----------------------------------------------------------------------------
// Secure Delivery Endpoints
// ----------------------------------------------------------------------------
app.post('/api/download-token', async (c) => {
  try {
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON request body.' } }, 400);
    }

    const { orderId } = body;
    if (!orderId) {
      return c.json({ error: { code: 'MISSING_ORDER_ID', message: 'Field orderId is required.' } }, 400);
    }

    const order = await c.env.DB.prepare('SELECT status FROM orders WHERE id = ? LIMIT 1')
      .bind(orderId)
      .first<{ status: string }>();

    if (!order) {
      return c.json({ error: { code: 'ORDER_NOT_FOUND', message: 'Order not found.' } }, 404);
    }

    if (order.status !== 'PAID' && order.status !== 'PAID_LATE') {
      return c.json({ error: { code: 'ORDER_NOT_PAID', message: 'Order has not been paid yet.' } }, 403);
    }

    const tokenPlaintext = `volt_tok_${crypto.randomUUID().replace(/-/g, '')}`;
    const now = Date.now();
    const createdAt = new Date(now).toISOString();
    const expiresAt = new Date(now + 3600000).toISOString(); // 1 hour

    await c.env.DB.prepare(
      'INSERT INTO download_tokens (order_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(orderId, tokenPlaintext, expiresAt, createdAt)
      .run();

    return c.json({ token: tokenPlaintext }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: 'DOWNLOAD_TOKEN_FAILED', message } }, 500);
  }
});

app.get('/api/download', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.text('Missing download token.', 400);
  }

  // 1. Fetch token record from D1
  const tokenRecord = await c.env.DB.prepare(
    'SELECT * FROM download_tokens WHERE token_hash = ? LIMIT 1'
  )
    .bind(token)
    .first<{
      order_id: string;
      expires_at: string;
      used_at: string | null;
    }>();

  if (!tokenRecord) {
    return c.text('Invalid or expired download token.', 403);
  }

  const now = Date.now();
  const expiresAtMs = new Date(tokenRecord.expires_at).getTime();

  // Check 1-hour expiration first
  if (now > expiresAtMs) {
    return c.text('Download token expired.', 403);
  }

  // Check 10-minute recovery grace period
  const GRACE_PERIOD_MS = 10 * 60 * 1000;
  if (tokenRecord.used_at) {
    const usedAtMs = new Date(tokenRecord.used_at).getTime();
    if (now - usedAtMs > GRACE_PERIOD_MS) {
      return c.text('Download token already claimed more than 10 minutes ago. Access expired.', 403);
    }
  } else {
    // Atomic first claim: update used_at conditionally
    const nowIso = new Date(now).toISOString();
    const updateResult = await c.env.DB.prepare(
      'UPDATE download_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL'
    )
      .bind(nowIso, token)
      .run();

    if (updateResult.meta && updateResult.meta.changes === 0) {
      // If concurrent request updated it, re-check used_at
      const recheck = await c.env.DB.prepare(
        'SELECT * FROM download_tokens WHERE token_hash = ? LIMIT 1'
      )
        .bind(token)
        .first<{ used_at: string | null }>();

      if (recheck?.used_at) {
        const recheckUsedMs = new Date(recheck.used_at).getTime();
        if (now - recheckUsedMs > GRACE_PERIOD_MS) {
          return c.text('Download token already claimed more than 10 minutes ago. Access expired.', 403);
        }
      }
    }
  }

  // 2. Deliver ZIP deliverable
  const isProduction = (c.env.APP_ENV || 'development').toLowerCase() === 'production';
  const kv = c.env.PRODUCT_PAYLOAD_KV || c.env.ASSETS_KV;

  let zipData: ArrayBuffer | null = null;
  if (kv) {
    try {
      zipData = await kv.get('volt-paywall-engine.zip', { type: 'arrayBuffer' })
        || await kv.get('zip_content', { type: 'arrayBuffer' });
    } catch {
      // KV lookup error
    }
  }

  if (!zipData) {
    if (isProduction) {
      return c.json({ error: 'ASSET_UNAVAILABLE', message: 'Asset storage is unprovisioned or unavailable in production.' }, 500);
    }
    // In development / demo: generate dynamic uncompressed ZIP
    const files = getProjectBDeliverableFiles(tokenRecord.order_id, new Date(now).toISOString());
    const archive = buildZipArchive(files);
    zipData = archive.buffer.slice(archive.byteOffset, archive.byteOffset + archive.byteLength) as ArrayBuffer;
  }

  return new Response(zipData, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="volt-paywall-engine.zip"',
      'Content-Length': zipData.byteLength.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
});

// ----------------------------------------------------------------------------
// Static Assets Routing (Frontend SPA)
// ----------------------------------------------------------------------------
app.all('*', async (c) => {
  const pathname = new URL(c.req.url).pathname;
  if (pathname.startsWith('/api/')) {
    return c.json({ error: { code: 'NOT_FOUND', message: `Endpoint '${pathname}' not found.` } }, 404);
  }
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default app;

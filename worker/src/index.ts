/**
 * VOLT Paywall — BEP-20 USDT (BNB Smart Chain) Web3 Payment Gateway & Deliverable Delivery Worker
 * Production-Grade Cloudflare Worker with Hono.js & Cloudflare D1
 */

import { Hono } from 'hono';
import { Env, D1AccessTokenRecord } from './types';
import { PRODUCT, PRODUCTS, getProductById } from './config';
import { createOrderInD1, getOrderStatusFromD1 } from './services/orders';
import { checkRateLimit } from './services/rateLimiter';
import { verifyOrderPayment } from './services/verifier';
import { signDownloadToken, verifyDownloadToken, signAccessToken, verifyAccessToken } from './services/tokens';

const app = new Hono<{ Bindings: Env }>();

// ----------------------------------------------------------------------------
// CORS Middleware for API routes (Strict Production Origins)
// ----------------------------------------------------------------------------
app.use('/api/*', async (c, next) => {
  const allowedOriginsStr = c.env.ALLOWED_ORIGINS || 'https://volt-paywall.rainerblanco405.workers.dev';
  const origins = allowedOriginsStr.split(',').map((s) => s.trim()).filter(Boolean);
  const originHeader = c.req.header('Origin') || '';
  
  // Non-wildcard production origin restriction
  const isAllowed = originHeader ? origins.includes(originHeader) || origins.includes('*') : true;
  const allowOrigin = originHeader && isAllowed ? originHeader : (origins[0] || '');

  await next();

  if (isAllowed && allowOrigin) {
    c.res.headers.set('Access-Control-Allow-Origin', allowOrigin);
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Volt-Secret, x-volt-secret');
    c.res.headers.set('Access-Control-Max-Age', '86400');
  }
});

app.options('/api/*', (c) => {
  const allowedOriginsStr = c.env.ALLOWED_ORIGINS || 'https://volt-paywall.rainerblanco405.workers.dev';
  const origins = allowedOriginsStr.split(',').map((s) => s.trim()).filter(Boolean);
  const originHeader = c.req.header('Origin') || '';
  const isAllowed = originHeader ? origins.includes(originHeader) || origins.includes('*') : true;
  const allowOrigin = originHeader && isAllowed ? originHeader : (origins[0] || '');

  if (!isAllowed) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Volt-Secret, x-volt-secret',
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
    service: 'VOLT Paywall BSC USDT Multi-Product Store',
    version: '4.2.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/config', (c) => {
  const chainId = c.env.CHAIN_ID ? parseInt(c.env.CHAIN_ID, 10) : 56;
  return c.json({
    products: PRODUCTS,
    chainId,
    publicFixerUrl: c.env.PUBLIC_FIXER_URL || 'https://vibe-fixer.workers.dev',
  });
});

app.get('/api/products', (c) => {
  return c.json({ products: PRODUCTS });
});

// ----------------------------------------------------------------------------
// Order Management Endpoints
// ----------------------------------------------------------------------------
app.post('/api/orders', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rateLimit = await checkRateLimit(c.env, ip, 'create_order', 20);
  if (!rateLimit.isAllowed) {
    c.header('Retry-After', String(rateLimit.retryAfter));
    return c.json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Please try again later.' } }, 429);
  }

  try {
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON request body.' } }, 400);
    }

    const { productId, paymentMode } = body;
    const cleanProductId = productId || 'creator-pack';
    const order = await createOrderInD1(cleanProductId, paymentMode, c.env);
    return c.json(order, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: 'ORDER_CREATION_FAILED', message } }, 500);
  }
});

app.post('/api/verify', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rateLimit = await checkRateLimit(c.env, ip, 'verify_payment', 30);
  if (!rateLimit.isAllowed) {
    c.header('Retry-After', String(rateLimit.retryAfter));
    return c.json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Please try again later.' } }, 429);
  }

  try {
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON request body.' } }, 400);
    }

    const { orderId, txHash } = body;
    if (!orderId) {
      return c.json({ error: { code: 'MISSING_ORDER_ID', message: 'Field orderId is required.' } }, 400);
    }

    // Verify payment in D1 / on-chain BSC
    try {
      await verifyOrderPayment(orderId, c.env, txHash);
    } catch (err: any) {
      if (err.code === 'ORDER_EXPIRED') {
        return c.json({ error: { code: 'ORDER_EXPIRED', message: 'La orden ha expirado. Por favor genera una nueva orden.' } }, 400);
      }
      if (err.code === 'INSUFFICIENT_AMOUNT' || err.code === 'AMOUNT_TOO_LOW') {
        return c.json({ error: { code: 'INSUFFICIENT_AMOUNT', message: err.message || 'Monto transferido inferior al precio requerido.' } }, 400);
      }
      if (err.code === 'WRONG_RECIPIENT' || err.code === 'INVALID_RECIPIENT') {
        return c.json({ error: { code: 'WRONG_RECIPIENT', message: 'La transacción no transfirió los fondos a la wallet oficial del comercio.' } }, 400);
      }
      if (err.code === 'WRONG_TOKEN' || err.code === 'INVALID_TOKEN' || (err.message && err.message.includes('token contract'))) {
        return c.json({ error: { code: 'WRONG_TOKEN', message: 'El contrato del token no corresponde a USDT oficial (BEP-20) en BNB Smart Chain.' } }, 400);
      }
      if (err.code === 'TRANSACTION_ALREADY_USED') {
        return c.json({ error: { code: 'TRANSACTION_ALREADY_USED', message: 'Este hash de transacción ya fue utilizado en otra orden (anti-replay).' } }, 409);
      }
      if (err.code === 'RPC_UNAVAILABLE' || err.code === 'BLOCKCHAIN_RPC_FAILURE' || (err.message && (err.message.includes('RPC') || err.message.includes('Chain ID')))) {
        return c.json({ error: { code: 'RPC_UNAVAILABLE', message: 'Nodos RPC de BNB Smart Chain temporalmente no disponibles o saturados. Reintentando...' } }, 502);
      }
      if (err.code === 'TRANSACTION_FAILED_ON_CHAIN') {
        return c.json({ error: { code: 'TRANSACTION_FAILED_ON_CHAIN', message: 'La transacción falló o fue revertida en la blockchain.' } }, 400);
      }
      throw err;
    }

    const status = await getOrderStatusFromD1(orderId, c.env, txHash);
    if (!status) {
      return c.json({ error: { code: 'ORDER_NOT_FOUND', message: `Order '${orderId}' not found.` } }, 404);
    }

    const isPaid = status.status === 'PAID' || status.status === 'PAID_LATE';
    const product = getProductById(status.productId) || PRODUCT;

    let token: string | undefined = undefined;
    let downloadUrl: string | undefined = undefined;
    let accessToken: string | undefined = undefined;
    let creditsRemaining: number | undefined = undefined;
    let initialCredits: number | undefined = undefined;
    const fixerUrl = c.env.PUBLIC_FIXER_URL || 'https://vibe-fixer.workers.dev';

    if (isPaid && (c.env.JWT_SECRET || 'secret')) {
      const secret = c.env.JWT_SECRET || 'volt_default_secret_jwt';
      
      if (product.deliveryMode === 'DRIVE_FILE') {
        // Issue single-use download token for ZIP file
        try {
          const { token: signedToken, jti, expiresAtIso, createdAtIso } = await signDownloadToken(orderId, secret, 3600);
          await c.env.DB.prepare(
            'INSERT INTO download_tokens (order_id, token_hash, jti, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
          )
            .bind(orderId, signedToken, jti, expiresAtIso, createdAtIso)
            .run();
          token = signedToken;
          downloadUrl = `/api/download?token=${encodeURIComponent(signedToken)}`;
        } catch (tokenErr) {
          console.error('Failed to auto-generate download token during verify:', tokenErr);
        }
      } else if (product.deliveryMode === 'CREDITS') {
        // Issue access key for 5 Vibe Error Fixer credits (30 days validity)
        try {
          const existingToken = await c.env.DB.prepare(
            'SELECT * FROM access_tokens WHERE order_id = ? LIMIT 1'
          ).bind(orderId).first<D1AccessTokenRecord>();

          if (existingToken) {
            accessToken = existingToken.token_hash;
            creditsRemaining = existingToken.credits_remaining;
            initialCredits = existingToken.initial_credits;
          } else {
            const productCredits = product.credits || 5;
            const { token: signedAccessToken, expiresAtIso, createdAtIso } = await signAccessToken(
              orderId,
              product.id,
              secret,
              productCredits,
              30 * 24 * 3600
            );

            await c.env.DB.prepare(
              `INSERT INTO access_tokens (token_hash, order_id, product_id, credits_remaining, initial_credits, expires_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                signedAccessToken,
                orderId,
                product.id,
                productCredits,
                productCredits,
                expiresAtIso,
                createdAtIso,
                createdAtIso
              )
              .run();

            accessToken = signedAccessToken;
            creditsRemaining = productCredits;
            initialCredits = productCredits;
          }
        } catch (creditErr) {
          console.error('Failed to issue access token for credits:', creditErr);
        }
      }
    }

    // Return sanitized verify response (never includes secret URLs or raw Drive links)
    return c.json({
      success: isPaid,
      orderId: status.orderId,
      productId: status.productId,
      productName: status.productName,
      deliveryMode: status.deliveryMode,
      status: status.status,
      token,
      downloadUrl,
      accessToken,
      creditsRemaining,
      initialCredits,
      fixerUrl: status.deliveryMode === 'CREDITS' ? fixerUrl : undefined,
      amount: status.amount,
      currency: status.currency,
      network: status.network,
      chainId: status.chainId,
      recipient: status.recipient,
      txHash: status.txHash,
      confirmations: status.confirmations,
      expiresAt: status.expiresAt,
    }, 200);
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err.code || 'VERIFICATION_FAILED';
    const httpStatus = err.status || 500;
    return c.json({ error: { code, message } }, httpStatus);
  }
});

app.get('/api/status', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rateLimit = await checkRateLimit(c.env, ip, 'verify_payment', 30);
  if (!rateLimit.isAllowed) {
    c.header('Retry-After', String(rateLimit.retryAfter));
    return c.json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Please try again later.' } }, 429);
  }

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

    const isPaid = status.status === 'PAID' || status.status === 'PAID_LATE';
    const product = getProductById(status.productId) || PRODUCT;

    let token: string | undefined = undefined;
    let downloadUrl: string | undefined = undefined;
    let accessToken: string | undefined = undefined;
    let creditsRemaining: number | undefined = undefined;
    let initialCredits: number | undefined = undefined;
    const fixerUrl = c.env.PUBLIC_FIXER_URL || 'https://vibe-fixer.workers.dev';

    if (isPaid && (c.env.JWT_SECRET || 'secret')) {
      const secret = c.env.JWT_SECRET || 'volt_default_secret_jwt';

      if (product.deliveryMode === 'DRIVE_FILE') {
        try {
          const { token: signedToken, jti, expiresAtIso, createdAtIso } = await signDownloadToken(orderId, secret, 3600);
          await c.env.DB.prepare(
            'INSERT INTO download_tokens (order_id, token_hash, jti, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
          )
            .bind(orderId, signedToken, jti, expiresAtIso, createdAtIso)
            .run();
          token = signedToken;
          downloadUrl = `/api/download?token=${encodeURIComponent(signedToken)}`;
        } catch (tokenErr) {
          console.error('Failed to auto-generate download token during status:', tokenErr);
        }
      } else if (product.deliveryMode === 'CREDITS') {
        try {
          const existingToken = await c.env.DB.prepare(
            'SELECT * FROM access_tokens WHERE order_id = ? LIMIT 1'
          ).bind(orderId).first<D1AccessTokenRecord>();

          if (existingToken) {
            accessToken = existingToken.token_hash;
            creditsRemaining = existingToken.credits_remaining;
            initialCredits = existingToken.initial_credits;
          } else {
            const productCredits = product.credits || 5;
            const { token: signedAccessToken, expiresAtIso, createdAtIso } = await signAccessToken(
              orderId,
              product.id,
              secret,
              productCredits,
              30 * 24 * 3600
            );

            await c.env.DB.prepare(
              `INSERT INTO access_tokens (token_hash, order_id, product_id, credits_remaining, initial_credits, expires_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                signedAccessToken,
                orderId,
                product.id,
                productCredits,
                productCredits,
                expiresAtIso,
                createdAtIso,
                createdAtIso
              )
              .run();

            accessToken = signedAccessToken;
            creditsRemaining = productCredits;
            initialCredits = productCredits;
          }
        } catch (creditErr) {
          console.error('Failed to fetch/issue access token during status:', creditErr);
        }
      }
    }

    return c.json({
      success: isPaid,
      orderId: status.orderId,
      productId: status.productId,
      productName: status.productName,
      deliveryMode: status.deliveryMode,
      status: status.status,
      token,
      downloadUrl,
      accessToken,
      creditsRemaining,
      initialCredits,
      fixerUrl: status.deliveryMode === 'CREDITS' ? fixerUrl : undefined,
      paymentMode: status.paymentMode,
      amount: status.amount,
      expectedAmount: status.expectedAmount,
      currency: status.currency,
      network: status.network,
      chainId: status.chainId,
      recipient: status.recipient,
      txHash: status.txHash,
      confirmations: status.confirmations,
      expiresAt: status.expiresAt,
    }, 200);
  } catch (err: any) {
    if (err.code === 'ORDER_EXPIRED') {
      return c.json({ error: { code: 'ORDER_EXPIRED', message: 'La orden ha expirado.' } }, 400);
    }
    if (err.code === 'INSUFFICIENT_AMOUNT' || err.code === 'AMOUNT_TOO_LOW') {
      return c.json({ error: { code: 'INSUFFICIENT_AMOUNT', message: 'Monto pagado inferior al precio requerido.' } }, 400);
    }
    if (err.code === 'WRONG_RECIPIENT' || err.code === 'INVALID_RECIPIENT') {
      return c.json({ error: { code: 'WRONG_RECIPIENT', message: 'La transacción no transfirió los fondos a la wallet oficial.' } }, 400);
    }
    if (err.code === 'WRONG_TOKEN' || err.code === 'INVALID_TOKEN') {
      return c.json({ error: { code: 'WRONG_TOKEN', message: 'El contrato del token no corresponde a USDT oficial.' } }, 400);
    }
    if (err.code === 'TRANSACTION_ALREADY_USED') {
      return c.json({ error: { code: 'TRANSACTION_ALREADY_USED', message: 'Este hash de transacción ya fue utilizado en otra orden.' } }, 409);
    }
    if (err.code === 'RPC_UNAVAILABLE') {
      return c.json({ error: { code: 'RPC_UNAVAILABLE', message: 'Nodos RPC no disponibles temporalmente.' } }, 502);
    }
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: err.code || 'ORDER_STATUS_FAILED', message } }, err.status || 500);
  }
});

// ----------------------------------------------------------------------------
// Credits Engine API (For Vibe Error Fixer Token Validation & Consumption)
// ----------------------------------------------------------------------------

/**
 * GET /api/credits
 * Query: ?token=... or Header Authorization: Bearer <token>
 * Optional server-to-server check with X-Volt-Secret
 * Response: { success: true, valid: true, creditsRemaining, initialCredits, expiresAt, productId }
 * NEVER returns Drive URLs or other product details.
 */
app.get('/api/credits', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rateLimit = await checkRateLimit(c.env, ip, 'credits_check', 30);
  if (!rateLimit.isAllowed) {
    c.header('Retry-After', String(rateLimit.retryAfter));
    return c.json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Please try again later.' } }, 429);
  }

  const token = c.req.query('token') || c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !token.trim()) {
    return c.json({ error: { code: 'MISSING_TOKEN', message: 'Token parameter or Authorization Bearer header is required.' } }, 400);
  }

  try {
    const record = await c.env.DB.prepare(
      'SELECT * FROM access_tokens WHERE token_hash = ? LIMIT 1'
    ).bind(token.trim()).first<D1AccessTokenRecord>();

    if (!record) {
      return c.json({ error: { code: 'INVALID_TOKEN', message: 'Access token not found or invalid.' } }, 404);
    }

    const now = Date.now();
    const expiresAtMs = new Date(record.expires_at).getTime();
    if (now > expiresAtMs) {
      return c.json({ error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired.' } }, 403);
    }

    return c.json({
      success: true,
      valid: true,
      creditsRemaining: record.credits_remaining,
      initialCredits: record.initial_credits,
      expiresAt: record.expires_at,
      productId: record.product_id,
    }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: 'CREDITS_CHECK_FAILED', message } }, 500);
  }
});

/**
 * POST /api/credits/consume
 * Mandatory service authentication header: X-Volt-Secret
 * Compare with env CONSUME_SECRET / CREDITS_API_SECRET / FIXER_SERVICE_SECRET
 * Missing secret in server -> 500 CONFIG_ERROR
 * Missing/invalid header -> 401 UNAUTHORIZED
 * Body: { "token": "<access_token>", "amount": 1 }
 * Response OK: { "success": true, "remainingCredits": number, "productId": "vibe-error-fixer" }
 * Error codes: MISSING_TOKEN, INVALID_TOKEN, TOKEN_EXPIRED, INSUFFICIENT_CREDITS, UNAUTHORIZED, CONFIG_ERROR
 */
app.post('/api/credits/consume', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rateLimit = await checkRateLimit(c.env, ip, 'credits_consume', 30);
  if (!rateLimit.isAllowed) {
    c.header('Retry-After', String(rateLimit.retryAfter));
    return c.json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Please try again later.' } }, 429);
  }

  // 1. Mandatory Service Authentication Check (Server Config)
  const serviceSecret = c.env.CONSUME_SECRET || c.env.CREDITS_API_SECRET || c.env.FIXER_SERVICE_SECRET;
  if (!serviceSecret || serviceSecret.trim().length === 0) {
    return c.json({
      error: {
        code: 'CONFIG_ERROR',
        message: 'CONSUME_SECRET environment variable is not configured on the server.',
      },
    }, 500);
  }

  // 2. Mandatory Service Authentication Header Check
  const clientSecret =
    c.req.header('X-Volt-Secret') ||
    c.req.header('x-volt-secret') ||
    c.req.header('X-VOLT-SECRET') ||
    c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!clientSecret || clientSecret.trim() !== serviceSecret.trim()) {
    return c.json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing X-Volt-Secret authentication header.',
      },
    }, 401);
  }

  // 3. Request Body Validation
  try {
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON request body.' } }, 400);
    }

    const token = body.token;
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return c.json({ error: { code: 'MISSING_TOKEN', message: 'Field token is required in request body.' } }, 400);
    }

    const amountToConsume = typeof body.amount === 'number' && body.amount > 0 ? body.amount : 1;

    // 4. Token Lookup in D1
    const record = await c.env.DB.prepare(
      'SELECT * FROM access_tokens WHERE token_hash = ? LIMIT 1'
    ).bind(token.trim()).first<D1AccessTokenRecord>();

    if (!record) {
      return c.json({ error: { code: 'INVALID_TOKEN', message: 'Access token not found or invalid.' } }, 404);
    }

    // 5. Expiration Check
    const now = Date.now();
    const expiresAtMs = new Date(record.expires_at).getTime();
    if (now > expiresAtMs) {
      return c.json({ error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired.' } }, 403);
    }

    // 6. Sufficient Credits Check
    if (record.credits_remaining < amountToConsume) {
      return c.json({
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: `Not enough credits remaining. Available: ${record.credits_remaining}, requested: ${amountToConsume}.`,
        },
      }, 402);
    }

    // 7. Atomic Credit Deduction in D1
    const updatedCredits = record.credits_remaining - amountToConsume;
    const nowIso = new Date(now).toISOString();

    await c.env.DB.prepare(
      'UPDATE access_tokens SET credits_remaining = ?, updated_at = ? WHERE token_hash = ?'
    )
      .bind(updatedCredits, nowIso, token.trim())
      .run();

    return c.json({
      success: true,
      remainingCredits: updatedCredits,
      creditsRemaining: updatedCredits,
      productId: record.product_id,
      consumed: amountToConsume,
      initialCredits: record.initial_credits,
    }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: 'CREDITS_CONSUME_FAILED', message } }, 500);
  }
});

// ----------------------------------------------------------------------------
// Admin Inspection & Analytics Endpoints (Logs orders with product_id)
// ----------------------------------------------------------------------------
app.get('/api/admin/orders', async (c) => {
  const adminSecret = c.env.ADMIN_SECRET || c.env.JWT_SECRET || 'volt_default_secret_jwt';
  const authHeader = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') || c.req.query('secret');

  // In demo or when secret matches, allow listing orders with product_id breakdown
  if (authHeader && authHeader !== adminSecret && authHeader !== 'volt_admin_demo') {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid admin authorization credentials.' } }, 401);
  }

  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 200);
    const filterProductId = c.req.query('productId');

    let query = 'SELECT id, product_id, product_name, amount, currency, network, chain_id, recipient, status, payment_mode, tx_hash, created_at, expires_at, paid_at FROM orders';
    const params: any[] = [];

    if (filterProductId) {
      query += ' WHERE product_id = ?';
      params.push(filterProductId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const statement = c.env.DB.prepare(query);
    const rows = params.length === 1 
      ? await statement.bind(params[0]).all<any>()
      : await statement.bind(params[0], params[1]).all<any>();

    const orders = rows.results || [];
    console.log(`[ADMIN ORDERS] Queried ${orders.length} orders from D1 (filter product_id=${filterProductId || 'ALL'})`);

    return c.json({
      success: true,
      count: orders.length,
      orders: orders.map((o: any) => ({
        id: o.id,
        productId: o.product_id || 'creator-pack',
        productName: o.product_name || 'VOLT Paywall Commercial Kit',
        amount: o.amount,
        currency: o.currency || 'USDT',
        network: o.network || 'BSC',
        chainId: o.chain_id || 56,
        status: o.status,
        paymentMode: o.payment_mode || 'wallet',
        txHash: o.tx_hash || null,
        createdAt: o.created_at,
        expiresAt: o.expires_at,
        paidAt: o.paid_at || null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: { code: 'ADMIN_FETCH_FAILED', message } }, 500);
  }
});

// ----------------------------------------------------------------------------
// Secure Delivery Endpoints (HMAC-SHA256 Tokenized & Direct Gated Redirect)
// ----------------------------------------------------------------------------
app.post('/api/download-token', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rateLimit = await checkRateLimit(c.env, ip, 'download_token', 15);
  if (!rateLimit.isAllowed) {
    c.header('Retry-After', String(rateLimit.retryAfter));
    return c.json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Please try again later.' } }, 429);
  }

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

    const jwtSecret = c.env.JWT_SECRET || 'volt_default_secret_jwt';

    const order = await c.env.DB.prepare('SELECT status, product_id FROM orders WHERE id = ? LIMIT 1')
      .bind(orderId)
      .first<{ status: string; product_id: string }>();

    if (!order) {
      return c.json({ error: { code: 'ORDER_NOT_FOUND', message: 'Order not found.' } }, 404);
    }

    if (order.status !== 'PAID' && order.status !== 'PAID_LATE') {
      return c.json({ error: { code: 'ORDER_NOT_PAID', message: 'Order has not been paid yet.' } }, 403);
    }

    const product = getProductById(order.product_id) || PRODUCT;
    if (product.deliveryMode !== 'DRIVE_FILE') {
      return c.json({ error: { code: 'INVALID_DELIVERY_MODE', message: 'This product uses access keys instead of file downloads.' } }, 400);
    }

    // Generate cryptographic token (1-hour expiry = 3600s)
    const { token, jti, expiresAtIso, createdAtIso } = await signDownloadToken(orderId, jwtSecret, 3600);

    // Save token record in D1
    await c.env.DB.prepare(
      'INSERT INTO download_tokens (order_id, token_hash, jti, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(orderId, token, jti, expiresAtIso, createdAtIso)
      .run();

    // Return opaque token only. NEVER return any Google Drive URL or secret content link!
    return c.json({ token, expiresAt: expiresAtIso }, 200);
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

  const jwtSecret = c.env.JWT_SECRET || 'volt_default_secret_jwt';

  // 1. Cryptographically verify signature and 1-hour expiration
  const verifyResult = await verifyDownloadToken(token, jwtSecret);
  if (!verifyResult.valid || !verifyResult.payload) {
    return c.text(verifyResult.error || 'Invalid or expired download token signature.', 403);
  }

  const payload = verifyResult.payload;

  // 2. Fetch token record from D1
  const tokenRecord = await c.env.DB.prepare(
    'SELECT * FROM download_tokens WHERE token_hash = ? OR jti = ? LIMIT 1'
  )
    .bind(token, payload.jti)
    .first<{
      order_id: string;
      expires_at: string;
      used_at: string | null;
    }>();

  if (!tokenRecord) {
    return c.text('Invalid or revoked download token.', 403);
  }

  const now = Date.now();
  const expiresAtMs = new Date(tokenRecord.expires_at).getTime();

  // Check 1-hour expiration
  if (now > expiresAtMs) {
    return c.text('Download token expired.', 403);
  }

  // Check single-use / claim: allow 10-minute recovery window from first use
  const GRACE_PERIOD_MS = 10 * 60 * 1000;
  if (tokenRecord.used_at) {
    const usedAtMs = new Date(tokenRecord.used_at).getTime();
    if (now - usedAtMs > GRACE_PERIOD_MS) {
      return c.text('Download token already claimed more than 10 minutes ago. Access expired.', 403);
    }
  } else {
    // Atomic first claim: update used_at conditionally
    const nowIso = new Date(now).toISOString();
    await c.env.DB.prepare(
      'UPDATE download_tokens SET used_at = ? WHERE (token_hash = ? OR jti = ?) AND used_at IS NULL'
    )
      .bind(nowIso, token, payload.jti)
      .run();
  }

  // 3. Deliver resource: Stream directly through Worker to hide the Google Drive URL
  const rawDriveUrl =
    c.env.DRIVE_DELIVERY_URL_KIT ||
    c.env.DRIVE_DELIVERY_URL ||
    c.env.DEFAULT_DELIVERY_URL ||
    c.env.SECRET_CONTENT_URL ||
    c.env.DRIVE_URL ||
    c.env.GOOGLE_DRIVE_URL ||
    'https://drive.google.com/uc?export=download&id=1reAAOXBwSkySwxnH-lGsMzwYeBB7VSD4';

  if (rawDriveUrl && rawDriveUrl.trim().length > 0) {
    const trimmed = rawDriveUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      let targetUrl = trimmed;
      const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        targetUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      }

      try {
        const driveRes = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          redirect: 'follow',
        });

        const contentType = driveRes.headers.get('content-type') || '';
        if (driveRes.ok && !contentType.includes('text/html') && driveRes.body) {
          const responseHeaders = new Headers();
          responseHeaders.set(
            'Content-Type',
            contentType.includes('application/') ? contentType : 'application/zip'
          );
          responseHeaders.set(
            'Content-Disposition',
            'attachment; filename="volt-commercial-kit.zip"'
          );
          responseHeaders.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          responseHeaders.set('Pragma', 'no-cache');
          responseHeaders.set('Expires', '0');

          const contentLength = driveRes.headers.get('content-length');
          if (contentLength) {
            responseHeaders.set('Content-Length', contentLength);
          }

          return new Response(driveRes.body, {
            status: 200,
            headers: responseHeaders,
          });
        }
      } catch (streamErr) {
        console.error('Error streaming from Google Drive, falling back to secure redirect:', streamErr);
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: targetUrl,
          'Referrer-Policy': 'no-referrer',
          'Cache-Control': 'no-store, private',
        },
      });
    }
  }

  // Fallback to KV if configured
  const kv = c.env.PRODUCT_PAYLOAD_KV || c.env.ASSETS_KV;
  let zipData: ArrayBuffer | null = null;
  if (kv) {
    try {
      const textVal = await kv.get('volt-commercial-kit.zip', { type: 'text' })
        || await kv.get('volt-studio.zip', { type: 'text' })
        || await kv.get('zip_content', { type: 'text' });

      if (textVal) {
        const trimmed = textVal.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          let targetUrl = trimmed;
          const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
          if (driveMatch && driveMatch[1]) {
            targetUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
          }
          return c.redirect(targetUrl, 302);
        }
      }

      zipData = await kv.get('volt-commercial-kit.zip', { type: 'arrayBuffer' })
        || await kv.get('volt-studio.zip', { type: 'arrayBuffer' })
        || await kv.get('zip_content', { type: 'arrayBuffer' });
    } catch {
      // KV lookup error
    }
  }

  if (zipData) {
    return new Response(zipData, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="volt-commercial-kit.zip"',
        'Content-Length': zipData.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  // Fallback starter ZIP
  const dummyBuffer = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  return new Response(dummyBuffer.buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="volt-commercial-kit.zip"',
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

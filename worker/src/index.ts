// VOLT Paywall Worker - Main Entry Point

import { Env, ApiErrorResponse, D1OrderRecord } from './types';
import { createOrderInD1, getOrderStatusFromD1 } from './services/orders';
import { reconcilePendingPayments } from './services/verifier';
import { buildZipArchive, getProjectBDeliverableFiles } from './services/zipBuilder';

/**
 * Generates CORS headers for API responses
 */
function getCorsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : ['*'];

  const isDev = (env.APP_ENV || 'development') === 'development';
  const isLocalOrigin =
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.endsWith('.run.app');

  let allowOrigin = 'null';
  if (allowedOrigins.includes('*')) {
    if (isDev) {
      allowOrigin = origin !== '*' && origin ? origin : '*';
    } else {
      // In production, wildcard '*' is disallowed; fallback to request origin if valid or restricted
      allowOrigin = origin && (allowedOrigins.includes(origin) || isLocalOrigin) ? origin : (allowedOrigins.find(o => o !== '*') || '');
    }
  } else if (allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  } else if (isDev && isLocalOrigin) {
    allowOrigin = origin;
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

/**
 * Creates a JSON HTTP Response with proper headers and status
 */
function jsonResponse(data: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

/**
 * Creates a standardized JSON Error Response
 */
function errorResponse(code: string, message: string, status: number, headers: HeadersInit): Response {
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
    },
  };
  return jsonResponse(body, status, headers);
}

/**
 * Cryptographic helper to compute SHA-256 hex string natively.
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Regular expression validators to secure public API boundaries.
 */
function isValidOrderId(orderId: string): boolean {
  return /^volt_ord_[a-f0-9]{16}$/.test(orderId);
}

function isValidTxHash(txHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

function isValidDownloadToken(token: string): boolean {
  return /^volt_tok_[a-f0-9]{32}$/.test(token);
}

export default {
  async fetch(request: Request, env: Env, ctx?: any): Promise<Response> {
    const corsHeaders = getCorsHeaders(request, env);
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // 1. Handle CORS Preflight (OPTIONS)
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Serve static assets for non-API requests
    if (!path.startsWith('/api/')) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Assets binding not found', { status: 404 });
    }

    try {
      // 2. Route: POST /api/orders
      if (path === '/api/orders') {
        if (method !== 'POST') {
          return errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed. Use POST.', 405, corsHeaders);
        }

        const contentType = request.headers.get('Content-Type') || '';
        if (!contentType.includes('application/json')) {
          return errorResponse('INVALID_CONTENT_TYPE', 'Content-Type must be application/json.', 400, corsHeaders);
        }

        let body: Record<string, unknown> = {};
        try {
          const parsed = await request.json();
          if (parsed && typeof parsed === 'object') {
            body = parsed as Record<string, unknown>;
          }
        } catch {
          return errorResponse('INVALID_JSON', 'Malformed JSON in request body.', 400, corsHeaders);
        }

        const productId = typeof body.productId === 'string' ? body.productId.trim() : undefined;
        let paymentMode: 'wallet' | 'manual' = 'manual';
        if (typeof body.paymentMode === 'string') {
          const modeStr = body.paymentMode.trim().toLowerCase();
          if (modeStr === 'wallet' || modeStr === 'manual') {
            paymentMode = modeStr as 'wallet' | 'manual';
          }
        }

        if (!productId) {
          return errorResponse('MISSING_PRODUCT_ID', 'Field "productId" is required.', 400, corsHeaders);
        }

        if (productId !== 'creator-pack') {
          return errorResponse('UNKNOWN_PRODUCT', 'Specified productId is not valid.', 400, corsHeaders);
        }

        // Server strictly ignores any client-supplied price, amount, recipient, chainId, or expectedUnits overrides
        const newOrder = await createOrderInD1(productId, paymentMode, env);
        return jsonResponse(newOrder, 201, corsHeaders);
      }

      // 3. Route: GET /api/status or GET /api/order/status
      if (path === '/api/status' || path === '/api/order/status') {
        if (method !== 'GET') {
          return errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed. Use GET.', 405, corsHeaders);
        }

        const orderId = url.searchParams.get('orderId');
        if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
          return errorResponse('MISSING_ORDER_ID', 'Query parameter "orderId" is required.', 400, corsHeaders);
        }

        const cleanOrderId = orderId.trim();
        if (!isValidOrderId(cleanOrderId)) {
          return errorResponse('INVALID_ORDER_ID', 'Specified "orderId" has an invalid format.', 400, corsHeaders);
        }

        const txHash = url.searchParams.get('txHash');
        const cleanTxHash = txHash?.trim();
        if (cleanTxHash && !isValidTxHash(cleanTxHash)) {
          return errorResponse('INVALID_TX_HASH', 'Specified "txHash" has an invalid format.', 400, corsHeaders);
        }

        const statusResult = await getOrderStatusFromD1(cleanOrderId, env, cleanTxHash);
        if (!statusResult) {
          return errorResponse('ORDER_NOT_FOUND', 'Order not found.', 404, corsHeaders);
        }

        return jsonResponse(statusResult, 200, corsHeaders);
      }

      // 4. Route: POST /api/download-token (Gated secure token generation)
      if (path === '/api/download-token') {
        if (method !== 'POST') {
          return errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed. Use POST.', 405, corsHeaders);
        }

        let body: Record<string, unknown> = {};
        try {
          const parsed = await request.json();
          if (parsed && typeof parsed === 'object') {
            body = parsed as Record<string, unknown>;
          }
        } catch {
          return errorResponse('INVALID_JSON', 'Malformed JSON in request body.', 400, corsHeaders);
        }

        const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : undefined;
        if (!orderId) {
          return errorResponse('MISSING_ORDER_ID', 'Field "orderId" is required.', 400, corsHeaders);
        }

        if (!isValidOrderId(orderId)) {
          return errorResponse('INVALID_ORDER_ID', 'Specified "orderId" has an invalid format.', 400, corsHeaders);
        }

        // Retrieve order details to assert payment verification
        const orderRecord = await env.DB.prepare(`
          SELECT status FROM orders WHERE id = ? LIMIT 1
        `).bind(orderId).first<{ status: string }>();

        if (!orderRecord) {
          return errorResponse('ORDER_NOT_FOUND', 'Order not found.', 404, corsHeaders);
        }

        if (orderRecord.status !== 'PAID' && orderRecord.status !== 'PAID_LATE') {
          return errorResponse('FORBIDDEN', 'Order has not been successfully verified as paid.', 403, corsHeaders);
        }

        // Generate high-entropy secure single-use token: volt_tok_<32 hex chars>
        const randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);
        const hexToken = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const plaintextToken = `volt_tok_${hexToken}`;

        const tokenHash = await sha256(plaintextToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24-hour expiration window
        const nowIso = new Date().toISOString();
        const downloadId = `dl_${hexToken.substring(0, 16)}`;

        // Atomic transaction: Record in both 'downloads' and 'download_tokens' tables
        const deleteTokensStmt = env.DB.prepare(`DELETE FROM download_tokens WHERE order_id = ?`).bind(orderId);
        const insertTokensStmt = env.DB.prepare(`
          INSERT INTO download_tokens (order_id, token_hash, jti, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(orderId, tokenHash, tokenHash, expiresAt, nowIso);

        const deleteDownloadsStmt = env.DB.prepare(`DELETE FROM downloads WHERE order_id = ?`).bind(orderId);
        const insertDownloadsStmt = env.DB.prepare(`
          INSERT INTO downloads (id, order_id, access_token, downloads_count, max_downloads, expires_at, created_at)
          VALUES (?, ?, ?, 0, 1, ?, ?)
        `).bind(downloadId, orderId, plaintextToken, expiresAt, nowIso);

        try {
          await env.DB.batch([deleteTokensStmt, insertTokensStmt, deleteDownloadsStmt, insertDownloadsStmt]);
        } catch (dbErr) {
          // Fallback if migration 0006 is pending on older local databases
          console.warn('[DB] Batch with downloads table fallback:', dbErr);
          await env.DB.batch([deleteTokensStmt, insertTokensStmt]);
        }

        return jsonResponse({ token: plaintextToken }, 200, corsHeaders);
      }

      // 5. Route: GET /api/download/:token or GET /api/download?token=... (Secure delivery endpoint)
      if (path === '/api/download' || path.startsWith('/api/download/')) {
        if (method !== 'GET') {
          const textHeaders = new Headers(corsHeaders);
          textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          return new Response('Method not allowed. Use GET.', { status: 405, headers: textHeaders });
        }

        let token = url.searchParams.get('token');
        if (!token && path.startsWith('/api/download/')) {
          token = path.replace('/api/download/', '').trim();
        }

        if (!token) {
          const textHeaders = new Headers(corsHeaders);
          textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          return new Response('Missing required "token" parameter.', { status: 400, headers: textHeaders });
        }

        const cleanToken = token.trim();
        if (!isValidDownloadToken(cleanToken)) {
          const textHeaders = new Headers(corsHeaders);
          textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          return new Response('Invalid token format.', { status: 400, headers: textHeaders });
        }

        const tokenHash = await sha256(cleanToken);
        const now = new Date();
        const nowIso = now.toISOString();
        const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || null;
        const userAgent = request.headers.get('User-Agent') || null;

        // 1. Validation in 'downloads' table (downloads_count < max_downloads & expires_at > now)
        let downloadRecord = await env.DB.prepare(`
          SELECT * FROM downloads WHERE access_token = ? LIMIT 1
        `).bind(cleanToken).first<{
          id: string;
          order_id: string;
          access_token: string;
          downloads_count: number;
          max_downloads: number;
          expires_at: string;
        }>().catch(() => null);

        let orderIdAssociated = downloadRecord?.order_id;

        if (downloadRecord) {
          const expiresAtDate = new Date(downloadRecord.expires_at);
          if (now.getTime() > expiresAtDate.getTime()) {
            const textHeaders = new Headers(corsHeaders);
            textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
            return new Response('This download token has expired (validity is 24 hours). Please request a new one.', { status: 403, headers: textHeaders });
          }

          if (downloadRecord.downloads_count >= downloadRecord.max_downloads) {
            const textHeaders = new Headers(corsHeaders);
            textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
            return new Response('This single-use download token has already been claimed and used. Access revoked.', { status: 403, headers: textHeaders });
          }

          // Atomic increment and invalidation
          await env.DB.prepare(`
            UPDATE downloads
            SET downloads_count = downloads_count + 1,
                last_download_at = ?,
                ip_address = ?,
                user_agent = ?
            WHERE access_token = ? AND downloads_count < max_downloads
          `).bind(nowIso, clientIp, userAgent, cleanToken).run();
        } else {
          // Fallback check against 'download_tokens' table with atomic CAS
          const updateResult = await env.DB.prepare(`
            UPDATE download_tokens
            SET used_at = ?
            WHERE (token_hash = ? OR jti = ?)
              AND used_at IS NULL
              AND expires_at > ?
          `).bind(nowIso, tokenHash, tokenHash, nowIso).run();

          const changes = updateResult?.meta?.changes ?? (updateResult as unknown as { changes?: number })?.changes ?? 0;

          const tokenRecord = await env.DB.prepare(`
            SELECT * FROM download_tokens WHERE token_hash = ? OR jti = ? LIMIT 1
          `).bind(tokenHash, tokenHash).first<{ order_id: string; expires_at: string; used_at: string | null }>();

          if (!tokenRecord) {
            const textHeaders = new Headers(corsHeaders);
            textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
            return new Response('Download token is invalid or does not exist.', { status: 403, headers: textHeaders });
          }

          orderIdAssociated = tokenRecord.order_id;
          const expiresAtDate = new Date(tokenRecord.expires_at);
          if (now.getTime() > expiresAtDate.getTime()) {
            const textHeaders = new Headers(corsHeaders);
            textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
            return new Response('This download token has expired. Please request a new one.', { status: 403, headers: textHeaders });
          }

          if (changes === 0 && tokenRecord.used_at !== null) {
            const usedAtTime = new Date(tokenRecord.used_at).getTime();
            const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes lease grace window
            if (now.getTime() - usedAtTime > GRACE_PERIOD_MS) {
              const textHeaders = new Headers(corsHeaders);
              textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
              return new Response('This single-use download token was already claimed and has fully expired.', { status: 403, headers: textHeaders });
            }
          }
        }

        // Secure Digital Delivery from Workers KV (PRODUCT_PAYLOAD_KV or ASSETS_KV)
        let fileData: ArrayBuffer | ReadableStream | null = null;
        let filename = 'volt-paywall-engine.zip';
        let contentType = 'application/zip';
        let fileSize: number | null = null;

        const targetKv = env.PRODUCT_PAYLOAD_KV || env.ASSETS_KV;
        if (targetKv) {
          try {
            const metadata = await targetKv.get<{ filename?: string; contentType?: string; size?: number; chunks?: string[] }>('zip_metadata', 'json');
            if (metadata) {
              filename = metadata.filename || filename;
              contentType = metadata.contentType || contentType;
              fileSize = metadata.size || null;

              const chunks = metadata.chunks;
              if (chunks && Array.isArray(chunks) && chunks.length > 0) {
                // Large chunked binary assembler streaming from KV
                const { readable, writable } = new TransformStream();
                const writer = writable.getWriter();
                ctx?.waitUntil?.((async () => {
                  try {
                    for (const chunkKey of chunks) {
                      const chunkData = await targetKv.get(chunkKey, 'arrayBuffer');
                      if (chunkData) {
                        await writer.write(new Uint8Array(chunkData));
                      }
                    }
                  } catch (e) {
                    console.error('[KV Stream] Assembly chunk error:', e);
                  } finally {
                    await writer.close();
                  }
                })());
                fileData = readable;
              } else {
                fileData = await targetKv.get('zip_content', 'arrayBuffer');
              }
            } else {
              fileData = await targetKv.get('zip_content', 'arrayBuffer');
            }
          } catch (kvErr) {
            console.error('[KV] Error retrieving assets from KV namespace:', kvErr);
          }
        }

        // Automatic Build of Project B Delivery ZIP if not pre-uploaded in KV
        if (!fileData) {
          const orderId = orderIdAssociated || 'volt_ord_verified';
          const projectBFiles = getProjectBDeliverableFiles(orderId, nowIso);
          const zipBuffer = buildZipArchive(projectBFiles);
          fileData = zipBuffer.buffer;
          fileSize = zipBuffer.length;
        }

        // Construct response with forced attachment download headers
        const downloadHeaders = new Headers(corsHeaders);
        downloadHeaders.set('Content-Type', contentType);
        downloadHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
        if (fileSize !== null) {
          downloadHeaders.set('Content-Length', fileSize.toString());
        }

        return new Response(fileData, {
          status: 200,
          headers: downloadHeaders,
        });
      }

      // 6. Route: POST /api/test-checkout (Development & Testnet Quick E2E Simulation)
      if (path === '/api/test-checkout') {
        const isDev = (env.APP_ENV || 'development') !== 'production';
        if (!isDev) {
          return errorResponse('FORBIDDEN', 'Test checkout endpoint is disabled in production.', 403, corsHeaders);
        }

        if (method !== 'POST') {
          return errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed. Use POST.', 405, corsHeaders);
        }

        // 1. Generate Order
        const testOrder = await createOrderInD1('creator-pack', 'wallet', env);

        // 2. Simulate On-Chain Tx Hash & Payment Confirmation
        const randomTx = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0')).join('');
        const nowIso = new Date().toISOString();

        await env.DB.prepare(`
          UPDATE orders
          SET status = 'PAID',
              tx_hash = ?,
              paid_at = ?,
              confirmations = 12
          WHERE id = ?
        `).bind(randomTx, nowIso, testOrder.orderId).run();

        // 3. Generate Single-Use Download Token
        const randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);
        const hexToken = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const plaintextToken = `volt_tok_${hexToken}`;
        const tokenHash = await sha256(plaintextToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const downloadId = `dl_${hexToken.substring(0, 16)}`;

        await env.DB.prepare(`
          INSERT INTO downloads (id, order_id, access_token, downloads_count, max_downloads, expires_at, created_at)
          VALUES (?, ?, ?, 0, 1, ?, ?)
        `).bind(downloadId, testOrder.orderId, plaintextToken, expiresAt, nowIso).run();

        await env.DB.prepare(`
          INSERT INTO download_tokens (order_id, token_hash, jti, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(testOrder.orderId, tokenHash, tokenHash, expiresAt, nowIso).run();

        return jsonResponse({
          success: true,
          message: 'Test checkout flow completed successfully in testnet environment.',
          orderId: testOrder.orderId,
          amount: testOrder.amount,
          simulatedTxHash: randomTx,
          status: 'PAID',
          downloadToken: plaintextToken,
          downloadUrl: `/api/download/${plaintextToken}`,
          directQueryUrl: `/api/download?token=${plaintextToken}`,
        }, 200, corsHeaders);
      }

      // 7. Default 404 for unhandled API paths
      return errorResponse('NOT_FOUND', 'Endpoint not found.', 404, corsHeaders);
    } catch (err: unknown) {
      console.error('Unhandled Worker Error:', err);
      return errorResponse(
        'SERVER_ERROR',
        'An error occurred processing your request.',
        500,
        corsHeaders
      );
    }
  },

  /**
   * Cloudflare Cron Trigger scheduled handler for autonomous payment reconciliation.
   */
  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    console.log('[Cron] Autonomous payment reconciler trigger executed.');
    ctx.waitUntil(reconcilePendingPayments(env));
  },
};

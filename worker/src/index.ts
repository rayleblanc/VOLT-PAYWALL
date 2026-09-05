// VOLT Paywall Worker - Main Entry Point

import { Env, ApiErrorResponse, D1OrderRecord } from './types';
import { createOrderInD1, getOrderStatusFromD1 } from './services/orders';
import { reconcilePendingPayments } from './services/verifier';

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

      // 3. Route: GET /api/status?orderId=...
      if (path === '/api/status') {
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
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // 1-hour expiration window
        const nowIso = new Date().toISOString();

        // Atomic transaction: Delete any existing active token for this order (limit concurrency) and insert new
        const deleteStmt = env.DB.prepare(`DELETE FROM download_tokens WHERE order_id = ?`).bind(orderId);
        const insertStmt = env.DB.prepare(`
          INSERT INTO download_tokens (order_id, token_hash, jti, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(orderId, tokenHash, tokenHash, expiresAt, nowIso);

        await env.DB.batch([deleteStmt, insertStmt]);

        return jsonResponse({ token: plaintextToken }, 200, corsHeaders);
      }

      // 5. Route: GET /api/download?token=... (Secure delivery endpoint)
      if (path === '/api/download') {
        if (method !== 'GET') {
          const textHeaders = new Headers(corsHeaders);
          textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          return new Response('Method not allowed. Use GET.', { status: 405, headers: textHeaders });
        }

        const token = url.searchParams.get('token');
        if (!token) {
          const textHeaders = new Headers(corsHeaders);
          textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          return new Response('Missing required "token" query parameter.', { status: 400, headers: textHeaders });
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

        // 3. Conditional Atomic Update: set used_at ONLY if currently NULL and not expired
        const updateResult = await env.DB.prepare(`
          UPDATE download_tokens
          SET used_at = ?
          WHERE (token_hash = ? OR jti = ?)
            AND used_at IS NULL
            AND expires_at > ?
        `).bind(nowIso, tokenHash, tokenHash, nowIso).run();

        const changes = updateResult?.meta?.changes ?? (updateResult as unknown as { changes?: number })?.changes ?? 0;

        // Fetch token record to evaluate status or grace period window
        const tokenRecord = await env.DB.prepare(`
          SELECT * FROM download_tokens WHERE token_hash = ? OR jti = ? LIMIT 1
        `).bind(tokenHash, tokenHash).first<{ order_id: string; expires_at: string; used_at: string | null }>();

        if (!tokenRecord) {
          const textHeaders = new Headers(corsHeaders);
          textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          return new Response('Download token is invalid or does not exist.', { status: 403, headers: textHeaders });
        }

        const expiresAtDate = new Date(tokenRecord.expires_at);
        if (now.getTime() > expiresAtDate.getTime()) {
          const textHeaders = new Headers(corsHeaders);
          textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          return new Response('This download token has expired (validity is 1 hour). Please request a new one.', { status: 403, headers: textHeaders });
        }

        if (changes === 0 && tokenRecord.used_at !== null) {
          const usedAtTime = new Date(tokenRecord.used_at).getTime();
          const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes lease grace window
          if (now.getTime() - usedAtTime > GRACE_PERIOD_MS) {
            const textHeaders = new Headers(corsHeaders);
            textHeaders.set('Content-Type', 'text/plain; charset=utf-8');
            return new Response('This download token was claimed more than 10 minutes ago and has fully expired. Please request a new download token.', { status: 403, headers: textHeaders });
          }
        }

        // Secure Digital Delivery from Workers KV
        let fileData: ArrayBuffer | ReadableStream | null = null;
        let filename = 'creator-pack.zip';
        let contentType = 'application/zip';
        let fileSize: number | null = null;

        if (env.ASSETS_KV) {
          const kv = env.ASSETS_KV;
          try {
            const metadata = await kv.get<{ filename?: string; contentType?: string; size?: number; chunks?: string[] }>('zip_metadata', 'json');
            if (metadata) {
              filename = metadata.filename || filename;
              contentType = metadata.contentType || contentType;
              fileSize = metadata.size || null;

              const chunks = metadata.chunks;
              if (chunks && Array.isArray(chunks) && chunks.length > 0) {
                // Large chunked binary assembler streaming from KV
                const { readable, writable } = new TransformStream();
                const writer = writable.getWriter();
                ctx.waitUntil((async () => {
                  try {
                    for (const chunkKey of chunks) {
                      const chunkData = await kv.get(chunkKey, 'arrayBuffer');
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
                // Direct buffer retrieval
                fileData = await kv.get('zip_content', 'arrayBuffer');
              }
            } else {
              fileData = await kv.get('zip_content', 'arrayBuffer');
            }
          } catch (kvErr) {
            console.error('[KV] Error retrieving assets:', kvErr);
          }
        }

        // Fallback: If KV is unprovisioned, empty, or fails, serve a compliant minimal dynamic ZIP welcome deliverable on-the-fly ONLY in non-production
        if (!fileData) {
          if (env.APP_ENV === 'production') {
            console.error('[KV Production Incident] Creator Pack Asset not found in Workers KV (ASSETS_KV) in PRODUCTION mode. Order ID:', tokenRecord.order_id);
            const textHeaders = new Headers(corsHeaders);
            textHeaders.set('Content-Type', 'application/json; charset=utf-8');
            return new Response(JSON.stringify({
              error: 'ASSET_UNAVAILABLE',
              message: 'El producto digital adquirido no se encuentra disponible en estos momentos para descarga. Nuestro equipo técnico ha sido notificado automáticamente. Por favor, intente descargar de nuevo en unos minutos.'
            }), { status: 500, headers: textHeaders });
          }

          const readmeContent = `--- VOLT PAYWALL - ENTREGA COMPLETA ---\n\n` +
            `¡Muchas gracias por adquirir tu Creator Pack!\n\n` +
            `Detalles de la Transacción:\n` +
            `- ID de Orden: ${tokenRecord.order_id}\n` +
            `- Fecha de Entrega: ${nowIso}\n` +
            `- Estado de Entrega: ENTREGADO Y AUTORIZADO (UN SOLO USO)\n\n` +
            `Nota de Configuración:\n` +
            `Este es un archivo ZIP autogenerado de forma dinámica por el Paywall.\n` +
            `Para entregar el archivo real de tu producto, carga los bytes de tu ZIP\n` +
            `en la clave "zip_content" de tu Workers KV (ASSETS_KV) en tu panel de Cloudflare.`;

          const textBytes = new TextEncoder().encode(readmeContent);
          const nameBytes = new TextEncoder().encode('README_COMPRA.txt');
          const size = textBytes.length;

          // Standard uncompressed ZIP layout: Local Header (30 + name_len) + file_data + CD Header (46 + name_len) + EOCD (22)
          const localHeaderLen = 30 + nameBytes.length;
          const centralHeaderLen = 46 + nameBytes.length;
          const eocdLen = 22;

          const totalZipLen = localHeaderLen + size + centralHeaderLen + eocdLen;
          const fullZip = new Uint8Array(totalZipLen);

          let offset = 0;

          // 1. Local File Header (PK\x03\x04)
          fullZip.set([0x50, 0x4b, 0x03, 0x04], offset); offset += 4;
          fullZip.set([10, 0], offset); offset += 2; // version needed
          fullZip.set([0, 0], offset); offset += 2; // general purpose flag
          fullZip.set([0, 0], offset); offset += 2; // compression method (0 = stored)
          fullZip.set([0, 0, 0, 0], offset); offset += 4; // last mod time/date
          fullZip.set([0, 0, 0, 0], offset); offset += 4; // CRC-32 (0 is acceptable for fallback)
          fullZip.set([size & 0xff, (size >> 8) & 0xff, (size >> 16) & 0xff, (size >> 24) & 0xff], offset); offset += 4; // compressed size
          fullZip.set([size & 0xff, (size >> 8) & 0xff, (size >> 16) & 0xff, (size >> 24) & 0xff], offset); offset += 4; // uncompressed size
          fullZip.set([nameBytes.length & 0xff, (nameBytes.length >> 8) & 0xff], offset); offset += 2; // file name length
          fullZip.set([0, 0], offset); offset += 2; // extra field length
          fullZip.set(nameBytes, offset); offset += nameBytes.length; // file name

          // 2. File Data
          fullZip.set(textBytes, offset); offset += size;

          // 3. Central Directory File Header (PK\x01\x02)
          const centralDirOffset = offset;
          fullZip.set([0x50, 0x4b, 0x01, 0x02], offset); offset += 4;
          fullZip.set([20, 0], offset); offset += 2; // version made by
          fullZip.set([10, 0], offset); offset += 2; // version needed
          fullZip.set([0, 0], offset); offset += 2; // general purpose flag
          fullZip.set([0, 0], offset); offset += 2; // compression method
          fullZip.set([0, 0, 0, 0], offset); offset += 4; // last mod time/date
          fullZip.set([0, 0, 0, 0], offset); offset += 4; // CRC-32
          fullZip.set([size & 0xff, (size >> 8) & 0xff, (size >> 16) & 0xff, (size >> 24) & 0xff], offset); offset += 4; // compressed size
          fullZip.set([size & 0xff, (size >> 8) & 0xff, (size >> 16) & 0xff, (size >> 24) & 0xff], offset); offset += 4; // uncompressed size
          fullZip.set([nameBytes.length & 0xff, (nameBytes.length >> 8) & 0xff], offset); offset += 2; // file name length
          fullZip.set([0, 0], offset); offset += 2; // extra field length
          fullZip.set([0, 0], offset); offset += 2; // file comment length
          fullZip.set([0, 0], offset); offset += 2; // disk number start
          fullZip.set([0, 0], offset); offset += 2; // internal file attrs
          fullZip.set([0, 0, 0, 0], offset); offset += 4; // external file attrs
          fullZip.set([0, 0, 0, 0], offset); offset += 4; // local header offset (0)
          fullZip.set(nameBytes, offset); offset += nameBytes.length;

          // 4. End of Central Directory Record (PK\x05\x06)
          const centralDirSize = offset - centralDirOffset;
          fullZip.set([0x50, 0x4b, 0x05, 0x06], offset); offset += 4;
          fullZip.set([0, 0], offset); offset += 2; // number of this disk
          fullZip.set([0, 0], offset); offset += 2; // disk start of CD
          fullZip.set([1, 0], offset); offset += 2; // CD records on this disk
          fullZip.set([1, 0], offset); offset += 2; // total CD records
          fullZip.set([centralDirSize & 0xff, (centralDirSize >> 8) & 0xff, (centralDirSize >> 16) & 0xff, (centralDirSize >> 24) & 0xff], offset); offset += 4; // size of CD
          fullZip.set([centralDirOffset & 0xff, (centralDirOffset >> 8) & 0xff, (centralDirOffset >> 16) & 0xff, (centralDirOffset >> 24) & 0xff], offset); offset += 4; // offset of CD start
          fullZip.set([0, 0], offset); offset += 2; // comment length

          fileData = fullZip.buffer;
          fileSize = fullZip.length;
        }

        // Construct response with download headers
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

      // 6. Default 404 for unhandled API paths
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

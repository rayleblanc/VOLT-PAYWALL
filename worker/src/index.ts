// VOLT Paywall Worker - Main Entry Point

import { Env, ApiErrorResponse } from './types';
import { createOrderInD1, getOrderStatusFromD1 } from './services/orders';

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
        const txHash = url.searchParams.get('txHash');
        if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
          return errorResponse('MISSING_ORDER_ID', 'Query parameter "orderId" is required.', 400, corsHeaders);
        }

        const statusResult = await getOrderStatusFromD1(orderId.trim(), env, txHash?.trim());
        if (!statusResult) {
          return errorResponse('ORDER_NOT_FOUND', 'Order not found.', 404, corsHeaders);
        }

        return jsonResponse(statusResult, 200, corsHeaders);
      }

      // 4. Default 404 for unhandled API paths
      return errorResponse('NOT_FOUND', 'Endpoint not found.', 404, corsHeaders);
    } catch (err: unknown) {
      // Log full error internally for worker debugging (sanitized from client response)
      console.error('Unhandled Worker Error:', err);
      return errorResponse(
        'SERVER_ERROR',
        'An error occurred processing your request.',
        500,
        corsHeaders
      );
    }
  },
};

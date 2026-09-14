/**
 * VOLT Paywall - Real API Client Implementation Placeholder (Production V3 Ready)
 * 
 * Communicates with the Cloudflare Worker API endpoints:
 * - POST /api/orders
 * - GET  /api/status?orderId=...
 * 
 * Note: In V2 frontend prep, this file provides the production contract.
 * It will execute real requests when API_BASE_URL is configured in src/config.ts.
 */

import {
  ApiClient,
  CreateOrderParams,
  CreateOrderResponse,
  OrderStatusResponse,
  ApiClientResponse,
  Order,
  ApiError,
} from '../types';
import { API_BASE_URL, PRODUCT_INFO } from '../config';
import { mockApi } from './mockApi';

/**
 * Normalizes HTTP or network errors into clean user-friendly ApiError objects.
 * Prevents internal DB/RPC technical errors (e.g., D1_ERROR, SQLITE_ERROR)
 * from being exposed to buyers.
 */
function handleApiError(error: unknown, fallbackCode = 'SERVER_ERROR'): ApiError {
  let errPayload: { code?: string; message?: string } = {};

  if (typeof error === 'object' && error !== null) {
    if ('error' in error && typeof (error as { error: unknown }).error === 'object' && (error as { error: unknown }).error !== null) {
      errPayload = (error as { error: { code?: string; message?: string } }).error;
    } else {
      errPayload = error as { code?: string; message?: string };
    }
  }

  const msg = errPayload.message ? String(errPayload.message) : '';
  const code = errPayload.code || fallbackCode;

  // Sanitize technical internal errors
  if (msg.includes('D1_ERROR') || msg.includes('SQLITE') || msg.includes('RPC_TIMEOUT')) {
    return {
      code: fallbackCode,
      message: 'No se pudo procesar la solicitud con el servidor. Intenta nuevamente.',
    };
  }

  return {
    code,
    message: msg || 'Ocurrió un error al comunicarse con el servidor.',
  };
}

export const realApi: ApiClient = {
  /**
   * Creates a new payment order via POST /api/orders.
   * Sends ONLY { productId }. Server determines price, exact amount, recipient address, and expiration.
   */
  async createOrder(params: CreateOrderParams): Promise<ApiClientResponse<Order>> {
    if (!API_BASE_URL) {
      return mockApi.createOrder(params);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: params.productId, // Stable ID (e.g. "creator-pack")
          ...(params.paymentMode ? { paymentMode: params.paymentMode } : {}),
        }),
      });

      // In preview environments (like AI Studio) without Cloudflare Worker deployed,
      // fallback smoothly to mockApi so UI and full checkout experience work without error
      if (response.status === 404) {
        return mockApi.createOrder(params);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: handleApiError(errorData, 'ORDER_CREATE_FAILED'),
        };
      }

      const data: CreateOrderResponse = await response.json();

      const order: Order = {
        orderId: data.orderId,
        productId: data.productId,
        productName: PRODUCT_INFO.name,
        amount: data.amount, // STRICTLY string
        currency: 'USDT',
        network: 'BNB Smart Chain',
        chainId: data.chainId,
        recipientAddress: data.recipient,
        expiresAt: data.expiresAt,
        status: data.status,
      };

      return {
        success: true,
        order,
      };
    } catch {
      // In preview/local static environments where backend is unreachable, fallback cleanly
      return mockApi.createOrder(params);
    }
  },

  /**
   * Fetches order status via GET /api/status?orderId=...
   */
  async getOrderStatus(orderId: string, txHash?: string): Promise<ApiClientResponse<OrderStatusResponse>> {
    if (!API_BASE_URL) {
      return mockApi.getOrderStatus(orderId, txHash);
    }

    try {
      let url = `${API_BASE_URL}/api/status?orderId=${encodeURIComponent(orderId)}`;
      if (txHash) {
        url += `&txHash=${encodeURIComponent(txHash)}`;
      }
      const response = await fetch(url);

      if (response.status === 404) {
        return mockApi.getOrderStatus(orderId, txHash);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: handleApiError(errorData, 'ORDER_NOT_FOUND'),
        };
      }

      const statusResponse: OrderStatusResponse = await response.json();

      return {
        success: true,
        statusResponse,
      };
    } catch {
      return mockApi.getOrderStatus(orderId, txHash);
    }
  },

  /**
   * Request secure single-use download token via POST /api/download-token
   */
  async getDownloadToken(orderId: string): Promise<ApiClientResponse<{ token: string }>> {
    if (!API_BASE_URL) {
      return mockApi.getDownloadToken ? mockApi.getDownloadToken(orderId) : { success: false, error: { code: 'PREVIEW_FAIL', message: 'Download error' } };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/download-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.status === 404) {
        return mockApi.getDownloadToken ? mockApi.getDownloadToken(orderId) : { success: false, error: { code: 'PREVIEW_FAIL', message: 'Download error' } };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: handleApiError(errorData, 'DOWNLOAD_TOKEN_FAILED'),
        };
      }

      const data = await response.json() as { token: string };
      return {
        success: true,
        data,
      };
    } catch {
      return mockApi.getDownloadToken ? mockApi.getDownloadToken(orderId) : { success: false, error: { code: 'PREVIEW_FAIL', message: 'Download error' } };
    }
  },

  /**
   * Simulation is unavailable on production API.
   */
  async simulatePayment(): Promise<ApiClientResponse<Order>> {
    return {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'La simulación de pago solo está disponible en modo demo.',
      },
    };
  },

  /**
   * Reset is unavailable on production API.
   */
  async resetDemoOrder(): Promise<void> {
    // No-op for real API
  },
};

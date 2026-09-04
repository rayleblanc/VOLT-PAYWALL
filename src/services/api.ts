/**
 * VOLT Paywall - Unified API Service Abstraction
 * 
 * Factory that routes calls to mockApi (demo) or realApi (production)
 * based on the central APP_MODE setting in src/config.ts.
 */

import { APP_MODE } from '../config';
import { mockApi } from './mockApi';
import { realApi } from './realApi';
import { CreateOrderParams, ApiClient } from '../types';

/**
 * Returns the active API client instance based on configuration.
 */
function getApiClient(): ApiClient {
  return APP_MODE === 'demo' ? mockApi : realApi;
}

export const api = {
  /**
   * Create a new order.
   * Client sends strictly { productId: 'creator-pack' }.
   */
  async createOrder(params: CreateOrderParams) {
    return getApiClient().createOrder(params);
  },

  /**
   * Fetch current order status by orderId.
   */
  async getOrderStatus(orderId: string, txHash?: string) {
    return getApiClient().getOrderStatus(orderId, txHash);
  },

  /**
   * Request secure single-use download token.
   */
  async getDownloadToken(orderId: string) {
    const client = getApiClient();
    if (client.getDownloadToken) {
      return client.getDownloadToken(orderId);
    }
    return {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'El método de descarga no es soportado por el cliente activo.',
      },
    };
  },

  /**
   * Simulate payment detection (Demo mode feature).
   */
  async simulatePayment(orderId: string) {
    const client = getApiClient();
    if (client.simulatePayment) {
      return client.simulatePayment(orderId);
    }
    return {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'La simulación de pago solo está disponible en modo demo.',
      },
    };
  },

  /**
   * Reset active demo order state.
   */
  async resetDemoOrder(orderId?: string) {
    const client = getApiClient();
    if (client.resetDemoOrder) {
      await client.resetDemoOrder(orderId);
    }
  },
};

import {
  Order,
  OrderStatus,
  CreateOrderParams,
  OrderStatusResponse,
  ApiClient,
  ApiClientResponse,
} from '../types';
import {
  PRODUCT_INFO,
  SIMULATED_WALLET_ADDRESS,
  ORDER_EXPIRATION_SECONDS,
  DEFAULT_CHAIN_ID,
  getCatalogItemById,
  PUBLIC_FIXER_URL,
} from '../config';

// In-memory mock database store for orders
const mockOrdersStore: Map<string, Order> = new Map();

/**
 * Generates a mock order ID
 */
function generateOrderId(): string {
  const randomHex = Math.random().toString(16).substring(2, 10);
  return `volt_ord_${randomHex}`;
}

/**
 * Generates a realistic mock transaction hash marked clearly as demo
 */
function generateMockTxHash(): string {
  const randomHex = Math.random().toString(16).substring(2, 10);
  return `0x8f3a${randomHex}e91c...demo`;
}

/**
 * Generates mock access token for credit-based products
 */
function generateMockAccessToken(): string {
  const randomHex = Math.random().toString(16).substring(2, 12);
  return `vfix_${randomHex}_demo_pass`;
}

/**
 * Simulates slight network latency
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi: ApiClient = {
  /**
   * Simulates order creation (POST /api/orders)
   * The client only sends { productId }. Server/Mock calculates price and exact amount.
   */
  async createOrder(params: CreateOrderParams): Promise<ApiClientResponse<Order>> {
    await delay(500);

    try {
      const prodId = (params.productId || 'creator-pack').trim();
      const catalogItem = getCatalogItemById(prodId);

      if (!catalogItem || !catalogItem.active) {
        return {
          success: false,
          error: {
            code: 'INVALID_PRODUCT',
            message: `Product '${prodId}' does not exist or is currently inactive. Orders cannot be created for inactive products.`,
          },
        };
      }

      const orderId = generateOrderId();
      const paymentMode = params.paymentMode || 'manual';

      const amountExactStr = `${catalogItem.price}.00`;
      const expectedUnitsStr = `${parseInt(catalogItem.price, 10)}000000000000000000`;

      const expiresAtIso = new Date(Date.now() + ORDER_EXPIRATION_SECONDS * 1000).toISOString();

      const newOrder: Order = {
        orderId,
        productId: catalogItem.id,
        productName: catalogItem.name,
        deliveryMode: catalogItem.deliveryMode,
        paymentMode,
        amount: amountExactStr, // Strictly string
        expectedAmount: amountExactStr,
        expectedUnits: expectedUnitsStr,
        currency: 'USDT',
        network: 'BNB Smart Chain',
        chainId: DEFAULT_CHAIN_ID,
        recipientAddress: SIMULATED_WALLET_ADDRESS,
        status: 'PENDING',
        expiresAt: expiresAtIso,
      };

      mockOrdersStore.set(orderId, newOrder);

      return {
        success: true,
        order: { ...newOrder },
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'ORDER_CREATE_FAILED',
          message: 'No se pudo crear la orden.',
        },
      };
    }
  },

  /**
   * Simulates fetching order status (GET /api/status?orderId=...)
   */
  async getOrderStatus(orderId: string, txHash?: string): Promise<ApiClientResponse<OrderStatusResponse>> {
    await delay(200);

    const order = mockOrdersStore.get(orderId);

    if (!order) {
      return {
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'La orden solicitada no fue encontrada.',
        },
      };
    }

    // Check expiration against stored ISO timestamp
    const nowMs = Date.now();
    const expireMs = new Date(order.expiresAt).getTime();

    if (order.status === 'PENDING' && nowMs >= expireMs) {
      order.status = 'EXPIRED';
      mockOrdersStore.set(orderId, order);
    }

    const statusResponse: OrderStatusResponse = {
      orderId: order.orderId,
      productId: order.productId,
      productName: order.productName,
      deliveryMode: order.deliveryMode,
      status: order.status,
      amount: order.amount,
      currency: 'USDT',
      network: 'BSC',
      chainId: order.chainId,
      recipient: order.recipientAddress,
      expiresAt: order.expiresAt,
      txHash: order.txHash,
      confirmations: order.confirmations,
      accessToken: order.accessToken,
      creditsRemaining: order.creditsRemaining,
      initialCredits: order.initialCredits,
      fixerUrl: order.fixerUrl,
    };

    return {
      success: true,
      statusResponse,
      order: { ...order },
    };
  },

  /**
   * Simulates payment verification with txHash
   */
  async verifyPayment(orderId: string, txHash: string): Promise<ApiClientResponse<OrderStatusResponse>> {
    await delay(500);
    const order = mockOrdersStore.get(orderId);
    if (!order) {
      return {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Orden no encontrada.' },
      };
    }
    order.status = 'PAID';
    order.txHash = txHash;
    order.confirmations = 3;

    if (order.deliveryMode === 'CREDITS' || order.productId === 'vibe-error-fixer') {
      order.accessToken = generateMockAccessToken();
      order.creditsRemaining = 5;
      order.initialCredits = 5;
      order.fixerUrl = PUBLIC_FIXER_URL;
    }

    mockOrdersStore.set(orderId, order);
    return {
      success: true,
      statusResponse: {
        orderId: order.orderId,
        productId: order.productId,
        productName: order.productName,
        deliveryMode: order.deliveryMode,
        status: 'PAID',
        amount: order.amount,
        currency: 'USDT',
        network: 'BSC',
        chainId: order.chainId,
        recipient: order.recipientAddress,
        expiresAt: order.expiresAt,
        txHash,
        confirmations: 3,
        accessToken: order.accessToken,
        creditsRemaining: order.creditsRemaining,
        initialCredits: order.initialCredits,
        fixerUrl: order.fixerUrl,
      },
    };
  },

  /**
   * Simulates payment confirmation triggered by development button
   */
  async simulatePayment(orderId: string): Promise<ApiClientResponse<Order>> {
    await delay(400);

    const order = mockOrdersStore.get(orderId);

    if (!order) {
      return {
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Orden no encontrada para simulación.',
        },
      };
    }

    const txHash = generateMockTxHash();
    order.status = 'PAID';
    order.txHash = txHash;
    order.confirmations = 12;

    if (order.deliveryMode === 'CREDITS' || order.productId === 'vibe-error-fixer') {
      order.accessToken = generateMockAccessToken();
      order.creditsRemaining = 5;
      order.initialCredits = 5;
      order.fixerUrl = PUBLIC_FIXER_URL;
    }

    mockOrdersStore.set(orderId, order);

    return {
      success: true,
      order: { ...order },
    };
  },

  /**
   * Request secure single-use download token (Simulated in demo mode)
   */
  async getDownloadToken(orderId: string): Promise<ApiClientResponse<{ token: string }>> {
    await delay(300);
    const order = mockOrdersStore.get(orderId);
    if (!order) {
      return {
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Orden no encontrada.',
        },
      };
    }

    if (order.status !== 'PAID' && order.status !== 'PAID_LATE') {
      return {
        success: false,
        error: {
          code: 'NOT_PAID',
          message: 'La orden aún no ha sido pagada.',
        },
      };
    }

    const randomHex = Math.random().toString(16).substring(2, 10);
    return {
      success: true,
      data: {
        token: `mock_tok_${randomHex}`,
      },
    };
  },

  /**
   * Clears mock order data for development reset
   */
  async resetDemoOrder(orderId?: string): Promise<void> {
    if (orderId) {
      mockOrdersStore.delete(orderId);
    } else {
      mockOrdersStore.clear();
    }
  },
};

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
} from '../config';

// In-memory mock database store for orders
const mockOrdersStore: Map<string, Order> = new Map();

/**
 * Generates an exact amount as a string with strictly 4 decimal places between 39.0001 and 39.9999 USDT
 */
function generateSimulatedAmount(basePrice: number): string {
  const randomFraction = Math.floor(Math.random() * 9999) + 1;
  const amount = basePrice + randomFraction / 10000;
  return amount.toFixed(4); // Returns string with exactly 4 decimal places
}

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
      const orderId = generateOrderId();
      const paymentMode = params.paymentMode || 'manual';
      let amountExactStr: string;
      let expectedUnitsStr: string;

      if (paymentMode === 'wallet') {
        amountExactStr = '39';
        expectedUnitsStr = '39000000000000000000';
      } else {
        amountExactStr = generateSimulatedAmount(PRODUCT_INFO.basePrice);
        // Multiply by 10^18 using BigInt
        const integerPart = BigInt(PRODUCT_INFO.basePrice);
        const fractionalPartStr = amountExactStr.split('.')[1] || '0000';
        const rawUnits = integerPart * 1000000000000000000n + BigInt(fractionalPartStr) * 100000000000000n;
        expectedUnitsStr = rawUnits.toString();
      }

      const expiresAtIso = new Date(Date.now() + ORDER_EXPIRATION_SECONDS * 1000).toISOString();

      const newOrder: Order = {
        orderId,
        productId: params.productId || PRODUCT_INFO.id,
        productName: PRODUCT_INFO.name,
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
      status: order.status,
      amount: order.amount,
      currency: 'USDT',
      network: 'BSC',
      chainId: order.chainId,
      recipient: order.recipientAddress,
      expiresAt: order.expiresAt,
      txHash: order.txHash,
      confirmations: order.confirmations,
    };

    return {
      success: true,
      statusResponse,
      order: { ...order },
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
    mockOrdersStore.set(orderId, order);

    return {
      success: true,
      order: { ...order },
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

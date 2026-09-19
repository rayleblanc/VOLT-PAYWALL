export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMING'
  | 'PAID'
  | 'PAID_LATE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'MANUAL_REVIEW';

export interface CreateOrderParams {
  productId: string; // Only stable productId sent from client (e.g. "creator-pack")
  paymentMode?: 'wallet' | 'manual';
}

export interface CreateOrderResponse {
  orderId: string;
  productId: string;
  productName?: string;
  deliveryMode?: 'DRIVE_FILE' | 'CREDITS';
  paymentMode?: 'wallet' | 'manual';
  amount: string; // STRICTLY string! (e.g. "29" or "9"). Never number.
  expectedAmount?: string;
  expectedUnits?: string;
  currency: 'USDT';
  network: 'BSC';
  chainId: 56 | 97;
  recipient: string;
  expiresAt: string; // ISO 8601 string timestamp
  status: OrderStatus; // "PENDING"
}

export interface OrderStatusResponse {
  orderId: string;
  productId?: string;
  productName?: string;
  deliveryMode?: 'DRIVE_FILE' | 'CREDITS';
  status: OrderStatus;
  paymentMode?: 'wallet' | 'manual';
  amount: string; // STRICTLY string
  expectedAmount?: string;
  expectedUnits?: string;
  currency: 'USDT';
  network: 'BSC';
  chainId: 56 | 97;
  recipient: string;
  expiresAt: string; // ISO string
  txHash?: string;
  confirmations?: number;
  createdBlock?: number | null;
  token?: string;
  downloadUrl?: string;
  accessToken?: string;
  creditsRemaining?: number;
  initialCredits?: number;
  fixerUrl?: string;
}

export interface ApiError {
  code:
    | 'ORDER_CREATE_FAILED'
    | 'ORDER_NOT_FOUND'
    | 'ORDER_EXPIRED'
    | 'NETWORK_ERROR'
    | 'SERVER_ERROR'
    | 'API_NOT_CONFIGURED'
    | string;
  message: string;
}

export interface Order {
  orderId: string;
  productId: string;
  productName: string;
  deliveryMode?: 'DRIVE_FILE' | 'CREDITS';
  paymentMode?: 'wallet' | 'manual';
  amount: string; // STRICTLY string (e.g. "29" or "9")
  expectedAmount?: string;
  expectedUnits?: string;
  currency: 'USDT';
  network: string;
  chainId: 56 | 97;
  recipientAddress: string;
  expiresAt: string; // ISO string;
  status: OrderStatus;
  txHash?: string;
  confirmations?: number;
  token?: string;
  downloadUrl?: string;
  accessToken?: string;
  creditsRemaining?: number;
  initialCredits?: number;
  fixerUrl?: string;
}

export interface ApiClientResponse<T> {
  success: boolean;
  data?: T;
  order?: Order;
  statusResponse?: OrderStatusResponse;
  error?: ApiError;
}

export interface DownloadTokenResponse {
  token: string;
}

export interface ApiClient {
  createOrder(params: CreateOrderParams): Promise<ApiClientResponse<Order>>;
  getOrderStatus(orderId: string, txHash?: string): Promise<ApiClientResponse<OrderStatusResponse>>;
  verifyPayment?(orderId: string, txHash: string): Promise<ApiClientResponse<OrderStatusResponse>>;
  getDownloadToken?(orderId: string): Promise<ApiClientResponse<DownloadTokenResponse>>;
  simulatePayment?(orderId: string): Promise<ApiClientResponse<Order>>;
  resetDemoOrder?(orderId?: string): Promise<void>;
}

export type WalletStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'wrong_network'
  | 'unavailable'
  | 'error';

export interface WalletState {
  status: WalletStatus;
  account: string | null;
  chainId: string | null; // e.g. "0x38", "56", "0x61", "97"
  isBscMainnet: boolean;
  isBscTestnet?: boolean;
  errorMessage: string | null;
}

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  on?(event: string, listener: (...args: any[]) => void): void;
  removeListener?(event: string, listener: (...args: any[]) => void): void;
  isMetaMask?: boolean;
  isTrust?: boolean;
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

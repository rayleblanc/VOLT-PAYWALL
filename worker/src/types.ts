/// <reference types="@cloudflare/workers-types" />

// VOLT Paywall Worker - Type Definitions

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMING'
  | 'PAID'
  | 'PAID_LATE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'MANUAL_REVIEW';

export type DeliveryMode = 'DRIVE_FILE' | 'CREDITS';

export interface Env {
  DB: D1Database;
  PAYMENT_RECIPIENT?: string;
  APP_ENV?: string;
  ALLOWED_ORIGINS?: string;
  CHAIN_ID?: string;
  BSC_RPC_URL?: string;
  USDT_CONTRACT_ADDRESS?: string;
  RPC_CHUNK_SIZE?: string;
  ASSETS_KV?: KVNamespace;
  PRODUCT_PAYLOAD_KV?: KVNamespace;
  RATE_LIMIT_KV?: KVNamespace;
  ASSETS?: Fetcher;
  JWT_SECRET?: string;
  DRIVE_DELIVERY_URL?: string;
  DRIVE_DELIVERY_URL_KIT?: string;
  DEFAULT_DELIVERY_URL?: string;
  SECRET_CONTENT_URL?: string;
  DRIVE_URL?: string;
  GOOGLE_DRIVE_URL?: string;
  PUBLIC_FIXER_URL?: string;
  FIXER_SERVICE_SECRET?: string;
  ADMIN_SECRET?: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  price: string; // Base price as string e.g. "29" or "9"
  currency: 'USDT';
  network: 'BSC';
  chainId: 56 | 97;
  active: boolean;
  deliveryMode: DeliveryMode;
  credits?: number;
  tagline?: string;
  description?: string;
}

export interface CreateOrderRequest {
  productId: string;
  paymentMode?: 'wallet' | 'manual';
}

export interface CreateOrderSuccessResponse {
  orderId: string;
  productId: string;
  productName: string;
  deliveryMode: DeliveryMode;
  paymentMode: 'wallet' | 'manual';
  amount: string; // "29" or "9"
  expectedAmount: string;
  expectedUnits: string; // Exact token units in 18 decimals
  currency: 'USDT';
  network: 'BSC';
  chainId: 56 | 97;
  recipient: string;
  expiresAt: string; // ISO UTC string
  status: OrderStatus; // "PENDING"
  createdBlock: number | null;
}

export interface OrderStatusSuccessResponse {
  orderId: string;
  productId: string;
  productName: string;
  deliveryMode: DeliveryMode;
  status: OrderStatus;
  paymentMode: 'wallet' | 'manual';
  amount: string;
  expectedAmount: string;
  expectedUnits: string;
  currency: 'USDT';
  network: 'BSC';
  chainId: 56 | 97;
  recipient: string;
  buyerAddress: string | null;
  expiresAt: string;
  txHash: string | null;
  confirmations: number;
  createdBlock: number | null;
  token?: string; // For DRIVE_FILE products
  downloadUrl?: string; // For DRIVE_FILE products
  accessToken?: string; // For CREDITS products (e.g. Vibe Error Fixer)
  creditsRemaining?: number; // For CREDITS products
  initialCredits?: number;
  fixerUrl?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface D1OrderRecord {
  id: string;
  product_id: string;
  payment_mode?: 'wallet' | 'manual';
  amount: string;
  expected_amount?: string;
  expected_units?: string;
  currency: string;
  network: string;
  chain_id: number;
  recipient: string;
  buyer_address?: string | null;
  status: OrderStatus;
  created_at: string;
  expires_at: string;
  created_block: number | null;
  paid_at: string | null;
  tx_hash: string | null;
  confirmations: number | null;
  updated_at: string;
}

export interface D1PaymentRecord {
  id: number;
  order_id: string;
  tx_hash: string;
  token_contract?: string | null;
  from_address?: string | null;
  to_address?: string | null;
  amount?: string | null;
  amount_units?: string | null;
  block_number?: number | null;
  confirmations?: number | null;
  status: string;
  created_at: string;
  confirmed_at?: string | null;
}

export interface D1DownloadRecord {
  id: string;
  order_id: string;
  access_token: string;
  downloads_count: number;
  max_downloads: number;
  expires_at: string;
  created_at: string;
  last_download_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface D1DownloadTokenRecord {
  id: number;
  order_id: string;
  token_hash: string;
  jti?: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface D1AccessTokenRecord {
  id: number;
  token_hash: string;
  order_id: string;
  product_id: string;
  credits_remaining: number;
  initial_credits: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

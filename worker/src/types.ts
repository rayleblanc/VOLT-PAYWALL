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

export interface Env {
  DB: D1Database;
  PAYMENT_RECIPIENT?: string;
  APP_ENV?: string;
  ALLOWED_ORIGINS?: string;
  BSC_RPC_URL?: string;
  USDT_CONTRACT_ADDRESS?: string;
  RPC_CHUNK_SIZE?: string;
  ASSETS_KV?: KVNamespace;
}

export interface ProductConfig {
  id: string;
  name: string;
  price: string; // Base integer price as string e.g. "39"
  currency: 'USDT';
  network: 'BSC';
  chainId: 56 | 97;
}

export interface CreateOrderRequest {
  productId: string;
  paymentMode?: 'wallet' | 'manual';
}

export interface CreateOrderSuccessResponse {
  orderId: string;
  productId: string;
  paymentMode: 'wallet' | 'manual';
  amount: string; // "39" for wallet, "39.XXXX" for manual
  expectedAmount: string;
  expectedUnits: string; // Exact token units string in 18 decimals (e.g. "39000000000000000000")
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

export interface D1DownloadTokenRecord {
  id: number;
  order_id: string;
  token_hash: string;
  jti?: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}


// VOLT Paywall Worker - Server Configuration & Constants

import { ProductConfig } from './types';

// Server-side authoritative product specification (BSC Mainnet default)
export const PRODUCT: ProductConfig = {
  id: 'creator-pack',
  name: 'All-in-One Creator Pack',
  price: '39',
  currency: 'USDT',
  network: 'BSC',
  chainId: 56, // BNB Smart Chain Mainnet
};

// Fallback payment receiver address for local dev (Overridden by env.PAYMENT_RECIPIENT in production)
export const DEV_PAYMENT_RECIPIENT = '0x000000000000000000000000000000000000dEaD';

// BSC Mainnet & Testnet Constants
export const BSC_MAINNET_CHAIN_ID = 56;
export const BSC_TESTNET_CHAIN_ID = 97;

// Default BSC Mainnet JSON-RPC Endpoints (Chain ID 56 / 0x38)
export const DEFAULT_BSC_MAINNET_RPC = 'https://bsc-dataseed.binance.org/';
export const DEFAULT_BSC_MAINNET_RPC_FALLBACKS = [
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/',
];

// Official BSC Mainnet Binance-Peg USDT Token Contract Address
export const DEFAULT_BSC_MAINNET_USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

// Default BSC Testnet JSON-RPC Endpoint (Chain ID 97 / 0x61)
export const DEFAULT_BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// Official BSC Testnet Binance-Peg USDT Token Contract Address
export const DEFAULT_BSC_TESTNET_USDT_CONTRACT = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';

// Configurable RPC chunk size for log searching
export const DEFAULT_RPC_CHUNK_SIZE = 1000;

// Configurable Business Policy for payments made after order expiration
export const ALLOW_LATE_DELIVERY = true;

// Order Time-To-Live: 45 minutes
export const ORDER_TTL_MS = 45 * 60 * 1000;

/**
 * Converts a human-readable USDT amount string (e.g. "39" or "39.4271") into exact token base units (18 decimals).
 * Uses BigInt arithmetic to eliminate any floating point precision errors.
 */
export function usdtToTokenUnits(amountStr: string): string {
  const parts = amountStr.trim().split('.');
  const wholeStr = parts[0] || '0';
  const fracStr = (parts[1] || '').padEnd(4, '0').slice(0, 4);

  const wholeBig = BigInt(wholeStr);
  const fracBig = BigInt(fracStr || '0');

  // 1 USDT = 10^18 wei units.
  // 0.0001 USDT = 10^14 wei units.
  const unitsBig = wholeBig * 10n ** 18n + fracBig * 10n ** 14n;
  return unitsBig.toString();
}

/**
 * Generates an exact payment amount between 39.0001 and 39.9999 USDT with 4 decimal places.
 * Uses integer arithmetic and CSPRNG crypto.getRandomValues to prevent JavaScript floating point inaccuracies.
 */
export function generateExactAmount(basePriceInteger: number = 39): string {
  // Base in 10,000ths (e.g. 39 * 10,000 = 390,000)
  const baseUnits = basePriceInteger * 10000;

  // Secure random integer between 1 and 9999
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const randomFraction = (randomBuffer[0] % 9999) + 1; // 1 .. 9999

  const totalUnits = baseUnits + randomFraction; // e.g. 394271

  const wholePart = Math.floor(totalUnits / 10000).toString();
  const decimalPart = (totalUnits % 10000).toString().padStart(4, '0');

  return `${wholePart}.${decimalPart}`; // e.g. "39.4271"
}

/**
 * Generates a secure random Order ID (e.g. "volt_ord_8f3a9e1c4b")
 */
export function generateOrderId(): string {
  const buffer = new Uint8Array(8);
  crypto.getRandomValues(buffer);
  const hex = Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `volt_ord_${hex}`;
}

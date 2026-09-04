// Configuration constants for VOLT Paywall V4

export type AppMode = 'demo' | 'local' | 'production';

/**
 * Application mode selector ('demo' | 'local' | 'production')
 * Default is 'demo' for instant out-of-the-box frontend demonstration.
 * Set VITE_APP_MODE=local or update here to 'local' to connect with Cloudflare Worker local.
 */
export const APP_MODE: AppMode = (import.meta.env.VITE_APP_MODE as AppMode) || 'demo';

/**
 * Cloudflare Worker API Base URL resolution
 * Defaults to http://localhost:8787 when APP_MODE is 'local'.
 */
const resolveApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (APP_MODE === 'local') {
    return 'http://localhost:8787';
  }
  return '';
};

export const API_BASE_URL: string = resolveApiBaseUrl();

// Stable product identifier sent to the backend
export const PRODUCT_ID = 'creator-pack';

// Chain ID configuration (BSC Testnet = 97, BSC Mainnet = 56)
export const DEFAULT_CHAIN_ID: 56 | 97 = 97;
export const BSC_TESTNET_CHAIN_ID_DECIMAL = 97;
export const BSC_TESTNET_CHAIN_ID_HEX = '0x61';

// Authoritative USDT Contract Address on BSC Testnet
export const BSC_TESTNET_USDT_CONTRACT = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';

// BSC Testnet EIP-3085 Add Chain Configuration
export const BSC_TESTNET_CHAIN_CONFIG = {
  chainId: BSC_TESTNET_CHAIN_ID_HEX,
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
};

export const APP_NAME = 'VOLT';
export const APP_SUBTITLE = 'BSC USDT';

export const PRODUCT_INFO = {
  id: PRODUCT_ID,
  name: 'All-in-One Creator Pack',
  tagline: 'Todo lo necesario para comenzar.',
  description: 'Código completo + guía + licencia comercial. Entrega digital.',
  basePrice: 39,
  currency: 'USDT' as const,
  network: 'BNB Smart Chain' as const,
  networkBadge: 'BSC USDT',
};

// Simulated receiver wallet address for demo mode
export const SIMULATED_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

// Order expiration duration in seconds for demo mode (10 minutes)
export const ORDER_EXPIRATION_SECONDS = 600;

// Polling interval in milliseconds (3 seconds in demo)
export const POLL_INTERVAL_MS = 3000;

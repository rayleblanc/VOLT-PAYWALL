// Configuration constants for VOLT Paywall V4

export type AppMode = 'demo' | 'local' | 'production';

/**
 * Application mode selector ('demo' | 'local' | 'production')
 * Default is 'demo' for instant out-of-the-box frontend demonstration.
 * Set VITE_APP_MODE=local or update here to 'local' to connect with Cloudflare Worker local.
 */
export const APP_MODE = 'production' as AppMode;

/**
 * Cloudflare Worker API Base URL resolution
 * Defaults to the same domain host in production, or localhost in local dev mode.
 */
const resolveApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (APP_MODE === 'local') {
    return 'http://localhost:8787';
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

export const API_BASE_URL: string = resolveApiBaseUrl();

// Stable product identifier sent to the backend
export const PRODUCT_ID = 'creator-pack';

// Chain ID configuration (BSC Mainnet = 56, BSC Testnet = 97)
export const DEFAULT_CHAIN_ID: 56 | 97 = 56;

// BSC Mainnet Constants
export const BSC_MAINNET_CHAIN_ID_DECIMAL = 56;
export const BSC_MAINNET_CHAIN_ID_HEX = '0x38';

// Official USDT Contract Address on BSC Mainnet (BEP-20)
export const BSC_MAINNET_USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

// BSC Mainnet RPC Endpoints
export const BSC_MAINNET_RPC_PRIMARY = 'https://bsc-dataseed.binance.org/';
export const BSC_MAINNET_RPC_FALLBACKS = [
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/',
];

// BSC Mainnet EIP-3085 Add Chain Configuration
export const BSC_MAINNET_CHAIN_CONFIG = {
  chainId: BSC_MAINNET_CHAIN_ID_HEX,
  chainName: 'BNB Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [
    BSC_MAINNET_RPC_PRIMARY,
    ...BSC_MAINNET_RPC_FALLBACKS,
  ],
  blockExplorerUrls: ['https://bscscan.com'],
};

// Aliases for active USDT Contract & Network configuration
export const BSC_USDT_CONTRACT = BSC_MAINNET_USDT_CONTRACT;
export const BSC_TESTNET_USDT_CONTRACT = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
export const BSC_TESTNET_CHAIN_ID_DECIMAL = 97;
export const BSC_TESTNET_CHAIN_ID_HEX = '0x61';

// BSC Testnet EIP-3085 Add Chain Configuration (retained for sandbox/dev testing)
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
  name: 'VOLT Paywall V1 — Commercial Kit',
  tagline: 'Todo lo necesario para comenzar.',
  description: 'Código completo + guía + licencia comercial. Entrega digital.',
  basePrice: 29,
  currency: 'USDT' as const,
  network: 'BNB Smart Chain' as const,
  networkBadge: 'BSC USDT',
};

export interface CatalogItem {
  id: string;
  name: string;
  price: string;
  currency: 'USDT';
  network: 'BSC';
  active: boolean;
  tagline: string;
  description: string;
}

export const PRODUCTS_CATALOG: CatalogItem[] = [
  {
    id: 'creator-pack',
    name: 'VOLT Paywall V1 — Commercial Kit',
    price: '29',
    currency: 'USDT',
    network: 'BSC',
    active: true,
    tagline: 'Self-Hosted USDT Checkout Engine',
    description: 'Complete source code + Cloudflare Worker backend + unlimited commercial license.',
  },
  {
    id: 'volt-affiliates',
    name: 'VOLT Affiliates — On-Chain Referral Splitter',
    price: '49',
    currency: 'USDT',
    network: 'BSC',
    active: false,
    tagline: 'Coming soon',
    description: 'Automated on-chain revenue sharing and affiliate payouts for digital merchants.',
  },
  {
    id: 'volt-subscriptions',
    name: 'VOLT Subscriptions — Token-Gated Recurring Access',
    price: '59',
    currency: 'USDT',
    network: 'BSC',
    active: false,
    tagline: 'Coming soon',
    description: 'Time-expiring cryptographic passes and periodic renewal checks without custodian.',
  },
];

// Simulated receiver wallet address for demo mode (uses user's configured BNB address)
export const SIMULATED_WALLET_ADDRESS = '0x1750C0c093650C36DcF45843446567FF3f50cC5A';

// Order expiration duration in seconds for demo mode (10 minutes)
export const ORDER_EXPIRATION_SECONDS = 600;

// Polling interval in milliseconds (3 seconds in demo)
export const POLL_INTERVAL_MS = 3000;

// VOLT Paywall Worker - Robust JSON-RPC BSC Testnet Client with Failover and Backoff

import { Env } from '../types';
import {
  DEFAULT_BSC_MAINNET_RPC,
  DEFAULT_BSC_MAINNET_RPC_FALLBACKS,
  DEFAULT_BSC_MAINNET_USDT_CONTRACT,
  DEFAULT_BSC_TESTNET_USDT_CONTRACT,
  DEFAULT_RPC_CHUNK_SIZE,
  BSC_MAINNET_CHAIN_ID,
} from '../config';

export class RpcError extends Error {
  code?: number;
  status?: number;

  constructor(message: string, code?: number, status?: number) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
    this.status = status;
  }
}

export interface RpcLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

export interface GetLogsParams {
  fromBlock: number;
  toBlock: number;
  address: string;
  topics?: (string | string[] | null)[];
}

export interface RpcTransactionReceipt {
  transactionHash: string;
  blockNumber: string;
  status: string; // '0x1' or '0x0'
  from: string;
  to: string;
  logs?: RpcLog[];
}

/**
 * Validates whether a string is a valid 42-character EVM address (0x-prefixed hex).
 */
export function isValidEvmAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Resolves list of RPC URLs from the environment or returns default public endpoints (BSC Mainnet by default).
 */
export function getRpcUrls(envOrUrl: Env | string): string[] {
  if (typeof envOrUrl === 'string') {
    return [envOrUrl];
  }
  const env = envOrUrl;
  if (env.BSC_RPC_URL !== undefined) {
    const val = env.BSC_RPC_URL.trim();
    if (val === '' || val.toLowerCase() === 'none' || val.toLowerCase() === 'disabled') {
      return [];
    }
    return env.BSC_RPC_URL.split(',')
      .map((u) => u.trim())
      .filter((u) => u !== '');
  }
  // Robust list of public BSC Mainnet endpoints for resilient failover
  return [
    DEFAULT_BSC_MAINNET_RPC,
    ...DEFAULT_BSC_MAINNET_RPC_FALLBACKS,
    'https://binance.llamarpc.com',
    'https://bsc.meowrpc.com',
  ];
}

/**
 * Resolves the primary/first configured RPC URL for diagnostic logging.
 */
export function getRpcUrl(envOrUrl: Env | string): string | null {
  const urls = getRpcUrls(envOrUrl);
  return urls.length > 0 ? urls[0] : null;
}

/**
 * Resolves the authoritative token contract address server-side.
 * Defaults to official BSC Mainnet USDT contract (0x55d398326f99059fF775485246999027B3197955).
 * Ignores any client-supplied input and validates EVM address format.
 */
export function getTokenContractAddress(envOrUrl: Env | string): string {
  if (typeof envOrUrl === 'string') {
    return DEFAULT_BSC_MAINNET_USDT_CONTRACT;
  }
  const env = envOrUrl;
  const addr = env.USDT_CONTRACT_ADDRESS && env.USDT_CONTRACT_ADDRESS.trim() !== ''
    ? env.USDT_CONTRACT_ADDRESS.trim()
    : DEFAULT_BSC_MAINNET_USDT_CONTRACT;

  if (!isValidEvmAddress(addr)) {
    throw new Error(`INVALID_TOKEN_CONTRACT: Configured token contract address '${addr}' is not a valid EVM address.`);
  }
  return addr.toLowerCase();
}

/**
 * Resolves the block search chunk size from environment with safe bounds (min 10, max 5000).
 */
export function getRpcChunkSize(envOrUrl: Env | string): number {
  const MIN_CHUNK = 10;
  const MAX_CHUNK = 5000;
  if (typeof envOrUrl === 'string') {
    return DEFAULT_RPC_CHUNK_SIZE;
  }
  const env = envOrUrl;
  if (env.RPC_CHUNK_SIZE) {
    const parsed = parseInt(env.RPC_CHUNK_SIZE, 10);
    if (!isNaN(parsed)) {
      if (parsed < MIN_CHUNK) return MIN_CHUNK;
      if (parsed > MAX_CHUNK) return MAX_CHUNK;
      return parsed;
    }
  }
  return DEFAULT_RPC_CHUNK_SIZE;
}

/**
 * Low-level JSON-RPC fetch wrapper with AbortController timeout and strict error checking.
 */
export async function callJsonRpc<T>(
  rpcUrl: string,
  method: string,
  params: unknown[] = [],
  timeoutMs = 5000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new RpcError(`RPC HTTP Error: status ${res.status}`, undefined, res.status);
    }

    const json = (await res.json()) as {
      jsonrpc?: string;
      id?: number;
      result?: T;
      error?: { code: number; message: string };
    };

    if (json.error) {
      throw new RpcError(`RPC Error ${json.error.code}: ${json.error.message}`, json.error.code);
    }

    if (json.result === undefined || json.result === null) {
      throw new RpcError(`RPC returned empty or null result for method '${method}'`);
    }

    return json.result;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof RpcError) {
      throw err;
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new RpcError(`RPC Request Timed Out after ${timeoutMs}ms`);
    }

    const msg = err instanceof Error ? err.message : String(err);
    throw new RpcError(`RPC Connection Failed: ${msg}`);
  }
}

/**
 * Core Orchestrator: Runs callJsonRpc sequentially over resolved RPC urls with retries and exponential backoff.
 */
export async function callJsonRpcWithFailover<T>(
  envOrUrl: Env | string,
  method: string,
  params: unknown[] = [],
  timeoutMs = 5000
): Promise<T> {
  const urls = getRpcUrls(envOrUrl);
  if (urls.length === 0) {
    throw new Error('No RPC endpoints configured.');
  }

  let lastError: Error | null = null;

  for (const url of urls) {
    const maxAttempts = 2;
    let attemptDelay = 300; // ms

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await callJsonRpc<T>(url, method, params, timeoutMs);
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`RPC endpoint ${url} failed on attempt ${attempt}/${maxAttempts} for method '${method}': ${lastError.message}`);
        
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, attemptDelay));
          attemptDelay *= 2; // Exponential backoff
        }
      }
    }
  }

  throw new RpcError(
    `All RPC endpoints failed to execute method '${method}'. Last error: ${lastError ? lastError.message : 'Unknown'}`
  );
}

/**
 * Queries eth_chainId and validates that it strictly matches BSC Testnet (97 / 0x61).
 * Immediately throws RpcError if network chainId != 97.
 */
export async function getChainId(envOrUrl: Env | string, timeoutMs = 5000): Promise<number> {
  const hexChainId = await callJsonRpcWithFailover<string>(envOrUrl, 'eth_chainId', [], timeoutMs);

  if (typeof hexChainId !== 'string' || !hexChainId.startsWith('0x')) {
    throw new RpcError(`Invalid eth_chainId response format: expected hex string starting with 0x, got '${String(hexChainId)}'`);
  }

  const chainId = parseInt(hexChainId, 16);
  if (isNaN(chainId)) {
    throw new RpcError(`Failed to parse chainId hex string '${hexChainId}'`);
  }

  if (chainId !== 97) {
    throw new RpcError(`Chain ID mismatch! Expected 97 (BSC Testnet), got ${chainId} (${hexChainId})`);
  }

  return chainId;
}

/**
 * Queries eth_blockNumber and returns current block as a decimal integer.
 */
export async function getBlockNumber(envOrUrl: Env | string, timeoutMs = 5000): Promise<number> {
  const hexBlock = await callJsonRpcWithFailover<string>(envOrUrl, 'eth_blockNumber', [], timeoutMs);

  if (typeof hexBlock !== 'string' || !hexBlock.startsWith('0x')) {
    throw new RpcError(`Invalid eth_blockNumber response format: expected hex string starting with 0x, got '${String(hexBlock)}'`);
  }

  const blockNumber = parseInt(hexBlock, 16);
  if (isNaN(blockNumber) || blockNumber < 0) {
    throw new RpcError(`Failed to parse blockNumber hex string '${hexBlock}'`);
  }

  return blockNumber;
}

/**
 * Prepared log search abstraction for chunked range queries (created_block -> latest).
 */
export async function getLogs(
  envOrUrl: Env | string,
  params: GetLogsParams,
  timeoutMs = 5000
): Promise<RpcLog[]> {
  if (params.fromBlock > params.toBlock) {
    throw new RpcError(`Invalid range: fromBlock (${params.fromBlock}) cannot be greater than toBlock (${params.toBlock})`);
  }

  const fromBlockHex = '0x' + params.fromBlock.toString(16);
  const toBlockHex = '0x' + params.toBlock.toString(16);

  const filterObject = {
    fromBlock: fromBlockHex,
    toBlock: toBlockHex,
    address: params.address.toLowerCase(),
    ...(params.topics ? { topics: params.topics } : {}),
  };

  const logs = await callJsonRpcWithFailover<RpcLog[]>(envOrUrl, 'eth_getLogs', [filterObject], timeoutMs);
  if (!Array.isArray(logs)) {
    throw new RpcError(`Invalid eth_getLogs response format: expected array, got ${typeof logs}`);
  }

  return logs;
}

/**
 * Queries eth_getTransactionReceipt for verification of transaction success.
 */
export async function getTransactionReceipt(
  envOrUrl: Env | string,
  txHash: string,
  timeoutMs = 5000
): Promise<RpcTransactionReceipt | null> {
  if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
    return null;
  }
  const receipt = await callJsonRpcWithFailover<RpcTransactionReceipt | null>(
    envOrUrl,
    'eth_getTransactionReceipt',
    [txHash],
    timeoutMs
  );
  return receipt;
}

/**
 * Queries the timestamp of a block using eth_getBlockByNumber.
 * Returns decimal seconds since epoch, or null if it fails.
 */
export async function getBlockTimestamp(
  envOrUrl: Env | string,
  blockNumber: number,
  timeoutMs = 5000
): Promise<number | null> {
  try {
    const hexBlock = '0x' + blockNumber.toString(16);
    const block = await callJsonRpcWithFailover<{ timestamp: string } | null>(
      envOrUrl,
      'eth_getBlockByNumber',
      [hexBlock, false],
      timeoutMs
    );
    if (block && block.timestamp) {
      return parseInt(block.timestamp, 16);
    }
  } catch (err) {
    console.warn(`Failed to fetch block timestamp for block ${blockNumber}:`, err);
  }
  return null;
}

/**
 * Queries the latest finalized block number on BNB Smart Chain.
 * Supports native 'finalized' block tag (EIP-1898 / BSC Fast Finality)
 * and falls back to 'eth_getFinalizedHeader' if 'finalized' block tag is unsupported.
 * Returns decimal block number, or null if unsupported/failed.
 */
export async function getFinalizedBlockNumber(
  envOrUrl: Env | string,
  timeoutMs = 5000
): Promise<number | null> {
  try {
    const block = await callJsonRpcWithFailover<{ number: string } | null>(
      envOrUrl,
      'eth_getBlockByNumber',
      ['finalized', false],
      timeoutMs
    );
    if (block && block.number) {
      const num = parseInt(block.number, 16);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  } catch (_err) {
    // Ignore and attempt eth_getFinalizedHeader fallback
  }

  try {
    const header = await callJsonRpcWithFailover<{ number: string } | null>(
      envOrUrl,
      'eth_getFinalizedHeader',
      [],
      timeoutMs
    );
    if (header && header.number) {
      const num = parseInt(header.number, 16);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  } catch (err) {
    console.warn(`RPC node does not support BSC finalized tags or calls failed:`, err);
  }
  return null;
}

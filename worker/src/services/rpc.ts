// VOLT Paywall Worker - JSON-RPC BSC Testnet Client

import { Env } from '../types';
import {
  DEFAULT_BSC_TESTNET_USDT_CONTRACT,
  DEFAULT_RPC_CHUNK_SIZE,
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

/**
 * Validates whether a string is a valid 42-character EVM address (0x-prefixed hex).
 */
export function isValidEvmAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Resolves the RPC URL exclusively from environment or returns null if not configured.
 */
export function getRpcUrl(env: Env): string | null {
  if (env.BSC_RPC_URL && env.BSC_RPC_URL.trim() !== '') {
    return env.BSC_RPC_URL.trim();
  }
  return null;
}

/**
 * Resolves the authoritative token contract address server-side.
 * Ignores any client-supplied input and validates EVM address format.
 */
export function getTokenContractAddress(env: Env): string {
  const addr = env.USDT_CONTRACT_ADDRESS && env.USDT_CONTRACT_ADDRESS.trim() !== ''
    ? env.USDT_CONTRACT_ADDRESS.trim()
    : DEFAULT_BSC_TESTNET_USDT_CONTRACT;

  if (!isValidEvmAddress(addr)) {
    throw new Error(`INVALID_TOKEN_CONTRACT: Configured token contract address '${addr}' is not a valid EVM address.`);
  }
  return addr.toLowerCase();
}

/**
 * Resolves the block search chunk size from environment with safe bounds (min 10, max 5000).
 */
export function getRpcChunkSize(env: Env): number {
  const MIN_CHUNK = 10;
  const MAX_CHUNK = 5000;
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
 * Queries eth_chainId and validates that it strictly matches BSC Testnet (97 / 0x61).
 * Immediately throws RpcError if network chainId != 97.
 */
export async function getChainId(rpcUrl: string, timeoutMs = 5000): Promise<number> {
  const hexChainId = await callJsonRpc<string>(rpcUrl, 'eth_chainId', [], timeoutMs);

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
export async function getBlockNumber(rpcUrl: string, timeoutMs = 5000): Promise<number> {
  const hexBlock = await callJsonRpc<string>(rpcUrl, 'eth_blockNumber', [], timeoutMs);

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
 * Note: Transfer log processing and validation will be implemented in the next phase.
 */
export async function getLogs(
  rpcUrl: string,
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

  const logs = await callJsonRpc<RpcLog[]>(rpcUrl, 'eth_getLogs', [filterObject], timeoutMs);
  if (!Array.isArray(logs)) {
    throw new RpcError(`Invalid eth_getLogs response format: expected array, got ${typeof logs}`);
  }

  return logs;
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
 * Queries eth_getTransactionReceipt for verification of transaction success.
 */
export async function getTransactionReceipt(
  rpcUrl: string,
  txHash: string,
  timeoutMs = 5000
): Promise<RpcTransactionReceipt | null> {
  if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
    return null;
  }
  const receipt = await callJsonRpc<RpcTransactionReceipt | null>(
    rpcUrl,
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
  rpcUrl: string,
  blockNumber: number,
  timeoutMs = 5000
): Promise<number | null> {
  try {
    const hexBlock = '0x' + blockNumber.toString(16);
    const block = await callJsonRpc<{ timestamp: string } | null>(
      rpcUrl,
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


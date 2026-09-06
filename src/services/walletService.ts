/**
 * VOLT Paywall - Pure EIP-1193 Wallet Service
 * 
 * Interacts directly with window.ethereum without external heavy libraries
 * (ethers, viem, web3). Implements account request, network checking,
 * switching to BSC Testnet (0x61 / 97), and EIP-1193 event handling.
 */

import { EIP1193Provider, WalletState } from '../types';
import {
  DEFAULT_CHAIN_ID,
  BSC_MAINNET_CHAIN_ID_HEX,
  BSC_MAINNET_CHAIN_CONFIG,
  BSC_MAINNET_USDT_CONTRACT,
  BSC_TESTNET_CHAIN_ID_HEX,
  BSC_TESTNET_CHAIN_CONFIG,
} from '../config';

/**
 * Safely resolves the injected window.ethereum provider.
 */
export function getEthereumProvider(): EIP1193Provider | null {
  if (typeof window === 'undefined') return null;
  if (window.ethereum) {
    return window.ethereum;
  }
  return null;
}

/**
 * Formats a full 0x hex address into a clean shortened string (e.g., "0x1234...5678").
 */
export function formatAddress(address: string | null): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validates if the given chain ID represents BSC Mainnet (Hex: 0x38 or Decimal: 56).
 */
export function isBscMainnetChain(chainId: string | number | null): boolean {
  if (!chainId) return false;
  if (typeof chainId === 'number') {
    return chainId === 56;
  }
  const cleanHex = chainId.toLowerCase().trim();
  if (cleanHex === '0x38' || cleanHex === '0x0038' || cleanHex === '56') {
    return true;
  }
  const dec = parseInt(cleanHex, 16);
  return dec === 56;
}

/**
 * Validates if the given chain ID represents BSC Testnet (Hex: 0x61 or Decimal: 97).
 */
export function isBscTestnetChain(chainId: string | number | null): boolean {
  if (!chainId) return false;
  if (typeof chainId === 'number') {
    return chainId === 97;
  }
  const cleanHex = chainId.toLowerCase().trim();
  if (cleanHex === '0x61' || cleanHex === '0x0061' || cleanHex === '97') {
    return true;
  }
  const dec = parseInt(cleanHex, 16);
  return dec === 97;
}

/**
 * Checks if the wallet is on the currently targeted BSC network (Default: Mainnet 56).
 */
export function isTargetBscChain(chainId: string | number | null): boolean {
  if (DEFAULT_CHAIN_ID === 56) {
    return isBscMainnetChain(chainId);
  }
  return isBscTestnetChain(chainId);
}

/**
 * Requests wallet account connection via EIP-1193 eth_requestAccounts
 * and queries eth_chainId.
 */
export async function connectEip1193Wallet(): Promise<WalletState> {
  const provider = getEthereumProvider();

  if (!provider) {
    return {
      status: 'unavailable',
      account: null,
      chainId: null,
      isBscMainnet: false,
      isBscTestnet: false,
      errorMessage: 'No se detectó un proveedor Web3/EIP-1193 (MetaMask, Trust Wallet, etc.).',
    };
  }

  try {
    // 1. Request accounts
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    if (!accounts || accounts.length === 0) {
      return {
        status: 'disconnected',
        account: null,
        chainId: null,
        isBscMainnet: false,
        isBscTestnet: false,
        errorMessage: 'No se seleccionó ninguna cuenta en la wallet.',
      };
    }

    const primaryAccount = accounts[0];

    // 2. Query chain ID
    const rawChainId = (await provider.request({ method: 'eth_chainId' })) as string;
    const isMainnet = isBscMainnetChain(rawChainId);
    const isTestnet = isBscTestnetChain(rawChainId);
    const isValidNetwork = DEFAULT_CHAIN_ID === 56 ? isMainnet : isTestnet;

    if (!isValidNetwork) {
      const targetName = DEFAULT_CHAIN_ID === 56 ? 'BNB Smart Chain Mainnet (Chain ID 56)' : 'BNB Smart Chain Testnet (Chain ID 97)';
      return {
        status: 'wrong_network',
        account: primaryAccount,
        chainId: rawChainId,
        isBscMainnet: isMainnet,
        isBscTestnet: isTestnet,
        errorMessage: `Red incorrecta. Cambia tu wallet a ${targetName}.`,
      };
    }

    return {
      status: 'connected',
      account: primaryAccount,
      chainId: rawChainId,
      isBscMainnet: isMainnet,
      isBscTestnet: isTestnet,
      errorMessage: null,
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: number; message?: string };

    if (errorObj.code === 4001) {
      return {
        status: 'disconnected',
        account: null,
        chainId: null,
        isBscMainnet: false,
        isBscTestnet: false,
        errorMessage: 'Conexión cancelada por el usuario.',
      };
    }

    if (errorObj.code === -32002) {
      return {
        status: 'connecting',
        account: null,
        chainId: null,
        isBscMainnet: false,
        isBscTestnet: false,
        errorMessage: 'Abre la ventana de tu wallet para autorizar la conexión pendiente.',
      };
    }

    return {
      status: 'error',
      account: null,
      chainId: null,
      isBscMainnet: false,
      isBscTestnet: false,
      errorMessage: errorObj.message || 'Error al comunicarse con la wallet.',
    };
  }
}

/**
 * Requests network switch to BSC Mainnet (0x38 / 56) via wallet_switchEthereumChain.
 * Falls back to wallet_addEthereumChain if BSC Mainnet is not yet registered in wallet.
 */
export async function switchToBscMainnet(): Promise<WalletState> {
  const provider = getEthereumProvider();

  if (!provider) {
    return {
      status: 'unavailable',
      account: null,
      chainId: null,
      isBscMainnet: false,
      isBscTestnet: false,
      errorMessage: 'No se detectó un proveedor Web3.',
    };
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_MAINNET_CHAIN_ID_HEX }],
    });

    // Re-verify after successful switch
    return await connectEip1193Wallet();
  } catch (err: unknown) {
    const errorObj = err as { code?: number; message?: string };

    // Code 4902 indicates chain not added to wallet
    if (errorObj.code === 4902 || String(errorObj.message).toLowerCase().includes('unrecognized')) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [BSC_MAINNET_CHAIN_CONFIG],
        });
        return await connectEip1193Wallet();
      } catch (addErr: unknown) {
        const addErrObj = addErr as { message?: string };
        return {
          status: 'wrong_network',
          account: null,
          chainId: null,
          isBscMainnet: false,
          isBscTestnet: false,
          errorMessage: addErrObj.message || 'No se pudo agregar la red BNB Smart Chain Mainnet a la wallet.',
        };
      }
    }

    if (errorObj.code === 4001) {
      return {
        status: 'wrong_network',
        account: null,
        chainId: null,
        isBscMainnet: false,
        isBscTestnet: false,
        errorMessage: 'Cambio de red cancelado por el usuario.',
      };
    }

    return {
      status: 'wrong_network',
      account: null,
      chainId: null,
      isBscMainnet: false,
      isBscTestnet: false,
      errorMessage: errorObj.message || 'Error al cambiar a la red BNB Smart Chain Mainnet.',
    };
  }
}

/**
 * Legacy alias for switching to target network
 */
export const switchToBscTestnet = switchToBscMainnet;
export const switchBscNetwork = switchToBscMainnet;

/**
 * Executes a real USDT (or configured ERC-20 token) transfer using pure EIP-1193 eth_sendTransaction.
 * Constructs the transfer(address,uint256) calldata with exactly padded parameters.
 */
export async function sendUsdtTransfer(params: {
  recipient: string;
  expectedUnits: string; // Exact units in minimum token base units (BigInt string)
  tokenContract: string; // Authoritative token contract address from server configuration
  userAddress: string;   // Connected EIP-1193 user wallet address
}): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No se detectó un proveedor Web3/EIP-1193 compatible (ej. MetaMask).');
  }

  const recipientClean = params.recipient.trim();
  const tokenClean = params.tokenContract.trim();
  const userClean = params.userAddress.trim();

  // Validate addresses using strict regex format matching EVM expectations
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(recipientClean)) {
    throw new Error('La dirección del receptor no es una dirección EVM válida.');
  }
  if (!addressRegex.test(tokenClean)) {
    throw new Error('La dirección del contrato de token no es una dirección EVM válida.');
  }
  if (!addressRegex.test(userClean)) {
    throw new Error('La dirección de la wallet del usuario no es una dirección EVM válida.');
  }

  // Parse exact base units as BigInt to ensure zero floating-point loss
  const amountBig = BigInt(params.expectedUnits);
  if (amountBig <= 0n) {
    throw new Error('El importe de la transacción debe ser mayor que cero.');
  }

  // 1. Selector for ERC-20 transfer(address,uint256) is exactly 0xa9059cbb
  const selector = '0xa9059cbb';

  // 2. Pad recipient address to 32 bytes (64 hexadecimal characters)
  const recipientHex = recipientClean.slice(2).toLowerCase();
  const paddedRecipient = recipientHex.padStart(64, '0');

  // 3. Pad token amount units to 32 bytes (64 hexadecimal characters)
  const amountHex = amountBig.toString(16).toLowerCase();
  const paddedAmount = amountHex.padStart(64, '0');

  // 4. Form complete transaction calldata
  const calldata = selector + paddedRecipient + paddedAmount;

  // 5. Construct transaction object. Note: "to" is the token contract, not the recipient.
  const txObject = {
    from: userClean.toLowerCase(),
    to: tokenClean.toLowerCase(),
    data: calldata,
    value: '0x0', // No native gas asset is sent
  };

  try {
    const txHash = (await provider.request({
      method: 'eth_sendTransaction',
      params: [txObject],
    })) as string;

    if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x') || txHash.length !== 66) {
      throw new Error('La wallet devolvió un hash de transacción con formato inválido.');
    }

    return txHash;
  } catch (err: unknown) {
    const errorObj = err as { code?: number; message?: string };
    if (errorObj.code === 4001) {
      throw new Error('La transacción fue rechazada por el usuario en su wallet.');
    }
    throw new Error(errorObj.message || 'Error de la wallet al procesar la transferencia.');
  }
}

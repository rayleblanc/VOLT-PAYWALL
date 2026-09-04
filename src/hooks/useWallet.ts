import { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../types';
import {
  getEthereumProvider,
  isBscTestnetChain,
  connectEip1193Wallet,
  switchToBscTestnet,
} from '../services/walletService';

const INITIAL_WALLET_STATE: WalletState = {
  status: 'disconnected',
  account: null,
  chainId: null,
  isBscTestnet: false,
  errorMessage: null,
};

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>(INITIAL_WALLET_STATE);

  // Check if wallet is already authorized (eth_accounts without popup)
  const checkConnectedState = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider) {
      setWalletState((prev) => ({
        ...prev,
        status: 'disconnected',
      }));
      return;
    }

    try {
      const accounts = (await provider.request({ method: 'eth_accounts' })) as string[];
      if (accounts && accounts.length > 0) {
        const rawChainId = (await provider.request({ method: 'eth_chainId' })) as string;
        const isTestnet = isBscTestnetChain(rawChainId);

        setWalletState({
          status: isTestnet ? 'connected' : 'wrong_network',
          account: accounts[0],
          chainId: rawChainId,
          isBscTestnet: isTestnet,
          errorMessage: isTestnet
            ? null
            : 'Red incorrecta. Cambia tu wallet a BNB Smart Chain Testnet (Chain ID 97).',
        });
      }
    } catch (err) {
      console.warn('Failed checking initial wallet state:', err);
    }
  }, []);

  // Listen to EIP-1193 provider events
  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider || !provider.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accList = accounts as string[];
      if (!accList || accList.length === 0) {
        setWalletState(INITIAL_WALLET_STATE);
      } else {
        setWalletState((prev) => ({
          ...prev,
          status: prev.isBscTestnet ? 'connected' : 'wrong_network',
          account: accList[0],
        }));
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      const hexChainId = String(chainId);
      const isTestnet = isBscTestnetChain(hexChainId);

      setWalletState((prev) => ({
        ...prev,
        chainId: hexChainId,
        isBscTestnet: isTestnet,
        status: prev.account ? (isTestnet ? 'connected' : 'wrong_network') : 'disconnected',
        errorMessage: isTestnet
          ? null
          : 'Red incorrecta. Cambia tu wallet a BNB Smart Chain Testnet (Chain ID 97).',
      }));
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    // Initial silent check
    checkConnectedState();

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkConnectedState]);

  const connect = async () => {
    setWalletState((prev) => ({ ...prev, status: 'connecting', errorMessage: null }));
    const result = await connectEip1193Wallet();
    setWalletState(result);
    return result;
  };

  const switchNetwork = async () => {
    const result = await switchToBscTestnet();
    setWalletState(result);
    return result;
  };

  const disconnect = () => {
    setWalletState(INITIAL_WALLET_STATE);
  };

  return {
    walletState,
    connect,
    switchNetwork,
    disconnect,
  };
}

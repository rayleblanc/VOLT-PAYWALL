import { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../types';
import {
  getEthereumProvider,
  isBscTestnetChain,
  isBscMainnetChain,
  connectEip1193Wallet,
  switchToBscMainnet,
} from '../services/walletService';
import { DEFAULT_CHAIN_ID } from '../config';

const INITIAL_WALLET_STATE: WalletState = {
  status: 'disconnected',
  account: null,
  chainId: null,
  isBscMainnet: false,
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
        const isMainnet = isBscMainnetChain(rawChainId);
        const isTestnet = isBscTestnetChain(rawChainId);
        const isValid = DEFAULT_CHAIN_ID === 56 ? isMainnet : isTestnet;
        const targetName = DEFAULT_CHAIN_ID === 56 ? 'BNB Smart Chain Mainnet (Chain ID 56)' : 'BNB Smart Chain Testnet (Chain ID 97)';

        setWalletState({
          status: isValid ? 'connected' : 'wrong_network',
          account: accounts[0],
          chainId: rawChainId,
          isBscMainnet: isMainnet,
          isBscTestnet: isTestnet,
          errorMessage: isValid
            ? null
            : `Red incorrecta. Cambia tu wallet a ${targetName}.`,
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
        setWalletState((prev) => {
          const isValid = DEFAULT_CHAIN_ID === 56 ? prev.isBscMainnet : prev.isBscTestnet;
          return {
            ...prev,
            status: isValid ? 'connected' : 'wrong_network',
            account: accList[0],
          };
        });
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      const hexChainId = String(chainId);
      const isMainnet = isBscMainnetChain(hexChainId);
      const isTestnet = isBscTestnetChain(hexChainId);
      const isValid = DEFAULT_CHAIN_ID === 56 ? isMainnet : isTestnet;
      const targetName = DEFAULT_CHAIN_ID === 56 ? 'BNB Smart Chain Mainnet (Chain ID 56)' : 'BNB Smart Chain Testnet (Chain ID 97)';

      setWalletState((prev) => ({
        ...prev,
        chainId: hexChainId,
        isBscMainnet: isMainnet,
        isBscTestnet: isTestnet,
        status: prev.account ? (isValid ? 'connected' : 'wrong_network') : 'disconnected',
        errorMessage: isValid
          ? null
          : `Red incorrecta. Cambia tu wallet a ${targetName}.`,
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
    const result = await switchToBscMainnet();
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

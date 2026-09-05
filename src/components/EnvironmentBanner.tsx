import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Radio, X, Info, ExternalLink } from 'lucide-react';
import { getEthereumProvider, isBscTestnetChain } from '../services/walletService';
import { DEFAULT_CHAIN_ID, BSC_TESTNET_CHAIN_ID_DECIMAL } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

export interface EnvironmentBannerProps {
  onDismiss?: () => void;
}

export const EnvironmentBanner: React.FC<EnvironmentBannerProps> = ({ onDismiss }) => {
  const { language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);
  const [detectedChainId, setDetectedChainId] = useState<number | string>(DEFAULT_CHAIN_ID);
  const [isWalletTestnet, setIsWalletTestnet] = useState<boolean>(true);
  const [hasWallet, setHasWallet] = useState<boolean>(false);

  // Inspect environment and wallet RPC / chain
  useEffect(() => {
    const checkNetwork = async () => {
      const provider = getEthereumProvider();
      if (!provider) {
        setHasWallet(false);
        // Fallback to configured default
        const isTest = DEFAULT_CHAIN_ID === BSC_TESTNET_CHAIN_ID_DECIMAL;
        setIsWalletTestnet(isTest);
        setDetectedChainId(DEFAULT_CHAIN_ID);
        return;
      }

      setHasWallet(true);
      try {
        const rawChain = (await provider.request({ method: 'eth_chainId' })) as string;
        if (rawChain) {
          const isTest = isBscTestnetChain(rawChain);
          setIsWalletTestnet(isTest);
          const dec = parseInt(rawChain, 16);
          setDetectedChainId(isNaN(dec) ? rawChain : dec);
        }
      } catch (err) {
        console.warn('Environment banner network check failed:', err);
      }
    };

    checkNetwork();

    const provider = getEthereumProvider();
    if (provider && provider.on) {
      const handleChainChange = (newChain: unknown) => {
        const hex = String(newChain);
        const isTest = isBscTestnetChain(hex);
        setIsWalletTestnet(isTest);
        const dec = parseInt(hex, 16);
        setDetectedChainId(isNaN(dec) ? hex : dec);
      };

      provider.on('chainChanged', handleChainChange);
      return () => {
        if (provider.removeListener) {
          provider.removeListener('chainChanged', handleChainChange);
        }
      };
    }
  }, []);

  if (isDismissed) return null;

  const isSpanish = language === 'ES';

  // TESTNET ACTIVE BANNER
  if (isWalletTestnet) {
    return (
      <aside
        id="environment-network-banner"
        aria-label="Network Environment Indicator"
        className="w-full bg-gradient-to-r from-amber-950/90 via-black to-amber-950/90 border-b border-amber-500/30 px-3 py-2 text-xs text-amber-200"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="flex items-center gap-1.5 font-bold tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
              <span className="text-[#FFB800] font-black">
                {isSpanish ? 'MODO TESTNET (BSC Chain ID 97)' : 'TESTNET MODE (BSC Chain ID 97)'}
              </span>
            </div>
            <span className="text-gray-400 hidden md:inline">|</span>
            <span className="text-gray-300 hidden md:inline text-[11px]">
              {isSpanish
                ? 'Ambiente de pruebas activo con tBNB/USDT Testnet. Cambia el RPC a Mainnet (56) en Cloudflare para cobrar dinero real.'
                : 'Active sandbox mode. Switch RPC to Mainnet (56) in Cloudflare Worker to receive real production funds.'}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <a
              href="https://testnet.bscscan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300 transition-colors"
            >
              <span>BscScan Testnet</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <button
              onClick={() => {
                setIsDismissed(true);
                onDismiss?.();
              }}
              className="p-1 rounded-md text-amber-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={isSpanish ? 'Cerrar aviso' : 'Dismiss notice'}
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // MAINNET ACTIVE BADGE BANNER
  return (
    <aside
      id="environment-network-banner"
      aria-label="Network Environment Indicator"
      className="w-full bg-gradient-to-r from-emerald-950/80 via-black to-emerald-950/80 border-b border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]"></span>
          </span>
          <div className="flex items-center gap-1.5 font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
            <span className="text-[#00C853] font-black">
              LIVE ON MAINNET (BSC · Chain ID {detectedChainId})
            </span>
          </div>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-gray-300 hidden sm:inline text-[11px]">
            {isSpanish
              ? 'Verificación On-Chain y pagos directos en USDT listos para producción.'
              : 'Direct non-custodial USDT payments active on BNB Smart Chain.'}
          </span>
        </div>

        <button
          onClick={() => {
            setIsDismissed(true);
            onDismiss?.();
          }}
          className="p-1 rounded-md text-emerald-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={isSpanish ? 'Cerrar aviso' : 'Dismiss notice'}
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

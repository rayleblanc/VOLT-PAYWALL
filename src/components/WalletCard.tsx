import React, { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { formatAddress } from '../services/walletService';

export const WalletCard: React.FC = () => {
  const { walletState, connect, switchNetwork, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!walletState.account) return;
    try {
      await navigator.clipboard.writeText(walletState.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 text-white space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#FFB800]" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            WALLET EIP-1193
          </h3>
        </div>
        <span
          className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase ${
            walletState.status === 'connected'
              ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20'
              : walletState.status === 'wrong_network'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-white/5 text-gray-400 border border-white/5'
          }`}
        >
          {walletState.status === 'connected'
            ? 'BSC Testnet'
            : walletState.status === 'wrong_network'
            ? 'Red Incorrecta'
            : walletState.status === 'connecting'
            ? 'Conectando...'
            : 'Desconectada'}
        </span>
      </div>

      {/* Main Wallet Content Body */}
      <div className="space-y-3">
        {/* State: DISCONNECTED */}
        {walletState.status === 'disconnected' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              Conecta tu wallet EIP-1193 (MetaMask, Trust Wallet, etc.) para operar en BNB Smart Chain Testnet.
            </p>
            {walletState.errorMessage && (
              <p className="text-xs text-amber-400 bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20">
                {walletState.errorMessage}
              </p>
            )}
            <button
              onClick={connect}
              aria-label="Conectar wallet EIP-1193"
              className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Wallet className="w-4 h-4" />
              <span>Conectar Wallet</span>
            </button>
          </div>
        )}

        {/* State: CONNECTING */}
        {walletState.status === 'connecting' && (
          <div className="py-2 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[#FFB800]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Solicitando conexión...</span>
            </div>
            <p className="text-xs text-gray-400">
              Por favor, abre y autoriza la solicitud en tu wallet.
            </p>
          </div>
        )}

        {/* State: CONNECTED */}
        {walletState.status === 'connected' && walletState.account && (
          <div className="space-y-3">
            <div className="bg-[#181818] p-3 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  CUENTA CONECTADA
                </span>
                <span className="text-[10px] font-mono text-[#00C853] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>BSC Testnet (97)</span>
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-white">
                  {formatAddress(walletState.account)}
                </span>
                <button
                  onClick={handleCopy}
                  aria-label="Copiar dirección de wallet"
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Copiar dirección"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#00C853]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-snug">
              Wallet vinculada correctamente. El flujo está preparado para futuras autorizaciones.
            </p>

            <button
              onClick={disconnect}
              aria-label="Desconectar wallet"
              className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Desconectar Wallet
            </button>
          </div>
        )}

        {/* State: WRONG_NETWORK */}
        {walletState.status === 'wrong_network' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Red Actual No Soportada</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Tu wallet está conectada pero en una red distinta. Debes cambiar a BNB Smart Chain Testnet (Chain ID 97).
              </p>
              {walletState.account && (
                <p className="text-[10px] font-mono text-gray-400">
                  Cuenta: {formatAddress(walletState.account)}
                </p>
              )}
            </div>

            <button
              onClick={switchNetwork}
              aria-label="Cambiar a BSC Testnet"
              className="w-full bg-[#FFB800] hover:bg-[#FFC107] text-black py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Cambiar a BSC Testnet (0x61)</span>
            </button>
          </div>
        )}

        {/* State: UNAVAILABLE */}
        {walletState.status === 'unavailable' && (
          <div className="space-y-3">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <AlertTriangle className="w-4 h-4 text-[#FFB800] shrink-0" />
                <span className="text-xs font-bold">Proveedor Web3 No Encontrado</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                No se detectó un navegador con wallet Web3 (MetaMask, Trust Wallet, Coinbase Wallet).
              </p>
            </div>
            <button
              onClick={connect}
              aria-label="Reintentar búsqueda de wallet"
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reintentar Detección
            </button>
          </div>
        )}

        {/* State: ERROR */}
        {walletState.status === 'error' && (
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-300">
              {walletState.errorMessage || 'Error de comunicación con la wallet.'}
            </div>
            <button
              onClick={connect}
              aria-label="Reintentar conectar wallet"
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

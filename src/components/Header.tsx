import React from 'react';
import { RotateCcw, Server, Wallet } from 'lucide-react';
import { APP_NAME, APP_MODE } from '../config';
import { useWallet } from '../hooks/useWallet';
import { formatAddress } from '../services/walletService';

interface HeaderProps {
  onResetDemo?: () => void;
  showReset?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onResetDemo, showReset = false }) => {
  const { walletState } = useWallet();

  return (
    <header className="w-full border-b border-white/5 bg-[#080808] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFB800] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.2)]">
            <span className="text-black font-black text-xl italic">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">{APP_NAME}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#FFB800] font-semibold">
              BSC USDT · Paywall
            </span>
          </div>
        </div>

        {/* Network Badge & Mode Badge & Wallet Account & Reset Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-[#141414] border border-white/5 px-3 py-1.5 rounded-full items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#FFB800]" />
            <span className="text-xs font-mono font-semibold text-gray-300">
              {APP_MODE === 'demo' ? 'Mode: DEMO' : APP_MODE === 'local' ? 'Worker: LOCAL' : 'Worker: PROD'}
            </span>
          </div>

          {walletState.account && (
            <div className="flex bg-[#141414] border border-white/10 px-3 py-1.5 rounded-full items-center gap-2 text-xs font-mono font-bold text-white">
              <Wallet className="w-3.5 h-3.5 text-[#00C853]" />
              <span>{formatAddress(walletState.account)}</span>
            </div>
          )}

          <div className="hidden md:flex bg-[#141414] border border-white/5 px-3.5 py-1.5 rounded-full items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]" />
            <span className="text-xs font-medium text-gray-300">BSC Testnet (97)</span>
          </div>

          {showReset && onResetDemo && (
            <button
              onClick={onResetDemo}
              className="bg-[#141414] hover:bg-[#1f1f1f] border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-[#FFB800] transition-colors duration-200 cursor-pointer"
              title="Reiniciar pantalla"
              aria-label="Reiniciar orden"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{APP_MODE === 'demo' ? 'Reiniciar demo' : 'Nueva orden'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

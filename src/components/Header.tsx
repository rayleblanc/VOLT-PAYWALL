import React from 'react';
import { RotateCcw, Server, Wallet, Code, Globe } from 'lucide-react';
import { APP_NAME, APP_MODE } from '../config';
import { useWallet } from '../hooks/useWallet';
import { formatAddress } from '../services/walletService';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  onResetDemo?: () => void;
  showReset?: boolean;
  onOpenEmbedModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetDemo,
  showReset = false,
  onOpenEmbedModal,
}) => {
  const { walletState } = useWallet();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="w-full border-b border-white/5 bg-[#080808] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FFB800] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.2)] shrink-0">
            <span className="text-black font-black text-lg sm:text-xl italic">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">{APP_NAME}</span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#FFB800] font-semibold">
              BSC USDT · Paywall
            </span>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Switcher - STRICTLY TEXT ONLY (NO FLAGS) */}
          <div className="flex items-center bg-[#141414] border border-white/10 rounded-full p-0.5 text-xs font-mono font-bold">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                language === 'EN'
                  ? 'bg-[#FFB800] text-black shadow-[0_0_8px_rgba(255,184,0,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="English"
              aria-label="Switch to English"
            >
              EN
            </button>
            <span className="text-gray-600 px-0.5">|</span>
            <button
              onClick={() => setLanguage('ES')}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                language === 'ES'
                  ? 'bg-[#FFB800] text-black shadow-[0_0_8px_rgba(255,184,0,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Español"
              aria-label="Cambiar a Español"
            >
              ES
            </button>
          </div>

          {/* No-Code Integration Embed Button */}
          {onOpenEmbedModal && (
            <button
              onClick={onOpenEmbedModal}
              className="bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(255,184,0,0.1)] active:scale-95"
              title={t.nav.integrateNoCode}
              aria-label={t.nav.integrateNoCode}
            >
              <Code className="w-3.5 h-3.5 text-[#FFB800]" />
              <span className="hidden sm:inline">{t.nav.integrateNoCode}</span>
              <span className="sm:hidden">No-Code</span>
            </button>
          )}

          <div className="hidden lg:flex bg-[#141414] border border-white/5 px-3 py-1.5 rounded-full items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#FFB800]" />
            <span className="text-xs font-mono font-semibold text-gray-300">
              {APP_MODE === 'demo' ? t.nav.modeDemo : APP_MODE === 'local' ? t.nav.modeLocal : t.nav.modeProd}
            </span>
          </div>

          {walletState.account && (
            <div className="hidden xs:flex bg-[#141414] border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-full items-center gap-2 text-xs font-mono font-bold text-white">
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
              className="bg-[#141414] hover:bg-[#1f1f1f] border border-white/10 px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-[#FFB800] transition-colors duration-200 cursor-pointer"
              title={t.nav.resetDemo}
              aria-label={t.nav.resetDemo}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t.nav.resetDemo}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};



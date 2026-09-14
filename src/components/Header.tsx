import React from 'react';
import { RotateCcw, Server, Wallet, Code, Globe, Play } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFB800] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.2)] shrink-0">
            <span className="text-black font-black text-base sm:text-xl italic">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-2xl font-bold tracking-tight text-white leading-tight">{APP_NAME}</span>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#FFB800] font-semibold">
              BSC USDT · Paywall
            </span>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
          {/* Language Switcher - STRICTLY TEXT ONLY (NO FLAGS) */}
          <div className="flex items-center bg-[#141414] border border-white/10 rounded-full p-0.5 text-[10px] sm:text-xs font-mono font-bold shrink-0">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer ${
                language === 'EN'
                  ? 'bg-[#FFB800] text-black shadow-[0_0_8px_rgba(255,184,0,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="English"
              aria-label="Switch to English"
            >
              EN
            </button>
            <span className="text-gray-600 px-0.5 text-[10px]">|</span>
            <button
              onClick={() => setLanguage('ES')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer ${
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

          {/* Embed / No-Code Integration Snippets */}
          {onOpenEmbedModal && (
            <button
              onClick={onOpenEmbedModal}
              className="bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(255,184,0,0.1)] active:scale-95 shrink-0"
              title={language === 'ES' ? 'Ver Código de Integración' : 'Integration Embed Code'}
              aria-label={language === 'ES' ? 'Ver Código de Integración' : 'Integration Embed Code'}
            >
              <Code className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>{language === 'ES' ? 'Integrar en tu Web' : 'Embed Code'}</span>
            </button>
          )}

          {walletState.account && (
            <div className="bg-[#141414] border border-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-white shrink-0">
              <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00C853]" />
              <span>{formatAddress(walletState.account)}</span>
            </div>
          )}

          <div className="hidden md:flex bg-[#141414] border border-white/5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]" />
            <span className="text-xs font-medium text-gray-300">BSC Mainnet (56)</span>
          </div>
        </div>
      </div>
    </header>
  );
};



import React from 'react';
import { ShoppingCart, Play, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroSectionProps {
  onBuyNow: (mode?: 'wallet' | 'manual') => void;
  onTryDemo: () => void;
  isLoading: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBuyNow,
  onTryDemo,
  isLoading,
}) => {
  const { t } = useLanguage();

  return (
    <section className="w-full pt-6 sm:pt-12 pb-8 sm:pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
      {/* Trust & Proof Badges: Mainnet BSC · Non-custodial · 0% platform fee · Full source */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-[#161616] border border-white/10 text-xs font-mono mb-5 animate-fade-in shadow-lg">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#FFB800]">
          <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
          Mainnet BSC
        </span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-200 font-medium">Non-custodial</span>
        <span className="text-gray-600">·</span>
        <span className="text-[#00C853] font-bold">0% platform fee</span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-200 font-medium">Full source</span>
      </div>

      {/* Cloudflare Deploy Note */}
      <p className="text-xs text-gray-400 font-mono mb-6 sm:mb-8">
        ⚡ {t.hero.runsOnCloudflare || 'Runs on Cloudflare. Add your own domain later.'}
      </p>

      {/* 1) Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.12] mb-5 sm:mb-6 max-w-3xl mx-auto">
        {t.hero.headline}
      </h1>

      {/* 1) Subtitle */}
      <p className="text-base sm:text-xl text-gray-300 font-normal leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10">
        {t.hero.sub}
      </p>

      {/* 1) Dual CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto mb-10 sm:mb-12">
        {/* CTA Primario: Buy the Kit — 29 USDT */}
        <button
          type="button"
          onClick={() => {
            const pricingElem = document.getElementById('pricing-block');
            if (pricingElem) {
              pricingElem.scrollIntoView({ behavior: 'smooth' });
            } else {
              onBuyNow('wallet');
            }
          }}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-[#FFB800] hover:bg-[#FFC107] text-black font-black text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-200 shadow-xl shadow-[#FFB800]/20 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
          aria-label={t.hero.ctaPrimary}
        >
          <ShoppingCart className="w-5 h-5 text-black" />
          <span>{t.hero.ctaPrimary}</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>

        {/* CTA Secundario: Try interactive demo */}
        <button
          type="button"
          onClick={onTryDemo}
          className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
          aria-label={t.hero.ctaSecondary}
        >
          <Play className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
          <span>{t.hero.ctaSecondary}</span>
        </button>
      </div>

      {/* Proof & Guarantee Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto text-left">
        <div className="bg-[#111111] border border-white/5 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#00C853]/10 flex items-center justify-center text-[#00C853] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-white block">0% Fees</span>
            <span className="text-[10px] text-gray-400">Zero Cut Forever</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FFB800]/10 flex items-center justify-center text-[#FFB800] shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-white block">Direct P2P</span>
            <span className="text-[10px] text-gray-400">Direct to Wallet</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-white block">BSC (BEP-20)</span>
            <span className="text-[10px] text-gray-400">~$0.02 Micro Gas</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-white block">$0/mo Free Tier</span>
            <span className="text-[10px] text-gray-400">Cloudflare Workers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

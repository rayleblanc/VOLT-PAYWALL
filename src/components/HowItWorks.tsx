import React from 'react';
import { CloudLightning, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="w-full py-10 sm:py-16 bg-[#080808]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
            <CloudLightning className="w-3.5 h-3.5" />
            <span>{t.howItWorks.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {t.howItWorks.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            {t.howItWorks.subheading}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative">
          {/* Step 1 */}
          <div className="bg-[#111111] border border-white/10 hover:border-[#FFB800]/30 rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20">
                  {t.howItWorks.step1Badge}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFB800]">
                  <CloudLightning className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t.howItWorks.step1Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
              <span>Free Tier: 100,000 req/day</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111111] border border-white/10 hover:border-[#00C853]/30 rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">
                  {t.howItWorks.step2Badge}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00C853]">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t.howItWorks.step2Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
              <span>0% Platform Custody · 100% P2P</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111111] border border-white/10 hover:border-cyan-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {t.howItWorks.step3Badge}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t.howItWorks.step3Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Fast finality: ~3 seconds on BSC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

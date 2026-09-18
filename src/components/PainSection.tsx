import React from 'react';
import { Percent, Clock, AlertOctagon, Layers, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const PainSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="pain-points" className="w-full py-10 sm:py-16 border-t border-white/5 bg-[#090909]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t.pain.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {t.pain.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            {t.pain.subheading}
          </p>
        </div>

        {/* 4 Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: 10% Cut */}
          <div className="bg-[#121212] border border-white/10 hover:border-rose-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t.pain.card1Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t.pain.card1Desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400/90 font-bold">Gumroad 10% · Lemon 5%</span>
              <span className="text-gray-400">VOLT = 0%</span>
            </div>
          </div>

          {/* Card 2: 90-Day Holds */}
          <div className="bg-[#121212] border border-white/10 hover:border-rose-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t.pain.card2Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t.pain.card2Desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400/90 font-bold">10% Rolling Reserve</span>
              <span className="text-gray-400">VOLT = Instant P2P</span>
            </div>
          </div>

          {/* Card 3: Stripe Denials & Chargebacks */}
          <div className="bg-[#121212] border border-white/10 hover:border-rose-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t.pain.card3Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t.pain.card3Desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400/90 font-bold">$15 Chargeback Fee</span>
              <span className="text-gray-400">VOLT = Final on-chain</span>
            </div>
          </div>

          {/* Card 4: Tired of another Crypto SaaS */}
          <div className="bg-[#121212] border border-white/10 hover:border-rose-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t.pain.card4Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t.pain.card4Desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400/90 font-bold">$29 - $99/mo SaaS</span>
              <span className="text-gray-400">VOLT = One-Time Code</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

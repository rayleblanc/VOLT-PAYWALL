import React from 'react';
import { Layers, Clock, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PRODUCTS_CATALOG } from '../config';

export const FutureCatalogSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isSpanish = language === 'ES';

  // Filter out the active product so only the future roadmap placeholders appear here
  const upcomingProducts = PRODUCTS_CATALOG.filter((p) => !p.active);

  return (
    <section className="w-full py-12 sm:py-16 border-t border-white/5 bg-[#0a0a0a]" id="catalog-roadmap">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.catalog?.badge || 'FUTURE ROADMAP'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {t.catalog?.title || 'More from VOLT — coming next'}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-medium">
            {t.catalog?.startsCopy || 'VOLT starts with self-hosted USDT checkout. More tools coming.'}
          </p>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {upcomingProducts.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-[#121212] border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all"
            >
              {/* Coming Soon Pill */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#222222] border border-white/10 text-gray-300 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>{t.catalog?.comingSoonTag || 'Coming soon'}</span>
                </div>
                <span className="text-xs font-mono text-gray-500">BSC · USDT</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Footer status (NO checkout) */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>Estimated: ~{item.price} USDT</span>
                <span className="text-gray-400 font-medium">
                  {isSpanish ? 'En desarrollo' : 'In active development'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Philosophy Footer Banner */}
        <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <p className="text-xs text-gray-400 font-mono">
            💡 {isSpanish
              ? 'Arquitectura modular Cloudflare Workers + BEP-20. Un solo producto activo a la vez para máxima estabilidad.'
              : 'Modular Cloudflare Workers + BEP-20 architecture. One active core product at a time for maximum stability.'}
          </p>
        </div>
      </div>
    </section>
  );
};

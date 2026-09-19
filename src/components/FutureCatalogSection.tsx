import React from 'react';
import { Layers, Clock, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Zap, Terminal } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PRODUCTS_CATALOG } from '../config';

interface FutureCatalogSectionProps {
  onSelectProduct?: (productId: string) => void;
}

export const FutureCatalogSection: React.FC<FutureCatalogSectionProps> = ({ onSelectProduct }) => {
  const { t, language } = useLanguage();
  const isSpanish = language === 'ES';

  const activeProducts = PRODUCTS_CATALOG.filter((p) => p.active);
  const roadmapProducts = PRODUCTS_CATALOG.filter((p) => !p.active);

  const handleSelect = (id: string) => {
    if (onSelectProduct) {
      onSelectProduct(id);
    }
    const pricingElem = document.getElementById('pricing-block');
    if (pricingElem) {
      pricingElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-12 sm:py-16 border-t border-white/5 bg-[#0a0a0a]" id="catalog-roadmap">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSpanish ? 'CATÁLOGO OFICIAL VOLT' : 'OFFICIAL VOLT CATALOG'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isSpanish ? 'Herramientas de Software VOLT' : 'More from the VOLT Ecosystem'}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-medium">
            {isSpanish
              ? 'Productos listos para producción y herramientas especializadas cobradas 100% en USDT (BEP-20).'
              : 'Production-ready software and developer tools settled 100% directly in USDT on BNB Smart Chain.'}
          </p>
        </div>

        {/* 1. Live Available Products */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
              {isSpanish ? 'Disponibles Ahora en la Tienda' : 'Active & Available Now'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {activeProducts.map((item) => {
              const isKit = item.id === 'creator-pack';
              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all ${
                    isKit
                      ? 'bg-[#121212] border-[#FFB800]/30 hover:border-[#FFB800]/60'
                      : 'bg-[#121212] border-cyan-500/30 hover:border-cyan-500/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isKit
                            ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30'
                            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {isKit ? <Zap className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                        <span>{item.deliveryMode === 'DRIVE_FILE' ? 'Source Code ZIP' : '5 AI Credits Key'}</span>
                      </span>
                      <span className="text-sm font-black font-mono text-white">
                        {item.price} USDT <span className="text-[10px] text-gray-400 font-normal">BEP-20</span>
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-1.5">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <div className="space-y-1.5 mb-6">
                      {item.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isKit
                        ? 'bg-[#FFB800] hover:bg-[#FFC107] text-black shadow-lg shadow-[#FFB800]/10'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/10'
                    }`}
                  >
                    <span>{isSpanish ? `Comprar ${item.name} (${item.price} USDT)` : `Select ${item.name} (${item.price} USDT)`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Upcoming Roadmap (No fake buy buttons) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
              {isSpanish ? 'Próximos Lanzamientos (Hoja de Ruta)' : 'Roadmap & Future Extensions'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {roadmapProducts.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 text-[11px] font-mono font-bold">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{isSpanish ? 'En Desarrollo' : 'In Development'}</span>
                    </span>
                    <span className="text-xs font-mono text-gray-500">~{item.price} USDT</span>
                  </div>

                  <h4 className="text-base font-bold text-gray-200 mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <span>BSC · BEP-20</span>
                  <span>{isSpanish ? 'Sin órdenes activas' : 'Not open for purchase'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <p className="text-xs text-gray-400 font-mono">
            {isSpanish
              ? '🔒 Seguridad garantizada: Solo los productos activos pueden ser ordenados. Todos los pagos se procesan en USDT BEP-20 directo a tu wallet.'
              : '🔒 Cryptographic assurance: Only active products accept orders. All checkouts settle directly via USDT (BEP-20) on BNB Smart Chain.'}
          </p>
        </div>
      </div>
    </section>
  );
};

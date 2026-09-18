import React from 'react';
import { Scale, Check, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const ComparisonSection: React.FC = () => {
  const { t } = useLanguage();

  const comparisons = [
    {
      feature: t.comparison.rowFee,
      gumroad: t.comparison.gumroadFee,
      lemon: t.comparison.lemonFee,
      volt: t.comparison.voltFee,
      voltHighlight: true,
    },
    {
      feature: t.comparison.rowCustody,
      gumroad: t.comparison.gumroadCustody,
      lemon: t.comparison.lemonCustody,
      volt: t.comparison.voltCustody,
      voltHighlight: true,
    },
    {
      feature: t.comparison.rowPayout,
      gumroad: t.comparison.gumroadPayout,
      lemon: t.comparison.lemonPayout,
      volt: t.comparison.voltPayout,
      voltHighlight: true,
    },
    {
      feature: t.comparison.rowChargebacks,
      gumroad: t.comparison.gumroadChargebacks,
      lemon: t.comparison.lemonChargebacks,
      volt: t.comparison.voltChargebacks,
      voltHighlight: true,
    },
    {
      feature: t.comparison.rowCost,
      gumroad: t.comparison.gumroadCost,
      lemon: t.comparison.lemonCost,
      volt: t.comparison.voltCost,
      voltHighlight: true,
    },
  ];

  return (
    <section id="comparison" className="w-full py-10 sm:py-16 bg-[#090909] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>{t.comparison.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {t.comparison.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            {t.comparison.subheading}
          </p>
        </div>

        {/* Mobile View: Vertical Comparison Cards (No Awkward Horizontal Scroll) */}
        <div className="block sm:hidden space-y-3">
          {comparisons.map((row, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {row.feature}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30 font-bold">
                  VOLT Paywall
                </span>
              </div>

              {/* VOLT Highlight Card */}
              <div className="p-2.5 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#FFB800] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
                  VOLT
                </span>
                <span className="text-xs font-mono font-black text-[#FFB800]">
                  {row.volt}
                </span>
              </div>

              {/* Competitors Row */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-400 pt-1">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase">Gumroad</div>
                  <div className="text-gray-300 font-semibold">{row.gumroad}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase">Lemon Squeezy</div>
                  <div className="text-gray-300 font-semibold">{row.lemon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop & Tablet View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="bg-[#111111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 text-xs sm:text-sm font-bold p-4 sm:p-5">
              <div className="col-span-3 text-gray-400 uppercase tracking-wider text-xs">
                {t.comparison.colFeature}
              </div>
              <div className="col-span-3 text-gray-400 text-center">
                {t.comparison.colGumroad}
              </div>
              <div className="col-span-3 text-gray-400 text-center">
                {t.comparison.colLemon}
              </div>
              <div className="col-span-3 text-[#FFB800] text-center font-black flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00C853]" />
                <span>{t.comparison.colVolt}</span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/5">
              {comparisons.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center p-4 sm:p-5 text-xs sm:text-sm hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-3 font-semibold text-white">
                    {row.feature}
                  </div>
                  <div className="col-span-3 text-center text-gray-400 px-2 font-mono text-xs">
                    {row.gumroad}
                  </div>
                  <div className="col-span-3 text-center text-gray-400 px-2 font-mono text-xs">
                    {row.lemon}
                  </div>
                  <div className="col-span-3 text-center font-bold px-2 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-xl text-[#FFB800] font-mono text-xs">
                    {row.volt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-[#FFB800]/10 to-transparent border border-emerald-500/20 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#00C853]/20 border border-[#00C853]/40 flex items-center justify-center text-[#00C853] shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">
                Zero revenue cuts, zero account freezes.
              </p>
              <p className="text-xs text-gray-400">
                You own 100% of the software and 100% of your customer relationships.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[#00C853]">
            100% Non-Custodial
          </div>
        </div>
      </div>
    </section>
  );
};

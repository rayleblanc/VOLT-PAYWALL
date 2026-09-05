import React from 'react';
import { ShieldCheck, Percent, Lock, Zap, Clock, Check, Globe2, Layers } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const WhyUsBento: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full max-w-5xl mx-auto mt-16 sm:mt-24 space-y-8" aria-label="Why Choose VOLT Paywall">
      {/* Header with SEO Semantic H2 */}
      <div className="text-center space-y-3 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>{t.whyUs.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.whyUs.heading}
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {t.whyUs.subheading}
        </p>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 sm:px-0">
        
        {/* Bento 1: 0% Comisiones (Large Card) */}
        <div className="md:col-span-2 bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-[#FFB800]/40 transition-all">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFB800]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FFB800]/10 transition-all" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
              <Percent className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFB800]">{t.whyUs.card1Sub}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {t.whyUs.card1Title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {t.whyUs.card1Desc}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
            <div className="bg-[#181818] p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">{t.whyUs.tradGatewaysFee}</span>
              <span className="text-sm font-bold text-rose-400 font-mono">{t.whyUs.stripeFeeVal}</span>
            </div>
            <div className="bg-[#FFB800]/10 p-3 rounded-2xl border border-[#FFB800]/30">
              <span className="text-[10px] text-[#FFB800] uppercase font-mono block font-bold">{t.whyUs.voltFee}</span>
              <span className="text-sm font-extrabold text-[#FFB800] font-mono">{t.whyUs.voltFeeVal}</span>
            </div>
          </div>
        </div>

        {/* Bento 2: Sin Custodia / Non-Custodial */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-[#00C853]/40 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853] mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {t.whyUs.card2Title}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t.whyUs.card2Desc}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#00C853] font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.whyUs.card2Foot}</span>
          </div>
        </div>

        {/* Bento 3: Verificación On-Chain Instantánea */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {t.whyUs.card3Title}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t.whyUs.card3Desc}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-400 font-mono">
            <Clock className="w-4 h-4" />
            <span>{t.whyUs.card3Foot}</span>
          </div>
        </div>

        {/* Bento 4: Integración en 2 minutos */}
        <div className="md:col-span-2 bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 group hover:border-amber-500/40 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t.whyUs.card4Title}
                </h3>
                <span className="text-xs text-gray-400 font-mono">{t.whyUs.card4Sub}</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full font-mono">
              Ready for Production
            </span>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {t.whyUs.card4Desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center gap-2 text-xs text-gray-300">
              <Check className="w-4 h-4 text-[#00C853] shrink-0" />
              <span>{t.whyUs.noKyc}</span>
            </div>
            <div className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center gap-2 text-xs text-gray-300">
              <Check className="w-4 h-4 text-[#00C853] shrink-0" />
              <span>{t.whyUs.walletQrSupport}</span>
            </div>
            <div className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center gap-2 text-xs text-gray-300">
              <Check className="w-4 h-4 text-[#00C853] shrink-0" />
              <span>{t.whyUs.globalBorderless}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Direct Comparison Table */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 overflow-hidden">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#FFB800]" />
            <span>{t.whyUs.tableHeading}</span>
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            {t.whyUs.tableSub}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-mono text-[11px] uppercase">
                <th className="pb-3 font-semibold">{t.whyUs.colFeature}</th>
                <th className="pb-3 font-semibold text-rose-400">{t.whyUs.colStripe}</th>
                <th className="pb-3 font-semibold text-amber-400">{t.whyUs.colCryptoCentralized}</th>
                <th className="pb-3 font-semibold text-[#FFB800] bg-[#FFB800]/5 px-3 py-1 rounded-t-xl">{t.whyUs.colVolt}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
              <tr>
                <td className="py-3.5 font-bold text-white">{t.whyUs.rowFee}</td>
                <td className="py-3.5 text-rose-300">{t.whyUs.stripeFeeVal}</td>
                <td className="py-3.5 text-amber-300">{t.whyUs.cryptoFeeVal}</td>
                <td className="py-3.5 text-[#FFB800] font-extrabold bg-[#FFB800]/5 px-3 font-mono">{t.whyUs.voltFeeVal}</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">{t.whyUs.rowCustody}</td>
                <td className="py-3.5 text-gray-400">{t.whyUs.stripeCustodyVal}</td>
                <td className="py-3.5 text-gray-400">{t.whyUs.cryptoCustodyVal}</td>
                <td className="py-3.5 text-[#00C853] font-bold bg-[#FFB800]/5 px-3">{t.whyUs.voltCustodyVal}</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">{t.whyUs.rowPayout}</td>
                <td className="py-3.5 text-gray-400">{t.whyUs.stripePayoutVal}</td>
                <td className="py-3.5 text-gray-400">{t.whyUs.cryptoPayoutVal}</td>
                <td className="py-3.5 text-[#00C853] font-bold bg-[#FFB800]/5 px-3">{t.whyUs.voltPayoutVal}</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">{t.whyUs.rowChargebacks}</td>
                <td className="py-3.5 text-rose-400">{t.whyUs.stripeChargebackVal}</td>
                <td className="py-3.5 text-gray-400">{t.whyUs.cryptoChargebackVal}</td>
                <td className="py-3.5 text-[#00C853] font-bold bg-[#FFB800]/5 px-3">{t.whyUs.voltChargebackVal}</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">{t.whyUs.rowKyc}</td>
                <td className="py-3.5 text-gray-400">{t.whyUs.stripeKycVal}</td>
                <td className="py-3.5 text-gray-400">{t.whyUs.cryptoKycVal}</td>
                <td className="py-3.5 text-[#FFB800] font-bold bg-[#FFB800]/5 px-3">{t.whyUs.voltKycVal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};


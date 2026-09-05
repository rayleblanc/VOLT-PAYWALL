import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, AlertCircle, Loader2, Check, Wallet, Smartphone, Zap } from 'lucide-react';
import { PRODUCT_INFO } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

interface ProductCardProps {
  onBuyNow: (paymentMode: 'wallet' | 'manual') => void;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  onBuyNow,
  isLoading,
  error,
  onRetry,
}) => {
  const [paymentMode, setPaymentMode] = useState<'wallet' | 'manual'>('wallet');
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-xl mx-auto bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative subtle background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand & Network Pill */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] font-bold text-[#FFB800]">
            {t.product.paywallTag}
          </span>
          <span className="text-[9px] sm:text-[10px] bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] font-mono px-2 py-0.5 rounded-full font-bold">
            {t.product.noFeesTag}
          </span>
        </div>
        <div className="bg-[#181818] border border-white/5 px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
          <span>{t.product.nonCustodialTag}</span>
        </div>
      </div>

      {/* Title & Tagline */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-2 sm:mb-3 whitespace-pre-line">
          {t.product.title}
        </h1>
        <h2 className="text-[#FFB800] text-xs sm:text-sm font-bold mb-2.5 flex flex-wrap items-center gap-1.5">
          <span>{t.product.tagline}</span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          {t.product.description}
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-3 my-6 sm:my-8">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{t.product.feature1}</span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{t.product.feature2}</span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{t.product.feature3}</span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{t.product.feature4}</span>
        </div>
      </div>

      {/* Price & Urgency Anchor Block */}
      <div className="pt-5 sm:pt-6 border-t border-white/5 mb-6 sm:mb-8">
        {/* Ethical Urgency Banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-full text-[10px] sm:text-xs font-bold text-[#FFB800] mb-3">
          <Zap className="w-3.5 h-3.5 fill-[#FFB800]" />
          <span>{t.product.urgencyBadge}</span>
        </div>

        <span className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1">
          {t.product.totalPrice}
        </span>

        <div className="flex items-baseline gap-2.5 flex-wrap">
          {/* Strikethrough Original Price */}
          <span className="text-lg sm:text-2xl font-bold text-gray-500 line-through font-mono decoration-rose-500/80 decoration-2">
            {t.product.originalPrice}
          </span>

          {/* Offer Price */}
          <span className="text-3xl sm:text-5xl font-black text-[#FFB800] font-mono tracking-tight">
            {PRODUCT_INFO.basePrice}.00
          </span>
          <span className="text-lg sm:text-xl text-gray-300 font-extrabold">USDT</span>

          {/* Discount Tag */}
          <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
            {t.product.discountBadge}
          </span>
        </div>

        {/* Network Selection Pill */}
        <div className="mt-3 flex items-center justify-between text-[10px] sm:text-xs text-gray-400 bg-[#161616] border border-white/5 p-2 rounded-xl">
          <span className="font-mono text-gray-400">Payment Network:</span>
          <span className="font-mono text-[#00C853] font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            BNB Smart Chain (BEP-20)
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-start justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-rose-300">{error}</p>
              <p className="text-[11px] text-rose-400/80 mt-0.5">{t.product.connectionError}</p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer"
            >
              {t.product.retry}
            </button>
          )}
        </div>
      )}

      {/* Payment Mode Selector */}
      <div className="pt-5 sm:pt-6 border-t border-white/5 mb-6 space-y-3">
        <span className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">
          {t.product.paymentMethod}
        </span>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-[#181818] p-1 rounded-xl sm:rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setPaymentMode('wallet')}
            className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              paymentMode === 'wallet'
                ? 'bg-white text-black shadow-lg font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t.product.payWithWallet}</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('manual')}
            className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              paymentMode === 'manual'
                ? 'bg-white text-black shadow-lg font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t.product.manualPayment}</span>
          </button>
        </div>
        <p className="text-[10px] sm:text-[11px] text-gray-500 leading-normal font-medium text-center">
          {paymentMode === 'wallet' ? t.product.walletMethodSub : t.product.manualMethodSub}
        </p>
      </div>

      {/* Buy Button */}
      <div className="space-y-3">
        <button
          onClick={() => onBuyNow(paymentMode)}
          disabled={isLoading}
          aria-label="Proceed to payment"
          className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all duration-200 shadow-xl flex items-center justify-center space-x-2 cursor-pointer ${
            isLoading
              ? 'bg-[#FFB800]/60 text-black cursor-not-allowed opacity-80'
              : 'bg-[#FFB800] hover:bg-[#FFC107] text-black active:scale-[0.99] shadow-[#FFB800]/20'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-black" />
              <span>{t.product.creatingOrder}</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <span>{paymentMode === 'wallet' ? t.product.buyNowWallet : t.product.buyNowManual}</span>
            </>
          )}
        </button>

        <p className="text-center text-[10px] sm:text-xs text-gray-500 font-medium">
          {t.product.secureNotice}
        </p>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
  Wallet,
  Smartphone,
  Zap,
  Play,
  Sparkles,
  Package,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { getCatalogItemById, PUBLIC_FIXER_URL } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

interface ProductCardProps {
  selectedProductId?: string;
  onSelectProduct?: (productId: string) => void;
  onBuyNow: (paymentMode: 'wallet' | 'manual', productId?: string) => void;
  onTryDemo?: () => void;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  selectedProductId = 'creator-pack',
  onSelectProduct,
  onBuyNow,
  onTryDemo,
  isLoading,
  error,
  onRetry,
}) => {
  const [internalProductId, setInternalProductId] = useState<string>(selectedProductId);
  const [paymentMode, setPaymentMode] = useState<'wallet' | 'manual'>('wallet');
  const { t, language } = useLanguage();
  const isSpanish = language === 'ES';

  const activeProductId = selectedProductId || internalProductId;
  const currentProduct = getCatalogItemById(activeProductId);

  const handleProductChange = (id: string) => {
    setInternalProductId(id);
    if (onSelectProduct) {
      onSelectProduct(id);
    }
  };

  const isKit = activeProductId === 'creator-pack';

  return (
    <div
      id="pricing-block"
      className="w-full max-w-xl mx-auto bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-9 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Kit Banner (Shown only when viewing secondary product Vibe Error Fixer) */}
      {!isKit && (
        <button
          type="button"
          onClick={() => handleProductChange('creator-pack')}
          className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>
            {isSpanish
              ? '← Volver al VOLT Commercial Kit (29 USDT)'
              : '← Back to VOLT Commercial Kit (29 USDT)'}
          </span>
        </button>
      )}

      {/* Badge Founding / launch */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-full text-[11px] sm:text-xs font-mono font-bold text-[#FFB800]">
          <Zap className="w-3.5 h-3.5 fill-[#FFB800]" />
          <span>{isKit ? 'Founding / launch · 29 USDT' : 'AI Debug Tool · 9 USDT'}</span>
        </div>
        <div className="bg-[#181818] border border-white/5 px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
          <span>{t.product.nonCustodialTag}</span>
        </div>
      </div>

      {/* Product Title & Tagline */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-3xl font-black text-white leading-tight mb-2">
          {isKit ? t.product.title : currentProduct.name}
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          {isKit ? t.product.description : currentProduct.description}
        </p>
      </div>

      {/* Price Box */}
      <div className="p-4 sm:p-5 bg-black/40 border border-white/10 rounded-2xl mb-6">
        <div className="flex items-baseline gap-2.5 flex-wrap mb-2">
          {/* Strikethrough Original Price */}
          <span className="text-lg sm:text-2xl font-bold text-gray-500 line-through font-mono decoration-rose-500/80 decoration-2">
            {isKit ? t.product.originalPrice : '$25.00 USD'}
          </span>

          {/* Offer Price */}
          <span className="text-3xl sm:text-5xl font-black text-[#FFB800] font-mono tracking-tight">
            {currentProduct.price}.00
          </span>
          <span className="text-lg sm:text-xl text-gray-200 font-extrabold">USDT</span>

          <span className="text-xs font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">
            {isKit ? 'one-time' : '5 credits'}
          </span>
        </div>

        {/* Mandatory Text: Direct BSC payment. No VOLT per-sale fee. */}
        <p className="text-xs sm:text-sm font-bold text-[#00C853] flex items-center gap-1.5 font-mono">
          <Check className="w-4 h-4 text-[#00C853]" />
          <span>{t.product.directBscText}</span>
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-gray-300">
        {isKit ? (
          <>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>{t.product.feature1}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>{t.product.feature2}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>{t.product.feature3}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>{t.product.feature4}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>
                {isSpanish
                  ? '5 diagnósticos y soluciones de errores en código/logs con IA'
                  : '5 comprehensive AI-powered build & runtime error diagnoses'}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>
                {isSpanish
                  ? 'Clave criptográfica privada de acceso válida por 30 días'
                  : 'Private cryptographic access pass valid for 30 days'}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>
                {isSpanish
                  ? 'Sin suscripciones mensuales recurrentes obligatorias'
                  : 'No forced monthly recurring subscriptions or commitments'}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>
                {isSpanish
                  ? 'Entrega digital instantánea verificada en BNB Chain'
                  : 'Instant digital key provisioning verified on BNB Chain'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-start justify-between gap-3 text-xs sm:text-sm">
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
      <div className="pt-4 border-t border-white/5 mb-5 space-y-2.5">
        <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">
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
        <p className="text-[10px] sm:text-[11px] text-gray-400 leading-normal font-medium text-center">
          {paymentMode === 'wallet' ? t.product.walletMethodSub : t.product.manualMethodSub}
        </p>
      </div>

      {/* Buy Button & Secondary Demo Trigger */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onBuyNow(paymentMode, activeProductId)}
          disabled={isLoading}
          aria-label={t.hero.ctaPrimary}
          className={`w-full py-4 px-5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all duration-200 shadow-xl flex items-center justify-center space-x-2 cursor-pointer ${
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
              <span>
                {isKit
                  ? isSpanish
                    ? 'Comprar Commercial Kit — 29 USDT'
                    : 'Buy Commercial Kit — 29 USDT'
                  : isSpanish
                  ? 'Comprar Créditos Fixer — 9 USDT'
                  : 'Buy Fixer Credits — 9 USDT'}
              </span>
            </>
          )}
        </button>

        {onTryDemo && isKit && (
          <button
            type="button"
            onClick={onTryDemo}
            className="w-full py-3 px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" />
            <span>{t.hero.ctaSecondary}</span>
          </button>
        )}

        {!isKit && (
          <div className="pt-2 text-center">
            <a
              href={PUBLIC_FIXER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono"
            >
              <span>{isSpanish ? 'Abrir herramienta Vibe Error Fixer' : 'Open the Fixer tool'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <p className="text-center text-[10px] sm:text-xs text-gray-400 font-medium pt-1">
          {t.product.secureNotice}
        </p>
      </div>

      {/* DISCREET SECONDARY BLOCK: Vibe Error Fixer Upsell (Shown when Kit is active) */}
      {isKit && (
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 bg-[#161616] p-4 sm:p-4.5 rounded-2xl border border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {isSpanish ? 'Herramienta Secundaria' : 'Secondary Utility'}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white">Vibe Error Fixer</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {isSpanish
                ? 'Créditos de diagnóstico IA para errores en apps generadas por IA — 9 USDT (5 análisis)'
                : 'AI debug credits for AI-generated app errors — 9 USDT (5 analyses)'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <a
              href={PUBLIC_FIXER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-gray-400 hover:text-cyan-400 underline transition-colors"
            >
              {isSpanish ? 'Abrir herramienta' : 'Open Fixer tool'}
            </a>
            <button
              type="button"
              onClick={() => handleProductChange('vibe-error-fixer')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isSpanish ? 'Obtener créditos' : 'Get Fixer credits'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

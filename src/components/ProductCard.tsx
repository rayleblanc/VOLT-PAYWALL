import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, AlertCircle, Loader2, Check, Wallet, Smartphone } from 'lucide-react';
import { PRODUCT_INFO } from '../config';

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
  return (
    <div className="w-full max-w-xl mx-auto bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative subtle background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand & Network Pill */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#FFB800]">VOLT PAYWALL</span>
        </div>
        <div className="bg-[#181818] border border-white/5 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
          <span>Digital Delivery</span>
        </div>
      </div>

      {/* Title & Tagline */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
          All-in-One<br />Creator Pack
        </h1>
        <p className="text-[#FFB800] text-sm font-semibold mb-3">
          "{PRODUCT_INFO.tagline}"
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          {PRODUCT_INFO.description}
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-3.5 my-8">
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Código fuente completo (100% editable)</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Guía paso a paso en PDF</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Licencia comercial ilimitada</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-300">
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#FFB800] text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Entrega digital inmediata</span>
        </div>
      </div>

      {/* Price Block */}
      <div className="pt-6 border-t border-white/5 mb-8">
        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">PRECIO TOTAL</span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-extrabold text-[#FFB800] font-mono tracking-tight">
            {PRODUCT_INFO.basePrice}.00
          </span>
          <span className="text-xl text-gray-400 font-bold">USDT</span>
          <span className="text-xs text-gray-500 ml-auto font-mono">BNB Smart Chain</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-start justify-between gap-3 text-sm">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-rose-300">{error}</p>
              <p className="text-xs text-rose-400/80 mt-0.5">Por favor reintenta la creación de la orden.</p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Payment Mode Selector */}
      <div className="pt-6 border-t border-white/5 mb-6 space-y-3">
        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block">MÉTODO DE PAGO</span>
        <div className="grid grid-cols-2 gap-3 bg-[#181818] p-1.5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setPaymentMode('wallet')}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              paymentMode === 'wallet'
                ? 'bg-white text-black shadow-lg font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Pagar con Wallet</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('manual')}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              paymentMode === 'manual'
                ? 'bg-white text-black shadow-lg font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pago Manual / QR</span>
          </button>
        </div>
        <p className="text-[11px] text-gray-500 leading-normal font-medium text-center">
          {paymentMode === 'wallet'
            ? 'Transferencia exacta de 39.00 USDT vía MetaMask o Trust Wallet (BSC Testnet).'
            : 'Transferencia con decimales de control únicos para verificación automática sin conectar wallet.'}
        </p>
      </div>

      {/* Buy Button */}
      <div className="space-y-3">
        <button
          onClick={() => onBuyNow(paymentMode)}
          disabled={isLoading}
          aria-label="Comprar ahora All-in-One Creator Pack"
          className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all duration-200 shadow-xl flex items-center justify-center space-x-2 cursor-pointer ${
            isLoading
              ? 'bg-[#FFB800]/60 text-black cursor-not-allowed opacity-80'
              : 'bg-[#FFB800] hover:bg-[#FFC107] text-black active:scale-[0.99] shadow-[#FFB800]/20'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-black" />
              <span>Creando orden...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 text-black" />
              <span>{paymentMode === 'wallet' ? 'Proceder con Wallet' : 'Proceder con Pago Manual'}</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 font-medium">
          Pago seguro verificado directamente en BNB Smart Chain Testnet
        </p>
      </div>
    </div>
  );
};

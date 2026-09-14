import React, { useState } from 'react';
import { CheckCircle2, Download, Copy, Check, FileCode, ShieldCheck, Clock, HelpCircle, Mail, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface PaidCardProps {
  order: Order;
  onDownloadClick: () => void;
}

export const PaidCard: React.FC<PaidCardProps> = ({ order, onDownloadClick }) => {
  const { t, language } = useLanguage();
  const [copiedTx, setCopiedTx] = useState(false);
  const isLate = order.status === 'PAID_LATE';
  const isSpanish = language === 'ES';

  const handleCopyTx = async () => {
    if (!order.txHash) return;
    try {
      await navigator.clipboard.writeText(order.txHash);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2500);
    } catch {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2500);
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto bg-[#111111] border ${
      isLate ? 'border-amber-500/40' : 'border-[#00C853]/30'
    } rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6`}>
      {/* Decorative Glow */}
      <div className={`absolute -top-24 -right-24 w-60 h-60 ${
        isLate ? 'bg-amber-500/10' : 'bg-[#00C853]/10'
      } rounded-full blur-3xl pointer-events-none`} />

      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border text-center space-y-3 ${
        isLate
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-[#00C853]/10 border-[#00C853]/30'
      }`}>
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-black shadow-lg ${
          isLate
            ? 'bg-[#FFB800] shadow-[0_0_25px_rgba(255,184,0,0.3)]'
            : 'bg-[#00C853] shadow-[0_0_25px_rgba(0,200,83,0.3)]'
        }`}>
          {isLate ? (
            <Clock className="w-9 h-9 text-black" />
          ) : (
            <CheckCircle2 className="w-9 h-9 text-black" />
          )}
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono ${
              isLate
                ? 'bg-[#FFB800] text-black'
                : 'bg-[#00C853] text-black'
            }`}>
              {isLate ? t.paid.latePaymentConfirmed : t.paid.paymentConfirmed}
            </span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isLate ? 'text-[#FFB800]' : 'text-[#00C853]'
          }`}>
            {isLate ? t.paid.latePaymentConfirmed : t.paid.paymentConfirmed}
          </h2>
          <p className="text-sm text-gray-300 mt-1 font-medium leading-relaxed">
            {t.paid.orderCompleted}
          </p>
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-[#181818] rounded-2xl p-5 border border-white/5 space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5 text-sm">
          <span className="text-gray-400 font-medium">{t.checkout.orderId}</span>
          <span className="font-bold text-white font-mono">{order.orderId}</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-white/5 text-sm">
          <span className="text-gray-400 font-medium">{t.checkout.amountToPay}</span>
          <span className="font-bold font-mono text-[#FFB800] text-base">
            {order.amount} USDT
          </span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-white/5 text-sm">
          <span className="text-gray-400 font-medium">Status</span>
          <span className={`font-mono font-bold text-xs ${isLate ? 'text-amber-400' : 'text-[#00C853]'}`}>
            {isLate ? 'PAID_LATE (Granted)' : 'PAID (On-Chain Confirmed)'}
          </span>
        </div>

        {/* Tx Hash */}
        {order.txHash && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              {t.paid.txHashLabel}:
            </span>
            <div className="p-3 bg-[#111111] rounded-xl border border-white/10 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-300 truncate">
                {order.txHash}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`https://bscscan.com/tx/${order.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 px-2.5 rounded-lg text-xs font-mono font-bold bg-[#222222] hover:bg-[#333333] text-[#FFB800] transition-colors inline-flex items-center gap-1"
                  title="Ver en BscScan"
                >
                  <span>BscScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={handleCopyTx}
                  aria-label="Copy Tx Hash"
                  className="p-1.5 rounded-lg text-xs font-medium bg-[#222222] hover:bg-[#333333] text-gray-200 transition-colors cursor-pointer"
                  title="Copy Hash"
                >
                  {copiedTx ? (
                    <Check className="w-3.5 h-3.5 text-[#00C853]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Access Badge */}
      <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-center justify-center text-[#FFB800] shrink-0">
          <FileCode className="w-5 h-5" />
        </div>
        <div className="text-xs text-gray-300">
          <span className="font-bold text-white block">VOLT Paywall V1 Commercial Package</span>
          <span>Full Source Code + PDF Owner Guides + Commercial License</span>
        </div>
      </div>

      {/* PAID_LATE Support Box */}
      {isLate && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Late Payment Support</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Your payment was registered as <span className="font-mono font-bold text-white">PAID_LATE</span>. Your access is fully unlocked.
          </p>
        </div>
      )}

      {/* Download Action */}
      <div className="space-y-3">
        <button
          onClick={onDownloadClick}
          aria-label={t.paid.downloadProduct}
          className="w-full py-4 px-6 rounded-2xl font-black text-base bg-[#00C853] hover:bg-[#00e65c] text-black transition-all duration-200 shadow-xl shadow-[#00C853]/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
        >
          <Download className="w-5 h-5" />
          <span>{t.paid.downloadProduct}</span>
        </button>

        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
          <span>{isSpanish ? 'Entrega digital instantánea verificada on-chain' : 'Instant digital delivery verified on-chain'}</span>
        </p>
      </div>
    </div>
  );
};


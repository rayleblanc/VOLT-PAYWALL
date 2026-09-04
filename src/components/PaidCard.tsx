import React, { useState } from 'react';
import { CheckCircle2, Download, Copy, Check, FileCode, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface PaidCardProps {
  order: Order;
  onDownloadClick: () => void;
}

export const PaidCard: React.FC<PaidCardProps> = ({ order, onDownloadClick }) => {
  const [copiedTx, setCopiedTx] = useState(false);

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
    <div className="w-full max-w-xl mx-auto bg-[#111111] border border-[#00C853]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#00C853]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/30 text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00C853] flex items-center justify-center text-black shadow-[0_0_25px_rgba(0,200,83,0.3)]">
          <CheckCircle2 className="w-9 h-9 text-black" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00C853] tracking-tight">
            ¡Pago confirmado!
          </h2>
          <p className="text-sm text-gray-300 mt-1 font-medium">
            Tu pago fue verificado correctamente en la red.
          </p>
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-[#181818] rounded-2xl p-5 border border-white/5 space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5 text-sm">
          <span className="text-gray-400 font-medium">Producto</span>
          <span className="font-bold text-white">{order.productName}</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-white/5 text-sm">
          <span className="text-gray-400 font-medium">Monto recibido</span>
          <span className="font-bold font-mono text-[#FFB800] text-base">
            {order.amount} USDT
          </span>
        </div>

        {/* Tx Hash */}
        {order.txHash && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              TRANSACCIÓN:
            </span>
            <div className="p-3 bg-[#111111] rounded-xl border border-white/10 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-300 truncate">
                {order.txHash}
              </span>
              <button
                onClick={handleCopyTx}
                aria-label="Copiar hash de transacción"
                className="p-1.5 rounded-lg text-xs font-medium bg-[#222222] hover:bg-[#333333] text-gray-200 transition-colors cursor-pointer shrink-0"
                title="Copiar hash"
              >
                {copiedTx ? (
                  <Check className="w-3.5 h-3.5 text-[#00C853]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
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
          <span className="font-bold text-white block">Acceso al Creator Pack</span>
          <span>Código completo + guía PDF + licencia comercial</span>
        </div>
      </div>

      {/* Download Action */}
      <div className="space-y-3">
        <button
          onClick={onDownloadClick}
          aria-label="Descargar Creator Pack"
          className="w-full py-4 px-6 rounded-2xl font-black text-base bg-[#00C853] hover:bg-[#00e65c] text-black transition-all duration-200 shadow-xl shadow-[#00C853]/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
        >
          <Download className="w-5 h-5" />
          <span>Descargar Creator Pack</span>
        </button>

        <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
          <span>Transacción verificada en BNB Smart Chain</span>
        </p>
      </div>
    </div>
  );
};

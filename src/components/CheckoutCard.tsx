import React, { useState } from 'react';
import { Copy, Check, Clock, Sparkles, ShieldCheck, Loader2, AlertTriangle, Send, Wallet } from 'lucide-react';
import { Order } from '../types';
import { QRCodeView } from './QRCodeView';
import { WalletCard } from './WalletCard';
import { APP_MODE, BSC_TESTNET_USDT_CONTRACT } from '../config';
import { sendUsdtTransfer } from '../services/walletService';
import { useWallet } from '../hooks/useWallet';

interface CheckoutCardProps {
  order: Order;
  timeRemainingSeconds: number;
  onSimulatePayment: () => void;
  isSimulating: boolean;
  onWalletPaymentSent?: (txHash: string) => void;
}

export const CheckoutCard: React.FC<CheckoutCardProps> = ({
  order,
  timeRemainingSeconds,
  onSimulatePayment,
  isSimulating,
  onWalletPaymentSent,
}) => {
  const { walletState, connect, switchNetwork } = useWallet();
  const [copied, setCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleExecuteWalletPayment = async () => {
    if (isPaying) return;
    setPaymentError(null);

    // 1. Ensure wallet is connected
    if (walletState.status === 'disconnected') {
      try {
        await connect();
      } catch (err: any) {
        setPaymentError(err.message || 'Error al conectar la wallet.');
      }
      return;
    }

    // 2. Ensure network is correct (BSC Testnet, Chain ID 97)
    if (walletState.status === 'wrong_network') {
      try {
        await switchNetwork();
      } catch (err: any) {
        setPaymentError(err.message || 'Error al cambiar la red.');
      }
      return;
    }

    if (walletState.status !== 'connected' || !walletState.account) {
      setPaymentError('Por favor conecta tu wallet para realizar el pago.');
      return;
    }

    // 3. Initiate payment
    setIsPaying(true);
    try {
      const txHash = await sendUsdtTransfer({
        recipient: order.recipientAddress,
        expectedUnits: order.expectedUnits || '39000000000000000000',
        tokenContract: BSC_TESTNET_USDT_CONTRACT,
        userAddress: walletState.account,
      });

      if (onWalletPaymentSent) {
        onWalletPaymentSent(txHash);
      }
    } catch (err: any) {
      console.error('Wallet transfer failed:', err);
      setPaymentError(err.message || 'La transferencia con la wallet falló o fue rechazada.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.recipientAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = order.recipientAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT MAIN BENTO CARD — High Contrast Payment Details */}
      <div className="lg:col-span-7 bg-white text-black rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-black/10">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold opacity-60 mb-1">
              Orden #{order.orderId}
            </p>
            <h2 className="text-2xl font-black tracking-tight text-black">
              Enviar Pago
            </h2>
          </div>
          <div className="bg-black/5 border border-black/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold tracking-tight text-black flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-black/70" />
            <span>{formatTime(timeRemainingSeconds)} RESTANTE</span>
          </div>
        </div>

        {/* Center Content — QR & Amount */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-2">
          {/* QR Code Container */}
          <div className="w-48 h-48 p-3 bg-white border-2 border-black/10 rounded-2xl flex items-center justify-center shadow-sm">
            <QRCodeView value={order.recipientAddress} size={160} />
          </div>

          {/* Exact Amount Display */}
          <div className="text-center">
            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">
              MONTO EXACTO A ENVIAR
            </p>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-black font-mono">
              {order.amount} <span className="text-2xl font-bold text-gray-700">USDT</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-[10px] font-bold bg-black/10 text-black px-2.5 py-0.5 rounded-full uppercase">
                BNB Smart Chain
              </span>
              <span className="text-[10px] font-bold bg-[#FFB800] text-black px-2.5 py-0.5 rounded-full uppercase">
                USDT
              </span>
            </div>
          </div>

          {/* Copy Address Row */}
          <div className="w-full space-y-2 mt-2">
            <div className="bg-black/5 rounded-2xl p-3.5 flex items-center justify-between gap-3 group hover:bg-black/10 transition-colors">
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                  DIRECCIÓN DE RECEPCIÓN
                </p>
                <p className="text-xs sm:text-sm font-mono font-bold truncate text-black">
                  {order.recipientAddress}
                </p>
              </div>
              <button
                onClick={handleCopy}
                aria-label="Copiar dirección de recepción"
                className={`p-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-[#00C853] text-white'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive EIP-1193 Wallet Direct Payment Button */}
          {order.paymentMode === 'wallet' && order.status === 'PENDING' && (
            <div className="w-full space-y-3 mt-4">
              <button
                type="button"
                onClick={handleExecuteWalletPayment}
                disabled={isPaying}
                className="w-full bg-black hover:bg-gray-800 text-white font-black text-sm py-4 px-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Confirmando firma en wallet...</span>
                  </>
                ) : walletState.status === 'disconnected' ? (
                  <>
                    <Wallet className="w-4 h-4 text-white" />
                    <span>Conectar Wallet para Pagar</span>
                  </>
                ) : walletState.status === 'wrong_network' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Cambiar Red a BSC Testnet</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#FFB800]" />
                    <span>Pagar {order.amount} USDT con Wallet</span>
                  </>
                )}
              </button>

              {paymentError && (
                <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE BENTO COLUMN — Status & Controls */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Status Bento Card */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 text-white">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            ESTADO DEL PAGO
          </h3>

          <div className="flex items-center gap-4 py-2">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-t-2 border-[#FFB800] animate-spin" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                {order.status === 'CONFIRMING'
                  ? 'Confirmando transacción...'
                  : 'Esperando pago...'}
              </p>
              <p className="text-xs text-gray-400">
                {order.status === 'CONFIRMING'
                  ? 'Verificando confirmaciones en BNB Smart Chain'
                  : 'Comprobando red BNB Smart Chain'}
              </p>
            </div>
          </div>

          {/* Simulation / Status Controls Box */}
          <div className="mt-2 p-4 bg-[#181818] rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#FFB800] uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{APP_MODE === 'demo' ? 'SIMULACIÓN' : 'WORKER BACKEND'}</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {APP_MODE === 'demo' ? 'Modo Demo' : APP_MODE === 'local' ? 'Worker Local' : 'Worker Prod'}
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {APP_MODE === 'demo'
                ? 'Haz clic para simular la detección del pago en la blockchain.'
                : 'Peticiones gestionadas por Cloudflare Worker local y D1 database.'}
            </p>

            {APP_MODE === 'demo' ? (
              <button
                onClick={onSimulatePayment}
                disabled={isSimulating}
                aria-label="Simular pago confirmado"
                className="w-full bg-[#FFB800] text-black py-3.5 rounded-xl text-xs font-bold hover:bg-[#FFC107] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Procesando simulación...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>SIMULAR PAGO CONFIRMADO</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 bg-white/5 rounded-xl text-center text-xs text-gray-400 font-mono">
                Simulación deshabilitada en modo Worker real.
              </div>
            )}
          </div>
        </div>

        {/* EIP-1193 Wallet Bento Card */}
        <WalletCard />

        {/* Details Bento Card */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 flex-1 text-white space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            DETALLES DE LA TRANSACCIÓN
          </h3>

          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">Activo Token</span>
              <span className="font-bold text-white font-mono">USDT Test Token (BSC Testnet)</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">Red de pago</span>
              <span className="font-bold text-white font-mono">BNB Smart Chain</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">Comisión estimada</span>
              <span className="font-bold text-gray-300 font-mono">~0.0002 BNB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Modo de orden</span>
              <span className="font-bold text-[#FFB800] font-mono text-xs">
                {APP_MODE === 'demo' ? 'Simulación Demo' : APP_MODE === 'local' ? 'Worker Local' : 'Worker Prod'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

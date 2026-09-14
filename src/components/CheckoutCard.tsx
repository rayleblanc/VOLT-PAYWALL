import React, { useState } from 'react';
import { Copy, Check, Clock, Sparkles, ShieldCheck, Loader2, AlertTriangle, Send, Wallet, RefreshCw, RotateCcw, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';
import { QRCodeView } from './QRCodeView';
import { WalletCard } from './WalletCard';
import { APP_MODE, BSC_USDT_CONTRACT, BSC_MAINNET_USDT_CONTRACT } from '../config';
import { sendUsdtTransfer } from '../services/walletService';
import { useWallet } from '../hooks/useWallet';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleExecuteWalletPayment = async () => {
    if (isPaying || timeRemainingSeconds <= 0) return;
    setPaymentError(null);

    // 1. Ensure wallet is connected
    if (walletState.status === 'disconnected') {
      try {
        await connect();
      } catch (err: any) {
        setPaymentError(err.message || 'Error connecting wallet.');
      }
      return;
    }

    // 2. Ensure network is correct (BSC Mainnet, Chain ID 56)
    if (walletState.status === 'wrong_network') {
      try {
        await switchNetwork();
      } catch (err: any) {
        setPaymentError(err.message || 'Error switching network.');
      }
      return;
    }

    if (walletState.status !== 'connected' || !walletState.account) {
      setPaymentError('Please connect your wallet to process payment.');
      return;
    }

    // 3. Initiate payment
    setIsPaying(true);
    try {
      const targetContract = order.chainId === 56 ? BSC_MAINNET_USDT_CONTRACT : BSC_USDT_CONTRACT;
      const txHash = await sendUsdtTransfer({
        recipient: order.recipientAddress,
        expectedUnits: order.expectedUnits || '29000000000000000000',
        tokenContract: targetContract,
        userAddress: walletState.account,
      });

      if (onWalletPaymentSent) {
        onWalletPaymentSent(txHash);
      }
    } catch (err: any) {
      console.error('Wallet transfer failed:', err);
      const errMsg = err.message || '';
      if (errMsg.includes('rejected') || errMsg.includes('4001') || errMsg.includes('cancelada')) {
        setPaymentError('Transaction signature cancelled by user in wallet.');
      } else if (errMsg.includes('gas') || errMsg.includes('funds')) {
        setPaymentError('Insufficient BNB balance for gas fees on BNB Smart Chain.');
      } else {
        setPaymentError(errMsg || 'Web3 transfer failed or rejected.');
      }
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

  const isExpired = timeRemainingSeconds <= 0 || order.status === 'EXPIRED';

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      {/* LEFT MAIN BENTO CARD — High Contrast Payment Details */}
      <div className="lg:col-span-7 bg-white text-black rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-5 sm:space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap justify-between items-start gap-2 pb-3.5 sm:pb-4 border-b border-black/10">
          <div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold opacity-60 mb-0.5 sm:mb-1">
              {t.checkout.orderId} #{order.orderId}
            </p>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black">
              {t.checkout.activeOrder}
            </h2>
          </div>
          <div className={`border rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-mono font-bold tracking-tight flex items-center gap-1.5 ${
            isExpired
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : timeRemainingSeconds < 180
              ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
              : 'bg-black/5 border-black/10 text-black'
          }`}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{formatTime(timeRemainingSeconds)} {isExpired ? 'EXPIRED' : t.checkout.timeRemaining}</span>
          </div>
        </div>

        {/* Network & Wallet Status Banner */}
        {walletState.status === 'wrong_network' && (
          <div className="p-3.5 sm:p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black block">Wrong Network in Wallet</span>
                <span className="text-gray-700">Please switch your wallet to BNB Smart Chain Mainnet (Chain ID 56).</span>
              </div>
            </div>
            <button
              type="button"
              onClick={switchNetwork}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shrink-0 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Network</span>
            </button>
          </div>
        )}

        {/* Center Content — QR & Amount */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 sm:gap-6 py-2">
          {/* QR Code Container */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 p-2.5 sm:p-3 bg-white border-2 border-black/10 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <QRCodeView value={order.recipientAddress} size={150} />
          </div>

          {/* Exact Amount Display */}
          <div className="text-center">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">
              {t.checkout.amountToPay}
            </p>
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-black font-mono">
              {order.amount} <span className="text-xl sm:text-2xl font-bold text-gray-700">USDT</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-[10px] font-bold bg-black/10 text-black px-2.5 py-0.5 rounded-full uppercase">
                BNB Smart Chain
              </span>
              <span className="text-[10px] font-bold bg-[#FFB800] text-black px-2.5 py-0.5 rounded-full uppercase">
                USDT BEP-20
              </span>
            </div>
          </div>

          {/* Copy Address Row */}
          <div className="w-full space-y-2 mt-1 sm:mt-2">
            <div className="bg-black/5 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 group hover:bg-black/10 transition-colors">
              <div className="overflow-hidden min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                  {t.checkout.recipientAddress}
                </p>
                <p className="text-xs sm:text-sm font-mono font-bold truncate text-black">
                  {order.recipientAddress}
                </p>
              </div>
              <button
                onClick={handleCopy}
                aria-label="Copy recipient address"
                className={`p-2 sm:p-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-[#00C853] text-white'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.checkout.addressCopied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.checkout.copyAddress}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Timer Expired Callout Banner */}
          {isExpired && (
            <div className="w-full p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl text-xs space-y-1 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{t.checkout.expiredTitle}</span>
              </div>
              <p className="text-rose-700 leading-relaxed text-[11px] sm:text-xs">
                {t.checkout.expiredDesc}
              </p>
            </div>
          )}

          {/* Interactive EIP-1193 Wallet Direct Payment Button */}
          {order.paymentMode === 'wallet' && order.status === 'PENDING' && (
            <div className="w-full space-y-3 mt-1 sm:mt-2">
              <button
                type="button"
                onClick={handleExecuteWalletPayment}
                disabled={isPaying || isExpired}
                className={`w-full font-black text-xs sm:text-sm py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer active:scale-[0.99] ${
                  isExpired
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t.checkout.txSentConfirming}</span>
                  </>
                ) : isExpired ? (
                  <>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{t.checkout.expiredTitle}</span>
                  </>
                ) : walletState.status === 'disconnected' ? (
                  <>
                    <Wallet className="w-4 h-4 text-white" />
                    <span>{t.checkout.sendWalletTx}</span>
                  </>
                ) : walletState.status === 'wrong_network' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Switch Network to BSC Mainnet</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#FFB800]" />
                    <span>{t.checkout.sendWalletTx}</span>
                  </>
                )}
              </button>

              {/* Transaction Error / Rejected Callout with Retry */}
              {paymentError && (
                <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl text-xs space-y-2 animate-fade-in">
                  <div className="flex items-start gap-2 text-rose-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold block text-rose-950">Signature issue</span>
                      <span className="text-rose-800 text-[11px] sm:text-xs">{paymentError}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-rose-200/80">
                    <button
                      type="button"
                      onClick={handleExecuteWalletPayment}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.product.retry}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE BENTO COLUMN — Status & Controls */}
      <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
        {/* Status Bento Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 text-white">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t.checkout.statusPending}
          </h3>

          <div className="flex items-center gap-4 py-2">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className={`absolute inset-0 rounded-full border-t-2 ${isExpired ? 'border-rose-500' : 'border-[#FFB800] animate-spin'}`} />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">
                {isExpired
                  ? t.checkout.expiredTitle
                  : order.status === 'CONFIRMING'
                  ? t.checkout.statusConfirming
                  : t.checkout.statusPending}
              </p>
              <p className="text-xs text-gray-400">
                {isExpired
                  ? t.checkout.expiredDesc
                  : order.status === 'CONFIRMING'
                  ? 'Verifying confirmations on BNB Smart Chain...'
                  : 'Monitoring BNB Smart Chain network...'}
              </p>
            </div>
          </div>

          {/* Live Trust Box */}
          <div className="mt-1 p-3.5 sm:p-4 bg-[#181818] rounded-xl sm:rounded-2xl border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />
                <span>DIRECT P2P SETTLEMENT</span>
              </span>
              <span className="text-[10px] text-gray-400">
                0% Platform Fees
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Funds transfer directly on-chain to the merchant wallet without custody holds or third-party delays.
            </p>
          </div>
        </div>

        {/* EIP-1193 Wallet Bento Card */}
        <WalletCard />

        {/* Details Bento Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex-1 text-white space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">
            TRANSACTION DETAILS
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">Token Asset</span>
              <span className="font-bold text-white font-mono">USDT (BEP-20)</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">Payment Network</span>
              <span className="font-bold text-white font-mono">BNB Smart Chain</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">Official Contract</span>
              <a
                href="https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#FFB800] hover:underline font-mono text-xs flex items-center gap-1"
                title="Verify USDT Contract on BscScan"
              >
                <span>0x55d3...7955</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">Est. Network Gas</span>
              <span className="font-bold text-gray-300 font-mono">~0.0002 BNB (~$0.02)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Verification Engine</span>
              <span className="font-bold text-[#00C853] font-mono text-xs">
                4-Node Failover RPC
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


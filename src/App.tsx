import React, { useState, useEffect, useRef } from 'react';
import { EnvironmentBanner } from './components/EnvironmentBanner';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CheckoutCard } from './components/CheckoutCard';
import { PaidCard } from './components/PaidCard';
import { DownloadModal } from './components/DownloadModal';
import { EmbedModal } from './components/EmbedModal';
import { WhyUsBento } from './components/WhyUsBento';
import { FAQ } from './components/FAQ';
import { Order, OrderStatus } from './types';
import { PRODUCT_ID, POLL_INTERVAL_MS, ORDER_EXPIRATION_SECONDS, API_BASE_URL, APP_MODE } from './config';
import { api } from './services/api';
import { useLanguage } from './i18n/LanguageContext';
import { AlertCircle, RotateCcw, Code, Play, Eye } from 'lucide-react';

type UiViewMode = 'IDLE' | 'CREATING_ORDER' | 'ACTIVE_ORDER' | 'ERROR';

export default function App() {
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<UiViewMode>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'benefits' | 'comparison' | 'faq'>('benefits');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(ORDER_EXPIRATION_SECONDS);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // References for safe timer cleanup
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to clear active timers
  const clearTimers = () => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  // Create order handler - strictly sends { productId, paymentMode }
  const handleBuyNow = async (paymentMode: 'wallet' | 'manual' = 'wallet') => {
    if (viewMode === 'CREATING_ORDER') return; // Prevent duplicate clicks

    setErrorMessage(null);
    setViewMode('CREATING_ORDER');

    try {
      const response = await api.createOrder({
        productId: PRODUCT_ID,
        paymentMode,
      });

      if (response.success && response.order) {
        setOrder(response.order);
        setViewMode('ACTIVE_ORDER');
        const expireMs = new Date(response.order.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expireMs - Date.now()) / 1000));
        setTimeRemainingSeconds(remaining);
      } else {
        setErrorMessage(response.error?.message || 'No se pudo crear la orden.');
        setViewMode('ERROR');
      }
    } catch {
      setErrorMessage('Error de conexión al crear la orden.');
      setViewMode('ERROR');
    }
  };

  // Simulate payment confirmation handler (Demo Mode)
  const handleSimulatePayment = async () => {
    if (!order || isSimulatingPayment) return;

    setIsSimulatingPayment(true);
    try {
      const response = await api.simulatePayment(order.orderId);
      if (response.success && response.order) {
        clearTimers();
        setOrder(response.order);
      } else if (response.error) {
        setErrorMessage(response.error.message);
      }
    } catch (err) {
      console.error('Failed simulation:', err);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  // Reset demo handler
  const handleResetDemo = async () => {
    clearTimers();
    if (order?.orderId) {
      await api.resetDemoOrder(order.orderId);
    } else {
      await api.resetDemoOrder();
    }
    setOrder(null);
    setViewMode('IDLE');
    setErrorMessage(null);
    setIsDownloadModalOpen(false);
    setTimeRemainingSeconds(ORDER_EXPIRATION_SECONDS);
  };

  // Handle product download - triggers commercial zip package /volt-paywall-kit.zip
  const handleDownload = async () => {
    if (!order?.orderId) return;
    try {
      const res = await api.getDownloadToken(order.orderId);
      if (res.success && res.data) {
        const token = res.data.token;
        if (token.startsWith('mock_tok_')) {
          // Direct download of commercial starter pack zip
          const element = document.createElement("a");
          element.href = "/volt-paywall-kit.zip";
          element.download = "volt-paywall-kit.zip";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } else {
          // Production server-side tokenized download route
          const downloadUrl = `${API_BASE_URL || ''}/api/download?token=${encodeURIComponent(token)}`;
          window.location.href = downloadUrl;
        }
      } else {
        alert(res.error?.message || 'No se pudo obtener el token de descarga.');
      }
    } catch (err) {
      alert('Error de conexión al solicitar la descarga.');
    }
  };

  // Polling Effect - Runs when order status is PENDING or CONFIRMING
  useEffect(() => {
    const activeStatus = order?.status;
    const isPendingOrConfirming = activeStatus === 'PENDING' || activeStatus === 'CONFIRMING';

    if (viewMode === 'ACTIVE_ORDER' && order?.orderId && isPendingOrConfirming) {
      pollingTimerRef.current = setInterval(async () => {
        try {
          const res = await api.getOrderStatus(order.orderId, order.txHash);
          if (res.success && res.statusResponse) {
            const newStatus: OrderStatus = res.statusResponse.status;

            if (newStatus === 'PAID' || newStatus === 'PAID_LATE') {
              clearTimers();
              setOrder((prev) =>
                prev
                  ? {
                      ...prev,
                      status: newStatus,
                      txHash: res.statusResponse?.txHash || prev.txHash,
                      confirmations: res.statusResponse?.confirmations,
                    }
                  : null
              );
            } else if (newStatus === 'EXPIRED' || newStatus === 'CANCELLED') {
              clearTimers();
              setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
            } else if (newStatus !== order.status) {
              setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, POLL_INTERVAL_MS);
    } else {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [viewMode, order?.orderId, order?.status]);

  // Countdown Timer Effect - Operates against order.expiresAt ISO string
  useEffect(() => {
    const activeStatus = order?.status;
    const isPendingOrConfirming = activeStatus === 'PENDING' || activeStatus === 'CONFIRMING';

    if (viewMode === 'ACTIVE_ORDER' && order?.expiresAt && isPendingOrConfirming) {
      countdownTimerRef.current = setInterval(() => {
        const expireMs = new Date(order.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expireMs - Date.now()) / 1000));
        setTimeRemainingSeconds(remaining);

        if (remaining <= 0) {
          clearTimers();
          setOrder((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null));
        }
      }, 1000);
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [viewMode, order?.expiresAt, order?.status]);

  // Handle wallet payment transaction broadcast
  const handleWalletPaymentSent = (txHash: string) => {
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: 'CONFIRMING',
            txHash,
          }
        : null
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-[#FFB800]/30 selection:text-[#FFB800]">
      {/* Network Environment Indicator Banner (Testnet vs Mainnet) */}
      <EnvironmentBanner />

      {/* Header */}
      <Header
        onResetDemo={handleResetDemo}
        showReset={viewMode !== 'IDLE'}
        onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          {/* SCREEN 1: PRODUCT CARD */}
          {(viewMode === 'IDLE' || viewMode === 'CREATING_ORDER' || viewMode === 'ERROR') && (
            <ProductCard
              onBuyNow={(mode) => handleBuyNow(mode)}
              isLoading={viewMode === 'CREATING_ORDER'}
              error={errorMessage}
              onRetry={() => handleBuyNow('wallet')}
            />
          )}

          {/* SCREEN 2: CHECKOUT BENTO GRID (PENDING or CONFIRMING) */}
          {viewMode === 'ACTIVE_ORDER' &&
            order &&
            (order.status === 'PENDING' || order.status === 'CONFIRMING') && (
              <CheckoutCard
                order={order}
                timeRemainingSeconds={timeRemainingSeconds}
                onSimulatePayment={handleSimulatePayment}
                isSimulating={isSimulatingPayment}
                onWalletPaymentSent={handleWalletPaymentSent}
              />
            )}

          {/* SCREEN 3: PAID CONFIRMED CARD (PAID or PAID_LATE) */}
          {viewMode === 'ACTIVE_ORDER' &&
            order &&
            (order.status === 'PAID' || order.status === 'PAID_LATE') && (
              <PaidCard
                order={order}
                onDownloadClick={handleDownload}
              />
            )}

          {/* EXPIRED ORDER STATE */}
          {viewMode === 'ACTIVE_ORDER' && order && order.status === 'EXPIRED' && (
            <div className="w-full max-w-md mx-auto bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">{t.checkout.expiredTitle}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t.checkout.expiredDesc}
              </p>
              <button
                onClick={handleResetDemo}
                className="w-full py-3.5 px-4 bg-[#FFB800] hover:bg-[#FFC107] text-black font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.checkout.createNewOrder}</span>
              </button>
            </div>
          )}

          {/* CANCELLED OR MANUAL REVIEW STATE */}
          {viewMode === 'ACTIVE_ORDER' &&
            order &&
            (order.status === 'CANCELLED' || order.status === 'MANUAL_REVIEW') && (
              <div className="w-full max-w-md mx-auto bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {order.status === 'MANUAL_REVIEW'
                    ? 'Manual Review Required'
                    : t.checkout.cancelledTitle}
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {order.status === 'MANUAL_REVIEW'
                    ? 'Your payment requires manual verification by technical support.'
                    : t.checkout.cancelledDesc}
                </p>
                <button
                  onClick={handleResetDemo}
                  className="w-full py-3.5 px-4 bg-[#FFB800] hover:bg-[#FFC107] text-black font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.checkout.backToStart}</span>
                </button>
              </div>
            )}

          {/* HORIZONTAL TABS TO REDUCE SCROLL ON MOBILE */}
          <div className="w-full max-w-5xl mx-auto mt-12 sm:mt-16 border-b border-white/10">
            <div className="flex justify-around sm:justify-start gap-4 sm:gap-8 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('benefits')}
                className={`pb-4 px-1 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'benefits'
                    ? 'text-[#FFB800]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ES' ? 'Beneficios' : 'Why VOLT'}
                {activeTab === 'benefits' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFB800] rounded-full" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('comparison')}
                className={`pb-4 px-1 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'comparison'
                    ? 'text-[#FFB800]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ES' ? 'Comparativa' : 'Comparison'}
                {activeTab === 'comparison' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFB800] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('faq')}
                className={`pb-4 px-1 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'faq'
                    ? 'text-[#FFB800]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                FAQ
                {activeTab === 'faq' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFB800] rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* TAB CONTENT AREA */}
          <div className="mt-8">
            {activeTab === 'benefits' && (
              <WhyUsBento showBentoOnly={true} />
            )}
            
            {activeTab === 'comparison' && (
              <WhyUsBento showTableOnly={true} />
            )}

            {activeTab === 'faq' && (
              <FAQ />
            )}
          </div>
        </div>
      </main>


      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-[11px] text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span>{t.footer.poweredBy}</span>
            <button
              onClick={() => setIsEmbedModalOpen(true)}
              className="text-[#FFB800] hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <Eye className="w-3 h-3" />
              <span>{language === 'ES' ? 'Ver Live Demo del Producto' : 'Product Live Demo'}</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            {APP_MODE === 'demo' && <span>0x8f3a...demo-hash</span>}
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
              <span>{t.footer.serverOnline}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Download Notice Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* No-Code Integration Generator Modal */}
      <EmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
      />
    </div>
  );
}

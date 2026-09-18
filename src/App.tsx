import React, { useState, useEffect, useRef } from 'react';
import { EnvironmentBanner } from './components/EnvironmentBanner';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { PainSection } from './components/PainSection';
import { HowItWorks } from './components/HowItWorks';
import { WhatYouGet } from './components/WhatYouGet';
import { WhatYouDoNotGet } from './components/WhatYouDoNotGet';
import { ComparisonSection } from './components/ComparisonSection';
import { FutureCatalogSection } from './components/FutureCatalogSection';
import { FAQ } from './components/FAQ';
import { CheckoutCard } from './components/CheckoutCard';
import { PaidCard } from './components/PaidCard';
import { DownloadModal } from './components/DownloadModal';
import { EmbedModal } from './components/EmbedModal';
import { InteractiveDemo } from './components/InteractiveDemo';
import { NavigationTabs, MainNavTab } from './components/NavigationTabs';
import { MobileFloatingDock } from './components/MobileFloatingDock';
import { Order, OrderStatus } from './types';
import { PRODUCT_ID, POLL_INTERVAL_MS, ORDER_EXPIRATION_SECONDS, API_BASE_URL, APP_MODE } from './config';
import { api } from './services/api';
import { mockApi } from './services/mockApi';
import { useLanguage } from './i18n/LanguageContext';
import { AlertCircle, RotateCcw, Code, ArrowLeft, ShoppingCart, ShieldCheck, Zap } from 'lucide-react';

type UiViewMode = 'IDLE' | 'CREATING_ORDER' | 'ACTIVE_ORDER' | 'ERROR';

export default function App() {
  const { t, language } = useLanguage();
  const isEs = language === 'ES';
  const [order, setOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<UiViewMode>('IDLE');
  const [activeTab, setActiveTab] = useState<MainNavTab>('checkout');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(response.error?.message || 'No se pudo crear la orden.');
        setViewMode('ERROR');
      }
    } catch {
      setErrorMessage('Error de conexión al crear la orden.');
      setViewMode('ERROR');
    }
  };

  // Interactive Demo Handler - allows visitors to test the sandbox before buying
  const handleTryDemo = () => {
    setActiveTab('demo');
    setTimeout(() => {
      const demoElem = document.getElementById('interactive-demo');
      if (demoElem) {
        demoElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const scrollToPricing = () => {
    setActiveTab('checkout');
    setTimeout(() => {
      const pricingElem = document.getElementById('pricing-block');
      if (pricingElem) {
        pricingElem.scrollIntoView({ behavior: 'smooth' });
      } else {
        handleBuyNow('wallet');
      }
    }, 50);
  };

  // Simulate payment confirmation handler (for demo testing)
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

  // Reset / Return to landing page
  const handleReset = async () => {
    clearTimers();
    if (order?.orderId) {
      await api.resetDemoOrder(order.orderId).catch(() => {});
    }
    setOrder(null);
    setViewMode('IDLE');
    setErrorMessage(null);
    setIsDownloadModalOpen(false);
    setTimeRemainingSeconds(ORDER_EXPIRATION_SECONDS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          const element = document.createElement('a');
          element.href = '/volt-paywall-kit.zip';
          element.download = 'volt-paywall-kit.zip';
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          setTimeout(() => document.body.removeChild(element), 1000);
        } else {
          // Production server-side tokenized download route (triggers direct download or Google Drive 302 redirect)
          const downloadUrl = `${API_BASE_URL || ''}/api/download?token=${encodeURIComponent(token)}`;
          window.location.assign(downloadUrl);
        }
      } else {
        alert(res.error?.message || 'No se pudo obtener el token de descarga.');
      }
    } catch {
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
      {/* Network Environment Indicator Banner */}
      <EnvironmentBanner />

      {/* Header */}
      <Header
        onResetDemo={handleReset}
        showReset={viewMode !== 'IDLE'}
        onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
        onTryDemo={handleTryDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-20 md:pb-0">
        {/* ============================================================ */}
        {/* CHECKOUT / ACTIVE ORDER SCREEN (When an order is in progress) */}
        {/* ============================================================ */}
        {viewMode === 'ACTIVE_ORDER' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {/* Back to Landing Navigation Bar */}
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isEs ? 'Volver a la tienda' : 'Back to Store'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                <span>BSC BEP-20 Checkout</span>
              </div>
            </div>

            {/* PENDING / CONFIRMING CHECKOUT */}
            {order && (order.status === 'PENDING' || order.status === 'CONFIRMING') && (
              <CheckoutCard
                order={order}
                timeRemainingSeconds={timeRemainingSeconds}
                onSimulatePayment={handleSimulatePayment}
                isSimulating={isSimulatingPayment}
                onWalletPaymentSent={handleWalletPaymentSent}
              />
            )}

            {/* PAID / PAID_LATE CARD */}
            {order && (order.status === 'PAID' || order.status === 'PAID_LATE') && (
              <PaidCard
                order={order}
                onDownloadClick={handleDownload}
              />
            )}

            {/* EXPIRED STATE */}
            {order && order.status === 'EXPIRED' && (
              <div className="w-full max-w-md mx-auto bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">{t.checkout.expiredTitle}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t.checkout.expiredDesc}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3.5 px-4 bg-[#FFB800] hover:bg-[#FFC107] text-black font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.checkout.createNewOrder}</span>
                </button>
              </div>
            )}

            {/* CANCELLED STATE */}
            {order && (order.status === 'CANCELLED' || order.status === 'MANUAL_REVIEW') && (
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
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3.5 px-4 bg-[#FFB800] hover:bg-[#FFC107] text-black font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.checkout.backToStart}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* PUBLIC STORE / MARKETING LANDING (Tab-Driven Mobile-First UI) */}
        {/* ============================================================ */}
        {viewMode !== 'ACTIVE_ORDER' && (
          <div className="w-full">
            {/* Top Navigation Tabs - Eliminates endless mobile scroll */}
            <NavigationTabs
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
            />

            {/* TAB 1: CHECKOUT & STORE (Default High-Converting View) */}
            {(activeTab === 'checkout' || activeTab === 'all') && (
              <div>
                {/* 1) Hero Section */}
                <HeroSection
                  onBuyNow={handleBuyNow}
                  onTryDemo={handleTryDemo}
                  isLoading={viewMode === 'CREATING_ORDER'}
                />

                {/* Pricing & Checkout Box */}
                <section className="w-full px-4 sm:px-6 pb-12 sm:pb-16">
                  <ProductCard
                    onBuyNow={handleBuyNow}
                    onTryDemo={handleTryDemo}
                    isLoading={viewMode === 'CREATING_ORDER'}
                    error={errorMessage}
                    onRetry={() => handleBuyNow('wallet')}
                  />
                </section>

                {/* Quick highlights when inside checkout tab */}
                {activeTab === 'checkout' && (
                  <div className="space-y-6">
                    <WhatYouGet />
                    <WhatYouDoNotGet />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INTERACTIVE DEMO PLAYGROUND */}
            {(activeTab === 'demo' || activeTab === 'all') && (
              <div className="py-2">
                <InteractiveDemo onBuyFullKit={scrollToPricing} />
              </div>
            )}

            {/* TAB 3: WHAT'S INSIDE / KIT SPECIFICATIONS */}
            {(activeTab === 'kit' || activeTab === 'all') && (
              <div>
                {activeTab === 'kit' && (
                  <div className="text-center py-6 px-4">
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      {isEs ? 'Qué Incluye el Commercial Kit' : 'What’s Inside the Commercial Kit'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl mx-auto">
                      {isEs
                        ? 'Todo el código fuente listo para producción, backend Cloudflare Worker, verificación RPC y generador de embeds.'
                        : 'Production-ready source code, Cloudflare Worker backend, RPC verification engine, and embed generator.'}
                    </p>
                  </div>
                )}
                <WhatYouGet />
                <WhatYouDoNotGet />
                <HowItWorks />
              </div>
            )}

            {/* TAB 4: COMPARISON VS GUMROAD / LEMON SQUEEZY */}
            {(activeTab === 'comparison' || activeTab === 'all') && (
              <div>
                <PainSection />
                <ComparisonSection />
              </div>
            )}

            {/* TAB 5: FAQ & ROADMAP */}
            {(activeTab === 'faq' || activeTab === 'all') && (
              <div>
                <FAQ />
                <FutureCatalogSection />
              </div>
            )}

            {/* Floating Re-Anchor Buy CTA Banner (Shown on tab 'all' or bottom of individual tabs) */}
            <section className="w-full py-10 sm:py-16 bg-gradient-to-b from-[#090909] to-[#080808] border-t border-white/5 text-center px-4">
              <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-xs font-mono font-bold uppercase">
                  <Zap className="w-3.5 h-3.5 fill-[#FFB800]" />
                  <span>Founding / launch · 29 USDT</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {isEs
                    ? 'Empieza a recibir pagos USDT directos en tu wallet hoy'
                    : 'Start receiving direct USDT payments straight to your wallet today'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {isEs
                    ? '0% comisión de intermediarios. Código fuente completo + generador de embeds + licencia comercial ilimitada.'
                    : '0% platform fees. Full source code + embed generator + unlimited commercial license.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('checkout');
                      scrollToPricing();
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-[#FFB800] hover:bg-[#FFC107] text-black font-black text-sm sm:text-base rounded-2xl transition-all shadow-xl shadow-[#FFB800]/20 inline-flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    <span>{t.hero.ctaPrimary}</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Floating Thumb Dock for Mobile View */}
      {viewMode !== 'ACTIVE_ORDER' && (
        <MobileFloatingDock
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBuyNow={() => {
            setActiveTab('checkout');
            scrollToPricing();
          }}
          isCreatingOrder={viewMode === 'CREATING_ORDER'}
        />
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-[11px] text-gray-400 font-mono bg-[#070707]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="text-gray-300 font-semibold">{t.footer.poweredBy}</span>
            <button
              type="button"
              onClick={() => setIsEmbedModalOpen(true)}
              className="text-[#FFB800] hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isEs ? 'Generar Código Embed para tu Web' : 'Embed Paywall Button'}</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_6px_#00C853]" />
              <span>BNB Smart Chain (BEP-20)</span>
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

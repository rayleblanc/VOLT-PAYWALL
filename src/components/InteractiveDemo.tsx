import React, { useState, useEffect } from 'react';
import { 
  Play, Check, Copy, CheckCircle2, RotateCcw, ShieldCheck, 
  Sparkles, AlertOctagon, Terminal, Eye, Sliders, Paintbrush, 
  ArrowRight, ShoppingCart, DollarSign, Cpu, FileText, Download,
  ExternalLink, Layers, ArrowUpRight, Zap
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface InteractiveDemoProps {
  onBuyFullKit: () => void;
}

type BrandColor = 'amber' | 'emerald' | 'cyan' | 'violet' | 'crimson';
type DemoTab = 'checkout' | 'brand' | 'savings' | 'workerChecks';
type CheckoutPhase = 'instructions' | 'verifying' | 'success';

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ onBuyFullKit }) => {
  const { t, language } = useLanguage();
  const isEs = language === 'ES';
  const p = t.demoPlayground;

  // Active Tab state
  const [activeTab, setActiveTab] = useState<DemoTab>('checkout');

  // Checkout Simulation State
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('instructions');
  const [verifyingStep, setVerifyingStep] = useState<number>(1);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [manualTxInput, setManualTxInput] = useState('');
  const [sampleTxHash, setSampleTxHash] = useState('0x8f3b29c1d0e4a782b54901f6c738e4a90172bf89c4e20791a82910fae76c1234');

  // Brand Preview State
  const [storeName, setStoreName] = useState('Sovereign Digital Lab');
  const [productName, setProductName] = useState('Full Web3 Starter Guide');
  const [productPrice, setProductPrice] = useState('19.00');
  const [brandColor, setBrandColor] = useState<BrandColor>('amber');
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Savings Calculator State
  const [monthlySales, setMonthlySales] = useState<number>(3000);
  const [avgPrice, setAvgPrice] = useState<number>(29);

  // Color mappings
  const colorMap: Record<BrandColor, { 
    bg: string; 
    text: string; 
    hover: string; 
    border: string; 
    glow: string; 
    hex: string;
    name: string;
  }> = {
    amber: {
      bg: 'bg-[#FFB800]',
      text: 'text-black',
      hover: 'hover:bg-[#FFC107]',
      border: 'border-[#FFB800]',
      glow: 'shadow-[0_0_20px_rgba(255,184,0,0.3)]',
      hex: '#FFB800',
      name: 'Amber Gold',
    },
    emerald: {
      bg: 'bg-[#00C853]',
      text: 'text-black',
      hover: 'hover:bg-[#00E676]',
      border: 'border-[#00C853]',
      glow: 'shadow-[0_0_20px_rgba(0,200,83,0.3)]',
      hex: '#00C853',
      name: 'Emerald Green',
    },
    cyan: {
      bg: 'bg-cyan-500',
      text: 'text-black',
      hover: 'hover:bg-cyan-400',
      border: 'border-cyan-500',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      hex: '#06B6D4',
      name: 'Electric Cyan',
    },
    violet: {
      bg: 'bg-[#8B5CF6]',
      text: 'text-white',
      hover: 'hover:bg-[#7C3AED]',
      border: 'border-[#8B5CF6]',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
      hex: '#8B5CF6',
      name: 'Royal Violet',
    },
    crimson: {
      bg: 'bg-rose-600',
      text: 'text-white',
      hover: 'hover:bg-rose-500',
      border: 'border-rose-600',
      glow: 'shadow-[0_0_20px_rgba(225,29,72,0.3)]',
      hex: '#E11D48',
      name: 'Crimson Rose',
    },
  };

  const activeTheme = colorMap[brandColor];

  // Start verification simulation sequence
  const startVerificationSequence = (tx?: string) => {
    if (tx) {
      setSampleTxHash(tx);
    }
    setCheckoutPhase('verifying');
    setVerifyingStep(1);

    const t1 = setTimeout(() => setVerifyingStep(2), 900);
    const t2 = setTimeout(() => setVerifyingStep(3), 1800);
    const t3 = setTimeout(() => {
      setCheckoutPhase('success');
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleCopySampleAddress = () => {
    navigator.clipboard.writeText('0x71C8F79428B78f57f4955be6b403487c0879b820');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDownloadSampleDeliverable = () => {
    // Generate an in-browser sample deliverable file
    const sampleContent = `=====================================================
VOLT PAYWALL — DEMO DELIVERABLE (SAMPLE FILE)
=====================================================

Order Status: PAID (Simulated Demo)
Tokenized Access: GRANTED
Network: BNB Smart Chain (BEP-20)
Delivered: ${new Date().toISOString()}

Congratulations!
This sample file demonstrates that once the Cloudflare Worker 
validates the on-chain USDT transaction, your customer is 
immediately given direct access to their purchased digital asset.

In production:
- Your files can be hosted on Cloudflare R2, private GitHub, or any CDN.
- Worker generates short-lived one-time download tokens (HMAC-SHA256).
- 0% platform cuts, zero holds, direct payment into your personal wallet.

Get the full kit: https://volt-paywall.dev
=====================================================`;

    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'volt-demo-sample-deliverable.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Savings Calculator computations
  const estimatedUnits = Math.max(1, Math.round(monthlySales / Math.max(1, avgPrice)));
  // Gumroad: 10% + $0.30 per sale
  const gumroadLossVal = Math.round((monthlySales * 0.10) + (estimatedUnits * 0.30));
  // Lemon Squeezy: 5% + $0.50 per sale
  const lemonLossVal = Math.round((monthlySales * 0.05) + (estimatedUnits * 0.50));
  // Average loss between the two
  const avgMonthlyLoss = Math.round((gumroadLossVal + lemonLossVal) / 2);
  const annualSavingsVal = avgMonthlyLoss * 12;

  // Generated Embed Snippet
  const generatedEmbedCode = `<!-- VOLT Paywall Embed Button -->
<script src="https://pay.yourdomain.workers.dev/embed.js" async></script>
<button
  data-volt-store="${storeName.replace(/"/g, '&quot;')}"
  data-volt-product="${productName.replace(/"/g, '&quot;')}"
  data-volt-price="${productPrice}"
  data-volt-currency="USDT"
  data-volt-network="BSC"
  data-volt-color="${activeTheme.hex}"
  class="volt-buy-btn"
>
  Buy with USDT
</button>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(generatedEmbedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <section id="interactive-demo" className="w-full py-12 sm:py-18 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FFB800]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-xs font-mono font-bold uppercase tracking-wider">
            <Play className="w-3.5 h-3.5 fill-[#FFB800]" />
            <span>{p.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {p.heading}
          </h2>

          <p className="text-gray-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            {p.subheading}
          </p>
        </div>

        {/* Big Prominent DEMO SANDBOX Warning Ribbon (Always Visible) */}
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFB800]/20 flex items-center justify-center text-[#FFB800] shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black text-[#FFB800] font-mono tracking-wider block">
                {p.bannerNotice}
              </span>
              <span className="text-[11px] text-gray-300">
                {isEs 
                  ? 'Esta zona de pruebas corre de forma 100% segura en tu navegador. Ninguna orden toca la base de datos real.'
                  : 'This playground runs 100% client-side in your browser. Zero database records or real crypto touched.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onBuyFullKit}
            className="px-4 py-2 bg-[#FFB800] hover:bg-[#FFC107] text-black font-black text-xs rounded-xl transition-all shrink-0 cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>{p.ctaFixed}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#121212] p-1.5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('checkout')}
            className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'checkout'
                ? 'bg-white text-black font-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="truncate">{p.tabCheckout}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brand')}
            className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'brand'
                ? 'bg-white text-black font-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span className="truncate">{p.tabBrand}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('savings')}
            className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'savings'
                ? 'bg-white text-black font-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="truncate">{p.tabSavings}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workerChecks')}
            className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'workerChecks'
                ? 'bg-white text-black font-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="truncate">{p.tabWorkerChecks}</span>
          </button>
        </div>

        {/* ======================================================= */}
        {/* TAB 1: CHECKOUT UX SIMULATION (Instructions -> Verifying -> Success) */}
        {/* ======================================================= */}
        {activeTab === 'checkout' && (
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Header with Prominent DEMO MODE Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-[#FFB800] border border-amber-500/30 font-mono text-[10px] sm:text-xs font-black uppercase">
                    {p.checkoutBadge}
                  </span>
                  <span className="text-xs text-gray-400">
                    Step: {checkoutPhase.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {p.checkoutTitle}
                </h3>
              </div>

              {checkoutPhase !== 'instructions' && (
                <button
                  type="button"
                  onClick={() => setCheckoutPhase('instructions')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{p.btnResetDemo}</span>
                </button>
              )}
            </div>

            {/* PHASE 1: INSTRUCTIONS */}
            {checkoutPhase === 'instructions' && (
              <div className="space-y-6">
                
                {/* Price & Network banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      {isEs ? 'Monto de Muestra (Demo)' : 'Sample Amount (Demo)'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-[#FFB800]">
                        {p.sampleToyPrice}
                      </span>
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        BEP-20
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {p.sampleToyDisclaimer}
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      {isEs ? 'Red y Activo Requerido' : 'Required Network & Asset'}
                    </span>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00C853] animate-pulse" />
                      <span>BNB Smart Chain (Chain ID: 56)</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {p.networkNotice}
                    </p>
                  </div>
                </div>

                {/* Receiver Wallet Address (Sample) */}
                <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      {isEs ? 'Dirección Wallet del Vendedor (Muestra)' : 'Merchant Receiver Address (Sample)'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">Non-Custodial</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-black/50 p-2.5 rounded-xl border border-white/5">
                    <code className="text-xs font-mono text-gray-300 truncate">
                      0x71C8F79428B78f57f4955be6b403487c0879b820
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySampleAddress}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00C853]" />
                          <span className="text-[#00C853]">{p.copiedAddress}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{p.copyAddress}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulation Action Triggers */}
                <div className="pt-2 space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    {isEs ? 'Simula el Pago del Cliente (Elige una opción):' : 'Simulate Customer Payment (Choose one):'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Trigger 1: Web3 Wallet Simulation */}
                    <button
                      type="button"
                      onClick={() => startVerificationSequence()}
                      className="p-4 rounded-2xl bg-[#FFB800] hover:bg-[#FFC107] text-black font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-[#FFB800]/15 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-black" />
                        <span>{p.btnSimulateWallet}</span>
                      </div>
                      <span className="text-[10px] font-medium opacity-80">
                        {isEs ? 'Simula clic en MetaMask/TrustWallet' : 'Simulates MetaMask / TrustWallet approve'}
                      </span>
                    </button>

                    {/* Trigger 2: Manual TX Hash Input */}
                    <div className="p-3 bg-[#161616] border border-white/5 rounded-2xl space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{isEs ? 'O simula hash manual:' : 'Or manual TX Hash:'}</span>
                        <button
                          type="button"
                          onClick={() => setManualTxInput('0x8f3b29c1d0e4a782b54901f6c738e4a90172bf89c4e20791a82910fae76c1234')}
                          className="text-[#FFB800] hover:underline cursor-pointer"
                        >
                          {isEs ? 'Rellenar muestra' : 'Fill sample'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={manualTxInput}
                          onChange={(e) => setManualTxInput(e.target.value)}
                          placeholder="0x8f3b...1234"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-gray-200 font-mono focus:outline-none focus:border-[#FFB800]"
                        />
                        <button
                          type="button"
                          onClick={() => startVerificationSequence(manualTxInput || sampleTxHash)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-colors"
                        >
                          {isEs ? 'Verificar' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* PHASE 2: VERIFYING */}
            {checkoutPhase === 'verifying' && (
              <div className="py-8 text-center space-y-6 animate-fade-in">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FFB800] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-[#FFB800] animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-black text-white">
                    {p.verifyingTitle}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    {isEs 
                      ? 'El Worker consulta los RPCs oficiales de BSC en paralelo para confirmar que el hash existe y transfiere los fondos a tu dirección.'
                      : 'The Worker queries official BSC RPC nodes in parallel to verify the hash transferred USDT to your address.'}
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="max-w-md mx-auto bg-black/50 border border-white/5 rounded-2xl p-4 text-left space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    {verifyingStep >= 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                    )}
                    <span className={verifyingStep >= 1 ? 'text-gray-200' : 'text-gray-600'}>
                      {p.verifyingStep1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {verifyingStep >= 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                    )}
                    <span className={verifyingStep >= 2 ? 'text-gray-200' : 'text-gray-600'}>
                      {p.verifyingStep2}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {verifyingStep >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                    )}
                    <span className={verifyingStep >= 3 ? 'text-gray-200' : 'text-gray-600'}>
                      {p.verifyingStep3}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 font-mono">
                  TX Hash: {sampleTxHash.substring(0, 16)}...{sampleTxHash.substring(sampleTxHash.length - 8)}
                </div>
              </div>
            )}

            {/* PHASE 3: SUCCESS & UNLOCKED DELIVERABLE */}
            {checkoutPhase === 'success' && (
              <div className="py-4 space-y-6 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#00C853]/10 border border-[#00C853]/30 text-[#00C853] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,200,83,0.2)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xl sm:text-2xl font-black text-white">
                    {p.successTitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
                    {p.successDesc}
                  </p>
                </div>

                {/* Delivered Tokenized Product Box */}
                <div className="max-w-md mx-auto bg-gradient-to-b from-[#141414] to-[#0e0e0e] border border-white/10 rounded-2xl p-5 text-left space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FFB800]/10 flex items-center justify-center text-[#FFB800]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          volt-demo-sample-deliverable.txt
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {isEs ? 'Descarga segura generada' : 'Secure tokenized download'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded-full">
                      UNLOCKED
                    </span>
                  </div>

                  {/* Interactive Download Button */}
                  <button
                    type="button"
                    onClick={handleDownloadSampleDeliverable}
                    className="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{p.sampleDownloadBtn}</span>
                  </button>

                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    {p.sampleFileNotice}
                  </p>
                </div>

                {/* Receipt Data */}
                <div className="max-w-md mx-auto grid grid-cols-2 gap-2 text-left text-[11px] font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-gray-500 block">Status:</span>
                    <span className="text-[#00C853] font-bold">CONFIRMED (Demo)</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Amount:</span>
                    <span className="text-white font-bold">{p.sampleToyPrice}</span>
                  </div>
                  <div className="col-span-2 truncate">
                    <span className="text-gray-500 block">Mock TX Hash:</span>
                    <span className="text-gray-300">{sampleTxHash}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutPhase('instructions')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{p.btnResetDemo}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: BRAND & EMBED CUSTOMIZER (Live Frontend Preview) */}
        {/* ======================================================= */}
        {activeTab === 'brand' && (
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-white">
                {p.brandTitle}
              </h3>
              <p className="text-xs text-gray-400">
                {p.brandDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form Controls - 5 Cols */}
              <div className="lg:col-span-5 space-y-4 bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/5 text-xs">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">
                    {p.storeNameLabel}
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">
                    {p.productNameLabel}
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">
                    {p.priceLabel}
                  </label>
                  <input
                    type="text"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-medium focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                {/* Color Selector */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">
                    {p.colorLabel}: <span className="text-white font-normal">{activeTheme.name}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {(['amber', 'emerald', 'cyan', 'violet', 'crimson'] as BrandColor[]).map((col) => {
                      const c = colorMap[col];
                      const isActive = brandColor === col;
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setBrandColor(col)}
                          className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-all cursor-pointer ${
                            isActive ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={c.name}
                        />
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Live Rendered Card - 7 Cols */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>{p.livePreviewTag}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Reactive CSS
                  </span>
                </div>

                {/* The Embedded Card */}
                <div className="bg-[#090909] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeTheme.bg} animate-pulse`} />
                      <span>{storeName || 'My Store'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                      USDT BEP-20
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {productName || 'Digital Asset'}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {isEs 
                        ? 'Desbloqueo instantáneo con confirmación on-chain peer-to-peer.'
                        : 'Instant digital deliverable upon on-chain peer-to-peer verification.'}
                    </p>
                  </div>

                  <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Price:</span>
                    <span className="text-sm font-black font-mono text-white">
                      {productPrice} USDT
                    </span>
                  </div>

                  {/* Active Styled Buy Button */}
                  <button
                    type="button"
                    className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTheme.bg} ${activeTheme.text} ${activeTheme.hover} ${activeTheme.glow}`}
                  >
                    <ShoppingCart className="w-4 h-4 fill-current" />
                    <span>BUY WITH USDT (BEP-20)</span>
                  </button>
                </div>

                {/* Generated Snippet Preview */}
                <div className="bg-black/70 border border-white/10 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px]">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isEs ? 'Snippet de Integración HTML' : 'HTML Integration Output'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmbed}
                      className="text-[#FFB800] hover:underline font-mono text-[10px] flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedEmbed ? (
                        <>
                          <Check className="w-3 h-3 text-[#00C853]" />
                          <span className="text-[#00C853]">{p.copiedEmbedCode}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{p.copyEmbedCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-gray-400 overflow-x-auto p-2 bg-black/50 rounded-lg">
                    {generatedEmbedCode}
                  </pre>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: SAVINGS CALCULATOR (Gumroad/Lemon vs 0% Platform) */}
        {/* ======================================================= */}
        {activeTab === 'savings' && (
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-white">
                {p.savingsTitle}
              </h3>
              <p className="text-xs text-gray-400">
                {p.savingsDesc}
              </p>
            </div>

            {/* Slider & Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#141414] p-5 rounded-2xl border border-white/5">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-300">
                    {p.monthlySalesLabel}
                  </label>
                  <span className="font-mono font-black text-base text-[#FFB800]">
                    ${monthlySales.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="15000"
                  step="100"
                  value={monthlySales}
                  onChange={(e) => setMonthlySales(Number(e.target.value))}
                  className="w-full accent-[#FFB800] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>$200/mo</span>
                  <span>$5,000/mo</span>
                  <span>$15,000/mo</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-300">
                    {p.productPriceLabel}
                  </label>
                  <span className="font-mono font-black text-base text-white">
                    ${avgPrice}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[15, 29, 49, 99].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setAvgPrice(price)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        avgPrice === price
                          ? 'bg-[#FFB800] text-black shadow-md'
                          : 'bg-black/50 text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      ${price}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-gray-500 text-right font-mono">
                  ~{estimatedUnits} {isEs ? 'ventas/mes' : 'sales/mo'}
                </div>
              </div>

            </div>

            {/* Comparison Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              <div className="bg-rose-950/30 border border-rose-900/40 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-300 block">
                  Gumroad (10% + $0.30)
                </span>
                <div className="text-2xl font-black font-mono text-rose-400">
                  -${gumroadLossVal}/mo
                </div>
                <p className="text-[10px] text-rose-300/70">
                  -${(gumroadLossVal * 12).toLocaleString()} / year lost
                </p>
              </div>

              <div className="bg-amber-950/30 border border-amber-900/40 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Lemon Squeezy (5% + $0.50)
                </span>
                <div className="text-2xl font-black font-mono text-amber-400">
                  -${lemonLossVal}/mo
                </div>
                <p className="text-[10px] text-amber-300/70">
                  -${(lemonLossVal * 12).toLocaleString()} / year lost
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl space-y-1 shadow-lg shadow-emerald-500/10">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00C853]" />
                  <span>VOLT Paywall (0%)</span>
                </span>
                <div className="text-2xl font-black font-mono text-[#00C853]">
                  $0.00 fees
                </div>
                <p className="text-[10px] text-emerald-300/80 font-bold">
                  100% revenue kept
                </p>
              </div>

            </div>

            {/* Big Net Savings Banner */}
            <div className="bg-gradient-to-r from-emerald-950/50 via-black to-emerald-950/50 border border-emerald-500/30 rounded-2xl p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block">
                  {p.netAnnualSavings}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  +${annualSavingsVal.toLocaleString()} <span className="text-sm font-normal text-gray-400">/ year</span>
                </span>
                <span className="text-xs text-gray-400 block mt-0.5">
                  (~${avgMonthlyLoss.toLocaleString()} {p.netMonthlySavings})
                </span>
              </div>

              <button
                type="button"
                onClick={onBuyFullKit}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#00C853] hover:bg-[#00E676] text-black font-black text-xs sm:text-sm rounded-xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{p.ctaFixed}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mandatory Disclaimer Note */}
            <p className="text-[10px] sm:text-[11px] text-gray-500 leading-relaxed font-mono">
              {p.estimateDisclaimer}
            </p>

          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: WHAT THE WORKER CHECKS (5 On-Chain Security Criteria) */}
        {/* ======================================================= */}
        {activeTab === 'workerChecks' && (
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-[#00C853] text-xs font-mono font-bold uppercase mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>On-Chain Security Pipeline</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {p.workerChecksTitle}
              </h3>
              <p className="text-xs text-gray-400">
                {p.workerChecksDesc}
              </p>
            </div>

            {/* 5 Security Check Cards */}
            <div className="space-y-3">
              
              {/* Check 1 */}
              <div className="bg-[#161616] border border-white/5 hover:border-[#00C853]/40 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00C853]/10 text-[#00C853] flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 sm:mt-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>{p.check1Title}</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                      {p.check1Detail}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 px-2 py-0.5 rounded-full shrink-0">
                  PASSED
                </span>
              </div>

              {/* Check 2 */}
              <div className="bg-[#161616] border border-white/5 hover:border-[#00C853]/40 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00C853]/10 text-[#00C853] flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 sm:mt-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>{p.check2Title}</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                      {p.check2Detail}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 px-2 py-0.5 rounded-full shrink-0">
                  PASSED
                </span>
              </div>

              {/* Check 3 */}
              <div className="bg-[#161616] border border-white/5 hover:border-[#00C853]/40 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00C853]/10 text-[#00C853] flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 sm:mt-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>{p.check3Title}</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                      {p.check3Detail}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 px-2 py-0.5 rounded-full shrink-0">
                  PASSED
                </span>
              </div>

              {/* Check 4 */}
              <div className="bg-[#161616] border border-white/5 hover:border-[#00C853]/40 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00C853]/10 text-[#00C853] flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 sm:mt-0">
                    04
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>{p.check4Title}</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                      {p.check4Detail}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 px-2 py-0.5 rounded-full shrink-0">
                  PASSED
                </span>
              </div>

              {/* Check 5 */}
              <div className="bg-[#161616] border border-white/5 hover:border-[#00C853]/40 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00C853]/10 text-[#00C853] flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 sm:mt-0">
                    05
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>{p.check5Title}</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                      {p.check5Detail}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 px-2 py-0.5 rounded-full shrink-0">
                  PASSED
                </span>
              </div>

            </div>

          </div>
        )}

        {/* 5 THINGS PROVABLE WITHOUT PAYING */}
        <div className="bg-[#101010] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#FFB800]" />
                  <span>{isEs ? '5 Comprobaciones Gratuitas' : '5 Free In-Browser Verifications'}</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {isEs ? 'Sin tarjeta ni pago' : 'Zero payment required'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {p.provableThingsTitle}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                {p.provableThingsSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {p.provableThingsList.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#161616] border border-white/5 hover:border-[#FFB800]/30 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-[#FFB800]/10 text-[#FFB800] font-mono font-black text-xs flex items-center justify-center border border-[#FFB800]/20">
                      0{idx + 1}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10 group-hover:border-[#FFB800]/20">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FFB800] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-[#00C853]">
                  <CheckCircle2 className="w-3 h-3 text-[#00C853]" />
                  <span>{isEs ? 'Listo para probar en esta página' : 'Ready to test on this page'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FIXED FOOTER CTA BANNER FOR THE DEMO */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isEs ? 'Listo para recibir pagos directos sin intermediarios' : 'Ready to accept direct payments with zero middlemen'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {isEs 
                ? 'El kit incluye todo el código fuente del Worker, frontend, Studio y documentación de despliegue.'
                : 'The kit includes full source code for Worker, React frontend, Studio, and step-by-step deploy guide.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBuyFullKit}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#FFB800] hover:bg-[#FFC107] text-black font-black text-sm rounded-xl transition-all shadow-xl shadow-[#FFB800]/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <ShoppingCart className="w-4 h-4 text-black" />
            <span>{p.ctaFixed}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>

      </div>
    </section>
  );
};

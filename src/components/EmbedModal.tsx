import React, { useState } from 'react';
import { 
  X, Sparkles, Folder, FileCode2, Check, Play, Lock, Unlock, 
  Terminal, ShieldCheck, AlertOctagon, HelpCircle, Laptop, Eye
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoFile = 'index.html' | 'server.ts' | 'config.ts' | '.env' | 'README.md';

export const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<DemoFile>('index.html');
  const [demoStep, setDemoStep] = useState<'locked' | 'connecting' | 'paying' | 'unlocked'>('locked');

  if (!isOpen) return null;

  const isEs = language === 'ES';

  // Files data & description
  const files: Record<DemoFile, { name: string; type: string; desc: string; code: string }> = {
    'index.html': {
      name: 'index.html',
      type: 'HTML/React Component',
      desc: isEs 
        ? 'Interfaz de Checkout UI ultra rápida y responsiva. Diseñada con Tailwind CSS puro para integrarse con un copiar y pegar.'
        : 'Ultra-fast and responsive Checkout UI interface. Styled with pure Tailwind CSS to integrate with a simple copy-paste.',
      code: `<!-- VOLT Paywall Component -->
<div className="bg-[#111111] rounded-3xl border border-white/10 p-6 max-w-md">
  <div className="flex items-center justify-between mb-4">
    <span className="text-sm font-bold text-white">USDT BSC Paywall</span>
    <span className="text-xs text-[#00C853] font-mono">Mainnet Active</span>
  </div>
  <button className="w-full py-3.5 bg-[#FFB800] text-black font-extrabold rounded-2xl">
    Pay 29.00 USDT
  </button>
</div>`
    },
    'server.ts': {
      name: 'server.ts',
      type: 'Node/Express/Fastify Backend',
      desc: isEs
        ? 'Controlador del servidor para validación en tiempo real de transacciones directamente en la BSC Chain.'
        : 'Server-side controller for real-time validation of blockchain transactions directly on the BSC Chain.',
      code: `// Secure payment validation route
app.post("/api/verify-payment", async (req, res) => {
  const { txHash, recipient, expectedAmount } = req.body;
  const isVerified = await bscClient.verifyTransfer({
    txHash,
    to: recipient,
    token: USDT_CONTRACT,
    amount: expectedAmount
  });
  return res.json({ success: isVerified });
});`
    },
    'config.ts': {
      name: 'config.ts',
      type: 'TypeScript Config',
      desc: isEs
        ? 'Configuración unificada: edita el precio, tu wallet de cobro directa y la metadata de tu marca.'
        : 'Unified configuration: edit price, your direct receiver wallet, and custom brand metadata.',
      code: `export const PAYWALL_CONFIG = {
  priceUsdt: 29.00,
  recipientAddress: "0x1750C0c093650C36DcF45843446567FF3f50cC5A",
  bscChainId: 56, // BSC Mainnet
  tokenSymbol: "USDT",
  brandName: "My Digital Store V1"
};`
    },
    '.env': {
      name: '.env',
      type: 'Configuración Privada',
      desc: isEs
        ? 'Variables de entorno privadas para nodos RPC rápidos de la BSC y claves de acceso seguras.'
        : 'Private environment variables for fast BSC RPC nodes and secure database credentials.',
      code: `# VOLT Environment Variables
BSC_RPC_URL="https://bsc-dataseed.binance.org/"
USDT_CONTRACT="0x55d398326f99059fF775485246999027B3197955"
SERVER_PORT=3000
DATABASE_URL="d1://volt-cache-production"`
    },
    'README.md': {
      name: 'README.md',
      type: 'Markdown Documentation',
      desc: isEs
        ? 'Guía de instalación rápida paso a paso para desplegar en tu propio Cloudflare o hosting en 5 minutos.'
        : 'Quickstart installation guide step-by-step to deploy to your own Cloudflare or hosting in 5 minutes.',
      code: `# Quickstart Integration
1. Unzip the downloaded kit
2. Run \`npm install\` to configure dependencies
3. Set your wallet address inside \`config.ts\`
4. Run \`npm run deploy\` to go live on Cloudflare/Vercel
5. Done! Start receiving instant automated payments.`
    }
  };

  const handleSimulateWorkflow = () => {
    if (demoStep === 'locked') {
      setDemoStep('connecting');
      setTimeout(() => {
        setDemoStep('paying');
        setTimeout(() => {
          setDemoStep('unlocked');
        }, 1500);
      }, 1000);
    } else {
      setDemoStep('locked');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* BANNER MUY VISIBLE Y PERMANENTE - SOLO DEMOSTRACIÓN */}
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2 text-[#FFB800] text-center shrink-0">
          <AlertOctagon className="w-4 h-4 text-[#FFB800] shrink-0" />
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase font-mono">
            {isEs ? '⚠️ SOLO DEMOSTRACIÓN – No funcional (Vista previa de lo que recibirás)' : '⚠️ DEMONSTRATION ONLY – Non-functional (Preview of what you will purchase)'}
          </span>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 bg-[#111111]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-center justify-center text-[#FFB800]">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-white leading-tight">
                {isEs ? 'Live Demo del Producto' : 'Product Live Demo'}
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400">
                {isEs ? 'Así se ve lo que vas a recibir' : 'This is what you will receive'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Body - Two Columns */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#090909]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* COLUMN 1: Deliverable Kit Files Explorer (5 Cols) */}
            <div className="lg:col-span-5 bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Folder className="w-4 h-4 text-[#FFB800]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isEs ? 'Estructura del Kit' : 'Kit Directory Structure'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed mb-4">
                  {isEs 
                    ? 'Explora los archivos de código limpio, documentados y listos para usar que vienen dentro del archivo descargable ZIP.'
                    : 'Explore the clean, fully commented, production-ready code files included inside the downloadable ZIP file.'}
                </p>

                {/* File List */}
                <div className="space-y-1">
                  {(Object.keys(files) as DemoFile[]).map((fileName) => {
                    const file = files[fileName];
                    const isSelected = selectedFile === fileName;
                    return (
                      <button
                        key={fileName}
                        onClick={() => setSelectedFile(fileName)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs font-mono border cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFB800]/10 border-[#FFB800]/20 text-[#FFB800]'
                            : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-2 font-bold">
                          <FileCode2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FFB800]' : 'text-gray-500'}`} />
                          <span>{file.name}</span>
                        </span>
                        <span className="text-[9px] text-gray-500 font-sans hidden sm:inline">{file.type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Snippet Preview Frame */}
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase tracking-widest">
                  {isEs ? 'Vista previa del código' : 'Code file preview'}
                </span>
                <p className="text-[10px] text-gray-400 font-medium">
                  {files[selectedFile].desc}
                </p>
                <div className="bg-[#080808] border border-white/5 p-3 rounded-xl font-mono text-[10px] text-gray-300 overflow-x-auto max-h-[140px] whitespace-pre-wrap select-none scrollbar-thin">
                  {files[selectedFile].code}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Simulated Interactive Checkout Paywall (7 Cols) */}
            <div className="lg:col-span-7 bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              
              {/* Context info */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {isEs ? 'Prueba la experiencia de pago' : 'Test the checkout experience'}
                    </span>
                  </div>
                  <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-mono font-bold">
                    {isEs ? 'Simulado' : 'Simulated'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 leading-relaxed">
                  {isEs 
                    ? 'Haz clic en el botón de abajo para simular cómo tus clientes verán el pago automático y el desbloqueo instantáneo.'
                    : 'Click the checkout simulation trigger below to see how your customers automatically pay and instantly unlock content.'}
                </p>
              </div>

              {/* Interactive Mock Container */}
              <div className="bg-[#090909] border border-white/5 p-4 rounded-2xl relative overflow-hidden flex-1 flex flex-col justify-between min-h-[220px]">
                
                {/* Mock target website background info */}
                <div className="border-b border-white/5 pb-2 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">
                      THE BLOCKCHAIN LAB (MOCK SAAS)
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-500">premium_course.zip</span>
                </div>

                {/* Simulated locked state vs unlocked state */}
                <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-3">
                  
                  {demoStep === 'locked' && (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{isEs ? 'Contenido Premium Bloqueado' : 'Premium Content Locked'}</p>
                        <p className="text-[10px] text-gray-500">{isEs ? 'Adquiere tu licencia para descargar los archivos inmediatamente' : 'Acquire your license to unlock files download instantly'}</p>
                      </div>
                    </div>
                  )}

                  {demoStep === 'connecting' && (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto animate-bounce">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{isEs ? 'Conectando Wallet Simulada...' : 'Connecting Simulated Wallet...'}</p>
                        <p className="text-[10px] text-gray-500">{isEs ? 'Iniciando conexión BSC segura' : 'Initializing secure BSC link'}</p>
                      </div>
                    </div>
                  )}

                  {demoStep === 'paying' && (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{isEs ? 'Verificando Transferencia en Blockchain...' : 'Verifying Transfer on Blockchain...'}</p>
                        <p className="text-[10px] text-gray-500">{isEs ? 'Confirmación automática de hash en 2 segundos' : 'Automatic hash confirmation in 2 seconds'}</p>
                      </div>
                    </div>
                  )}

                  {demoStep === 'unlocked' && (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#00C853]/10 flex items-center justify-center text-[#00C853] mx-auto">
                        <Unlock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#00C853]">{isEs ? '¡Desbloqueo Exitoso!' : 'Successfully Unlocked!'}</p>
                        <p className="text-[10px] text-gray-400">{isEs ? 'Los archivos del producto final están listos para guardar.' : 'Final product files are now ready to download.'}</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Primary simulator interaction buttons (explicitly declared fake) */}
                <div className="mt-3">
                  {demoStep === 'locked' ? (
                    <button
                      onClick={handleSimulateWorkflow}
                      className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl transition-all shadow-[0_4px_12px_rgba(255,184,0,0.15)] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>{isEs ? 'Iniciar Simulación de Pago (29 USDT)' : 'Start Payment Simulation (29 USDT)'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setDemoStep('locked')}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      {isEs ? 'Reiniciar Demostración' : 'Reset Demonstration'}
                    </button>
                  )}
                </div>

              </div>

              {/* Security Audit Badge */}
              <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00C853] shrink-0" />
                <div className="text-[10px] leading-snug">
                  <span className="font-bold text-white block">
                    {isEs ? 'Directo y Sin Intermediarios' : 'Direct & Zero Middlemen'}
                  </span>
                  <span className="text-gray-400 block">
                    {isEs ? 'Los USDT van de la wallet de tu cliente a tu wallet directa, sin custodia intermedia.' : 'USDT flow is direct from client wallet to yours, zero custody/escrow risk.'}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Interactive Confidence / Visual Guarantee Banner */}
          <div className="bg-[#111111] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-white block">
                {isEs ? '¿Qué contiene el kit final de descarga?' : 'What does the final deliverable kit contain?'}
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {isEs 
                  ? 'Recibirás el código fuente documentado completo (React frontend + Node/Express backend), variables de entorno configuradas, guía rápida de despliegue y soporte directo.'
                  : 'You will receive the full documented source code (React frontend + Node/Express backend), configured environment files, visual setup guide, and direct updates.'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-[#111111] flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] sm:text-xs">
          <span className="text-gray-500 font-mono text-center sm:text-left">
            {isEs ? 'VOLT Paywall Kit v4.0 · Comprobación Determinista' : 'VOLT Paywall Kit v4.0 · Deterministic Validation'}
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl transition-colors cursor-pointer text-center"
          >
            {isEs ? 'Entendido / Cerrar' : 'Got it / Close'}
          </button>
        </div>

      </div>
    </div>
  );
};

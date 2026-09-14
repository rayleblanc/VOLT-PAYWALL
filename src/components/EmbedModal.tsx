import React, { useState } from 'react';
import { 
  X, Sparkles, Folder, FileCode2, Check, Play, Lock, Unlock, 
  Terminal, ShieldCheck, AlertOctagon, HelpCircle, Laptop, Eye,
  Sliders, MessageSquare, Paintbrush, Send, Layers, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BrandColor = 'amber' | 'emerald' | 'cyan' | 'violet' | 'crimson';

export const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [selectedColor, setSelectedColor] = useState<BrandColor>('violet');
  const [telegramAlerts, setTelegramAlerts] = useState<boolean>(true);
  const [demoState, setDemoState] = useState<'idle' | 'simulating' | 'success'>('idle');

  if (!isOpen) return null;

  const isEs = language === 'ES';

  const handleSimulate = () => {
    if (demoState === 'idle') {
      setDemoState('simulating');
      setTimeout(() => {
        setDemoState('success');
      }, 1500);
    } else {
      setDemoState('idle');
    }
  };

  // Dynamic Color Class mappings for client preview simulation
  const colorClasses: Record<BrandColor, { bg: string; text: string; hover: string; border: string; glow: string }> = {
    amber: {
      bg: 'bg-[#FFB800]',
      text: 'text-black',
      hover: 'hover:bg-[#FFC107]',
      border: 'border-[#FFB800]',
      glow: 'shadow-[0_0_15px_rgba(255,184,0,0.3)]'
    },
    emerald: {
      bg: 'bg-[#00C853]',
      text: 'text-black',
      hover: 'hover:bg-[#00E676]',
      border: 'border-[#00C853]',
      glow: 'shadow-[0_0_15px_rgba(0,200,83,0.3)]'
    },
    cyan: {
      bg: 'bg-cyan-500',
      text: 'text-black',
      hover: 'hover:bg-cyan-400',
      border: 'border-cyan-500',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]'
    },
    violet: {
      bg: 'bg-[#8B5CF6]',
      text: 'text-white',
      hover: 'hover:bg-[#7C3AED]',
      border: 'border-[#8B5CF6]',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]'
    },
    crimson: {
      bg: 'bg-rose-600',
      text: 'text-white',
      hover: 'hover:bg-rose-500',
      border: 'border-rose-600',
      glow: 'shadow-[0_0_15px_rgba(225,29,72,0.3)]'
    }
  };

  const activeColor = colorClasses[selectedColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* BANNER PERMANENTE DE SOLO DEMOSTRACIÓN */}
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2 text-[#FFB800] text-center shrink-0">
          <AlertOctagon className="w-4 h-4 text-[#FFB800] shrink-0" />
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase font-mono">
            {isEs ? '⚠️ SOLO DEMOSTRACIÓN – No funcional (Vista previa de la interfaz de Volt Studio)' : '⚠️ DEMONSTRATION ONLY – Non-functional (Volt Studio Interface Preview)'}
          </span>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 bg-[#111111]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFB800] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.25)]">
              <span className="text-black font-black text-sm sm:text-lg italic">V</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>VOLT STUDIO</span>
                <span className="text-[9px] bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 px-1.5 py-0.5 rounded-full uppercase font-mono font-bold">
                  {isEs ? 'Estudio No-Code' : 'No-Code Studio'}
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                {isEs ? 'Vista previa del panel de control que recibirás al comprar el kit' : 'Control panel preview included in your download kit'}
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

        {/* Two Column Layout */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-[#090909]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* COLUMN 1: Mock Form Customization (Volt Studio settings) - 5 Columns */}
            <div className="lg:col-span-5 bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 text-xs select-none">
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                <Sliders className="w-4 h-4 text-[#FFB800]" />
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                  {isEs ? '1. Configuración del Producto' : '1. Product Configuration'}
                </span>
              </div>

              {/* Product Info inputs (Mock) */}
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold">{isEs ? 'Nombre del Producto' : 'Product Name'}</label>
                  <div className="w-full bg-[#161616] border border-white/5 rounded-xl px-3 py-2 text-gray-300 font-medium">
                    Curso Completo de Web3 & Smart Contracts
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold">{isEs ? 'Precio en USDT' : 'Sale Price (USDT)'}</label>
                  <div className="w-full bg-[#161616] border border-white/5 rounded-xl px-3 py-2 text-gray-300 font-mono font-medium">
                    49.00 USDT
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold">{isEs ? 'Tu Wallet Receptora (BSC)' : 'Receiver Wallet (BSC)'}</label>
                  <div className="w-full bg-[#161616] border border-white/5 rounded-xl px-3 py-2 text-gray-500 font-mono text-[9px] truncate">
                    0x71C8F79428B78f57f4955be6b403487c0879b820
                  </div>
                </div>
              </div>

              {/* Visual customization (Simulated Interactive) */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Paintbrush className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                    {isEs ? '2. Editor de Marca' : '2. Brand Editor'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[10px] uppercase font-bold">{isEs ? 'Nombre de tu Tienda' : 'Store Name'}</label>
                  <div className="w-full bg-[#161616] border border-white/5 rounded-xl px-3 py-2 text-gray-300 font-medium">
                    Sovereign Digital Store
                  </div>
                </div>

                {/* Color Buttons */}
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[10px] uppercase font-bold">{isEs ? 'Color de Botón' : 'Primary Color'}</label>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {(['amber', 'emerald', 'cyan', 'violet', 'crimson'] as BrandColor[]).map((col) => {
                      const colors: Record<BrandColor, string> = {
                        amber: 'bg-[#FFB800]',
                        emerald: 'bg-[#00C853]',
                        cyan: 'bg-cyan-500',
                        violet: 'bg-[#8B5CF6]',
                        crimson: 'bg-rose-600'
                      };
                      const active = selectedColor === col;
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`w-6 h-6 rounded-full ${colors[col]} border-2 transition-all cursor-pointer ${
                            active ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={col}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Telegram Alerts (Interactive Mock) */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                      {isEs ? '3. Alertas en Telegram' : '3. Telegram Notifications'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setTelegramAlerts(!telegramAlerts)}
                    className={`w-9 h-5 rounded-full transition-all duration-200 cursor-pointer flex items-center px-0.5 ${
                      telegramAlerts ? 'bg-sky-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  {isEs 
                    ? 'Recibe notificaciones instantáneas con el hash y monto cada vez que realices una venta.'
                    : 'Get real-time message reports containing hash values and sales totals on every transaction.'}
                </p>
              </div>

            </div>

            {/* COLUMN 2: Real-time Rendered Customer Preview - 7 Columns */}
            <div className="lg:col-span-7 bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isEs ? '4. Previsualización del Cliente' : '4. Live Customer Preview'}
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-500/20">
                  {isEs ? 'Vista en Vivo' : 'Live Preview'}
                </span>
              </div>

              {/* Real-time Render Frame */}
              <div className="bg-[#090909] border border-white/5 p-4 rounded-2xl relative overflow-hidden flex-1 flex flex-col justify-between min-h-[250px]">
                
                {/* Simulated Customer Checkout */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                      Sovereign Digital Store
                    </span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-mono font-bold">
                      USDT BEP-20
                    </span>
                  </div>

                  {demoState !== 'success' ? (
                    <div className="space-y-3.5">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          Curso Completo de Web3 & Smart Contracts
                        </h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                          Acceso instantáneo a 12 módulos en HD, repositorio privado de GitHub y comunidad exclusiva.
                        </p>
                      </div>

                      {/* Price tag */}
                      <div className="bg-[#121212] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">{isEs ? 'Precio Fijo' : 'Fixed Price'}</span>
                        <span className="text-xs sm:text-sm font-black text-white">$49.00 <span className="text-[9px] text-gray-400 font-normal">USDT</span></span>
                      </div>

                      {/* Interactive Button */}
                      <button
                        onClick={handleSimulate}
                        className={`w-full py-2.5 sm:py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${activeColor.bg} ${activeColor.text} ${activeColor.hover} ${activeColor.glow}`}
                      >
                        {demoState === 'simulating' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>{isEs ? 'Verificando en Blockchain...' : 'Verifying Transaction...'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>DESBLOQUEAR ACCESO CON USDT</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3.5 animate-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 rounded-full bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[#00C853]">
                          {isEs ? '¡Compra Exitosa!' : 'Successful Purchase!'}
                        </h4>
                        <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed mt-1">
                          {isEs 
                            ? 'El pago fue procesado correctamente. Los archivos del curso se desbloquearon para descargar.'
                            : 'Your payment was confirmed. The digital files were unlocked and are now ready to save.'}
                        </p>
                      </div>
                      <button
                        onClick={() => setDemoState('idle')}
                        className="text-[10px] text-gray-500 hover:text-white underline font-mono cursor-pointer"
                      >
                        {isEs ? 'Simular de nuevo' : 'Simulate again'}
                      </button>
                    </div>
                  )}

                  {demoState !== 'success' && (
                    <p className="text-[9px] text-gray-500 text-center">
                      ⚡ {isEs ? 'Verificación multi-nodo BSC en ~3 segundos' : 'Multi-node BSC verification in ~3 seconds'}
                    </p>
                  )}
                </div>

              </div>

              {/* Simulated copy snippet panel */}
              <div className="mt-3.5 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-mono text-gray-300">
                    {isEs ? 'Código de Integración Generado' : 'Integration Code Output'}
                  </span>
                </div>
                <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {isEs ? '1 Clic' : '1 Click'}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-[#111111] flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] sm:text-xs">
          <span className="text-gray-500 font-mono text-center sm:text-left">
            VOLT Studio · {isEs ? 'Estudio de Monetización No-Código' : 'No-Code Monetization Studio'}
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl transition-colors cursor-pointer text-center text-xs"
          >
            {isEs ? 'Entendido / Cerrar' : 'Got it / Close'}
          </button>
        </div>

      </div>
    </div>
  );
};

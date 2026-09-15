import React from 'react';
import { 
  Code2, 
  Sparkles, 
  Send, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Check, 
  Globe, 
  Cpu, 
  Database, 
  Lock 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const PackContents: React.FC = () => {
  const { language } = useLanguage();
  const isEs = language === 'ES';

  const packItems = [
    {
      icon: <Code2 className="w-5 h-5 text-[#FFB800]" />,
      badge: isEs ? 'Frontend + Backend' : 'Full-Stack Code',
      title: isEs ? 'Código Fuente Completo 100% Editable' : '100% Editable Full Source Code',
      desc: isEs 
        ? 'Stack moderno con React 18, Vite, Tailwind CSS y backend serverless en Cloudflare Worker (Hono + TypeScript). Sin dependencias pesadas ni código ofuscado.'
        : 'Modern stack built with React 18, Vite, Tailwind CSS, and serverless Cloudflare Worker API (Hono + TypeScript). Zero bloated libraries or obfuscated code.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      badge: isEs ? 'Generador No-Code' : 'Visual Studio',
      title: isEs ? 'VOLT Studio & Generador de Embeds' : 'VOLT Studio & Embed Generator',
      desc: isEs
        ? 'Herramienta visual para generar enlaces directos de cobro y código Iframe listo para incrustar en WordPress, Webflow, Shopify, Notion o cualquier sitio web en segundos.'
        : 'Visual tool to generate direct checkout links and responsive Iframe snippets ready to embed in WordPress, Webflow, Shopify, Notion, or custom websites.'
    },
    {
      icon: <Send className="w-5 h-5 text-cyan-400" />,
      badge: isEs ? 'Notificaciones en Vivo' : 'Instant Alerts',
      title: isEs ? 'Alertas Automatizadas a Telegram' : 'Automated Telegram Alerts',
      desc: isEs
        ? 'Webhook nativo pre-configurado para enviarte un mensaje a tu canal o chat privado de Telegram cada vez que entra un pago de 29 USDT confirmado en BSC.'
        : 'Pre-configured native webhook that triggers an instant Telegram notification to your channel or private chat whenever a 29 USDT payment is confirmed on BSC.'
    },
    {
      icon: <FileText className="w-5 h-5 text-[#00C853]" />,
      badge: isEs ? 'Sin Complicaciones' : '2-Min Setup',
      title: isEs ? 'Guía Paso a Paso + Script setup.sh' : 'Step-by-Step Guide + setup.sh Script',
      desc: isEs
        ? 'Documentación detallada en PDF y Markdown con instrucciones claras paso a paso y script automatizado para desplegar en Cloudflare en menos de 2 minutos.'
        : 'Comprehensive PDF & Markdown deployment guide with step-by-step instructions and automated setup script to deploy on Cloudflare in under 2 minutes.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      badge: isEs ? 'Sin Regalías' : 'Unlimited Rights',
      title: isEs ? 'Licencia Comercial Ilimitada' : 'Unlimited Commercial License',
      desc: isEs
        ? 'Usa la pasarela en proyectos personales ilimitados, tiendas digitales o implementaciones para clientes. Sin mensualidades, sin límites y sin comisiones futuras.'
        : 'Use the paywall across unlimited personal projects, digital stores, or client builds. Zero monthly fees, zero restrictions, and zero royalties.'
    },
    {
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      badge: isEs ? '0% Fee · Autocustodia' : '0% Fee · Non-Custodial',
      title: isEs ? 'Cobro USDT BEP-20 en BSC (0% Fee de Plataforma)' : 'USDT BEP-20 Checkout on BSC (0% Platform Fee)',
      desc: isEs
        ? 'Pagos directos a tu wallet con motor de verificación on-chain multi-nodo. Sin comisiones de intermediarios, sin retenciones y sin requerir API keys de pago.'
        : 'Direct payments straight to your wallet with multi-node on-chain verification engine. Zero platform fees, zero rolling reserves, and no paid API keys required.'
    }
  ];

  return (
    <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-full text-[10px] sm:text-xs font-bold text-[#FFB800] uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>{isEs ? 'Todo en un solo paquete descargable' : 'All-in-One Downloadable Deliverable'}</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isEs ? '¿Qué incluye exactamente el Creator Pack?' : 'What Exactly is Included in the Creator Pack?'}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
            {isEs 
              ? 'Acceso inmediato y permanente a todo el ecosistema de software necesario para cobrar en USDT sin intermediarios.'
              : 'Instant and permanent access to the complete software ecosystem required to accept USDT with 0% platform fees.'}
          </p>
        </div>

        <div className="bg-[#181818] border border-white/10 p-4 rounded-2xl shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853]">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-mono block font-bold">{isEs ? 'Entrega Digital' : 'Digital Delivery'}</span>
            <span className="text-xs font-bold text-white">{isEs ? 'Instantánea post-pago BSC' : 'Instant via BSC verification'}</span>
          </div>
        </div>
      </div>

      {/* Grid of 6 concrete features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packItems.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-[#161616] border border-white/5 hover:border-[#FFB800]/40 rounded-2xl p-5 space-y-3 transition-all duration-200 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {item.badge}
                </span>
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-[#FFB800] transition-colors leading-snug">
                {item.title}
              </h4>

              <p className="text-xs text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Hosting Normalization Callout */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <Globe className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {isEs ? 'Despliegue Global en Cloudflare Workers ($0/mes)' : 'Global Edge Deployment on Cloudflare Workers ($0/mo)'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
              {isEs 
                ? 'Funciona en el subdominio gratuito workers.dev con latencia ultrabaja en 300+ ciudades. Puedes conectar tu propio dominio personalizado (ej. tudominio.com) en cualquier momento en 1 clic sin costo adicional.'
                : 'Runs on the free workers.dev subdomain with ultra-low latency across 300+ global cities. You can easily connect your own custom domain (e.g. yourdomain.com) anytime in 1 click at zero extra cost.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
          <span className="w-full sm:w-auto text-center px-3 py-1.5 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-xs font-mono font-bold rounded-xl">
            {isEs ? '100k requests/día gratis' : '100k free req/day'}
          </span>
        </div>
      </div>
    </div>
  );
};

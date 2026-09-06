import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Cloud, DollarSign, Code, RefreshCw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First FAQ open by default

  const faqItems = [
    {
      question: t.faq.q1,
      answer: t.faq.a1,
      icon: <Cloud className="w-5 h-5 text-[#FFB800]" />
    },
    {
      question: t.faq.q2,
      answer: t.faq.a2,
      icon: <DollarSign className="w-5 h-5 text-[#00C853]" />
    },
    {
      question: t.faq.q3,
      answer: t.faq.a3,
      icon: <Zap className="w-5 h-5 text-amber-400" />
    },
    {
      question: t.faq.q4,
      answer: t.faq.a4,
      icon: <Code className="w-5 h-5 text-cyan-400" />
    },
    {
      question: t.faq.q5,
      answer: t.faq.a5,
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-4xl mx-auto mt-16 sm:mt-24 px-4 space-y-8" aria-label="Frequently Asked Questions">
      {/* FAQ Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#FFB800]" />
          <span>{t.faq.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.faq.heading}
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          {t.faq.subheading}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`bg-[#111111] border rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-[#FFB800]/40 bg-[#141414] shadow-lg shadow-black/40'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800]"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0 p-2 rounded-xl bg-white/5 border border-white/10">
                    {item.icon}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-white leading-snug">
                    {item.question}
                  </span>
                </div>
                <div
                  className={`shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#FFB800] bg-[#FFB800]/10' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 pt-0 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 mt-1 pt-4">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support / Guarantee Banner */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">¿Tienes más dudas antes de comprar?</h3>
            <p className="text-xs text-gray-400">Verificación On-chain directa sin sorpresas. Soporte post-venta incluido.</p>
          </div>
        </div>
        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white rounded-xl transition-all whitespace-nowrap"
        >
          Soporte en Telegram &rarr;
        </a>
      </div>
    </section>
  );
};

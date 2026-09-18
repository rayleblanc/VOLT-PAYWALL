import React from 'react';
import { Code, Layout, ShieldCheck, Repeat, FileCheck, BookOpen, Send, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const WhatYouGet: React.FC = () => {
  const { t } = useLanguage();

  const items = [
    {
      icon: <Code className="w-5 h-5 text-[#FFB800]" />,
      title: t.whatYouGet.item1Title,
      desc: t.whatYouGet.item1Desc,
      tag: 'TypeScript + React 18',
    },
    {
      icon: <Layout className="w-5 h-5 text-purple-400" />,
      title: t.whatYouGet.item2Title,
      desc: t.whatYouGet.item2Desc,
      tag: 'Iframe & Direct Links',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#00C853]" />,
      title: t.whatYouGet.item3Title,
      desc: t.whatYouGet.item3Desc,
      tag: 'Multi-Node RPC Failover',
    },
    {
      icon: <Repeat className="w-5 h-5 text-cyan-400" />,
      title: t.whatYouGet.item4Title,
      desc: t.whatYouGet.item4Desc,
      tag: 'Idempotent Ledger',
    },
    {
      icon: <FileCheck className="w-5 h-5 text-[#FFB800]" />,
      title: t.whatYouGet.item5Title,
      desc: t.whatYouGet.item5Desc,
      tag: 'Unlimited Projects',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      title: t.whatYouGet.item6Title,
      desc: t.whatYouGet.item6Desc,
      tag: 'PDF + Markdown + setup.sh',
    },
    {
      icon: <Send className="w-5 h-5 text-sky-400" />,
      title: t.whatYouGet.item7Title,
      desc: t.whatYouGet.item7Desc,
      tag: 'Instant Webhook Ping',
    },
  ];

  return (
    <section id="what-you-get" className="w-full py-10 sm:py-16 bg-[#090909] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
            <Check className="w-3.5 h-3.5" />
            <span>{t.whatYouGet.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {t.whatYouGet.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            {t.whatYouGet.subheading}
          </p>
        </div>

        {/* 7 Concrete Items Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className={`bg-[#121212] border border-white/10 hover:border-white/20 rounded-2xl sm:rounded-3xl p-6 transition-all flex flex-col justify-between ${
                index === 6 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs font-mono text-[#00C853]">
                <Check className="w-3.5 h-3.5" />
                <span>Included in Kit</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

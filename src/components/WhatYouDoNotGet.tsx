import React from 'react';
import { X, HardDrive, Cpu, Fuel, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const WhatYouDoNotGet: React.FC = () => {
  const { t } = useLanguage();

  const boundaryItems = [
    {
      icon: <X className="w-5 h-5 text-amber-400" />,
      title: t.whatYouDoNotGet.item1Title,
      desc: t.whatYouDoNotGet.item1Desc,
      tag: 'Standard ZIP / Clean Files',
    },
    {
      icon: <HardDrive className="w-5 h-5 text-amber-400" />,
      title: t.whatYouDoNotGet.item2Title,
      desc: t.whatYouDoNotGet.item2Desc,
      tag: 'BYO Storage (R2 / S3 / Drive)',
    },
    {
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      title: t.whatYouDoNotGet.item3Title,
      desc: t.whatYouDoNotGet.item3Desc,
      tag: 'Strictly BNB Smart Chain',
    },
    {
      icon: <Fuel className="w-5 h-5 text-amber-400" />,
      title: t.whatYouDoNotGet.item4Title,
      desc: t.whatYouDoNotGet.item4Desc,
      tag: '~$0.01 - $0.03 Paid by Buyer',
    },
  ];

  return (
    <section id="what-you-do-not-get" className="w-full py-10 sm:py-16 bg-[#080808] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.whatYouDoNotGet.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {t.whatYouDoNotGet.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            {t.whatYouDoNotGet.subheading}
          </p>
        </div>

        {/* 4 Boundary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {boundaryItems.map((item, index) => (
            <div
              key={index}
              className="bg-[#101010] border border-white/10 hover:border-amber-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-amber-400/90 border border-amber-500/20">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="text-amber-400 font-mono">0{index + 1}.</span>
                  <span>{item.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Honest Scope</span>
                <span className="text-amber-400/80">Clear Boundary</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

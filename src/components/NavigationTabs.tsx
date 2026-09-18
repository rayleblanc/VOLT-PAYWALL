import React from 'react';
import { Zap, Play, PackageCheck, Scale, HelpCircle, LayoutList } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type MainNavTab = 'checkout' | 'demo' | 'kit' | 'comparison' | 'faq' | 'all';

interface NavigationTabsProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useLanguage();

  const tabs: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'checkout',
      label: t.navTabs?.checkout || 'Checkout',
      icon: <Zap className="w-3.5 h-3.5" />,
      badge: '29 USDT',
    },
    {
      id: 'demo',
      label: t.navTabs?.demo || 'Demo',
      icon: <Play className="w-3.5 h-3.5" />,
    },
    {
      id: 'kit',
      label: t.navTabs?.kit || 'Kit',
      icon: <PackageCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'comparison',
      label: t.navTabs?.comparison || 'Vs Gumroad',
      icon: <Scale className="w-3.5 h-3.5" />,
    },
    {
      id: 'faq',
      label: t.navTabs?.faq || 'FAQ',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    {
      id: 'all',
      label: t.navTabs?.all || 'Ver Todo',
      icon: <LayoutList className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <nav
      id="main-nav-tabs"
      aria-label="Section navigation"
      className="sticky top-[48px] sm:top-[58px] z-30 w-full bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 py-1.5 sm:py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-button-${tab.id}`}
                onClick={() => {
                  onSelectTab(tab.id);
                  // On mobile, scroll slightly up to section start smoothly
                  const navElem = document.getElementById('main-nav-tabs');
                  if (navElem) {
                    navElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] select-none ${
                  isActive
                    ? 'bg-[#181818] text-[#FFB800] border border-[#FFB800]/40 shadow-[0_0_12px_rgba(255,184,0,0.12)]'
                    : 'bg-[#101010]/80 text-gray-400 hover:text-white hover:bg-[#161616] border border-white/5'
                }`}
              >
                <span className={isActive ? 'text-[#FFB800]' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black uppercase ${
                      isActive
                        ? 'bg-[#FFB800] text-black'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

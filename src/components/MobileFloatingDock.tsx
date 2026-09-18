import React from 'react';
import { Zap, Play, PackageCheck, HelpCircle, ShoppingCart } from 'lucide-react';
import { MainNavTab } from './NavigationTabs';
import { useLanguage } from '../i18n/LanguageContext';

interface MobileFloatingDockProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onBuyNow: () => void;
  isCreatingOrder?: boolean;
}

export const MobileFloatingDock: React.FC<MobileFloatingDockProps> = ({
  activeTab,
  onSelectTab,
  onBuyNow,
  isCreatingOrder = false,
}) => {
  const { t, language } = useLanguage();
  const isEs = language === 'ES';

  const navItems: { id: MainNavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'checkout',
      label: isEs ? 'Tienda' : 'Store',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'demo',
      label: 'Demo',
      icon: <Play className="w-4 h-4" />,
    },
    {
      id: 'kit',
      label: 'Kit',
      icon: <PackageCheck className="w-4 h-4" />,
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0c0c0c]/95 backdrop-blur-2xl border-t border-white/10 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Navigation Quick Switches */}
        <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-2xl border border-white/5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`dock-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#222222] text-[#FFB800] shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={item.label}
              >
                <div className={isActive ? 'text-[#FFB800]' : 'text-gray-400'}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Primary One-Tap Buy Action Button */}
        <button
          type="button"
          id="dock-buy-button"
          onClick={onBuyNow}
          disabled={isCreatingOrder}
          className="flex-1 py-2.5 px-3 bg-[#FFB800] hover:bg-[#FFC107] text-black font-black text-xs rounded-2xl transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 select-none min-h-[44px]"
        >
          <ShoppingCart className="w-4 h-4 text-black shrink-0" />
          <div className="flex flex-col items-start text-left leading-none">
            <span className="text-[10px] font-mono text-black/70 font-semibold uppercase">
              {isEs ? 'Comprar kit' : 'Get Full Kit'}
            </span>
            <span className="text-xs font-black">29 USDT · 0% fee</span>
          </div>
        </button>
      </div>
    </div>
  );
};

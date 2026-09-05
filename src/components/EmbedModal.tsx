import React, { useState } from 'react';
import { X, Code, Link2, Copy, Check, Sparkles, Terminal, FileCode2, Shield } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'generator' | 'quickstart'>('generator');
  
  // Dynamic form state for No-Code generator
  const [recipient, setRecipient] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [productName, setProductName] = useState('All-in-One Creator Pack');
  const [amount, setAmount] = useState('39');
  const [network, setNetwork] = useState<'56' | '97'>('97');

  // Copy feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  // Base URL for generated payment links
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://voltpaywall.com';

  // Generated Link
  const generatedLink = `${baseUrl}/pay?recipient=${encodeURIComponent(recipient)}&amount=${encodeURIComponent(amount)}&product=${encodeURIComponent(productName)}&chain=${network}`;

  // Generated Iframe HTML
  const generatedIframe = `<iframe\n  src="${generatedLink}"\n  width="100%"\n  height="700"\n  frameborder="0"\n  style="border:none; border-radius: 24px; max-width: 540px; margin: 0 auto; display: block;"\n  allow="payment"\n></iframe>`;

  // Env snippet
  const envSnippet = `# VOLT Paywall - Configuration\nPAYMENT_RECIPIENT="${recipient}"\nUSDT_CONTRACT_ADDRESS="${network === '56' ? '0x55d398326f99059fF775485246999027B3197955' : '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'}"\nBSC_RPC_URL="${network === '56' ? 'https://bsc-dataseed.binance.org/' : 'https://data-seed-prebsc-1-s1.binance.org:8545/'}"`;

  const copyToClipboard = (text: string, type: 'link' | 'iframe' | 'env') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (type === 'iframe') {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    } else if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#111111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{t.embed.title}</span>
                <span className="text-xs bg-[#FFB800]/20 text-[#FFB800] px-2 py-0.5 rounded-full font-mono font-bold">
                  v4.0
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {t.embed.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={t.embed.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/5 bg-[#0d0d0d] px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('generator')}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'generator'
                ? 'border-[#FFB800] text-[#FFB800]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>{t.embed.tabGenerator}</span>
          </button>

          <button
            onClick={() => setActiveTab('quickstart')}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'quickstart'
                ? 'border-[#FFB800] text-[#FFB800]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{t.embed.tabQuickstart}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'generator' && (
            <div className="space-y-6">
              {/* Generator Configuration Inputs */}
              <div className="bg-[#181818] border border-white/5 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-[#FFB800]" />
                  <span>{t.embed.configTitle}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Wallet Receptora */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-gray-400 font-medium">{t.embed.walletLabel}</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-[#FFB800] text-xs"
                    />
                  </div>

                  {/* Nombre del Producto */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">{t.embed.productLabel}</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="E.g. Digital Course"
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFB800] text-xs"
                    />
                  </div>

                  {/* Precio en USDT */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">{t.embed.amountLabel}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="39"
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-[#FFB800] text-xs"
                    />
                  </div>

                  {/* Red BSC */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-gray-400 font-medium">{t.embed.networkLabel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNetwork('97')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          network === '97'
                            ? 'bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800]'
                            : 'bg-[#111111] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        BSC Testnet (Chain ID 97)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNetwork('56')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          network === '56'
                            ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]'
                            : 'bg-[#111111] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        BSC Mainnet (Chain ID 56)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Snippet 1: Direct Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-[#FFB800]" />
                    <span>{t.embed.directLinkTitle}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedLink, 'link')}
                    className="flex items-center gap-1.5 bg-[#FFB800] hover:bg-[#FFC107] text-black font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? t.embed.copiedLink : t.embed.copyLink}</span>
                  </button>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl font-mono text-gray-300 break-all select-all">
                  {generatedLink}
                </div>
              </div>

              {/* Snippet 2: HTML Iframe Embed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span>{t.embed.iframeTitle}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedIframe, 'iframe')}
                    className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedIframe ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIframe ? t.embed.copiedIframe : t.embed.copyIframe}</span>
                  </button>
                </div>
                <pre className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl font-mono text-cyan-300 overflow-x-auto whitespace-pre">
                  {generatedIframe}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="bg-[#181818] border border-white/5 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#FFB800]" />
                  <span>{t.embed.quickstartTitle}</span>
                </h3>

                <div className="space-y-4 text-gray-300">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] flex items-center justify-center font-bold font-mono text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white">{t.embed.step1Title}</p>
                      <p className="text-gray-400">
                        {t.embed.step1Desc}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] flex items-center justify-center font-bold font-mono text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white">{t.embed.step2Title}</p>
                      <p className="text-gray-400">
                        {t.embed.step2Desc}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] flex items-center justify-center font-bold font-mono text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white">{t.embed.step3Title}</p>
                      <p className="text-gray-400">
                        {t.embed.step3Desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Env file copy box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#00C853]" />
                    <span>.env Recommended Configuration</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(envSnippet, 'env')}
                    className="flex items-center gap-1.5 bg-[#00C853] hover:bg-[#00E676] text-black font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEnv ? t.embed.copiedEnv : t.embed.copyEnv}</span>
                  </button>
                </div>
                <pre className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl font-mono text-gray-300 overflow-x-auto whitespace-pre">
                  {envSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-[#141414] flex justify-between items-center text-xs">
          <span className="text-gray-500 font-mono">100% Non-Custodial · Direct Wallet-to-Wallet</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t.embed.close}
          </button>
        </div>

      </div>
    </div>
  );
};


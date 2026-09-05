import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'EN' | 'ES';

export interface Translations {
  // Header & General
  nav: {
    title: string;
    modeDemo: string;
    modeLocal: string;
    modeProd: string;
    integrateNoCode: string;
    resetDemo: string;
  };

  // Product Card
  product: {
    paywallTag: string;
    noFeesTag: string;
    nonCustodialTag: string;
    title: string;
    tagline: string;
    description: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    totalPrice: string;
    paymentMethod: string;
    payWithWallet: string;
    manualPayment: string;
    walletMethodSub: string;
    manualMethodSub: string;
    buyNowWallet: string;
    buyNowManual: string;
    creatingOrder: string;
    secureNotice: string;
    retry: string;
    connectionError: string;
  };

  // Checkout Card
  checkout: {
    activeOrder: string;
    timeRemaining: string;
    orderId: string;
    amountToPay: string;
    recipientAddress: string;
    network: string;
    statusPending: string;
    statusConfirming: string;
    copyAddress: string;
    addressCopied: string;
    sendWalletTx: string;
    txSentConfirming: string;
    simulatePaymentDemo: string;
    simulating: string;
    manualInstructions: string;
    expiredTitle: string;
    expiredDesc: string;
    createNewOrder: string;
    cancelledTitle: string;
    cancelledDesc: string;
    backToStart: string;
  };

  // Paid Card
  paid: {
    paymentConfirmed: string;
    latePaymentConfirmed: string;
    orderCompleted: string;
    txHashLabel: string;
    viewOnBscScan: string;
    downloadProduct: string;
    instantDeliveryNotice: string;
    confirmationsCount: string;
  };

  // Why Us Bento
  whyUs: {
    badge: string;
    heading: string;
    subheading: string;
    card1Title: string;
    card1Sub: string;
    card1Desc: string;
    tradGatewaysFee: string;
    voltFee: string;
    card2Title: string;
    card2Desc: string;
    card2Foot: string;
    card3Title: string;
    card3Desc: string;
    card3Foot: string;
    card4Title: string;
    card4Sub: string;
    card4Desc: string;
    noKyc: string;
    walletQrSupport: string;
    globalBorderless: string;
    tableHeading: string;
    tableSub: string;
    colFeature: string;
    colStripe: string;
    colCryptoCentralized: string;
    colVolt: string;
    rowFee: string;
    stripeFeeVal: string;
    cryptoFeeVal: string;
    voltFeeVal: string;
    rowCustody: string;
    stripeCustodyVal: string;
    cryptoCustodyVal: string;
    voltCustodyVal: string;
    rowPayout: string;
    stripePayoutVal: string;
    cryptoPayoutVal: string;
    voltPayoutVal: string;
    rowChargebacks: string;
    stripeChargebackVal: string;
    cryptoChargebackVal: string;
    voltChargebackVal: string;
    rowKyc: string;
    stripeKycVal: string;
    cryptoKycVal: string;
    voltKycVal: string;
  };

  // Embed Modal
  embed: {
    title: string;
    subtitle: string;
    tabGenerator: string;
    tabQuickstart: string;
    configTitle: string;
    walletLabel: string;
    productLabel: string;
    amountLabel: string;
    networkLabel: string;
    directLinkTitle: string;
    copyLink: string;
    copiedLink: string;
    iframeTitle: string;
    copyIframe: string;
    copiedIframe: string;
    quickstartTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    copyEnv: string;
    copiedEnv: string;
    close: string;
  };

  // Footer
  footer: {
    poweredBy: string;
    generateEmbed: string;
    serverOnline: string;
  };
}

export const translations: Record<Language, Translations> = {
  EN: {
    nav: {
      title: 'VOLT PAYWALL',
      modeDemo: 'Mode: DEMO',
      modeLocal: 'Worker: LOCAL',
      modeProd: 'Worker: PROD',
      integrateNoCode: 'Integrate No-Code',
      resetDemo: 'Reset Demo',
    },
    product: {
      paywallTag: 'VOLT PAYWALL',
      noFeesTag: '0% FEES',
      nonCustodialTag: 'Non-Custodial USDT',
      title: 'All-in-One\nCreator Pack',
      tagline: 'USDT BEP-20 Payment Gateway',
      description: 'Complete source code + step-by-step implementation guide + unlimited commercial license. Instant digital delivery.',
      feature1: '100% Editable complete source code',
      feature2: 'Step-by-step PDF implementation guide',
      feature3: 'Unlimited commercial license',
      feature4: 'Instant digital delivery upon payment',
      totalPrice: 'TOTAL PRICE',
      paymentMethod: 'PAYMENT METHOD',
      payWithWallet: 'Pay with Wallet',
      manualPayment: 'Manual Payment / QR',
      walletMethodSub: 'Exact payment of 39.00 USDT via MetaMask or Trust Wallet (BNB Smart Chain).',
      manualMethodSub: 'Transfer with unique control decimals for automatic verification without connecting a wallet.',
      buyNowWallet: 'Proceed with Wallet',
      buyNowManual: 'Proceed with Manual Payment',
      creatingOrder: 'Creating order...',
      secureNotice: 'Secure payment verified directly on BNB Smart Chain Testnet',
      retry: 'Retry',
      connectionError: 'Connection error while creating order.',
    },
    checkout: {
      activeOrder: 'ORDER CREATED',
      timeRemaining: 'TIME REMAINING',
      orderId: 'Order ID',
      amountToPay: 'Amount to Transfer',
      recipientAddress: 'Recipient Wallet Address',
      network: 'Network',
      statusPending: 'Awaiting Payment...',
      statusConfirming: 'Confirming On-Chain...',
      copyAddress: 'Copy Address',
      addressCopied: 'Address Copied!',
      sendWalletTx: 'Pay 39.00 USDT via Web3 Wallet',
      txSentConfirming: 'Transaction Broadcasted - Confirming...',
      simulatePaymentDemo: 'Simulate Payment Confirmation (Demo Mode)',
      simulating: 'Simulating payment...',
      manualInstructions: 'Send the exact amount shown above to the recipient address. Verification is performed automatically in real-time.',
      expiredTitle: 'Order Has Expired',
      expiredDesc: 'The time limit to complete the payment has ended. Please create a new order.',
      createNewOrder: 'Create New Order',
      cancelledTitle: 'Order Cancelled',
      cancelledDesc: 'This payment order has been cancelled or requires manual review.',
      backToStart: 'Back to Start',
    },
    paid: {
      paymentConfirmed: 'Payment Confirmed!',
      latePaymentConfirmed: 'Late Payment Confirmed',
      orderCompleted: 'Your payment was successfully verified on BNB Smart Chain.',
      txHashLabel: 'Transaction Hash (txHash)',
      viewOnBscScan: 'View on BscScan',
      downloadProduct: 'Download Creator Pack',
      instantDeliveryNotice: 'Secure instant digital delivery powered by VOLT Engine.',
      confirmationsCount: 'Confirmations',
    },
    whyUs: {
      badge: 'Next-Gen USDT Payment Gateway',
      heading: 'Why Creators & Developers Choose VOLT Paywall over Stripe or CryptoPay?',
      subheading: 'The fastest, non-custodial USDT BEP-20 payment gateway designed for creators, SaaS, and digital sellers seeking full revenue control.',
      card1Title: '0% Intermediary Fees',
      card1Sub: 'DIRECT WALLET-TO-WALLET PAYMENTS',
      card1Desc: 'Unlike Stripe or custodial crypto processors charging 1% to 5% per transaction, VOLT Paywall transfers 100% of USDT directly to your personal wallet. Only standard BNB chain gas (~$0.01 - $0.03) applies.',
      tradGatewaysFee: 'Traditional Gateways',
      voltFee: 'VOLT Paywall',
      card2Title: '100% Self-Custodial (Non-Custodial)',
      card2Desc: 'Your funds never touch centralized servers. Zero risk of account freezes, rolling reserves, or malicious chargebacks.',
      card2Foot: 'Your Wallet, Your Keys',
      card3Title: 'Automated On-Chain Verification',
      card3Desc: 'Smart scanning of Transfer events on BNB Smart Chain with RPC failover tolerance and instant digital delivery.',
      card3Foot: 'Instant Confirmation (~3 sec)',
      card4Title: 'Serverless Deploy in 2 Minutes',
      card4Sub: 'Cloudflare Workers + Vite / React + D1 SQLite',
      card4Desc: 'Modern architecture ready to deploy on Cloudflare Workers or any Node.js server. No complex database setup required.',
      noKyc: 'No signups or KYC',
      walletQrSupport: 'MetaMask & QR Support',
      globalBorderless: 'Global & Borderless',
      tableHeading: 'Direct Gateway Comparison (2026)',
      tableSub: 'Compare key features of VOLT Paywall against market alternatives.',
      colFeature: 'Feature',
      colStripe: 'Stripe / Cards',
      colCryptoCentralized: 'Centralized Crypto (BitPay/Coinbase)',
      colVolt: 'VOLT Paywall',
      rowFee: 'Transaction Fee',
      stripeFeeVal: '2.9% + $0.30 USD',
      cryptoFeeVal: '1.0% - 2.0% per tx',
      voltFeeVal: '0.00% (BSC Gas Only)',
      rowCustody: 'Fund Custody',
      stripeCustodyVal: 'Centralized (Stripe Hold)',
      cryptoCustodyVal: 'Centralized (Exchange)',
      voltCustodyVal: '100% Non-Custodial',
      rowPayout: 'Payout / Settlement',
      stripePayoutVal: '7 - 14 Business Days',
      cryptoPayoutVal: '24 - 48 Hours',
      voltPayoutVal: 'Instant (~3 seconds)',
      rowChargebacks: 'Chargeback Risk',
      stripeChargebackVal: 'High (Card Fraud / Disputes)',
      cryptoChargebackVal: 'Low',
      voltChargebackVal: '0% (Impossible on Blockchain)',
      rowKyc: 'KYC & Signup Requirements',
      stripeKycVal: 'Mandatory & Extensive',
      cryptoKycVal: 'Mandatory Corporate KYC',
      voltKycVal: 'No Signup / No KYC Required',
    },
    embed: {
      title: 'No-Code Integration & Embed Generator',
      subtitle: 'Generate your checkout link or embed the paywall into any website in seconds.',
      tabGenerator: 'Embed & Link Generator',
      tabQuickstart: '3-Step Quickstart Guide',
      configTitle: 'Configure Checkout Parameters',
      walletLabel: 'Recipient Wallet Address (EVM / BSC)',
      productLabel: 'Product Name',
      amountLabel: 'Amount in USDT',
      networkLabel: 'BNB Smart Chain Network',
      directLinkTitle: 'Direct Checkout Link',
      copyLink: 'Copy Link',
      copiedLink: 'Copied!',
      iframeTitle: 'HTML / Iframe Code for WordPress, Webflow, or Custom Sites',
      copyIframe: 'Copy Iframe Code',
      copiedIframe: 'Copied!',
      quickstartTitle: '2-Minute Deployment Guide',
      step1Title: 'Configure Environment Variables',
      step1Desc: 'Set your recipient wallet address and contract details in your .env or Cloudflare Worker variables.',
      step2Title: 'Deploy Serverless Backend',
      step2Desc: 'Run npx wrangler deploy to publish the API and D1 SQLite database.',
      step3Title: 'Embed Iframe or Share Link',
      step3Desc: 'Paste the generated iframe snippet into your website. Payments arrive directly in your wallet!',
      copyEnv: 'Copy .env Snippet',
      copiedEnv: 'Copied!',
      close: 'Close',
    },
    footer: {
      poweredBy: 'Powered by VOLT Engine · Secure Payment Interface',
      generateEmbed: 'Generate No-Code Embed',
      serverOnline: 'Server Status: Online',
    },
  },

  ES: {
    nav: {
      title: 'VOLT PAYWALL',
      modeDemo: 'Modo: DEMO',
      modeLocal: 'Worker: LOCAL',
      modeProd: 'Worker: PROD',
      integrateNoCode: 'Integrar No-Code',
      resetDemo: 'Reiniciar Demo',
    },
    product: {
      paywallTag: 'VOLT PAYWALL',
      noFeesTag: '0% COMISIONES',
      nonCustodialTag: 'USDT Autocustodia',
      title: 'All-in-One\nCreator Pack',
      tagline: 'Pasarela de Pagos USDT BEP-20',
      description: 'Código fuente completo + guía paso a paso + licencia comercial ilimitada. Entrega digital inmediata.',
      feature1: 'Código fuente completo 100% editable',
      feature2: 'Guía paso a paso en PDF para implementación',
      feature3: 'Licencia comercial ilimitada',
      feature4: 'Entrega digital inmediata al confirmar pago',
      totalPrice: 'PRECIO TOTAL',
      paymentMethod: 'MÉTODO DE PAGO',
      payWithWallet: 'Pagar con Wallet',
      manualPayment: 'Pago Manual / QR',
      walletMethodSub: 'Transferencia exacta de 39.00 USDT vía MetaMask o Trust Wallet (BNB Smart Chain).',
      manualMethodSub: 'Transferencia con decimales de control únicos para verificación automática sin conectar wallet.',
      buyNowWallet: 'Proceder con Wallet',
      buyNowManual: 'Proceder con Pago Manual',
      creatingOrder: 'Creando orden...',
      secureNotice: 'Pago seguro verificado directamente en BNB Smart Chain Testnet',
      retry: 'Reintentar',
      connectionError: 'Error de conexión al crear la orden.',
    },
    checkout: {
      activeOrder: 'ORDEN CREADA',
      timeRemaining: 'TIEMPO RESTANTE',
      orderId: 'ID de Orden',
      amountToPay: 'Monto a Transferir',
      recipientAddress: 'Wallet Receptora',
      network: 'Red de Pago',
      statusPending: 'Esperando Pago...',
      statusConfirming: 'Confirmando On-Chain...',
      copyAddress: 'Copiar Dirección',
      addressCopied: '¡Dirección Copiada!',
      sendWalletTx: 'Pagar 39.00 USDT vía Web3 Wallet',
      txSentConfirming: 'Transacción Emitida - Confirmando...',
      simulatePaymentDemo: 'Simular Confirmación de Pago (Modo Demo)',
      simulating: 'Simulando pago...',
      manualInstructions: 'Envía el monto exacto indicado a la dirección receptora. La verificación se realiza automáticamente en tiempo real.',
      expiredTitle: 'La orden ha expirado',
      expiredDesc: 'El tiempo límite para realizar el pago finalizó. Por favor crea una nueva orden.',
      createNewOrder: 'Crear nueva orden',
      cancelledTitle: 'Orden cancelada',
      cancelledDesc: 'Esta orden de pago ha sido cancelada o requiere revisión manual.',
      backToStart: 'Volver al inicio',
    },
    paid: {
      paymentConfirmed: '¡Pago Confirmado!',
      latePaymentConfirmed: 'Pago Tardío Confirmado',
      orderCompleted: 'Tu pago ha sido verificado con éxito en BNB Smart Chain.',
      txHashLabel: 'Hash de Transacción (txHash)',
      viewOnBscScan: 'Ver en BscScan',
      downloadProduct: 'Descargar Creator Pack',
      instantDeliveryNotice: 'Entrega digital inmediata garantizada por VOLT Engine.',
      confirmationsCount: 'Confirmaciones',
    },
    whyUs: {
      badge: 'Pasarela de Pagos USDT de Nueva Generación',
      heading: '¿Por qué Creadores y Developers eligen VOLT Paywall frente a Stripe o CryptoPay?',
      subheading: 'La pasarela de cobros en USDT BEP-20 non-custodial más rápida, segura y económica para monetizar productos digitales a nivel global.',
      card1Title: '0% Comisiones por Intermediarios',
      card1Sub: 'PAGOS DIRECTOS WALLET-A-WALLET',
      card1Desc: 'A diferencia de Stripe o procesadores crypto con custodia que cobran del 1% al 5% por transacción, VOLT Paywall transfiere el 100% de los USDT directamente a tu wallet personal. Solo se paga el gas estándar de BNB Smart Chain (~$0.01 - $0.03).',
      tradGatewaysFee: 'Pasarelas Tradicionales',
      voltFee: 'VOLT Paywall',
      card2Title: '100% Autocustodia (Non-Custodial)',
      card2Desc: 'Tus fondos nunca tocan servidores centralizados. Sin riesgo de congelamiento de cuenta, bloqueos de saldo ni chargebacks maliciosos.',
      card2Foot: 'Tu Wallet, Tus Claves',
      card3Title: 'Verificación On-Chain Automatizada',
      card3Desc: 'Escaneo inteligente de eventos Transfer en BNB Smart Chain con tolerancia a fallos RPC y respuesta inmediata para entrega digital.',
      card3Foot: 'Confirmación Instantánea (~3 sec)',
      card4Title: 'Despliegue Serverless en 2 Minutos',
      card4Sub: 'Cloudflare Workers + Vite / React + D1 SQLite',
      card4Desc: 'Arquitectura moderna lista para subir a Cloudflare Workers o cualquier servidor Node.js. Sin bases de datos complejas de configurar.',
      noKyc: 'Sin registros ni KYC',
      walletQrSupport: 'Soporte MetaMask & QR',
      globalBorderless: 'Global sin fronteras',
      tableHeading: 'Tabla Comparativa Directa (2026)',
      tableSub: 'Compara las características clave de VOLT Paywall frente a las alternativas del mercado.',
      colFeature: 'Característica',
      colStripe: 'Stripe / Tarjetas',
      colCryptoCentralized: 'Crypto Centralizado (BitPay/Coinbase)',
      colVolt: 'VOLT Paywall',
      rowFee: 'Comisión por Transacción',
      stripeFeeVal: '2.9% + $0.30 USD',
      cryptoFeeVal: '1.0% - 2.0% por tx',
      voltFeeVal: '0.00% (Solo Gas BSC)',
      rowCustody: 'Custodia de Fondos',
      stripeCustodyVal: 'Centralizada (Retención Stripe)',
      cryptoCustodyVal: 'Centralizada (Exchange)',
      voltCustodyVal: '100% Autocustodia',
      rowPayout: 'Liquidación / Pagos',
      stripePayoutVal: '7 - 14 Días Hábiles',
      cryptoPayoutVal: '24 - 48 Horas',
      voltPayoutVal: 'Instantánea (~3 segundos)',
      rowChargebacks: 'Riesgo de Chargebacks',
      stripeChargebackVal: 'Alto (Fraude de tarjetas)',
      cryptoChargebackVal: 'Bajo',
      voltChargebackVal: '0% (Imposible en Blockchain)',
      rowKyc: 'Requisitos de KYC / Registro',
      stripeKycVal: 'Obligatorio y Extenso',
      cryptoKycVal: 'KYC Corporativo Obligatorio',
      voltKycVal: 'Sin Registro / Sin KYC',
    },
    embed: {
      title: 'Integración No-Code y Generador de Embed',
      subtitle: 'Genera tu enlace de cobro o incrusta la pasarela en cualquier web en segundos.',
      tabGenerator: 'Generador de Embed y Link',
      tabQuickstart: 'Guía Rápida en 3 Pasos',
      configTitle: 'Configura los Parámetros de Cobro',
      walletLabel: 'Wallet Receptora (EVM / BSC)',
      productLabel: 'Nombre del Producto',
      amountLabel: 'Monto en USDT',
      networkLabel: 'Red BNB Smart Chain',
      directLinkTitle: 'Enlace Directo de Pago',
      copyLink: 'Copiar Enlace',
      copiedLink: '¡Copiado!',
      iframeTitle: 'Código HTML / Iframe para WordPress, Webflow o Webs Personalizadas',
      copyIframe: 'Copiar Código Iframe',
      copiedIframe: '¡Copiado!',
      quickstartTitle: 'Guía de Despliegue en 2 Minutos',
      step1Title: 'Configura tus Variables de Entorno',
      step1Desc: 'Establece tu wallet receptora y dirección de contrato en tu archivo .env o en Cloudflare Workers.',
      step2Title: 'Despliega el Backend Serverless',
      step2Desc: 'Ejecuta npx wrangler deploy para publicar la API y la base de datos D1 SQLite.',
      step3Title: 'Incrusta el Iframe o Comparte el Enlace',
      step3Desc: 'Pega el código iframe generado en tu sitio web. ¡Los pagos en USDT llegarán directamente a tu wallet!',
      copyEnv: 'Copiar Fragmento .env',
      copiedEnv: '¡Copiado!',
      close: 'Cerrar',
    },
    footer: {
      poweredBy: 'Powered by VOLT Engine · Secure Payment Interface',
      generateEmbed: 'Generar Embed No-Code',
      serverOnline: 'Estado del Servidor: En línea',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Detect browser language
    if (typeof window !== 'undefined' && window.navigator) {
      const browserLang = window.navigator.language || '';
      if (browserLang.toLowerCase().startsWith('es')) {
        return 'ES';
      }
    }
    return 'EN'; // Default language
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

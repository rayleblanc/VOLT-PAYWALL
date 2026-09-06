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
    heroHeadline: string;
    heroSubheadline: string;
    title: string;
    tagline: string;
    description: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    originalPrice: string;
    discountBadge: string;
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
    urgencyBadge: string;
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
    valueSectionBadge: string;
    valueSectionHeading: string;
    valueSectionSubheading: string;
    roiTitle: string;
    roiSubtitle: string;
    roiMathGumroad: string;
    roiMathLemon: string;
    roiMathVolt: string;
    roiMathSaved: string;
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
    colGumroad: string;
    colCryptoCentralized: string;
    colVolt: string;
    rowFee: string;
    stripeFeeVal: string;
    gumroadFeeVal: string;
    cryptoFeeVal: string;
    voltFeeVal: string;
    rowCustody: string;
    stripeCustodyVal: string;
    gumroadCustodyVal: string;
    cryptoCustodyVal: string;
    voltCustodyVal: string;
    rowPayout: string;
    stripePayoutVal: string;
    gumroadPayoutVal: string;
    cryptoPayoutVal: string;
    voltPayoutVal: string;
    rowChargebacks: string;
    stripeChargebackVal: string;
    gumroadChargebackVal: string;
    cryptoChargebackVal: string;
    voltChargebackVal: string;
    rowKyc: string;
    stripeKycVal: string;
    gumroadKycVal: string;
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

  // FAQ Section
  faq: {
    badge: string;
    heading: string;
    subheading: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
    supportNotice: string;
    supportAction: string;
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
      heroHeadline: 'Your own crypto gateway on Cloudflare Free.',
      heroSubheadline: '0% fees, direct wallet payouts, total control.',
      title: 'All-in-One\nCreator Pack',
      tagline: 'USDT BEP-20 Payment Gateway',
      description: 'Complete source code + step-by-step implementation guide + unlimited commercial license. Instant digital delivery.',
      feature1: '0% lifetime transaction fees (Direct P2P)',
      feature2: 'Deploy on Cloudflare Free ($0/mo hosting)',
      feature3: 'Complete source code + step-by-step PDF guide',
      feature4: 'Unlimited commercial license + instant delivery',
      originalPrice: '$99.00 USD',
      discountBadge: '60% OFF',
      totalPrice: 'LIMITED OFFER PRICE',
      paymentMethod: 'PAYMENT METHOD',
      payWithWallet: 'Pay with Wallet',
      manualPayment: 'Manual Payment / QR',
      walletMethodSub: 'Exact payment of 39.00 USDT via Web3 Wallet (BNB Smart Chain).',
      manualMethodSub: 'Transfer with unique control decimals for automatic verification without connecting wallet.',
      buyNowWallet: 'Get Creator Pack — 39 USDT',
      buyNowManual: 'Proceed with Manual Payment',
      creatingOrder: 'Creating order...',
      secureNotice: 'Instant digital delivery upon on-chain confirmation',
      retry: 'Retry',
      connectionError: 'Connection error while creating order.',
      urgencyBadge: 'LAUNCH OFFER · SAVE $60 USD',
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
      valueSectionBadge: 'POR QUÉ VALE MÁS DE $39 USDT / VALUE STACK',
      valueSectionHeading: 'Why VOLT Paywall is Worth 10x More Than $39 USDT',
      valueSectionSubheading: 'Gumroad & Lemon Squeezy eat up to 10% of your hard-earned revenue. VOLT Paywall gives you 100% financial independence for life.',
      roiTitle: 'Instant ROI Calculation: Gumroad vs. VOLT Paywall',
      roiSubtitle: 'How much money are you giving away to platform fees every time you sell $5,000 USD?',
      roiMathGumroad: 'Gumroad Fees (10% + $0.30): You pay $500.00+ USD to intermediaries',
      roiMathLemon: 'Lemon Squeezy (5% + $0.50 + 10% Reserve): $250+ USD held for 90 days',
      roiMathVolt: 'VOLT Paywall ($39 USDT One-Time): $0.00 platform fees. 100% directly in your wallet',
      roiMathSaved: 'Net Profit Saved: $500.00 USD on your first $5k sales — 12x ROI on day 1!',
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
      tableHeading: 'Direct Gateway Cost & Risk Comparison (2026)',
      tableSub: 'Compare key features and hidden platform fees of VOLT Paywall against market alternatives.',
      colFeature: 'Feature',
      colStripe: 'Stripe / Cards',
      colGumroad: 'Gumroad / Lemon Squeezy',
      colCryptoCentralized: 'Centralized Crypto (BitPay/Coinbase)',
      colVolt: 'VOLT Paywall (BEP-20)',
      rowFee: 'Transaction / Platform Fee',
      stripeFeeVal: '2.9% + $0.30 USD',
      gumroadFeeVal: '10.0% or 5.0% + $0.50',
      cryptoFeeVal: '1.0% - 2.0% per tx',
      voltFeeVal: '0.00% (0% Platform Fee)',
      rowCustody: 'Fund Custody & Risk',
      stripeCustodyVal: 'Centralized (Stripe Hold)',
      gumroadCustodyVal: '10% Rolling Reserve (90 Days)',
      cryptoCustodyVal: 'Centralized Exchange',
      voltCustodyVal: '100% Non-Custodial (Direct P2P)',
      rowPayout: 'Payout / Settlement',
      stripePayoutVal: '7 - 14 Business Days',
      gumroadPayoutVal: 'Weekly Payouts (Delayed)',
      cryptoPayoutVal: '24 - 48 Hours',
      voltPayoutVal: 'Instant (~3 seconds)',
      rowChargebacks: 'Chargeback & Ban Risk',
      stripeChargebackVal: 'High (Card Fraud / Disputes)',
      gumroadChargebackVal: 'High (Risk of Account Bans)',
      cryptoChargebackVal: 'Low',
      voltChargebackVal: '0% (Impossible on Blockchain)',
      rowKyc: 'KYC & Signup Requirements',
      stripeKycVal: 'Mandatory & Extensive',
      gumroadKycVal: 'Identity & Bank Verification',
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
    faq: {
      badge: 'FREQUENTLY ASKED QUESTIONS',
      heading: 'Everything You Need to Know Before Buying',
      subheading: 'Clear answers to common questions about deployment, fees, and non-custodial ownership.',
      q1: 'Do I need to pay monthly Cloudflare subscription fees?',
      a1: 'No, absolutely not. The entire stack (Cloudflare Workers, KV, and D1 SQLite) operates 100% within Cloudflare’s Free tier, which includes 100,000 requests per day. Your monthly hosting cost is $0 USD.',
      q2: 'How do I receive payments?',
      a2: 'All transfers go direct P2P to your non-custodial Web3 wallet. VOLT Paywall never holds, touches, or freezes your funds. You get instant settlement with 0% platform fees.',
      q3: 'What if I need help installing it?',
      a3: 'It includes an automated 1-click ./setup.sh script and a step-by-step installation guide in both English and Spanish. Any developer or creator can deploy it to Cloudflare in under 2 minutes.',
      q4: 'What exactly is included in my $39 USDT purchase?',
      a4: 'You get full 100% editable source code (React + Vite + Tailwind CSS + Cloudflare Worker API), automated ./setup.sh script, PDF/Markdown step-by-step deployment guide, No-Code embed generator, unlimited commercial license, and lifetime updates.',
      q5: 'Do I need company registration or KYC verification?',
      a5: 'Zero registration, zero business documents, and zero KYC required. Just set your wallet address in your configuration file and start accepting payments globally in minutes.',
      supportNotice: 'Have more technical questions?',
      supportAction: 'Read Quickstart Guide',
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
      heroHeadline: 'Tu propia pasarela crypto en Cloudflare Free.',
      heroSubheadline: '0% comisiones, cobros directos a tu wallet, control total.',
      title: 'All-in-One\nCreator Pack',
      tagline: 'Pasarela de Pagos USDT BEP-20',
      description: 'Código fuente completo + guía paso a paso + licencia comercial ilimitada. Entrega digital inmediata.',
      feature1: '0% comisiones de por vida (Cobros directo P2P)',
      feature2: 'Despliegue en Cloudflare Free ($0/mes hosting)',
      feature3: 'Código fuente completo + guía PDF paso a paso',
      feature4: 'Licencia comercial ilimitada + entrega inmediata',
      originalPrice: '$99.00 USD',
      discountBadge: '60% OFF',
      totalPrice: 'PRECIO EN OFERTA',
      paymentMethod: 'MÉTODO DE PAGO',
      payWithWallet: 'Pagar con Wallet',
      manualPayment: 'Pago Manual / QR',
      walletMethodSub: 'Transferencia exacta de 39.00 USDT vía Web3 Wallet (BNB Smart Chain).',
      manualMethodSub: 'Transferencia con decimales de control únicos para verificación automática sin conectar wallet.',
      buyNowWallet: 'Obtener Creator Pack — 39 USDT',
      buyNowManual: 'Proceder con Pago Manual',
      creatingOrder: 'Creando orden...',
      secureNotice: 'Entrega digital inmediata al confirmar en blockchain',
      retry: 'Reintentar',
      connectionError: 'Error de conexión al crear la orden.',
      urgencyBadge: 'OFERTA DE LANZAMIENTO · AHORRA $60 USD',
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
      valueSectionBadge: 'POR QUÉ VALE MÁS DE $39 USDT / AHORRO REAL',
      valueSectionHeading: 'Por qué VOLT Paywall vale 10 veces más que $39 USDT',
      valueSectionSubheading: 'Gumroad y Lemon Squeezy se quedan con hasta el 10% de tus ingresos. VOLT Paywall te da independencia financiera total de por vida.',
      roiTitle: 'Cálculo de Retorno Inmediato (ROI): Gumroad vs. VOLT Paywall',
      roiSubtitle: '¿Cuánto dinero regalas en comisiones de plataforma cada vez que vendes $5,000 USD?',
      roiMathGumroad: 'Comisión Gumroad (10% + $0.30): Pagas $500.00+ USD a intermediarios',
      roiMathLemon: 'Lemon Squeezy (5% + $0.50 + 10% Retención): $250+ USD retenidos por 90 días',
      roiMathVolt: 'VOLT Paywall ($39 USDT Pago Único): $0.00 en comisiones. 100% directo a tu wallet',
      roiMathSaved: 'Ahorro Neto Real: $500.00 USD en tus primeros $5,000 en ventas — ¡Recuperas tu inversión 12 veces desde el primer día!',
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
      tableHeading: 'Tabla Comparativa Directa de Costos y Riesgos (2026)',
      tableSub: 'Compara las características clave y comisiones ocultas de VOLT Paywall frente a las alternativas del mercado.',
      colFeature: 'Característica',
      colStripe: 'Stripe / Tarjetas',
      colGumroad: 'Gumroad / Lemon Squeezy',
      colCryptoCentralized: 'Crypto Centralizado (BitPay/Coinbase)',
      colVolt: 'VOLT Paywall (BEP-20)',
      rowFee: 'Comisión por Transacción / Plataforma',
      stripeFeeVal: '2.9% + $0.30 USD',
      gumroadFeeVal: '10.0% o 5.0% + $0.50',
      cryptoFeeVal: '1.0% - 2.0% por tx',
      voltFeeVal: '0.00% (0% Comisión de Plataforma)',
      rowCustody: 'Custodia de Fondos y Riesgo',
      stripeCustodyVal: 'Centralizada (Retención Stripe)',
      gumroadCustodyVal: '10% Retención Rolling (90 Días)',
      cryptoCustodyVal: 'Exchange Centralizado',
      voltCustodyVal: '100% Autocustodia (Directo P2P)',
      rowPayout: 'Liquidación / Pagos',
      stripePayoutVal: '7 - 14 Días Hábiles',
      gumroadPayoutVal: 'Pagos Semanales (Con Retardo)',
      cryptoPayoutVal: '24 - 48 Horas',
      voltPayoutVal: 'Instantánea (~3 segundos)',
      rowChargebacks: 'Riesgo de Chargebacks y Bloqueos',
      stripeChargebackVal: 'Alto (Fraude de Tarjetas)',
      gumroadChargebackVal: 'Alto (Riesgo de Cierre de Cuenta)',
      cryptoChargebackVal: 'Bajo',
      voltChargebackVal: '0% (Imposible en Blockchain)',
      rowKyc: 'Requisitos de KYC / Registro',
      stripeKycVal: 'Obligatorio y Extenso',
      gumroadKycVal: 'Verificación Bancaria e Identidad',
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
    faq: {
      badge: 'PREGUNTAS FRECUENTES',
      heading: 'Todo lo que necesitas saber antes de comprar',
      subheading: 'Respuestas claras para resolver cualquier duda sobre despliegue, costos y autocustodia.',
      q1: '¿Necesito pagar mensualidades a Cloudflare?',
      a1: 'No, en absoluto. Todo el stack (Cloudflare Workers, KV y D1 SQLite) corre 100% en el plan gratuito de Cloudflare, el cual incluye 100,000 peticiones diarias sin costo. Tu costo operativo mensual es de $0 USD.',
      q2: '¿Cómo recibo los pagos?',
      a2: 'Las transferencias van directo P2P a tu wallet personal Web3, sin custodia intermedia. VOLT Paywall nunca retiene, toca ni congela tu dinero. Recibes tus ingresos al instante con 0% comisiones.',
      q3: '¿Qué pasa si necesito ayuda para instalarlo?',
      a3: 'Incluye el script automatizado ./setup.sh en 1 clic y una guía paso a paso en español e inglés. Cualquier desarrollador o creador puede desplegarlo en Cloudflare en menos de 2 minutos sin complicaciones.',
      q4: '¿Qué incluye mi pago de $39 USDT?',
      a4: 'Incluye el código fuente completo 100% editable (React + Vite + Tailwind + Cloudflare Worker backend), script automatizado ./setup.sh en 1 clic, guía PDF/Markdown paso a paso, generador no-code de embed, licencia comercial ilimitada y actualizaciones de por vida.',
      q5: '¿Requiere registro de empresa o verificación KYC?',
      a5: 'Cero registros, cero trámites de empresa y cero verificación KYC. Solo configuras tu dirección de wallet y comienzas a cobrar a clientes de todo el mundo en minutos.',
      supportNotice: '¿Tienes dudas adicionales sobre la integración?',
      supportAction: 'Ver Guía de Instalación',
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

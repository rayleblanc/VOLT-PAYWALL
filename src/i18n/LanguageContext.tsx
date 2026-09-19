import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'EN' | 'ES';

export interface Translations {
  // Navigation & General Header
  nav: {
    title: string;
    modeDemo: string;
    modeLocal: string;
    modeProd: string;
    integrateNoCode: string;
    resetDemo: string;
  };

  // 1) Hero Section
  hero: {
    headline: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    launchBadge: string;
    badgeZeroFee: string;
    badgeNonCustodial: string;
    badgeNetwork: string;
    tagline: string;
    runsOnCloudflare: string;
  };

  // 2) Pain Section
  pain: {
    badge: string;
    heading: string;
    subheading: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
  };

  // 3) How It Works Section
  howItWorks: {
    badge: string;
    heading: string;
    subheading: string;
    step1Badge: string;
    step1Title: string;
    step1Desc: string;
    step2Badge: string;
    step2Title: string;
    step2Desc: string;
    step3Badge: string;
    step3Title: string;
    step3Desc: string;
  };

  // 4) What You Get (Concreto)
  whatYouGet: {
    badge: string;
    heading: string;
    subheading: string;
    item1Title: string;
    item1Desc: string;
    item2Title: string;
    item2Desc: string;
    item3Title: string;
    item3Desc: string;
    item4Title: string;
    item4Desc: string;
    item5Title: string;
    item5Desc: string;
    item6Title: string;
    item6Desc: string;
    item7Title: string;
    item7Desc: string;
  };

  // 5) What You Do NOT Get (Confianza / Honestidad)
  whatYouDoNotGet: {
    badge: string;
    heading: string;
    subheading: string;
    item1Title: string;
    item1Desc: string;
    item2Title: string;
    item2Desc: string;
    item3Title: string;
    item3Desc: string;
    item4Title: string;
    item4Desc: string;
  };

  // 6) Comparison vs Gumroad / Lemon Squeezy
  comparison: {
    badge: string;
    heading: string;
    subheading: string;
    colFeature: string;
    colGumroad: string;
    colLemon: string;
    colVolt: string;
    rowFee: string;
    gumroadFee: string;
    lemonFee: string;
    voltFee: string;
    rowCustody: string;
    gumroadCustody: string;
    lemonCustody: string;
    voltCustody: string;
    rowPayout: string;
    gumroadPayout: string;
    lemonPayout: string;
    voltPayout: string;
    rowChargebacks: string;
    gumroadChargebacks: string;
    lemonChargebacks: string;
    voltChargebacks: string;
    rowCost: string;
    gumroadCost: string;
    lemonCost: string;
    voltCost: string;
  };

  // 7) Pricing & Product Card
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
    directBscText: string;
    demoButton: string;
  };

  // Active Checkout Card
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

  // Paid Confirmation Card
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

  // 8) FAQ Section
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
  };

  // 9) Future Catalog / Coming Next
  catalog: {
    badge: string;
    title: string;
    sub: string;
    startsCopy: string;
    comingSoonTag: string;
  };

  // Mobile & Desktop Navigation Tabs
  navTabs: {
    checkout: string;
    demo: string;
    kit: string;
    comparison: string;
    faq: string;
    all: string;
    buyNowFloating: string;
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

  // Interactive Demo Sandbox
  demoPlayground: {
    badge: string;
    heading: string;
    subheading: string;
    bannerNotice: string;
    ctaFixed: string;
    tabCheckout: string;
    tabBrand: string;
    tabSavings: string;
    tabWorkerChecks: string;
    checkoutBadge: string;
    checkoutTitle: string;
    sampleToyPrice: string;
    sampleToyDisclaimer: string;
    copyAddress: string;
    copiedAddress: string;
    networkNotice: string;
    btnSimulateWallet: string;
    btnSimulateManual: string;
    btnResetDemo: string;
    verifyingTitle: string;
    verifyingStep1: string;
    verifyingStep2: string;
    verifyingStep3: string;
    successTitle: string;
    successDesc: string;
    sampleDownloadBtn: string;
    sampleFileNotice: string;
    brandTitle: string;
    brandDesc: string;
    storeNameLabel: string;
    productNameLabel: string;
    priceLabel: string;
    colorLabel: string;
    copyEmbedCode: string;
    copiedEmbedCode: string;
    livePreviewTag: string;
    savingsTitle: string;
    savingsDesc: string;
    monthlySalesLabel: string;
    productPriceLabel: string;
    gumroadLoss: string;
    lemonLoss: string;
    voltPlatformCut: string;
    netAnnualSavings: string;
    netMonthlySavings: string;
    estimateDisclaimer: string;
    workerChecksTitle: string;
    workerChecksDesc: string;
    check1Title: string;
    check1Detail: string;
    check2Title: string;
    check2Detail: string;
    check3Title: string;
    check3Detail: string;
    check4Title: string;
    check4Detail: string;
    check5Title: string;
    check5Detail: string;
    provableThingsTitle: string;
    provableThingsSubtitle: string;
    provableThingsList: Array<{ title: string; desc: string; badge: string }>;
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
    hero: {
      headline: 'Self-hosted USDT checkout for digital products',
      sub: 'Accept USDT (BEP-20) on BNB Smart Chain straight to your wallet. 0% platform fee. Full source code.',
      ctaPrimary: 'Buy the Kit — 29 USDT',
      ctaSecondary: 'Try interactive demo',
      launchBadge: 'Founding / Launch Offer',
      badgeZeroFee: '0% Platform Fee',
      badgeNonCustodial: '100% Non-Custodial',
      badgeNetwork: 'BNB Smart Chain (BEP-20)',
      tagline: 'Direct P2P crypto payments for creators, developers & digital products',
      runsOnCloudflare: 'Runs on Cloudflare. Add your own domain later.',
    },
    pain: {
      badge: 'THE PROBLEM WITH LEGACY PLATFORMS',
      heading: 'Stop Sacrificing 10% of Your Revenue to Intermediaries',
      subheading: 'Why creators and digital sellers are ditching Gumroad, Lemon Squeezy, and Stripe',
      card1Title: '10% Gumroad & Lemon Squeezy Fees',
      card1Desc: 'Gumroad takes 10% + $0.30 and Lemon Squeezy takes 5% + $0.50 on every single sale. On $5,000 of digital products, you bleed $250 - $530+ to a middleman.',
      card2Title: '90-Day Rolling Reserves & Holds',
      card2Desc: 'Custodial platforms arbitrarily lock 10% of your earnings for 90 days under the pretext of risk management, strangling your operating cash flow.',
      card3Title: 'Stripe Denials & Chargeback Disputes',
      card3Desc: 'Sudden account terminations, steep $15 dispute fees on fraudulent chargebacks, and strict geographic restrictions locking out international buyers.',
      card4Title: 'No Need for Another Crypto SaaS',
      card4Desc: 'Why pay $29/mo or $99/mo to a third-party crypto gateway that holds your funds and can change their terms overnight? Own your infrastructure for life.',
    },
    howItWorks: {
      badge: '3-STEP PROCESS',
      heading: 'How It Works',
      subheading: 'From zero to receiving payments directly in your wallet in less than 2 minutes',
      step1Badge: 'STEP 1',
      step1Title: 'Deploy on Cloudflare',
      step1Desc: 'Run our 1-click setup script or wrangler deploy to publish on Cloudflare Workers ($0/mo on the free tier, 100k requests/day).',
      step2Badge: 'STEP 2',
      step2Title: 'Customer pays USDT to your wallet',
      step2Desc: 'Your customer transfers USDT (BEP-20) directly to your personal EVM address. 100% peer-to-peer, zero intermediary custody.',
      step3Badge: 'STEP 3',
      step3Title: 'Worker verifies on-chain and unlocks access',
      step3Desc: 'The Worker detects the on-chain transfer event (~3s), validates the exact amount, and unlocks the tokenized download immediately.',
    },
    whatYouGet: {
      badge: 'EVERYTHING INCLUDED',
      heading: 'What You Get in the Commercial Kit',
      subheading: 'A complete, production-ready software package to sell digital products with crypto',
      item1Title: 'Source Worker + Frontend',
      item1Desc: 'Full editable stack with React 18, Vite, Tailwind CSS, and Cloudflare Worker API (Hono + TypeScript). Clean, modular, and unbloated.',
      item2Title: 'Studio & Embed Generator',
      item2Desc: 'Visual generator to produce responsive iframe embed snippets and direct checkout links ready for WordPress, Webflow, Shopify, Notion, or custom sites.',
      item3Title: 'Automated On-Chain Verification',
      item3Desc: 'Multi-node RPC failover engine that monitors Binance-Peg USDT BEP-20 transfer events with real-time settlement (~3s finality).',
      item4Title: 'Anti-Replay Architecture',
      item4Desc: 'Idempotent payment ledger, block range validation, and single-use txHash checking to strictly prevent double-spending and replay attacks.',
      item5Title: 'Unlimited Commercial License',
      item5Desc: 'Deploy on unlimited personal stores, SaaS products, or client projects. Zero recurring fees, zero restrictions, and zero royalties forever.',
      item6Title: 'Beginner-Friendly Documentation',
      item6Desc: 'Step-by-step PDF & Markdown deployment guides with complete environment variables reference and 1-click setup.sh script.',
      item7Title: 'Optional Telegram Alerts',
      item7Desc: 'Pre-configured native webhook that pings your phone or private channel the instant a sale is confirmed on-chain.',
    },
    whatYouDoNotGet: {
      badge: 'RADICAL HONESTY & TRUST',
      heading: 'What You Do NOT Get',
      subheading: 'Honest boundaries so you know exactly what you are purchasing with zero false promises',
      item1Title: 'No File DRM',
      item1Desc: 'Files are delivered as clean standard digital downloads (ZIP). We do not inject invasive DRM, telemetry, or proprietary reader locks into your customer’s files.',
      item2Title: 'No Managed Customer File Hosting',
      item2Desc: 'You host your digital files wherever you prefer (Cloudflare R2, AWS S3, Google Drive, or your own server). VOLT manages checkout and tokenized access.',
      item3Title: 'No Multi-Chain in v1',
      item3Desc: 'Engineered strictly for BNB Smart Chain (BEP-20) to maintain sub-cent gas fees (~$0.01-$0.03) and ~3-second block times without multi-chain complexity.',
      item4Title: 'Network Gas is Separate',
      item4Desc: 'Buyers pay their own standard microscopic BSC network gas (~$0.01-$0.03) directly via their wallet, just like any standard on-chain transfer.',
    },
    comparison: {
      badge: 'COMMISSIONS & MONEY CONTROL',
      heading: 'VOLT Paywall vs. Gumroad & Lemon Squeezy',
      subheading: 'Commissions and money control compared side-by-side',
      colFeature: 'Feature',
      colGumroad: 'Gumroad',
      colLemon: 'Lemon Squeezy',
      colVolt: 'VOLT Paywall',
      rowFee: 'Platform Fee',
      gumroadFee: '10% + $0.30 per sale',
      lemonFee: '5% + $0.50 per sale',
      voltFee: '0% (0.00% Platform Fee)',
      rowCustody: 'Fund Custody',
      gumroadCustody: 'Platform retains your balance',
      lemonCustody: 'Platform retains your balance',
      voltCustody: '100% Direct to Your Wallet',
      rowPayout: 'Payout Timing',
      gumroadPayout: 'Weekly delayed payouts',
      lemonPayout: '90-Day Rolling Reserve (10%)',
      voltPayout: 'Instant (~3 seconds on BSC)',
      rowChargebacks: 'Chargeback & Ban Risk',
      gumroadChargebacks: 'High (account bans & dispute fees)',
      lemonChargebacks: 'High (card disputes & holds)',
      voltChargebacks: '0% (Crypto payments are final)',
      rowCost: 'Platform Cost',
      gumroadCost: 'Revenue cut forever',
      lemonCost: 'Revenue cut forever',
      voltCost: '29 USDT one-time ($0/mo hosting)',
    },
    product: {
      paywallTag: 'VOLT PAYWALL',
      noFeesTag: '0% PLATFORM FEE',
      nonCustodialTag: 'Non-Custodial USDT',
      heroHeadline: 'Self-hosted USDT checkout for digital products',
      heroSubheadline: 'Accept USDT (BEP-20) on BNB Smart Chain straight to your wallet. 0% platform fee. Full source code.',
      title: 'Commercial Kit — Full Access',
      tagline: 'Self-Hosted USDT BEP-20 Checkout (0% Intermediary Fees)',
      description: 'Complete editable source code + VOLT Studio + No-Code embeds + Telegram alerts + unlimited commercial license + beginner setup docs. Instant digital delivery upon on-chain confirmation.',
      feature1: 'Source Worker + Frontend (React 18 + Vite + Tailwind + Cloudflare Worker)',
      feature2: 'VOLT Studio: Visual generator for iframe embeds & direct payment links',
      feature3: 'On-chain verification engine (~3s) with anti-replay idempotency design',
      feature4: 'Commercial license: unlimited personal & client projects (0% royalties)',
      originalPrice: '$99.00 USD',
      discountBadge: 'FOUNDING LAUNCH · SAVE 70%',
      totalPrice: 'ONE-TIME PAYMENT',
      paymentMethod: 'PAYMENT METHOD',
      payWithWallet: 'Pay with Wallet',
      manualPayment: 'Manual Payment / QR',
      walletMethodSub: 'Exact transfer of 29.00 USDT via Web3 Wallet on BNB Smart Chain (BEP-20).',
      manualMethodSub: 'Direct transfer with automated on-chain verification without connecting your wallet.',
      buyNowWallet: 'Buy the Kit — 29 USDT',
      buyNowManual: 'Proceed with Manual Payment',
      creatingOrder: 'Generating payment order...',
      secureNotice: 'Instant digital delivery upon on-chain confirmation',
      retry: 'Retry',
      connectionError: 'Connection error while creating order.',
      urgencyBadge: 'Founding / launch',
      directBscText: 'Direct BSC payment. No VOLT per-sale fee.',
      demoButton: 'Try interactive demo',
    },
    checkout: {
      activeOrder: 'ACTIVE PAYMENT ORDER',
      timeRemaining: 'TIME REMAINING',
      orderId: 'Order ID',
      amountToPay: 'Amount to Transfer',
      recipientAddress: 'Recipient Wallet Address',
      network: 'Payment Network',
      statusPending: 'Awaiting On-Chain Payment...',
      statusConfirming: 'Confirming On-Chain...',
      copyAddress: 'Copy Address',
      addressCopied: 'Address Copied!',
      sendWalletTx: 'Pay 29.00 USDT via Web3 Wallet',
      txSentConfirming: 'Transaction Broadcasted - Confirming...',
      simulatePaymentDemo: 'Simulate Payment Confirmation (Demo Mode)',
      simulating: 'Simulating payment...',
      manualInstructions: 'Send the exact amount shown above to the recipient address on BNB Smart Chain. Verification is performed automatically in real-time.',
      expiredTitle: 'Order Has Expired',
      expiredDesc: 'The time limit to complete the payment has ended. Please create a new order.',
      createNewOrder: 'Create New Order',
      cancelledTitle: 'Order Cancelled',
      cancelledDesc: 'This payment order has been cancelled or requires manual review.',
      backToStart: 'Back to Start',
    },
    paid: {
      paymentConfirmed: 'Payment Confirmed On-Chain!',
      latePaymentConfirmed: 'Late Payment Confirmed',
      orderCompleted: 'Your payment of 29 USDT was verified on BNB Smart Chain.',
      txHashLabel: 'Transaction Hash (txHash)',
      viewOnBscScan: 'View on BscScan',
      downloadProduct: 'Download Commercial Kit (ZIP)',
      instantDeliveryNotice: 'Secure instant digital delivery powered by VOLT Engine.',
      confirmationsCount: 'Confirmations',
    },
    faq: {
      badge: 'FREQUENTLY ASKED QUESTIONS',
      heading: 'Frequently Asked Questions',
      subheading: 'Clear answers on our 2-product catalog, deliverable formats, and BSC USDT settlement',
      q1: 'What products are available on VOLT Store, and what is included in each?',
      a1: 'We offer two developer products: 1) VOLT Paywall Commercial Kit (29 USDT): Full editable source code (React + Vite + Tailwind + Cloudflare Worker backend), embed generator, automated BSC verification engine, anti-replay ledger, Telegram alerts, and an unlimited commercial license with 0% platform fees. 2) Vibe Error Fixer (9 USDT): 5 AI-assisted error diagnoses and stack-trace debugging credits with a private 30-day cryptographic access token.',
      q2: 'Why is payment accepted strictly in USDT on BNB Smart Chain (BEP-20)?',
      a2: 'BNB Smart Chain delivers near-instant ~3-second block confirmations and sub-cent gas fees (~$0.01-$0.03), making it ideal for digital product purchases. USDT is the world\'s most liquid dollar-pegged stablecoin, avoiding crypto volatility while sending 100% of revenue directly to your non-custodial wallet with zero intermediaries.',
      q3: 'How does digital delivery work for each product after on-chain confirmation?',
      a3: 'Delivery is 100% automated upon verified blockchain confirmation: For the Commercial Kit, the Worker issues a single-use, 1-hour cryptographic token enabling direct in-browser download of the complete ZIP. For Vibe Error Fixer, you immediately receive a private access token with 5 debug credits and a direct link to launch the debugger.',
      q4: 'Does hosting require a paid Cloudflare plan?',
      a4: 'No. The entire architecture runs inside Cloudflare\'s free tier (100,000 requests/day, D1 database, KV, and workers.dev subdomains at $0/month). You can also bind your custom domain in 1 click at zero extra cost.',
      q5: 'Are crypto payments irreversible with zero chargeback risk?',
      a5: 'Yes. Unlike credit card processors where buyers can submit fraudulent chargebacks months later and penalize you with dispute fees, BEP-20 blockchain transactions are mathematically final. Once verified, funds remain in your wallet permanently.',
    },
    catalog: {
      badge: 'FUTURE ROADMAP',
      title: 'More from VOLT — coming next',
      sub: 'VOLT starts with self-hosted USDT checkout. More tools coming.',
      startsCopy: 'VOLT starts with self-hosted USDT checkout. More tools coming.',
      comingSoonTag: 'Coming Soon',
    },
    navTabs: {
      checkout: 'Checkout',
      demo: 'Interactive Demo',
      kit: 'What’s Inside',
      comparison: 'Vs Gumroad',
      faq: 'FAQ & Safety',
      all: 'View All',
      buyNowFloating: 'Buy for 29 USDT',
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
      poweredBy: 'Powered by VOLT Paywall · Self-Hosted Crypto Checkout',
      generateEmbed: 'Generate No-Code Embed',
      serverOnline: 'Server Status: Online',
    },
    demoPlayground: {
      badge: 'INTERACTIVE DEMO PLAYGROUND',
      heading: 'Test the Customer Checkout Flow Before Paying 29 USDT',
      subheading: 'Try the entire buyer experience in a safe client-side sandbox. Zero real crypto required, no database orders touched.',
      bannerNotice: 'DEMO SANDBOX · ZERO REAL FUNDS REQUIRED · TEST FREELY',
      ctaFixed: 'Get the full kit — 29 USDT',
      tabCheckout: '1. Checkout UX Simulation',
      tabBrand: '2. Brand & Embed Customizer',
      tabSavings: '3. Savings Calculator',
      tabWorkerChecks: '4. What the Worker Checks',
      checkoutBadge: 'DEMO MODE · ZERO-RISK TOY ORDER',
      checkoutTitle: 'Sample Digital Checkout Simulation',
      sampleToyPrice: '12.50 USDT',
      sampleToyDisclaimer: 'Sample toy amount for testing (not the real 29 USDT purchase).',
      copyAddress: 'Copy Sample Address',
      copiedAddress: 'Copied!',
      networkNotice: 'Simulation strictly reproduces BNB Smart Chain (BEP-20) transfers.',
      btnSimulateWallet: 'Simulate Web3 Wallet Click',
      btnSimulateManual: 'Simulate Manual TX Hash Input',
      btnResetDemo: 'Reset Simulation',
      verifyingTitle: 'Verifying Transaction on BNB Smart Chain...',
      verifyingStep1: 'Querying BSC RPC Multi-Node endpoint...',
      verifyingStep2: 'Parsing Transfer(from, to, value) on USDT BEP-20 contract...',
      verifyingStep3: 'Checking block confirmations (3/3 reached)...',
      successTitle: 'Payment Confirmed On-Chain!',
      successDesc: 'Access immediately unlocked. Tokenized download link generated in ~2.8 seconds.',
      sampleDownloadBtn: 'Download Sample Deliverable (.txt)',
      sampleFileNotice: 'This sample download demonstrates how paid customers immediately unlock their digital goods.',
      brandTitle: 'Brand Customizer & Live Embed Preview',
      brandDesc: 'Change store name and accent color to see the widget update live.',
      storeNameLabel: 'Your Store / Brand Name',
      productNameLabel: 'Product Name',
      priceLabel: 'Price (USDT)',
      colorLabel: 'Brand Accent Color',
      copyEmbedCode: 'Copy HTML / Iframe Snippet',
      copiedEmbedCode: 'Copied Snippet!',
      livePreviewTag: 'Live Frontend Preview',
      savingsTitle: 'Revenue & Savings Calculator',
      savingsDesc: 'See how much revenue you recover every month by removing 10% platform fees.',
      monthlySalesLabel: 'Estimated Monthly Digital Sales ($)',
      productPriceLabel: 'Average Product Price ($)',
      gumroadLoss: 'Lost to Gumroad (10% + $0.30/sale)',
      lemonLoss: 'Lost to Lemon Squeezy (5% + $0.50/sale)',
      voltPlatformCut: 'VOLT Paywall Platform Cut',
      netAnnualSavings: 'Estimated Net Annual Savings',
      netMonthlySavings: 'Saved per month',
      estimateDisclaimer: '*Estimate based on standard 10% flat fee + $0.30 transaction processing for Gumroad and 5% + $0.50 for Lemon Squeezy vs 0% platform fee with VOLT Paywall. Standard BSC network gas (~$0.02) is paid directly by buyer.',
      workerChecksTitle: 'What the Cloudflare Worker Checks On-Chain',
      workerChecksDesc: 'Every incoming payment must satisfy 5 strict on-chain security criteria before any download token is minted:',
      check1Title: '1. Network Verification (Chain ID: 56)',
      check1Detail: 'Validates that the transaction hash originated strictly on BNB Smart Chain mainnet, rejecting testnet illusions or wrong networks.',
      check2Title: '2. Official USDT BEP-20 Contract',
      check2Detail: 'Verifies the smart contract address is strictly BSC Tether (0x55d398326f99059fF775485246999027B3197955), ignoring fake copycat tokens.',
      check3Title: '3. Destination Merchant Wallet',
      check3Detail: 'Confirms that the recipient address in the transfer event strictly matches your configured merchant wallet address.',
      check4Title: '4. Exact Amount Matching',
      check4Detail: 'Ensures the transfer value in uint256 units (18 decimals) matches or exceeds the expected order amount.',
      check5Title: '5. Nonce / Anti-Replay Defense',
      check5Detail: 'Verifies in D1 SQLite that the transaction hash has never been used for any previous order, permanently preventing double-spending.',
      provableThingsTitle: '5 Things You Can Test & Verify Right Now Without Paying',
      provableThingsSubtitle: 'Explore every facet of the self-hosted Web3 checkout experience in your browser before investing 29 USDT:',
      provableThingsList: [
        {
          title: 'Full 3-Step Checkout Experience',
          desc: 'Walk through payment instructions, live multi-stage RPC verification simulation, and instant access unlock with a sample deliverable download.',
          badge: 'Simulated Flow',
        },
        {
          title: 'Brand & Embed Customizer',
          desc: 'Customize your store name, product title, prices, and 5 brand color themes with instant live preview and copyable HTML iframe snippets.',
          badge: 'Frontend Studio',
        },
        {
          title: 'Real Revenue Savings Calculator',
          desc: 'Calculate exact monthly and annual revenue recovered against Gumroad (10% + $0.30) and Lemon Squeezy (5% + $0.50) based on your digital sales volume.',
          badge: 'ROI Estimator',
        },
        {
          title: 'Worker On-Chain Security Criteria Explorer',
          desc: 'Review the 5 strict on-chain validation rules enforced by the Cloudflare Worker: BSC network, official USDT contract, merchant recipient, exact units, and anti-replay nonce.',
          badge: 'Security Audit',
        },
        {
          title: 'Live Web3 Wallet Connectivity & Network Check',
          desc: 'Connect MetaMask or Trust Wallet in the live checkout, verify BSC Chain ID 56 detection, and test manual/QR fallback options.',
          badge: 'EIP-1193 Ready',
        },
      ],
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
    hero: {
      headline: 'Self-hosted USDT checkout for digital products',
      sub: 'Acepta USDT (BEP-20) en BNB Smart Chain directo a tu wallet. 0% comisión de plataforma. Código fuente completo.',
      ctaPrimary: 'Comprar el Kit — 29 USDT',
      ctaSecondary: 'Probar demo interactiva',
      launchBadge: 'Oferta de Lanzamiento / Founding',
      badgeZeroFee: '0% Comisión de Plataforma',
      badgeNonCustodial: '100% Autocustodia',
      badgeNetwork: 'BNB Smart Chain (BEP-20)',
      tagline: 'Pagos crypto P2P directos para creadores, desarrolladores y productos digitales',
      runsOnCloudflare: 'Corre en Cloudflare. Agrega tu propio dominio más adelante.',
    },
    pain: {
      badge: 'EL PROBLEMA CON LAS PLATAFORMAS TRADICIONALES',
      heading: 'Deja de regalar hasta el 10% de tus ingresos a intermediarios',
      subheading: 'Por qué creadores y vendedores de software abandonan Gumroad, Lemon Squeezy y Stripe',
      card1Title: 'Comisiones del 10% en Gumroad y Lemon',
      card1Desc: 'Gumroad cobra 10% + $0.30 y Lemon Squeezy 5% + $0.50 en cada venta. En $5,000 de ventas digitales, pierdes entre $250 y $530+ solo en comisiones de pasarela.',
      card2Title: 'Holds y reservas retenidas por 90 días',
      card2Desc: 'Las plataformas tradicionales retienen el 10% de tus ingresos durante 90 días por supuestas "reservas de riesgo", secuestrando tu flujo de caja.',
      card3Title: 'Baneos de Stripe y cuentas congeladas',
      card3Desc: 'Cierres repentinos de cuenta, cobro de $15 por cada disputa o contracargo fraudulento, y restricciones geográficas que bloquean a clientes internacionales.',
      card4Title: 'Sin pagar otra suscripción mensual de SaaS',
      card4Desc: '¿Por qué pagar $29 o $99 al mes a otro SaaS crypto que custodia tus fondos y puede cambiar sus reglas de la noche a la mañana? Sé dueño de tu propia pasarela.',
    },
    howItWorks: {
      badge: 'CÓMO FUNCIONA EN 3 PASOS',
      heading: 'Cómo Funciona',
      subheading: 'De cero a recibir pagos directos en tu wallet en menos de 2 minutos',
      step1Badge: 'PASO 1',
      step1Title: 'Despliega en Cloudflare',
      step1Desc: 'Ejecuta el script setup.sh o wrangler deploy para publicar en Cloudflare Workers ($0/mes en el tier gratuito, 100k peticiones/día).',
      step2Badge: 'PASO 2',
      step2Title: 'El cliente paga USDT directo a tu wallet',
      step2Desc: 'Tu comprador transfiere USDT (BEP-20) directamente a tu wallet personal. 100% peer-to-peer, sin custodia de intermediarios ni retenciones.',
      step3Badge: 'PASO 3',
      step3Title: 'El Worker verifica on-chain y entrega acceso',
      step3Desc: 'El Worker detecta el evento de transferencia on-chain (~3s), valida el monto exacto y desbloquea la descarga tokenizada de forma instantánea.',
    },
    whatYouGet: {
      badge: 'TODO INCLUIDO',
      heading: 'Lo que recibes en el Commercial Kit',
      subheading: 'Un paquete de software completo y listo para producción para vender productos digitales con crypto',
      item1Title: 'Código Fuente Worker + Frontend',
      item1Desc: 'Stack completo y editable con React 18, Vite, Tailwind CSS y backend serverless en Cloudflare Worker (Hono + TypeScript). Código limpio y modular.',
      item2Title: 'VOLT Studio y Generador de Embeds',
      item2Desc: 'Herramienta visual para generar snippets de Iframe responsive y enlaces de cobro directos listos para WordPress, Webflow, Shopify, Notion o webs a medida.',
      item3Title: 'Verificación On-Chain Automatizada',
      item3Desc: 'Motor con failover multi-nodo que monitorea eventos de transferencia USDT BEP-20 en tiempo real con liquidación veloz (~3s).',
      item4Title: 'Diseño Anti-Replay',
      item4Desc: 'Ledger de órdenes idempotente, validación de rango de bloques y control de txHash único para prevenir double-spending y ataques de repetición.',
      item5Title: 'Licencia Comercial Ilimitada',
      item5Desc: 'Implementa en tiendas personales ilimitadas, productos SaaS o proyectos de clientes. Sin mensualidades, sin restricciones y sin regalías.',
      item6Title: 'Documentación para Principiantes',
      item6Desc: 'Guía de despliegue paso a paso en PDF y Markdown con referencia completa de variables de entorno y script automatizado setup.sh.',
      item7Title: 'Alertas Opcionales a Telegram',
      item7Desc: 'Webhook nativo preconfigurado para enviarte un mensaje instantáneo a Telegram cada vez que se confirma un pago on-chain.',
    },
    whatYouDoNotGet: {
      badge: 'TRANSPARENCIA RADICAL',
      heading: 'Lo que NO incluye (Confianza)',
      subheading: 'Límites claros y honestos para que sepas con exactitud qué estás comprando, sin falsas promesas',
      item1Title: 'Sin DRM de Archivos',
      item1Desc: 'Tus archivos se entregan como descargas digitales estándar (ZIP). No inyectamos DRM invasivo, telemetría ni bloqueos propietarios en los archivos de tus clientes.',
      item2Title: 'Sin Hosting Gestionado de Archivos',
      item2Desc: 'Tú alojas tus archivos digitales donde prefieras (Cloudflare R2, AWS S3, Google Drive o tu servidor). VOLT gestiona el cobro y la entrega tokenizada.',
      item3Title: 'Sin Multi-Chain en v1',
      item3Desc: 'Diseñado exclusivamente para BNB Smart Chain (BEP-20) para aprovechar comisiones de red microscópicas (~$0.01-$0.03) y tiempos de bloque de ~3s.',
      item4Title: 'Gas de Red Aparte',
      item4Desc: 'El comprador paga el gas estándar microscópico de BSC (~$0.01-$0.03) directamente desde su wallet al hacer la transferencia, como en cualquier transacción blockchain.',
    },
    comparison: {
      badge: 'COMISIONES Y CONTROL DEL DINERO',
      heading: 'VOLT Paywall vs. Gumroad y Lemon Squeezy',
      subheading: 'Comisiones y control del dinero comparados frente a frente',
      colFeature: 'Característica',
      colGumroad: 'Gumroad',
      colLemon: 'Lemon Squeezy',
      colVolt: 'VOLT Paywall',
      rowFee: 'Comisión de Plataforma',
      gumroadFee: '10% + $0.30 por venta',
      lemonFee: '5% + $0.50 por venta',
      voltFee: '0% (0.00% Comisión)',
      rowCustody: 'Custodia de Fondos',
      gumroadCustody: 'La plataforma retiene tu saldo',
      lemonCustody: 'La plataforma retiene tu saldo',
      voltCustody: '100% Directo a tu Wallet',
      rowPayout: 'Tiempo de Liquidación',
      gumroadPayout: 'Pagos semanales diferidos',
      lemonPayout: 'Reserva retenida 90 días (10%)',
      voltPayout: 'Instantáneo (~3 segundos en BSC)',
      rowChargebacks: 'Riesgo de Disputas y Baneos',
      gumroadChargebacks: 'Alto (disputas y baneos de cuenta)',
      lemonChargebacks: 'Alto (disputas y retenciones)',
      voltChargebacks: '0% (Pagos crypto irreversibles)',
      rowCost: 'Costo de Plataforma',
      gumroadCost: 'Comisión eterna de por vida',
      lemonCost: 'Comisión eterna de por vida',
      voltCost: '29 USDT pago único ($0/mes hosting)',
    },
    product: {
      paywallTag: 'VOLT PAYWALL',
      noFeesTag: '0% COMISIÓN',
      nonCustodialTag: 'USDT Autocustodia',
      heroHeadline: 'Self-hosted USDT checkout for digital products',
      heroSubheadline: 'Accept USDT (BEP-20) on BNB Smart Chain straight to your wallet. 0% platform fee. Full source code.',
      title: 'Commercial Kit — Acceso Completo',
      tagline: 'Checkout USDT BEP-20 Auto-alojado (0% Comisiones de Intermediarios)',
      description: 'Código fuente editable + VOLT Studio + embeds No-Code + alertas a Telegram + licencia comercial ilimitada + documentación paso a paso. Entrega digital inmediata tras confirmación on-chain.',
      feature1: 'Código Worker + Frontend editable (React 18 + Vite + Tailwind + Cloudflare Worker)',
      feature2: 'VOLT Studio: Generador visual de embeds Iframe y enlaces de pago directos',
      feature3: 'Motor de verificación on-chain (~3s) con diseño anti-replay idempotente',
      feature4: 'Licencia comercial: proyectos personales y de clientes ilimitados (0% regalías)',
      originalPrice: '$99.00 USD',
      discountBadge: 'LANZAMIENTO FOUNDING · AHORRA 70%',
      totalPrice: 'PAGO ÚNICO',
      paymentMethod: 'MÉTODO DE PAGO',
      payWithWallet: 'Pagar con Wallet',
      manualPayment: 'Pago Manual / QR',
      walletMethodSub: 'Transferencia exacta de 29.00 USDT vía Web3 Wallet en BNB Smart Chain (BEP-20).',
      manualMethodSub: 'Transferencia directa con verificación on-chain automática sin conectar wallet.',
      buyNowWallet: 'Comprar el Kit — 29 USDT',
      buyNowManual: 'Proceder con Pago Manual',
      creatingOrder: 'Generando orden de pago...',
      secureNotice: 'Entrega digital inmediata al confirmar en blockchain',
      retry: 'Reintentar',
      connectionError: 'Error de conexión al crear la orden.',
      urgencyBadge: 'Founding / launch',
      directBscText: 'Direct BSC payment. No VOLT per-sale fee.',
      demoButton: 'Probar demo interactiva',
    },
    checkout: {
      activeOrder: 'ORDEN DE PAGO ACTIVA',
      timeRemaining: 'TIEMPO RESTANTE',
      orderId: 'ID de Orden',
      amountToPay: 'Monto a Transferir',
      recipientAddress: 'Wallet Receptora',
      network: 'Red de Pago',
      statusPending: 'Esperando Pago On-Chain...',
      statusConfirming: 'Confirmando On-Chain...',
      copyAddress: 'Copiar Dirección',
      addressCopied: '¡Dirección Copiada!',
      sendWalletTx: 'Pagar 29.00 USDT vía Web3 Wallet',
      txSentConfirming: 'Transacción Emitida - Confirmando...',
      simulatePaymentDemo: 'Simular Confirmación de Pago (Modo Demo)',
      simulating: 'Simulando pago...',
      manualInstructions: 'Envía el monto exacto indicado a la dirección receptora en BNB Smart Chain. La verificación se realiza automáticamente en tiempo real.',
      expiredTitle: 'La orden ha expirado',
      expiredDesc: 'El tiempo límite para realizar el pago finalizó. Por favor crea una nueva orden.',
      createNewOrder: 'Crear Nueva Orden',
      cancelledTitle: 'Orden Cancelada',
      cancelledDesc: 'Esta orden de pago ha sido cancelada o requiere revisión manual.',
      backToStart: 'Volver al Inicio',
    },
    paid: {
      paymentConfirmed: '¡Pago Confirmado On-Chain!',
      latePaymentConfirmed: 'Pago Confirmado',
      orderCompleted: 'Tu pago de 29 USDT fue verificado con éxito en BNB Smart Chain.',
      txHashLabel: 'Hash de Transacción (txHash)',
      viewOnBscScan: 'Ver en BscScan',
      downloadProduct: 'Descargar Commercial Kit (ZIP)',
      instantDeliveryNotice: 'Entrega digital segura e instantánea mediante VOLT Engine.',
      confirmationsCount: 'Confirmaciones',
    },
    faq: {
      badge: 'PREGUNTAS FRECUENTES',
      heading: 'Preguntas Frecuentes',
      subheading: 'Respuestas claras sobre nuestro catálogo de 2 productos, formatos de entrega y cobro en USDT BSC',
      q1: '¿Qué productos están disponibles en la tienda VOLT y qué incluye cada uno?',
      a1: 'Ofrecemos dos herramientas de software: 1) VOLT Paywall Commercial Kit (29 USDT): Código fuente 100% editable (React + Vite + Tailwind + Cloudflare Worker backend), generador de embeds, motor de verificación en BSC, libro mayor anti-replay, alertas de Telegram y licencia comercial ilimitada con 0% de comisiones de plataforma. 2) Vibe Error Fixer (9 USDT): 5 créditos de diagnóstico y depuración asistida por IA con un token de acceso criptográfico privado válido por 30 días.',
      q2: '¿Por qué el pago se realiza estrictamente en USDT en BNB Smart Chain (BEP-20)?',
      a2: 'BNB Smart Chain ofrece confirmaciones ultra-rápidas en ~3 segundos y comisiones de red microscópicas (~$0.01-$0.03), ideal para micro-transacciones de productos digitales. USDT es la stablecoin más líquida del mundo, eliminando la volatilidad y enviando el 100% del pago directo a tu wallet personal sin intermediarios.',
      q3: '¿Cómo funciona la entrega digital de cada producto tras la confirmación on-chain?',
      a3: 'La entrega es 100% automática tras la confirmación en blockchain: Para el Commercial Kit, el Worker emite un token de descarga criptográfico de un solo uso (validez 1 hora) para descargar el archivo ZIP en tu navegador. Para Vibe Error Fixer, recibes de inmediato un access_token privado con 5 créditos de depuración y el enlace directo para iniciar la herramienta.',
      q4: '¿Requiere pagar suscripción mensual de Cloudflare?',
      a4: 'No. Toda la arquitectura funciona 100% dentro del plan gratuito de Cloudflare (100,000 peticiones/día, base de datos D1 SQLite, KV y subdominios workers.dev a $0/mes). También puedes conectar tu propio dominio en 1 clic sin costo adicional.',
      q5: '¿Los pagos en crypto son irreversibles y sin riesgo de contracargo?',
      a5: 'Sí. A diferencia de las pasarelas tradicionales con tarjeta donde los clientes pueden iniciar disputas fraudulentas meses después y cobrarte comisiones de penalización, las transferencias en BNB Smart Chain son definitivas e irreversibles.',
    },
    catalog: {
      badge: 'FUTURO CATÁLOGO',
      title: 'More from VOLT — coming next',
      sub: 'VOLT comienza con el checkout USDT auto-alojado. Más herramientas en camino.',
      startsCopy: 'VOLT starts with self-hosted USDT checkout. More tools coming.',
      comingSoonTag: 'Coming soon',
    },
    navTabs: {
      checkout: 'Checkout',
      demo: 'Demo en Vivo',
      kit: 'Qué Incluye',
      comparison: 'Vs Gumroad',
      faq: 'FAQ y Seguridad',
      all: 'Ver Todo',
      buyNowFloating: 'Comprar por 29 USDT',
    },
    embed: {
      title: 'Integración No-Code y Generador de Embeds',
      subtitle: 'Genera tu enlace directo de cobro o incrusta la pasarela en cualquier web en segundos.',
      tabGenerator: 'Generador de Embeds y Enlaces',
      tabQuickstart: 'Guía Rápida en 3 Pasos',
      configTitle: 'Configurar Parámetros de Cobro',
      walletLabel: 'Wallet Receptora (EVM / BSC)',
      productLabel: 'Nombre del Producto',
      amountLabel: 'Monto en USDT',
      networkLabel: 'Red BNB Smart Chain',
      directLinkTitle: 'Enlace Directo de Checkout',
      copyLink: 'Copiar Enlace',
      copiedLink: '¡Copiado!',
      iframeTitle: 'Código HTML / Iframe para WordPress, Webflow o Webs Personalizadas',
      copyIframe: 'Copiar Código Iframe',
      copiedIframe: '¡Copiado!',
      quickstartTitle: 'Guía de Despliegue en 2 Minutos',
      step1Title: 'Configura Variables de Entorno',
      step1Desc: 'Configura tu wallet receptora y parámetros en tu archivo .env o en Cloudflare Workers.',
      step2Title: 'Despliega el Backend Serverless',
      step2Desc: 'Ejecuta npx wrangler deploy para publicar la API y la base de datos D1 SQLite.',
      step3Title: 'Incrusta el Iframe o Comparte el Link',
      step3Desc: 'Pega el snippet de iframe en tu web. ¡Los pagos en USDT entran directo a tu wallet!',
      copyEnv: 'Copiar Snippet .env',
      copiedEnv: '¡Copiado!',
      close: 'Cerrar',
    },
    footer: {
      poweredBy: 'Powered by VOLT Paywall · Checkout Crypto Auto-alojado',
      generateEmbed: 'Generar Embed No-Code',
      serverOnline: 'Estado del Servidor: Online',
    },
    demoPlayground: {
      badge: 'ZONA DE PRUEBAS / DEMO INTERACTIVA',
      heading: 'Prueba la Experiencia de Checkout ANTES de Pagar 29 USDT',
      subheading: 'Experimenta todo el flujo del comprador en un entorno seguro del navegador. Cero cripto real requerida, no se tocan órdenes en la base de datos.',
      bannerNotice: 'SANDBOX DEMO · CERO FONDOS REALES REQUERIDOS · PRUEBA LIBREMENTE',
      ctaFixed: 'Obtener el kit completo — 29 USDT',
      tabCheckout: '1. Simulación UX de Checkout',
      tabBrand: '2. Personalizador de Marca y Embed',
      tabSavings: '3. Calculadora de Ahorro',
      tabWorkerChecks: '4. Qué Valida el Worker',
      checkoutBadge: 'MODO DEMO · ORDEN DE JUGUETE SIN RIESGO',
      checkoutTitle: 'Simulación de Checkout Digital de Muestra',
      sampleToyPrice: '12.50 USDT',
      sampleToyDisclaimer: 'Monto de muestra para pruebas (no es la orden real de 29 USDT).',
      copyAddress: 'Copiar Dirección de Muestra',
      copiedAddress: '¡Copiada!',
      networkNotice: 'La simulación reproduce transferencias estrictamente en BNB Smart Chain (BEP-20).',
      btnSimulateWallet: 'Simular Clic de Wallet Web3',
      btnSimulateManual: 'Simular Hash TX Manual',
      btnResetDemo: 'Reiniciar Simulación',
      verifyingTitle: 'Verificando Transacción en BNB Smart Chain...',
      verifyingStep1: 'Consultando endpoint multi-nodo BSC RPC...',
      verifyingStep2: 'Analizando Transfer(from, to, value) en contrato USDT BEP-20...',
      verifyingStep3: 'Comprobando confirmaciones de bloque (3/3 completadas)...',
      successTitle: '¡Pago Confirmado On-Chain!',
      successDesc: 'Acceso desbloqueado inmediatamente. Enlace de descarga tokenizado generado en ~2.8 segundos.',
      sampleDownloadBtn: 'Descargar Archivo de Muestra (.txt)',
      sampleFileNotice: 'Esta descarga de prueba demuestra cómo los clientes reales desbloquean sus productos tras pagar.',
      brandTitle: 'Personalizador de Marca y Embed en Vivo',
      brandDesc: 'Cambia el nombre y color de tu tienda y observa la previsualización actualizarse al instante.',
      storeNameLabel: 'Nombre de tu Tienda / Marca',
      productNameLabel: 'Nombre del Producto',
      priceLabel: 'Precio (USDT)',
      colorLabel: 'Color de Acento de la Marca',
      copyEmbedCode: 'Copiar Código HTML / Iframe',
      copiedEmbedCode: '¡Código Copiado!',
      livePreviewTag: 'Vista Previa en Vivo (Frontend)',
      savingsTitle: 'Calculadora de Ingresos y Ahorro',
      savingsDesc: 'Calcula cuánto dinero recuperas cada mes al eliminar las comisiones del 10% de intermediarios.',
      monthlySalesLabel: 'Ventas Digitales Mensuales Estimadas ($)',
      productPriceLabel: 'Precio Promedio por Producto ($)',
      gumroadLoss: 'Comisión en Gumroad (10% + $0.30/venta)',
      lemonLoss: 'Comisión en Lemon Squeezy (5% + $0.50/venta)',
      voltPlatformCut: 'Comisión de Plataforma en VOLT Paywall',
      netAnnualSavings: 'Ahorro Anual Neto Estimado',
      netMonthlySavings: 'Ahorro al mes',
      estimateDisclaimer: '*Estimación basada en comisiones típicas del 10% + $0.30 por venta en Gumroad y 5% + $0.50 en Lemon Squeezy vs 0% comisión de plataforma en VOLT Paywall. El gas de red BSC (~$0.02) lo asume directamente el comprador en cada pago.',
      workerChecksTitle: 'Lo que el Worker de Cloudflare Valida On-Chain',
      workerChecksDesc: 'Cada pago entrante debe satisfacer 5 estrictos criterios de seguridad en blockchain antes de entregar acceso:',
      check1Title: '1. Verificación de Red (Chain ID: 56)',
      check1Detail: 'Comprueba que la transacción se haya emitido exclusivamente en BNB Smart Chain mainnet, rechazando redes erróneas o de prueba.',
      check2Title: '2. Contrato Oficial USDT BEP-20',
      check2Detail: 'Verifica que el contrato del token sea estrictamente el USDT oficial de BSC (0x55d398326f99059fF775485246999027B3197955), ignorando tokens falsificados.',
      check3Title: '3. Wallet Receptora del Vendedor',
      check3Detail: 'Confirma que la dirección receptora en el evento Transfer coincida exactamente con tu wallet configurada.',
      check4Title: '4. Verificación del Monto Exacto',
      check4Detail: 'Valida que el valor en unidades uint256 (18 decimales) iguale o supere el precio esperado de la orden.',
      check5Title: '5. Protección Anti-Replay y Nonce',
      check5Detail: 'Verifica en D1 SQLite que el hash de la transacción nunca haya sido reclamado antes, imposibilitando el doble gasto.',
      provableThingsTitle: '5 Cosas que Puedes Probar y Comprobar sin Pagar',
      provableThingsSubtitle: 'Prueba cada aspecto de la experiencia de compra autónoma directamente en tu navegador antes de adquirir el kit por 29 USDT:',
      provableThingsList: [
        {
          title: 'Flujo Completo de Checkout en 3 Pasos',
          desc: 'Recorre las instrucciones de pago con QR, la simulación de verificación on-chain multi-nodo y el recibo final con token de descarga sin gastar saldo.',
          badge: 'Flujo Simulado',
        },
        {
          title: 'Personalizador de Marca y Preview de Embed',
          desc: 'Modifica el nombre de tu tienda, título del producto, precio y 5 colores de acento con actualización en tiempo real del código HTML embebible.',
          badge: 'Studio Frontend',
        },
        {
          title: 'Calculadora de Ahorro Real de Comisiones',
          desc: 'Comprueba cuánto dinero recuperas al mes frente a Gumroad (10% + $0.30) y Lemon Squeezy (5% + $0.50) según tu volumen proyectado de ventas digitales.',
          badge: 'Estimador ROI',
        },
        {
          title: 'Inspector de Reglas On-Chain del Worker',
          desc: 'Analiza los 5 filtros estrictos del Cloudflare Worker: red BSC (56), contrato oficial USDT, wallet receptora, monto exacto uint256 y anti-replay.',
          badge: 'Auditoría On-Chain',
        },
        {
          title: 'Conectividad Web3 y Detección de Red',
          desc: 'Conecta MetaMask o Trust Wallet en la landing, valida la detección automática de BNB Smart Chain y el fallback a pago manual/QR.',
          badge: 'Compatible EIP-1193',
        },
      ],
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
    if (typeof window !== 'undefined' && window.navigator) {
      const browserLang = window.navigator.language || '';
      if (browserLang.toLowerCase().startsWith('es')) {
        return 'ES';
      }
    }
    return 'EN';
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

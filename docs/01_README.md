# VOLT Paywall — Commercial Kit Architecture & Quick Start
# VOLT Paywall — Arquitectura del Kit Comercial e Inicio Rápido

---

## 🇺🇸 ENGLISH

### 1. Overview & Architecture
VOLT Paywall is a production-ready, self-hosted, non-custodial Web3 payment gateway designed to run on the **Cloudflare Free Tier** ($0/month infrastructure cost). It accepts instant crypto payments in **USDT (SPL)**, **USDC (SPL)**, and native **SOL** directly to your personal Solana wallet with **0% intermediary fees**.

#### Key Architecture Components:
1. **Frontend (React 18 + Vite + Tailwind CSS)**:
   - High-conversion landing page with real-time currency selector (USDT, USDC, SOL).
   - Dynamic QR Code generator (Solana Pay compatible).
   - Multi-wallet connection support (Phantom, Solflare, Backpack, Coinbase Wallet).
   - Responsive design with dark/light mode accents and bilingual i18n support.
   - Zero-UI embed code generator for any external website.

2. **Backend (Cloudflare Worker with Hono.js)**:
   - Ultra-fast edge API execution (<15ms response time globally).
   - High-reliability Solana Mainnet-Beta RPC client with automatic multi-provider failover.
   - Dual-path on-chain validation: verifies SPL Token transfer balances and native SystemProgram transfers.
   - Replay attack protection: every transaction signature is recorded in Cloudflare KV with a 365-day TTL.
   - Secure delivery engine: single-use HMAC-SHA256 signed download tokens valid for 2 hours.

3. **Storage (Cloudflare KV & Assets)**:
   - `PRODUCT_STORAGE` KV namespace stores product zip files and transaction redemption records.
   - Zero database maintenance or external servers required.

---

### 2. Quick Start Guide (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local frontend development server
npm run dev

# 3. Test Cloudflare Worker locally with Wrangler
npm --prefix worker run dev
```

---

## 🇪🇸 ESPAÑOL

### 1. Visión General y Arquitectura
VOLT Paywall es una pasarela de pago Web3 autocustodiada y lista para producción, diseñada para operar en el **Plan Gratuito de Cloudflare** ($0/mes en costos de infraestructura). Permite recibir pagos instantáneos en **USDT (SPL)**, **USDC (SPL)** y **SOL** nativo directamente en tu billetera de Solana, con **0% de comisiones por intermediarios**.

#### Componentes Clave de la Arquitectura:
1. **Frontend (React 18 + Vite + Tailwind CSS)**:
   - Interfaz de alta conversión con selector dinámico de criptomonedas.
   - Generador de código QR compatible con Solana Pay.
   - Soporte para múltiples wallets (Phantom, Solflare, Backpack, Coinbase).
   - Diseño responsivo, soporte bilingüe (EN/ES) y generador de código embed.

2. **Backend (Cloudflare Worker con Hono.js)**:
   - Ejecución en el edge de Cloudflare con latencia ultra baja (<15ms).
   - Cliente RPC de Solana con redundancia y conmutación por error automática entre proveedores.
   - Validación on-chain estricta de transferencias SPL Token y transferencias nativas de SOL.
   - Prevención de ataques de repetición mediante almacenamiento en Cloudflare KV (TTL 365 días).
   - Motor criptográfico de descarga segura mediante tokens firmados HMAC-SHA256 (2 horas de vigencia).

---

### 2. Inicio Rápido (Desarrollo Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor local de desarrollo frontend
npm run dev

# 3. Probar el Worker localmente con Wrangler
npm --prefix worker run dev
```

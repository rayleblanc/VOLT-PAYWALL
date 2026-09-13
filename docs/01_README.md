# VOLT Paywall — Commercial Kit Architecture & Quick Start
# VOLT Paywall — Arquitectura del Kit Comercial e Inicio Rápido

---

## 🇺🇸 ENGLISH

### 1. Overview & Architecture
VOLT Paywall is a production-ready, self-hosted, non-custodial Web3 payment gateway designed to run on the **Cloudflare Free Tier** ($0/month infrastructure cost). It accepts instant crypto payments in **USDT (BEP-20)** on **BNB Smart Chain (BSC)** directly to your personal EVM wallet with **0% intermediary fees**.

#### Key Architecture Components:
1. **Frontend (React 18 + Vite + Tailwind CSS)**:
   - High-conversion landing page with real-time order generation (USDT BEP-20).
   - Dynamic QR Code generator for mobile wallet transfers.
   - Dual payment support: Direct Web3 Wallet connection (MetaMask, Trust Wallet, Rabby, Binance Wallet) or manual transfer with unique fractional amounts (39.XXXX USDT) for instant automated matching.
   - Responsive design with dark/light mode accents and bilingual i18n support.
   - Zero-UI embed code generator for any external website.

2. **Backend (Cloudflare Worker with Hono.js)**:
   - Ultra-fast edge API execution (<15ms response time globally).
   - High-reliability BSC JSON-RPC client with automatic multi-provider failover.
   - Exact BigInt token transfer validation on-chain with 18 decimal places.
   - Cloudflare D1 SQL database integration for order lifecycle and replay attack prevention.
   - Secure delivery engine: single-use download tokens with grace periods.

3. **Storage (Cloudflare D1 & KV / Assets)**:
   - `DB`: Cloudflare D1 SQLite database storing orders, payment states, and transaction hashes.
   - `PRODUCT_PAYLOAD_KV`: Cloudflare KV namespace storing product zip files for download.
   - Zero database maintenance or external servers required.

---

### 2. Quick Start Guide (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local frontend development server
npm run dev

# 3. Test Cloudflare Worker locally with Wrangler & test suite
npm --prefix worker run test
```

---

## 🇪🇸 ESPAÑOL

### 1. Visión General y Arquitectura
VOLT Paywall es una pasarela de pago Web3 autocustodiada y lista para producción, diseñada para operar en el **Plan Gratuito de Cloudflare** ($0/mes en costos de infraestructura). Permite recibir pagos instantáneos en **USDT (BEP-20)** en **BNB Smart Chain (BSC)** directamente en tu billetera EVM, con **0% de comisiones por intermediarios**.

#### Componentes Clave de la Arquitectura:
1. **Frontend (React 18 + Vite + Tailwind CSS)**:
   - Interfaz de alta conversión con generación de órdenes en tiempo real (USDT BEP-20).
   - Generador de código QR para transferencias desde billeteras móviles.
   - Modo dual de pago: conexión directa Web3 (MetaMask, Trust Wallet, Rabby, Binance Wallet) o transferencia manual con monto fraccionario único (39.XXXX USDT) para conciliación automática.
   - Diseño responsivo, soporte bilingüe (EN/ES) y generador de código embed.

2. **Backend (Cloudflare Worker con Hono.js)**:
   - Ejecución en el edge de Cloudflare con latencia ultra baja (<15ms).
   - Cliente RPC de BSC con redundancia y conmutación por error automática entre proveedores.
   - Validación on-chain estricta de transferencias de tokens BEP-20 con aritmética BigInt exacta (18 decimales).
   - Base de datos SQL Cloudflare D1 para prevención estricta de ataques de repetición y trazabilidad de órdenes.
   - Motor criptográfico de descarga segura mediante tokens de un solo uso con ventana de gracia.

---

### 2. Inicio Rápido (Desarrollo Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor local de desarrollo frontend
npm run dev

# 3. Ejecutar la suite de pruebas del Worker
npm --prefix worker run test
```

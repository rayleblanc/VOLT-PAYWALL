# Configuration & Environment Variables Reference
# Referencia de Configuración y Variables de Entorno

---

## 🇺🇸 ENGLISH

### 1. Worker Environment Variables (`worker/wrangler.jsonc`)

| Variable Name | Type | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `RECIPIENT_WALLET` | Plain text | The Solana Base58 public key receiving all payments | `32f741vY9e8aHqQjV3pW...` |
| `EXPECTED_PRICE_USD` | Number/String | Target price in USD | `39` |
| `USDT_MINT` | String | Solana SPL Mint Address for Tether USD | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| `USDC_MINT` | String | Solana SPL Mint Address for USD Coin | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `SOLANA_RPC_URL` | URL | Primary Solana Mainnet-Beta RPC endpoint | `https://api.mainnet-beta.solana.com` |
| `SOLANA_RPC_FALLBACKS` | Comma-separated | Backup RPCs for seamless failover | `https://solana-mainnet.rpc.extrnode.com,...` |
| `DOWNLOAD_SECRET` | Secret | Secret key used to sign and verify HMAC tokens | Keep secret via `wrangler secret put` |
| `ALLOWED_ORIGINS` | Comma-separated | Allowed origins for CORS policy | `https://voltpaywall.com,http://localhost:3000` |

### 2. Frontend Configuration (`src/config.ts` or `.env`)

| Variable Name | Description |
| :--- | :--- |
| `VITE_RECIPIENT_WALLET` | Public key displayed in UI & QR codes |
| `VITE_EXPECTED_PRICE_USD` | Base product price shown to buyers ($39) |
| `VITE_API_BASE_URL` | Backend URL for payment verification (`/api` or custom domain) |

---

## 🇪🇸 ESPAÑOL

### 1. Variables de Entorno del Worker (`worker/wrangler.jsonc`)

| Nombre de Variable | Tipo | Descripción | Valor Predeterminado / Ejemplo |
| :--- | :--- | :--- | :--- |
| `RECIPIENT_WALLET` | Texto | Clave pública Base58 de Solana que recibe los fondos | `32f741vY9e8aHqQjV3pW...` |
| `EXPECTED_PRICE_USD` | Número | Precio objetivo del producto en USD | `39` |
| `USDT_MINT` | Texto | Dirección de Contrato SPL de Tether USD en Solana | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| `USDC_MINT` | Texto | Dirección de Contrato SPL de USD Coin en Solana | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `SOLANA_RPC_URL` | URL | Endpoint RPC principal de Solana Mainnet-Beta | `https://api.mainnet-beta.solana.com` |
| `SOLANA_RPC_FALLBACKS` | Lista (comas) | RPCs de respaldo ante caídas del principal | `https://solana-mainnet.rpc.extrnode.com,...` |
| `DOWNLOAD_SECRET` | Secreto | Clave secreta para firmar y validar tokens HMAC | Gestionar con `wrangler secret put` |
| `ALLOWED_ORIGINS` | Lista (comas) | Dominios permitidos para políticas CORS | `https://voltpaywall.com,http://localhost:3000` |

### 2. Configuración del Frontend (`src/config.ts` o `.env`)

| Nombre de Variable | Descripción |
| :--- | :--- |
| `VITE_RECIPIENT_WALLET` | Clave pública de recepción mostrada en la UI y QR |
| `VITE_EXPECTED_PRICE_USD` | Precio base en USD mostrado al comprador ($39) |
| `VITE_API_BASE_URL` | URL del backend para validación (`/api` o dominio propio) |

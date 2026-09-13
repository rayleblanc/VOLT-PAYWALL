# Configuration & Environment Variables Reference
# Referencia de Configuración y Variables de Entorno

---

## 🇺🇸 ENGLISH

### 1. Worker Environment Variables (`worker/wrangler.jsonc`)

| Variable Name | Type | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PAYMENT_RECIPIENT` | Plain text | The 42-character EVM address receiving all payments | `0x1234567890123456789012345678901234567890` |
| `BSC_RPC_URL` | Comma-separated | Primary and backup BSC JSON-RPC endpoints | `https://bsc-dataseed.binance.org/,https://binance.llamarpc.com` |
| `USDT_CONTRACT_ADDRESS` | EVM Address | USDT BEP-20 contract address | `0x55d398326f99059fF775485246999027B3197955` (Mainnet) |
| `CHAIN_ID` | Number | BSC network chain ID (56 for Mainnet, 97 for Testnet) | `56` |
| `ALLOWED_ORIGINS` | Comma-separated | Allowed origins for CORS policy | `https://voltpaywall.com,http://localhost:3000` |
| `APP_ENV` | String | Environment mode (`production` or `development`) | `production` |

### 2. Frontend Configuration (`src/config.ts` or `.env`)

| Variable Name | Description |
| :--- | :--- |
| `VITE_RECIPIENT_WALLET` | Public EVM wallet address displayed in UI & QR codes |
| `VITE_EXPECTED_PRICE_USD` | Base product price shown to buyers ($39) |
| `VITE_API_BASE_URL` | Backend URL for payment verification (`/api` or custom domain) |

---

## 🇪🇸 ESPAÑOL

### 1. Variables de Entorno del Worker (`worker/wrangler.jsonc`)

| Nombre de Variable | Tipo | Descripción | Valor Predeterminado / Ejemplo |
| :--- | :--- | :--- | :--- |
| `PAYMENT_RECIPIENT` | Texto | Dirección EVM (0x...) que recibe los fondos de USDT | `0x1234567890123456789012345678901234567890` |
| `BSC_RPC_URL` | Lista (comas) | Endpoints RPC de BNB Smart Chain con failover | `https://bsc-dataseed.binance.org/,https://binance.llamarpc.com` |
| `USDT_CONTRACT_ADDRESS` | Dirección EVM | Contrato de USDT BEP-20 en BSC | `0x55d398326f99059fF775485246999027B3197955` |
| `CHAIN_ID` | Número | ID de red de BSC (56 para Mainnet, 97 para Testnet) | `56` |
| `ALLOWED_ORIGINS` | Lista (comas) | Dominios permitidos para políticas CORS | `https://voltpaywall.com,http://localhost:3000` |
| `APP_ENV` | Texto | Entorno de ejecución (`production` o `development`) | `production` |

### 2. Configuración del Frontend (`src/config.ts` o `.env`)

| Nombre de Variable | Descripción |
| :--- | :--- |
| `VITE_RECIPIENT_WALLET` | Dirección pública EVM de recepción mostrada en la UI y QR |
| `VITE_EXPECTED_PRICE_USD` | Precio base en USD mostrado al comprador ($39) |
| `VITE_API_BASE_URL` | URL del backend para validación (`/api` o dominio propio) |

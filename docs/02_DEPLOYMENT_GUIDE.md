# Production Deployment Guide (Cloudflare Workers & D1)
# Guía de Despliegue en Producción (Cloudflare Workers y D1)

---

## 🇺🇸 ENGLISH

### Step 1: Prerequisites
- A Cloudflare account ([dash.cloudflare.com](https://dash.cloudflare.com))
- Node.js 18+ and npm installed
- Wrangler CLI installed (`npm install -g wrangler` or use `npx wrangler`)

### Step 2: Create Cloudflare D1 Database
Create the D1 SQL database for order state and replay attack prevention:
```bash
npx wrangler d1 create volt-paywall-db
```
Wrangler will output configuration with `database_name` and `database_id`.
Paste them into `worker/wrangler.jsonc` under `d1_databases`.

### Step 3: Apply D1 Database Migrations
Initialize the schema with indexes and tables:
```bash
# Local development D1
npx wrangler d1 execute volt-paywall-db --local --file=./worker/migrations/0001_initial_schema.sql

# Production remote D1
npx wrangler d1 execute volt-paywall-db --remote --file=./worker/migrations/0001_initial_schema.sql
```

### Step 4: Create KV Namespace for Download Deliveries
Create the KV namespace for digital product delivery:
```bash
npx wrangler kv namespace create PRODUCT_PAYLOAD_KV
```
Update `worker/wrangler.jsonc` with the generated KV ID.

Upload your product ZIP into KV:
```bash
npx wrangler kv key put --binding=PRODUCT_PAYLOAD_KV "volt-paywall-kit.zip" --path=./public/volt-paywall-kit.zip
```

### Step 5: Configure Production Variables & Secrets
In `worker/wrangler.jsonc`:
- Set `PAYMENT_RECIPIENT` to your personal EVM wallet address (e.g. `0x123...`).
- Set `CHAIN_ID` to `56` (BSC Mainnet) or `97` (BSC Testnet).
- Set `APP_ENV` to `production`.

### Step 6: Build and Deploy Frontend and Worker
```bash
# 1. Build the production frontend bundle
npm run build

# 2. Deploy Worker and static frontend to Cloudflare
cd worker
npx wrangler deploy
```

---

## 🇪🇸 ESPAÑOL

### Paso 1: Requisitos Previos
- Cuenta en Cloudflare ([dash.cloudflare.com](https://dash.cloudflare.com))
- Node.js 18+ y npm instalados
- CLI de Wrangler instalado (`npm install -g wrangler` o usar `npx wrangler`)

### Paso 2: Crear la Base de Datos Cloudflare D1
Crea la base de datos SQL D1 para órdenes y prevención de ataques de repetición:
```bash
npx wrangler d1 create volt-paywall-db
```
Copia el `database_id` devuelto y colócalo en `worker/wrangler.jsonc` dentro de `d1_databases`.

### Paso 3: Aplicar las Migraciones SQL en D1
Ejecuta la migración inicial:
```bash
# Para pruebas locales
npx wrangler d1 execute volt-paywall-db --local --file=./worker/migrations/0001_initial_schema.sql

# Para producción en Cloudflare
npx wrangler d1 execute volt-paywall-db --remote --file=./worker/migrations/0001_initial_schema.sql
```

### Paso 4: Crear el Namespace de Cloudflare KV
Crea el almacenamiento KV para entrega de archivos zip:
```bash
npx wrangler kv namespace create PRODUCT_PAYLOAD_KV
```
Actualiza `worker/wrangler.jsonc` con el ID devuelto.

Carga tu producto ZIP en KV:
```bash
npx wrangler kv key put --binding=PRODUCT_PAYLOAD_KV "volt-paywall-kit.zip" --path=./public/volt-paywall-kit.zip
```

### Paso 5: Configurar Billetera Receptora
En `worker/wrangler.jsonc`:
- Configura `PAYMENT_RECIPIENT` con tu dirección EVM pública (ej. `0x123...`).
- Configura `CHAIN_ID` en `56` (BSC Mainnet) o `97` (BSC Testnet).
- Configura `APP_ENV` en `production`.

### Paso 6: Compilar y Desplegar
```bash
# 1. Compilar el frontend para producción
npm run build

# 2. Desplegar a Cloudflare
cd worker
npx wrangler deploy
```

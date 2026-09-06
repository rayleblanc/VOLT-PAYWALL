# Production Deployment Guide (Cloudflare Workers & Pages)
# Guía de Despliegue en Producción (Cloudflare Workers y Pages)

---

## 🇺🇸 ENGLISH

### Step 1: Prerequisites
- A Cloudflare account ([dash.cloudflare.com](https://dash.cloudflare.com))
- Node.js 18+ and npm installed
- Wrangler CLI installed (`npm install -g wrangler` or use `npx wrangler`)

### Step 2: Create Cloudflare KV Namespace
Run the following command to create the KV namespace for digital product delivery:
```bash
npx wrangler kv namespace create PRODUCT_STORAGE
```
Wrangler will output an ID like:
```toml
[[kv_namespaces]]
binding = "PRODUCT_STORAGE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```
Copy that ID and paste it into `worker/wrangler.jsonc` under `kv_namespaces`.

### Step 3: Upload Your Digital Product to KV
Upload the distribution zip archive into your newly created KV namespace:
```bash
npx wrangler kv key put --binding=PRODUCT_STORAGE "volt-paywall-kit.zip" --path=./public/volt-paywall-kit.zip
```

### Step 4: Configure Production Secrets
Set your private download secret and optional private Solana RPC keys:
```bash
# Set your HMAC download token signing secret
npx wrangler secret put DOWNLOAD_SECRET

# (Optional) Set private RPC endpoints if using Helius or QuickNode
npx wrangler secret put HELIUS_API_KEY
```

### Step 5: Build and Deploy Frontend and Worker
```bash
# 1. Build the production frontend bundle
npm run build

# 2. Deploy Worker and static frontend to Cloudflare
npx wrangler deploy
```

---

## 🇪🇸 ESPAÑOL

### Paso 1: Requisitos Previos
- Cuenta en Cloudflare ([dash.cloudflare.com](https://dash.cloudflare.com))
- Node.js 18+ y npm instalados
- CLI de Wrangler instalado (`npm install -g wrangler` o usar `npx wrangler`)

### Paso 2: Crear el Namespace de Cloudflare KV
Ejecuta el siguiente comando para crear el almacenamiento KV de productos descargables:
```bash
npx wrangler kv namespace create PRODUCT_STORAGE
```
Wrangler devolverá un ID similar a:
```toml
[[kv_namespaces]]
binding = "PRODUCT_STORAGE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```
Copia ese ID y colócalo en `worker/wrangler.jsonc` dentro de `kv_namespaces`.

### Paso 3: Cargar tu Producto Digital a KV
Carga el archivo ZIP en el namespace de KV creado:
```bash
npx wrangler kv key put --binding=PRODUCT_STORAGE "volt-paywall-kit.zip" --path=./public/volt-paywall-kit.zip
```

### Paso 4: Configurar Secretos de Producción
Configura el secreto criptográfico para la firma de tokens HMAC:
```bash
# Configurar la clave secreta de firma HMAC
npx wrangler secret put DOWNLOAD_SECRET
```

### Paso 5: Compilar y Desplegar
```bash
# 1. Compilar el frontend para producción
npm run build

# 2. Desplegar el Worker y los archivos estáticos en Cloudflare
npx wrangler deploy
```

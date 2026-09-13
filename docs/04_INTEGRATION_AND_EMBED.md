# Integration, Embed Modal & API Reference
# Guía de Integración, Embed y Referencia de APIs

---

## 🇺🇸 ENGLISH

### 1. Zero-Code Iframe Embed
You can embed the VOLT Paywall checkout modal into any website (WordPress, Webflow, Framer, Shopify, or static HTML):

```html
<!-- Responsive Checkout Container -->
<div style="position: relative; width: 100%; max-width: 520px; margin: 0 auto; height: 720px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
  <iframe 
    src="https://voltpaywall.com" 
    title="VOLT Paywall Checkout"
    style="width: 100%; height: 100%; border: none;"
    allow="clipboard-write"
    loading="lazy">
  </iframe>
</div>
```

---

### 2. REST API Endpoints

#### `GET /api/health`
Checks server status, active BSC network, chain ID, and RPC connection health.

#### `GET /api/config`
Returns public gateway configuration, including the recipient wallet address, product price, and USDT BEP-20 token contract.

#### `POST /api/orders`
Creates an authoritative order in Cloudflare D1.
- **Request Body**:
  ```json
  {
    "productId": "creator-pack",
    "paymentMode": "wallet"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "orderId": "volt_ord_...",
    "productId": "creator-pack",
    "paymentMode": "wallet",
    "amount": "39",
    "expectedAmount": "39",
    "expectedUnits": "39000000000000000000",
    "currency": "USDT",
    "network": "BSC",
    "chainId": 56,
    "recipient": "0x...",
    "expiresAt": "2026-09-09T10:00:00.000Z",
    "status": "PENDING"
  }
  ```

#### `GET /api/orders/:id`
Retrieves live order status and blockchain confirmation progress from Cloudflare D1.

#### `POST /api/orders/:id/verify`
Triggers on-chain verification for an order.
- **Request Body**:
  ```json
  {
    "txHash": "0x..."
  }
  ```

#### `GET /api/download?orderId=...&token=...`
Serves the digital product zip securely from Cloudflare KV after verifying that the order is PAID and token is valid.

---

## 🇪🇸 ESPAÑOL

### 1. Integración Iframe Sin Código
Puedes incrustar la pasarela de pago en cualquier sitio web (WordPress, Webflow, Framer, Shopify, o HTML estándar):

```html
<!-- Contenedor Responsivo de Pago -->
<div style="position: relative; width: 100%; max-width: 520px; margin: 0 auto; height: 720px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
  <iframe 
    src="https://voltpaywall.com" 
    title="VOLT Paywall Checkout"
    style="width: 100%; height: 100%; border: none;"
    allow="clipboard-write"
    loading="lazy">
  </iframe>
</div>
```

---

### 2. Endpoints de la API REST

#### `GET /api/health`
Comprueba el estado del Worker, la red conectada (BSC), el chain ID y la salud del RPC.

#### `GET /api/config`
Devuelve la configuración pública de la pasarela: dirección EVM receptora, precio del producto y contrato del token USDT BEP-20.

#### `POST /api/orders`
Crea una orden con precio y montos calculados server-side y la registra en Cloudflare D1.
- **Cuerpo de la Petición**:
  ```json
  {
    "productId": "creator-pack",
    "paymentMode": "wallet"
  }
  ```

#### `GET /api/orders/:id`
Consulta el estado de una orden (`PENDING`, `CONFIRMING`, `PAID`, `PAID_LATE`, `EXPIRED`) y las confirmaciones on-chain.

#### `POST /api/orders/:id/verify`
Inicia la verificación de la transacción on-chain en BNB Smart Chain usando el hash de la transacción.

#### `GET /api/download?orderId=...&token=...`
Entrega el archivo ZIP del producto desde Cloudflare KV tras validar que la orden está pagada y el token de descarga es legítimo.

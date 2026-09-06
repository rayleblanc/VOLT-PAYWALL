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
Checks server status, active Solana network, RPC connection health, and current SOL/USD price.

#### `GET /api/config`
Returns public gateway configuration, including the recipient wallet address, product price, and supported token addresses.

#### `POST /api/verify-payment`
Validates a Solana transaction signature on-chain.
- **Request Body**:
  ```json
  {
    "signature": "5UfD...transactionSignature...",
    "currency": "USDT",
    "buyerAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "verified": true,
    "signature": "5UfD...",
    "amountPaid": 39,
    "currency": "USDT",
    "downloadUrl": "https://voltpaywall.com/api/download?token=eyJhbGci...&sig=5UfD...",
    "expiresIn": 7200
  }
  ```

#### `GET /api/download?token=...&sig=...`
Serves the downloadable product directly from Cloudflare KV. Requires a valid HMAC-SHA256 token generated upon successful on-chain payment verification.

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
Comprueba el estado del Worker, la red de Solana conectada, la salud de los RPCs y el precio actual de SOL en USD.

#### `GET /api/config`
Devuelve la configuración pública de la pasarela: dirección pública de recepción, precio del producto y tokens soportados.

#### `POST /api/verify-payment`
Verifica on-chain la firma de una transacción de Solana.
- **Cuerpo de la Petición**:
  ```json
  {
    "signature": "5UfD...firmaDeTransaccion...",
    "currency": "USDT",
    "buyerAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "verified": true,
    "signature": "5UfD...",
    "amountPaid": 39,
    "currency": "USDT",
    "downloadUrl": "https://voltpaywall.com/api/download?token=eyJhbGci...&sig=5UfD...",
    "expiresIn": 7200
  }
  ```

#### `GET /api/download?token=...&sig=...`
Entrega el archivo ZIP del producto directamente desde Cloudflare KV tras validar el token criptográfico HMAC.

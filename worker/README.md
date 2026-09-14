# VOLT Paywall Worker & D1 Database

Backend serverless service for VOLT Paywall V4 built on Cloudflare Workers and D1 Database.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Apply Local D1 Database Migrations
Initialize or update the local D1 SQLite database schema:
```bash
npx wrangler d1 migrations apply volt-paywall-d1 --local -c worker/wrangler.jsonc
```

### 3. Start Local Cloudflare Worker
Launch the local Wrangler development server:
```bash
npx wrangler dev -c worker/wrangler.jsonc
```
The local Worker will be listening at **`http://localhost:8787`**.

---

## 🧪 Unit & Security Tests
To execute the automated test suite for order creation, exact amount calculations, security hardening, and error responses:
```bash
npm --prefix worker run test
```

---

## 📡 API Endpoints Reference

### 1. Create Order
- **Endpoint**: `POST /api/orders`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "productId": "creator-pack"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "orderId": "volt_ord_8f3a9e1c4b2d",
    "productId": "creator-pack",
    "amount": "29.4271",
    "currency": "USDT",
    "network": "BSC",
    "chainId": 97,
    "recipient": "0x000000000000000000000000000000000000DEV",
    "expiresAt": "2026-09-03T21:30:00.000Z",
    "status": "PENDING"
  }
  ```

#### Example cURL Request (Create Order):
```bash
curl -X POST http://localhost:8787/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": "creator-pack"}'
```

---

### 2. Get Order Status
- **Endpoint**: `GET /api/status?orderId=volt_ord_8f3a9e1c4b2d`
- **Response** (`200 OK`):
  ```json
  {
    "orderId": "volt_ord_8f3a9e1c4b2d",
    "status": "PENDING",
    "amount": "29.4271",
    "currency": "USDT",
    "network": "BSC",
    "chainId": 97,
    "recipient": "0x000000000000000000000000000000000000DEV",
    "expiresAt": "2026-09-03T21:30:00.000Z",
    "txHash": null,
    "confirmations": 0
  }
  ```

#### Example cURL Request (Get Status):
```bash
curl -X GET "http://localhost:8787/api/status?orderId=volt_ord_8f3a9e1c4b2d"
```

---

## 🔄 Connecting Frontend ↔ Local Worker

### Connect Frontend to Local Worker:
To test the frontend directly against your local Worker and D1 database:

1. In `src/config.ts`, change `APP_MODE`:
   ```typescript
   export const APP_MODE: AppMode = 'local';
   ```
   *(Or set `VITE_APP_MODE=local` in your `.env` file)*.
2. The frontend will now send all `createOrder` and `getOrderStatus` requests to `http://localhost:8787`.

### Return Frontend to Demo Mode:
To switch back to standalone demo mode without backend dependencies:

1. In `src/config.ts`, set `APP_MODE`:
   ```typescript
   export const APP_MODE: AppMode = 'demo';
   ```
2. The application immediately resumes using client-side mock persistence and demo payment simulations.

---

## 🔒 Security & Server Authority
- **Price & Amount Authority**: Client cannot specify or override price, chainId, recipient, or amount. Any extra fields sent in POST body are strictly discarded server-side.
- **Exact Amounts**: USDT amounts are calculated using CSPRNG integer arithmetic (`29.0001` - `29.9999` with 4 decimal places) and stored in D1 as `TEXT` to prevent float precision loss.
- **No Secrets**: Development fallback recipient `DEV_PAYMENT_RECIPIENT` is used locally. Production recipient is configured via Cloudflare environment variable `PAYMENT_RECIPIENT`.

---

## 🌐 BSC Testnet Integration

This module prepares the backend for controlled, secure integration with **BNB Smart Chain (BSC) Testnet**.

### 1. What is BSC Testnet?
BSC Testnet is the official test network for BNB Smart Chain. It mirrors the consensus and smart contract environment of BSC Mainnet but uses worthless test tokens (`tBNB` and test `USDT`) for safe and controlled debugging of dApps, smart contracts, and web3 backends without risking real assets.

- **Chain ID (Decimal)**: `97`
- **Chain ID (Hex)**: `0x61`

### 2. Required Environment Variables
The Worker strictly relies on server-side authority for blockchain settings. Configure these variables on the Worker:

- `BSC_RPC_URL`: The JSON-RPC endpoint for a BSC Testnet node (e.g., `https://data-seed-prebsc-1-s1.binance.org:8545/`).
- `USDT_CONTRACT_ADDRESS`: The official BEP-20 Binance-Peg USDT token contract address on BSC Testnet (`0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`).
- `RPC_CHUNK_SIZE`: Range query chunk size for future blockchain log scans (default: `1000` blocks).
- `PAYMENT_RECIPIENT`: Authoritative address to receive USDT payments.

### 3. Critical Security Warnings 🛡️
* **NEVER enter any Private Keys (`sk`) or Seed Phrases** inside the frontend, the Worker configuration, or environment variables. This project operates as a non-custodial paywall. Transactions are signed solely on the client side by the user's wallet via EIP-1193.
* **Never accept parameters sent by the client** to override blockchain RPC nodes, contract addresses, token symbols, or recipient wallets. The Worker rejects all client overrides.

### 4. Verification Engine & On-Chain Status
- **Fully Functional On-Chain Verification**: The backend features a production-ready payment verifier engine. It validates transaction hashes (`clientTxHash`) directly via `eth_getTransactionReceipt` (Path A) and automatically falls back to an optimized chunked `eth_getLogs` query (Path B) for manual payment flows.
- **Native BSC Finality Support**: The payment engine prioritizes BNB Smart Chain's native `finalized` block tag to approve payments securely and instantly on finality, safely falling back to standard 12-block confirmation rules if the RPC node does not support the finalized tag.
- **Strict Double-Spend and Re-use Protection**: Every validated transaction is recorded atomically in the D1 database. Reusing the same `txHash` across multiple orders is completely blocked.


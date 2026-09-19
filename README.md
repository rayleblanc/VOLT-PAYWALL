# VOLT Paywall & Digital Product Store

VOLT Paywall is an automated, non-custodial digital product store and micro-checkout engine running on Cloudflare Workers and React + Vite. All purchases settle in **USDT (BEP-20)** on **BNB Smart Chain** directly to your non-custodial EVM wallet.

---

## 🛒 Current Active Catalog

| Product ID | Name | Price (USDT) | Delivery Mode | Included Content |
| :--- | :--- | :--- | :--- | :--- |
| `creator-pack` | **VOLT Paywall Commercial Kit** | **29 USDT** | `DRIVE_FILE` | Full source code ZIP + Cloudflare Worker backend + Commercial License |
| `vibe-error-fixer` | **Vibe Error Fixer** | **9 USDT** | `CREDITS` | 5 AI-assisted build & runtime error debug credits (30-day access key) |

---

## 🚀 How to Add a 3rd Product in the Future

Adding a new product to the VOLT Store requires updating the catalog configuration in both the backend Cloudflare Worker and the frontend app.

### Step 1: Add Product to Worker Config (`/worker/src/config.ts`)
Add a new entry to `PRODUCTS_CATALOG`:

```typescript
{
  id: 'my-new-tool',
  name: 'My New Developer Tool',
  description: 'Instant automated code generator for React & Cloudflare Workers.',
  price: '19', // Price in USDT (exact integer string)
  currency: 'USDT',
  network: 'BSC',
  chainId: 56,
  active: true, // Must be true for orders to be accepted
  deliveryMode: 'CREDITS', // Options: 'CREDITS' | 'DRIVE_FILE' | 'LICENSE_KEY'
  driveFileId: '', // (Optional) Google Drive ID if deliveryMode === 'DRIVE_FILE'
  initialCredits: 10, // (Optional) Initial credits if deliveryMode === 'CREDITS'
  features: [
    '10 AI Generation Credits',
    'Instant token access',
    'Zero monthly subscription'
  ]
}
```

### Step 2: Add Product to Frontend Config (`/src/config.ts`)
Add the identical product object to `PRODUCTS_CATALOG` in `/src/config.ts` so the UI switcher and pricing card render the new product option.

### Step 3: Handle Delivery Format (If introducing a new `deliveryMode`)
- **For `DRIVE_FILE`**: Set `driveFileId` in worker config. The worker will automatically sign a 1-hour download URL.
- **For `CREDITS`**: Set `initialCredits`. The worker will issue an access token and store credit balances in the D1 database (`user_credits` table).
- **For custom modes**: Extend the delivery renderer in `/src/components/PaidCard.tsx` and the delivery logic in `/worker/src/index.ts`.

---

## 🛡️ Validation & Inactive Protection
- The backend automatically blocks order creation (`INVALID_PRODUCT`) if a `productId` is non-existent or has `active: false`.
- Prices and recipient wallets are strictly verified on the server side during on-chain transaction verification.

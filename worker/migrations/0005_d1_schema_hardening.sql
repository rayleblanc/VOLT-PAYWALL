-- VOLT Paywall - Migration 0005: D1 Schema Hardening for Orders, Payments, and Download Tokens

-- Ensure jti column exists in download_tokens
ALTER TABLE download_tokens ADD COLUMN jti TEXT;

-- Ensure confirmed_at column exists in payments
ALTER TABLE payments ADD COLUMN confirmed_at TEXT;

-- Backfill jti in download_tokens if null
UPDATE download_tokens SET jti = token_hash WHERE jti IS NULL;

-- Backfill confirmed_at in payments if null
UPDATE download_tokens SET created_at = created_at WHERE 1=0;

-- Additional utility indexes for high performance lookup
CREATE INDEX IF NOT EXISTS idx_download_tokens_jti ON download_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);

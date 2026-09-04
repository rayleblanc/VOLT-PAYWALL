-- VOLT Paywall - Migration 0003: V5 Schema Alignment for Dual Payment Paths (Wallet vs Manual)

-- Add payment_mode and buyer_address columns to orders if not present
ALTER TABLE orders ADD COLUMN payment_mode TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE orders ADD COLUMN buyer_address TEXT;

-- Add amount_units to payments table for exact token units tracking
ALTER TABLE payments ADD COLUMN amount_units TEXT;

-- Compound indexes for efficient status/expiration and unit matching
CREATE INDEX IF NOT EXISTS idx_orders_status_expires_at ON orders(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_expected_units_status ON orders(expected_units, status);

-- Partial unique index on orders.tx_hash to prevent txHash reuse
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_tx_hash_unique ON orders(tx_hash) WHERE tx_hash IS NOT NULL;

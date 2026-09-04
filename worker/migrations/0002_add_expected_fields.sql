-- VOLT Paywall - Migration 0002: Add expected_amount and expected_units to orders

ALTER TABLE orders ADD COLUMN expected_amount TEXT;
ALTER TABLE orders ADD COLUMN expected_units TEXT;

-- Backfill existing rows
UPDATE orders SET expected_amount = amount WHERE expected_amount IS NULL;
UPDATE orders SET expected_units = CAST(ROUND(CAST(amount AS REAL) * 10000) AS TEXT) WHERE expected_units IS NULL AND amount IS NOT NULL;

-- Explicit indexes on orders table
CREATE INDEX IF NOT EXISTS idx_orders_id ON orders(id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tx_hash ON orders(tx_hash);

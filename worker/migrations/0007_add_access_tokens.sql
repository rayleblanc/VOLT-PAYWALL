-- VOLT Paywall - Migration 0007: Add access_tokens table for CREDITS-based products (Vibe Error Fixer)

CREATE TABLE IF NOT EXISTS access_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 5,
  initial_credits INTEGER NOT NULL DEFAULT 5,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_access_tokens_token_hash ON access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_access_tokens_order_id ON access_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_product_id ON access_tokens(product_id);

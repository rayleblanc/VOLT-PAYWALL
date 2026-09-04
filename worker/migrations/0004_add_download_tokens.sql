-- VOLT Paywall - Migration 0004: Add download_tokens table for secure gated file delivery

CREATE TABLE IF NOT EXISTS download_tokens (
  id INTEGER PRIMARY KEY,
  order_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_download_tokens_token_hash ON download_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);

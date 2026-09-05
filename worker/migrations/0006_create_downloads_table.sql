-- VOLT Paywall - Migration 0006: Dedicated downloads table for token usage, quotas and delivery audits

CREATE TABLE IF NOT EXISTS downloads (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_download_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_downloads_access_token ON downloads(access_token);
CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);

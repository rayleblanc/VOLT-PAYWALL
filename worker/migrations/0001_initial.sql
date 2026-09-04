-- VOLT Paywall - Initial D1 Database Migration

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  network TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_block INTEGER,
  paid_at TEXT,
  tx_hash TEXT,
  confirmations INTEGER,
  updated_at TEXT NOT NULL
);

-- Payments log table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  token_contract TEXT,
  from_address TEXT,
  to_address TEXT,
  amount TEXT,
  block_number INTEGER,
  confirmations INTEGER,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Download tokens table (prepared for future deliverable access)
CREATE TABLE IF NOT EXISTS download_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Indexes for efficient queries and uniqueness guards
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_tx_hash ON orders(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);

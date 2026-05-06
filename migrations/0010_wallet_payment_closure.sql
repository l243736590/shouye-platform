CREATE TABLE IF NOT EXISTS point_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'recharge',
  amount_yuan INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  channel TEXT NOT NULL DEFAULT 'manual',
  out_trade_no TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_point_orders_user
  ON point_orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_point_orders_status
  ON point_orders(status, created_at DESC);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  earning_points INTEGER NOT NULL DEFAULT 0,
  amount_yuan INTEGER NOT NULL DEFAULT 0,
  payout_method TEXT NOT NULL DEFAULT '',
  account_label TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user
  ON withdrawal_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status
  ON withdrawal_requests(status, created_at DESC);

CREATE TABLE IF NOT EXISTS point_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  account_type TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  ref_type TEXT NOT NULL DEFAULT '',
  ref_id TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_point_ledger_user
  ON point_ledger(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_point_ledger_ref
  ON point_ledger(ref_type, ref_id);

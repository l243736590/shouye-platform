CREATE TABLE IF NOT EXISTS merchant_leads (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL DEFAULT '',
  merchant_title TEXT NOT NULL,
  merchant_type TEXT NOT NULL DEFAULT '',
  user_id TEXT,
  user_name TEXT NOT NULL DEFAULT '',
  user_contact TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_merchant_leads_created_at
  ON merchant_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_merchant_leads_status
  ON merchant_leads(status, created_at DESC);

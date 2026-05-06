CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  reporter_user_id TEXT,
  reporter_contact TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status_created_at
  ON content_reports(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_content
  ON content_reports(content_type, content_id);

CREATE TABLE IF NOT EXISTS moderation_events (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL DEFAULT '',
  user_id TEXT,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  matched_terms TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_moderation_events_created_at
  ON moderation_events(created_at DESC);

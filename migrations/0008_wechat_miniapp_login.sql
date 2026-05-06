CREATE TABLE IF NOT EXISTS wechat_miniapp_users (
  openid TEXT PRIMARY KEY,
  unionid TEXT NOT NULL DEFAULT '',
  user_id TEXT NOT NULL,
  session_key TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wechat_miniapp_users_user_id
  ON wechat_miniapp_users(user_id);

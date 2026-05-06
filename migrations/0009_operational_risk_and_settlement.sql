CREATE TABLE IF NOT EXISTS question_bounties (
  question_id TEXT PRIMARY KEY,
  asker_user_id TEXT,
  answer_id TEXT,
  answerer_user_id TEXT,
  reward_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'held',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  settled_at TEXT,
  FOREIGN KEY (question_id) REFERENCES community_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (asker_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (answer_id) REFERENCES question_answers(id) ON DELETE SET NULL,
  FOREIGN KEY (answerer_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_question_bounties_status
  ON question_bounties(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS question_disputes (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  answer_id TEXT,
  reporter_user_id TEXT,
  type TEXT NOT NULL DEFAULT 'appeal',
  reason TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES community_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (answer_id) REFERENCES question_answers(id) ON DELETE SET NULL,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_question_disputes_status
  ON question_disputes(status, created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id TEXT PRIMARY KEY,
  actor_key TEXT NOT NULL,
  action TEXT NOT NULL,
  content_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_actor_action
  ON rate_limit_events(actor_key, action, created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_content
  ON rate_limit_events(actor_key, action, content_hash, created_at);

CREATE TABLE IF NOT EXISTS content_reactions (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  actor_key TEXT NOT NULL,
  user_id TEXT,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_reactions_unique
  ON content_reactions(content_type, content_id, actor_key);

CREATE INDEX IF NOT EXISTS idx_content_reactions_content
  ON content_reactions(content_type, content_id);

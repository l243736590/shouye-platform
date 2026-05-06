CREATE TABLE IF NOT EXISTS community_questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '韩国',
  city TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '韩国留学',
  reward_points INTEGER NOT NULL DEFAULT 0,
  answers_count INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT,
  identity TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  detail TEXT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS question_answers (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT,
  identity TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  accepted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES community_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_community_questions_created_at ON community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_category_status ON community_questions(category, status);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id, created_at DESC);

CREATE TABLE IF NOT EXISTS merchant_brand_decorations (
  brand_id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  hero_title TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  contact_copy TEXT NOT NULL DEFAULT '',
  case_one TEXT NOT NULL DEFAULT '',
  case_two TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

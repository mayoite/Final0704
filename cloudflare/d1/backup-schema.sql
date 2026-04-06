-- Cloudflare D1 backup schema for catalog + business stats fallbacks.
-- Apply with:
--   wrangler d1 execute <DB_NAME> --file cloudflare/d1/backup-schema.sql

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  series TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  images TEXT, -- JSON array string
  flagship_image TEXT,
  map_layout TEXT,
  features TEXT, -- JSON array string
  finishes TEXT, -- JSON array string
  metadata TEXT, -- JSON object string
  specs TEXT, -- JSON object string
  series_id TEXT,
  series_name TEXT,
  created_at TEXT,
  alt_text TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

CREATE TABLE IF NOT EXISTS product_slug_aliases (
  alias_slug TEXT PRIMARY KEY,
  canonical_slug TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_slug_aliases_canonical_slug
  ON product_slug_aliases(canonical_slug);

CREATE TABLE IF NOT EXISTS business_stats_current (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projects_delivered INTEGER NOT NULL DEFAULT 0,
  client_organisations INTEGER NOT NULL DEFAULT 0,
  sectors_served INTEGER NOT NULL DEFAULT 0,
  locations_served INTEGER NOT NULL DEFAULT 0,
  years_experience INTEGER NOT NULL DEFAULT 0,
  as_of_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_business_stats_current_active_updated
  ON business_stats_current(is_active, updated_at DESC, as_of_date DESC);

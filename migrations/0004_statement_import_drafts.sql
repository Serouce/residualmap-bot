CREATE TABLE IF NOT EXISTS import_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  chat_id TEXT NOT NULL,
  telegram_update_id TEXT,
  telegram_file_id TEXT,
  telegram_file_unique_id TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_sha256 TEXT NOT NULL,
  source_name TEXT,
  period_start TEXT,
  period_end TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled', 'failed')),
  item_count INTEGER NOT NULL DEFAULT 0,
  import_count INTEGER NOT NULL DEFAULT 0,
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  expense_minor INTEGER NOT NULL DEFAULT 0,
  income_minor INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  confirmed_at TEXT,
  cancelled_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_import_batches_user_status
  ON import_batches(user_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_import_batches_user_file_hash
  ON import_batches(user_id, file_sha256);

CREATE TABLE IF NOT EXISTS import_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  transaction_id INTEGER,
  kind TEXT NOT NULL CHECK (kind IN ('expense', 'income', 'transfer', 'unknown')),
  amount_minor INTEGER,
  currency TEXT,
  category TEXT,
  subcategory TEXT,
  counterparty TEXT,
  description TEXT,
  raw_text TEXT NOT NULL,
  local_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'duplicate', 'skipped', 'imported', 'cancelled')),
  duplicate_transaction_id INTEGER,
  confidence REAL,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (batch_id) REFERENCES import_batches(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (duplicate_transaction_id) REFERENCES transactions(id)
);

CREATE INDEX IF NOT EXISTS idx_import_items_batch_status
  ON import_items(batch_id, status);

CREATE INDEX IF NOT EXISTS idx_import_items_user_date
  ON import_items(user_id, local_date, status);

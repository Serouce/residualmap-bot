CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id TEXT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Qyzylorda',
  currency TEXT NOT NULL DEFAULT 'KZT',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS processed_updates (
  update_id TEXT PRIMARY KEY,
  processed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_update_id TEXT,
  user_id INTEGER NOT NULL,
  chat_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (
    kind IN (
      'expense',
      'income',
      'loan_out',
      'loan_repayment',
      'borrow_in',
      'borrow_repayment',
      'transfer',
      'correction'
    )
  ),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL DEFAULT 'KZT',
  category TEXT,
  subcategory TEXT,
  counterparty TEXT,
  description TEXT,
  raw_text TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  deleted_at TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, local_date, status);

CREATE INDEX IF NOT EXISTS idx_transactions_user_kind
  ON transactions(user_id, kind, status);

CREATE INDEX IF NOT EXISTS idx_transactions_counterparty
  ON transactions(user_id, counterparty, status);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  transaction_id INTEGER,
  action TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS category_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  alias TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, alias),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

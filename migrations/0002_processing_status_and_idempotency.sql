ALTER TABLE processed_updates
  ADD COLUMN status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed'));

ALTER TABLE processed_updates
  ADD COLUMN completed_at TEXT;

ALTER TABLE processed_updates
  ADD COLUMN last_error TEXT;

ALTER TABLE processed_updates
  ADD COLUMN attempts INTEGER NOT NULL DEFAULT 1;

UPDATE processed_updates
SET completed_at = processed_at
WHERE status = 'completed' AND completed_at IS NULL;

UPDATE users
SET currency = 'KZT'
WHERE currency != 'KZT';

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_telegram_update_id
  ON transactions(telegram_update_id)
  WHERE telegram_update_id IS NOT NULL;

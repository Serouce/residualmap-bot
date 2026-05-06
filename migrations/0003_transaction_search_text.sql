ALTER TABLE transactions
  ADD COLUMN search_text TEXT;

UPDATE transactions
SET search_text = lower(
  COALESCE(id, '') || ' ' ||
  COALESCE(local_date, '') || ' ' ||
  COALESCE(kind, '') || ' ' ||
  COALESCE(amount_minor, '') || ' ' ||
  COALESCE(currency, '') || ' ' ||
  COALESCE(category, '') || ' ' ||
  COALESCE(subcategory, '') || ' ' ||
  COALESCE(counterparty, '') || ' ' ||
  COALESCE(description, '') || ' ' ||
  COALESCE(raw_text, '')
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_status_date
  ON transactions(user_id, status, local_date);

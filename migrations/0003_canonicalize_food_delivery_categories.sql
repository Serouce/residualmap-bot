CREATE TABLE IF NOT EXISTS _category_alias_seed (
  alias TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT
);

DELETE FROM _category_alias_seed;

INSERT INTO _category_alias_seed (alias, category, subcategory) VALUES
  ('Еда Доставка', 'Еда', 'Доставка'),
  ('Еда Доставка еды', 'Еда', 'Доставка'),
  ('Доставка еды', 'Еда', 'Доставка'),
  ('Доставка', 'Еда', 'Доставка'),
  ('Wolt', 'Еда', 'Доставка'),
  ('Glovo', 'Еда', 'Доставка'),
  ('Яндекс Еда', 'Еда', 'Доставка'),
  ('Yandex Eats', 'Еда', 'Доставка'),
  ('Delivery Club', 'Еда', 'Доставка'),
  ('Chocofood', 'Еда', 'Доставка'),
  ('Еда Кафе', 'Еда', 'Кафе и рестораны'),
  ('Еда Рестораны', 'Еда', 'Кафе и рестораны'),
  ('Кафе', 'Еда', 'Кафе и рестораны'),
  ('Рестораны', 'Еда', 'Кафе и рестораны'),
  ('Кафе рестораны', 'Еда', 'Кафе и рестораны'),
  ('Еда Продукты', 'Еда', 'Продукты'),
  ('Продукты питания', 'Еда', 'Продукты'),
  ('Супермаркет', 'Еда', 'Продукты'),
  ('Супермаркеты', 'Еда', 'Продукты'),
  ('Гипермаркет', 'Еда', 'Продукты'),
  ('Транспорт Такси', 'Транспорт', 'Такси'),
  ('Яндекс Такси', 'Транспорт', 'Такси'),
  ('Yandex Taxi', 'Транспорт', 'Такси'),
  ('Такси', 'Транспорт', 'Такси'),
  ('Транспорт Общественный транспорт', 'Транспорт', 'Общественный транспорт'),
  ('Общественный транспорт', 'Транспорт', 'Общественный транспорт'),
  ('Автобус', 'Транспорт', 'Общественный транспорт'),
  ('Метро', 'Транспорт', 'Общественный транспорт'),
  ('Маршрутка', 'Транспорт', 'Общественный транспорт'),
  ('Связь Мобильная связь', 'Связь', 'Мобильная связь'),
  ('Мобильная связь', 'Связь', 'Мобильная связь'),
  ('Сотовая связь', 'Связь', 'Мобильная связь'),
  ('Телефонный тариф', 'Связь', 'Мобильная связь'),
  ('Здоровье Аптека', 'Здоровье', 'Аптека'),
  ('Аптека', 'Здоровье', 'Аптека'),
  ('Лекарства', 'Здоровье', 'Аптека'),
  ('Дом Коммунальные услуги', 'Дом', 'Коммунальные услуги'),
  ('Коммунальные услуги', 'Дом', 'Коммунальные услуги'),
  ('Коммуналка', 'Дом', 'Коммунальные услуги'),
  ('ЖКХ', 'Дом', 'Коммунальные услуги');

INSERT INTO category_aliases (user_id, alias, category, subcategory, created_at)
SELECT NULL, seed.alias, seed.category, seed.subcategory, datetime('now')
FROM _category_alias_seed AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM category_aliases AS existing
  WHERE existing.user_id IS NULL AND existing.alias = seed.alias
);

INSERT INTO audit_log (user_id, transaction_id, action, payload_json, created_at)
SELECT DISTINCT
  txn.user_id,
  txn.id,
  'canonicalize_category',
  '{"source":"0003_category_alias_seed"}',
  datetime('now')
FROM transactions AS txn
JOIN _category_alias_seed AS seed
  ON (
    txn.category = seed.alias
    OR txn.subcategory = seed.alias
    OR TRIM(COALESCE(txn.category, '') || ' ' || COALESCE(txn.subcategory, '')) = seed.alias
  )
WHERE txn.kind = 'expense'
  AND NOT (
    txn.category = seed.category
    AND COALESCE(txn.subcategory, '') = COALESCE(seed.subcategory, '')
  );

UPDATE transactions
SET
  category = (
    SELECT seed.category
    FROM _category_alias_seed AS seed
    WHERE transactions.category = seed.alias
      OR transactions.subcategory = seed.alias
      OR TRIM(COALESCE(transactions.category, '') || ' ' || COALESCE(transactions.subcategory, '')) = seed.alias
    LIMIT 1
  ),
  subcategory = (
    SELECT seed.subcategory
    FROM _category_alias_seed AS seed
    WHERE transactions.category = seed.alias
      OR transactions.subcategory = seed.alias
      OR TRIM(COALESCE(transactions.category, '') || ' ' || COALESCE(transactions.subcategory, '')) = seed.alias
    LIMIT 1
  ),
  updated_at = datetime('now')
WHERE kind = 'expense'
  AND EXISTS (
    SELECT 1
    FROM _category_alias_seed AS seed
    WHERE (
        transactions.category = seed.alias
        OR transactions.subcategory = seed.alias
        OR TRIM(COALESCE(transactions.category, '') || ' ' || COALESCE(transactions.subcategory, '')) = seed.alias
      )
      AND NOT (
        transactions.category = seed.category
        AND COALESCE(transactions.subcategory, '') = COALESCE(seed.subcategory, '')
      )
  );

DROP TABLE _category_alias_seed;

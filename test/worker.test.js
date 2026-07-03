import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/worker.js";
import { __testables } from "../src/worker.js";

const {
  extractAmount,
  extractDateText,
  fallbackClassify,
  isSupportedCurrency,
  isPdfTelegramDocument,
  matchMerchantCategory,
  mergeCanonicalCategoryRows,
  normalizeCurrency,
  normalizeIntent,
  normalizeStatementImportItem,
  normalizeStatementKind,
  parseStatementAmountText,
  resolveLocalDate,
  resolveLocalDateInfo,
  resolveCanonicalCategory,
  statementPdfMaxBytes,
  escapeHtml,
  csvCell,
  softDelete,
  restoreTransaction
} = __testables;

test("fallback parser recognizes a simple taxi expense", () => {
  const intent = fallbackClassify("1400 такси");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 1400);
  assert.equal(intent.category, "Транспорт");
  assert.equal(intent.subcategory, "Такси");
});

test("fallback parser recognizes amounts attached to KZT markers", () => {
  const intent = fallbackClassify("1500тг такси");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 1500);
  assert.equal(intent.currency, "KZT");
  assert.equal(intent.category, "Транспорт");
});

test("fallback parser ignores calendar numbers before the amount", () => {
  const intent = fallbackClassify("такси 1 мая 1500");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 1500);
  assert.equal(intent.date_text, "1 мая");
});

test("fallback parser extracts backdated Russian month dates", () => {
  const intent = fallbackClassify("1 июля 1453 такси");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 1453);
  assert.equal(intent.category, "Транспорт");
  assert.equal(intent.subcategory, "Такси");
  assert.equal(intent.date_text, "1 июля");
});

test("fallback parser ignores trailing numeric dates when choosing amount", () => {
  const intent = fallbackClassify("такси 1453 01.07");

  assert.equal(intent.amount, 1453);
  assert.equal(intent.date_text, "01.07");
});

test("fallback parser ignores full trailing numeric dates when choosing amount", () => {
  const isoIntent = fallbackClassify("такси 1453 2026-07-01");
  const dottedIntent = fallbackClassify("такси 1453 01.07.2026");

  assert.equal(isoIntent.amount, 1453);
  assert.equal(isoIntent.date_text, "2026-07-01");
  assert.equal(dottedIntent.amount, 1453);
  assert.equal(dottedIntent.date_text, "01.07.2026");
});

test("fallback parser treats period numbers as analytics, not expenses", () => {
  const intent = fallbackClassify("сколько потратил за 30 дней");

  assert.equal(intent.kind, "analytics");
  assert.equal(intent.amount, null);
  assert.equal(intent.period, "last_30_days");
});

test("fallback parser recognizes income", () => {
  const intent = fallbackClassify("зарплата 350000");

  assert.equal(intent.kind, "income");
  assert.equal(intent.amount, 350000);
});

test("category normalization keeps food delivery aliases canonical", () => {
  const intent = normalizeIntent(
    {
      kind: "expense",
      amount: 5100,
      currency: "KZT",
      category: "Еда",
      subcategory: "Доставка еды",
      counterparty: null,
      description: "wolt",
      date_text: null,
      period: null,
      confidence: 1,
      needs_confirmation: false
    },
    "wolt 5100",
    {}
  );

  assert.equal(intent.category, "Еда");
  assert.equal(intent.subcategory, "Доставка");
});

test("fallback parser recognizes food delivery brands", () => {
  const intent = fallbackClassify("wolt 5100");

  assert.equal(intent.kind, "expense");
  assert.equal(intent.category, "Еда");
  assert.equal(intent.subcategory, "Доставка");
});

test("merchant rules classify frequent statement merchants deterministically", () => {
  const cases = [
    ["YANDEX.GO", "Транспорт", "Такси"],
    ["Yandex Taxi", "Транспорт", "Такси"],
    ["Яндекс Такси", "Транспорт", "Такси"],
    ["Beeline", "Связь", "Мобильная связь"],
    ["GOOGLE *Google One", "Подписки", "Сервисы"],
    ["Google One", "Подписки", "Сервисы"],
    ["Wolt", "Еда", "Доставка"],
    ["Glovo", "Еда", "Доставка"],
    ["JETPAY*DODOPIZZA.KZ", "Еда", "Доставка"],
    ["Dodo Pizza", "Еда", "Доставка"],
    ["Magnum", "Еда", "Продукты"],
    ["Small", "Еда", "Продукты"],
    ["Смолл", "Еда", "Продукты"],
    ["Аптека 24", "Здоровье", "Аптека"],
    ["Pharmacy", "Здоровье", "Аптека"],
    ["Europharma", "Здоровье", "Аптека"]
  ];

  for (const [merchant, category, subcategory] of cases) {
    const matched = matchMerchantCategory(merchant);
    assert.equal(matched?.category, category, merchant);
    assert.equal(matched?.subcategory, subcategory, merchant);
  }
});

test("statement amount parser preserves signs and minor units", () => {
  assert.deepEqual(parseStatementAmountText("- 6 315,75 ₸"), { amountMinor: 631575, sign: "-" });
  assert.deepEqual(parseStatementAmountText("+ 2 250,00 ₸"), { amountMinor: 225000, sign: "+" });
  assert.deepEqual(parseStatementAmountText("990.50 KZT"), { amountMinor: 99050, sign: null });
});

test("statement normalization uses amount sign before operation text", async () => {
  const env = {};
  const user = { id: 42, timezone: "UTC" };

  const externalTransfer = await normalizeStatementImportItem(env, user, {
    date: "02.07.26",
    direction: "transfer",
    amount: 5000,
    amount_text: "- 5 000,00 ₸",
    currency: "KZT",
    operation: "Перевод",
    description: "Седа К.",
    merchant: "Седа К.",
    category_hint: null,
    confidence: 0.94
  }, 0);

  assert.equal(externalTransfer.kind, "expense");
  assert.equal(externalTransfer.amountMinor, 500000);
  assert.equal(externalTransfer.localDate, "2026-07-02");
  assert.equal(externalTransfer.status, "draft");
  assert.match(externalTransfer.rawText, /Перевод/);
  assert.equal(externalTransfer.metadata.source_amount_sign, "-");

  const income = await normalizeStatementImportItem(env, user, {
    date: "02.07.26",
    direction: "unknown",
    amount: 2250,
    amount_text: "+ 2 250,00 ₸",
    currency: "KZT",
    operation: "Пополнение",
    description: "Степан Н.",
    merchant: "Степан Н.",
    category_hint: null,
    confidence: 0.9
  }, 1);

  assert.equal(income.kind, "income");
  assert.equal(income.amountMinor, 225000);
  assert.equal(income.category, "Доход");
  assert.equal(income.subcategory, "Прочее");

  const internalTransfer = await normalizeStatementImportItem(env, user, {
    date: "02.07.26",
    direction: "transfer",
    amount: 10000,
    amount_text: "10 000,00 ₸",
    currency: "KZT",
    operation: "Перевод между своими счетами",
    description: "На свой счет",
    merchant: "Мой счет",
    category_hint: null,
    confidence: 0.9
  }, 2);

  assert.equal(internalTransfer.kind, "transfer");
  assert.equal(internalTransfer.status, "skipped");
  assert.equal(internalTransfer.metadata.status_reason, "transfer");
});

test("statement merchant rules override wrong AI category hints for expenses", async () => {
  const env = {};
  const user = { id: 42, timezone: "UTC" };

  const yandex = await normalizeStatementImportItem(env, user, {
    date: "2026-07-02",
    direction: "expense",
    amount: 750,
    amount_text: "- 750,00 ₸",
    currency: "KZT",
    operation: "Покупка",
    description: "YANDEX.GO",
    merchant: "YANDEX.GO",
    category_hint: "Доставка",
    confidence: 0.96
  }, 0);

  assert.equal(yandex.category, "Транспорт");
  assert.equal(yandex.subcategory, "Такси");

  const beelineIncome = await normalizeStatementImportItem(env, user, {
    date: "2026-07-02",
    direction: "income",
    amount: 130,
    amount_text: "+ 130,00 ₸",
    currency: "KZT",
    operation: "Пополнение",
    description: "Beeline",
    merchant: "Beeline",
    category_hint: "Мобильная связь",
    confidence: 0.9
  }, 1);

  assert.equal(beelineIncome.kind, "income");
  assert.equal(beelineIncome.category, "Доход");
  assert.equal(beelineIncome.subcategory, "Прочее");
});

test("fallback parser recognizes giving money as debt", () => {
  const intent = fallbackClassify("дал сестре 5000 в долг");

  assert.equal(intent.kind, "loan_out");
  assert.equal(intent.amount, 5000);
  assert.equal(intent.counterparty, "сестра");
});

test("fallback parser keeps non-debt family support in family help", () => {
  const intent = normalizeIntent(fallbackClassify("скинул сестре 30000"), "скинул сестре 30000", {});

  assert.equal(intent.kind, "expense");
  assert.equal(intent.amount, 30000);
  assert.equal(intent.category, "Семья");
  assert.equal(intent.subcategory, "Помощь семье");
});

test("fallback parser does not treat returned-to-me debt as my repayment", () => {
  const intent = fallbackClassify("вернул мне долг 2000");

  assert.equal(intent.kind, "loan_repayment");
  assert.equal(intent.amount, 2000);
});

test("fallback parser recognizes my debt repayment to another person", () => {
  const intent = fallbackClassify("вернул другу долг 3000");

  assert.equal(intent.kind, "borrow_repayment");
  assert.equal(intent.amount, 3000);
});

test("fallback parser recognizes analytics periods", () => {
  assert.equal(fallbackClassify("сколько потратил за неделю?").period, "week");
  assert.equal(fallbackClassify("траты за последние 7 дней").period, "last_7_days");
});

test("currency policy is explicit KZT-only", () => {
  assert.equal(normalizeCurrency("₸"), "KZT");
  assert.equal(normalizeCurrency("usd"), "USD");
  assert.equal(isSupportedCurrency("KZT"), true);
  assert.equal(isSupportedCurrency("USD"), false);

  const intent = normalizeIntent(
    {
      kind: "expense",
      amount: 10,
      currency: "USD",
      category: null,
      subcategory: null,
      counterparty: null,
      description: "coffee",
      date_text: null,
      period: null,
      confidence: 1,
      needs_confirmation: false
    },
    "coffee 10 usd",
    {}
  );
  assert.equal(intent.currency, "USD");
  assert.equal(isSupportedCurrency(intent.currency), false);
});

test("amount extraction supports common spacing and rejects period-only numbers", () => {
  assert.equal(extractAmount("такси 1 500 тг"), 1500);
  assert.equal(extractAmount("сколько за 30 дней"), null);
  assert.equal(extractAmount("2026-07-01"), null);
  assert.equal(extractAmount("01.07.2026"), null);
});

test("date resolver maps dates without a year to the nearest past date", () => {
  const now = new Date("2026-07-02T06:00:00.000Z");

  assert.equal(resolveLocalDate("вчера", "UTC", now), "2026-07-01");
  assert.equal(resolveLocalDate("позавчера", "UTC", now), "2026-06-30");
  assert.equal(resolveLocalDate("1 июля", "UTC", now), "2026-07-01");
  assert.equal(resolveLocalDate("01.07", "UTC", now), "2026-07-01");
  assert.equal(resolveLocalDate("03.07", "UTC", now), "2025-07-03");
  assert.equal(resolveLocalDate("31 декабря", "UTC", now), "2025-12-31");
  assert.equal(resolveLocalDate("01.07.2026", "UTC", now), "2026-07-01");
  assert.equal(resolveLocalDate("2026-07-01", "UTC", now), "2026-07-01");
});

test("date resolver reports invalid and explicit future dates", () => {
  const now = new Date("2026-07-02T06:00:00.000Z");

  assert.equal(resolveLocalDateInfo("32 июля", "UTC", now).ok, false);
  const future = resolveLocalDateInfo("2026-07-03", "UTC", now);
  assert.equal(future.ok, false);
  assert.equal(future.reason, "future");
});

test("date extractor and PDF limits recognize supported inputs", () => {
  assert.equal(extractDateText("такси 2026-07-01 1453"), "2026-07-01");
  assert.equal(isPdfTelegramDocument({ mime_type: "application/pdf", file_name: "statement.bin" }), true);
  assert.equal(isPdfTelegramDocument({ mime_type: "application/octet-stream", file_name: "statement.pdf" }), true);
  assert.equal(isPdfTelegramDocument({ mime_type: "text/plain", file_name: "statement.txt" }), false);
  assert.equal(statementPdfMaxBytes({ STATEMENT_PDF_MAX_BYTES: "999999999" }), 10 * 1024 * 1024);
});

test("summary category rows merge canonical aliases", () => {
  const rows = mergeCanonicalCategoryRows(
    [
      { currency: "KZT", category: "Еда", subcategory: "Доставка", amount_minor: 510000, count: 1 },
      { currency: "KZT", category: "Еда", subcategory: "Доставка еды", amount_minor: 472400, count: 2 }
    ],
    { includeSubcategory: true }
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].category, "Еда");
  assert.equal(rows[0].subcategory, "Доставка");
  assert.equal(rows[0].amount_minor, 982400);
  assert.equal(rows[0].count, 3);
});

test("database category aliases can canonicalize future duplicate labels", async () => {
  const env = {
    DB: {
      prepare() {
        return {
          bind() {
            return {
              async all() {
                return {
                  results: [
                    { user_id: null, alias: "Кофейни", category: "Еда", subcategory: "Кафе и рестораны" }
                  ]
                };
              }
            };
          }
        };
      }
    }
  };

  const category = await resolveCanonicalCategory(env, 1, {
    rawText: "",
    kind: "expense",
    category: "Кофейни",
    subcategory: null
  });

  assert.equal(category.category, "Еда");
  assert.equal(category.subcategory, "Кафе и рестораны");
});

test("HTML escaping protects Telegram parse_mode output", () => {
  assert.equal(
    escapeHtml(`<b onclick="x">& user</b>`),
    "&lt;b onclick=&quot;x&quot;&gt;&amp; user&lt;/b&gt;"
  );
});

test("Telegram webhook rejects requests when webhook secret is missing", async () => {
  const env = {
    DB: {
      prepare() {
        throw new Error("D1 should not be called without a configured webhook secret");
      }
    }
  };

  const response = await worker.fetch(
    new Request("https://worker.example/telegram", {
      method: "POST",
      body: JSON.stringify({ update_id: 1 })
    }),
    env,
    {}
  );

  assert.equal(response.status, 500);
  assert.equal(await response.text(), "TELEGRAM_WEBHOOK_SECRET is not configured");
});

test("Telegram webhook rejects invalid webhook secret before touching D1", async () => {
  const env = {
    TELEGRAM_WEBHOOK_SECRET: "expected-secret",
    DB: {
      prepare() {
        throw new Error("D1 should not be called for unauthorized webhooks");
      }
    }
  };

  const response = await worker.fetch(
    new Request("https://worker.example/telegram", {
      method: "POST",
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": "wrong-secret"
      },
      body: JSON.stringify({ update_id: 1 })
    }),
    env,
    {}
  );

  assert.equal(response.status, 401);
  assert.equal(await response.text(), "Unauthorized");
});

test("Mini App data API rejects missing Telegram initData before touching D1", async () => {
  const env = {
    TELEGRAM_BOT_TOKEN: "test-token",
    ALLOWED_TELEGRAM_IDS: "111",
    DB: {
      prepare() {
        throw new Error("D1 should not be called without initData");
      }
    }
  };

  const response = await worker.fetch(
    new Request("https://worker.example/api/app-data", {
      method: "POST",
      body: JSON.stringify({})
    }),
    env,
    {}
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.ok, false);
  assert.equal(body.error, "Mini App init data is required");
});

test("Mini App data API rejects signed users outside ALLOWED_TELEGRAM_IDS before touching D1", async () => {
  const token = "123456:test-token";
  const initData = await signedTelegramInitData({ id: 222, first_name: "Demo" }, token);
  const env = {
    TELEGRAM_BOT_TOKEN: token,
    ALLOWED_TELEGRAM_IDS: "111",
    DB: {
      prepare() {
        throw new Error("D1 should not be called for denied users");
      }
    }
  };

  const response = await worker.fetch(
    new Request("https://worker.example/api/app-data", {
      method: "POST",
      body: JSON.stringify({ initData })
    }),
    env,
    {}
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.ok, false);
  assert.equal(body.error, "Access denied");
});

test("Mini App data API scopes transaction queries to the authenticated internal user id", async () => {
  const token = "123456:test-token";
  const initData = await signedTelegramInitData({ id: 111, first_name: "Demo" }, token);
  const db = createMiniAppDbMock({
    id: 42,
    telegram_user_id: "111",
    username: "demo",
    first_name: "Demo",
    last_name: null,
    timezone: "Asia/Qyzylorda",
    currency: "KZT"
  });
  const env = {
    TELEGRAM_BOT_TOKEN: token,
    ALLOWED_TELEGRAM_IDS: "111",
    DEFAULT_TIMEZONE: "Asia/Qyzylorda",
    DB: db
  };

  const response = await worker.fetch(
    new Request("https://worker.example/api/app-data", {
      method: "POST",
      body: JSON.stringify({ initData, period: "month" })
    }),
    env,
    {}
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.user.id, 42);

  const transactionCalls = db.calls.filter((call) => call.sql.includes("FROM transactions"));
  assert.ok(transactionCalls.length >= 3);
  for (const call of transactionCalls) {
    assert.match(call.sql, /WHERE\s+user_id = \?/);
    assert.equal(call.params[0], 42);
  }
});

test("Mini App imports API rejects missing Telegram initData before touching D1", async () => {
  const env = {
    TELEGRAM_BOT_TOKEN: "test-token",
    ALLOWED_TELEGRAM_IDS: "111",
    DB: {
      prepare() {
        throw new Error("D1 should not be called without initData");
      }
    }
  };

  const response = await worker.fetch(
    new Request("https://worker.example/api/imports", {
      method: "POST",
      body: JSON.stringify({})
    }),
    env,
    {}
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.ok, false);
});

test("Mini App imports API lists scoped batches with preview rows", async () => {
  const token = "123456:test-token";
  const initData = await signedTelegramInitData({ id: 111, first_name: "Demo" }, token);
  const db = createMiniAppImportsDbMock({
    user: testTelegramUser(),
    batch: {
      id: 501,
      user_id: 42,
      chat_id: "999",
      file_name: "statement.pdf",
      source_name: "Test Bank",
      period_start: "2026-07-01",
      period_end: "2026-07-02",
      status: "draft",
      item_count: 3,
      import_count: 0,
      duplicate_count: 1,
      skipped_count: 1,
      expense_minor: 631575,
      income_minor: 225000,
      metadata_json: JSON.stringify({ truncated: true, truncation_reason: "Есть еще строки." }),
      created_at: "2026-07-02T08:00:00.000Z",
      updated_at: "2026-07-02T08:01:00.000Z"
    },
    items: [
      {
        id: 601,
        kind: "expense",
        amount_minor: 75000,
        currency: "KZT",
        category: "Транспорт",
        subcategory: "Такси",
        counterparty: "YANDEX.GO",
        description: "YANDEX.GO",
        raw_text: "Покупка | YANDEX.GO",
        local_date: "2026-07-02",
        status: "draft",
        duplicate_transaction_id: null,
        confidence: 0.96,
        metadata_json: "{}",
        created_at: "2026-07-02T08:00:00.000Z",
        updated_at: "2026-07-02T08:00:00.000Z"
      }
    ],
    counts: { draft: 1, duplicate: 1, skipped: 1 }
  });

  const response = await worker.fetch(
    new Request("https://worker.example/api/imports", {
      method: "POST",
      body: JSON.stringify({ initData, limit: 10 })
    }),
    {
      TELEGRAM_BOT_TOKEN: token,
      ALLOWED_TELEGRAM_IDS: "111",
      DB: db
    },
    {}
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.draft_count, 1);
  assert.equal(body.imports[0].id, 501);
  assert.equal(body.imports[0].importable_count, 1);
  assert.equal(body.imports[0].items[0].category, "Транспорт");
  assert.match(body.imports[0].warning, /обрезана/);
  const importCalls = db.calls.filter((call) => call.sql.includes("import_batches") || call.sql.includes("import_items"));
  assert.ok(importCalls.length >= 3);
  assert.ok(importCalls.every((call) => call.params[0] === 42));
});

test("Mini App import action confirms a draft once", async () => {
  const token = "123456:test-token";
  const initData = await signedTelegramInitData({ id: 111, first_name: "Demo" }, token);
  const db = createImportConfirmDbMock({
    user: testTelegramUser(),
    batch: {
      id: 501,
      user_id: 42,
      chat_id: "999",
      file_name: "statement.pdf",
      source_name: "Test Bank",
      status: "draft",
      item_count: 1,
      metadata_json: "{}"
    },
    item: {
      id: 601,
      batch_id: 501,
      user_id: 42,
      kind: "expense",
      amount_minor: 510000,
      currency: "KZT",
      category: "Еда",
      subcategory: "Доставка",
      counterparty: "Wolt",
      description: "Wolt",
      raw_text: "Wolt",
      local_date: "2026-07-01",
      status: "draft",
      confidence: 0.95,
      metadata_json: "{}"
    }
  });

  const response = await worker.fetch(
    new Request("https://worker.example/api/import-action", {
      method: "POST",
      body: JSON.stringify({ initData, batch_id: 501, action: "confirm" })
    }),
    {
      TELEGRAM_BOT_TOKEN: token,
      ALLOWED_TELEGRAM_IDS: "111",
      DB: db
    },
    {}
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.action, "confirm");
  assert.equal(body.imported_count, 1);
  assert.equal(body.import.status, "confirmed");
  assert.equal(db.calls.filter((call) => call.sql.includes("INSERT INTO transactions")).length, 1);
});

test("Mini App import action cancels a draft without inserting transactions", async () => {
  const token = "123456:test-token";
  const initData = await signedTelegramInitData({ id: 111, first_name: "Demo" }, token);
  const db = createImportConfirmDbMock({
    user: testTelegramUser(),
    batch: {
      id: 504,
      user_id: 42,
      chat_id: "999",
      file_name: "statement.pdf",
      status: "draft",
      item_count: 1,
      metadata_json: "{}"
    },
    item: {
      id: 604,
      batch_id: 504,
      user_id: 42,
      kind: "expense",
      amount_minor: 510000,
      currency: "KZT",
      category: "Еда",
      subcategory: "Доставка",
      counterparty: "Wolt",
      description: "Wolt",
      raw_text: "Wolt",
      local_date: "2026-07-01",
      status: "draft",
      confidence: 0.95,
      metadata_json: "{}"
    }
  });

  const response = await worker.fetch(
    new Request("https://worker.example/api/import-action", {
      method: "POST",
      body: JSON.stringify({ initData, batch_id: 504, action: "cancel" })
    }),
    {
      TELEGRAM_BOT_TOKEN: token,
      ALLOWED_TELEGRAM_IDS: "111",
      DB: db
    },
    {}
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.import.status, "cancelled");
  assert.ok(db.calls.every((call) => !call.sql.includes("INSERT INTO transactions")));
});

test("CSV cells escape quotes, commas, and newlines", () => {
  assert.equal(csvCell(null), "");
  assert.equal(csvCell("plain"), "plain");
  assert.equal(csvCell('coffee, "large"\nnext line'), '"coffee, ""large""\nnext line"');
});

test("Telegram /export returns only active records scoped to the allowed user", async (t) => {
  const telegramCalls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    telegramCalls.push({ url: String(url), init });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const db = createTelegramExportDbMock({
    user: {
      id: 42,
      telegram_user_id: "111",
      username: "demo",
      first_name: "Demo",
      last_name: null,
      timezone: "Asia/Qyzylorda",
      currency: "KZT"
    },
    rows: [
      {
        id: 7,
        user_id: 42,
        local_date: "2026-06-08",
        kind: "expense",
        amount_minor: 123450,
        currency: "KZT",
        category: "Food",
        subcategory: "Lunch",
        counterparty: null,
        description: "active row",
        raw_text: "team lunch, active",
        status: "active",
        created_at: "2026-06-08T08:00:00.000Z"
      },
      {
        id: 8,
        user_id: 42,
        local_date: "2026-06-08",
        kind: "expense",
        amount_minor: 99900,
        currency: "KZT",
        category: "Private",
        subcategory: null,
        counterparty: null,
        description: "deleted row",
        raw_text: "deleted secret",
        status: "deleted",
        created_at: "2026-06-08T09:00:00.000Z"
      },
      {
        id: 9,
        user_id: 99,
        local_date: "2026-06-08",
        kind: "expense",
        amount_minor: 50000,
        currency: "KZT",
        category: "Other",
        subcategory: null,
        counterparty: null,
        description: "other user row",
        raw_text: "other user secret",
        status: "active",
        created_at: "2026-06-08T10:00:00.000Z"
      }
    ]
  });

  const response = await worker.fetch(
    new Request("https://worker.example/telegram", {
      method: "POST",
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": "expected-secret"
      },
      body: JSON.stringify({
        update_id: 7001,
        message: {
          message_id: 77,
          text: "/export",
          chat: { id: 999 },
          from: { id: 111, username: "demo", first_name: "Demo" }
        }
      })
    }),
    {
      TELEGRAM_BOT_TOKEN: "test-token",
      TELEGRAM_WEBHOOK_SECRET: "expected-secret",
      ALLOWED_TELEGRAM_IDS: "111",
      DEFAULT_TIMEZONE: "Asia/Qyzylorda",
      DB: db
    },
    {}
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");

  const exportCall = db.calls.find((call) => call.sql.includes("FROM transactions") && call.sql.includes("ORDER BY local_date"));
  assert.ok(exportCall);
  assert.match(exportCall.sql, /WHERE\s+user_id = \? AND status = 'active'/);
  assert.deepEqual(exportCall.params, [42]);

  assert.equal(telegramCalls.length, 1);
  assert.equal(telegramCalls[0].url, "https://api.telegram.org/bottest-token/sendDocument");
  const form = telegramCalls[0].init.body;
  assert.equal(form.get("chat_id"), "999");
  const document = form.get("document");
  const csv = await document.text();

  assert.match(document.name, /^residualmap-\d{4}-\d{2}-\d{2}\.csv$/);
  assert.match(csv, /^id,date,kind,amount,currency,/);
  assert.match(csv, /team lunch, active/);
  assert.doesNotMatch(csv, /deleted secret/);
  assert.doesNotMatch(csv, /other user secret/);
});

test("Telegram PDF import does not download files for denied users", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createProcessedOnlyDbMock();

  const response = await sendTelegramDocument({
    db,
    fromId: 222,
    document: {
      file_id: "pdf-file",
      file_unique_id: "unique-pdf",
      file_name: "statement.pdf",
      mime_type: "application/pdf",
      file_size: 1024
    }
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");
  assert.ok(telegramCalls.every((call) => !call.url.includes("/getFile")));
  assert.ok(telegramCalls.every((call) => !call.url.includes("/file/bot")));
});

test("Telegram PDF import rejects non-PDF and oversized files before download", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramDocumentValidationDbMock(testTelegramUser());

  await sendTelegramDocument({
    db,
    document: {
      file_id: "text-file",
      file_unique_id: "unique-text",
      file_name: "statement.txt",
      mime_type: "text/plain",
      file_size: 1024
    }
  });
  await sendTelegramDocument({
    db,
    updateId: 9102,
    document: {
      file_id: "huge-pdf",
      file_unique_id: "unique-huge",
      file_name: "statement.pdf",
      mime_type: "application/pdf",
      file_size: 11 * 1024 * 1024
    }
  });

  assert.ok(telegramCalls.every((call) => !call.url.includes("/getFile")));
  assert.ok(telegramCalls.every((call) => !call.url.includes("/file/bot")));
});

test("Telegram PDF import rejects spoofed PDF bytes before OpenAI", async (t) => {
  const telegramCalls = captureStatementImportFetch(t, { fileBytes: new Uint8Array([0x6e, 0x6f, 0x70, 0x65]) });
  const db = createTelegramDocumentValidationDbMock(testTelegramUser());

  const response = await sendTelegramDocument({
    db,
    env: { OPENAI_API_KEY: "test-openai-key" },
    document: {
      file_id: "fake-pdf",
      file_unique_id: "unique-fake",
      file_name: "statement.pdf",
      mime_type: "application/pdf",
      file_size: 4
    }
  });

  assert.equal(response.status, 200);
  assert.ok(telegramCalls.some((call) => call.url.includes("/getFile")));
  assert.ok(telegramCalls.some((call) => call.url.includes("/file/bot")));
  assert.ok(telegramCalls.every((call) => call.url !== "https://api.openai.com/v1/responses"));
});

test("Telegram PDF import creates a draft and does not insert transactions before confirmation", async (t) => {
  const telegramCalls = captureStatementImportFetch(t);
  const db = createStatementDraftDbMock({
    user: testTelegramUser(),
    batchId: 501
  });

  const response = await sendTelegramDocument({
    db,
    env: { OPENAI_API_KEY: "test-openai-key", MINI_APP_URL: "https://mini.example/app" },
    document: {
      file_id: "pdf-file",
      file_unique_id: "unique-pdf",
      file_name: "statement.pdf",
      mime_type: "application/pdf",
      file_size: 1024
    }
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");
  assert.ok(telegramCalls.some((call) => call.url.includes("/getFile")));
  assert.ok(telegramCalls.some((call) => call.url.includes("/file/bot")));
  assert.ok(telegramCalls.some((call) => call.url === "https://api.openai.com/v1/responses"));
  const openAiCall = telegramCalls.find((call) => call.url === "https://api.openai.com/v1/responses");
  const openAiBody = JSON.parse(openAiCall.init.body);
  assert.equal(openAiBody.store, false);
  assert.equal(openAiBody.text.format.type, "json_schema");
  assert.equal(openAiBody.text.format.strict, true);
  assert.ok(openAiBody.text.format.schema.required.includes("truncated"));
  assert.ok(openAiBody.text.format.schema.properties.rows.items.required.includes("amount_text"));
  assert.ok(openAiBody.text.format.schema.properties.rows.items.required.includes("operation"));
  assert.equal(openAiBody.input[1].content[0].type, "input_file");
  assert.match(openAiBody.input[1].content[0].file_data, /^data:application\/pdf;base64,/);

  const batchInsert = db.calls.find((call) => call.sql.includes("INSERT INTO import_batches"));
  assert.ok(batchInsert);
  const itemInsert = db.calls.find((call) => call.sql.includes("INSERT INTO import_items"));
  assert.ok(itemInsert);
  assert.equal(itemInsert.params[5], "Еда");
  assert.equal(itemInsert.params[6], "Доставка");
  assert.ok(db.calls.every((call) => !call.sql.includes("INSERT INTO transactions")));

  const summaryCall = telegramCalls.filter((call) => call.url.endsWith("/sendMessage")).at(-1);
  const summaryBody = JSON.parse(summaryCall.init.body);
  assert.match(summaryBody.text, /Черновик импорта PDF-выписки готов/);
  assert.equal(summaryBody.reply_markup.inline_keyboard[0][0].callback_data, "import:confirm:501");
  assert.equal(summaryBody.reply_markup.inline_keyboard[1][0].text, "Открыть панель");
  assert.ok(summaryBody.reply_markup.inline_keyboard[1][0].web_app);
  assert.equal(summaryBody.reply_markup.inline_keyboard[1][0].web_app.url, "https://mini.example/app?tab=import&batch=501");
});

test("Telegram PDF import applies statement signs and merchant rules", async (t) => {
  captureStatementImportFetch(t, {
    openAiPayload: {
      source_name: "Test Bank",
      period_start: "2026-07-01",
      period_end: "2026-07-02",
      truncated: false,
      truncation_reason: null,
      rows: [
        {
          date: "02.07.26",
          direction: "transfer",
          amount: 5000,
          amount_text: "- 5 000,00 ₸",
          currency: "KZT",
          operation: "Перевод",
          description: "Седа К.",
          merchant: "Седа К.",
          category_hint: null,
          confidence: 0.94
        },
        {
          date: "02.07.26",
          direction: "expense",
          amount: 750,
          amount_text: "- 750,00 ₸",
          currency: "KZT",
          operation: "Покупка",
          description: "YANDEX.GO",
          merchant: "YANDEX.GO",
          category_hint: "Доставка",
          confidence: 0.96
        },
        {
          date: "02.07.26",
          direction: "expense",
          amount: 990,
          amount_text: "- 990,00 ₸",
          currency: "KZT",
          operation: "Покупка",
          description: "GOOGLE *Google One",
          merchant: "GOOGLE *Google One",
          category_hint: "Покупки",
          confidence: 0.96
        },
        {
          date: "01.07.26",
          direction: "expense",
          amount: 3760,
          amount_text: "- 3 760,00 ₸",
          currency: "KZT",
          operation: "Покупка",
          description: "JETPAY*DODOPIZZA.KZ",
          merchant: "JETPAY*DODOPIZZA.KZ",
          category_hint: "Кафе",
          confidence: 0.96
        },
        {
          date: "01.07.26",
          direction: "expense",
          amount: 6315.75,
          amount_text: "- 6 315,75 ₸",
          currency: "KZT",
          operation: "Покупка",
          description: "Wolt",
          merchant: "Wolt",
          category_hint: "Такси",
          confidence: 0.96
        }
      ]
    }
  });
  const db = createStatementDraftDbMock({
    user: testTelegramUser(),
    batchId: 505
  });

  await sendTelegramDocument({
    db,
    updateId: 9105,
    env: { OPENAI_API_KEY: "test-openai-key" },
    document: {
      file_id: "pdf-file",
      file_unique_id: "unique-pdf",
      file_name: "statement.pdf",
      mime_type: "application/pdf",
      file_size: 1024
    }
  });

  const items = db.calls.filter((call) => call.sql.includes("INSERT INTO import_items"));
  assert.equal(items.length, 5);

  assert.equal(items[0].params[2], "expense");
  assert.equal(items[0].params[3], 500000);
  assert.equal(items[0].params[10], "2026-07-02");

  assert.equal(items[1].params[2], "expense");
  assert.equal(items[1].params[3], 75000);
  assert.equal(items[1].params[5], "Транспорт");
  assert.equal(items[1].params[6], "Такси");
  assert.equal(items[1].params[10], "2026-07-02");

  assert.equal(items[2].params[5], "Подписки");
  assert.equal(items[2].params[6], "Сервисы");
  assert.equal(items[3].params[5], "Еда");
  assert.equal(items[3].params[6], "Доставка");
  assert.equal(items[3].params[10], "2026-07-01");
  assert.equal(items[4].params[3], 631575);
  assert.equal(items[4].params[5], "Еда");
  assert.equal(items[4].params[6], "Доставка");
});

test("Telegram PDF import summary warns when extraction is truncated", async (t) => {
  const telegramCalls = captureStatementImportFetch(t, {
    openAiPayload: {
      source_name: "Test Bank",
      period_start: "2026-07-01",
      period_end: "2026-07-02",
      truncated: true,
      truncation_reason: "Обработаны только первые строки.",
      rows: [
        {
          date: "2026-07-01",
          direction: "expense",
          amount: 5100,
          amount_text: "- 5 100,00 ₸",
          currency: "KZT",
          operation: "Покупка",
          description: "Wolt",
          merchant: "Wolt",
          category_hint: "Wolt",
          confidence: 0.95
        }
      ]
    }
  });
  const db = createStatementDraftDbMock({
    user: testTelegramUser(),
    batchId: 506
  });

  await sendTelegramDocument({
    db,
    updateId: 9106,
    env: { OPENAI_API_KEY: "test-openai-key" },
    document: {
      file_id: "pdf-file",
      file_unique_id: "unique-pdf",
      file_name: "statement.pdf",
      mime_type: "application/pdf",
      file_size: 1024
    }
  });

  const summaryBody = JSON.parse(telegramCalls.filter((call) => call.url.endsWith("/sendMessage")).at(-1).init.body);
  assert.match(summaryBody.text, /выписка обрезана/);
  assert.match(summaryBody.text, /80/);
});

test("Telegram PDF import does not mark same amount with different merchant as duplicate", async (t) => {
  captureStatementImportFetch(t);
  const db = createStatementDraftDbMock({
    user: testTelegramUser(),
    batchId: 502,
    duplicateRows: [
      {
        id: 700,
        counterparty: "Yandex Taxi",
        description: "Yandex Taxi",
        raw_text: "Yandex Taxi"
      }
    ]
  });

  await sendTelegramDocument({
    db,
    updateId: 9103,
    env: { OPENAI_API_KEY: "test-openai-key" },
    document: {
      file_id: "pdf-file",
      file_unique_id: "unique-pdf",
      file_name: "statement.pdf",
      mime_type: "application/pdf",
      file_size: 1024
    }
  });

  const itemInsert = db.calls.find((call) => call.sql.includes("INSERT INTO import_items"));
  assert.ok(itemInsert);
  assert.equal(itemInsert.params[11], "draft");
  assert.equal(itemInsert.params[12], null);
});

test("Telegram import confirmation inserts draft rows once", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createImportConfirmDbMock({
    user: testTelegramUser(),
    batch: {
      id: 501,
      user_id: 42,
      chat_id: "999",
      file_name: "statement.pdf",
      status: "draft"
    },
    item: {
      id: 601,
      batch_id: 501,
      user_id: 42,
      kind: "expense",
      amount_minor: 510000,
      currency: "KZT",
      category: "Еда",
      subcategory: "Доставка",
      counterparty: "Wolt",
      description: "Wolt",
      raw_text: "Wolt",
      local_date: "2026-07-01",
      status: "draft",
      confidence: 0.95,
      metadata_json: "{}"
    }
  });

  await sendImportCallback({ db, updateId: 9201, batchId: 501 });
  await sendImportCallback({ db, updateId: 9202, batchId: 501 });

  const inserts = db.calls.filter((call) => call.sql.includes("INSERT INTO transactions"));
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0].params[0], "import:501:601");
  assert.ok(db.calls.some((call) => call.sql.includes("UPDATE import_batches") && call.sql.includes("status = 'confirmed'")));
  assert.ok(telegramCalls.some((call) => call.url.endsWith("/answerCallbackQuery")));
});

test("Telegram import cancellation cancels draft rows without inserting transactions", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createImportConfirmDbMock({
    user: testTelegramUser(),
    batch: {
      id: 503,
      user_id: 42,
      chat_id: "999",
      file_name: "statement.pdf",
      status: "draft"
    },
    item: {
      id: 603,
      batch_id: 503,
      user_id: 42,
      kind: "expense",
      amount_minor: 510000,
      currency: "KZT",
      category: "Еда",
      subcategory: "Доставка",
      counterparty: "Wolt",
      description: "Wolt",
      raw_text: "Wolt",
      local_date: "2026-07-01",
      status: "draft",
      confidence: 0.95,
      metadata_json: "{}"
    }
  });

  await sendImportCallback({ db, updateId: 9251, batchId: 503, action: "cancel" });
  await sendImportCallback({ db, updateId: 9252, batchId: 503, action: "cancel" });

  assert.ok(db.calls.some((call) => call.sql.includes("UPDATE import_batches") && call.sql.includes("status = 'cancelled'")));
  assert.ok(db.calls.some((call) => call.sql.includes("UPDATE import_items") && call.sql.includes("status = 'cancelled'")));
  assert.ok(db.calls.some((call) => call.sql.includes("INSERT INTO audit_log") && call.params[2] === "import_cancel"));
  assert.ok(db.calls.every((call) => !call.sql.includes("INSERT INTO transactions")));
  assert.ok(telegramCalls.some((call) => call.url.endsWith("/answerCallbackQuery")));
});

test("Telegram import confirmation skips rows that became duplicates", async (t) => {
  captureTelegramFetch(t);
  const db = createImportConfirmDbMock({
    user: testTelegramUser(),
    duplicateTransactionId: 777,
    batch: {
      id: 502,
      user_id: 42,
      chat_id: "999",
      file_name: "statement.pdf",
      status: "draft"
    },
    item: {
      id: 602,
      batch_id: 502,
      user_id: 42,
      kind: "expense",
      amount_minor: 510000,
      currency: "KZT",
      category: "Еда",
      subcategory: "Доставка",
      counterparty: "Wolt",
      description: "Wolt",
      raw_text: "Wolt",
      local_date: "2026-07-01",
      status: "draft",
      confidence: 0.95,
      metadata_json: "{}"
    }
  });

  await sendImportCallback({ db, updateId: 9301, batchId: 502 });

  assert.ok(db.calls.every((call) => !call.sql.includes("INSERT INTO transactions")));
  const duplicateUpdate = db.calls.find((call) => call.sql.includes("UPDATE import_items") && call.sql.includes("status = 'duplicate'"));
  assert.ok(duplicateUpdate);
  assert.equal(duplicateUpdate.params[0], 777);
});

test("Telegram text entry stores backdated local_date and shows it in response", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramInsertDbMock(testTelegramUser());
  const restoreDate = freezeDate(t, "2026-07-02T06:00:00.000Z");

  const response = await sendTelegramCommand({ text: "1 июля 1453 такси", db, updateId: 9401 });
  restoreDate();

  assert.equal(response.status, 200);
  const insert = db.calls.find((call) => call.sql.includes("INSERT INTO transactions"));
  assert.ok(insert);
  assert.equal(insert.params[12], "2026-07-01");
  const messageBody = JSON.parse(telegramCalls.at(-1).init.body);
  assert.match(messageBody.text, /Дата: <b>2026-07-01<\/b>/);
});

test("Telegram /undo soft-deletes the allowed user's latest active record and audits it", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramMutationDbMock({
    user: testTelegramUser(),
    rows: testTransactionRows()
  });

  const response = await sendTelegramCommand({ text: "/undo", db });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");

  const selectCall = db.calls.find((call) => call.sql.includes("FROM transactions") && call.sql.includes("ORDER BY id DESC"));
  assert.ok(selectCall);
  assert.match(selectCall.sql, /WHERE\s+user_id = \? AND status = 'active'/);
  assert.deepEqual(selectCall.params, [42]);

  const updateCall = db.calls.find((call) => call.sql.includes("UPDATE transactions") && call.sql.includes("status = 'deleted'"));
  assert.ok(updateCall);
  assert.match(updateCall.sql, /WHERE user_id = \? AND id = \? AND status = 'active'/);
  assert.equal(updateCall.params[2], 42);
  assert.equal(updateCall.params[3], 11);

  const auditCall = db.calls.find((call) => call.sql.includes("INSERT INTO audit_log"));
  assert.ok(auditCall);
  assert.deepEqual(auditCall.params.slice(0, 3), [42, 11, "undo"]);
  assert.match(auditCall.params[3], /deleted_at/);

  assert.ok(db.calls.every((call) => !/DELETE\s+FROM\s+transactions/i.test(call.sql)));
  assert.equal(telegramCalls.length, 1);
});

test("Telegram /undo does not mutate when the allowed user has no active records", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramMutationDbMock({
    user: testTelegramUser(),
    rows: testTransactionRows().filter((row) => row.user_id !== 42 || row.status !== "active")
  });

  const response = await sendTelegramCommand({ text: "/undo", db });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");

  const selectCall = db.calls.find((call) => call.sql.includes("FROM transactions") && call.sql.includes("ORDER BY id DESC"));
  assert.ok(selectCall);
  assert.deepEqual(selectCall.params, [42]);
  assert.ok(db.calls.every((call) => !call.sql.includes("UPDATE transactions")));
  assert.ok(db.calls.every((call) => !call.sql.includes("INSERT INTO audit_log")));
  assert.equal(telegramCalls.length, 1);
});

test("Telegram /delete soft-deletes only the allowed user's active record and audits it", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramMutationDbMock({
    user: testTelegramUser(),
    rows: testTransactionRows()
  });

  const response = await sendTelegramCommand({ text: "/delete 7", db });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");

  const selectCall = db.calls.find((call) => call.sql.includes("FROM transactions") && call.sql.includes("status = 'active'"));
  assert.ok(selectCall);
  assert.deepEqual(selectCall.params, [42, 7]);

  const updateCall = db.calls.find((call) => call.sql.includes("UPDATE transactions") && call.sql.includes("status = 'deleted'"));
  assert.ok(updateCall);
  assert.match(updateCall.sql, /WHERE user_id = \? AND id = \? AND status = 'active'/);
  assert.equal(updateCall.params[2], 42);
  assert.equal(updateCall.params[3], 7);

  const auditCall = db.calls.find((call) => call.sql.includes("INSERT INTO audit_log"));
  assert.ok(auditCall);
  assert.deepEqual(auditCall.params.slice(0, 3), [42, 7, "delete"]);
  assert.match(auditCall.params[3], /deleted_at/);

  assert.ok(db.calls.every((call) => !/DELETE\s+FROM\s+transactions/i.test(call.sql)));
  assert.equal(telegramCalls.length, 1);
  assert.equal(JSON.parse(telegramCalls[0].init.body).chat_id, "999");
});

test("Telegram /delete cannot soft-delete another user's active record", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramMutationDbMock({
    user: testTelegramUser(),
    rows: testTransactionRows()
  });

  const response = await sendTelegramCommand({ text: "/delete 9", db });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");

  const selectCall = db.calls.find((call) => call.sql.includes("FROM transactions") && call.sql.includes("status = 'active'"));
  assert.ok(selectCall);
  assert.deepEqual(selectCall.params, [42, 9]);
  assert.ok(db.calls.every((call) => !call.sql.includes("UPDATE transactions")));
  assert.ok(db.calls.every((call) => !call.sql.includes("INSERT INTO audit_log")));
  assert.equal(telegramCalls.length, 1);
});

test("Telegram /restore restores only the allowed user's deleted record and audits it", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramMutationDbMock({
    user: testTelegramUser(),
    rows: testTransactionRows()
  });

  const response = await sendTelegramCommand({ text: "/restore 8", db });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");

  const selectCall = db.calls.find((call) => call.sql.includes("FROM transactions") && call.sql.includes("status = 'deleted'"));
  assert.ok(selectCall);
  assert.deepEqual(selectCall.params, [42, 8]);

  const updateCall = db.calls.find((call) => call.sql.includes("UPDATE transactions") && call.sql.includes("deleted_at = NULL"));
  assert.ok(updateCall);
  assert.match(updateCall.sql, /WHERE user_id = \? AND id = \? AND status = 'deleted'/);
  assert.equal(updateCall.params[1], 42);
  assert.equal(updateCall.params[2], 8);

  const auditCall = db.calls.find((call) => call.sql.includes("INSERT INTO audit_log"));
  assert.ok(auditCall);
  assert.deepEqual(auditCall.params.slice(0, 3), [42, 8, "restore"]);
  assert.match(auditCall.params[3], /restored_at/);

  assert.ok(db.calls.every((call) => !/DELETE\s+FROM\s+transactions/i.test(call.sql)));
  assert.equal(telegramCalls.length, 1);
  assert.equal(JSON.parse(telegramCalls[0].init.body).chat_id, "999");
});

test("Telegram /restore cannot restore another user's deleted record", async (t) => {
  const telegramCalls = captureTelegramFetch(t);
  const db = createTelegramMutationDbMock({
    user: testTelegramUser(),
    rows: testTransactionRows()
  });

  const response = await sendTelegramCommand({ text: "/restore 10", db });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "OK");

  const selectCall = db.calls.find((call) => call.sql.includes("FROM transactions") && call.sql.includes("status = 'deleted'"));
  assert.ok(selectCall);
  assert.deepEqual(selectCall.params, [42, 10]);
  assert.ok(db.calls.every((call) => !call.sql.includes("UPDATE transactions")));
  assert.ok(db.calls.every((call) => !call.sql.includes("INSERT INTO audit_log")));
  assert.equal(telegramCalls.length, 1);
});

test("soft delete scopes by user id and writes an audit entry", async () => {
  const db = createMutationDbMock({ changes: 1 });
  const env = { DB: db };

  const deleted = await softDelete(env, 42, 7, "test_delete");

  assert.equal(deleted, true);
  assert.equal(db.calls.length, 2);
  assert.match(db.calls[0].sql, /UPDATE transactions/);
  assert.match(db.calls[0].sql, /WHERE user_id = \? AND id = \? AND status = 'active'/);
  assert.equal(db.calls[0].params[2], 42);
  assert.equal(db.calls[0].params[3], 7);
  assert.match(db.calls[1].sql, /INSERT INTO audit_log/);
  assert.deepEqual(db.calls[1].params.slice(0, 4), [42, 7, "test_delete", db.calls[1].params[3]]);
  assert.match(db.calls[1].params[3], /deleted_at/);
});

test("soft delete returns false and skips audit when no active row changes", async () => {
  const db = createMutationDbMock({ changes: 0 });
  const env = { DB: db };

  const deleted = await softDelete(env, 42, 7, "test_delete");

  assert.equal(deleted, false);
  assert.equal(db.calls.length, 1);
  assert.match(db.calls[0].sql, /UPDATE transactions/);
});

test("restore scopes by user id and writes an audit entry", async () => {
  const db = createMutationDbMock({ changes: 1 });
  const env = { DB: db };

  const restored = await restoreTransaction(env, 42, 7, "test_restore");

  assert.equal(restored, true);
  assert.equal(db.calls.length, 2);
  assert.match(db.calls[0].sql, /UPDATE transactions/);
  assert.match(db.calls[0].sql, /WHERE user_id = \? AND id = \? AND status = 'deleted'/);
  assert.equal(db.calls[0].params[1], 42);
  assert.equal(db.calls[0].params[2], 7);
  assert.match(db.calls[1].sql, /INSERT INTO audit_log/);
  assert.deepEqual(db.calls[1].params.slice(0, 4), [42, 7, "test_restore", db.calls[1].params[3]]);
  assert.match(db.calls[1].params[3], /restored_at/);
});

async function signedTelegramInitData(user, botToken) {
  const authDate = Math.floor(Date.now() / 1000);
  const params = new URLSearchParams();
  params.set("auth_date", String(authDate));
  params.set("user", JSON.stringify(user));

  const pairs = [];
  for (const [key, value] of params.entries()) {
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");
  const secretKey = await testHmacSha256("WebAppData", botToken);
  const hash = toTestHex(await testHmacSha256(secretKey, dataCheckString));
  params.set("hash", hash);
  return params.toString();
}

async function testHmacSha256(key, data) {
  const encoder = new TextEncoder();
  const keyBytes = typeof key === "string" ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}

function toTestHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createMiniAppDbMock(user) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return createBoundStatement(sql, user);
        },
        async first() {
          calls.push({ sql, params: [] });
          return null;
        },
        async all() {
          calls.push({ sql, params: [] });
          return { results: [] };
        }
      };
    },
    async batch(statements) {
      return Promise.all(statements.map((statement) => statement.all()));
    }
  };
}

function createMiniAppImportsDbMock({ user, batch, items, counts }) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return {
            async first() {
              if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
              if (sql.includes("INSERT INTO users")) return user;
              return null;
            },
            async all() {
              if (sql.includes("FROM import_batches")) {
                return { results: [batch] };
              }
              if (sql.includes("SELECT status, COUNT(*) AS count")) {
                return {
                  results: Object.entries(counts || {}).map(([status, count]) => ({ status, count }))
                };
              }
              if (sql.includes("FROM import_items")) {
                return { results: items || [] };
              }
              return { results: [] };
            },
            async run() {
              return { success: true, meta: { changes: 1 } };
            }
          };
        },
        async first() {
          calls.push({ sql, params: [] });
          return null;
        },
        async all() {
          calls.push({ sql, params: [] });
          return { results: [] };
        }
      };
    }
  };
}

function createBoundStatement(sql, user) {
  return {
    async first() {
      if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
      if (sql.includes("INSERT INTO users")) return user;
      return null;
    },
    async all() {
      return { results: [] };
    },
    async run() {
      return { success: true, meta: { changes: 1 } };
    }
  };
}

function createMutationDbMock({ changes }) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return {
            async run() {
              return { success: true, meta: { changes } };
            }
          };
        }
      };
    }
  };
}

function createTelegramExportDbMock({ user, rows }) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return createTelegramExportBoundStatement(sql, params, user, rows);
        }
      };
    }
  };
}

function createTelegramExportBoundStatement(sql, params, user, rows) {
  return {
    async first() {
      if (sql.includes("FROM processed_updates")) return null;
      if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
      return null;
    },
    async all() {
      if (sql.includes("FROM transactions")) {
        return {
          results: rows.filter((row) => row.user_id === params[0] && row.status === "active")
        };
      }
      return { results: [] };
    },
    async run() {
      return { success: true, meta: { changes: 1 } };
    }
  };
}

function captureTelegramFetch(t) {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  return calls;
}

async function sendTelegramCommand({ text, db, updateId = 9001 }) {
  return worker.fetch(
    new Request("https://worker.example/telegram", {
      method: "POST",
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": "expected-secret"
      },
      body: JSON.stringify({
        update_id: updateId,
        message: {
          message_id: 77,
          text,
          chat: { id: 999 },
          from: { id: 111, username: "demo", first_name: "Demo" }
        }
      })
    }),
    {
      TELEGRAM_BOT_TOKEN: "test-token",
      TELEGRAM_WEBHOOK_SECRET: "expected-secret",
      ALLOWED_TELEGRAM_IDS: "111",
      DEFAULT_TIMEZONE: "Asia/Qyzylorda",
      DB: db
    },
    {}
  );
}

async function sendTelegramDocument({ db, document, updateId = 9101, fromId = 111, env = {} }) {
  return worker.fetch(
    new Request("https://worker.example/telegram", {
      method: "POST",
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": "expected-secret"
      },
      body: JSON.stringify({
        update_id: updateId,
        message: {
          message_id: 77,
          document,
          chat: { id: 999 },
          from: { id: fromId, username: "demo", first_name: "Demo" }
        }
      })
    }),
    {
      TELEGRAM_BOT_TOKEN: "test-token",
      TELEGRAM_WEBHOOK_SECRET: "expected-secret",
      ALLOWED_TELEGRAM_IDS: "111",
      DEFAULT_TIMEZONE: "Asia/Qyzylorda",
      DB: db,
      ...env
    },
    {}
  );
}

async function sendImportCallback({ db, updateId, batchId, action = "confirm", env = {} }) {
  return worker.fetch(
    new Request("https://worker.example/telegram", {
      method: "POST",
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": "expected-secret"
      },
      body: JSON.stringify({
        update_id: updateId,
        callback_query: {
          id: `callback-${updateId}`,
          data: `import:${action}:${batchId}`,
          message: {
            message_id: 88,
            chat: { id: 999 }
          },
          from: { id: 111, username: "demo", first_name: "Demo" }
        }
      })
    }),
    {
      TELEGRAM_BOT_TOKEN: "test-token",
      TELEGRAM_WEBHOOK_SECRET: "expected-secret",
      ALLOWED_TELEGRAM_IDS: "111",
      DEFAULT_TIMEZONE: "Asia/Qyzylorda",
      DB: db,
      ...env
    },
    {}
  );
}

function createProcessedOnlyDbMock() {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return {
            async first() {
              if (sql.includes("FROM processed_updates")) return null;
              return null;
            },
            async all() {
              return { results: [] };
            },
            async run() {
              return { success: true, meta: { changes: 1 } };
            }
          };
        }
      };
    }
  };
}

function createTelegramInsertDbMock(user) {
  const calls = [];
  let insertedId = 1200;
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return {
            async first() {
              if (sql.includes("FROM processed_updates")) return null;
              if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
              if (sql.includes("FROM transactions") && sql.includes("telegram_update_id")) return null;
              if (sql.includes("INSERT INTO transactions")) {
                insertedId += 1;
                return {
                  id: insertedId,
                  kind: params[3],
                  amount_minor: params[4],
                  currency: params[5],
                  category: params[6],
                  subcategory: params[7],
                  counterparty: params[8],
                  description: params[9],
                  local_date: params[12]
                };
              }
              return null;
            },
            async all() {
              return { results: [] };
            },
            async run() {
              return { success: true, meta: { changes: 1 } };
            }
          };
        }
      };
    }
  };
}

function createTelegramDocumentValidationDbMock(user) {
  const db = createProcessedOnlyDbMock();
  db.prepare = (sql) => ({
    bind(...params) {
      db.calls.push({ sql, params });
      return {
        async first() {
          if (sql.includes("FROM processed_updates")) return null;
          if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
          return null;
        },
        async all() {
          return { results: [] };
        },
        async run() {
          return { success: true, meta: { changes: 1 } };
        }
      };
    }
  });
  return db;
}

function captureStatementImportFetch(t, { fileBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]), openAiPayload = null } = {}) {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const urlText = String(url);
    calls.push({ url: urlText, init });
    if (urlText.endsWith("/getFile")) {
      return new Response(JSON.stringify({ ok: true, result: { file_path: "documents/statement.pdf" } }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (urlText.includes("/file/bot")) {
      return new Response(fileBytes);
    }
    if (urlText === "https://api.openai.com/v1/responses") {
      return new Response(JSON.stringify({
        output_text: JSON.stringify(openAiPayload || {
          source_name: "Test Bank",
          period_start: "2026-07-01",
          period_end: "2026-07-02",
          truncated: false,
          truncation_reason: null,
          rows: [
            {
              date: "2026-07-01",
              direction: "expense",
              amount: 5100,
              amount_text: "- 5 100,00 ₸",
              currency: "KZT",
              operation: "Покупка",
              description: "Wolt",
              merchant: "Wolt",
              category_hint: "Wolt",
              confidence: 0.95
            }
          ]
        })
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  return calls;
}

function createStatementDraftDbMock({ user, batchId, duplicateRows = [] }) {
  const calls = [];
  let importItemId = 600;
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return {
            async first() {
              if (sql.includes("FROM processed_updates")) return null;
              if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
              if (sql.includes("FROM transactions") && sql.includes("status = 'active'")) return null;
              if (sql.includes("INSERT INTO import_batches")) {
                return {
                  id: batchId,
                  user_id: params[0],
                  chat_id: params[1],
                  telegram_update_id: params[2],
                  telegram_file_id: params[3],
                  telegram_file_unique_id: params[4],
                  file_name: params[5],
                  file_size: params[6],
                  file_sha256: params[7],
                  source_name: params[8],
                  period_start: params[9],
                  period_end: params[10],
                  status: "draft",
                  item_count: params[11],
                  import_count: 0,
                  duplicate_count: params[12],
                  skipped_count: params[13],
                  expense_minor: params[14],
                  income_minor: params[15],
                  metadata_json: params[16],
                  created_at: params[17],
                  updated_at: params[18]
                };
              }
              if (sql.includes("INSERT INTO import_items")) {
                importItemId += 1;
                return {
                  id: importItemId,
                  batch_id: params[0],
                  user_id: params[1],
                  kind: params[2],
                  amount_minor: params[3],
                  currency: params[4],
                  category: params[5],
                  subcategory: params[6],
                  counterparty: params[7],
                  description: params[8],
                  raw_text: params[9],
                  local_date: params[10],
                  status: params[11],
                  duplicate_transaction_id: params[12],
                  confidence: params[13],
                  metadata_json: params[14],
                  created_at: params[15],
                  updated_at: params[16]
                };
              }
              return null;
            },
            async all() {
              if (sql.includes("FROM transactions") && sql.includes("status = 'active'")) {
                return { results: duplicateRows };
              }
              return { results: [] };
            },
            async run() {
              return { success: true, meta: { changes: 1 } };
            }
          };
        }
      };
    }
  };
}

function createImportConfirmDbMock({ user, batch, item, duplicateTransactionId = null }) {
  const calls = [];
  let batchStatus = batch.status;
  let itemStatus = item.status;
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return {
            async first() {
              if (sql.includes("FROM processed_updates")) return null;
              if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
              if (sql.includes("FROM import_batches")) return { ...batch, status: batchStatus };
              if (sql.includes("FROM transactions") && sql.includes("telegram_update_id")) return null;
              if (sql.includes("INSERT INTO transactions")) return { id: 880 };
              return null;
            },
            async all() {
              if (sql.includes("SELECT status, COUNT(*) AS count")) {
                return { results: [{ status: itemStatus, count: 1 }] };
              }
              if (sql.includes("FROM import_items")) {
                return {
                  results: batchStatus === "draft" && itemStatus === "draft" ? [{ ...item, status: itemStatus }] : []
                };
              }
              if (sql.includes("FROM transactions") && sql.includes("status = 'active'")) {
                return {
                  results: duplicateTransactionId && itemStatus === "draft"
                    ? [{
                        id: duplicateTransactionId,
                        counterparty: item.counterparty,
                        description: item.description,
                        raw_text: item.raw_text
                      }]
                    : []
                };
              }
              return { results: [] };
            },
            async run() {
              if (sql.includes("UPDATE import_batches") && sql.includes("status = 'confirmed'")) {
                if (batchStatus !== "draft") return { success: true, meta: { changes: 0 } };
                batchStatus = "confirmed";
                return { success: true, meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE import_batches") && sql.includes("status = 'cancelled'")) {
                if (batchStatus !== "draft") return { success: true, meta: { changes: 0 } };
                batchStatus = "cancelled";
                return { success: true, meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE import_items") && sql.includes("status = 'imported'")) {
                itemStatus = "imported";
                return { success: true, meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE import_items") && sql.includes("status = 'cancelled'")) {
                itemStatus = "cancelled";
                return { success: true, meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE import_items") && sql.includes("status = 'duplicate'")) {
                itemStatus = "duplicate";
                return { success: true, meta: { changes: 1 } };
              }
              return { success: true, meta: { changes: 1 } };
            }
          };
        }
      };
    }
  };
}

function freezeDate(t, iso) {
  const RealDate = globalThis.Date;
  const fixedTime = new RealDate(iso).getTime();
  globalThis.Date = class FixedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) return new RealDate(fixedTime);
      return new RealDate(...args);
    }

    static now() {
      return fixedTime;
    }

    static parse(value) {
      return RealDate.parse(value);
    }

    static UTC(...args) {
      return RealDate.UTC(...args);
    }
  };
  const restore = () => {
    globalThis.Date = RealDate;
  };
  t.after(restore);
  return restore;
}

function testTelegramUser() {
  return {
    id: 42,
    telegram_user_id: "111",
    username: "demo",
    first_name: "Demo",
    last_name: null,
    timezone: "Asia/Qyzylorda",
    currency: "KZT"
  };
}

function testTransactionRows() {
  return [
    {
      id: 7,
      user_id: 42,
      local_date: "2026-06-08",
      kind: "expense",
      amount_minor: 123450,
      currency: "KZT",
      category: "Food",
      subcategory: "Lunch",
      counterparty: null,
      description: "active row",
      raw_text: "team lunch, active",
      status: "active",
      created_at: "2026-06-08T08:00:00.000Z"
    },
    {
      id: 8,
      user_id: 42,
      local_date: "2026-06-08",
      kind: "expense",
      amount_minor: 99900,
      currency: "KZT",
      category: "Private",
      subcategory: null,
      counterparty: null,
      description: "deleted row",
      raw_text: "deleted secret",
      status: "deleted",
      created_at: "2026-06-08T09:00:00.000Z"
    },
    {
      id: 11,
      user_id: 42,
      local_date: "2026-06-08",
      kind: "expense",
      amount_minor: 150000,
      currency: "KZT",
      category: "Transport",
      subcategory: "Taxi",
      counterparty: null,
      description: "latest active row",
      raw_text: "latest active secret",
      status: "active",
      created_at: "2026-06-08T09:30:00.000Z"
    },
    {
      id: 9,
      user_id: 99,
      local_date: "2026-06-08",
      kind: "expense",
      amount_minor: 50000,
      currency: "KZT",
      category: "Other",
      subcategory: null,
      counterparty: null,
      description: "other user active row",
      raw_text: "other user active secret",
      status: "active",
      created_at: "2026-06-08T10:00:00.000Z"
    },
    {
      id: 10,
      user_id: 99,
      local_date: "2026-06-08",
      kind: "expense",
      amount_minor: 75000,
      currency: "KZT",
      category: "Other",
      subcategory: null,
      counterparty: null,
      description: "other user deleted row",
      raw_text: "other user deleted secret",
      status: "deleted",
      created_at: "2026-06-08T11:00:00.000Z"
    }
  ];
}

function createTelegramMutationDbMock({ user, rows }) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return createTelegramMutationBoundStatement(sql, params, user, rows);
        }
      };
    }
  };
}

function createTelegramMutationBoundStatement(sql, params, user, rows) {
  return {
    async first() {
      if (sql.includes("FROM processed_updates")) return null;
      if (sql.includes("SELECT * FROM users WHERE telegram_user_id")) return user;
      if (sql.includes("FROM transactions")) {
        const status = sql.includes("status = 'deleted'") ? "deleted" : "active";
        if (sql.includes("ORDER BY id DESC")) {
          return rows
            .filter((row) => row.user_id === params[0] && row.status === status)
            .sort((left, right) => right.id - left.id)[0] || null;
        }
        return rows.find((row) => row.user_id === params[0] && row.id === params[1] && row.status === status) || null;
      }
      return null;
    },
    async all() {
      return { results: [] };
    },
    async run() {
      if (sql.includes("UPDATE transactions") && sql.includes("deleted_at = NULL")) {
        return {
          success: true,
          meta: {
            changes: rows.some((row) => row.user_id === params[1] && row.id === params[2] && row.status === "deleted") ? 1 : 0
          }
        };
      }
      if (sql.includes("UPDATE transactions") && sql.includes("status = 'deleted'")) {
        return {
          success: true,
          meta: {
            changes: rows.some((row) => row.user_id === params[2] && row.id === params[3] && row.status === "active") ? 1 : 0
          }
        };
      }
      return { success: true, meta: { changes: 1 } };
    }
  };
}

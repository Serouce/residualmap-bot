import { miniAppHtml as renderMiniAppHtml } from "./mini-app.js";

const TELEGRAM_API = "https://api.telegram.org/bot";
const TELEGRAM_FILE_API = "https://api.telegram.org/file/bot";
const ONLY_SUPPORTED_CURRENCY = "KZT";
const UPDATE_PROCESSING_STALE_MS = 10 * 60 * 1000;
const DEFAULT_STATEMENT_PDF_MAX_BYTES = 5 * 1024 * 1024;
const HARD_STATEMENT_PDF_MAX_BYTES = 10 * 1024 * 1024;
const MAX_IMPORT_ITEMS = 80;
const FAMILY_HELP_EXPENSE_SQL = "kind = 'expense' AND ((category = 'Семья' AND subcategory = 'Помощь семье') OR category = 'Помощь семье')";
const DEBT_KINDS = ["loan_out", "loan_repayment", "borrow_in", "borrow_repayment"];
const DATE_MONTH_WORDS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря"
];
const DATE_MONTH_INDEX = new Map(DATE_MONTH_WORDS.map((month, index) => [month, index + 1]));

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

const HTML_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  "Content-Security-Policy": [
    "default-src 'none'",
    "script-src 'self' 'unsafe-inline' https://telegram.org",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors https://web.telegram.org https://*.telegram.org"
  ].join("; ")
};

const TRANSACTION_KINDS = new Set([
  "expense",
  "income",
  "loan_out",
  "loan_repayment",
  "borrow_in",
  "borrow_repayment",
  "transfer",
  "correction"
]);

const KIND_LABELS = {
  expense: "Расход",
  income: "Доход",
  loan_out: "Дал в долг",
  loan_repayment: "Вернули долг",
  borrow_in: "Взял в долг",
  borrow_repayment: "Вернул долг",
  transfer: "Перевод",
  correction: "Корректировка"
};

const CATEGORY_RULES = [
  {
    category: "Транспорт",
    subcategory: "Такси",
    patterns: [/такси/i, /yandex[\s._*-]*(go|taxi)/i, /яндекс\s*(go|го|такси)/i, /uber/i, /bolt/i, /indrive/i, /индрайв/i]
  },
  {
    category: "Транспорт",
    subcategory: "Общественный транспорт",
    patterns: [/автобус/i, /метро/i, /проезд/i, /транспорт/i]
  },
  {
    category: "Еда",
    subcategory: "Продукты",
    patterns: [/продукт/i, /магнум/i, /small/i, /смолл/i, /овощ/i, /мясо/i, /молоко/i, /хлеб/i]
  },
  {
    category: "Еда",
    subcategory: "Доставка",
    patterns: [
      /доставка\s+еды/i,
      /доставк.*(еда|суши|пицц|бургер|ролл|обед|ужин|донер|шаурм)/i,
      /(wolt|glovo|яндекс\s*еда|yandex\s*eats|delivery\s*club|chocofood|самокат|лавка|arbuz)/i
    ]
  },
  {
    category: "Еда",
    subcategory: "Кафе и рестораны",
    patterns: [/кафе/i, /кофе/i, /ресторан/i, /донер/i, /шаурм/i, /бургер/i, /обед/i, /ужин/i]
  },
  {
    category: "Связь",
    subcategory: "Мобильная связь",
    patterns: [/тариф/i, /баланс/i, /связь/i, /мобильн/i, /телефон/i, /activ/i, /tele2/i, /kcell/i, /beeline/i]
  },
  {
    category: "Одежда",
    subcategory: "Одежда",
    patterns: [/одеж/i, /обув/i, /куртк/i, /футболк/i, /штаны/i, /брюк/i, /кроссов/i]
  },
  {
    category: "Подарки",
    subcategory: "Коллеги",
    patterns: [
      /(?=.*день рожден)(?=.*коллег)/i,
      /(?=.*\bдр\b)(?=.*коллег)/i,
      /подарок коллег/i,
      /скинул.*коллег/i
    ]
  },
  {
    category: "Подарки",
    subcategory: "Семья",
    patterns: [
      /(?=.*день рожден)(?=.*(сест|мам|пап|брат|семь))/i,
      /(?=.*\bдр\b)(?=.*(сест|мам|пап|брат|семь))/i,
      /подарок.*(сест|мам|пап|брат|семь)/i
    ]
  },
  {
    category: "Подарки",
    subcategory: "Прочее",
    patterns: [/день рожден/i, /\bдр\b/i, /подарок/i]
  },
  {
    category: "Семья",
    subcategory: "Помощь семье",
    patterns: [/сест/i, /мам/i, /пап/i, /брат/i, /семь/i]
  },
  {
    category: "Здоровье",
    subcategory: "Прочее",
    patterns: [/аптек/i, /врач/i, /лекар/i, /стомат/i, /здоров/i]
  },
  {
    category: "Дом",
    subcategory: "Платежи",
    patterns: [/квартир/i, /аренд/i, /коммун/i, /свет/i, /газ/i, /вода/i, /интернет/i]
  },
  {
    category: "Подписки",
    subcategory: "Сервисы",
    patterns: [/подписк/i, /netflix/i, /spotify/i, /youtube/i, /icloud/i, /google/i, /яндекс плюс/i]
  },
  {
    category: "Покупки",
    subcategory: "Прочее",
    patterns: [/маркет/i, /wildberries/i, /ozon/i, /kaspi/i, /купил/i, /купила/i]
  }
];

const MERCHANT_CATEGORY_RULES = [
  {
    category: "Транспорт",
    subcategory: "Такси",
    patterns: [/\byandex[\s._*-]*(go|taxi)\b/i, /яндекс\s*(go|го|такси)/i]
  },
  {
    category: "Связь",
    subcategory: "Мобильная связь",
    patterns: [/\bbeeline\b/i]
  },
  {
    category: "Подписки",
    subcategory: "Сервисы",
    patterns: [/\bgoogle\s*[*\s._-]*google\s*one\b/i, /\bgoogle\s*one\b/i]
  },
  {
    category: "Еда",
    subcategory: "Доставка",
    patterns: [
      /\bwolt\b/i,
      /\bglovo\b/i,
      /\bjetpay\s*[*\s._-]*dodo\s*pizza\b/i,
      /\bdodo\s*pizza\b/i,
      /\bdodopizza\b/i,
      /яндекс\s*еда/i,
      /\byandex\s*eats\b/i
    ]
  },
  {
    category: "Еда",
    subcategory: "Продукты",
    patterns: [/\bmagnum\b/i, /\bsmall\b/i, /смолл/i]
  },
  {
    category: "Здоровье",
    subcategory: "Аптека",
    patterns: [/аптек/i, /\bpharmacy\b/i, /\beuropharma\b/i]
  }
];

const CATEGORY_ALIASES = [
  {
    category: "Еда",
    subcategory: "Доставка",
    labels: [
      "Еда Доставка",
      "Еда Доставка еды",
      "Доставка еды",
      "Доставка",
      "Wolt",
      "Glovo",
      "Яндекс Еда",
      "Yandex Eats",
      "Delivery Club",
      "Chocofood"
    ]
  },
  {
    category: "Еда",
    subcategory: "Кафе и рестораны",
    labels: [
      "Еда Кафе",
      "Еда Рестораны",
      "Кафе",
      "Рестораны",
      "Кафе рестораны"
    ]
  },
  {
    category: "Еда",
    subcategory: "Продукты",
    labels: [
      "Еда Продукты",
      "Продукты питания",
      "Супермаркет",
      "Супермаркеты",
      "Гипермаркет"
    ]
  },
  {
    category: "Транспорт",
    subcategory: "Такси",
    labels: [
      "Транспорт Такси",
      "Яндекс Такси",
      "Yandex Taxi",
      "Такси"
    ]
  },
  {
    category: "Транспорт",
    subcategory: "Общественный транспорт",
    labels: [
      "Транспорт Общественный транспорт",
      "Общественный транспорт",
      "Автобус",
      "Метро",
      "Маршрутка"
    ]
  },
  {
    category: "Связь",
    subcategory: "Мобильная связь",
    labels: [
      "Связь Мобильная связь",
      "Мобильная связь",
      "Сотовая связь",
      "Телефонный тариф"
    ]
  },
  {
    category: "Здоровье",
    subcategory: "Аптека",
    labels: [
      "Здоровье Аптека",
      "Аптека",
      "Лекарства"
    ]
  },
  {
    category: "Дом",
    subcategory: "Коммунальные услуги",
    labels: [
      "Дом Коммунальные услуги",
      "Коммунальные услуги",
      "Коммуналка",
      "ЖКХ"
    ]
  }
].map((alias) => ({
  ...alias,
  normalizedLabels: alias.labels.map(normalizeCategoryLabel)
}));

const INTENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    kind: {
      type: "string",
      enum: [
        "expense",
        "income",
        "loan_out",
        "loan_repayment",
        "borrow_in",
        "borrow_repayment",
        "transfer",
        "analytics",
        "unknown"
      ]
    },
    amount: { type: ["number", "null"] },
    currency: { type: ["string", "null"] },
    category: { type: ["string", "null"] },
    subcategory: { type: ["string", "null"] },
    counterparty: { type: ["string", "null"] },
    description: { type: "string" },
    date_text: { type: ["string", "null"] },
    period: {
      type: ["string", "null"],
      enum: ["today", "yesterday", "week", "month", "last_7_days", "last_30_days", null]
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    needs_confirmation: { type: "boolean" }
  },
  required: [
    "kind",
    "amount",
    "currency",
    "category",
    "subcategory",
    "counterparty",
    "description",
    "date_text",
    "period",
    "confidence",
    "needs_confirmation"
  ]
};

const STATEMENT_IMPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    source_name: { type: ["string", "null"] },
    period_start: { type: ["string", "null"] },
    period_end: { type: ["string", "null"] },
    truncated: { type: "boolean" },
    truncation_reason: { type: ["string", "null"] },
    rows: {
      type: "array",
      maxItems: MAX_IMPORT_ITEMS,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: ["string", "null"] },
          direction: {
            type: ["string", "null"],
            enum: ["expense", "income", "transfer", "unknown", null]
          },
          amount: { type: ["number", "null"] },
          amount_text: { type: ["string", "null"] },
          currency: { type: ["string", "null"] },
          operation: { type: ["string", "null"] },
          description: { type: "string" },
          merchant: { type: ["string", "null"] },
          category_hint: { type: ["string", "null"] },
          confidence: { type: "number", minimum: 0, maximum: 1 }
        },
        required: [
          "date",
          "direction",
          "amount",
          "amount_text",
          "currency",
          "operation",
          "description",
          "merchant",
          "category_hint",
          "confidence"
        ]
      }
    }
  },
  required: ["source_name", "period_start", "period_end", "truncated", "truncation_reason", "rows"]
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      if (url.pathname === "/app") {
        return html(renderMiniAppHtml());
      }
      if (url.pathname.startsWith("/admin/")) {
        return new Response("Method not allowed", { status: 405, headers: SECURITY_HEADERS });
      }
      return json({
        ok: true,
        service: "residualmap-bot",
        time: new Date().toISOString()
      });
    }

    if (request.method === "POST" && url.pathname === "/admin/set-webhook") {
      return handleSetWebhook(request, url, env);
    }

    if (request.method === "POST" && url.pathname === "/admin/webhook-info") {
      return handleWebhookInfo(request, env);
    }

    if (request.method === "POST" && url.pathname === "/admin/delete-webhook") {
      return handleDeleteWebhook(request, env);
    }

    if (request.method === "POST" && url.pathname === "/admin/health") {
      return handleAdminHealth(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/app-data") {
      return handleMiniAppData(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/transactions") {
      return handleMiniAppTransactions(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/imports") {
      return handleMiniAppImports(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/import-action") {
      return handleMiniAppImportAction(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/transaction-action") {
      return handleMiniAppTransactionAction(request, env);
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const expectedSecret = env.TELEGRAM_WEBHOOK_SECRET;
    if (!expectedSecret) {
      return new Response("TELEGRAM_WEBHOOK_SECRET is not configured", { status: 500 });
    }
    const actualSecret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!timingSafeEqualString(actualSecret, expectedSecret)) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (url.pathname !== "/telegram") {
      return new Response("Not found", { status: 404 });
    }

    const update = await request.json().catch(() => null);
    if (!update) {
      return new Response("Bad request", { status: 400 });
    }

    await handleTelegramUpdate(update, env);
    return new Response("OK");
  }
};

async function handleSetWebhook(request, url, env) {
  const auth = requireSetupToken(request, env);
  if (auth) return auth;

  const webhookUrl = `${url.origin}/telegram`;
  const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false
    })
  });

  const data = await response.json().catch(() => ({}));
  return json({
    ok: response.ok && data.ok === true,
    webhook_url: webhookUrl,
    telegram: data
  }, { status: response.ok ? 200 : 502 });
}

async function handleWebhookInfo(request, env) {
  const auth = requireSetupToken(request, env);
  if (auth) return auth;

  const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
  const data = await response.json().catch(() => ({}));
  return json({ ok: response.ok, telegram: data }, { status: response.ok ? 200 : 502 });
}

async function handleDeleteWebhook(request, env) {
  const auth = requireSetupToken(request, env);
  if (auth) return auth;

  const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drop_pending_updates: false })
  });
  const data = await response.json().catch(() => ({}));
  return json({ ok: response.ok && data.ok === true, telegram: data }, { status: response.ok ? 200 : 502 });
}

async function handleAdminHealth(request, env) {
  const auth = requireSetupToken(request, env);
  if (auth) return auth;

  const dbCheck = await env.DB.prepare("SELECT 1 AS ok").first().then(
    () => ({ ok: true }),
    (error) => ({ ok: false, error: limitText(error?.message || String(error), 240) })
  );
  const failed = await env.DB.prepare(
    `SELECT update_id, processed_at, attempts, last_error
    FROM processed_updates
    WHERE status = 'failed'
    ORDER BY processed_at DESC
    LIMIT 5`
  )
    .all()
    .then((result) => result.results || [], () => []);

  return json({
    ok: dbCheck.ok,
    service: "residualmap-bot",
    time: new Date().toISOString(),
    checks: {
      d1: dbCheck,
      telegram_bot_token: Boolean(env.TELEGRAM_BOT_TOKEN),
      telegram_webhook_secret: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
      openai_api_key: Boolean(env.OPENAI_API_KEY),
      allowed_telegram_ids: isAllowedConfigured(env)
    },
    models: {
      parse: env.OPENAI_MODEL_PARSE || "gpt-5.4-mini",
      analytics: env.OPENAI_MODEL_ANALYTICS || env.OPENAI_MODEL_PARSE || "gpt-5.4-mini"
    },
    failed_updates: failed
  }, { status: dbCheck.ok ? 200 : 503, headers: noStoreHeaders() });
}

async function handleMiniAppData(request, env) {
  const auth = await authenticateMiniAppRequest(request, env);
  if (!auth.ok) return auth.response;

  const { body, user } = auth;
  const period = normalizePeriod(body.period);
  const bounds = periodBounds(period, user.timezone);
  const summary = await buildSummary(env, user.id, bounds);
  const recent = await listTransactions(env, user.id, "active", 20);
  const deleted = await listTransactions(env, user.id, "deleted", 10);
  const debts = await buildDebts(env, user.id);
  const importBatches = await listImportBatches(env, user.id, 3);
  const imports = [];
  for (const batch of importBatches) {
    imports.push(await hydrateImportBatch(env, user.id, batch));
  }

  return json({
    ok: true,
    user: {
      id: user.id,
      telegram_user_id: user.telegram_user_id,
      username: user.username,
      first_name: user.first_name,
      currency: user.currency,
      timezone: user.timezone
    },
    period,
    summary,
    recent,
    deleted,
    debts,
    imports_summary: {
      draft_count: imports.filter((item) => item.status === "draft").length,
      latest: imports[0] || null
    }
  });
}

async function handleMiniAppTransactions(request, env) {
  const auth = await authenticateMiniAppRequest(request, env);
  if (!auth.ok) return auth.response;

  const { body, user } = auth;
  const period = normalizePeriod(body.period);
  const bounds = periodBounds(period, user.timezone);
  const status = normalizeTransactionStatus(body.status);
  const kind = normalizeTransactionKind(body.kind);
  const kindGroup = normalizeTransactionKindGroup(body.kind_group);
  const category = limitText(cleanText(body.category), 60);
  const query = limitText(cleanText(body.query), 120);
  const limit = normalizeLimit(body.limit, 30, 50);
  const result = await searchTransactions(env, {
    userId: user.id,
    bounds,
    status,
    kind,
    kindGroup,
    category,
    query,
    limit
  });

  return json({
    ok: true,
    period,
    bounds,
    status,
    kind,
    kind_group: kindGroup,
    category,
    query,
    limit,
    items: result.items,
    categories: result.categories
  });
}

async function handleMiniAppImports(request, env) {
  const auth = await authenticateMiniAppRequest(request, env);
  if (!auth.ok) return auth.response;

  const { body, user } = auth;
  const limit = normalizeLimit(body.limit, 10, 20);
  const batches = await listImportBatches(env, user.id, limit);
  const imports = [];
  for (const batch of batches) {
    imports.push(await hydrateImportBatch(env, user.id, batch));
  }

  return json({
    ok: true,
    limit,
    draft_count: imports.filter((item) => item.status === "draft").length,
    imports
  });
}

async function handleMiniAppImportAction(request, env) {
  const auth = await authenticateMiniAppRequest(request, env);
  if (!auth.ok) return auth.response;

  const { body, user } = auth;
  const batchId = Number(body.batch_id);
  const action = String(body.action || "");
  if (!Number.isInteger(batchId) || batchId <= 0) {
    return json({ ok: false, error: "Valid import batch id is required" }, { status: 400 });
  }
  if (action !== "confirm" && action !== "cancel") {
    return json({ ok: false, error: "Action must be confirm or cancel" }, { status: 400 });
  }

  const result = action === "confirm"
    ? await confirmImportBatch(env, user, null, batchId)
    : await cancelImportBatch(env, user, batchId);
  if (!result.ok) {
    if (result.reason === "not_found") return json({ ok: false, error: "Import batch not found" }, { status: 404 });
    return json({
      ok: false,
      error: "Import batch is not a draft",
      status: result.batch?.status || "unknown"
    }, { status: 409 });
  }

  const updated = await getImportBatch(env, user.id, batchId);
  return json({
    ok: true,
    action,
    imported_count: result.importedCount || 0,
    new_duplicate_count: result.newDuplicateCount || 0,
    import: updated ? await hydrateImportBatch(env, user.id, updated) : null
  });
}

async function handleMiniAppTransactionAction(request, env) {
  const auth = await authenticateMiniAppRequest(request, env);
  if (!auth.ok) return auth.response;

  const { body, user } = auth;
  const id = Number(body.id);
  const action = String(body.action || "");
  if (!Number.isInteger(id) || id <= 0) {
    return json({ ok: false, error: "Valid transaction id is required" }, { status: 400 });
  }
  if (action !== "delete" && action !== "restore" && action !== "update") {
    return json({ ok: false, error: "Action must be delete, restore, or update" }, { status: 400 });
  }

  const row = await getTransactionById(env, user.id, id);
  if (!row) {
    return json({ ok: false, error: "Transaction not found" }, { status: 404 });
  }

  if (action === "update") {
    if (row.status !== "active") {
      return json({ ok: false, error: "Only active transactions can be edited" }, { status: 409 });
    }
    const updated = await updateTransactionFromMiniApp(env, user.id, row, body);
    if (!updated.ok) return updated.response;
  } else if (action === "delete") {
    if (row.status !== "active") {
      return json({ ok: false, error: "Transaction is already deleted" }, { status: 409 });
    }
    const changed = await softDelete(env, user.id, id, "mini_app_delete");
    if (!changed) {
      return json({ ok: false, error: "Transaction was already changed" }, { status: 409 });
    }
  } else {
    if (row.status !== "deleted") {
      return json({ ok: false, error: "Transaction is not deleted" }, { status: 409 });
    }
    const changed = await restoreTransaction(env, user.id, id, "mini_app_restore");
    if (!changed) {
      return json({ ok: false, error: "Transaction was already changed" }, { status: 409 });
    }
  }

  return json({
    ok: true,
    action,
    transaction: await getTransactionById(env, user.id, id)
  });
}

async function authenticateMiniAppRequest(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.initData !== "string") {
    return {
      ok: false,
      response: json({ ok: false, error: "Mini App init data is required" }, { status: 401 })
    };
  }

  const validation = await validateTelegramInitData(body.initData, env.TELEGRAM_BOT_TOKEN);
  if (!validation.ok) {
    return {
      ok: false,
      response: json({ ok: false, error: validation.error }, { status: 401 })
    };
  }

  const telegramUserId = String(validation.user.id);
  if (!isAllowed(env, telegramUserId)) {
    return {
      ok: false,
      response: json({ ok: false, error: "Access denied" }, { status: 403 })
    };
  }

  return { ok: true, body, user: await upsertUser(env, validation.user) };
}

function requireSetupToken(request, env) {
  if (!env.SETUP_TOKEN) {
    return json({ ok: false, error: "SETUP_TOKEN is not configured" }, { status: 500, headers: noStoreHeaders() });
  }
  const token = bearerToken(request.headers.get("Authorization"));
  if (!token || !timingSafeEqualString(token, env.SETUP_TOKEN)) {
    return json({ ok: false, error: "Unauthorized" }, { status: 401, headers: noStoreHeaders() });
  }
  return null;
}

async function handleTelegramUpdate(update, env) {
  if (update.callback_query) {
    await handleTelegramCallback(update, env);
    return;
  }

  const message = update.message;
  if (!message || !message.chat || !message.from) return;

  const chatId = String(message.chat.id);
  const telegramUserId = String(message.from.id);
  const text = (message.text || message.caption || "").trim();
  const document = message.document || null;

  if (!document && !text) {
    await sendMessage(env, chatId, "Пока я понимаю только текст и PDF-выписки. Голос и чеки добавим позже.");
    return;
  }

  if (!document && text.length > 600) {
    await sendMessage(env, chatId, "Сообщение слишком длинное. Для записи расходов отправляй короткую фразу до 600 символов.");
    return;
  }

  const updateId = String(update.update_id ?? `${chatId}:${message.message_id}`);
  const shouldProcess = await beginUpdateProcessing(env, updateId);
  if (!shouldProcess) return;

  try {
    if (text === "/id" || text.startsWith("/id@")) {
      await sendMessage(env, chatId, `Ваш Telegram ID: <code>${escapeHtml(telegramUserId)}</code>`);
      await completeUpdateProcessing(env, updateId);
      return;
    }

    if (!isAllowed(env, telegramUserId)) {
      await sendMessage(
        env,
        chatId,
        [
          "Бот еще не разрешил доступ для этого аккаунта.",
          `Ваш Telegram ID: <code>${escapeHtml(telegramUserId)}</code>`,
          "Его нужно добавить в <code>ALLOWED_TELEGRAM_IDS</code> в настройках Worker."
        ].join("\n")
      );
      await completeUpdateProcessing(env, updateId);
      return;
    }

    const user = await upsertUser(env, message.from);

    if (document) {
      await handleStatementDocument(env, {
        chatId,
        user,
        updateId,
        document,
        caption: text
      });
      await completeUpdateProcessing(env, updateId);
      return;
    }

    if (text.startsWith("/")) {
      await handleCommand(env, { chatId, user, text });
      await completeUpdateProcessing(env, updateId);
      return;
    }

    const intent = normalizeIntent(await classifyText(env, text), text, env);

    if (intent.kind === "analytics") {
      await handleAnalytics(env, {
        chatId,
        user,
        period: intent.period || "month",
        originalText: text,
        useAi: true
      });
      await completeUpdateProcessing(env, updateId);
      return;
    }

    const dateResolution = resolveLocalDateInfo(
      intent.date_text,
      user.timezone || env.DEFAULT_TIMEZONE || "Asia/Qyzylorda",
      new Date()
    );
    if (!dateResolution.ok) {
      await sendMessage(env, chatId, formatDateResolutionError(dateResolution));
      await completeUpdateProcessing(env, updateId);
      return;
    }

    if (!TRANSACTION_KINDS.has(intent.kind) || !intent.amount || intent.amount <= 0) {
      await sendMessage(
        env,
        chatId,
        "Я не смог уверенно понять сумму и тип операции. Пример: <code>1400 такси</code> или <code>дал сестре 5000 в долг</code>."
      );
      await completeUpdateProcessing(env, updateId);
      return;
    }

    if (!isSupportedCurrency(intent.currency)) {
      await sendMessage(
        env,
        chatId,
        `Сейчас я веду учет только в <b>${ONLY_SUPPORTED_CURRENCY}</b>. Запись с валютой <code>${escapeHtml(intent.currency)}</code> не добавил.`
      );
      await completeUpdateProcessing(env, updateId);
      return;
    }

    if (intent.needs_confirmation || intent.confidence < 0.55) {
      await sendMessage(
        env,
        chatId,
        [
          "Я не уверен, как это записать.",
          `Понял так: ${escapeHtml(KIND_LABELS[intent.kind] || intent.kind)}, ${formatAmount(toMinor(intent.amount), intent.currency || user.currency)}.`,
          "Переформулируй чуть точнее, например: <code>расход 5000 сестре</code> или <code>дал сестре 5000 в долг</code>."
        ].join("\n")
      );
      await completeUpdateProcessing(env, updateId);
      return;
    }

    const category = await resolveCanonicalCategory(env, user.id, {
      rawText: text,
      kind: intent.kind,
      category: intent.category,
      subcategory: intent.subcategory
    });

    const inserted = await insertTransaction(env, {
      updateId,
      user,
      chatId,
      intent: { ...intent, ...category },
      rawText: text,
      localDate: dateResolution.localDate
    });

    await sendMessage(env, chatId, formatTransactionCreated(inserted));
    await completeUpdateProcessing(env, updateId);
  } catch (error) {
    console.error("update failed", error);
    await failUpdateProcessing(env, updateId, error);
    await sendMessage(
      env,
      chatId,
      "Не получилось обработать сообщение. Я уже записал ошибку в лог Worker, можно будет спокойно разобраться."
    );
  }
}

async function handleTelegramCallback(update, env) {
  const callback = update.callback_query;
  if (!callback?.from) return;

  const chatId = callback.message?.chat?.id ? String(callback.message.chat.id) : null;
  const telegramUserId = String(callback.from.id);
  const updateId = String(update.update_id ?? `callback:${callback.id}`);
  const shouldProcess = await beginUpdateProcessing(env, updateId);
  if (!shouldProcess) return;

  try {
    if (!isAllowed(env, telegramUserId)) {
      await answerCallbackQuery(env, callback.id, "Нет доступа.");
      if (chatId) {
        await sendMessage(env, chatId, [
          "Бот еще не разрешил доступ для этого аккаунта.",
          `Ваш Telegram ID: <code>${escapeHtml(telegramUserId)}</code>`
        ].join("\n"));
      }
      await completeUpdateProcessing(env, updateId);
      return;
    }

    const action = parseImportCallbackData(callback.data);
    if (!action || !chatId) {
      await answerCallbackQuery(env, callback.id, "Не понял действие.");
      await completeUpdateProcessing(env, updateId);
      return;
    }

    const user = await upsertUser(env, callback.from);
    if (action.action === "confirm") {
      const result = await confirmImportBatch(env, user, chatId, action.batchId);
      await answerCallbackQuery(env, callback.id, result.ok ? "Импорт обработан." : "Импорт не выполнен.");
      await sendMessage(env, chatId, formatImportConfirmationResult(result));
    } else {
      const result = await cancelImportBatch(env, user, action.batchId);
      await answerCallbackQuery(env, callback.id, result.ok ? "Черновик отменен." : "Не получилось отменить.");
      await sendMessage(env, chatId, formatImportCancellationResult(result));
    }
    await completeUpdateProcessing(env, updateId);
  } catch (error) {
    console.error("callback update failed", error);
    await failUpdateProcessing(env, updateId, error);
    await answerCallbackQuery(env, callback.id, "Ошибка обработки.");
    if (chatId) {
      await sendMessage(env, chatId, "Не получилось обработать действие импорта. Ошибка записана в лог Worker.");
    }
  }
}

function parseImportCallbackData(data) {
  const match = String(data || "").match(/^import:(confirm|cancel):(\d+)$/);
  if (!match) return null;
  const batchId = Number(match[2]);
  if (!Number.isInteger(batchId) || batchId <= 0) return null;
  return { action: match[1], batchId };
}

async function handleCommand(env, context) {
  const { chatId, user, text } = context;
  const [commandRaw, arg] = text.split(/\s+/, 2);
  const command = commandRaw.split("@")[0].toLowerCase();

  if (command === "/start" || command === "/help") {
    await sendMessage(env, chatId, helpText(user));
    return;
  }

  if (command === "/settings") {
    await sendMessage(
      env,
      chatId,
      [
        "Настройки:",
        `Валюта: <b>${escapeHtml(user.currency)}</b>`,
        `Часовой пояс: <b>${escapeHtml(user.timezone)}</b>`,
        `Parse model: <code>${escapeHtml(env.OPENAI_MODEL_PARSE || "gpt-5.4-mini")}</code>`,
        `Analytics model: <code>${escapeHtml(env.OPENAI_MODEL_ANALYTICS || env.OPENAI_MODEL_PARSE || "gpt-5.4-mini")}</code>`
      ].join("\n")
    );
    return;
  }

  if (command === "/app" || command === "/analytics") {
    await sendMiniAppLink(env, chatId);
    return;
  }

  if (command === "/today") {
    await handleAnalytics(env, { chatId, user, period: "today", originalText: text, useAi: false });
    return;
  }

  if (command === "/week") {
    await handleAnalytics(env, { chatId, user, period: "week", originalText: text, useAi: false });
    return;
  }

  if (command === "/month") {
    await handleAnalytics(env, { chatId, user, period: "month", originalText: text, useAi: false });
    return;
  }

  if (command === "/debts") {
    await handleDebts(env, chatId, user);
    return;
  }

  if (command === "/last") {
    await handleLast(env, chatId, user, arg);
    return;
  }

  if (command === "/undo") {
    await undoLast(env, chatId, user);
    return;
  }

  if (command === "/delete") {
    await deleteById(env, chatId, user, arg);
    return;
  }

  if (command === "/restore") {
    await restoreById(env, chatId, user, arg);
    return;
  }

  if (command === "/export") {
    await exportCsv(env, chatId, user);
    return;
  }

  await sendMessage(env, chatId, "Не знаю такую команду. Нажми /help.");
}

function helpText(user) {
  return [
    "Я записываю траты обычным текстом.",
    "",
    "Примеры:",
    "<code>1400 такси</code>",
    "<code>1 июля 1453 такси</code>",
    "<code>продукты 6200</code>",
    "<code>дал сестре 5000 в долг</code>",
    "<code>сестра вернула 2000</code>",
    "<code>зарплата 350000</code>",
    "<code>сколько потратил за неделю?</code>",
    "PDF-выписку банка можно отправить файлом: я подготовлю черновик импорта.",
    "",
    "Команды:",
    "/app - открыть аналитику",
    "/today - сегодня",
    "/week - текущая неделя",
    "/month - текущий месяц",
    "/debts - долги",
    "/last - последние записи",
    "/last deleted - удаленные записи",
    "/undo - отменить последнюю запись",
    "/delete 123 - удалить запись",
    "/restore 123 - восстановить запись",
    "/export - скачать CSV",
    "/settings - настройки",
    "/id - мой Telegram ID",
    "",
    `Сейчас: ${escapeHtml(user.currency)}, ${escapeHtml(user.timezone)}.`
  ].join("\n");
}

async function classifyText(env, text) {
  if (!env.OPENAI_API_KEY) return fallbackClassify(text);

  const system = [
    "Ты классификатор личных финансов для русскоязычного Telegram-бота.",
    "Верни только JSON по схеме.",
    "Ответ должен быть коротким: description до 120 символов, category/subcategory до 40 символов.",
    "Предпочитай стабильные категории из списка, но можешь создать новую категорию, если ни одна не подходит.",
    "Стабильные категории: Транспорт, Еда, Связь, Одежда, Подарки, Семья, Здоровье, Дом, Подписки, Покупки, Развлечения, Образование, Доход, Долги, Прочее.",
    "Не дроби синонимы: похожие подкатегории должны совпадать с уже используемым каноном.",
    "Правила:",
    "- '1400 такси' это expense, Транспорт > Такси.",
    "- 'wolt 5100' или 'доставка еды 5100' это expense, Еда > Доставка.",
    "- 'скинул 5000 на день рождения коллеги' это expense, Подарки > Коллеги.",
    "- 'закинул тариф 3500' это expense, Связь > Мобильная связь.",
    "- 'купил одежду 28000' это expense, Одежда > Одежда.",
    "- 'ресторан 17000' это expense, Еда > Кафе и рестораны.",
    "- 'скинул сестре 5000' без слов 'долг' это expense, Семья > Помощь семье, counterparty сестра.",
    "- 'дал сестре 5000 в долг' это loan_out.",
    "- 'сестра вернула 2000' это loan_repayment.",
    "- 'взял у друга 10000' это borrow_in.",
    "- 'вернул другу 3000' это borrow_repayment.",
    "- 'перевел между своими картами 10000' это transfer, не expense.",
    "- Вопросы 'сколько', 'на что', 'за неделю', 'за месяц' это analytics.",
    "- Для analytics period: сегодня/за день = today, вчера = yesterday, за неделю/текущая неделя = week, последние 7 дней = last_7_days, последние 30 дней = last_30_days, за месяц/текущий месяц = month.",
    "- Если валюта не указана, currency null.",
    "- Не выдумывай сумму. Если суммы нет, amount null.",
    "- Не создавай слишком узкие категории без необходимости."
  ].join("\n");

  try {
    const result = await callOpenAIJson(env, {
      model: env.OPENAI_MODEL_PARSE || "gpt-5.4-mini",
      system,
      user: text,
      schemaName: "expense_intent",
      schema: INTENT_SCHEMA,
      maxOutputTokens: 450,
      reasoningEffort: env.OPENAI_REASONING_EFFORT_PARSE || "low",
      verbosity: "low"
    });
    return result;
  } catch (error) {
    console.error("classification failed", error);
    return fallbackClassify(text);
  }
}

function fallbackClassify(text) {
  const lower = text.toLowerCase();
  const amount = extractAmount(lower);

  const looksLikeAnalytics = /(сколько|аналитик|траты|расходы|за день|сегодня|вчера|за неделю|недел|последние\s+\d+|\d+\s+дн|за месяц|месяц)/i.test(lower);
  const amountLooksLikePeriod = /((последние|за)\s+\d+\s+(день|дня|дней|недел|месяц|месяца|месяцев)|\d+\s+дн\.?)/i.test(lower);
  if (looksLikeAnalytics && (!amount || amountLooksLikePeriod)) {
    let period = "month";
    if (lower.includes("сегодня") || lower.includes("за день")) period = "today";
    if (lower.includes("вчера")) period = "yesterday";
    if (lower.includes("последние 7") || lower.includes("7 дней")) period = "last_7_days";
    if (lower.includes("последние 30") || lower.includes("30 дней")) period = "last_30_days";
    if (lower.includes("недел")) period = "week";
    if (lower.includes("месяц")) period = "month";

    return {
      kind: "analytics",
      amount: null,
      currency: null,
      category: null,
      subcategory: null,
      counterparty: null,
      description: text,
      date_text: null,
      period,
      confidence: 0.75,
      needs_confirmation: false
    };
  }

  let kind = "expense";
  if (/(зарплат|доход|получил|получила|пришла|пришли)/i.test(lower)) kind = "income";
  if (/(дал|дала|одолжил|одолжила).*(долг|в долг)|в долг/i.test(lower)) kind = "loan_out";
  if (/(вернул|вернула|вернули).*(мне|долг)|сестра вернула|друг вернул|мама вернула/i.test(lower)) kind = "loan_repayment";
  if (/(взял|взяла).*(долг|в долг|у )/i.test(lower)) kind = "borrow_in";
  if (
    /^(вернул|вернула|отдал|отдала)/i.test(lower) &&
    /(долг|другу|сестре|маме)/i.test(lower) &&
    !/(мне|нам)/i.test(lower)
  ) {
    kind = "borrow_repayment";
  }

  const category = inferCategory(lower, kind);
  const dateText = extractDateText(lower);
  return {
    kind,
    amount,
    currency: inferCurrency(lower),
    category: category.category,
    subcategory: category.subcategory,
    counterparty: inferCounterparty(lower),
    description: text,
    date_text: dateText,
    period: null,
    confidence: amount ? 0.65 : 0.2,
    needs_confirmation: !amount
  };
}

function normalizeIntent(intent, rawText, env) {
  const fallback = fallbackClassify(rawText);
  const kind = intent.kind || fallback.kind;
  const category = normalizeCategory({
    rawText,
    kind,
    category: intent.category || fallback.category,
    subcategory: intent.subcategory || fallback.subcategory
  });

  return {
    kind,
    amount: typeof intent.amount === "number" ? intent.amount : fallback.amount,
    currency: normalizeCurrency(intent.currency || fallback.currency || ONLY_SUPPORTED_CURRENCY),
    category: category.category,
    subcategory: category.subcategory,
    counterparty: limitText(cleanText(intent.counterparty) || fallback.counterparty, 60),
    description: limitText(cleanText(intent.description) || rawText, 180),
    date_text: cleanText(intent.date_text) || fallback.date_text,
    period: intent.period || fallback.period,
    confidence: typeof intent.confidence === "number" ? intent.confidence : fallback.confidence,
    needs_confirmation: Boolean(intent.needs_confirmation)
  };
}

function normalizeCategory({ rawText, kind, category, subcategory }) {
  if (kind === "income") return { category: "Доход", subcategory: "Прочее" };
  if (kind === "loan_out" || kind === "loan_repayment") {
    return { category: "Долги", subcategory: "Мне должны" };
  }
  if (kind === "borrow_in" || kind === "borrow_repayment") {
    return { category: "Долги", subcategory: "Я должен" };
  }
  if (kind === "transfer") return { category: "Переводы", subcategory: "Между счетами" };

  const merchantCategory = matchMerchantCategory(rawText);
  if (merchantCategory) return merchantCategory;

  const labelCanonical = canonicalCategoryFromLabels(category, subcategory);
  if (labelCanonical) return labelCanonical;

  const haystack = `${rawText || ""} ${category || ""} ${subcategory || ""}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }

  const inferred = inferCategory(String(rawText || "").toLowerCase(), kind);
  const normalized = {
    category: limitText(cleanText(category) || inferred.category || "Прочее", 40),
    subcategory: limitText(cleanText(subcategory) || inferred.subcategory || "Без категории", 40)
  };
  return canonicalCategoryFromLabels(normalized.category, normalized.subcategory) || normalized;
}

function matchMerchantCategory(rawText) {
  const text = String(rawText || "").normalize("NFKC");
  if (!text.trim()) return null;
  for (const rule of MERCHANT_CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }
  return null;
}

function canonicalCategoryFromLabels(category, subcategory) {
  const categoryLabel = normalizeCategoryLabel(category);
  const subcategoryLabel = normalizeCategoryLabel(subcategory);
  const pairLabel = [categoryLabel, subcategoryLabel].filter(Boolean).join(" ");
  for (const alias of CATEGORY_ALIASES) {
    if (alias.normalizedLabels.includes(pairLabel)) return { category: alias.category, subcategory: alias.subcategory };
    if (categoryLabel === normalizeCategoryLabel(alias.category) && alias.normalizedLabels.includes(subcategoryLabel)) {
      return { category: alias.category, subcategory: alias.subcategory };
    }
  }
  return null;
}

function normalizeCategoryLabel(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function resolveCanonicalCategory(env, userId, input) {
  const canonical = normalizeCategory(input);
  if (input.kind !== "expense") return canonical;

  const dbCanonical = await findCategoryAlias(env, userId, canonical.category, canonical.subcategory);
  return dbCanonical || canonical;
}

async function findCategoryAlias(env, userId, category, subcategory) {
  if (!env?.DB) return null;
  const candidates = categoryAliasCandidates(category, subcategory);
  if (!candidates.size) return null;

  try {
    const rows = await env.DB.prepare(
      `SELECT user_id, alias, category, subcategory
      FROM category_aliases
      WHERE user_id IS NULL OR user_id = ?`
    )
      .bind(userId)
      .all();

    const aliases = (rows.results || []).sort((left, right) => {
      const leftScore = Number(left.user_id === userId ? 0 : 1);
      const rightScore = Number(right.user_id === userId ? 0 : 1);
      return leftScore - rightScore;
    });

    for (const alias of aliases) {
      if (candidates.has(normalizeCategoryLabel(alias.alias))) {
        return {
          category: limitText(cleanText(alias.category), 40) || category,
          subcategory: limitText(cleanText(alias.subcategory), 40) || subcategory
        };
      }
    }
  } catch (error) {
    console.warn("category alias lookup failed", error);
  }

  return null;
}

function categoryAliasCandidates(category, subcategory) {
  const categoryLabel = normalizeCategoryLabel(category);
  const subcategoryLabel = normalizeCategoryLabel(subcategory);
  const candidates = new Set();
  if (categoryLabel) candidates.add(categoryLabel);
  if (subcategoryLabel) candidates.add(subcategoryLabel);
  const pairLabel = [categoryLabel, subcategoryLabel].filter(Boolean).join(" ");
  if (pairLabel) candidates.add(pairLabel);
  return candidates;
}

function mergeCanonicalCategoryRows(rows, { includeSubcategory }) {
  const merged = new Map();
  for (const row of rows || []) {
    const canonical = normalizeCategory({
      rawText: "",
      kind: "expense",
      category: row.category,
      subcategory: includeSubcategory ? row.subcategory : null
    });
    const key = [
      row.currency || "",
      canonical.category || "",
      includeSubcategory ? canonical.subcategory || "" : ""
    ].join("\u001f");
    const current = merged.get(key) || {
      ...row,
      category: canonical.category,
      subcategory: includeSubcategory ? canonical.subcategory : row.subcategory,
      amount_minor: 0,
      count: 0
    };
    current.amount_minor += Number(row.amount_minor || 0);
    current.count += Number(row.count || 0);
    merged.set(key, current);
  }
  return Array.from(merged.values()).sort((left, right) => Number(right.amount_minor || 0) - Number(left.amount_minor || 0));
}

function canonicalizeTransactionRow(row) {
  if (!row) return row;
  const canonical = normalizeCategory({
    rawText: row.raw_text || row.description || "",
    kind: row.kind,
    category: row.category,
    subcategory: row.subcategory
  });
  return { ...row, category: canonical.category, subcategory: canonical.subcategory };
}

function uniqueSortedCategories(rows) {
  const categories = new Set();
  for (const row of rows || []) {
    const canonical = normalizeCategory({
      rawText: "",
      kind: "expense",
      category: row.category,
      subcategory: null
    });
    if (canonical.category) categories.add(canonical.category);
  }
  return Array.from(categories).sort((left, right) => left.localeCompare(right, "ru"));
}

function inferCategory(lower, kind) {
  if (kind === "income") return { category: "Доход", subcategory: "Прочее" };
  if (kind === "loan_out" || kind === "loan_repayment") return { category: "Долги", subcategory: "Мне должны" };
  if (kind === "borrow_in" || kind === "borrow_repayment") return { category: "Долги", subcategory: "Я должен" };

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(lower))) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }

  return { category: "Прочее", subcategory: "Без категории" };
}

function inferCounterparty(lower) {
  const known = [
    ["сест", "сестра"],
    ["мам", "мама"],
    ["пап", "папа"],
    ["брат", "брат"],
    ["друг", "друг"],
    ["подруг", "подруга"]
  ];
  for (const [needle, label] of known) {
    if (lower.includes(needle)) return label;
  }
  return null;
}

function inferCurrency(lower) {
  const text = String(lower || "").toLowerCase();
  if (/(^|[\s\d])(\$|usd|доллар|долларов)(?=$|\s)/i.test(text)) return "USD";
  if (/(^|[\s\d])(€|eur|евро)(?=$|\s)/i.test(text)) return "EUR";
  if (/(^|[\s\d])(₽|rub|руб|рубль|рублей)(?=$|\s)/i.test(text)) return "RUB";
  if (/(^|[\s\d])(₸|kzt|тг|тенге)(?=$|\s|[а-яё])/i.test(text)) return "KZT";
  return null;
}

async function insertTransaction(env, { updateId, user, chatId, intent, rawText, localDate: localDateOverride }) {
  const now = new Date();
  const timezone = user.timezone || env.DEFAULT_TIMEZONE || "Asia/Qyzylorda";
  const localDate = localDateOverride || resolveLocalDate(intent.date_text, timezone, now);
  const amountMinor = toMinor(intent.amount);
  const nowIso = now.toISOString();

  const existing = await env.DB.prepare(
    `SELECT id, kind, amount_minor, currency, category, subcategory, counterparty, description, local_date
    FROM transactions
    WHERE telegram_update_id = ? AND user_id = ?`
  )
    .bind(updateId, user.id)
    .first();
  if (existing) return canonicalizeTransactionRow(existing);

  const row = await env.DB.prepare(
    `INSERT INTO transactions (
      telegram_update_id, user_id, chat_id, kind, amount_minor, currency,
      category, subcategory, counterparty, description, raw_text,
      occurred_at, local_date, metadata_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id, kind, amount_minor, currency, category, subcategory, counterparty, description, local_date`
  )
    .bind(
      updateId,
      user.id,
      chatId,
      intent.kind,
      amountMinor,
      intent.currency || user.currency,
      intent.category,
      intent.subcategory,
      intent.counterparty,
      intent.description,
      rawText,
      nowIso,
      localDate,
      JSON.stringify({ confidence: intent.confidence, date_text: intent.date_text }),
      nowIso,
      nowIso
    )
    .first();

  await audit(env, user.id, row.id, "create", row);
  return canonicalizeTransactionRow(row);
}

function formatTransactionCreated(row) {
  const lines = [
    `Записал: <b>${escapeHtml(KIND_LABELS[row.kind] || row.kind)}</b>`,
    `Сумма: <b>${formatAmount(row.amount_minor, row.currency)}</b>`,
    `Дата: <b>${escapeHtml(row.local_date)}</b>`
  ];

  if (row.category) {
    lines.push(`Категория: <b>${escapeHtml(row.category)}${row.subcategory ? " > " + escapeHtml(row.subcategory) : ""}</b>`);
  }
  if (row.counterparty) lines.push(`Кто: <b>${escapeHtml(row.counterparty)}</b>`);
  lines.push(`ID записи: <code>${row.id}</code>`);
  lines.push("Отменить: /undo");
  return lines.join("\n");
}

function formatDateResolutionError(result) {
  const dateText = escapeHtml(result.dateText || "дату");
  if (result.reason === "future") {
    return [
      `Не записал: дата <code>${dateText}</code> получается будущей (${escapeHtml(result.parsedDate)}).`,
      "Укажи прошедшую дату, например: <code>1 июля 1453 такси</code>."
    ].join("\n");
  }
  return [
    `Не записал: не смог понять дату <code>${dateText}</code>.`,
    "Поддерживаю: <code>вчера</code>, <code>позавчера</code>, <code>1 июля</code>, <code>01.07</code>, <code>01.07.2026</code>, <code>2026-07-01</code>."
  ].join("\n");
}

async function sendMiniAppLink(env, chatId) {
  const appUrl = getMiniAppUrl(env);
  await sendMessage(env, chatId, "Открыть панель аналитики:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть аналитику",
            web_app: { url: appUrl }
          }
        ]
      ]
    }
  });
}

function getMiniAppUrl(env) {
  return env.MINI_APP_URL || "https://your-worker.example/app";
}

async function handleStatementDocument(env, { chatId, user, updateId, document, caption }) {
  const maxBytes = statementPdfMaxBytes(env);
  if (!isPdfTelegramDocument(document)) {
    await sendMessage(env, chatId, "Пока принимаю для импорта только PDF-выписки банка.");
    return;
  }

  const declaredSize = Number(document.file_size || 0);
  if (declaredSize > maxBytes) {
    await sendMessage(env, chatId, `PDF слишком большой: максимум ${formatBytes(maxBytes)}.`);
    return;
  }

  if (!env.OPENAI_API_KEY) {
    await sendMessage(env, chatId, "Для разбора PDF-выписки нужен <code>OPENAI_API_KEY</code> в настройках Worker.");
    return;
  }

  await sendMessage(env, chatId, "Получил PDF-выписку. Разбираю строки и готовлю черновик импорта.");
  const downloaded = await downloadTelegramFile(env, document.file_id);
  if (downloaded.bytes.byteLength > maxBytes) {
    await sendMessage(env, chatId, `PDF слишком большой после скачивания: максимум ${formatBytes(maxBytes)}.`);
    return;
  }
  if (!isPdfBytes(downloaded.bytes)) {
    await sendMessage(env, chatId, "Файл выглядит не как PDF. Импорт остановлен до отправки в OpenAI.");
    return;
  }

  const parsed = await extractStatementPdf(env, {
    fileName: document.file_name || "statement.pdf",
    bytes: downloaded.bytes,
    caption
  });
  const draft = await createStatementImportDraft(env, {
    user,
    chatId,
    updateId,
    document,
    filePath: downloaded.filePath,
    bytes: downloaded.bytes,
    parsed
  });

  await sendMessage(env, chatId, formatImportDraftSummary(draft), {
    reply_markup: buildImportDraftKeyboard(env, draft.batch.id, draft.importableCount)
  });
}

function isPdfTelegramDocument(document) {
  const mime = String(document?.mime_type || "").toLowerCase();
  const fileName = String(document?.file_name || "").toLowerCase();
  return mime === "application/pdf" || fileName.endsWith(".pdf");
}

function isPdfBytes(bytes) {
  if (!bytes || bytes.byteLength < 5) return false;
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

function statementPdfMaxBytes(env) {
  const configured = Number(env.STATEMENT_PDF_MAX_BYTES || 0);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(configured, HARD_STATEMENT_PDF_MAX_BYTES);
  }
  return DEFAULT_STATEMENT_PDF_MAX_BYTES;
}

function formatBytes(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} МБ`;
}

async function downloadTelegramFile(env, fileId) {
  const infoResponse = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/getFile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId })
  });
  const info = await infoResponse.json().catch(() => ({}));
  if (!infoResponse.ok || info.ok !== true || !info.result?.file_path) {
    throw new Error(`Telegram getFile failed ${infoResponse.status}`);
  }

  const filePath = info.result.file_path;
  const fileResponse = await fetch(`${TELEGRAM_FILE_API}${env.TELEGRAM_BOT_TOKEN}/${filePath}`);
  if (!fileResponse.ok) {
    throw new Error(`Telegram file download failed ${fileResponse.status}`);
  }
  return {
    filePath,
    bytes: new Uint8Array(await fileResponse.arrayBuffer())
  };
}

async function extractStatementPdf(env, { fileName, bytes, caption }) {
  const system = [
    "Ты извлекаешь операции из PDF-выписки банка для личного бюджета.",
    "Верни только JSON по схеме. Не добавляй строки, которых нет в выписке.",
    "Поле amount возвращай числом, а поле amount_text возвращай как исходную сумму из выписки вместе со знаком + или - и валютой, например '- 6 315,75 ₸'.",
    "Знак суммы важнее названия операции: минус означает expense, плюс означает income. Слово 'Перевод' само по себе не означает transfer.",
    "direction укажи как expense для списаний, income для поступлений, transfer только для уверенных переводов между своими счетами, unknown если непонятно.",
    "Даты возвращай в формате YYYY-MM-DD. Если дату, сумму или направление нельзя понять уверенно, заполни null/unknown и снизь confidence.",
    "Валюта проекта KZT. Если строка не KZT, укажи фактическую валюту.",
    "Для operation верни текст из колонки операции: Пополнение, Перевод, Снятие, Покупка или аналогичный.",
    `Если в выписке больше ${MAX_IMPORT_ITEMS} строк, верни первые ${MAX_IMPORT_ITEMS}, поставь truncated true и кратко объясни truncation_reason.`,
    "Для Wolt, Glovo, DodoPizza, Яндекс Еда и похожих доставок используй category_hint 'Доставка'."
  ].join("\n");
  const userText = [
    "Извлеки операции из PDF-выписки.",
    caption ? `Комментарий пользователя: ${caption}` : "",
    `Максимум строк: ${MAX_IMPORT_ITEMS}.`
  ].filter(Boolean).join("\n");

  return callOpenAIFileJson(env, {
    model: env.OPENAI_MODEL_STATEMENT || env.OPENAI_MODEL_PARSE || "gpt-5.4-mini",
    system,
    user: userText,
    fileName,
    mimeType: "application/pdf",
    bytes,
    schemaName: "statement_import",
    schema: STATEMENT_IMPORT_SCHEMA,
    maxOutputTokens: 3500,
    reasoningEffort: env.OPENAI_REASONING_EFFORT_STATEMENT || env.OPENAI_REASONING_EFFORT_PARSE || "low",
    verbosity: "low"
  });
}

async function createStatementImportDraft(env, { user, chatId, updateId, document, filePath, bytes, parsed }) {
  const fileHash = await sha256Hex(bytes);
  const now = new Date().toISOString();
  const normalized = await normalizeStatementImportItems(env, user, parsed);
  const counts = statementImportCounts(normalized);
  const truncated = Boolean(parsed?.truncated) || (Array.isArray(parsed?.rows) && parsed.rows.length > MAX_IMPORT_ITEMS);
  const truncationReason = limitText(cleanText(parsed?.truncation_reason), 240);
  const batch = await env.DB.prepare(
    `INSERT INTO import_batches (
      user_id, chat_id, telegram_update_id, telegram_file_id, telegram_file_unique_id,
      file_name, file_size, file_sha256, source_name, period_start, period_end,
      status, item_count, import_count, duplicate_count, skipped_count,
      expense_minor, income_minor, metadata_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, 0, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *`
  )
    .bind(
      user.id,
      chatId,
      updateId,
      document.file_id || null,
      document.file_unique_id || null,
      limitText(cleanText(document.file_name), 180) || "statement.pdf",
      Number(document.file_size || bytes.byteLength) || bytes.byteLength,
      fileHash,
      limitText(cleanText(parsed.source_name), 120),
      normalizeLocalDate(parsed.period_start),
      normalizeLocalDate(parsed.period_end),
      normalized.length,
      counts.duplicateCount,
      counts.skippedCount,
      counts.expenseMinor,
      counts.incomeMinor,
      JSON.stringify({
        file_path: filePath,
        source_name: parsed.source_name || null,
        period_start: parsed.period_start || null,
        period_end: parsed.period_end || null,
        truncated,
        truncation_reason: truncationReason
      }),
      now,
      now
    )
    .first();

  const insertedItems = [];
  for (const item of normalized) {
    const inserted = await env.DB.prepare(
      `INSERT INTO import_items (
        batch_id, user_id, kind, amount_minor, currency, category, subcategory,
        counterparty, description, raw_text, local_date, status, duplicate_transaction_id,
        confidence, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *`
    )
      .bind(
        batch.id,
        user.id,
        item.kind,
        item.amountMinor,
        item.currency,
        item.category,
        item.subcategory,
        item.counterparty,
        item.description,
        item.rawText,
        item.localDate,
        item.status,
        item.duplicateTransactionId,
        item.confidence,
        JSON.stringify(item.metadata),
        now,
        now
      )
      .first();
    insertedItems.push(inserted);
  }

  await audit(env, user.id, null, "import_draft_create", {
    import_batch_id: batch.id,
    file_name: batch.file_name,
    item_count: normalized.length,
    importable_count: counts.importableCount,
    duplicate_count: counts.duplicateCount,
    skipped_count: counts.skippedCount,
    file_sha256: fileHash
  });

  return {
    batch,
    items: insertedItems,
    importableCount: counts.importableCount,
    duplicateCount: counts.duplicateCount,
    skippedCount: counts.skippedCount,
    expenseMinor: counts.expenseMinor,
    incomeMinor: counts.incomeMinor,
    truncated,
    truncationReason
  };
}

async function normalizeStatementImportItems(env, user, parsed) {
  const rows = Array.isArray(parsed?.rows) ? parsed.rows.slice(0, MAX_IMPORT_ITEMS) : [];
  const items = [];
  for (const [index, row] of rows.entries()) {
    const item = await normalizeStatementImportItem(env, user, row, index);
    items.push(item);
  }
  return items;
}

async function normalizeStatementImportItem(env, user, row, index) {
  const amountInfo = normalizeStatementAmount(row);
  const direction = normalizeStatementKind(row, amountInfo);
  const amountMinor = amountInfo.amountMinor;
  const currency = normalizeCurrency(row.currency || ONLY_SUPPORTED_CURRENCY);
  const localDate = normalizeStatementLocalDate(row.date, user.timezone);
  const description = limitText(cleanText(row.description) || cleanText(row.merchant) || "Операция из выписки", 180);
  const counterparty = limitText(cleanText(row.merchant), 60);
  const rawText = limitText([row.operation, row.description, row.merchant, row.category_hint].map(cleanText).filter(Boolean).join(" | ") || description, 600);
  const confidence = Math.max(0, Math.min(1, Number(row.confidence ?? 0)));
  const metadata = {
    row_index: index,
    source_date: row.date || null,
    source_direction: row.direction || null,
    source_amount_text: row.amount_text || null,
    source_amount_sign: amountInfo.sign || null,
    source_operation: row.operation || null,
    category_hint: row.category_hint || null
  };

  let status = "draft";
  let statusReason = null;
  if (!localDate) {
    status = "skipped";
    statusReason = "invalid_date";
  } else if (!amountMinor) {
    status = "skipped";
    statusReason = "invalid_amount";
  } else if (!["expense", "income"].includes(direction)) {
    status = "skipped";
    statusReason = direction === "transfer" ? "transfer" : "unknown_direction";
  } else if (currency !== ONLY_SUPPORTED_CURRENCY) {
    status = "skipped";
    statusReason = "unsupported_currency";
  }

  const categoryKind = ["expense", "income"].includes(direction) ? direction : "expense";
  const merchantCategory = categoryKind === "expense"
    ? matchMerchantCategory([row.operation, row.description, row.merchant].map(cleanText).filter(Boolean).join(" "))
    : null;
  const category = merchantCategory || await resolveCanonicalCategory(env, user.id, {
    rawText,
    kind: categoryKind,
    category: cleanText(row.category_hint),
    subcategory: null
  });

  let duplicateTransactionId = null;
  if (status === "draft") {
    const duplicate = await findDuplicateTransaction(env, {
      userId: user.id,
      localDate,
      kind: direction,
      amountMinor,
      currency,
      counterparty,
      description,
      rawText
    });
    if (duplicate) {
      status = "duplicate";
      statusReason = "matching_active_transaction";
      duplicateTransactionId = duplicate.id;
    }
  }

  return {
    kind: ["expense", "income", "transfer"].includes(direction) ? direction : "unknown",
    amountMinor,
    currency,
    category: category.category,
    subcategory: category.subcategory,
    counterparty,
    description,
    rawText,
    localDate,
    status,
    duplicateTransactionId,
    confidence,
    metadata: { ...metadata, status_reason: statusReason }
  };
}

function normalizeStatementAmount(row) {
  const parsedText = parseStatementAmountText(row?.amount_text);
  const numericAmount = Number(row?.amount);
  let amountMinor = parsedText?.amountMinor ?? null;
  let sign = parsedText?.sign ?? null;

  if (!amountMinor && Number.isFinite(numericAmount) && Math.abs(numericAmount) > 0) {
    amountMinor = toMinor(Math.abs(numericAmount));
  }
  if (!sign && Number.isFinite(numericAmount) && numericAmount < 0) {
    sign = "-";
  }

  return { amountMinor, sign };
}

function parseStatementAmountText(value) {
  const text = String(value || "").normalize("NFKC").replace(/\u2212/g, "-");
  if (!text.trim()) return null;

  const match = text.match(/([+-])?\s*([0-9][0-9\s\u00a0\u202f.']*(?:,[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/);
  if (!match) return null;

  const sign = match[1] === "-" ? "-" : match[1] === "+" ? "+" : null;
  const rawNumber = match[2].replace(/[\s\u00a0\u202f']/g, "");
  let integerPart = rawNumber;
  let decimalPart = "";

  if (rawNumber.includes(",")) {
    const commaIndex = rawNumber.lastIndexOf(",");
    integerPart = rawNumber.slice(0, commaIndex).replace(/\./g, "");
    decimalPart = rawNumber.slice(commaIndex + 1);
  } else if (/\.\d{1,2}$/.test(rawNumber)) {
    const dotIndex = rawNumber.lastIndexOf(".");
    integerPart = rawNumber.slice(0, dotIndex).replace(/\./g, "");
    decimalPart = rawNumber.slice(dotIndex + 1);
  } else {
    integerPart = rawNumber.replace(/\./g, "");
  }

  const units = Number(integerPart);
  if (!Number.isInteger(units) || units < 0) return null;
  const centsText = `${decimalPart || "0"}00`.slice(0, 2);
  const cents = Number(centsText);
  if (!Number.isInteger(cents) || cents < 0 || cents > 99) return null;

  return { amountMinor: units * 100 + cents, sign };
}

function normalizeStatementKind(row, amountInfo) {
  if (amountInfo?.sign === "-") return "expense";
  if (amountInfo?.sign === "+") return "income";

  const direction = normalizeStatementDirection(row?.direction);
  if (direction === "transfer" && !isLikelyOwnAccountTransfer(row)) return "unknown";
  return direction;
}

function isLikelyOwnAccountTransfer(row) {
  const text = [row?.operation, row?.description, row?.merchant, row?.category_hint]
    .map(cleanText)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /(между\s+(своими\s+)?счет|между\s+карт|собственн|на\s+свой|со\s+своего|с\s+моего|на\s+мой)/i.test(text);
}

function normalizeStatementDirection(direction) {
  const value = String(direction || "").trim().toLowerCase();
  if (value === "expense" || value === "income" || value === "transfer") return value;
  return "unknown";
}

function normalizeStatementLocalDate(value, timezone) {
  const normalized = normalizeLocalDate(value);
  if (normalized) return normalized;
  if (!value) return null;
  const resolved = resolveLocalDateInfo(value, timezone || "Asia/Qyzylorda", new Date());
  return resolved.ok ? resolved.localDate : null;
}

async function findDuplicateTransaction(env, { userId, localDate, kind, amountMinor, currency, counterparty, description, rawText }) {
  if (!env?.DB) return null;
  const rows = await env.DB.prepare(
    `SELECT id, counterparty, description, raw_text
    FROM transactions
    WHERE user_id = ? AND status = 'active' AND local_date = ? AND kind = ? AND amount_minor = ? AND currency = ?
    ORDER BY id DESC
    LIMIT 20`
  )
    .bind(userId, localDate, kind, amountMinor, currency)
    .all();

  for (const row of rows.results || []) {
    if (duplicateTextMatches({ counterparty, description, rawText }, row)) return row;
  }
  return null;
}

function duplicateTextMatches(left, right) {
  const leftLabels = duplicateTextLabels(left);
  const rightLabels = duplicateTextLabels({
    counterparty: right.counterparty,
    description: right.description,
    rawText: right.raw_text
  });
  if (!leftLabels.length || !rightLabels.length) return false;
  return leftLabels.some((leftLabel) =>
    rightLabels.some((rightLabel) => leftLabel === rightLabel || leftLabel.includes(rightLabel) || rightLabel.includes(leftLabel))
  );
}

function duplicateTextLabels({ counterparty, description, rawText }) {
  return [...new Set([counterparty, description, rawText]
    .map(normalizeCategoryLabel)
    .filter((label) => label.length >= 2))];
}

function statementImportCounts(items) {
  return items.reduce(
    (counts, item) => {
      if (item.status === "draft") {
        counts.importableCount += 1;
        if (item.kind === "expense") counts.expenseMinor += Number(item.amountMinor || 0);
        if (item.kind === "income") counts.incomeMinor += Number(item.amountMinor || 0);
      } else if (item.status === "duplicate") {
        counts.duplicateCount += 1;
      } else if (item.status === "skipped") {
        counts.skippedCount += 1;
      }
      return counts;
    },
    { importableCount: 0, duplicateCount: 0, skippedCount: 0, expenseMinor: 0, incomeMinor: 0 }
  );
}

function formatImportDraftSummary(draft) {
  const batch = draft.batch;
  const lines = [
    "Черновик импорта PDF-выписки готов.",
    "",
    `ID: <code>${batch.id}</code> · Файл: <b>${escapeHtml(batch.file_name || "statement.pdf")}</b>`
  ];
  if (batch.source_name) lines.push(`Источник: <b>${escapeHtml(batch.source_name)}</b>`);
  if (batch.period_start || batch.period_end) {
    lines.push(`Период: <b>${escapeHtml([batch.period_start, batch.period_end].filter(Boolean).join(" — "))}</b>`);
  }
  lines.push("");
  lines.push(`Строк: <b>${batch.item_count || 0}</b> · к импорту: <b>${draft.importableCount}</b>`);
  if (draft.expenseMinor) lines.push(`Расходы к импорту: <b>${formatAmount(draft.expenseMinor, ONLY_SUPPORTED_CURRENCY)}</b>`);
  if (draft.incomeMinor) lines.push(`Доходы к импорту: <b>${formatAmount(draft.incomeMinor, ONLY_SUPPORTED_CURRENCY)}</b>`);
  if (draft.duplicateCount) lines.push(`Похожие дубли пропущены: <b>${draft.duplicateCount}</b>`);
  if (draft.skippedCount) lines.push(`Строки без импорта: <b>${draft.skippedCount}</b>`);
  if (draft.truncated) {
    const reason = draft.truncationReason ? ` ${escapeHtml(draft.truncationReason)}` : "";
    lines.push(`Внимание: выписка обрезана до <b>${MAX_IMPORT_ITEMS}</b> строк.${reason}`);
  }
  lines.push("");
  lines.push(draft.importableCount > 0
    ? "После подтверждения я добавлю только недублирующиеся строки в записи."
    : "Нет строк, которые можно безопасно импортировать.");
  return lines.join("\n");
}

function buildImportDraftKeyboard(env, batchId, importableCount) {
  const row = [];
  if (importableCount > 0) {
    row.push({ text: "Импортировать", callback_data: `import:confirm:${batchId}` });
  }
  row.push({ text: "Отменить", callback_data: `import:cancel:${batchId}` });
  const keyboard = [row];
  if (env.MINI_APP_URL) {
    keyboard.push([{ text: "Открыть панель", web_app: { url: miniAppImportUrl(env.MINI_APP_URL, batchId) } }]);
  }
  return { inline_keyboard: keyboard };
}

function miniAppImportUrl(baseUrl, batchId) {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("tab", "import");
    url.searchParams.set("batch", String(batchId));
    return url.toString();
  } catch (error) {
    const separator = String(baseUrl).includes("?") ? "&" : "?";
    return `${baseUrl}${separator}tab=import&batch=${encodeURIComponent(String(batchId))}`;
  }
}

async function listImportBatches(env, userId, limit) {
  const rows = await env.DB.prepare(
    `SELECT *
    FROM import_batches
    WHERE user_id = ?
    ORDER BY CASE status WHEN 'draft' THEN 0 ELSE 1 END, created_at DESC, id DESC
    LIMIT ?`
  )
    .bind(userId, limit)
    .all();
  return rows.results || [];
}

async function hydrateImportBatch(env, userId, batch) {
  const [statusCounts, items] = await Promise.all([
    importBatchStatusCounts(env, userId, batch.id),
    listImportItemPreview(env, userId, batch.id, 8)
  ]);
  return formatImportBatchForApi(batch, statusCounts, items);
}

async function listImportItemPreview(env, userId, batchId, limit) {
  const rows = await env.DB.prepare(
    `SELECT id, kind, amount_minor, currency, category, subcategory, counterparty,
      description, raw_text, local_date, status, duplicate_transaction_id, confidence,
      metadata_json, created_at, updated_at
    FROM import_items
    WHERE user_id = ? AND batch_id = ?
    ORDER BY CASE status
      WHEN 'draft' THEN 0
      WHEN 'duplicate' THEN 1
      WHEN 'skipped' THEN 2
      WHEN 'imported' THEN 3
      ELSE 4
    END, id
    LIMIT ?`
  )
    .bind(userId, batchId, limit)
    .all();
  return rows.results || [];
}

function formatImportBatchForApi(batch, statusCounts, items) {
  const metadata = parseJsonObject(batch.metadata_json) || {};
  const truncated = Boolean(metadata.truncated);
  const warning = truncated
    ? `Выписка обрезана до ${MAX_IMPORT_ITEMS} строк${metadata.truncation_reason ? `: ${metadata.truncation_reason}` : "."}`
    : null;
  const importableCount = Number(statusCounts.draft || 0);
  return {
    id: batch.id,
    status: batch.status,
    file_name: batch.file_name,
    source_name: batch.source_name,
    period_start: batch.period_start,
    period_end: batch.period_end,
    item_count: Number(batch.item_count || 0),
    importable_count: importableCount,
    import_count: Number(batch.import_count || statusCounts.imported || 0),
    duplicate_count: Number(statusCounts.duplicate ?? batch.duplicate_count ?? 0),
    skipped_count: Number(statusCounts.skipped ?? batch.skipped_count ?? 0),
    cancelled_count: Number(statusCounts.cancelled || 0),
    expense_minor: Number(batch.expense_minor || 0),
    income_minor: Number(batch.income_minor || 0),
    created_at: batch.created_at,
    updated_at: batch.updated_at,
    confirmed_at: batch.confirmed_at,
    cancelled_at: batch.cancelled_at,
    warning,
    truncated,
    items: (items || []).map(formatImportItemForApi)
  };
}

function formatImportItemForApi(item) {
  const metadata = parseJsonObject(item.metadata_json) || {};
  return {
    id: item.id,
    kind: item.kind,
    amount_minor: item.amount_minor,
    currency: item.currency,
    category: item.category,
    subcategory: item.subcategory,
    counterparty: item.counterparty,
    description: item.description,
    raw_text: item.raw_text,
    local_date: item.local_date,
    status: item.status,
    duplicate_transaction_id: item.duplicate_transaction_id,
    confidence: item.confidence,
    status_reason: metadata.status_reason || null
  };
}

async function confirmImportBatch(env, user, chatId, batchId) {
  const batch = await getImportBatch(env, user.id, batchId);
  if (!batch) return { ok: false, reason: "not_found", batchId };
  if (batch.status !== "draft") return { ok: false, reason: "not_draft", batch };

  const rows = await env.DB.prepare(
    `SELECT *
    FROM import_items
    WHERE user_id = ? AND batch_id = ? AND status = 'draft'
    ORDER BY id`
  )
    .bind(user.id, batchId)
    .all();

  let importedCount = 0;
  let newDuplicateCount = 0;
  const now = new Date().toISOString();
  for (const item of rows.results || []) {
    const duplicate = await findDuplicateTransaction(env, {
      userId: user.id,
      localDate: item.local_date,
      kind: item.kind,
      amountMinor: item.amount_minor,
      currency: item.currency,
      counterparty: item.counterparty,
      description: item.description,
      rawText: item.raw_text
    });
    if (duplicate) {
      await markImportItemDuplicate(env, user.id, item.id, duplicate.id, now);
      newDuplicateCount += 1;
      continue;
    }

    const inserted = await insertImportedTransaction(env, { user, chatId: chatId || batch.chat_id, batch, item, now });
    await env.DB.prepare(
      `UPDATE import_items
      SET status = 'imported', transaction_id = ?, updated_at = ?
      WHERE user_id = ? AND id = ? AND status = 'draft'`
    )
      .bind(inserted.id, now, user.id, item.id)
      .run();
    await audit(env, user.id, inserted.id, "import_transaction_create", {
      import_batch_id: batch.id,
      import_item_id: item.id,
      file_name: batch.file_name
    });
    importedCount += 1;
  }

  const finalCounts = await importBatchStatusCounts(env, user.id, batchId);
  await env.DB.prepare(
    `UPDATE import_batches
    SET status = 'confirmed', import_count = ?, duplicate_count = ?, skipped_count = ?,
      confirmed_at = ?, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'draft'`
  )
    .bind(finalCounts.imported, finalCounts.duplicate, finalCounts.skipped, now, now, user.id, batchId)
    .run();

  await audit(env, user.id, null, "import_confirm", {
    import_batch_id: batch.id,
    imported_count: importedCount,
    new_duplicate_count: newDuplicateCount
  });

  return { ok: true, batch, importedCount, newDuplicateCount };
}

async function importBatchStatusCounts(env, userId, batchId) {
  const rows = await env.DB.prepare(
    `SELECT status, COUNT(*) AS count
    FROM import_items
    WHERE user_id = ? AND batch_id = ?
    GROUP BY status`
  )
    .bind(userId, batchId)
    .all();
  const counts = { draft: 0, imported: 0, duplicate: 0, skipped: 0, cancelled: 0 };
  for (const row of rows.results || []) {
    if (row.status === "draft") counts.draft = Number(row.count || 0);
    if (row.status === "imported") counts.imported = Number(row.count || 0);
    if (row.status === "duplicate") counts.duplicate = Number(row.count || 0);
    if (row.status === "skipped") counts.skipped = Number(row.count || 0);
    if (row.status === "cancelled") counts.cancelled = Number(row.count || 0);
  }
  return counts;
}

async function getImportBatch(env, userId, batchId) {
  return env.DB.prepare(
    `SELECT *
    FROM import_batches
    WHERE user_id = ? AND id = ?`
  )
    .bind(userId, batchId)
    .first();
}

async function markImportItemDuplicate(env, userId, itemId, duplicateTransactionId, now) {
  await env.DB.prepare(
    `UPDATE import_items
    SET status = 'duplicate', duplicate_transaction_id = ?, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'draft'`
  )
    .bind(duplicateTransactionId, now, userId, itemId)
    .run();
}

async function insertImportedTransaction(env, { user, chatId, batch, item, now }) {
  const telegramUpdateId = `import:${batch.id}:${item.id}`;
  const existing = await env.DB.prepare(
    `SELECT id
    FROM transactions
    WHERE user_id = ? AND telegram_update_id = ?`
  )
    .bind(user.id, telegramUpdateId)
    .first();
  if (existing) return existing;

  const itemMetadata = parseJsonObject(item.metadata_json);
  return env.DB.prepare(
    `INSERT INTO transactions (
      telegram_update_id, user_id, chat_id, kind, amount_minor, currency,
      category, subcategory, counterparty, description, raw_text,
      occurred_at, local_date, metadata_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id`
  )
    .bind(
      telegramUpdateId,
      user.id,
      chatId,
      item.kind,
      item.amount_minor,
      item.currency || user.currency,
      item.category,
      item.subcategory,
      item.counterparty,
      item.description,
      item.raw_text,
      now,
      item.local_date,
      JSON.stringify({
        source: "statement_import",
        import_batch_id: batch.id,
        import_item_id: item.id,
        statement_file_name: batch.file_name,
        confidence: item.confidence,
        row: itemMetadata
      }),
      now,
      now
    )
    .first();
}

async function cancelImportBatch(env, user, batchId) {
  const batch = await getImportBatch(env, user.id, batchId);
  if (!batch) return { ok: false, reason: "not_found", batchId };
  if (batch.status !== "draft") return { ok: false, reason: "not_draft", batch };

  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `UPDATE import_batches
    SET status = 'cancelled', cancelled_at = ?, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'draft'`
  )
    .bind(now, now, user.id, batchId)
    .run();
  if ((result.meta?.changes ?? 0) === 0) return { ok: false, reason: "not_draft", batch };

  await env.DB.prepare(
    `UPDATE import_items
    SET status = 'cancelled', updated_at = ?
    WHERE user_id = ? AND batch_id = ? AND status = 'draft'`
  )
    .bind(now, user.id, batchId)
    .run();
  await audit(env, user.id, null, "import_cancel", { import_batch_id: batchId });
  return { ok: true, batch };
}

function formatImportConfirmationResult(result) {
  if (!result.ok) {
    if (result.reason === "not_found") return "Черновик импорта не найден.";
    return `Этот импорт уже не в статусе черновика: <code>${escapeHtml(result.batch?.status || "unknown")}</code>.`;
  }
  const lines = [
    `Импорт <code>${result.batch.id}</code> подтвержден.`,
    `Добавлено записей: <b>${result.importedCount}</b>`
  ];
  if (result.newDuplicateCount) {
    lines.push(`Новые дубли пропущены: <b>${result.newDuplicateCount}</b>`);
  }
  return lines.join("\n");
}

function formatImportCancellationResult(result) {
  if (!result.ok) {
    if (result.reason === "not_found") return "Черновик импорта не найден.";
    return `Этот импорт уже не в статусе черновика: <code>${escapeHtml(result.batch?.status || "unknown")}</code>.`;
  }
  return `Черновик импорта <code>${result.batch.id}</code> отменен. Записи в БД не добавлены.`;
}

async function handleAnalytics(env, { chatId, user, period, originalText, useAi }) {
  const bounds = periodBounds(period, user.timezone);
  const summary = await buildSummary(env, user.id, bounds);
  const deterministic = formatSummary(summary, bounds);

  if (!useAi || !env.OPENAI_API_KEY || summary.transaction_count === 0) {
    await sendMessage(env, chatId, deterministic);
    return;
  }

  const enhanced = await enhanceAnalytics(env, summary, originalText).catch((error) => {
    console.error("analytics enhancement failed", error);
    return null;
  });

  await sendMessage(env, chatId, enhanced ? escapeHtml(enhanced) : deterministic);
}

async function buildSummary(env, userId, bounds) {
  const [
    totals,
    categories,
    categoryTotals,
    byDay,
    largestExpenses,
    familyHelp,
    familyHelpCounterparties
  ] = await env.DB.batch([
    env.DB.prepare(
      `SELECT
        currency,
        COUNT(CASE WHEN NOT (${FAMILY_HELP_EXPENSE_SQL}) THEN 1 END) AS transaction_count,
        COALESCE(SUM(CASE WHEN kind = 'expense' AND NOT (${FAMILY_HELP_EXPENSE_SQL}) THEN amount_minor ELSE 0 END), 0) AS expense_minor,
        COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_minor ELSE 0 END), 0) AS income_minor,
        COALESCE(SUM(CASE WHEN kind = 'loan_out' THEN amount_minor ELSE 0 END), 0) AS loan_out_minor,
        COALESCE(SUM(CASE WHEN kind = 'loan_repayment' THEN amount_minor ELSE 0 END), 0) AS loan_repayment_minor,
        COALESCE(SUM(CASE WHEN kind = 'borrow_in' THEN amount_minor ELSE 0 END), 0) AS borrow_in_minor,
        COALESCE(SUM(CASE WHEN kind = 'borrow_repayment' THEN amount_minor ELSE 0 END), 0) AS borrow_repayment_minor
      FROM transactions
      WHERE user_id = ? AND status = 'active' AND local_date BETWEEN ? AND ?
      GROUP BY currency
      ORDER BY currency`
    ).bind(userId, bounds.start, bounds.end),
    env.DB.prepare(
      `SELECT
        currency,
        COALESCE(category, 'Прочее') AS category,
        COALESCE(subcategory, 'Без категории') AS subcategory,
        SUM(amount_minor) AS amount_minor,
        COUNT(*) AS count
      FROM transactions
      WHERE user_id = ? AND status = 'active' AND kind = 'expense' AND NOT (${FAMILY_HELP_EXPENSE_SQL}) AND local_date BETWEEN ? AND ?
      GROUP BY currency, category, subcategory
      ORDER BY amount_minor DESC
      LIMIT 24`
    ).bind(userId, bounds.start, bounds.end),
    env.DB.prepare(
      `SELECT
        currency,
        COALESCE(category, 'Прочее') AS category,
        SUM(amount_minor) AS amount_minor,
        COUNT(*) AS count
      FROM transactions
      WHERE user_id = ? AND status = 'active' AND kind = 'expense' AND NOT (${FAMILY_HELP_EXPENSE_SQL}) AND local_date BETWEEN ? AND ?
      GROUP BY currency, category
      ORDER BY amount_minor DESC
      LIMIT 30`
    ).bind(userId, bounds.start, bounds.end),
    env.DB.prepare(
      `SELECT
        local_date,
        currency,
        COALESCE(SUM(CASE WHEN kind = 'expense' AND NOT (${FAMILY_HELP_EXPENSE_SQL}) THEN amount_minor ELSE 0 END), 0) AS expense_minor,
        COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_minor ELSE 0 END), 0) AS income_minor,
        COALESCE(SUM(CASE WHEN kind = 'loan_out' THEN amount_minor ELSE 0 END), 0) AS loan_out_minor,
        COALESCE(SUM(CASE WHEN kind = 'borrow_in' THEN amount_minor ELSE 0 END), 0) AS borrow_in_minor,
        COUNT(CASE WHEN NOT (${FAMILY_HELP_EXPENSE_SQL}) THEN 1 END) AS count
      FROM transactions
      WHERE user_id = ? AND status = 'active' AND local_date BETWEEN ? AND ?
      GROUP BY local_date, currency
      ORDER BY local_date, currency`
    ).bind(userId, bounds.start, bounds.end),
    env.DB.prepare(
      `SELECT
        id,
        amount_minor,
        currency,
        category,
        subcategory,
        counterparty,
        description,
        raw_text,
        local_date
      FROM transactions
      WHERE user_id = ? AND status = 'active' AND kind = 'expense' AND NOT (${FAMILY_HELP_EXPENSE_SQL}) AND local_date BETWEEN ? AND ?
      ORDER BY amount_minor DESC
      LIMIT 5`
    ).bind(userId, bounds.start, bounds.end),
    env.DB.prepare(
      `SELECT
        currency,
        SUM(amount_minor) AS amount_minor,
        COUNT(*) AS count
      FROM transactions
      WHERE user_id = ? AND status = 'active' AND ${FAMILY_HELP_EXPENSE_SQL} AND local_date BETWEEN ? AND ?
      GROUP BY currency
      ORDER BY currency`
    ).bind(userId, bounds.start, bounds.end),
    env.DB.prepare(
      `SELECT
        currency,
        COALESCE(counterparty, 'не указано') AS counterparty,
        SUM(amount_minor) AS amount_minor,
        COUNT(*) AS count
      FROM transactions
      WHERE user_id = ? AND status = 'active' AND ${FAMILY_HELP_EXPENSE_SQL} AND local_date BETWEEN ? AND ?
      GROUP BY currency, counterparty
      ORDER BY amount_minor DESC
      LIMIT 8`
    ).bind(userId, bounds.start, bounds.end)
  ]);

  const totalsByCurrency = totals.results || [];
  const transactionCount = totalsByCurrency.reduce((sum, row) => sum + Number(row.transaction_count || 0), 0);

  return {
    period: bounds,
    transaction_count: transactionCount,
    totals_by_currency: totalsByCurrency,
    categories: mergeCanonicalCategoryRows(categories.results || [], { includeSubcategory: true }).slice(0, 8),
    category_totals: mergeCanonicalCategoryRows(categoryTotals.results || [], { includeSubcategory: false }).slice(0, 10),
    by_day: byDay.results || [],
    largest_expenses: (largestExpenses.results || []).map(canonicalizeTransactionRow),
    family_help: familyHelp.results || [],
    family_help_counterparties: familyHelpCounterparties.results || []
  };
}

function formatSummary(summary, bounds) {
  const lines = [
    `Период: <b>${escapeHtml(bounds.label)}</b>`,
    `Записей: <b>${summary.transaction_count || 0}</b>`
  ];

  for (const total of summary.totals_by_currency || []) {
    const currency = total.currency || "KZT";
    lines.push("");
    lines.push(`Валюта: <b>${escapeHtml(currency)}</b>`);
    lines.push(`Расходы: <b>${formatAmount(total.expense_minor || 0, currency)}</b>`);
    lines.push(`Доходы: <b>${formatAmount(total.income_minor || 0, currency)}</b>`);
    if (total.loan_out_minor) {
      lines.push(`Дал в долг: <b>${formatAmount(total.loan_out_minor, currency)}</b>`);
    }
    if (total.loan_repayment_minor) {
      lines.push(`Вернули долгов: <b>${formatAmount(total.loan_repayment_minor, currency)}</b>`);
    }
    if (total.borrow_in_minor) {
      lines.push(`Взял в долг: <b>${formatAmount(total.borrow_in_minor, currency)}</b>`);
    }
    if (total.borrow_repayment_minor) {
      lines.push(`Вернул долгов: <b>${formatAmount(total.borrow_repayment_minor, currency)}</b>`);
    }
  }

  if (summary.categories.length) {
    lines.push("");
    lines.push("Топ категорий:");
    for (const item of summary.categories.slice(0, 5)) {
      lines.push(`- ${escapeHtml(item.category)} > ${escapeHtml(item.subcategory)}: <b>${formatAmount(item.amount_minor, item.currency || "KZT")}</b>`);
    }
  }

  if (summary.family_help?.length) {
    lines.push("");
    lines.push("Помощь семье отдельно:");
    for (const item of summary.family_help) {
      lines.push(`- <b>${formatAmount(item.amount_minor, item.currency || "KZT")}</b> (${item.count} записей)`);
    }
  }

  if (!summary.transaction_count) {
    lines.push("");
    lines.push("За этот период пока нет личных записей.");
  }

  return lines.join("\n");
}

async function enhanceAnalytics(env, summary, originalText) {
  const system = [
    "Ты финансовый аналитик для личного бюджета.",
    "Используй только переданные SQL-агрегаты.",
    "Не выдумывай суммы, категории и даты.",
    "Ответь кратко, на русском, обычным текстом без Markdown и HTML.",
    "Если данных мало, прямо скажи, что вывод предварительный."
  ].join("\n");

  const payload = JSON.stringify({ question: originalText, summary });
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL_ANALYTICS || env.OPENAI_MODEL_PARSE || "gpt-5.4-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: payload }
      ],
      reasoning: { effort: env.OPENAI_REASONING_EFFORT_ANALYTICS || "low" },
      text: { verbosity: "low" },
      max_output_tokens: 500,
      store: false
    })
  });

  if (!response.ok) throw new Error(`OpenAI analytics error ${response.status}`);
  const data = await response.json();
  return extractOutputText(data);
}

async function handleDebts(env, chatId, user) {
  const open = await buildDebts(env, user.id);
  if (!open.length) {
    await sendMessage(env, chatId, "Открытых долгов нет.");
    return;
  }

  const lines = ["Открытые долги:"];
  for (const row of open) {
    if (row.receivable_minor > 0) {
      lines.push(`- ${escapeHtml(row.counterparty)} должен: <b>${formatAmount(row.receivable_minor, row.currency)}</b>`);
    }
    if (row.payable_minor > 0) {
      lines.push(`- Вы должны ${escapeHtml(row.counterparty)}: <b>${formatAmount(row.payable_minor, row.currency)}</b>`);
    }
  }
  await sendMessage(env, chatId, lines.join("\n"));
}

async function buildDebts(env, userId) {
  const rows = await env.DB.prepare(
    `SELECT
      COALESCE(counterparty, 'не указано') AS counterparty,
      currency,
      COALESCE(SUM(CASE
        WHEN kind = 'loan_out' THEN amount_minor
        WHEN kind = 'loan_repayment' THEN -amount_minor
        ELSE 0 END), 0) AS receivable_minor,
      COALESCE(SUM(CASE
        WHEN kind = 'borrow_in' THEN amount_minor
        WHEN kind = 'borrow_repayment' THEN -amount_minor
        ELSE 0 END), 0) AS payable_minor
    FROM transactions
    WHERE user_id = ? AND status = 'active' AND kind IN ('loan_out', 'loan_repayment', 'borrow_in', 'borrow_repayment')
    GROUP BY counterparty, currency
    ORDER BY counterparty, currency`
  )
    .bind(userId)
    .all();

  return (rows.results || []).filter((row) => row.receivable_minor !== 0 || row.payable_minor !== 0);
}

async function listTransactions(env, userId, status, limit) {
  const safeStatus = status === "deleted" ? "deleted" : "active";
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 10;
  const rows = await env.DB.prepare(
    `SELECT id, local_date, kind, amount_minor, currency, category, subcategory, counterparty, description, raw_text, status, created_at, updated_at
    FROM transactions
    WHERE user_id = ? AND status = ?
    ORDER BY id DESC
    LIMIT ?`
  )
    .bind(userId, safeStatus, safeLimit)
    .all();
  return (rows.results || []).map(canonicalizeTransactionRow);
}

async function searchTransactions(env, { userId, bounds, status, kind, kindGroup, category, query, limit }) {
  const safeLimit = normalizeLimit(limit, 30, 50);
  const conditions = ["user_id = ?", "status = ?", "currency = 'KZT'", "local_date BETWEEN ? AND ?"];
  const binds = [userId, status, bounds.start, bounds.end];

  if (kind) {
    conditions.push("kind = ?");
    binds.push(kind);
  } else if (kindGroup === "debt") {
    conditions.push(`kind IN (${DEBT_KINDS.map(() => "?").join(", ")})`);
    binds.push(...DEBT_KINDS);
  }
  if (category) {
    conditions.push("category = ?");
    binds.push(category);
  }
  if (query) {
    const pattern = `%${escapeSqlLike(query)}%`;
    conditions.push(`(
      description LIKE ? ESCAPE '\\' OR
      raw_text LIKE ? ESCAPE '\\' OR
      category LIKE ? ESCAPE '\\' OR
      subcategory LIKE ? ESCAPE '\\' OR
      counterparty LIKE ? ESCAPE '\\'
    )`);
    binds.push(pattern, pattern, pattern, pattern, pattern);
  }

  const items = await env.DB.prepare(
    `SELECT id, local_date, kind, amount_minor, currency, category, subcategory, counterparty, description, raw_text, status, created_at, updated_at
    FROM transactions
    WHERE ${conditions.join(" AND ")}
    ORDER BY local_date DESC, id DESC
    LIMIT ?`
  )
    .bind(...binds, safeLimit)
    .all();

  const categories = await env.DB.prepare(
    `SELECT DISTINCT category
    FROM transactions
    WHERE user_id = ? AND status = ? AND currency = 'KZT' AND local_date BETWEEN ? AND ? AND category IS NOT NULL AND category != ''
    ORDER BY category`
  )
    .bind(userId, status, bounds.start, bounds.end)
    .all();

  return {
    items: (items.results || []).map(canonicalizeTransactionRow),
    categories: uniqueSortedCategories(categories.results || [])
  };
}

async function getTransactionById(env, userId, id) {
  const row = await env.DB.prepare(
    `SELECT id, local_date, kind, amount_minor, currency, category, subcategory, counterparty, description, raw_text, status, deleted_at, created_at, updated_at
    FROM transactions
    WHERE user_id = ? AND id = ?`
  )
    .bind(userId, id)
    .first();
  return canonicalizeTransactionRow(row);
}

async function updateTransactionFromMiniApp(env, userId, row, body) {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      response: json({ ok: false, error: "Amount must be a positive number" }, { status: 400 })
    };
  }

  const localDate = normalizeLocalDate(body.local_date);
  if (!localDate) {
    return {
      ok: false,
      response: json({ ok: false, error: "Date must be YYYY-MM-DD" }, { status: 400 })
    };
  }

  const kind = normalizeTransactionKind(body.kind) || row.kind;
  const rawText = limitText(cleanText(body.raw_text) || row.raw_text, 600) || row.raw_text;
  const description = limitText(cleanText(body.description) || rawText, 180);
  const categoryInput = limitText(cleanText(body.category), 40);
  const subcategoryInput = limitText(cleanText(body.subcategory), 40);
  const category = await resolveCanonicalCategory(env, userId, {
    rawText,
    kind,
    category: categoryInput,
    subcategory: subcategoryInput
  });
  const counterparty = limitText(cleanText(body.counterparty), 60);
  const amountMinor = toMinor(amount);
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `UPDATE transactions
    SET kind = ?, amount_minor = ?, category = ?, subcategory = ?, counterparty = ?,
      description = ?, raw_text = ?, local_date = ?, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'active'`
  )
    .bind(
      kind,
      amountMinor,
      category.category,
      category.subcategory,
      counterparty,
      description,
      rawText,
      localDate,
      now,
      userId,
      row.id
    )
    .run();

  if ((result.meta?.changes ?? 0) === 0) {
    return {
      ok: false,
      response: json({ ok: false, error: "Transaction was already changed" }, { status: 409 })
    };
  }

  await audit(env, userId, row.id, "mini_app_update", {
    before: {
      kind: row.kind,
      amount_minor: row.amount_minor,
      category: row.category,
      subcategory: row.subcategory,
      counterparty: row.counterparty,
      description: row.description,
      raw_text: row.raw_text,
      local_date: row.local_date
    },
    after: {
      kind,
      amount_minor: amountMinor,
      category: category.category,
      subcategory: category.subcategory,
      counterparty,
      description,
      raw_text: rawText,
      local_date: localDate
    }
  });
  return { ok: true };
}

async function handleLast(env, chatId, user, arg) {
  const normalizedArg = String(arg || "").trim().toLowerCase();
  const showDeleted = ["deleted", "delete", "удаленные", "удалённые", "удалено"].includes(normalizedArg);
  const limitFromArg = Number(normalizedArg);
  const limit = Number.isInteger(limitFromArg) && limitFromArg > 0 ? Math.min(limitFromArg, 20) : 10;
  const status = showDeleted ? "deleted" : "active";

  const items = await listTransactions(env, user.id, status, limit);
  if (!items.length) {
    await sendMessage(env, chatId, showDeleted ? "Удаленных записей пока нет." : "Активных записей пока нет.");
    return;
  }

  const lines = [showDeleted ? "Последние удаленные записи:" : "Последние активные записи:"];
  for (const row of items) {
    lines.push(formatBriefTransaction(row));
  }

  if (showDeleted) {
    lines.push("");
    lines.push("Восстановить: /restore 123");
  } else {
    lines.push("");
    lines.push("Удалить конкретную: /delete 123");
    lines.push("Показать удаленные: /last deleted");
  }

  await sendMessage(env, chatId, lines.join("\n"));
}

async function undoLast(env, chatId, user) {
  const row = await env.DB.prepare(
    `SELECT id, kind, amount_minor, currency, category, subcategory
    FROM transactions
    WHERE user_id = ? AND status = 'active'
    ORDER BY id DESC
    LIMIT 1`
  )
    .bind(user.id)
    .first();

  if (!row) {
    await sendMessage(env, chatId, "Нет активных записей для отмены.");
    return;
  }

  const changed = await softDelete(env, user.id, row.id, "undo");
  if (!changed) {
    await sendMessage(env, chatId, "Запись уже была изменена. Открой /last и попробуй снова.");
    return;
  }
  await sendMessage(
    env,
    chatId,
    `Отменил запись <code>${row.id}</code>: ${escapeHtml(KIND_LABELS[row.kind] || row.kind)}, ${formatAmount(row.amount_minor, row.currency)}.`
  );
}

async function deleteById(env, chatId, user, arg) {
  const id = Number(arg);
  if (!Number.isInteger(id) || id <= 0) {
    await sendMessage(env, chatId, "Укажи ID записи: <code>/delete 123</code>");
    return;
  }

  const row = await env.DB.prepare(
    `SELECT id, kind, amount_minor, currency
    FROM transactions
    WHERE user_id = ? AND id = ? AND status = 'active'`
  )
    .bind(user.id, id)
    .first();

  if (!row) {
    await sendMessage(env, chatId, `Активная запись <code>${id}</code> не найдена.`);
    return;
  }

  const changed = await softDelete(env, user.id, id, "delete");
  if (!changed) {
    await sendMessage(env, chatId, `Запись <code>${id}</code> уже была изменена. Открой /last и попробуй снова.`);
    return;
  }
  await sendMessage(env, chatId, `Удалил запись <code>${id}</code>.`);
}

async function restoreById(env, chatId, user, arg) {
  const id = Number(arg);
  if (!Number.isInteger(id) || id <= 0) {
    await sendMessage(env, chatId, "Укажи ID записи: <code>/restore 123</code>");
    return;
  }

  const row = await env.DB.prepare(
    `SELECT id, kind, amount_minor, currency, category, subcategory
    FROM transactions
    WHERE user_id = ? AND id = ? AND status = 'deleted'`
  )
    .bind(user.id, id)
    .first();

  if (!row) {
    await sendMessage(env, chatId, `Удаленная запись <code>${id}</code> не найдена.`);
    return;
  }

  const changed = await restoreTransaction(env, user.id, id, "restore");
  if (!changed) {
    await sendMessage(env, chatId, `Запись <code>${id}</code> уже была изменена. Открой /last deleted и попробуй снова.`);
    return;
  }

  await sendMessage(
    env,
    chatId,
    `Восстановил запись <code>${row.id}</code>: ${escapeHtml(KIND_LABELS[row.kind] || row.kind)}, ${formatAmount(row.amount_minor, row.currency)}.`
  );
}

async function softDelete(env, userId, transactionId, action) {
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `UPDATE transactions
    SET status = 'deleted', deleted_at = ?, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'active'`
  )
    .bind(now, now, userId, transactionId)
    .run();
  if ((result.meta?.changes ?? 0) === 0) return false;
  await audit(env, userId, transactionId, action, { deleted_at: now });
  return true;
}

async function restoreTransaction(env, userId, transactionId, action) {
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `UPDATE transactions
    SET status = 'active', deleted_at = NULL, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'deleted'`
  )
    .bind(now, userId, transactionId)
    .run();
  if ((result.meta?.changes ?? 0) === 0) return false;
  await audit(env, userId, transactionId, action, { restored_at: now });
  return true;
}

function formatBriefTransaction(row) {
  const category = row.category
    ? ` | ${escapeHtml(row.category)}${row.subcategory ? " > " + escapeHtml(row.subcategory) : ""}`
    : "";
  const counterparty = row.counterparty ? ` | ${escapeHtml(row.counterparty)}` : "";
  const description = row.description ? ` | ${escapeHtml(limitText(row.description, 60))}` : "";
  return [
    `<code>${row.id}</code>.`,
    escapeHtml(row.local_date),
    escapeHtml(KIND_LABELS[row.kind] || row.kind),
    `<b>${formatAmount(row.amount_minor, row.currency)}</b>${category}${counterparty}${description}`
  ].join(" ");
}

async function exportCsv(env, chatId, user) {
  const rows = await env.DB.prepare(
    `SELECT id, local_date, kind, amount_minor, currency, category, subcategory, counterparty, description, raw_text, status, created_at
    FROM transactions
    WHERE user_id = ? AND status = 'active'
    ORDER BY local_date DESC, id DESC`
  )
    .bind(user.id)
    .all();

  const header = [
    "id",
    "date",
    "kind",
    "amount",
    "currency",
    "category",
    "subcategory",
    "counterparty",
    "description",
    "raw_text",
    "status",
    "created_at"
  ];

  const lines = [header.join(",")];
  for (const row of rows.results || []) {
    lines.push(
      [
        row.id,
        row.local_date,
        row.kind,
        minorToNumber(row.amount_minor),
        row.currency,
        row.category,
        row.subcategory,
        row.counterparty,
        row.description,
        row.raw_text,
        row.status,
        row.created_at
      ]
        .map(csvCell)
        .join(",")
    );
  }

  const csv = lines.join("\n");
  const filename = `residualmap-${getLocalYmd(new Date(), user.timezone)}.csv`;
  await sendDocument(env, chatId, filename, `\uFEFF${csv}`, "CSV экспорт расходов.");
}

async function upsertUser(env, from) {
  const now = new Date().toISOString();
  const telegramUserId = String(from.id);
  const existing = await env.DB.prepare("SELECT * FROM users WHERE telegram_user_id = ?")
    .bind(telegramUserId)
    .first();

  if (existing) {
    await env.DB.prepare(
      `UPDATE users
      SET username = ?, first_name = ?, last_name = ?, currency = ?, updated_at = ?
      WHERE telegram_user_id = ?`
    )
      .bind(from.username || null, from.first_name || null, from.last_name || null, ONLY_SUPPORTED_CURRENCY, now, telegramUserId)
      .run();
    return {
      ...existing,
      username: from.username || null,
      first_name: from.first_name || null,
      last_name: from.last_name || null,
      currency: ONLY_SUPPORTED_CURRENCY,
      updated_at: now
    };
  }

  const row = await env.DB.prepare(
    `INSERT INTO users (telegram_user_id, username, first_name, last_name, timezone, currency, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *`
  )
    .bind(
      telegramUserId,
      from.username || null,
      from.first_name || null,
      from.last_name || null,
      env.DEFAULT_TIMEZONE || "Asia/Qyzylorda",
      ONLY_SUPPORTED_CURRENCY,
      now,
      now
    )
    .first();

  await audit(env, row.id, null, "user_create", { telegram_user_id: telegramUserId });
  return row;
}

async function beginUpdateProcessing(env, updateId) {
  const now = new Date().toISOString();
  const staleBefore = new Date(Date.now() - UPDATE_PROCESSING_STALE_MS).toISOString();
  const existing = await env.DB.prepare(
    "SELECT update_id, status, processed_at FROM processed_updates WHERE update_id = ?"
  )
    .bind(updateId)
    .first();

  if (!existing) {
    const result = await env.DB.prepare(
      `INSERT OR IGNORE INTO processed_updates (update_id, processed_at, status, attempts)
      VALUES (?, ?, 'processing', 1)`
    )
      .bind(updateId, now)
      .run();
    return (result.meta?.changes ?? 0) > 0;
  }

  if (existing.status === "completed") return false;
  if (existing.status === "processing" && existing.processed_at >= staleBefore) return false;

  const result = await env.DB.prepare(
    `UPDATE processed_updates
    SET status = 'processing', processed_at = ?, completed_at = NULL, last_error = NULL, attempts = attempts + 1
    WHERE update_id = ? AND (status = 'failed' OR (status = 'processing' AND processed_at < ?))`
  )
    .bind(now, updateId, staleBefore)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

async function completeUpdateProcessing(env, updateId) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE processed_updates
    SET status = 'completed', completed_at = ?, last_error = NULL
    WHERE update_id = ?`
  )
    .bind(now, updateId)
    .run();
}

async function failUpdateProcessing(env, updateId, error) {
  const message = limitText(error?.message || String(error || "Unknown error"), 500);
  await env.DB.prepare(
    `UPDATE processed_updates
    SET status = 'failed', last_error = ?
    WHERE update_id = ?`
  )
    .bind(message, updateId)
    .run();
}

async function audit(env, userId, transactionId, action, payload) {
  await env.DB.prepare(
    "INSERT INTO audit_log (user_id, transaction_id, action, payload_json, created_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(userId, transactionId, action, JSON.stringify(payload || null), new Date().toISOString())
    .run();
}

async function callOpenAIJson(env, { model, system, user, schemaName, schema, maxOutputTokens, reasoningEffort, verbosity }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      text: {
        verbosity: verbosity || "low",
        format: {
          type: "json_schema",
          name: schemaName,
          schema,
          strict: true
        }
      },
      reasoning: { effort: reasoningEffort || "low" },
      max_output_tokens: maxOutputTokens,
      store: false
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  return JSON.parse(extractOutputText(data));
}

async function callOpenAIFileJson(env, { model, system, user, fileName, mimeType, bytes, schemaName, schema, maxOutputTokens, reasoningEffort, verbosity }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: fileName,
              file_data: `data:${mimeType};base64,${bytesToBase64(bytes)}`
            },
            { type: "input_text", text: user }
          ]
        }
      ],
      text: {
        verbosity: verbosity || "low",
        format: {
          type: "json_schema",
          name: schemaName,
          schema,
          strict: true
        }
      },
      reasoning: { effort: reasoningEffort || "low" },
      max_output_tokens: maxOutputTokens,
      store: false
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI file error ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  return JSON.parse(extractOutputText(data));
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") return content.text;
      if (typeof content.output_text === "string") return content.output_text;
    }
  }
  throw new Error("No output text in OpenAI response");
}

function parseJsonObject(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  if (typeof btoa === "function") return btoa(binary);
  return Buffer.from(bytes).toString("base64");
}

async function sendMessage(env, chatId, text, options = {}) {
  const chunks = splitTelegramText(text);
  for (const chunk of chunks) {
    const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...options
      })
    });
    if (!response.ok) {
      console.error("Telegram sendMessage failed", response.status, await response.text());
    }
  }
}

async function answerCallbackQuery(env, callbackQueryId, text) {
  if (!callbackQueryId) return;
  const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: limitText(text, 180),
      show_alert: false
    })
  });
  if (!response.ok) {
    console.error("Telegram answerCallbackQuery failed", response.status, await response.text());
  }
}

async function sendDocument(env, chatId, filename, text, caption) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("document", new Blob([text], { type: "text/csv;charset=utf-8" }), filename);

  const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
    method: "POST",
    body: form
  });
  if (!response.ok) {
    console.error("Telegram sendDocument failed", response.status, await response.text());
  }
}

function isAllowed(env, telegramUserId) {
  const ids = String(env.ALLOWED_TELEGRAM_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return ids.includes(telegramUserId);
}

function isAllowedConfigured(env) {
  return String(env.ALLOWED_TELEGRAM_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean).length > 0;
}

function normalizeTransactionStatus(status) {
  return status === "deleted" ? "deleted" : "active";
}

function normalizeTransactionKind(kind) {
  const value = String(kind || "").trim();
  if (!value || value === "all") return null;
  return TRANSACTION_KINDS.has(value) ? value : null;
}

function normalizeTransactionKindGroup(kindGroup) {
  const value = String(kindGroup || "").trim();
  if (!value || value === "all") return null;
  return value === "debt" ? "debt" : null;
}

function normalizeLimit(limit, defaultValue, maxValue) {
  const value = Number(limit);
  if (!Number.isInteger(value) || value <= 0) return defaultValue;
  return Math.min(value, maxValue);
}

function normalizePeriod(period) {
  const value = String(period || "month");
  if (["today", "yesterday", "week", "month", "last_7_days", "last_30_days"].includes(value)) return value;
  return "month";
}

function normalizeLocalDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text ? null : text;
}

function periodBounds(period, timezone) {
  const today = getLocalYmd(new Date(), timezone || "Asia/Qyzylorda");

  if (period === "today") {
    return { start: today, end: today, label: "Сегодня" };
  }

  if (period === "yesterday") {
    const yesterday = addDaysYmd(today, -1);
    return { start: yesterday, end: yesterday, label: "Вчера" };
  }

  if (period === "week") {
    const start = startOfWeekYmd(today);
    return { start, end: today, label: "Эта неделя" };
  }

  if (period === "last_7_days") {
    const start = addDaysYmd(today, -6);
    return { start, end: today, label: "Последние 7 дней" };
  }

  if (period === "last_30_days") {
    const start = addDaysYmd(today, -29);
    return { start, end: today, label: "Последние 30 дней" };
  }

  const start = `${today.slice(0, 8)}01`;
  return { start, end: today, label: monthLabelYmd(today) };
}

function monthLabelYmd(ymd) {
  const date = new Date(`${ymd.slice(0, 8)}01T00:00:00Z`);
  const label = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function resolveLocalDate(dateText, timezone, now) {
  return resolveLocalDateInfo(dateText, timezone, now).localDate;
}

function resolveLocalDateInfo(dateText, timezone, now) {
  const today = getLocalYmd(now, timezone);
  const lower = String(dateText || "").toLowerCase().replaceAll("ё", "е").trim();
  if (!lower) return { ok: true, localDate: today, explicit: false };
  if (lower.includes("позавчера")) return { ok: true, localDate: addDaysYmd(today, -2), explicit: true };
  if (lower.includes("вчера")) return { ok: true, localDate: addDaysYmd(today, -1), explicit: true };
  if (lower.includes("сегодня")) return { ok: true, localDate: today, explicit: true };

  const parsed = parseExplicitLocalDate(lower, today);
  if (parsed.error) {
    return { ok: false, localDate: today, explicit: true, reason: "invalid", dateText };
  }
  if (!parsed.localDate) {
    return { ok: false, localDate: today, explicit: true, reason: "unsupported", dateText };
  }
  if (parsed.localDate > today) {
    return { ok: false, localDate: today, explicit: true, reason: "future", dateText, parsedDate: parsed.localDate };
  }
  return { ok: true, localDate: parsed.localDate, explicit: true };
}

function parseExplicitLocalDate(lower, today) {
  const iso = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return buildLocalDate(Number(iso[3]), Number(iso[2]), Number(iso[1]), today, true);

  const monthPattern = DATE_MONTH_WORDS.join("|");
  const monthMatch = lower.match(new RegExp(`(?:^|[^\\p{L}\\p{N}])(\\d{1,2})\\s+(${monthPattern})(?:\\s+((?:19|20)\\d{2}))?`, "iu"));
  if (monthMatch) {
    return buildLocalDate(
      Number(monthMatch[1]),
      DATE_MONTH_INDEX.get(monthMatch[2].toLowerCase().replaceAll("ё", "е")),
      monthMatch[3] ? normalizeDateYear(monthMatch[3]) : null,
      today,
      Boolean(monthMatch[3])
    );
  }

  const dotted = lower.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/);
  if (dotted) {
    return buildLocalDate(
      Number(dotted[1]),
      Number(dotted[2]),
      dotted[3] ? normalizeDateYear(dotted[3]) : null,
      today,
      Boolean(dotted[3])
    );
  }

  return { localDate: null };
}

function buildLocalDate(day, month, year, today, explicitYear) {
  if (!Number.isInteger(day) || !Number.isInteger(month) || day < 1 || day > 31 || month < 1 || month > 12) {
    return { error: true };
  }
  const candidateYear = explicitYear ? year : Number(today.slice(0, 4));
  if (!Number.isInteger(candidateYear) || candidateYear < 1900 || candidateYear > 2100) return { error: true };

  let localDate = formatYmd(candidateYear, month, day);
  if (!normalizeLocalDate(localDate)) return { error: true };
  if (!explicitYear && localDate > today) {
    localDate = formatYmd(candidateYear - 1, month, day);
    if (!normalizeLocalDate(localDate)) return { error: true };
  }
  return { localDate };
}

function normalizeDateYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year)) return null;
  return year < 100 ? 2000 + year : year;
}

function formatYmd(year, month, day) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

function extractDateText(text) {
  const source = String(text || "").toLowerCase().replaceAll("ё", "е");
  if (source.includes("позавчера")) return "позавчера";
  if (source.includes("вчера")) return "вчера";
  if (source.includes("сегодня")) return "сегодня";

  const monthPattern = DATE_MONTH_WORDS.join("|");
  const monthMatch = source.match(new RegExp(`(?:^|[^\\p{L}\\p{N}])(\\d{1,2})\\s+(${monthPattern})(?:\\s+((?:19|20)\\d{2}))?`, "iu"));
  if (monthMatch) return [monthMatch[1], monthMatch[2], monthMatch[3]].filter(Boolean).join(" ");
  const iso = source.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (iso) return iso[0];
  const dotted = source.match(/\b\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?\b/);
  if (dotted) return dotted[0];
  return null;
}

function getLocalYmd(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function addDaysYmd(ymd, days) {
  const date = new Date(`${ymd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function startOfWeekYmd(ymd) {
  const date = new Date(`${ymd}T00:00:00Z`);
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + mondayOffset);
  return date.toISOString().slice(0, 10);
}

function extractAmount(text) {
  const source = String(text || "").toLowerCase();
  const matches = [...source.matchAll(/(?:^|[^\p{L}\p{N}])(\d{1,3}(?:[\s.]\d{3})+|\d+)(?:[,.](\d{1,2}))?(?=\s*(?:₸|тг|тенге|kzt|usd|eur|rub|руб|₽|\$|€)?(?:$|[^\p{L}\p{N}]|[a-zа-яё]))/giu)];
  const candidates = [];
  for (const match of matches) {
    const numberStart = match.index + match[0].search(/\d/);
    const numberEnd = numberStart + match[1].length + (match[2] ? match[0].slice(match[0].search(/\d/) + match[1].length).indexOf(match[2]) + match[2].length : 0);
    const before = source.slice(Math.max(0, numberStart - 18), numberStart);
    const after = source.slice(numberEnd, numberEnd + 24);
    if (isNumericDateAt(source, numberStart)) continue;
    if (isDateOrPeriodNumber(before, after)) continue;
    const normalized = match[1].replace(/[\s.]/g, "");
    const decimal = match[2] ? `.${match[2]}` : "";
    const value = Number(`${normalized}${decimal}`);
    if (Number.isFinite(value) && value > 0) candidates.push(value);
  }
  return candidates.length ? candidates[candidates.length - 1] : null;
}

function isDateOrPeriodNumber(before, after) {
  const tail = String(after || "").trimStart();
  const head = String(before || "");
  const nextWord = tail.match(/^[а-яёa-z.]+/i)?.[0] || "";
  if (DATE_MONTH_WORDS.includes(nextWord)) return true;
  if (/^(день|дня|дней|дн\.?|неделя|недели|недель|месяц|месяца|месяцев)$/i.test(nextWord)) {
    return /(за|последние|последних)\s*$/i.test(head) || true;
  }
  if (/\b(за|с|от)\s*$/i.test(head) && DATE_MONTH_WORDS.includes(nextWord)) return true;
  return false;
}

function isNumericDateAt(source, numberStart) {
  const numericDates = source.matchAll(/\d{4}-\d{2}-\d{2}|\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?/g);
  for (const match of numericDates) {
    const start = match.index;
    const end = start + match[0].length;
    if (numberStart < start || numberStart >= end) continue;
    if (isValidNumericDateToken(match[0])) return true;
  }
  return false;
}

function isValidNumericDateToken(token) {
  const iso = token.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return Boolean(normalizeLocalDate(`${iso[1]}-${iso[2]}-${iso[3]}`));

  const dotted = token.match(/^(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?$/);
  if (!dotted) return false;
  const year = dotted[3] ? normalizeDateYear(dotted[3]) : 2000;
  return Boolean(buildLocalDate(Number(dotted[1]), Number(dotted[2]), year, "2000-12-31", true).localDate);
}

function toMinor(amount) {
  return Math.round(Number(amount) * 100);
}

function minorToNumber(amountMinor) {
  return Number(amountMinor || 0) / 100;
}

function formatAmount(amountMinor, currency) {
  const amount = minorToNumber(amountMinor);
  const hasDecimals = Math.abs(amount % 1) > 0;
  return `${amount.toLocaleString("ru-RU", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })} ${escapeHtml(currency || "KZT")}`;
}

function normalizeCurrency(currency) {
  const value = String(currency || ONLY_SUPPORTED_CURRENCY).trim().toUpperCase();
  if (["₸", "ТГ", "ТЕНГЕ"].includes(value)) return "KZT";
  if (["$", "USD"].includes(value)) return "USD";
  if (["€", "EUR"].includes(value)) return "EUR";
  if (["₽", "RUB"].includes(value)) return "RUB";
  return value || ONLY_SUPPORTED_CURRENCY;
}

function isSupportedCurrency(currency) {
  return normalizeCurrency(currency) === ONLY_SUPPORTED_CURRENCY;
}

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function limitText(value, maxLength) {
  if (!value) return null;
  const text = String(value).trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim();
}

function escapeSqlLike(value) {
  return String(value || "").replace(/[\\%_]/g, (char) => `\\${char}`);
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bearerToken(value) {
  const match = String(value || "").match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function noStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

function splitTelegramText(text) {
  const chunks = [];
  let rest = text;
  while (rest.length > 3900) {
    chunks.push(rest.slice(0, 3900));
    rest = rest.slice(3900);
  }
  chunks.push(rest);
  return chunks;
}

function json(payload, init = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    ...init,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(init.headers || {})
    }
  });
}

function html(markup, init = {}) {
  return new Response(markup, {
    ...init,
    headers: {
      ...HTML_SECURITY_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...(init.headers || {})
    }
  });
}

async function validateTelegramInitData(initData, botToken) {
  if (!botToken) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, error: "Telegram hash is missing" };

  params.delete("hash");
  const authDate = Number(params.get("auth_date") || 0);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!authDate || nowSeconds - authDate > 86400 || authDate - nowSeconds > 60) {
    return { ok: false, error: "Telegram init data expired" };
  }

  const pairs = [];
  for (const [key, value] of params.entries()) {
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();

  const dataCheckString = pairs.join("\n");
  const secretKey = await hmacSha256("WebAppData", botToken);
  const calculatedHash = toHex(await hmacSha256(secretKey, dataCheckString));
  if (!timingSafeEqualHex(calculatedHash, hash)) {
    return { ok: false, error: "Telegram init data is invalid" };
  }

  const userRaw = params.get("user");
  if (!userRaw) return { ok: false, error: "Telegram user is missing" };

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return { ok: false, error: "Telegram user is invalid" };
  }
  if (!user || !user.id) return { ok: false, error: "Telegram user is invalid" };
  return { ok: true, user };
}

async function hmacSha256(key, data) {
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

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a, b) {
  const left = String(a || "").toLowerCase();
  const right = String(b || "").toLowerCase();
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function timingSafeEqualString(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return diff === 0;
}

export const __testables = {
  extractAmount,
  extractDateText,
  fallbackClassify,
  mergeCanonicalCategoryRows,
  matchMerchantCategory,
  normalizeIntent,
  normalizeStatementImportItem,
  normalizeStatementKind,
  parseStatementAmountText,
  resolveLocalDate,
  resolveLocalDateInfo,
  resolveCanonicalCategory,
  normalizeCurrency,
  isSupportedCurrency,
  isPdfTelegramDocument,
  statementPdfMaxBytes,
  escapeHtml,
  csvCell,
  softDelete,
  restoreTransaction,
  bearerToken,
  timingSafeEqualString
};

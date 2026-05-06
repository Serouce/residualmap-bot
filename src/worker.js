import { miniAppHtml as renderMiniAppHtml } from "./mini-app.js";

const TELEGRAM_API = "https://api.telegram.org/bot";
const ONLY_SUPPORTED_CURRENCY = "KZT";
const UPDATE_PROCESSING_STALE_MS = 10 * 60 * 1000;
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
    patterns: [/такси/i, /яндекс/i, /uber/i, /bolt/i, /indrive/i, /индрайв/i]
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
      allowed_updates: ["message"],
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
    debts
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
  const message = update.message;
  if (!message || !message.chat || !message.from) return;

  const chatId = String(message.chat.id);
  const telegramUserId = String(message.from.id);
  const text = (message.text || message.caption || "").trim();

  if (!text) {
    await sendMessage(env, chatId, "Пока я понимаю только текст. Голос и чеки добавим позже.");
    return;
  }

  if (text.length > 600) {
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

    const inserted = await insertTransaction(env, {
      updateId,
      user,
      chatId,
      intent,
      rawText: text
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
    "<code>продукты 6200</code>",
    "<code>дал сестре 5000 в долг</code>",
    "<code>сестра вернула 2000</code>",
    "<code>зарплата 350000</code>",
    "<code>сколько потратил за неделю?</code>",
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
    "Правила:",
    "- '1400 такси' это expense, Транспорт > Такси.",
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
  return {
    kind,
    amount,
    currency: inferCurrency(lower),
    category: category.category,
    subcategory: category.subcategory,
    counterparty: inferCounterparty(lower),
    description: text,
    date_text: lower.includes("вчера") ? "вчера" : null,
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

  const haystack = `${rawText || ""} ${category || ""} ${subcategory || ""}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }

  const inferred = inferCategory(String(rawText || "").toLowerCase(), kind);
  return {
    category: limitText(cleanText(category) || inferred.category || "Прочее", 40),
    subcategory: limitText(cleanText(subcategory) || inferred.subcategory || "Без категории", 40)
  };
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

async function insertTransaction(env, { updateId, user, chatId, intent, rawText }) {
  const now = new Date();
  const timezone = user.timezone || env.DEFAULT_TIMEZONE || "Asia/Qyzylorda";
  const localDate = resolveLocalDate(intent.date_text, timezone, now);
  const amountMinor = toMinor(intent.amount);
  const nowIso = now.toISOString();

  const existing = await env.DB.prepare(
    `SELECT id, kind, amount_minor, currency, category, subcategory, counterparty, description, local_date
    FROM transactions
    WHERE telegram_update_id = ? AND user_id = ?`
  )
    .bind(updateId, user.id)
    .first();
  if (existing) return existing;

  const searchText = buildTransactionSearchText({
    kind: intent.kind,
    amount_minor: amountMinor,
    currency: intent.currency || user.currency,
    category: intent.category,
    subcategory: intent.subcategory,
    counterparty: intent.counterparty,
    description: intent.description,
    raw_text: rawText,
    local_date: localDate
  });

  const row = await env.DB.prepare(
    `INSERT INTO transactions (
      telegram_update_id, user_id, chat_id, kind, amount_minor, currency,
      category, subcategory, counterparty, description, raw_text,
      occurred_at, local_date, metadata_json, search_text, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      searchText,
      nowIso,
      nowIso
    )
    .first();

  await audit(env, user.id, row.id, "create", row);
  return row;
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
  return env.MINI_APP_URL || "https://residualmap-bot.residualmap.workers.dev/app";
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
      LIMIT 8`
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
      LIMIT 10`
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
    categories: categories.results || [],
    category_totals: categoryTotals.results || [],
    by_day: byDay.results || [],
    largest_expenses: largestExpenses.results || [],
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
  return rows.results || [];
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
    const normalizedPattern = `%${escapeSqlLike(normalizeSearchText(query))}%`;
    conditions.push(`(
      search_text LIKE ? ESCAPE '\\' OR
      description LIKE ? ESCAPE '\\' OR
      raw_text LIKE ? ESCAPE '\\' OR
      category LIKE ? ESCAPE '\\' OR
      subcategory LIKE ? ESCAPE '\\' OR
      counterparty LIKE ? ESCAPE '\\'
    )`);
    binds.push(normalizedPattern, pattern, pattern, pattern, pattern, pattern);
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
    items: items.results || [],
    categories: (categories.results || []).map((row) => row.category).filter(Boolean)
  };
}

async function getTransactionById(env, userId, id) {
  return env.DB.prepare(
    `SELECT id, local_date, kind, amount_minor, currency, category, subcategory, counterparty, description, raw_text, status, deleted_at, created_at, updated_at
    FROM transactions
    WHERE user_id = ? AND id = ?`
  )
    .bind(userId, id)
    .first();
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
  const category = normalizeCategory({
    rawText,
    kind,
    category: categoryInput,
    subcategory: subcategoryInput
  });
  const counterparty = limitText(cleanText(body.counterparty), 60);
  const amountMinor = toMinor(amount);
  const now = new Date().toISOString();
  const searchText = buildTransactionSearchText({
    kind,
    amount_minor: amountMinor,
    currency: row.currency || ONLY_SUPPORTED_CURRENCY,
    category: category.category,
    subcategory: category.subcategory,
    counterparty,
    description,
    raw_text: rawText,
    local_date: localDate
  });

  const result = await env.DB.prepare(
    `UPDATE transactions
    SET kind = ?, amount_minor = ?, category = ?, subcategory = ?, counterparty = ?,
      description = ?, raw_text = ?, local_date = ?, search_text = ?, updated_at = ?
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
      searchText,
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
  const today = getLocalYmd(now, timezone);
  const lower = String(dateText || "").toLowerCase();
  if (lower.includes("позавчера")) return addDaysYmd(today, -2);
  if (lower.includes("вчера")) return addDaysYmd(today, -1);
  return today;
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

function buildTransactionSearchText(row) {
  return normalizeSearchText([
    row.id,
    row.local_date,
    row.kind,
    KIND_LABELS[row.kind],
    row.amount_minor ? minorToNumber(row.amount_minor) : null,
    row.currency,
    row.category,
    row.subcategory,
    row.counterparty,
    row.description,
    row.raw_text
  ].filter((value) => value !== null && value !== undefined).join(" "));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
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
  fallbackClassify,
  normalizeSearchText,
  normalizeIntent,
  normalizeCurrency,
  isSupportedCurrency,
  bearerToken,
  timingSafeEqualString
};

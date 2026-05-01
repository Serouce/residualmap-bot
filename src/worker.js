const TELEGRAM_API = "https://api.telegram.org/bot";

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
        return html(miniAppHtml());
      }
      if (url.pathname === "/admin/set-webhook") {
        return handleSetWebhook(url, env);
      }
      if (url.pathname === "/admin/webhook-info") {
        return handleWebhookInfo(url, env);
      }
      if (url.pathname === "/admin/delete-webhook") {
        return handleDeleteWebhook(url, env);
      }
      return json({
        ok: true,
        service: "residualmap-bot",
        time: new Date().toISOString()
      });
    }

    if (request.method === "POST" && url.pathname === "/api/app-data") {
      return handleMiniAppData(request, env);
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const expectedSecret = env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret) {
      const actualSecret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (actualSecret !== expectedSecret) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    if (url.pathname !== "/telegram") {
      return new Response("Not found", { status: 404 });
    }

    const update = await request.json().catch(() => null);
    if (!update) {
      return new Response("Bad request", { status: 400 });
    }

    ctx.waitUntil(handleTelegramUpdate(update, env));
    return new Response("OK");
  }
};

async function handleSetWebhook(url, env) {
  const auth = requireSetupToken(url, env);
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

async function handleWebhookInfo(url, env) {
  const auth = requireSetupToken(url, env);
  if (auth) return auth;

  const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
  const data = await response.json().catch(() => ({}));
  return json({ ok: response.ok, telegram: data }, { status: response.ok ? 200 : 502 });
}

async function handleDeleteWebhook(url, env) {
  const auth = requireSetupToken(url, env);
  if (auth) return auth;

  const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drop_pending_updates: false })
  });
  const data = await response.json().catch(() => ({}));
  return json({ ok: response.ok && data.ok === true, telegram: data }, { status: response.ok ? 200 : 502 });
}

async function handleMiniAppData(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.initData !== "string") {
    return json({ ok: false, error: "Mini App init data is required" }, { status: 401 });
  }

  const validation = await validateTelegramInitData(body.initData, env.TELEGRAM_BOT_TOKEN);
  if (!validation.ok) {
    return json({ ok: false, error: validation.error }, { status: 401 });
  }

  const telegramUserId = String(validation.user.id);
  if (!isAllowed(env, telegramUserId)) {
    return json({ ok: false, error: "Access denied" }, { status: 403 });
  }

  const user = await upsertUser(env, validation.user);
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

function requireSetupToken(url, env) {
  if (!env.SETUP_TOKEN) {
    return json({ ok: false, error: "SETUP_TOKEN is not configured" }, { status: 500 });
  }
  if (url.searchParams.get("token") !== env.SETUP_TOKEN) {
    return json({ ok: false, error: "Unauthorized" }, { status: 401 });
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
  const isNew = await markUpdateProcessed(env, updateId);
  if (!isNew) return;

  if (text === "/id" || text.startsWith("/id@")) {
    await sendMessage(env, chatId, `Ваш Telegram ID: <code>${escapeHtml(telegramUserId)}</code>`);
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
    return;
  }

  const user = await upsertUser(env, message.from);

  try {
    if (text.startsWith("/")) {
      await handleCommand(env, { chatId, user, text });
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
      return;
    }

    if (!TRANSACTION_KINDS.has(intent.kind) || !intent.amount || intent.amount <= 0) {
      await sendMessage(
        env,
        chatId,
        "Я не смог уверенно понять сумму и тип операции. Пример: <code>1400 такси</code> или <code>дал сестре 5000 в долг</code>."
      );
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
  } catch (error) {
    console.error("update failed", error);
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

  const looksLikeAnalytics = /(сколько|аналитик|потратил|траты|расходы|за день|сегодня|вчера|за неделю|недел|последние 7|7 дней|за месяц|месяц)/i.test(lower);
  const amountLooksLikePeriod = /(последние\s+7|7\s+дней)/i.test(lower);
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
  if (/^(вернул|вернула|отдал|отдала)/i.test(lower) && /(долг|другу|сестре|маме)/i.test(lower)) kind = "borrow_repayment";

  const category = inferCategory(lower, kind);
  return {
    kind,
    amount,
    currency: null,
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
    currency: normalizeCurrency(intent.currency || env.DEFAULT_CURRENCY || "KZT"),
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

async function insertTransaction(env, { updateId, user, chatId, intent, rawText }) {
  const now = new Date();
  const timezone = user.timezone || env.DEFAULT_TIMEZONE || "Asia/Qyzylorda";
  const localDate = resolveLocalDate(intent.date_text, timezone, now);
  const amountMinor = toMinor(intent.amount);
  const nowIso = now.toISOString();

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
  const totals = await env.DB.prepare(
    `SELECT
      currency,
      COUNT(*) AS transaction_count,
      COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_minor ELSE 0 END), 0) AS expense_minor,
      COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_minor ELSE 0 END), 0) AS income_minor,
      COALESCE(SUM(CASE WHEN kind = 'loan_out' THEN amount_minor ELSE 0 END), 0) AS loan_out_minor,
      COALESCE(SUM(CASE WHEN kind = 'loan_repayment' THEN amount_minor ELSE 0 END), 0) AS loan_repayment_minor,
      COALESCE(SUM(CASE WHEN kind = 'borrow_in' THEN amount_minor ELSE 0 END), 0) AS borrow_in_minor,
      COALESCE(SUM(CASE WHEN kind = 'borrow_repayment' THEN amount_minor ELSE 0 END), 0) AS borrow_repayment_minor
    FROM transactions
    WHERE user_id = ? AND status = 'active' AND local_date BETWEEN ? AND ?
    GROUP BY currency
    ORDER BY currency`
  )
    .bind(userId, bounds.start, bounds.end)
    .all();

  const categories = await env.DB.prepare(
    `SELECT
      currency,
      COALESCE(category, 'Прочее') AS category,
      COALESCE(subcategory, 'Без категории') AS subcategory,
      SUM(amount_minor) AS amount_minor,
      COUNT(*) AS count
    FROM transactions
    WHERE user_id = ? AND status = 'active' AND kind = 'expense' AND local_date BETWEEN ? AND ?
    GROUP BY currency, category, subcategory
    ORDER BY amount_minor DESC
    LIMIT 8`
  )
    .bind(userId, bounds.start, bounds.end)
    .all();

  const categoryTotals = await env.DB.prepare(
    `SELECT
      currency,
      COALESCE(category, 'Прочее') AS category,
      SUM(amount_minor) AS amount_minor,
      COUNT(*) AS count
    FROM transactions
    WHERE user_id = ? AND status = 'active' AND kind = 'expense' AND local_date BETWEEN ? AND ?
    GROUP BY currency, category
    ORDER BY amount_minor DESC
    LIMIT 10`
  )
    .bind(userId, bounds.start, bounds.end)
    .all();

  const byDay = await env.DB.prepare(
    `SELECT
      local_date,
      currency,
      COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_minor ELSE 0 END), 0) AS expense_minor,
      COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_minor ELSE 0 END), 0) AS income_minor,
      COALESCE(SUM(CASE WHEN kind = 'loan_out' THEN amount_minor ELSE 0 END), 0) AS loan_out_minor,
      COALESCE(SUM(CASE WHEN kind = 'borrow_in' THEN amount_minor ELSE 0 END), 0) AS borrow_in_minor,
      COUNT(*) AS count
    FROM transactions
    WHERE user_id = ? AND status = 'active' AND local_date BETWEEN ? AND ?
    GROUP BY local_date, currency
    ORDER BY local_date, currency`
  )
    .bind(userId, bounds.start, bounds.end)
    .all();

  const largestExpenses = await env.DB.prepare(
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
    WHERE user_id = ? AND status = 'active' AND kind = 'expense' AND local_date BETWEEN ? AND ?
    ORDER BY amount_minor DESC
    LIMIT 5`
  )
    .bind(userId, bounds.start, bounds.end)
    .all();

  const totalsByCurrency = totals.results || [];
  const transactionCount = totalsByCurrency.reduce((sum, row) => sum + Number(row.transaction_count || 0), 0);

  return {
    period: bounds,
    transaction_count: transactionCount,
    totals_by_currency: totalsByCurrency,
    categories: categories.results || [],
    category_totals: categoryTotals.results || [],
    by_day: byDay.results || [],
    largest_expenses: largestExpenses.results || []
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

  if (!summary.transaction_count) {
    lines.push("");
    lines.push("За этот период пока нет записей.");
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

  await softDelete(env, user.id, row.id, "undo");
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

  await softDelete(env, user.id, id, "delete");
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

  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE transactions
    SET status = 'active', deleted_at = NULL, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'deleted'`
  )
    .bind(now, user.id, id)
    .run();
  await audit(env, user.id, id, "restore", { restored_at: now });

  await sendMessage(
    env,
    chatId,
    `Восстановил запись <code>${row.id}</code>: ${escapeHtml(KIND_LABELS[row.kind] || row.kind)}, ${formatAmount(row.amount_minor, row.currency)}.`
  );
}

async function softDelete(env, userId, transactionId, action) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE transactions
    SET status = 'deleted', deleted_at = ?, updated_at = ?
    WHERE user_id = ? AND id = ? AND status = 'active'`
  )
    .bind(now, now, userId, transactionId)
    .run();
  await audit(env, userId, transactionId, action, { deleted_at: now });
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
      SET username = ?, first_name = ?, last_name = ?, updated_at = ?
      WHERE telegram_user_id = ?`
    )
      .bind(from.username || null, from.first_name || null, from.last_name || null, now, telegramUserId)
      .run();
    return existing;
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
      env.DEFAULT_CURRENCY || "KZT",
      now,
      now
    )
    .first();

  await audit(env, row.id, null, "user_create", { telegram_user_id: telegramUserId });
  return row;
}

async function markUpdateProcessed(env, updateId) {
  const result = await env.DB.prepare("INSERT OR IGNORE INTO processed_updates (update_id, processed_at) VALUES (?, ?)")
    .bind(updateId, new Date().toISOString())
    .run();
  return (result.meta?.changes ?? 1) > 0;
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

function normalizePeriod(period) {
  const value = String(period || "month");
  if (["today", "yesterday", "week", "month", "last_7_days", "last_30_days"].includes(value)) return value;
  return "month";
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
  const match = text.match(/(?:^|\s)(\d{1,3}(?:[\s.,]\d{3})+|\d+)(?:[,.](\d{1,2}))?(?:\s|$)/);
  if (!match) return null;
  const normalized = match[1].replace(/[\s.]/g, "").replace(",", ".");
  const decimal = match[2] ? `.${match[2]}` : "";
  const value = Number(`${normalized}${decimal}`);
  return Number.isFinite(value) ? value : null;
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
  const value = String(currency || "KZT").trim().toUpperCase();
  if (["₸", "ТГ", "ТЕНГЕ"].includes(value)) return "KZT";
  if (["$", "USD"].includes(value)) return "USD";
  if (["€", "EUR"].includes(value)) return "EUR";
  if (["₽", "RUB"].includes(value)) return "RUB";
  return value || "KZT";
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
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {})
    }
  });
}

function html(markup, init = {}) {
  return new Response(markup, {
    ...init,
    headers: {
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

function miniAppHtml() {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>ResidualMap</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    :root {
      color-scheme: light;
      --page: #f6f1e9;
      --page-2: #edf7f2;
      --ink: #18212f;
      --muted: #738093;
      --soft: rgba(255, 255, 255, 0.78);
      --solid: #ffffff;
      --line: rgba(40, 51, 69, 0.10);
      --shadow: 0 22px 60px rgba(45, 51, 70, 0.13);
      --lavender: #8b7cf6;
      --mint: #64c3a0;
      --rose: #f07f9a;
      --peach: #f3b477;
      --sky: #7db7f0;
      --plum: #9d7bd8;
      --amber: #d99f3d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      background:
        radial-gradient(circle at 12% -8%, rgba(139, 124, 246, 0.25), transparent 34%),
        radial-gradient(circle at 92% 5%, rgba(100, 195, 160, 0.26), transparent 30%),
        linear-gradient(135deg, var(--page) 0%, var(--page-2) 100%);
      font: 15px/1.42 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .app {
      width: min(1040px, 100%);
      margin: 0 auto;
      padding: 18px 14px max(28px, env(safe-area-inset-bottom));
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .mark {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: linear-gradient(135deg, #ffffff, #e9fff5);
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: var(--shadow);
      color: #2c7b63;
      font-weight: 850;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 850;
      letter-spacing: 0;
    }
    .brand-sub {
      color: var(--muted);
      font-size: 12px;
      margin-top: 1px;
      overflow-wrap: anywhere;
    }
    .ghost {
      min-height: 36px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.66);
      color: var(--ink);
      padding: 8px 11px;
      font: inherit;
      font-weight: 680;
      box-shadow: 0 8px 22px rgba(45, 51, 70, 0.08);
    }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.65fr);
      gap: 12px;
      margin-bottom: 12px;
    }
    .hero-main, .hero-side, .panel, .insight {
      border: 1px solid rgba(255, 255, 255, 0.72);
      border-radius: 8px;
      background: var(--soft);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }
    .hero-main {
      position: relative;
      overflow: hidden;
      padding: 20px;
      min-height: 174px;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 238, 255, 0.68)),
        radial-gradient(circle at 90% 12%, rgba(240, 127, 154, 0.22), transparent 34%);
    }
    .hero-main:after {
      content: "";
      position: absolute;
      right: -56px;
      bottom: -72px;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      border: 34px solid rgba(125, 183, 240, 0.14);
    }
    .eyebrow {
      color: #68758a;
      font-size: 12px;
      font-weight: 760;
      text-transform: uppercase;
      letter-spacing: 0;
    }
    h1 {
      position: relative;
      z-index: 1;
      margin: 8px 0 4px;
      font-size: 44px;
      line-height: 1;
      letter-spacing: 0;
    }
    .hero-meta {
      position: relative;
      z-index: 1;
      color: var(--muted);
      font-size: 13px;
      max-width: 620px;
    }
    .hero-side {
      display: grid;
      align-content: space-between;
      gap: 16px;
      padding: 18px;
      background: linear-gradient(160deg, rgba(29, 39, 57, 0.93), rgba(50, 44, 78, 0.9));
      color: #ffffff;
    }
    .side-label {
      color: rgba(255, 255, 255, 0.66);
      font-size: 12px;
      font-weight: 720;
    }
    .side-value {
      font-size: 24px;
      font-weight: 850;
      margin-top: 4px;
      overflow-wrap: anywhere;
    }
    .side-note {
      color: rgba(255, 255, 255, 0.66);
      font-size: 12px;
    }
    .periods {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin: 12px 0;
    }
    .periods button {
      min-height: 44px;
      border: 1px solid rgba(40, 51, 69, 0.11);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.68);
      color: var(--ink);
      font: inherit;
      font-weight: 760;
      box-shadow: 0 8px 20px rgba(45, 51, 70, 0.06);
    }
    .periods button.active {
      border-color: transparent;
      background: linear-gradient(135deg, var(--lavender), #b69df7);
      color: #ffffff;
    }
    .insights {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 12px;
    }
    .insight {
      padding: 13px;
      min-width: 0;
    }
    .label {
      color: var(--muted);
      font-size: 12px;
      font-weight: 680;
      margin-bottom: 5px;
    }
    .value {
      font-size: 18px;
      font-weight: 850;
      overflow-wrap: anywhere;
    }
    .hint {
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
      overflow-wrap: anywhere;
    }
    .dashboard {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
      gap: 12px;
    }
    .panel {
      padding: 16px;
      min-width: 0;
    }
    .wide { grid-column: span 2; }
    .panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .panel h2 {
      margin: 0;
      font-size: 17px;
      letter-spacing: 0;
    }
    .panel-caption {
      color: var(--muted);
      font-size: 12px;
      margin-top: 3px;
    }
    .chart-wrap {
      min-height: 260px;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
      color: var(--muted);
      font-size: 12px;
    }
    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--lavender);
    }
    .dot.income { background: var(--mint); }
    .dot.expense { background: var(--rose); }
    .category-layout {
      display: grid;
      grid-template-columns: 158px 1fr;
      gap: 16px;
      align-items: center;
    }
    .donut {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      margin: 0 auto;
      box-shadow: inset 0 0 0 1px rgba(40, 51, 69, 0.08);
    }
    .donut-core {
      width: 92px;
      height: 92px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      text-align: center;
      padding: 9px;
      font-size: 11px;
      color: var(--muted);
    }
    .donut-core strong {
      display: block;
      color: var(--ink);
      font-size: 13px;
      margin-top: 2px;
      overflow-wrap: anywhere;
    }
    .list {
      display: grid;
      gap: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      padding: 10px 0;
      border-top: 1px solid var(--line);
    }
    .row:first-child { border-top: 0; padding-top: 0; }
    .title { font-weight: 760; overflow-wrap: anywhere; }
    .meta { color: var(--muted); font-size: 12px; margin-top: 2px; overflow-wrap: anywhere; }
    .amount { font-weight: 850; white-space: nowrap; }
    .expense { color: #c85072; }
    .income { color: #32876a; }
    .debt { color: #b87920; }
    .progress {
      height: 7px;
      border-radius: 999px;
      background: rgba(40, 51, 69, 0.08);
      overflow: hidden;
      margin-top: 7px;
    }
    .progress-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--lavender), var(--rose));
    }
    .empty, .error {
      min-height: 132px;
      display: grid;
      place-items: center;
      color: var(--muted);
      text-align: center;
      padding: 22px;
      border: 1px dashed rgba(40, 51, 69, 0.16);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.42);
    }
    .error { color: #c85072; }
    .skeleton {
      min-height: 96px;
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(255,255,255,0.44), rgba(255,255,255,0.78), rgba(255,255,255,0.44));
      background-size: 200% 100%;
      animation: shine 1.4s infinite linear;
    }
    @keyframes shine {
      from { background-position: 0 0; }
      to { background-position: -200% 0; }
    }
    @media (max-width: 820px) {
      .hero, .dashboard, .category-layout { grid-template-columns: 1fr; }
      .wide { grid-column: span 1; }
      .insights { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 520px) {
      .app { padding: 14px 10px max(24px, env(safe-area-inset-bottom)); }
      .topbar { align-items: flex-start; }
      .ghost { padding: 8px 9px; }
      h1 { font-size: 32px; }
      .hero-main { padding: 16px; min-height: 150px; }
      .periods { gap: 6px; }
      .periods button { min-height: 42px; padding: 8px 5px; }
      .insights { gap: 8px; }
      .panel { padding: 13px; }
      .row { grid-template-columns: 1fr; gap: 3px; }
      .amount { white-space: normal; }
    }
  </style>
</head>
<body>
  <main class="app">
    <header class="topbar">
      <div class="brand">
        <div class="mark">R</div>
        <div>
          <div class="brand-title">ResidualMap</div>
          <div class="brand-sub" id="profile">Загрузка данных...</div>
        </div>
      </div>
      <button class="ghost" id="refresh">Обновить</button>
    </header>

    <section class="hero">
      <div class="hero-main">
        <div class="eyebrow" id="periodName">Месяц</div>
        <h1 id="heroSpend">0 KZT</h1>
        <div class="hero-meta" id="heroMeta">Расходы за выбранный период</div>
      </div>
      <aside class="hero-side">
        <div>
          <div class="side-label">Баланс периода</div>
          <div class="side-value" id="netFlow">0 KZT</div>
        </div>
        <div class="side-note" id="sideNote">Доходы минус расходы. Долги показаны отдельно.</div>
      </aside>
    </section>

    <nav class="periods" id="periods">
      <button data-period="today">Сегодня</button>
      <button data-period="week">Неделя</button>
      <button data-period="last_30_days">30 дней</button>
      <button data-period="month" class="active">Месяц</button>
    </nav>

    <section class="insights" id="insights">
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </section>

    <section class="dashboard">
      <section class="panel wide">
        <div class="panel-head">
          <div>
            <h2>Динамика</h2>
            <div class="panel-caption">Расходы и доходы по дням</div>
          </div>
          <div class="panel-caption" id="rangeLabel"></div>
        </div>
        <div class="chart-wrap" id="dailyChart"></div>
        <div class="legend">
          <span><i class="dot expense"></i>Расходы</span>
          <span><i class="dot income"></i>Доходы</span>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Категории</h2>
            <div class="panel-caption">Куда ушли деньги</div>
          </div>
        </div>
        <div class="category-layout">
          <div>
            <div class="donut" id="donut">
              <div class="donut-core">Всего<strong id="donutTotal">0 KZT</strong></div>
            </div>
          </div>
          <div class="list" id="categoryTotals"></div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Детализация</h2>
            <div class="panel-caption">Подкатегории расходов</div>
          </div>
        </div>
        <div class="list" id="categories"></div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Крупные траты</h2>
            <div class="panel-caption">Самые заметные списания</div>
          </div>
        </div>
        <div class="list" id="largest"></div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Долги</h2>
            <div class="panel-caption">Кто кому должен</div>
          </div>
        </div>
        <div class="list" id="debts"></div>
      </section>

      <section class="panel wide">
        <div class="panel-head">
          <div>
            <h2>Последние записи</h2>
            <div class="panel-caption">Для проверки и удаления по ID</div>
          </div>
        </div>
        <div class="list" id="recent"></div>
      </section>
    </section>
  </main>

  <script>
    const tg = window.Telegram && window.Telegram.WebApp;
    const colors = ["#8b7cf6", "#64c3a0", "#f07f9a", "#f3b477", "#7db7f0", "#9d7bd8", "#d99f3d", "#76c6d1", "#c9a66b", "#a3c47a"];
    const state = { period: "month", data: null };

    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.MainButton) tg.MainButton.hide();
    }

    document.getElementById("periods").addEventListener("click", function(event) {
      const button = event.target.closest("button[data-period]");
      if (!button) return;
      state.period = button.dataset.period;
      for (const item of document.querySelectorAll("#periods button")) {
        item.classList.toggle("active", item === button);
      }
      load();
    });

    document.getElementById("refresh").addEventListener("click", load);

    function money(minor, currency) {
      const amount = Number(minor || 0) / 100;
      return amount.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " " + (currency || "KZT");
    }

    function primaryCurrency(summary, user) {
      const totals = summary.totals_by_currency || [];
      const preferred = totals.find(function(item) { return item.currency === user.currency; });
      return (preferred || totals[0] || { currency: user.currency || "KZT" }).currency;
    }

    function selectedTotal(summary, currency) {
      return (summary.totals_by_currency || []).find(function(item) { return item.currency === currency; }) || {};
    }

    function render(data) {
      const user = data.user;
      const summary = data.summary;
      const currency = primaryCurrency(summary, user);
      const total = selectedTotal(summary, currency);
      const expense = Number(total.expense_minor || 0);
      const income = Number(total.income_minor || 0);
      const loanOut = Number(total.loan_out_minor || 0);
      const net = income - expense;
      const periodDays = dayCount(summary.period.start, summary.period.end);
      const activeDays = buildDailySeries(summary, currency).filter(function(item) { return item.expense_minor > 0; }).length;
      const topCategory = firstForCurrency(summary.category_totals || [], currency);
      const largest = firstForCurrency(summary.largest_expenses || [], currency);

      document.getElementById("profile").textContent = (user.currency || "KZT") + " · " + (user.timezone || "Asia/Qyzylorda");
      document.getElementById("periodName").textContent = summary.period.label;
      document.getElementById("heroSpend").textContent = money(expense, currency);
      document.getElementById("heroMeta").textContent = "Расходы за период · " + formatRange(summary.period.start, summary.period.end) + " · " + plural(Number(summary.transaction_count || 0), "запись", "записи", "записей");
      document.getElementById("netFlow").textContent = (net >= 0 ? "+" : "") + money(net, currency);
      document.getElementById("sideNote").textContent = loanOut > 0 ? "Дано в долг: " + money(loanOut, currency) : "Доходы минус расходы. Долги показаны отдельно.";
      document.getElementById("rangeLabel").textContent = formatRange(summary.period.start, summary.period.end);

      renderInsights({
        currency: currency,
        expense: expense,
        income: income,
        loanOut: loanOut,
        periodDays: periodDays,
        activeDays: activeDays,
        topCategory: topCategory,
        largest: largest
      });
      renderDailyChart(summary, currency);
      renderCategoryTotals(summary.category_totals || [], currency);
      renderCategories(summary.categories || [], currency);
      renderLargest(summary.largest_expenses || [], currency);
      renderDebts(data.debts || [], currency);
      renderRecent(data.recent || [], currency);
    }

    function renderInsights(model) {
      const avg = model.periodDays ? Math.round(model.expense / model.periodDays) : 0;
      const topText = model.topCategory ? model.topCategory.category : "Пока нет";
      const largestText = model.largest ? money(model.largest.amount_minor, model.currency) : "Пока нет";
      document.getElementById("insights").innerHTML = [
        insight("Средний день", money(avg, model.currency), "по выбранному периоду"),
        insight("Топ категория", topText, model.topCategory ? money(model.topCategory.amount_minor, model.currency) : "нет расходов"),
        insight("Крупнейшая трата", largestText, model.largest ? (model.largest.description || model.largest.raw_text || "расход") : "нет расходов"),
        insight("Активных дней", String(model.activeDays), "из " + model.periodDays)
      ].join("");
    }

    function insight(label, value, hint) {
      return "<article class='insight'><div class='label'>" + escapeHtml(label) + "</div><div class='value'>" + escapeHtml(value) + "</div><div class='hint'>" + escapeHtml(hint || "") + "</div></article>";
    }

    function renderDailyChart(summary, currency) {
      const root = document.getElementById("dailyChart");
      const series = buildDailySeries(summary, currency);
      const hasValues = series.some(function(item) { return item.expense_minor > 0 || item.income_minor > 0; });
      if (!hasValues) {
        root.innerHTML = "<div class='empty'>За этот период пока нет активных записей. Добавьте трату в боте, и график появится здесь.</div>";
        return;
      }

      const width = 760;
      const height = 260;
      const pad = { left: 52, right: 20, top: 22, bottom: 42 };
      const plotW = width - pad.left - pad.right;
      const plotH = height - pad.top - pad.bottom;
      const max = Math.max.apply(null, series.map(function(item) { return Math.max(item.expense_minor, item.income_minor); }).concat([1]));
      const step = series.length > 1 ? plotW / (series.length - 1) : plotW;
      const barW = Math.max(5, Math.min(22, plotW / Math.max(series.length, 1) * 0.48));
      const incomePoints = [];
      let bars = "";

      for (let i = 0; i < series.length; i += 1) {
        const item = series[i];
        const x = pad.left + (series.length > 1 ? i * step : plotW / 2);
        const expenseH = item.expense_minor / max * plotH;
        const barHeight = expenseH > 0 ? Math.max(2, expenseH) : 0;
        bars += "<rect x='" + (x - barW / 2).toFixed(2) + "' y='" + (pad.top + plotH - barHeight).toFixed(2) + "' width='" + barW.toFixed(2) + "' height='" + barHeight.toFixed(2) + "' rx='5' fill='#f07f9a' opacity='0.86'></rect>";
        const incomeY = pad.top + plotH - item.income_minor / max * plotH;
        incomePoints.push([x, incomeY]);
      }

      const incomePath = incomePoints.map(function(point, index) {
        return (index === 0 ? "M" : "L") + point[0].toFixed(2) + " " + point[1].toFixed(2);
      }).join(" ");
      const grid = [0, 0.25, 0.5, 0.75, 1].map(function(part) {
        const y = pad.top + plotH * part;
        return "<line x1='" + pad.left + "' y1='" + y.toFixed(2) + "' x2='" + (width - pad.right) + "' y2='" + y.toFixed(2) + "' stroke='rgba(40,51,69,0.08)' stroke-width='1'></line>";
      }).join("");
      const labels = buildChartLabels(series, pad, plotW, step);
      const maxLabel = money(max, currency).replace(" " + currency, "");

      root.innerHTML =
        "<svg viewBox='0 0 " + width + " " + height + "' role='img' aria-label='Динамика расходов и доходов'>" +
        "<rect x='0' y='0' width='" + width + "' height='" + height + "' rx='8' fill='rgba(255,255,255,0.48)'></rect>" +
        grid +
        "<text x='12' y='30' fill='#738093' font-size='12'>" + escapeHtml(maxLabel) + "</text>" +
        bars +
        "<path d='" + incomePath + "' fill='none' stroke='#64c3a0' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'></path>" +
        incomePoints.map(function(point) { return "<circle cx='" + point[0].toFixed(2) + "' cy='" + point[1].toFixed(2) + "' r='4' fill='#64c3a0' stroke='white' stroke-width='2'></circle>"; }).join("") +
        labels +
        "</svg>";
    }

    function buildDailySeries(summary, currency) {
      const days = enumerateDates(summary.period.start, summary.period.end);
      const source = new Map();
      for (const item of summary.by_day || []) {
        if (item.currency !== currency) continue;
        source.set(item.local_date, item);
      }
      return days.map(function(date) {
        const item = source.get(date) || {};
        return {
          date: date,
          expense_minor: Number(item.expense_minor || 0),
          income_minor: Number(item.income_minor || 0),
          count: Number(item.count || 0)
        };
      });
    }

    function buildChartLabels(series, pad, plotW, step) {
      const maxLabels = Math.min(5, series.length);
      const every = Math.max(1, Math.ceil(series.length / maxLabels));
      const labels = [];
      for (let i = 0; i < series.length; i += 1) {
        if (i !== 0 && i !== series.length - 1 && i % every !== 0) continue;
        const x = pad.left + (series.length > 1 ? i * step : plotW / 2);
        labels.push("<text x='" + x.toFixed(2) + "' y='238' fill='#738093' font-size='12' text-anchor='middle'>" + escapeHtml(shortDate(series[i].date)) + "</text>");
      }
      return labels.join("");
    }

    function renderCategoryTotals(items, currency) {
      const root = document.getElementById("categoryTotals");
      const donut = document.getElementById("donut");
      const totalEl = document.getElementById("donutTotal");
      const filtered = items.filter(function(item) { return item.currency === currency && Number(item.amount_minor || 0) > 0; });
      const total = filtered.reduce(function(sum, item) { return sum + Number(item.amount_minor || 0); }, 0);
      totalEl.textContent = money(total, currency);

      if (!filtered.length) {
        donut.style.background = "conic-gradient(#e4e8ef 0deg 360deg)";
        root.innerHTML = "<div class='empty'>Категории появятся после первой траты.</div>";
        return;
      }

      let start = 0;
      const segments = filtered.map(function(item, index) {
        const end = start + Number(item.amount_minor || 0) / total * 360;
        const segment = colors[index % colors.length] + " " + start.toFixed(2) + "deg " + end.toFixed(2) + "deg";
        start = end;
        return segment;
      });
      donut.style.background = "conic-gradient(" + segments.join(", ") + ")";

      const max = Math.max.apply(null, filtered.map(function(item) { return Number(item.amount_minor || 0); }).concat([1]));
      root.innerHTML = "";
      for (let index = 0; index < filtered.length; index += 1) {
        const item = filtered[index];
        const pct = total ? Math.round(Number(item.amount_minor || 0) / total * 100) : 0;
        const element = document.createElement("div");
        element.className = "row";
        element.innerHTML = "<div><div class='title'></div><div class='meta'></div><div class='progress'><div class='progress-fill'></div></div></div><div class='amount expense'></div>";
        element.querySelector(".title").textContent = item.category;
        element.querySelector(".meta").textContent = pct + "% · " + plural(Number(item.count || 0), "запись", "записи", "записей");
        element.querySelector(".progress-fill").style.width = Math.max(4, Number(item.amount_minor || 0) / max * 100) + "%";
        element.querySelector(".progress-fill").style.background = colors[index % colors.length];
        element.querySelector(".amount").textContent = money(item.amount_minor, currency);
        root.appendChild(element);
      }
    }

    function renderCategories(items, currency) {
      const root = document.getElementById("categories");
      const filtered = items.filter(function(item) { return item.currency === currency; });
      root.innerHTML = "";
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Подкатегорий пока нет.</div>";
        return;
      }
      const max = Math.max.apply(null, filtered.map(function(item) { return Number(item.amount_minor || 0); }).concat([1]));
      for (const item of filtered.slice(0, 8)) {
        root.appendChild(rowWithProgress(item.category + " > " + item.subcategory, plural(Number(item.count || 0), "запись", "записи", "записей"), money(item.amount_minor, currency), Number(item.amount_minor || 0) / max * 100, "expense"));
      }
    }

    function renderLargest(items, currency) {
      const root = document.getElementById("largest");
      const filtered = items.filter(function(item) { return item.currency === currency; });
      root.innerHTML = "";
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Крупных трат пока нет.</div>";
        return;
      }
      for (const item of filtered.slice(0, 5)) {
        const title = item.description || item.raw_text || "Расход";
        const meta = formatDate(item.local_date) + " · #" + item.id + " · " + [item.category, item.subcategory].filter(Boolean).join(" > ");
        root.appendChild(row(title, meta, money(item.amount_minor, currency), "expense"));
      }
    }

    function renderDebts(items, currency) {
      const root = document.getElementById("debts");
      root.innerHTML = "";
      const filtered = items.filter(function(item) { return item.currency === currency; });
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Открытых долгов нет.</div>";
        return;
      }
      for (const item of filtered) {
        if (Number(item.receivable_minor) > 0) {
          root.appendChild(row(item.counterparty || "Без имени", "должен вам", money(item.receivable_minor, item.currency), "debt"));
        }
        if (Number(item.payable_minor) > 0) {
          root.appendChild(row(item.counterparty || "Без имени", "вы должны", money(item.payable_minor, item.currency), "debt"));
        }
      }
    }

    function renderRecent(items, currency) {
      const root = document.getElementById("recent");
      root.innerHTML = "";
      const filtered = items.filter(function(item) { return item.currency === currency; });
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Записей пока нет.</div>";
        return;
      }
      for (const item of filtered.slice(0, 14)) {
        const meta = formatDate(item.local_date) + " · ID " + item.id + " · " + [kindLabel(item.kind), item.category, item.subcategory].filter(Boolean).join(" · ");
        const tone = item.kind === "income" ? "income" : item.kind.indexOf("loan") >= 0 || item.kind.indexOf("borrow") >= 0 ? "debt" : "expense";
        root.appendChild(row(item.description || item.raw_text || kindLabel(item.kind), meta, money(item.amount_minor, item.currency), tone));
      }
    }

    function row(title, meta, amount, tone) {
      const element = document.createElement("div");
      element.className = "row";
      element.innerHTML = "<div><div class='title'></div><div class='meta'></div></div><div class='amount'></div>";
      element.querySelector(".title").textContent = title || "";
      element.querySelector(".meta").textContent = meta || "";
      const amountEl = element.querySelector(".amount");
      amountEl.textContent = amount || "";
      if (tone) amountEl.classList.add(tone);
      return element;
    }

    function rowWithProgress(title, meta, amount, percent, tone) {
      const element = document.createElement("div");
      element.className = "row";
      element.innerHTML = "<div><div class='title'></div><div class='meta'></div><div class='progress'><div class='progress-fill'></div></div></div><div class='amount'></div>";
      element.querySelector(".title").textContent = title || "";
      element.querySelector(".meta").textContent = meta || "";
      element.querySelector(".progress-fill").style.width = Math.max(4, percent || 0) + "%";
      const amountEl = element.querySelector(".amount");
      amountEl.textContent = amount || "";
      if (tone) amountEl.classList.add(tone);
      return element;
    }

    function firstForCurrency(items, currency) {
      return (items || []).find(function(item) { return item.currency === currency; }) || null;
    }

    function enumerateDates(start, end) {
      const result = [];
      const current = new Date(start + "T00:00:00Z");
      const last = new Date(end + "T00:00:00Z");
      while (current <= last && result.length < 370) {
        result.push(current.toISOString().slice(0, 10));
        current.setUTCDate(current.getUTCDate() + 1);
      }
      return result;
    }

    function dayCount(start, end) {
      return enumerateDates(start, end).length || 1;
    }

    function shortDate(ymd) {
      const parts = ymd.split("-");
      return parts[2] + "." + parts[1];
    }

    function formatDate(ymd) {
      return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(ymd + "T00:00:00Z"));
    }

    function formatRange(start, end) {
      if (start === end) return formatDate(start);
      return formatDate(start) + " - " + formatDate(end);
    }

    function plural(value, one, few, many) {
      const n = Math.abs(Number(value || 0));
      const mod10 = n % 10;
      const mod100 = n % 100;
      const word = mod10 === 1 && mod100 !== 11 ? one : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
      return n.toLocaleString("ru-RU") + " " + word;
    }

    function kindLabel(kind) {
      const labels = {
        expense: "Расход",
        income: "Доход",
        loan_out: "Дал в долг",
        loan_repayment: "Вернули долг",
        borrow_in: "Взял в долг",
        borrow_repayment: "Вернул долг",
        transfer: "Перевод",
        correction: "Коррекция"
      };
      return labels[kind] || kind;
    }

    function escapeHtml(value) {
      return String(value == null ? "" : value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    function showError(message) {
      document.getElementById("profile").textContent = "Ошибка загрузки";
      document.getElementById("heroSpend").textContent = "Нет данных";
      document.getElementById("heroMeta").textContent = message;
      document.getElementById("insights").innerHTML = "<div class='error'>Не удалось загрузить мини-апп: " + escapeHtml(message) + "</div>";
      document.getElementById("dailyChart").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
    }

    async function load() {
      if (!tg || !tg.initData) {
        showError("Откройте панель из Telegram, чтобы пройти проверку доступа.");
        return;
      }
      document.getElementById("refresh").disabled = true;
      try {
        const response = await fetch("/api/app-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData, period: state.period })
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка загрузки");
        state.data = data;
        render(data);
      } catch (error) {
        showError(error.message);
      } finally {
        document.getElementById("refresh").disabled = false;
      }
    }

    load();
  </script>
</body>
</html>`;
}

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
      enum: ["today", "yesterday", "week", "month", "last_7_days", null]
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

  if (command === "/undo") {
    await undoLast(env, chatId, user);
    return;
  }

  if (command === "/delete") {
    await deleteById(env, chatId, user, arg);
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
    "/today - сегодня",
    "/week - текущая неделя",
    "/month - текущий месяц",
    "/debts - долги",
    "/undo - отменить последнюю запись",
    "/delete 123 - удалить запись",
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
    "- Для analytics period: сегодня/за день = today, вчера = yesterday, за неделю/текущая неделя = week, последние 7 дней = last_7_days, за месяц/текущий месяц = month.",
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

  const byDay = await env.DB.prepare(
    `SELECT local_date, currency, SUM(amount_minor) AS expense_minor, COUNT(*) AS count
    FROM transactions
    WHERE user_id = ? AND status = 'active' AND kind = 'expense' AND local_date BETWEEN ? AND ?
    GROUP BY local_date, currency
    ORDER BY local_date, currency`
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
    by_day: byDay.results || []
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
    .bind(user.id)
    .all();

  const open = (rows.results || []).filter((row) => row.receivable_minor !== 0 || row.payable_minor !== 0);
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

async function sendMessage(env, chatId, text) {
  const chunks = splitTelegramText(text);
  for (const chunk of chunks) {
    const response = await fetch(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: "HTML",
        disable_web_page_preview: true
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

function periodBounds(period, timezone) {
  const today = getLocalYmd(new Date(), timezone || "Asia/Qyzylorda");

  if (period === "today") {
    return { start: today, end: today, label: "сегодня" };
  }

  if (period === "yesterday") {
    const yesterday = addDaysYmd(today, -1);
    return { start: yesterday, end: yesterday, label: "вчера" };
  }

  if (period === "week") {
    const start = startOfWeekYmd(today);
    return { start, end: today, label: `текущая неделя (${start} - ${today})` };
  }

  if (period === "last_7_days") {
    const start = addDaysYmd(today, -6);
    return { start, end: today, label: `последние 7 дней (${start} - ${today})` };
  }

  const start = `${today.slice(0, 8)}01`;
  return { start, end: today, label: `текущий месяц (${start} - ${today})` };
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

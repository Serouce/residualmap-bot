export function miniAppHtml() {
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
      --ivory: #f8f3ed;
      --paper: #fffdfa;
      --mist: #edf3ef;
      --mint: #dcefe6;
      --lavender: #e9e1f2;
      --peach: #f6d8c7;
      --blue: #dbeaf6;
      --butter: #f2e5aa;
      --ink: #222632;
      --muted: #717987;
      --soft-muted: #8b93a0;
      --surface: rgba(255,255,255,.72);
      --solid: #fffaf6;
      --line: rgba(42,46,58,.09);
      --hairline: rgba(255,255,255,.72);
      --shadow: 0 18px 46px rgba(38,42,54,.09), 0 2px 8px rgba(38,42,54,.04);
      --shadow-soft: 0 10px 24px rgba(38,42,54,.07);
      --rose: #c96f83;
      --green: #4b9475;
      --gold: #a8792c;
      --violet: #8f7bbe;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      background:
        linear-gradient(135deg, rgba(248,243,237,.98) 0%, rgba(250,247,243,.96) 36%, rgba(237,243,239,.94) 68%, rgba(245,238,245,.92) 100%),
        var(--ivory);
      font: 15px/1.42 ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", sans-serif;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }
    button, input, select {
      font: inherit;
    }
    button {
      border: 0;
      cursor: pointer;
    }
    .app {
      width: min(1080px, 100%);
      margin: 0 auto;
      padding: 10px 10px max(28px, env(safe-area-inset-bottom));
    }
    .top {
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 8px 0 10px;
      background: linear-gradient(180deg, rgba(248,243,237,.94), rgba(248,243,237,.82) 78%, rgba(248,243,237,0));
      backdrop-filter: blur(20px);
    }
    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
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
      background: linear-gradient(145deg, #e7f2ed, #dcebf2);
      box-shadow: var(--shadow-soft);
      font-weight: 780;
      color: #23614e;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 760;
      letter-spacing: 0;
    }
    .brand-sub {
      color: var(--muted);
      font-size: 12px;
      overflow-wrap: anywhere;
    }
    .icon-btn {
      min-width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(255,255,255,.82);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-soft);
      color: var(--ink);
      font-weight: 720;
    }
    .segments, .tabs {
      display: grid;
      gap: 7px;
    }
    .segments {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 8px;
    }
    .tabs {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      padding: 4px;
      border-radius: 8px;
      background: rgba(255,255,255,.58);
      border: 1px solid var(--line);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.86);
    }
    .segments button, .tabs button {
      min-height: 38px;
      border-radius: 8px;
      color: var(--ink);
      background: rgba(255,255,255,.72);
      font-weight: 720;
    }
    .segments button.active {
      background: #eee7f7;
      box-shadow: inset 0 0 0 1px rgba(143,123,190,.2), 0 8px 18px rgba(143,123,190,.1);
    }
    .tabs button.active {
      background: var(--ink);
      color: #fff;
      box-shadow: 0 10px 24px rgba(34,38,50,.14);
    }
    .view { display: none; }
    .view.active { display: block; }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(240px, .6fr);
      gap: 10px;
      margin: 12px 0 10px;
    }
    .card {
      border: 1px solid var(--hairline);
      border-radius: 8px;
      background: var(--surface);
      box-shadow: var(--shadow);
      backdrop-filter: blur(22px);
      min-width: 0;
    }
    .hero-main {
      padding: 18px 18px 17px;
      background:
        linear-gradient(135deg, rgba(255,255,255,.88), rgba(236,228,245,.78)),
        var(--lavender);
    }
    .hero-side {
      padding: 18px;
      display: grid;
      align-content: space-between;
      background:
        linear-gradient(135deg, rgba(34,38,50,.96), rgba(53,58,72,.93));
      color: #fff;
    }
    .eyebrow, .side-label, .caption, .label {
      color: var(--muted);
      font-size: 12.5px;
      font-weight: 650;
    }
    .hero-side .side-label, .hero-side .caption { color: rgba(255,255,255,.68); }
    h1 {
      margin: 8px 0 4px;
      font-size: 40px;
      line-height: 1;
      letter-spacing: 0;
      font-weight: 760;
      overflow-wrap: anywhere;
    }
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 740;
      letter-spacing: 0;
    }
    .side-value {
      margin-top: 4px;
      font-size: 25px;
      font-weight: 760;
      overflow-wrap: anywhere;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 10px;
    }
    .metric {
      padding: 13px;
      min-height: 98px;
    }
    .metric:nth-child(1) { background: linear-gradient(145deg, rgba(247,216,202,.78), rgba(255,250,246,.72)); }
    .metric:nth-child(2) { background: linear-gradient(145deg, rgba(220,239,230,.84), rgba(255,250,246,.74)); }
    .metric:nth-child(3) { background: linear-gradient(145deg, rgba(219,234,246,.82), rgba(255,250,246,.74)); }
    .metric:nth-child(4) { background: linear-gradient(145deg, rgba(242,229,170,.72), rgba(255,250,246,.76)); }
    .value {
      margin-top: 5px;
      font-size: 18px;
      font-weight: 760;
      overflow-wrap: anywhere;
    }
    .hint {
      margin-top: 4px;
      color: var(--soft-muted);
      font-size: 12px;
      overflow-wrap: anywhere;
    }
    .dashboard {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(300px, .8fr);
      gap: 12px;
    }
    .wide { grid-column: span 2; }
    .panel {
      padding: 16px;
    }
    .panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .chart {
      min-height: 292px;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
    svg text {
      font-family: inherit;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
      color: var(--muted);
      font-size: 13px;
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
      background: var(--rose);
    }
    .dot.income { background: var(--green); }
    .category-layout {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 16px;
      align-items: center;
    }
    .donut {
      width: 142px;
      height: 142px;
      margin: 0 auto;
      display: grid;
      place-items: center;
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px rgba(32,36,46,.07), 0 10px 26px rgba(38,42,54,.06);
    }
    .donut-core {
      width: 88px;
      height: 88px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: rgba(255,253,250,.96);
      text-align: center;
      padding: 9px;
      color: var(--muted);
      font-size: 11.5px;
    }
    .donut-core strong {
      display: block;
      color: var(--ink);
      font-size: 13.5px;
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
      align-items: start;
      padding: 10px 0;
      border-top: 1px solid var(--line);
    }
    .row:first-child { border-top: 0; padding-top: 0; }
    .clickable { cursor: pointer; }
    .title { font-weight: 720; overflow-wrap: anywhere; }
    .meta { margin-top: 2px; color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
    .amount { font-weight: 760; white-space: nowrap; }
    .expense { color: var(--rose); }
    .income { color: var(--green); }
    .debt { color: var(--gold); }
    .pill {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      border-radius: 999px;
      padding: 3px 8px;
      background: rgba(255,255,255,.62);
      color: var(--muted);
      font-size: 12px;
      font-weight: 740;
    }
    .progress {
      height: 7px;
      margin-top: 7px;
      border-radius: 999px;
      background: rgba(32,36,46,.08);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--rose);
    }
    .controls {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(120px, .5fr));
      gap: 8px;
      margin: 10px 0;
    }
    .field {
      min-height: 42px;
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.76);
      color: var(--ink);
      padding: 9px 10px;
      outline: none;
    }
    .field:focus {
      border-color: rgba(139,124,246,.55);
      box-shadow: 0 0 0 3px rgba(232,224,244,.8);
    }
    .empty, .error {
      min-height: 118px;
      display: grid;
      place-items: center;
      text-align: center;
      color: var(--muted);
      padding: 20px;
      border: 1px dashed rgba(32,36,46,.18);
      border-radius: 8px;
      background: rgba(255,255,255,.48);
    }
    .error { color: #b84d63; }
    .skeleton {
      min-height: 92px;
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(255,255,255,.42), rgba(255,255,255,.86), rgba(255,255,255,.42));
      background-size: 200% 100%;
      animation: shine 1.25s infinite linear;
    }
    @keyframes shine {
      from { background-position: 0 0; }
      to { background-position: -200% 0; }
    }
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: none;
      align-items: flex-end;
      background: rgba(32,36,46,.28);
      backdrop-filter: blur(8px);
    }
    .sheet-backdrop.open { display: flex; }
    .sheet {
      width: min(720px, 100%);
      max-height: 86vh;
      overflow: auto;
      margin: 0 auto;
      padding: 14px;
      border-radius: 8px 8px 0 0;
      background: var(--solid);
      box-shadow: 0 -20px 60px rgba(32,36,46,.22);
    }
    .sheet-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    .details {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }
    .detail {
      border-radius: 8px;
      padding: 10px;
      background: rgba(232,224,244,.42);
      min-width: 0;
    }
    .detail.full { grid-column: span 2; }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      position: sticky;
      bottom: 0;
      padding-top: 8px;
      background: var(--solid);
    }
    .primary, .danger {
      min-height: 44px;
      border-radius: 8px;
      font-weight: 820;
    }
    .primary {
      background: var(--ink);
      color: #fff;
    }
    .danger {
      background: #ffe1e7;
      color: #9e3047;
    }
    @media (max-width: 820px) {
      .hero, .dashboard, .category-layout { grid-template-columns: 1fr; }
      .wide { grid-column: span 1; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .controls { grid-template-columns: 1fr 1fr; }
      .controls input { grid-column: span 2; }
    }
    @media (max-width: 520px) {
      .app { padding: 10px 9px max(24px, env(safe-area-inset-bottom)); }
      h1 { font-size: 34px; }
      .hero-main, .hero-side, .panel { padding: 13px; }
      .segments { gap: 5px; }
      .segments button, .tabs button { min-height: 38px; padding: 7px 4px; }
      .row { grid-template-columns: 1fr; gap: 4px; }
      .amount { white-space: normal; }
      .details { grid-template-columns: 1fr; }
      .detail.full { grid-column: span 1; }
      .actions { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="app">
    <section class="top">
      <div class="brand-row">
        <div class="brand">
          <div class="mark">R</div>
          <div>
            <div class="brand-title">ResidualMap</div>
            <div class="brand-sub" id="profile">Загрузка данных...</div>
          </div>
        </div>
        <button class="icon-btn" id="refresh" title="Обновить">↻</button>
      </div>
      <nav class="segments" id="periods">
        <button data-period="today">Сегодня</button>
        <button data-period="week">Неделя</button>
        <button data-period="last_30_days">30 дней</button>
        <button data-period="month" class="active">Месяц</button>
      </nav>
      <nav class="tabs" id="tabs">
        <button data-tab="overview" class="active">Обзор</button>
        <button data-tab="records">Записи</button>
        <button data-tab="debts">Долги</button>
      </nav>
    </section>

    <section class="view active" id="view-overview">
      <section class="hero">
        <div class="hero-main card">
          <div class="eyebrow" id="periodName">Месяц</div>
          <h1 id="heroSpend">0 ₸</h1>
          <div class="hint" id="heroMeta">Расходы за выбранный период</div>
        </div>
        <aside class="hero-side card">
          <div>
            <div class="side-label">Баланс периода</div>
            <div class="side-value" id="netFlow">0 ₸</div>
          </div>
          <div class="caption" id="sideNote">Доходы минус личные расходы. Долги показаны отдельно.</div>
        </aside>
      </section>

      <section class="grid" id="metrics">
        <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
      </section>

      <section class="dashboard">
        <section class="panel card wide">
          <div class="panel-head">
            <div>
              <h2>Динамика</h2>
              <div class="caption">Личные расходы и доходы по дням</div>
            </div>
            <div class="caption" id="rangeLabel"></div>
          </div>
          <div class="chart" id="dailyChart"></div>
          <div class="legend"><span><i class="dot"></i>Личные расходы</span><span><i class="dot income"></i>Доходы</span></div>
        </section>

        <section class="panel card">
          <div class="panel-head"><div><h2>Категории</h2><div class="caption">Куда ушли личные деньги</div></div></div>
          <div class="category-layout">
            <div class="donut" id="donut"><div class="donut-core">Всего<strong id="donutTotal">0 ₸</strong></div></div>
            <div class="list" id="categoryTotals"></div>
          </div>
        </section>

        <section class="panel card">
          <div class="panel-head"><div><h2>Детализация</h2><div class="caption">Подкатегории личных расходов</div></div></div>
          <div class="list" id="categories"></div>
        </section>

        <section class="panel card wide">
          <div class="panel-head"><div><h2>Крупные траты</h2><div class="caption">Самые заметные личные списания</div></div></div>
          <div class="list" id="largest"></div>
        </section>

        <section class="panel card wide" id="familyHelpPanel" hidden>
          <div class="panel-head">
            <div><h2>Семья</h2><div class="caption">Помощь семье отдельно от личных трат</div></div>
            <span class="pill" id="familyHelpTotal">0 ₸</span>
          </div>
          <div class="list" id="familyHelp"></div>
        </section>

      </section>
    </section>

    <section class="view" id="view-records">
      <section class="panel card">
        <div class="panel-head">
          <div><h2>Записи</h2><div class="caption">Поиск, проверка и безопасные действия</div></div>
          <span class="pill" id="recordCount">0</span>
        </div>
        <div class="controls">
          <input class="field" id="recordSearch" placeholder="Поиск: такси, сестра, продукты">
          <select class="field" id="statusFilter">
            <option value="active">Активные</option>
            <option value="deleted">Удалённые</option>
          </select>
          <select class="field" id="kindFilter">
            <option value="all">Все типы</option>
            <option value="expense">Расходы</option>
            <option value="income">Доходы</option>
            <option value="loan_out">Дал в долг</option>
            <option value="loan_repayment">Вернули долг</option>
            <option value="borrow_in">Взял в долг</option>
            <option value="borrow_repayment">Вернул долг</option>
            <option value="transfer">Переводы</option>
          </select>
          <select class="field" id="categoryFilter">
            <option value="">Все категории</option>
          </select>
        </div>
        <div class="list" id="records"></div>
      </section>
    </section>

    <section class="view" id="view-debts">
      <section class="panel card">
        <div class="panel-head"><div><h2>Долги</h2><div class="caption">Отдельная панель взаиморасчётов</div></div></div>
        <div class="list" id="debtsFull"></div>
      </section>
    </section>
  </main>

  <div class="sheet-backdrop" id="sheetBackdrop">
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Детали записи">
      <div class="sheet-head">
        <div>
          <h2 id="sheetTitle">Запись</h2>
          <div class="caption" id="sheetSubtitle"></div>
        </div>
        <button class="icon-btn" id="closeSheet" title="Закрыть">×</button>
      </div>
      <div class="details" id="sheetDetails"></div>
      <div class="actions">
        <button class="primary" id="sheetCloseAction">Готово</button>
        <button class="danger" id="sheetAction">Удалить</button>
      </div>
    </section>
  </div>

  <script>
    const tg = window.Telegram && window.Telegram.WebApp;
    const colors = ["#d96c86", "#41966f", "#8b7cf6", "#d8a343", "#5c9fcf", "#c4876a", "#7cae7a", "#a686c8"];
    const state = {
      period: "month",
      tab: "overview",
      data: null,
      records: [],
      categories: [],
      selected: null,
      searchTimer: null
    };

    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.MainButton) tg.MainButton.hide();
    }

    document.getElementById("periods").addEventListener("click", function(event) {
      const button = event.target.closest("button[data-period]");
      if (!button) return;
      state.period = button.dataset.period;
      setActive("#periods button", button);
      loadAll();
    });

    document.getElementById("tabs").addEventListener("click", function(event) {
      const button = event.target.closest("button[data-tab]");
      if (!button) return;
      state.tab = button.dataset.tab;
      setActive("#tabs button", button);
      for (const view of document.querySelectorAll(".view")) view.classList.toggle("active", view.id === "view-" + state.tab);
      if (state.tab === "records") loadRecords();
    });

    document.getElementById("refresh").addEventListener("click", loadAll);
    document.getElementById("statusFilter").addEventListener("change", loadRecords);
    document.getElementById("kindFilter").addEventListener("change", loadRecords);
    document.getElementById("categoryFilter").addEventListener("change", loadRecords);
    document.getElementById("recordSearch").addEventListener("input", function() {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(loadRecords, 220);
    });
    document.getElementById("records").addEventListener("click", function(event) {
      const row = event.target.closest("[data-id]");
      if (!row) return;
      const item = state.records.find(function(record) { return String(record.id) === row.dataset.id; });
      if (item) openSheet(item);
    });
    document.getElementById("closeSheet").addEventListener("click", closeSheet);
    document.getElementById("sheetCloseAction").addEventListener("click", closeSheet);
    document.getElementById("sheetBackdrop").addEventListener("click", function(event) {
      if (event.target.id === "sheetBackdrop") closeSheet();
    });
    document.getElementById("sheetAction").addEventListener("click", runSheetAction);

    function setActive(selector, active) {
      for (const item of document.querySelectorAll(selector)) item.classList.toggle("active", item === active);
    }

    function initData() {
      return tg && tg.initData ? tg.initData : "";
    }

    async function api(path, payload) {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ initData: initData() }, payload || {}))
      });
      const data = await response.json().catch(function() { return {}; });
      if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка загрузки");
      return data;
    }

    async function loadAll() {
      if (!initData()) {
        showAccessError("Откройте панель из Telegram, чтобы пройти проверку доступа.");
        return;
      }
      document.getElementById("refresh").disabled = true;
      try {
        await loadOverview();
        if (state.tab === "records") await loadRecords();
      } catch (error) {
        showAccessError(error.message);
      } finally {
        document.getElementById("refresh").disabled = false;
      }
    }

    async function loadOverview() {
      showOverviewSkeletons();
      const data = await api("/api/app-data", { period: state.period });
      state.data = data;
      renderOverview(data);
    }

    async function loadRecords() {
      if (!initData()) return;
      document.getElementById("records").innerHTML = "<div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div>";
      try {
        const data = await api("/api/transactions", {
          period: state.period,
          status: document.getElementById("statusFilter").value,
          kind: document.getElementById("kindFilter").value,
          category: document.getElementById("categoryFilter").value,
          query: document.getElementById("recordSearch").value,
          limit: 50
        });
        state.records = data.items || [];
        state.categories = data.categories || [];
        renderCategoryOptions();
        renderRecords();
      } catch (error) {
        document.getElementById("records").innerHTML = "<div class='error'>" + escapeHtml(error.message) + "</div>";
      }
    }

    function renderOverview(data) {
      const summary = data.summary;
      const total = selectedKzt(summary.totals_by_currency || []);
      const expense = Number(total.expense_minor || 0);
      const income = Number(total.income_minor || 0);
      const net = income - expense;
      const loanOut = Number(total.loan_out_minor || 0);
      const periodDays = dayCount(summary.period.start, summary.period.end);
      const series = buildDailySeries(summary);
      const activeDays = series.filter(function(item) { return item.expense_minor > 0; }).length;
      const quietDays = Math.max(0, periodDays - activeDays);
      const topCategory = firstKzt(summary.category_totals || []);
      document.getElementById("profile").textContent = "KZT · " + (data.user.timezone || "Asia/Qyzylorda");
      document.getElementById("periodName").textContent = summary.period.label;
      document.getElementById("heroSpend").textContent = money(expense);
      document.getElementById("heroMeta").textContent = "Личные расходы · " + formatRange(summary.period.start, summary.period.end) + " · " + plural(summary.transaction_count || 0, "запись", "записи", "записей");
      document.getElementById("netFlow").textContent = (net >= 0 ? "+" : "") + money(net);
      document.getElementById("sideNote").textContent = loanOut > 0
        ? "Дано в долг: " + money(loanOut)
        : "Доходы минус личные расходы. Долги показаны отдельно.";
      document.getElementById("rangeLabel").textContent = formatRange(summary.period.start, summary.period.end);
      document.getElementById("metrics").innerHTML = [
        metric("Средний день", money(periodDays ? Math.round(expense / periodDays) : 0), "за выбранный период"),
        metric("Доходы", money(income), "поступления"),
        metric("Топ категория", topCategory ? topCategory.category : "Пока нет", topCategory ? money(topCategory.amount_minor) : "нет расходов"),
        metric("Дней без трат", String(quietDays), "из " + periodDays)
      ].join("");

      renderDailyChart(summary);
      renderCategoryTotals(summary.category_totals || []);
      renderCategories(summary.categories || []);
      renderLargest(summary.largest_expenses || []);
      renderFamilyHelp(summary.family_help || [], summary.family_help_counterparties || []);
      renderDebts(data.debts || [], "debtsFull", 50);
    }

    function metric(label, value, hint) {
      return "<article class='metric card'><div class='label'>" + escapeHtml(label) + "</div><div class='value'>" + escapeHtml(value) + "</div><div class='hint'>" + escapeHtml(hint || "") + "</div></article>";
    }

    function showOverviewSkeletons() {
      document.getElementById("metrics").innerHTML = "<div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div>";
      document.getElementById("dailyChart").innerHTML = "<div class='skeleton'></div>";
      document.getElementById("familyHelpPanel").hidden = true;
      document.getElementById("familyHelp").innerHTML = "<div class='skeleton'></div>";
    }

    function renderDailyChart(summary) {
      const root = document.getElementById("dailyChart");
      const series = buildDailySeries(summary);
      const hasValues = series.some(function(item) { return item.expense_minor > 0 || item.income_minor > 0; });
      if (!hasValues) {
        root.innerHTML = "<div class='empty'>За этот период пока нет личных расходов или доходов.</div>";
        return;
      }
      const width = 760;
      const height = 312;
      const pad = { left: 64, right: 22, top: 30, bottom: 54 };
      const plotW = width - pad.left - pad.right;
      const plotH = height - pad.top - pad.bottom;
      const max = Math.max.apply(null, series.map(function(item) { return Math.max(item.expense_minor, item.income_minor); }).concat([1]));
      const step = series.length > 1 ? plotW / (series.length - 1) : plotW;
      const barW = Math.max(8, Math.min(24, plotW / Math.max(series.length, 1) * .46));
      const incomePoints = [];
      let bars = "";
      let valueLabels = "";
      for (let i = 0; i < series.length; i += 1) {
        const item = series[i];
        const x = pad.left + (series.length > 1 ? i * step : plotW / 2);
        const expenseH = item.expense_minor / max * plotH;
        const barHeight = expenseH > 0 ? Math.max(2, expenseH) : 0;
        const barY = pad.top + plotH - barHeight;
        bars += "<rect x='" + (x - barW / 2).toFixed(2) + "' y='" + barY.toFixed(2) + "' width='" + barW.toFixed(2) + "' height='" + barHeight.toFixed(2) + "' rx='6' fill='#c96f83' opacity='.9'></rect>";
        if (item.expense_minor > 0 && series.length <= 10) {
          valueLabels += "<text x='" + x.toFixed(2) + "' y='" + Math.max(20, barY - 9).toFixed(2) + "' fill='#8f4b5d' font-size='15' font-weight='680' text-anchor='middle'>" + escapeHtml(shortMoney(item.expense_minor)) + "</text>";
        }
        incomePoints.push([x, pad.top + plotH - item.income_minor / max * plotH]);
      }
      const incomePath = incomePoints.map(function(point, index) { return (index === 0 ? "M" : "L") + point[0].toFixed(2) + " " + point[1].toFixed(2); }).join(" ");
      const grid = [0, .25, .5, .75, 1].map(function(part) {
        const y = pad.top + plotH * part;
        return "<line x1='" + pad.left + "' y1='" + y.toFixed(2) + "' x2='" + (width - pad.right) + "' y2='" + y.toFixed(2) + "' stroke='rgba(32,36,46,.08)' stroke-width='1'></line>";
      }).join("");
      root.innerHTML =
        "<svg viewBox='0 0 " + width + " " + height + "' role='img' aria-label='Динамика личных расходов и доходов'>" +
        "<rect x='0' y='0' width='" + width + "' height='" + height + "' rx='8' fill='rgba(255,253,250,.58)'></rect>" +
        grid +
        "<text x='18' y='38' fill='#6f7785' font-size='17' font-weight='650'>" + escapeHtml(shortMoney(max)) + "</text>" +
        bars +
        valueLabels +
        "<path d='" + incomePath + "' fill='none' stroke='#4b9475' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'></path>" +
        incomePoints.map(function(point) { return "<circle cx='" + point[0].toFixed(2) + "' cy='" + point[1].toFixed(2) + "' r='5' fill='#4b9475' stroke='white' stroke-width='2.4'></circle>"; }).join("") +
        chartLabels(series, pad, plotW, step) +
        "</svg>";
    }

    function renderCategoryTotals(items) {
      const root = document.getElementById("categoryTotals");
      const donut = document.getElementById("donut");
      const totalEl = document.getElementById("donutTotal");
      const filtered = kztItems(items).filter(function(item) { return Number(item.amount_minor || 0) > 0; });
      const total = filtered.reduce(function(sum, item) { return sum + Number(item.amount_minor || 0); }, 0);
      totalEl.textContent = money(total);
      if (!filtered.length) {
        donut.style.background = "conic-gradient(#e4e8ef 0deg 360deg)";
        root.innerHTML = "<div class='empty'>Категории появятся после первой личной траты.</div>";
        return;
      }
      let start = 0;
      donut.style.background = "conic-gradient(" + filtered.map(function(item, index) {
        const end = start + Number(item.amount_minor || 0) / total * 360;
        const part = colors[index % colors.length] + " " + start.toFixed(2) + "deg " + end.toFixed(2) + "deg";
        start = end;
        return part;
      }).join(", ") + ")";
      const max = Math.max.apply(null, filtered.map(function(item) { return Number(item.amount_minor || 0); }).concat([1]));
      root.innerHTML = "";
      for (let index = 0; index < filtered.length; index += 1) {
        const item = filtered[index];
        const pct = total ? Math.round(Number(item.amount_minor || 0) / total * 100) : 0;
        root.appendChild(rowWithProgress(item.category, pct + "% · " + plural(item.count || 0, "запись", "записи", "записей"), money(item.amount_minor), Number(item.amount_minor || 0) / max * 100, colors[index % colors.length], "expense"));
      }
    }

    function renderCategories(items) {
      const root = document.getElementById("categories");
      const filtered = kztItems(items);
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Подкатегорий пока нет.</div>";
        return;
      }
      const max = Math.max.apply(null, filtered.map(function(item) { return Number(item.amount_minor || 0); }).concat([1]));
      root.innerHTML = "";
      for (const item of filtered.slice(0, 8)) {
        root.appendChild(rowWithProgress(item.category + " · " + item.subcategory, plural(item.count || 0, "запись", "записи", "записей"), money(item.amount_minor), Number(item.amount_minor || 0) / max * 100, "#d96c86", "expense"));
      }
    }

    function renderLargest(items) {
      const root = document.getElementById("largest");
      const filtered = kztItems(items);
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Крупных личных трат пока нет.</div>";
        return;
      }
      root.innerHTML = "";
      for (const item of filtered.slice(0, 5)) {
        root.appendChild(row(item.description || item.raw_text || "Расход", formatDate(item.local_date) + " · ID " + item.id + " · " + [item.category, item.subcategory].filter(Boolean).join(" · "), money(item.amount_minor), "expense"));
      }
    }

    function renderFamilyHelp(totals, counterparties) {
      const total = selectedKzt(totals || []);
      const totalMinor = Number(total.amount_minor || 0);
      const panel = document.getElementById("familyHelpPanel");
      const root = document.getElementById("familyHelp");
      document.getElementById("familyHelpTotal").textContent = money(totalMinor);
      root.innerHTML = "";
      if (totalMinor <= 0) {
        panel.hidden = true;
        return;
      }
      panel.hidden = false;
      const filtered = kztItems(counterparties);
      if (!filtered.length) {
        root.appendChild(row("Помощь семье", plural(total.count || 0, "запись", "записи", "записей"), money(totalMinor), "debt"));
        return;
      }
      for (const item of filtered) {
        root.appendChild(row(item.counterparty || "Без имени", plural(item.count || 0, "запись", "записи", "записей"), money(item.amount_minor), "debt"));
      }
    }

    function renderDebts(items, targetId, maxItems) {
      const root = document.getElementById(targetId);
      const filtered = kztItems(items);
      root.innerHTML = "";
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Открытых долгов нет.</div>";
        return;
      }
      let rendered = 0;
      for (const item of filtered) {
        if (Number(item.receivable_minor) > 0 && rendered < maxItems) {
          root.appendChild(row(item.counterparty || "Без имени", "должен вам", money(item.receivable_minor), "debt"));
          rendered += 1;
        }
        if (Number(item.payable_minor) > 0 && rendered < maxItems) {
          root.appendChild(row(item.counterparty || "Без имени", "вы должны", money(item.payable_minor), "debt"));
          rendered += 1;
        }
      }
    }

    function renderCategoryOptions() {
      const select = document.getElementById("categoryFilter");
      const current = select.value;
      select.innerHTML = "<option value=''>Все категории</option>" + state.categories.map(function(category) {
        return "<option value='" + escapeAttr(category) + "'>" + escapeHtml(category) + "</option>";
      }).join("");
      select.value = state.categories.includes(current) ? current : "";
    }

    function renderRecords() {
      const root = document.getElementById("records");
      document.getElementById("recordCount").textContent = plural(state.records.length, "запись", "записи", "записей");
      root.innerHTML = "";
      if (!state.records.length) {
        root.innerHTML = "<div class='empty'>Записей по выбранным фильтрам нет.</div>";
        return;
      }
      for (const item of state.records) {
        const tone = item.kind === "income" ? "income" : item.kind.indexOf("loan") >= 0 || item.kind.indexOf("borrow") >= 0 ? "debt" : "expense";
        const meta = formatDate(item.local_date) + " · ID " + item.id + " · " + [kindLabel(item.kind), item.category, item.subcategory].filter(Boolean).join(" · ");
        const element = row(item.description || item.raw_text || kindLabel(item.kind), meta, money(item.amount_minor), tone);
        element.classList.add("clickable");
        element.dataset.id = item.id;
        root.appendChild(element);
      }
    }

    function openSheet(item) {
      state.selected = item;
      const isDeleted = item.status === "deleted";
      document.getElementById("sheetTitle").textContent = item.description || item.raw_text || "Запись";
      document.getElementById("sheetSubtitle").textContent = "ID " + item.id + " · " + formatDate(item.local_date) + " · " + (isDeleted ? "удалена" : "активна");
      document.getElementById("sheetDetails").innerHTML = [
        detail("Сумма", money(item.amount_minor)),
        detail("Тип", kindLabel(item.kind)),
        detail("Категория", [item.category, item.subcategory].filter(Boolean).join(" · ") || "Не указана"),
        detail("Контрагент", item.counterparty || "Не указан"),
        detail("Дата", item.local_date),
        detail("Статус", isDeleted ? "Удалена" : "Активна"),
        detail("Исходный текст", item.raw_text || "", true)
      ].join("");
      document.getElementById("sheetAction").textContent = isDeleted ? "Восстановить" : "Удалить";
      document.getElementById("sheetAction").className = isDeleted ? "primary" : "danger";
      document.getElementById("sheetBackdrop").classList.add("open");
    }

    function closeSheet() {
      document.getElementById("sheetBackdrop").classList.remove("open");
      state.selected = null;
    }

    async function runSheetAction() {
      if (!state.selected) return;
      const action = state.selected.status === "deleted" ? "restore" : "delete";
      const ok = await confirmAction(action === "delete" ? "Удалить эту запись?" : "Восстановить эту запись?");
      if (!ok) return;
      const button = document.getElementById("sheetAction");
      button.disabled = true;
      try {
        await api("/api/transaction-action", { id: state.selected.id, action: action });
        closeSheet();
        await loadOverview();
        await loadRecords();
      } catch (error) {
        alert(error.message);
      } finally {
        button.disabled = false;
      }
    }

    function confirmAction(message) {
      if (tg && typeof tg.showConfirm === "function") {
        return new Promise(function(resolve) { tg.showConfirm(message, resolve); });
      }
      return Promise.resolve(window.confirm(message));
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

    function rowWithProgress(title, meta, amount, percent, color, tone) {
      const element = document.createElement("div");
      element.className = "row";
      element.innerHTML = "<div><div class='title'></div><div class='meta'></div><div class='progress'><div class='progress-fill'></div></div></div><div class='amount'></div>";
      element.querySelector(".title").textContent = title || "";
      element.querySelector(".meta").textContent = meta || "";
      const fill = element.querySelector(".progress-fill");
      fill.style.width = Math.max(4, percent || 0) + "%";
      fill.style.background = color || "#d96c86";
      const amountEl = element.querySelector(".amount");
      amountEl.textContent = amount || "";
      if (tone) amountEl.classList.add(tone);
      return element;
    }

    function detail(label, value, full) {
      return "<div class='detail" + (full ? " full" : "") + "'><div class='label'>" + escapeHtml(label) + "</div><div class='value'>" + escapeHtml(value || "—") + "</div></div>";
    }

    function selectedKzt(items) {
      return (items || []).find(function(item) { return item.currency === "KZT"; }) || {};
    }

    function firstKzt(items) {
      return kztItems(items)[0] || null;
    }

    function kztItems(items) {
      return (items || []).filter(function(item) { return !item.currency || item.currency === "KZT"; });
    }

    function buildDailySeries(summary) {
      const days = enumerateDates(summary.period.start, summary.period.end);
      const source = new Map();
      for (const item of summary.by_day || []) {
        if (item.currency !== "KZT") continue;
        source.set(item.local_date, item);
      }
      return days.map(function(date) {
        const item = source.get(date) || {};
        return {
          date: date,
          expense_minor: Number(item.expense_minor || 0),
          income_minor: Number(item.income_minor || 0)
        };
      });
    }

    function chartLabels(series, pad, plotW, step) {
      const maxLabels = Math.min(5, series.length);
      const every = Math.max(1, Math.ceil(series.length / maxLabels));
      const labels = [];
      for (let i = 0; i < series.length; i += 1) {
        if (i !== 0 && i !== series.length - 1 && i % every !== 0) continue;
        const x = pad.left + (series.length > 1 ? i * step : plotW / 2);
        labels.push("<text x='" + x.toFixed(2) + "' y='286' fill='#6f7785' font-size='16' font-weight='620' text-anchor='middle'>" + escapeHtml(shortDate(series[i].date)) + "</text>");
      }
      return labels.join("");
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

    function money(minor) {
      const amount = Number(minor || 0) / 100;
      return amount.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₸";
    }

    function shortMoney(minor) {
      const amount = Number(minor || 0) / 100;
      if (amount >= 1000000) return (amount / 1000000).toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " млн";
      if (amount >= 1000) return (amount / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " тыс";
      return amount.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
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
      return formatDate(start) + " — " + formatDate(end);
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

    function showAccessError(message) {
      document.getElementById("profile").textContent = "Ошибка доступа";
      document.getElementById("heroSpend").textContent = "Нет данных";
      document.getElementById("heroMeta").textContent = message;
      document.getElementById("metrics").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("dailyChart").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("records").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("familyHelp").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("debtsFull").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
    }

    function escapeHtml(value) {
      return String(value == null ? "" : value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    function escapeAttr(value) {
      return escapeHtml(value).replaceAll("'", "&#39;");
    }

    loadAll();
  </script>
</body>
</html>`;
}

export const miniAppClientScript = `
    const tg = window.Telegram && window.Telegram.WebApp;
    const appTabs = ["overview", "records", "import", "debts"];
    const importFilters = ["attention", "history", "duplicates", "skipped"];
    const colors = ["var(--category-a)", "var(--category-b)", "var(--category-c)", "var(--category-d)", "var(--category-e)"];
    const recordViews = ["feed", "table", "groups"];
    const sortFields = ["date", "amount", "kind", "category", "counterparty", "id"];
    const storageKeys = {
      recordView: "residualmap.recordView",
      density: "residualmap.recordDensity",
      sort: "residualmap.recordSort"
    };
    const state = {
      period: "month",
      tab: initialTabFromLocation(),
      kindPreset: "all",
      importFilter: "attention",
      targetBatchId: initialBatchFromLocation(),
      highlightedBatchId: null,
      recordView: normalizeRecordView(readPref(storageKeys.recordView, "feed")),
      density: normalizeDensity(readPref(storageKeys.density, "comfortable")),
      sort: normalizeSort(readJsonPref(storageKeys.sort, { field: "date", dir: "desc" })),
      data: null,
      records: [],
      imports: [],
      importErrors: {},
      categories: [],
      selected: null,
      searchTimer: null,
      resizeTimer: null,
      lastFocus: null,
      backHandler: null
    };

    setupTelegramShell();
    bindEvents();
    applyRecordPreferences();
    syncTabsAndPanels(state.tab);
    loadAll();

    function bindEvents() {
      $("periods").addEventListener("click", function(event) {
        const button = event.target.closest("button[data-period]");
        if (!button) return;
        state.period = button.dataset.period;
        setActive("#periods button", button);
        loadAll();
      });

      $("tabs").addEventListener("click", function(event) {
        const button = event.target.closest("button[data-tab]");
        if (!button) return;
        switchTab(button.dataset.tab);
      });
      $("tabs").addEventListener("keydown", handleTabsKeydown);
      $("importAttention").addEventListener("click", function(event) {
        const button = event.target.closest("button[data-open-tab]");
        if (!button) return;
        switchTab(button.dataset.openTab);
      });

      $("refresh").addEventListener("click", loadAll);
      $("refreshImports").addEventListener("click", loadImports);
      $("importFilters").addEventListener("click", function(event) {
        const button = event.target.closest("button[data-import-filter]");
        if (!button) return;
        state.importFilter = normalizeImportFilter(button.dataset.importFilter);
        syncImportFilterButtons();
        renderImports();
      });
      $("clearSearch").addEventListener("click", function() {
        const input = $("recordSearch");
        input.value = "";
        input.focus();
        loadRecords();
      });
      $("statusFilter").addEventListener("change", loadRecords);
      $("categoryFilter").addEventListener("change", loadRecords);
      $("kindQuick").addEventListener("click", function(event) {
        const button = event.target.closest("button[data-kind-preset]");
        if (!button) return;
        state.kindPreset = button.dataset.kindPreset || "all";
        setActive("#kindQuick button", button);
        loadRecords();
      });
      $("recordViewSwitch").addEventListener("click", function(event) {
        const button = event.target.closest("button[data-record-view]");
        if (!button) return;
        state.recordView = normalizeRecordView(button.dataset.recordView);
        writePref(storageKeys.recordView, state.recordView);
        applyRecordPreferences();
        renderRecords();
      });
      $("densityToggle").addEventListener("click", function() {
        state.density = state.density === "compact" ? "comfortable" : "compact";
        writePref(storageKeys.density, state.density);
        applyRecordPreferences();
        renderRecords();
      });
      $("recordSearch").addEventListener("input", function() {
        clearTimeout(state.searchTimer);
        state.searchTimer = setTimeout(loadRecords, 220);
      });
      $("recordsCanvas").addEventListener("click", handleRecordsAction);
      $("importsCanvas").addEventListener("click", handleImportAction);
      $("recordsCanvas").addEventListener("keydown", function(event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        const row = event.target.closest("[data-id]");
        if (!row) return;
        event.preventDefault();
        openRecordById(row.dataset.id);
      });
      $("closeSheet").addEventListener("click", closeSheet);
      $("sheetCloseAction").addEventListener("click", closeSheet);
      $("sheetSave").addEventListener("click", runSheetSave);
      $("sheetAction").addEventListener("click", runSheetAction);
      $("sheetBackdrop").addEventListener("click", function(event) {
        if (event.target.id === "sheetBackdrop") closeSheet();
      });
      $("sheetBackdrop").addEventListener("keydown", handleSheetKeydown);
      window.addEventListener("resize", scheduleChartRerender);
    }

    function switchTab(tab) {
      const button = document.querySelector("[data-tab='" + tab + "']");
      if (!button) return;
      state.tab = button.dataset.tab;
      syncTabsAndPanels(state.tab);
      if (state.tab === "records") loadRecords();
      if (state.tab === "import") loadImports();
      if (state.tab === "overview") scheduleChartRerender();
    }

    function syncTabsAndPanels(tab) {
      const activeTab = appTabs.includes(tab) ? tab : "overview";
      for (const button of document.querySelectorAll("#tabs button[data-tab]")) {
        const isActive = button.dataset.tab === activeTab;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      }
      for (const view of document.querySelectorAll(".view")) {
        const isActive = view.id === "view-" + activeTab;
        view.classList.toggle("active", isActive);
        view.hidden = !isActive;
        view.setAttribute("aria-hidden", String(!isActive));
      }
    }

    function handleTabsKeydown(event) {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const buttons = Array.from(document.querySelectorAll("#tabs button[data-tab]"));
      const current = buttons.indexOf(document.activeElement);
      if (current === -1) return;
      event.preventDefault();
      let next = current;
      if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
      if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = buttons.length - 1;
      buttons[next].focus();
      switchTab(buttons[next].dataset.tab);
    }

    function initialTabFromLocation() {
      try {
        const url = new URL(window.location.href);
        const queryTab = normalizeTab(url.searchParams.get("tab"));
        if (queryTab) return queryTab;
        const hashValue = decodeURIComponent((url.hash || "").replace(/^#/, ""));
        const hashTab = normalizeTab(hashValue.split("?")[0]);
        if (hashTab) return hashTab;
        if (url.searchParams.get("batch") || url.searchParams.get("batch_id")) return "import";
      } catch (error) {}
      return "overview";
    }

    function initialBatchFromLocation() {
      try {
        const url = new URL(window.location.href);
        const queryBatch = Number(url.searchParams.get("batch") || url.searchParams.get("batch_id") || 0);
        if (queryBatch > 0) return queryBatch;
        const hashValue = decodeURIComponent((url.hash || "").replace(/^#/, ""));
        const queryIndex = hashValue.indexOf("?");
        if (queryIndex !== -1) {
          const params = new URLSearchParams(hashValue.slice(queryIndex + 1));
          const hashBatch = Number(params.get("batch") || params.get("batch_id") || 0);
          if (hashBatch > 0) return hashBatch;
        }
      } catch (error) {}
      return null;
    }

    function normalizeTab(value) {
      return appTabs.includes(value) ? value : "";
    }

    function $(id) {
      return document.getElementById(id);
    }

    function setActive(selector, active) {
      for (const item of document.querySelectorAll(selector)) {
        const isActive = item === active;
        item.classList.toggle("active", isActive);
        if (item.hasAttribute("aria-pressed")) item.setAttribute("aria-pressed", String(isActive));
        if (item.getAttribute("role") === "tab") item.setAttribute("aria-selected", String(isActive));
      }
    }

    function applyRecordPreferences() {
      for (const button of document.querySelectorAll("[data-record-view]")) {
        const isActive = button.dataset.recordView === state.recordView;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      }
      const compact = state.density === "compact";
      $("densityToggle").setAttribute("aria-pressed", String(compact));
      $("densityToggle").textContent = compact ? "Комфортно" : "Компактно";
      updateRecordsCanvasClass();
    }

    function updateRecordsCanvasClass() {
      $("recordsCanvas").className = "records-canvas view-" + state.recordView + " density-" + state.density;
    }

    function setupTelegramShell() {
      applyTelegramTheme();
      if (!tg) return;
      tg.ready();
      tg.expand();
      if (tg.MainButton) tg.MainButton.hide();
      if (typeof tg.setHeaderColor === "function") {
        try { tg.setHeaderColor("secondary_bg_color"); } catch (error) {}
      }
      if (typeof tg.setBackgroundColor === "function") {
        try { tg.setBackgroundColor("bg_color"); } catch (error) {}
      }
      if (typeof tg.setBottomBarColor === "function") {
        try { tg.setBottomBarColor("secondary_bg_color"); } catch (error) {}
      }
      if (typeof tg.onEvent === "function") {
        tg.onEvent("themeChanged", applyTelegramTheme);
        tg.onEvent("viewportChanged", scheduleChartRerender);
      }
    }

    function applyTelegramTheme() {
      const root = document.documentElement;
      const params = tg && tg.themeParams ? tg.themeParams : {};
      root.dataset.scheme = tg && tg.colorScheme ? tg.colorScheme : "";
      setCssVar("--bg", params.bg_color);
      setCssVar("--surface", params.secondary_bg_color || params.bg_color);
      setCssVar("--surface-raised", params.secondary_bg_color || params.bg_color);
      setCssVar("--text", params.text_color);
      setCssVar("--muted", params.hint_color);
      setCssVar("--accent", params.button_color);
      setCssVar("--accent-text", params.button_text_color);
      setCssVar("--line", params.section_separator_color);
    }

    function setCssVar(name, value) {
      if (value) document.documentElement.style.setProperty(name, value);
    }

    function scheduleChartRerender() {
      clearTimeout(state.resizeTimer);
      state.resizeTimer = setTimeout(function() {
        if (state.data && state.tab === "overview") renderDailyChart(state.data.summary);
      }, 120);
    }

    function setLoadingState(isLoading, message) {
      const button = $("refresh");
      button.disabled = isLoading;
      button.classList.toggle("loading", isLoading);
      $("syncStatus").textContent = message || (isLoading ? "Обновление..." : "Данные актуальны");
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
      setLoadingState(true, "Обновление...");
      try {
        await loadOverview();
        if (state.tab === "records") await loadRecords();
        if (state.tab === "import") await loadImports();
        setLoadingState(false, "Обновлено только что");
      } catch (error) {
        setLoadingState(false, "Не удалось обновить");
        showAccessError(error.message);
      } finally {
        $("refresh").disabled = false;
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
      updateRecordsCanvasClass();
      $("recordsCanvas").innerHTML = "<div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div>";
      try {
        const data = await api("/api/transactions", {
          period: state.period,
          status: $("statusFilter").value,
          kind: state.kindPreset === "expense" || state.kindPreset === "income" ? state.kindPreset : "all",
          kind_group: state.kindPreset === "debt" ? "debt" : "all",
          category: $("categoryFilter").value,
          query: $("recordSearch").value,
          limit: 50
        });
        state.records = data.items || [];
        state.categories = data.categories || [];
        renderCategoryOptions();
        renderRecords();
      } catch (error) {
        $("recordsCanvas").innerHTML = "<div class='error' role='alert'>" + escapeHtml(error.message) + "</div>";
      }
    }

    async function loadImports() {
      if (!initData()) return;
      setImportRefreshLoading(true);
      renderImportLoading();
      try {
        const data = await api("/api/imports", { limit: 12 });
        state.imports = data.imports || [];
        syncImportTargetFilter();
        renderImports();
        requestImportBatchFocus();
        updateImportsTab({ draft_count: data.draft_count || 0, latest: state.imports[0] || null });
      } catch (error) {
        state.imports = [];
        $("importCount").textContent = "ошибка загрузки";
        renderImportError(error.message);
      } finally {
        setImportRefreshLoading(false);
      }
    }

    function renderOverview(data) {
      const summary = data.summary;
      const total = selectedKzt(summary.totals_by_currency || []);
      const expense = Number(total.expense_minor || 0);
      const income = Number(total.income_minor || 0);
      const net = income - expense;
      const topCategory = firstKzt(summary.category_totals || []);
      const topCategoryPct = topCategory && expense ? Math.round(Number(topCategory.amount_minor || 0) / expense * 100) : 0;
      const importsSummary = data.imports_summary || {};
      const draftImportCount = Number(importsSummary.draft_count || 0);
      const latestImport = importsSummary.latest || null;
      $("profile").textContent = "KZT · " + (data.user.timezone || "Asia/Qyzylorda");
      $("periodName").textContent = summary.period.label;
      $("heroSpend").textContent = money(expense);
      $("heroMeta").textContent = "Личные расходы · " + formatRange(summary.period.start, summary.period.end) + " · " + plural(summary.transaction_count || 0, "запись", "записи", "записей");
      $("netFlow").textContent = signedMoney(net);
      $("sideNote").textContent = "Доходы минус личные расходы.";
      $("rangeLabel").textContent = formatRange(summary.period.start, summary.period.end);
      updateDebtsTab(data.debts || []);
      updateImportsTab(importsSummary);
      renderImportAttention(importsSummary);
      $("metrics").innerHTML = [
        metric("Доходы", money(income), "поступления", "income"),
        metric("Чистый поток", signedMoney(net), "доходы минус расходы", net >= 0 ? "income" : "expense"),
        metric("Топ категория", topCategory ? topCategory.category : "Пока нет", topCategory ? topCategoryPct + "% · " + money(topCategory.amount_minor) : "нет расходов"),
        metric("Импорт", draftImportCount > 0 ? draftImportCount + " черн." : latestImport ? importStatusLabel(latestImport.status) : "Нет",
          draftImportCount > 0 ? "требует решения" : latestImport ? (latestImport.file_name || "последняя выписка") : "PDF можно отправить боту",
          draftImportCount > 0 ? "debt" : "")
      ].join("");

      renderDailyChart(summary);
      renderCategoryTotals(summary.category_totals || []);
      renderCategories(summary.categories || []);
      renderLargest(summary.largest_expenses || []);
      renderFamilyHelp(summary.family_help || [], summary.family_help_counterparties || []);
      renderDebts(data.debts || [], "debtsFull", 50);
    }

    function updateDebtsTab(items) {
      const button = document.querySelector("[data-tab='debts']");
      button.classList.toggle("has-data", hasOpenDebts(items));
    }

    function updateImportsTab(summary) {
      const button = document.querySelector("[data-tab='import']");
      if (!button) return;
      button.classList.toggle("has-data", Number(summary && summary.draft_count || 0) > 0);
    }

    function renderImportAttention(summary) {
      const root = $("importAttention");
      const latest = summary && summary.latest;
      const draftCount = Number(summary && summary.draft_count || 0);
      if (!root || draftCount <= 0) {
        root.hidden = true;
        if (root) root.innerHTML = "";
        return;
      }
      const importable = latest ? Number(latest.importable_count || 0) : 0;
      const duplicateCount = latest ? Number(latest.duplicate_count || 0) : 0;
      const meta = latest
        ? [
            latest.file_name || "PDF-выписка",
            importPeriod(latest),
            "к записи " + importable,
            duplicateCount > 0 ? "дубли " + duplicateCount : ""
          ].filter(Boolean).join(" · ")
        : "Откройте импорт и примите решение по черновикам.";
      root.hidden = false;
      root.innerHTML =
        "<div class='notice-main'><div class='notice-kicker'>Нужно решение</div><div class='notice-title'>" + escapeHtml(plural(draftCount, "черновик импорта", "черновика импорта", "черновиков импорта")) + "</div>" +
        "<div class='notice-meta'>" + escapeHtml(meta) + "</div></div>" +
        "<button class='secondary' type='button' data-open-tab='import'><span class='button-label'>Проверить</span></button>";
    }

    function hasOpenDebts(items) {
      return kztItems(items).some(function(item) {
        return Number(item.receivable_minor || 0) > 0 || Number(item.payable_minor || 0) > 0;
      });
    }

    function metric(label, value, hint, tone) {
      return "<article class='metric-card'><div class='label'>" + escapeHtml(label) + "</div><div class='value" + (tone ? " " + escapeAttr(tone) : "") + "'>" + escapeHtml(value) + "</div><div class='hint'>" + escapeHtml(hint || "") + "</div></article>";
    }

    function showOverviewSkeletons() {
      $("importAttention").hidden = true;
      $("metrics").innerHTML = "<div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div>";
      $("dailyChart").innerHTML = "<div class='skeleton'></div>";
      $("categoryTotals").innerHTML = "<div class='skeleton'></div>";
      $("categories").innerHTML = "<div class='skeleton'></div>";
      $("largest").innerHTML = "<div class='skeleton'></div>";
      $("familyHelpPanel").hidden = true;
      $("familyHelp").innerHTML = "<div class='skeleton'></div>";
    }

    function renderDailyChart(summary) {
      const root = $("dailyChart");
      const series = buildDailySeries(summary);
      const hasValues = series.some(function(item) { return item.expense_minor > 0 || item.income_minor > 0; });
      if (!hasValues) {
        root.innerHTML = "<div class='empty'>За этот период пока нет личных расходов или доходов. Добавьте запись в чате, и график появится здесь.</div>";
        return;
      }
      if (series.length <= 3) {
        root.innerHTML = "<div class='day-cards'>" + series.map(function(item) {
          return "<article class='record-card'><div><div class='record-title'>" + escapeHtml(formatDate(item.date)) + "</div><div class='record-meta'>" + escapeHtml(item.income_minor > 0 ? money(item.income_minor) + " доход" : "доходов нет") + "</div></div><div class='record-side'><div class='amount expense'>" + escapeHtml(money(item.expense_minor)) + "</div></div></article>";
        }).join("") + "</div>";
        return;
      }
      const width = Math.max(320, Math.min(720, Math.round(root.getBoundingClientRect().width || root.clientWidth || 360)));
      const height = series.length <= 7 ? 230 : 210;
      const pad = { left: 48, right: 16, top: 26, bottom: 40 };
      const plotW = width - pad.left - pad.right;
      const plotH = height - pad.top - pad.bottom;
      const max = Math.max.apply(null, series.map(function(item) { return Math.max(item.expense_minor, item.income_minor); }).concat([1]));
      const step = series.length > 1 ? plotW / (series.length - 1) : plotW;
      const barW = Math.max(5, Math.min(24, plotW / Math.max(series.length, 1) * .58));
      const incomePoints = [];
      const hasIncome = series.some(function(item) { return item.income_minor > 0; });
      let bars = "";
      let valueLabels = "";
      let peak = series[0];
      for (let i = 0; i < series.length; i += 1) {
        const item = series[i];
        if (item.expense_minor > peak.expense_minor) peak = item;
        const x = pad.left + (series.length > 1 ? i * step : plotW / 2);
        const expenseH = item.expense_minor / max * plotH;
        const barHeight = expenseH > 0 ? Math.max(2, expenseH) : 0;
        const barY = pad.top + plotH - barHeight;
        bars += "<rect class='chart-bar' style='animation-delay:" + Math.min(i * 18, 260) + "ms' x='" + (x - barW / 2).toFixed(2) + "' y='" + barY.toFixed(2) + "' width='" + barW.toFixed(2) + "' height='" + barHeight.toFixed(2) + "' rx='4' fill='var(--expense)'></rect>";
        if (item.expense_minor > 0 && series.length <= 7) {
          valueLabels += "<text x='" + x.toFixed(2) + "' y='" + Math.max(18, barY - 8).toFixed(2) + "' fill='var(--expense)' font-size='13' font-weight='760' text-anchor='middle'>" + escapeHtml(shortMoney(item.expense_minor)) + "</text>";
        }
        incomePoints.push([x, pad.top + plotH - item.income_minor / max * plotH]);
      }
      const incomePath = incomePoints.map(function(point, index) { return (index === 0 ? "M" : "L") + point[0].toFixed(2) + " " + point[1].toFixed(2); }).join(" ");
      const grid = [0, .25, .5, .75, 1].map(function(part) {
        const y = pad.top + plotH * part;
        return "<line x1='" + pad.left + "' y1='" + y.toFixed(2) + "' x2='" + (width - pad.right) + "' y2='" + y.toFixed(2) + "' stroke='var(--line)' stroke-width='1'></line>";
      }).join("");
      root.innerHTML =
        "<svg class='chart-svg' viewBox='0 0 " + width + " " + height + "' width='" + width + "' height='" + height + "' role='img' aria-label='Динамика личных расходов и доходов'>" +
        "<rect x='0' y='0' width='" + width + "' height='" + height + "' rx='8' fill='var(--surface)'></rect>" +
        grid +
        "<text x='8' y='22' fill='var(--muted)' font-size='13' font-weight='720'>" + escapeHtml(shortMoney(max)) + "</text>" +
        bars +
        valueLabels +
        (hasIncome ? "<path d='" + incomePath + "' fill='none' stroke='var(--income)' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'></path>" : "") +
        (hasIncome ? incomePoints.map(function(point) { return "<circle cx='" + point[0].toFixed(2) + "' cy='" + point[1].toFixed(2) + "' r='4' fill='var(--income)' stroke='var(--surface)' stroke-width='2'></circle>"; }).join("") : "") +
        chartLabels(series, pad, plotW, step, height) +
        "</svg><div class='chart-readout'>Максимальный день: " + escapeHtml(formatDate(peak.date)) + " · " + escapeHtml(money(peak.expense_minor)) + "</div>";
    }

    function renderCategoryTotals(items) {
      const root = $("categoryTotals");
      const donut = $("donut");
      const totalEl = $("donutTotal");
      const filtered = kztItems(items).filter(function(item) { return Number(item.amount_minor || 0) > 0; });
      const total = filtered.reduce(function(sum, item) { return sum + Number(item.amount_minor || 0); }, 0);
      totalEl.textContent = money(total);
      if (!filtered.length) {
        donut.style.background = "conic-gradient(color-mix(in srgb, var(--muted) 22%, transparent) 0deg 360deg)";
        root.innerHTML = "<div class='empty'>Категории появятся после первой личной траты в выбранном периоде.</div>";
        return;
      }
      let start = 0;
      donut.style.background = "conic-gradient(" + filtered.map(function(item, index) {
        const end = start + Number(item.amount_minor || 0) / total * 360;
        const part = colors[index % colors.length] + " " + start.toFixed(2) + "deg " + end.toFixed(2) + "deg";
        start = end;
        return part;
      }).join(", ") + ")";
      root.innerHTML = "";
      for (let index = 0; index < Math.min(filtered.length, 5); index += 1) {
        const item = filtered[index];
        const pct = total ? Math.round(Number(item.amount_minor || 0) / total * 100) : 0;
        root.appendChild(categoryRow(item.category, pct, plural(item.count || 0, "запись", "записи", "записей"), money(item.amount_minor), colors[index % colors.length]));
      }
      if (filtered.length > 5) {
        const note = document.createElement("div");
        note.className = "meta";
        note.textContent = "Ещё " + (filtered.length - 5) + " категорий есть в детализации ниже.";
        root.appendChild(note);
      }
    }

    function renderCategories(items) {
      const root = $("categories");
      const filtered = kztItems(items);
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Подкатегорий пока нет.</div>";
        return;
      }
      const max = Math.max.apply(null, filtered.map(function(item) { return Number(item.amount_minor || 0); }).concat([1]));
      root.innerHTML = "";
      for (const item of filtered.slice(0, 8)) {
        root.appendChild(rowWithProgress(item.category + " · " + item.subcategory, plural(item.count || 0, "запись", "записи", "записей"), money(item.amount_minor), Number(item.amount_minor || 0) / max * 100, "var(--expense)", "expense"));
      }
    }

    function renderLargest(items) {
      const root = $("largest");
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
      const panel = $("familyHelpPanel");
      const root = $("familyHelp");
      $("familyHelpTotal").textContent = money(totalMinor);
      root.innerHTML = "";
      if (totalMinor <= 0) {
        panel.hidden = true;
        return;
      }
      panel.hidden = false;
      const filtered = kztItems(counterparties);
      if (!filtered.length) {
        root.appendChild(row("Помощь семье", plural(total.count || 0, "запись", "записи", "записей"), money(totalMinor), "support"));
        return;
      }
      for (const item of filtered) {
        root.appendChild(row(item.counterparty || "Без имени", plural(item.count || 0, "запись", "записи", "записей"), money(item.amount_minor), "support"));
      }
    }

    function renderDebts(items, targetId, maxItems) {
      const root = $(targetId);
      const filtered = kztItems(items);
      root.innerHTML = "";
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Открытых долгов нет.</div>";
        return;
      }
      const receivable = filtered.filter(function(item) { return Number(item.receivable_minor) > 0; });
      const payable = filtered.filter(function(item) { return Number(item.payable_minor) > 0; });
      appendDebtSection(root, "Мне должны", receivable, "receivable_minor", "должен вам", maxItems);
      appendDebtSection(root, "Я должен", payable, "payable_minor", "вы должны", maxItems);
    }

    function appendDebtSection(root, title, items, field, meta, maxItems) {
      if (!items.length) return;
      const section = document.createElement("section");
      section.className = "date-group";
      const heading = document.createElement("div");
      heading.className = "date-group-head";
      heading.innerHTML = "<div class='date-title'></div><div class='date-total'></div>";
      heading.querySelector(".date-title").textContent = title;
      heading.querySelector(".date-total").textContent = plural(items.length, "контрагент", "контрагента", "контрагентов");
      section.appendChild(heading);
      for (const item of items.slice(0, maxItems || 50)) {
        section.appendChild(row(item.counterparty || "Без имени", meta, money(item[field]), "debt"));
      }
      root.appendChild(section);
    }

    function renderCategoryOptions() {
      const select = $("categoryFilter");
      const current = select.value;
      select.innerHTML = "<option value=''>Все категории</option>" + state.categories.map(function(category) {
        return "<option value='" + escapeAttr(category) + "'>" + escapeHtml(category) + "</option>";
      }).join("");
      select.value = state.categories.includes(current) ? current : "";
    }

    function renderRecords() {
      updateRecordsCanvasClass();
      $("recordCount").textContent = plural(state.records.length, "запись", "записи", "записей") + " · до 50 за период";
      renderRecordFilterChips();
      if (!state.records.length) {
        $("recordsCanvas").innerHTML = "<div class='empty records-empty'><div class='empty-title'>Записей по выбранным фильтрам нет</div><div class='empty-meta'>Сбросьте фильтры или выберите другой период.</div><button class='secondary' type='button' data-reset-record-filters><span class='button-label'>Сбросить фильтры</span></button></div>";
        return;
      }
      const sorted = sortRecords(state.records);
      if (state.recordView === "table") {
        renderTableRecords(sorted);
      } else if (state.recordView === "groups") {
        renderGroupedRecords(sorted);
      } else {
        renderFeedRecords(sorted);
      }
    }

    function renderImports() {
      const root = $("importsCanvas");
      const draftCount = state.imports.filter(function(batch) { return batch.status === "draft"; }).length;
      const visibleImports = filteredImports();
      syncImportFilterButtons();
      $("importCount").textContent = draftCount > 0
        ? plural(draftCount, "черновик", "черновика", "черновиков") + " · " + plural(state.imports.length, "импорт", "импорта", "импортов")
        : plural(state.imports.length, "импорт", "импорта", "импортов");
      if (!state.imports.length) {
        root.innerHTML = "<div class='empty import-empty'><div class='empty-title'>Нет черновиков импорта</div><div class='empty-meta'>Отправьте PDF-выписку боту в Telegram. Здесь появится черновик для проверки перед записью.</div></div>";
        return;
      }
      if (!visibleImports.length) {
        root.innerHTML = "<div class='empty import-empty'><div class='empty-title'>В этом фильтре пусто</div><div class='empty-meta'>" + escapeHtml(importFilterEmptyText(state.importFilter)) + "</div></div>";
        return;
      }
      root.innerHTML = "";
      const fragment = document.createDocumentFragment();
      for (const batch of visibleImports) fragment.appendChild(importCard(batch));
      root.appendChild(fragment);
    }

    function renderImportLoading() {
      $("importsCanvas").innerHTML =
        "<div class='import-loading' role='status' aria-live='polite' aria-busy='true'>" +
          "<div class='skeleton import-skeleton'></div>" +
          "<div class='skeleton import-skeleton'></div>" +
          "<div class='loading-copy'>Загружаю черновики и историю импорта...</div>" +
        "</div>";
    }

    function renderImportError(message) {
      $("importsCanvas").innerHTML =
        "<div class='error import-error' role='alert'><div class='empty-title'>Импорт не загрузился</div>" +
        "<div class='empty-meta'>" + escapeHtml(message || "Повторите обновление импорта.") + "</div></div>";
    }

    function importCard(batch) {
      const element = document.createElement("article");
      const status = batch.status || "draft";
      const importable = Number(batch.importable_count || 0);
      const duplicateCount = Number(batch.duplicate_count || 0);
      const skippedCount = Number(batch.skipped_count || 0);
      const summaryStatus = status === "draft"
        ? (importable > 0 ? "готово к записи " + importable : "нет строк к записи")
        : importHistoryLine(batch);
      element.className = "import-card import-" + status;
      if (Number(batch.id) === Number(state.highlightedBatchId)) element.classList.add("is-target");
      element.dataset.importBatchId = batch.id;
      element.id = "import-batch-" + batch.id;
      element.tabIndex = -1;
      element.innerHTML =
        "<div class='import-card-head'>" +
          "<div class='import-title-wrap'><div class='import-title'></div><div class='import-subtitle'></div></div>" +
          "<span class='status-badge status-" + escapeAttr(status) + "'>" + escapeHtml(importStatusLabel(status)) + "</span>" +
        "</div>" +
        "<div class='import-facts'>" +
          importFact("Период", importPeriod(batch)) +
          importFact("Строки", String(batch.item_count || 0)) +
          importFact("Статус", summaryStatus, status === "draft" && importable > 0 ? "debt" : "") +
          importFact("К записи", String(importable), importable > 0 ? "debt" : "") +
          importFact("Дубли", String(duplicateCount), duplicateCount > 0 ? "duplicate" : "") +
          importFact("Пропущено", String(skippedCount), skippedCount > 0 ? "skipped" : "") +
          importFact("Расход", money(batch.expense_minor || 0), "expense") +
          importFact("Доход", money(batch.income_minor || 0), "income") +
          importFact("Импортировано", String(batch.import_count || 0)) +
        "</div>" +
        importDecisionSummary(batch, importable, duplicateCount, skippedCount) +
        importNotices(batch) +
        importInlineError(batch) +
        importPreviewSection(batch) +
        importActions(batch, importable);
      element.querySelector(".import-title").textContent = batch.file_name || batch.source_name || "PDF-выписка";
      element.querySelector(".import-subtitle").textContent = [
        batch.source_name,
        batch.created_at ? "создан " + formatDateTime(batch.created_at) : "",
        batch.confirmed_at ? "подтвержден " + formatDateTime(batch.confirmed_at) : "",
        batch.cancelled_at ? "отменен " + formatDateTime(batch.cancelled_at) : ""
      ].filter(Boolean).join(" · ");
      return element;
    }

    function importFact(label, value, tone) {
      return "<div class='import-fact'><div class='label'>" + escapeHtml(label) + "</div><div class='value" + (tone ? " " + escapeAttr(tone) : "") + "'>" + escapeHtml(value || "0") + "</div></div>";
    }

    function importDecisionSummary(batch, importable, duplicateCount, skippedCount) {
      if (batch.status !== "draft") return "";
      const title = importable > 0
        ? plural(importable, "строка готова к записи", "строки готовы к записи", "строк готовы к записи")
        : "Нет строк, которые можно импортировать";
      const meta = [
        duplicateCount > 0 ? plural(duplicateCount, "дубль будет пропущен", "дубля будут пропущены", "дублей будут пропущены") : "",
        skippedCount > 0 ? plural(skippedCount, "пропуск требует ручной проверки", "пропуска требуют ручной проверки", "пропусков требуют ручной проверки") : "",
        importable > 0 ? "Подтвердите импорт или отмените черновик." : "Черновик можно отменить."
      ].filter(Boolean).join(" · ");
      return "<div class='import-decision-summary'><strong>" + escapeHtml(title) + "</strong><span>" + escapeHtml(meta) + "</span></div>";
    }

    function importInlineError(batch) {
      const message = state.importErrors[String(batch.id)];
      if (!message) return "";
      return "<div class='error import-inline-error' role='alert'>" + escapeHtml(message) + "</div>";
    }

    function importNotices(batch) {
      const notices = [];
      const duplicateCount = Number(batch.duplicate_count || 0);
      const skippedCount = Number(batch.skipped_count || 0);
      if (batch.truncated) {
        notices.push(importNotice("truncated", "Обрезано", batch.warning || "Выписка длинная: показана и обработана ограниченная часть строк."));
      } else if (batch.warning) {
        notices.push(importNotice("warning", "Предупреждение", batch.warning));
      }
      if (duplicateCount > 0) notices.push(importNotice("duplicate", "Дубли", plural(duplicateCount, "строка похожа на существующую запись", "строки похожи на существующие записи", "строк похожи на существующие записи")));
      if (skippedCount > 0) notices.push(importNotice("skipped", "Пропущено", plural(skippedCount, "строка не готова к записи", "строки не готовы к записи", "строк не готовы к записи")));
      if (!notices.length) return "";
      return "<div class='import-notices'>" + notices.join("") + "</div>";
    }

    function importNotice(type, title, text) {
      return "<div class='import-notice notice-" + escapeAttr(type) + "'><span>" + escapeHtml(title) + "</span><p>" + escapeHtml(text) + "</p></div>";
    }

    function importPreviewSection(batch) {
      const items = batch.items || [];
      const historySummary = batch.status !== "draft" ? importHistorySummary(batch) : "";
      if (!items.length) {
        if (historySummary) return historySummary;
        return "<div class='import-preview'><div class='empty compact'>В черновике нет строк для предпросмотра.</div></div>";
      }
      return historySummary + "<div class='import-preview-head'><span>" + escapeHtml("Показано " + items.length + " из " + (batch.item_count || items.length)) + "</span><span>" + escapeHtml(importPreviewStatusText(batch)) + "</span></div>" +
        "<div class='import-preview' aria-label='Предпросмотр строк импорта'>" + importPreviewRows(items) + "</div>";
    }

    function importPreviewRows(items) {
      return items.map(function(item) {
        const title = item.description || item.counterparty || item.raw_text || "Операция";
        const category = [item.category, item.subcategory].filter(Boolean).join(" · ") || "Без категории";
        const tone = item.kind === "income" ? "income" : "expense";
        const status = item.status || "draft";
        const reason = importItemReason(item);
        return "<div class='import-row status-" + escapeAttr(status) + "'>" +
          "<div class='import-row-main'><div class='import-row-title'><div class='record-title'>" + escapeHtml(title) + "</div>" +
          "<span class='status-badge row-status status-" + escapeAttr(status) + "'>" + escapeHtml(importItemStatusLabel(status)) + "</span></div>" +
          "<div class='record-meta'>" + escapeHtml([formatDate(item.local_date), category, item.counterparty].filter(Boolean).join(" · ")) + "</div>" +
          (reason ? "<div class='import-row-reason'>" + escapeHtml(reason) + "</div>" : "") + "</div>" +
          "<div class='record-side'><div class='amount " + tone + "'>" + escapeHtml(money(item.amount_minor || 0)) + "</div>" +
          "<div class='record-id'>" + escapeHtml(kindLabel(item.kind)) + "</div></div>" +
        "</div>";
      }).join("");
    }

    function importPreviewStatusText(batch) {
      if (batch.status === "draft") return "проверьте строки перед записью";
      if (batch.status === "confirmed") return "снимок истории";
      if (batch.status === "cancelled") return "черновик был отменен";
      return importStatusLabel(batch.status);
    }

    function importItemReason(item) {
      if (item.status_reason) return item.status_reason;
      if (item.status === "duplicate") {
        return item.duplicate_transaction_id
          ? "Похоже на уже записанную операцию #" + item.duplicate_transaction_id
          : "Похоже на уже записанную операцию";
      }
      if (item.status === "skipped") return "Строка не готова к автоматической записи";
      if (item.status === "cancelled") return "Отменено вместе с черновиком";
      if (item.status === "imported") return "Уже записано в операции";
      if (item.status === "draft") return "Будет записано после подтверждения";
      return "";
    }

    function importActions(batch, importable) {
      if (batch.status !== "draft") return "";
      const confirmDisabled = importable <= 0 ? " disabled data-import-disabled='true'" : "";
      return "<div class='import-actions'>" +
        "<button class='primary' type='button' data-import-action='confirm' data-id='" + escapeAttr(batch.id) + "' data-loading-label='Импорт...'" + confirmDisabled + "><span class='button-label'>Импортировать</span></button>" +
        "<button class='danger' type='button' data-import-action='cancel' data-id='" + escapeAttr(batch.id) + "' data-loading-label='Отмена...'><span class='button-label'>Отменить</span></button>" +
      "</div>";
    }

    async function handleImportAction(event) {
      const button = event.target.closest("button[data-import-action][data-id]");
      if (!button) return;
      const action = button.dataset.importAction;
      const batchId = Number(button.dataset.id);
      const batch = state.imports.find(function(item) { return Number(item.id) === batchId; }) || {};
      const question = action === "confirm"
        ? "Импортировать строки из черновика " + (batch.file_name || ("#" + batchId)) + "?"
        : "Отменить черновик импорта " + (batch.file_name || ("#" + batchId)) + "?";
      const ok = await confirmAction(question);
      if (!ok) return;
      let succeeded = false;
      delete state.importErrors[String(batchId)];
      setImportActionState(batchId, action, true);
      try {
        await api("/api/import-action", { batch_id: batchId, action: action });
        notifySuccess();
        succeeded = true;
        await loadImports();
        await loadOverview();
      } catch (error) {
        state.importErrors[String(batchId)] = error.message;
        renderImports();
        requestImportBatchFocus(batchId);
      } finally {
        if (!succeeded) setImportActionState(batchId, action, false);
      }
    }

    function importHistorySummary(batch) {
      const time = batch.status === "confirmed" ? batch.confirmed_at : batch.cancelled_at;
      const label = batch.status === "confirmed" ? "Подтверждено" : batch.status === "cancelled" ? "Отменено" : importStatusLabel(batch.status);
      return "<div class='import-history-summary'>" +
        historyFact(label, time ? formatDateTime(time) : formatDateTime(batch.updated_at || batch.created_at)) +
        historyFact("Импортировано", String(batch.import_count || 0)) +
        historyFact("Дубли / пропущено", String(batch.duplicate_count || 0) + " / " + String(batch.skipped_count || 0)) +
      "</div>";
    }

    function importHistoryLine(batch) {
      if (batch.status === "confirmed") return "записано " + (batch.import_count || 0);
      if (batch.status === "cancelled") return "черновик отменен";
      if (batch.status === "failed") return "требует проверки";
      return importStatusLabel(batch.status);
    }

    function historyFact(label, value) {
      return "<div class='history-fact'><div class='label'>" + escapeHtml(label) + "</div><div class='value'>" + escapeHtml(value || "—") + "</div></div>";
    }

    function setImportActionState(batchId, action, isLoading) {
      const buttons = document.querySelectorAll("#importsCanvas button[data-import-action][data-id='" + escapeAttr(batchId) + "']");
      for (const item of buttons) {
        const isTarget = item.dataset.importAction === action;
        const permanentlyDisabled = item.dataset.importDisabled === "true";
        item.disabled = isLoading || permanentlyDisabled;
        item.classList.toggle("is-loading", isLoading && isTarget);
        item.setAttribute("aria-busy", String(isLoading && isTarget));
      }
    }

    function setImportRefreshLoading(isLoading) {
      const button = $("refreshImports");
      if (!button) return;
      button.disabled = isLoading;
      button.classList.toggle("is-loading", isLoading);
      button.setAttribute("aria-busy", String(isLoading));
    }

    function filteredImports() {
      return state.imports.filter(function(batch) {
        if (state.importFilter === "history") return batch.status !== "draft";
        if (state.importFilter === "duplicates") return Number(batch.duplicate_count || 0) > 0 || hasImportItemStatus(batch, "duplicate");
        if (state.importFilter === "skipped") return Number(batch.skipped_count || 0) > 0 || hasImportItemStatus(batch, "skipped");
        return batch.status === "draft";
      });
    }

    function hasImportItemStatus(batch, status) {
      return (batch.items || []).some(function(item) { return item.status === status; });
    }

    function syncImportFilterButtons() {
      const counts = importFilterCounts();
      for (const button of document.querySelectorAll("#importFilters button[data-import-filter]")) {
        const filter = normalizeImportFilter(button.dataset.importFilter);
        const count = counts[filter] || 0;
        const isActive = filter === state.importFilter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
        button.textContent = (button.dataset.label || button.textContent || filter) + (count > 0 ? " " + count : "");
      }
    }

    function importFilterCounts() {
      return {
        attention: state.imports.filter(function(batch) { return batch.status === "draft"; }).length,
        history: state.imports.filter(function(batch) { return batch.status !== "draft"; }).length,
        duplicates: state.imports.filter(function(batch) { return Number(batch.duplicate_count || 0) > 0 || hasImportItemStatus(batch, "duplicate"); }).length,
        skipped: state.imports.filter(function(batch) { return Number(batch.skipped_count || 0) > 0 || hasImportItemStatus(batch, "skipped"); }).length
      };
    }

    function importFilterEmptyText(filter) {
      if (filter === "history") return "Подтвержденные и отмененные импорты появятся здесь после решения по черновику.";
      if (filter === "duplicates") return "Дублей в последних импортированных выписках не найдено.";
      if (filter === "skipped") return "Пропущенных строк в последних выписках нет.";
      return "Отправьте PDF-выписку боту: здесь появится черновик, который требует решения.";
    }

    function syncImportTargetFilter() {
      if (!state.targetBatchId) return;
      const batch = state.imports.find(function(item) { return Number(item.id) === Number(state.targetBatchId); });
      if (!batch) return;
      state.highlightedBatchId = Number(batch.id);
      state.importFilter = batch.status === "draft" ? "attention" : "history";
    }

    function requestImportBatchFocus(batchId) {
      const targetId = Number(batchId || state.targetBatchId || state.highlightedBatchId || 0);
      if (!targetId) return;
      state.highlightedBatchId = targetId;
      setTimeout(function() {
        const card = document.querySelector("[data-import-batch-id='" + targetId + "']");
        if (!card) return;
        card.classList.add("is-target");
        card.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
        try { card.focus({ preventScroll: true }); } catch (error) { card.focus(); }
      }, 0);
    }

    function normalizeImportFilter(value) {
      return importFilters.includes(value) ? value : "attention";
    }

    function renderRecordFilterChips() {
      const root = $("recordFilterChips");
      if (!root) return;
      const chips = ["до 50 записей за период"];
      if (state.kindPreset !== "all") chips.push(kindPresetLabel(state.kindPreset));
      if ($("statusFilter").value === "deleted") chips.push("удаленные");
      if ($("categoryFilter").value) chips.push($("categoryFilter").value);
      if ($("recordSearch").value.trim()) chips.push("поиск: " + $("recordSearch").value.trim());
      root.innerHTML = chips.map(function(label) { return "<span class='filter-chip'>" + escapeHtml(label) + "</span>"; }).join("") +
        (chips.length > 1 ? "<button class='filter-reset' type='button' data-reset-record-filters>Сбросить</button>" : "");
    }

    function kindPresetLabel(value) {
      if (value === "expense") return "расходы";
      if (value === "income") return "доходы";
      if (value === "debt") return "долги";
      return "все типы";
    }

    function resetRecordFilters() {
      state.kindPreset = "all";
      $("recordSearch").value = "";
      $("statusFilter").value = "active";
      $("categoryFilter").value = "";
      const button = document.querySelector("#kindQuick button[data-kind-preset='all']");
      if (button) setActive("#kindQuick button", button);
      loadRecords();
    }

    function prefersReducedMotion() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function handleRecordsAction(event) {
      const resetButton = event.target.closest("button[data-reset-record-filters]");
      if (resetButton) {
        resetRecordFilters();
        return;
      }
      const sortButton = event.target.closest("button[data-sort]");
      if (sortButton) {
        updateSort(sortButton.dataset.sort);
        return;
      }
      const row = event.target.closest("[data-id]");
      if (!row) return;
      openRecordById(row.dataset.id);
    }

    function openRecordById(id) {
      const item = state.records.find(function(record) { return String(record.id) === String(id); });
      if (item) openSheet(item);
    }

    function updateSort(field) {
      if (!sortFields.includes(field)) return;
      if (state.sort.field === field) {
        state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
      } else {
        state.sort.field = field;
        state.sort.dir = field === "amount" ? "desc" : "asc";
      }
      writeJsonPref(storageKeys.sort, state.sort);
      renderRecords();
    }

    function renderFeedRecords(items) {
      const root = $("recordsCanvas");
      root.innerHTML = "";
      const fragment = document.createDocumentFragment();
      for (const item of items) fragment.appendChild(recordCard(item));
      root.appendChild(fragment);
    }

    function renderTableRecords(items) {
      const headers = [
        ["date", "Дата"],
        ["kind", "Тип"],
        ["category", "Категория"],
        ["counterparty", "Контрагент"],
        ["amount", "Сумма"],
        ["id", "ID"]
      ];
      $("recordsCanvas").innerHTML =
        "<div class='table-scroll' aria-label='Таблица записей с горизонтальной прокруткой'><table class='ledger-table'><caption>До 50 записей за период. На узком экране таблицу можно прокрутить по горизонтали.</caption><thead><tr>" +
        headers.map(function(header) { return tableHeader(header[0], header[1]); }).join("") +
        "</tr></thead><tbody>" +
        items.map(function(item) {
          const tone = recordTone(item);
          const category = [item.category, item.subcategory].filter(Boolean).join(" · ") || "Не указана";
          return "<tr class='clickable' tabindex='0' role='button' data-id='" + escapeAttr(item.id) + "' aria-label='Открыть детали записи " + escapeAttr(item.id) + "'>" +
            "<td>" + escapeHtml(formatDate(item.local_date)) + "<div class='meta'>" + escapeHtml(item.local_date || "") + "</div></td>" +
            "<td>" + escapeHtml(kindLabel(item.kind)) + "<div class='meta'>" + escapeHtml(statusLabel(item.status)) + "</div></td>" +
            "<td>" + escapeHtml(category) + "</td>" +
            "<td>" + escapeHtml(item.counterparty || "Не указан") + "</td>" +
            "<td class='amount-cell " + tone + "'>" + escapeHtml(money(item.amount_minor)) + "</td>" +
            "<td class='id-cell'>#" + escapeHtml(item.id) + "</td>" +
          "</tr>";
        }).join("") +
        "</tbody></table></div>";
    }

    function tableHeader(field, label) {
      const active = state.sort.field === field;
      const arrow = active ? (state.sort.dir === "asc" ? "↑" : "↓") : "";
      const ariaSort = active ? (state.sort.dir === "asc" ? "ascending" : "descending") : "none";
      return "<th aria-sort='" + ariaSort + "'><button class='sort-button' data-sort='" + escapeAttr(field) + "' type='button'>" + escapeHtml(label) + (arrow ? "<span class='sort-arrow'>" + arrow + "</span>" : "") + "</button></th>";
    }

    function renderGroupedRecords(items) {
      const groups = new Map();
      for (const item of items) {
        const date = item.local_date || "Без даты";
        if (!groups.has(date)) groups.set(date, []);
        groups.get(date).push(item);
      }
      const dates = Array.from(groups.keys()).sort(function(a, b) {
        return state.sort.field === "date" && state.sort.dir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      });
      const root = $("recordsCanvas");
      root.innerHTML = "";
      const fragment = document.createDocumentFragment();
      for (const date of dates) {
        const itemsForDate = groups.get(date);
        const group = document.createElement("section");
        group.className = "date-group";
        const expense = itemsForDate.filter(function(item) { return recordTone(item) === "expense"; }).reduce(function(sum, item) { return sum + Number(item.amount_minor || 0); }, 0);
        const income = itemsForDate.filter(function(item) { return recordTone(item) === "income"; }).reduce(function(sum, item) { return sum + Number(item.amount_minor || 0); }, 0);
        group.innerHTML = "<div class='date-group-head'><div><div class='date-title'></div><div class='meta'></div></div><div class='date-total'></div></div>";
        group.querySelector(".date-title").textContent = date === "Без даты" ? date : formatDate(date);
        group.querySelector(".meta").textContent = plural(itemsForDate.length, "запись", "записи", "записей");
        group.querySelector(".date-total").textContent = "Расходы " + money(expense) + (income > 0 ? " · Доходы " + money(income) : "");
        for (const item of itemsForDate) group.appendChild(groupRow(item));
        fragment.appendChild(group);
      }
      root.appendChild(fragment);
    }

    function recordCard(item) {
      const element = document.createElement("article");
      const tone = recordTone(item);
      element.className = "record-card clickable";
      element.dataset.id = item.id;
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", "Открыть детали записи " + item.id);
      element.innerHTML = "<div class='record-main'><div class='record-title'></div><div class='record-meta'></div><div class='record-tags'></div></div><div class='record-side'><div class='amount'></div><div class='record-id'></div></div>";
      element.querySelector(".record-title").textContent = item.description || item.raw_text || kindLabel(item.kind);
      element.querySelector(".record-meta").textContent = formatDate(item.local_date) + " · " + [kindLabel(item.kind), item.category, item.subcategory].filter(Boolean).join(" · ");
      const tags = element.querySelector(".record-tags");
      appendTag(tags, item.counterparty || null);
      appendTag(tags, item.status === "deleted" ? "Удалена" : null);
      appendTag(tags, "ID " + item.id);
      const amount = element.querySelector(".amount");
      amount.textContent = money(item.amount_minor);
      amount.classList.add(tone);
      element.querySelector(".record-id").textContent = statusLabel(item.status);
      return element;
    }

    function groupRow(item) {
      const element = document.createElement("div");
      const tone = recordTone(item);
      element.className = "group-row clickable";
      element.dataset.id = item.id;
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", "Открыть детали записи " + item.id);
      element.innerHTML = "<div><div class='record-title'></div><div class='record-meta'></div></div><div class='amount'></div>";
      element.querySelector(".record-title").textContent = item.description || item.raw_text || kindLabel(item.kind);
      element.querySelector(".record-meta").textContent = [kindLabel(item.kind), item.category, item.subcategory, item.counterparty].filter(Boolean).join(" · ");
      const amount = element.querySelector(".amount");
      amount.textContent = money(item.amount_minor);
      amount.classList.add(tone);
      return element;
    }

    function appendTag(root, text) {
      if (!text) return;
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = text;
      root.appendChild(tag);
    }

    function sortRecords(items) {
      const field = state.sort.field;
      const direction = state.sort.dir === "asc" ? 1 : -1;
      return items.slice().sort(function(left, right) {
        const a = sortValue(left, field);
        const b = sortValue(right, field);
        let result;
        if (typeof a === "number" && typeof b === "number") {
          result = a - b;
        } else {
          result = String(a || "").localeCompare(String(b || ""), "ru", { numeric: true, sensitivity: "base" });
        }
        if (result !== 0) return result * direction;
        return String(right.local_date || "").localeCompare(String(left.local_date || "")) || Number(right.id || 0) - Number(left.id || 0);
      });
    }

    function sortValue(item, field) {
      if (field === "amount") return Number(item.amount_minor || 0);
      if (field === "kind") return kindLabel(item.kind);
      if (field === "category") return [item.category, item.subcategory].filter(Boolean).join(" ");
      if (field === "counterparty") return item.counterparty || "";
      if (field === "id") return Number(item.id || 0);
      return item.local_date || "";
    }

    function recordTone(item) {
      if (item.kind === "income") return "income";
      if (String(item.kind || "").includes("loan") || String(item.kind || "").includes("borrow")) return "debt";
      return "expense";
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
      fill.style.background = color || "var(--expense)";
      const amountEl = element.querySelector(".amount");
      amountEl.textContent = amount || "";
      if (tone) amountEl.classList.add(tone);
      return element;
    }

    function categoryRow(title, pct, meta, amount, color) {
      const element = rowWithProgress("", pct + "% · " + meta, amount, pct, color, "expense");
      element.classList.add("category-row");
      const titleEl = element.querySelector(".title");
      titleEl.innerHTML = "<span class='category-title'><i class='swatch' aria-hidden='true'></i><span></span></span>";
      titleEl.querySelector(".swatch").style.background = color;
      titleEl.querySelector("span span").textContent = title || "";
      return element;
    }

    function openSheet(item) {
      state.selected = item;
      state.lastFocus = document.activeElement;
      const isDeleted = item.status === "deleted";
      $("sheetTitle").textContent = item.description || item.raw_text || "Запись";
      $("sheetSubtitle").textContent = "ID " + item.id + " · " + formatDate(item.local_date) + " · " + (isDeleted ? "удалена" : "активна");
      $("sheetDetails").innerHTML = isDeleted ? [
        detail("Сумма", money(item.amount_minor)),
        detail("Тип", kindLabel(item.kind)),
        detail("Категория", [item.category, item.subcategory].filter(Boolean).join(" · ") || "Не указана"),
        detail("Контрагент", item.counterparty || "Не указан"),
        detail("Дата", item.local_date),
        detail("Статус", "Удалена"),
        detail("Исходный текст", item.raw_text || "", true)
      ].join("") : editForm(item);
      $("sheetSave").hidden = isDeleted;
      $("sheetActions").classList.toggle("editing", !isDeleted);
      $("sheetAction").textContent = isDeleted ? "Восстановить" : "Удалить";
      $("sheetAction").className = isDeleted ? "primary" : "danger";
      $("sheetBackdrop").classList.add("open");
      $("closeSheet").focus();
      setAppInert(true);
      if (tg && tg.BackButton) {
        state.backHandler = closeSheet;
        if (typeof tg.BackButton.onClick === "function") tg.BackButton.onClick(state.backHandler);
        if (typeof tg.BackButton.show === "function") tg.BackButton.show();
      }
    }

    function closeSheet() {
      $("sheetBackdrop").classList.remove("open");
      setAppInert(false);
      if (tg && tg.BackButton && state.backHandler) {
        if (typeof tg.BackButton.offClick === "function") tg.BackButton.offClick(state.backHandler);
        if (typeof tg.BackButton.hide === "function") tg.BackButton.hide();
        state.backHandler = null;
      }
      state.selected = null;
      if (state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
      state.lastFocus = null;
    }

    function setAppInert(isInert) {
      const shell = $("appShell");
      if (!shell) return;
      shell.setAttribute("aria-hidden", String(isInert));
      try {
        shell.inert = Boolean(isInert);
      } catch (error) {}
      if (!isInert) shell.removeAttribute("aria-hidden");
    }

    function handleSheetKeydown(event) {
      if (!$("sheetBackdrop").classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(document.querySelectorAll("#sheetBackdrop button, #sheetBackdrop [href], #sheetBackdrop input, #sheetBackdrop select, #sheetBackdrop textarea, #sheetBackdrop [tabindex]:not([tabindex='-1'])"))
        .filter(function(item) { return !item.disabled && item.offsetParent !== null; });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    async function runSheetAction() {
      if (!state.selected) return;
      const action = state.selected.status === "deleted" ? "restore" : "delete";
      const ok = await confirmAction(action === "delete" ? "Удалить эту запись?" : "Восстановить эту запись?");
      if (!ok) return;
      const button = $("sheetAction");
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

    async function runSheetSave() {
      if (!state.selected || state.selected.status === "deleted") return;
      const button = $("sheetSave");
      button.disabled = true;
      try {
        const payload = {
          id: state.selected.id,
          action: "update",
          amount: $("editAmount").value,
          local_date: $("editDate").value,
          kind: $("editKind").value,
          category: $("editCategory").value,
          subcategory: $("editSubcategory").value,
          counterparty: $("editCounterparty").value,
          description: $("editDescription").value,
          raw_text: $("editRawText").value
        };
        await api("/api/transaction-action", payload);
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

    function detail(label, value, full) {
      return "<div class='detail" + (full ? " full" : "") + "'><div class='label'>" + escapeHtml(label) + "</div><div class='value'>" + escapeHtml(value || "—") + "</div></div>";
    }

    function editForm(item) {
      return "<form class='edit-form' id='editForm'>" +
        editField("Сумма", "editAmount", Number(item.amount_minor || 0) / 100, "number", "0.01") +
        editField("Дата", "editDate", item.local_date || "", "date") +
        "<label class='edit-field'><span class='field-label'>Тип</span><select class='field' id='editKind'>" + kindOptions(item.kind) + "</select></label>" +
        editField("Категория", "editCategory", item.category || "", "text") +
        editField("Подкатегория", "editSubcategory", item.subcategory || "", "text") +
        editField("Контрагент", "editCounterparty", item.counterparty || "", "text") +
        editField("Описание", "editDescription", item.description || "", "text", null, true) +
        "<label class='edit-field full'><span class='field-label'>Исходный текст</span><textarea class='field' id='editRawText'>" + escapeHtml(item.raw_text || "") + "</textarea></label>" +
      "</form>";
    }

    function editField(label, id, value, type, step, full) {
      const extra = step ? " step='" + escapeAttr(step) + "'" : "";
      return "<label class='edit-field" + (full ? " full" : "") + "'><span class='field-label'>" + escapeHtml(label) + "</span><input class='field' id='" + escapeAttr(id) + "' type='" + escapeAttr(type || "text") + "' value='" + escapeAttr(value) + "'" + extra + "></label>";
    }

    function kindOptions(current) {
      const options = ["expense", "income", "loan_out", "loan_repayment", "borrow_in", "borrow_repayment", "transfer", "correction"];
      return options.map(function(kind) {
        return "<option value='" + escapeAttr(kind) + "'" + (kind === current ? " selected" : "") + ">" + escapeHtml(kindLabel(kind)) + "</option>";
      }).join("");
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

    function chartLabels(series, pad, plotW, step, height) {
      const maxLabels = Math.min(5, series.length);
      const every = Math.max(1, Math.ceil(series.length / maxLabels));
      const labels = [];
      for (let i = 0; i < series.length; i += 1) {
        if (i !== 0 && i !== series.length - 1 && i % every !== 0) continue;
        const x = pad.left + (series.length > 1 ? i * step : plotW / 2);
        labels.push("<text x='" + x.toFixed(2) + "' y='" + (height - 12) + "' fill='var(--muted)' font-size='13' font-weight='700' text-anchor='middle'>" + escapeHtml(shortDate(series[i].date)) + "</text>");
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

    function signedMoney(minor) {
      const value = Number(minor || 0);
      if (value === 0) return money(0);
      return (value > 0 ? "+" : "−") + money(Math.abs(value));
    }

    function shortMoney(minor) {
      const amount = Number(minor || 0) / 100;
      if (amount >= 1000000) return (amount / 1000000).toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " млн";
      if (amount >= 1000) return (amount / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " тыс";
      return amount.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
    }

    function shortDate(ymd) {
      const parts = String(ymd || "").split("-");
      return parts.length === 3 ? parts[2] + "." + parts[1] : String(ymd || "");
    }

    function formatDate(ymd) {
      if (!ymd || String(ymd).indexOf("-") < 0) return ymd || "Без даты";
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
        correction: "Корректировка"
      };
      return labels[kind] || kind || "Запись";
    }

    function statusLabel(status) {
      return status === "deleted" ? "Удалена" : "Активна";
    }

    function importStatusLabel(status) {
      const labels = {
        draft: "Черновик",
        confirmed: "Импортирован",
        cancelled: "Отменен",
        failed: "Ошибка"
      };
      return labels[status] || status || "Импорт";
    }

    function importItemStatusLabel(status) {
      const labels = {
        draft: "готово",
        imported: "записано",
        duplicate: "дубль",
        skipped: "пропуск",
        cancelled: "отменено"
      };
      return labels[status] || status || "строка";
    }

    function importPeriod(batch) {
      if (batch && batch.period_start && batch.period_end) return formatRange(batch.period_start, batch.period_end);
      if (batch && batch.period_start) return formatDate(batch.period_start);
      if (batch && batch.period_end) return formatDate(batch.period_end);
      return "период не указан";
    }

    function formatDateTime(value) {
      if (!value) return "";
      const date = new Date(String(value).replace(" ", "T"));
      if (Number.isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
    }

    function notifySuccess() {
      if (!tg || !tg.HapticFeedback || typeof tg.HapticFeedback.notificationOccurred !== "function") return;
      try {
        tg.HapticFeedback.notificationOccurred("success");
      } catch (error) {}
    }

    function normalizeRecordView(value) {
      return recordViews.includes(value) ? value : "feed";
    }

    function normalizeDensity(value) {
      return value === "compact" ? "compact" : "comfortable";
    }

    function normalizeSort(value) {
      const sort = value && typeof value === "object" ? value : {};
      return {
        field: sortFields.includes(sort.field) ? sort.field : "date",
        dir: sort.dir === "asc" ? "asc" : "desc"
      };
    }

    function readPref(key, fallback) {
      try {
        return window.localStorage.getItem(key) || fallback;
      } catch (error) {
        return fallback;
      }
    }

    function writePref(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {}
    }

    function readJsonPref(key, fallback) {
      try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        return fallback;
      }
    }

    function writeJsonPref(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {}
    }

    function showAccessError(message) {
      $("profile").textContent = "Ошибка доступа";
      $("syncStatus").textContent = "Нужен запуск из Telegram";
      $("heroSpend").textContent = "Нет данных";
      $("heroMeta").textContent = message;
      $("netFlow").textContent = "0 ₸";
      $("sideNote").textContent = "Данные защищены Telegram-проверкой.";
      $("importAttention").hidden = true;
      $("metrics").innerHTML = "<div class='error'>"+ escapeHtml(message) + "</div>";
      $("dailyChart").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      $("categoryTotals").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      $("categories").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      $("largest").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      $("familyHelpPanel").hidden = true;
      updateRecordsCanvasClass();
      $("recordsCanvas").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      $("importsCanvas").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      $("debtsFull").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
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
`;

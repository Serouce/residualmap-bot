import { miniAppClientScript } from "./mini-app-client.js";
import { miniAppStyles } from "./mini-app-styles.js";

export function miniAppHtml() {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>ResidualMap</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
${miniAppStyles}
  </style>
</head>
<body>
  <main class="app-shell" id="appShell">
    <header class="topbar" aria-label="Панель управления">
      <div class="brand-row">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">R</div>
          <div class="brand-copy">
            <div class="brand-title">ResidualMap</div>
            <div class="brand-meta" id="profile">Загрузка данных...</div>
            <div class="sync-status" id="syncStatus" role="status" aria-live="polite">Подготовка панели</div>
          </div>
        </div>
        <button class="icon-button" id="refresh" type="button" title="Обновить" aria-label="Обновить данные">↻</button>
      </div>

      <nav class="segments" id="periods" aria-label="Период аналитики">
        <button data-period="today" type="button" aria-pressed="false">Сегодня</button>
        <button data-period="week" type="button" aria-pressed="false">Неделя</button>
        <button data-period="last_30_days" type="button" aria-pressed="false">30 дн.</button>
        <button data-period="month" class="active" type="button" aria-pressed="true">Месяц</button>
      </nav>

      <nav class="tabs" id="tabs" role="tablist" aria-label="Разделы Mini App">
        <button id="overview-tab" data-tab="overview" class="active" type="button" role="tab" aria-selected="true" aria-controls="view-overview" tabindex="0">Обзор</button>
        <button id="records-tab" data-tab="records" type="button" role="tab" aria-selected="false" aria-controls="view-records" tabindex="-1">Записи</button>
        <button id="import-tab" data-tab="import" type="button" role="tab" aria-selected="false" aria-controls="view-import" tabindex="-1">Импорт</button>
        <button id="debts-tab" data-tab="debts" type="button" role="tab" aria-selected="false" aria-controls="view-debts" tabindex="-1">Долги</button>
      </nav>
    </header>

    <section class="view active" id="view-overview" role="tabpanel" aria-labelledby="overview-tab" aria-hidden="false">
      <section class="hero-grid" aria-label="Главные показатели">
        <article class="hero-card primary-panel">
          <div class="summary-topline">
            <span class="eyebrow">Расходы</span>
            <span class="period-badge" id="periodName">Месяц</span>
          </div>
          <h1 id="heroSpend">0 ₸</h1>
          <div class="hero-meta" id="heroMeta">Расходы за выбранный период</div>
          <div class="overview-actions" aria-label="Быстрые действия">
            <button class="secondary" type="button" data-open-tab="records"><span class="button-label">Записи</span></button>
            <button class="secondary" type="button" data-open-tab="import"><span class="button-label">Импорт PDF</span></button>
          </div>
        </article>
        <aside class="hero-card balance-panel">
          <div class="summary-topline">
            <span class="side-label">Баланс периода</span>
            <span class="flow-chip" id="flowState">ожидание</span>
          </div>
          <div class="side-value" id="netFlow">0 ₸</div>
          <div class="side-note" id="sideNote">Доходы минус личные расходы.</div>
        </aside>
      </section>

      <section class="notice-strip" id="importAttention" hidden></section>

      <section class="overview-dock" aria-label="Рабочие статусы">
        <button class="dock-item dock-import" type="button" data-open-tab="import">
          <span class="dock-label">PDF импорт</span>
          <strong id="importDockValue">Нет черновиков</strong>
          <span id="importDockMeta">Отправьте выписку боту</span>
        </button>
        <button class="dock-item dock-records" type="button" data-open-tab="records">
          <span class="dock-label">Записи</span>
          <strong id="recordsDockValue">0</strong>
          <span id="recordsDockMeta">за период</span>
        </button>
        <button class="dock-item dock-debts" type="button" data-open-tab="debts">
          <span class="dock-label">Долги</span>
          <strong id="debtsDockValue">Нет</strong>
          <span id="debtsDockMeta">открытых расчётов</span>
        </button>
      </section>

      <section class="metric-grid" id="metrics" aria-label="Ключевые показатели">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </section>

      <section class="dashboard-grid">
        <section class="panel wide">
          <div class="panel-head">
            <div>
              <h2>Динамика</h2>
              <p class="caption">Личные расходы и доходы по дням</p>
            </div>
            <span class="caption strong" id="rangeLabel"></span>
          </div>
          <div class="chart-surface" id="dailyChart"></div>
          <div class="legend" aria-label="Легенда графика">
            <span><i class="dot expense-dot"></i>Расходы</span>
            <span><i class="dot income-dot"></i>Доходы</span>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Категории</h2>
              <p class="caption">Куда ушли личные деньги</p>
            </div>
          </div>
          <div class="category-layout">
            <div class="donut" id="donut" aria-label="Доля расходов по категориям">
              <div class="donut-core">Всего<strong id="donutTotal">0 ₸</strong></div>
            </div>
            <div class="list" id="categoryTotals"></div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Детализация</h2>
              <p class="caption">Подкатегории личных расходов</p>
            </div>
          </div>
          <div class="list" id="categories"></div>
        </section>

        <section class="panel wide">
          <div class="panel-head">
            <div>
              <h2>Крупные траты</h2>
              <p class="caption">Самые заметные личные списания</p>
            </div>
          </div>
          <div class="list" id="largest"></div>
        </section>

        <section class="panel wide family-panel" id="familyHelpPanel" hidden>
          <div class="panel-head">
            <div>
              <h2>Семья</h2>
              <p class="caption">Помощь семье отдельно от личных трат</p>
            </div>
            <span class="pill amount-pill" id="familyHelpTotal">0 ₸</span>
          </div>
          <div class="list" id="familyHelp"></div>
        </section>
      </section>
    </section>

    <section class="view" id="view-records" role="tabpanel" aria-labelledby="records-tab" aria-hidden="true" hidden>
      <section class="panel records-panel">
        <div class="panel-head records-head">
          <div>
            <h2>Записи</h2>
            <p class="caption">Поиск, проверка и безопасные действия</p>
          </div>
          <span class="pill" id="recordCount">0 записей</span>
        </div>

        <div class="records-toolbar">
          <div class="quick-filters" id="kindQuick" aria-label="Быстрый фильтр типа">
            <button data-kind-preset="all" class="active" type="button" aria-pressed="true">Все</button>
            <button data-kind-preset="expense" type="button" aria-pressed="false">Расходы</button>
            <button data-kind-preset="income" type="button" aria-pressed="false">Доходы</button>
            <button data-kind-preset="debt" type="button" aria-pressed="false">Долги</button>
          </div>

          <div class="view-switch" id="recordViewSwitch" aria-label="Вид записей">
            <button data-record-view="feed" class="active" type="button" aria-pressed="true">Лента</button>
            <button data-record-view="table" type="button" aria-pressed="false">Таблица</button>
            <button data-record-view="groups" type="button" aria-pressed="false">Группы</button>
          </div>

          <button class="density-button" id="densityToggle" type="button" aria-pressed="false">Компактно</button>
        </div>

        <div class="controls">
          <label class="field-wrap search-wrap">
            <span class="field-label">Поиск</span>
            <input class="field" id="recordSearch" placeholder="такси, сестра, продукты" autocomplete="off">
            <button class="clear-search" id="clearSearch" type="button" aria-label="Очистить поиск">×</button>
          </label>
          <label class="field-wrap">
            <span class="field-label">Статус</span>
            <select class="field" id="statusFilter">
              <option value="active">Активные</option>
              <option value="deleted">Удалённые</option>
            </select>
          </label>
          <label class="field-wrap">
            <span class="field-label">Категория</span>
            <select class="field" id="categoryFilter">
              <option value="">Все категории</option>
            </select>
          </label>
        </div>

        <div class="filter-chips" id="recordFilterChips" aria-live="polite"></div>

        <div class="records-canvas view-feed" id="recordsCanvas" aria-live="polite">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      </section>
    </section>

    <section class="view" id="view-import" role="tabpanel" aria-labelledby="import-tab" aria-hidden="true" hidden>
      <section class="panel import-panel">
        <div class="panel-head records-head">
          <div>
            <h2>Импорт</h2>
            <p class="caption">Черновики PDF-выписок, статусы строк и история решений</p>
          </div>
          <span class="pill" id="importCount">0 импортов</span>
        </div>

        <div class="import-toolbar">
          <button class="secondary" id="refreshImports" type="button" data-loading-label="Обновление" aria-label="Обновить импорт"><span class="button-label">Обновить импорт</span></button>
        </div>

        <div class="quick-filters import-filters" id="importFilters" aria-label="Фильтр импорта">
          <button data-import-filter="attention" data-label="Требует решения" class="active" type="button" aria-pressed="true">Требует решения</button>
          <button data-import-filter="history" data-label="История" type="button" aria-pressed="false">История</button>
          <button data-import-filter="duplicates" data-label="Дубли" type="button" aria-pressed="false">Дубли</button>
          <button data-import-filter="skipped" data-label="Пропуски" type="button" aria-pressed="false">Пропуски</button>
        </div>

        <div class="imports-canvas" id="importsCanvas" aria-live="polite">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      </section>
    </section>

    <section class="view" id="view-debts" role="tabpanel" aria-labelledby="debts-tab" aria-hidden="true" hidden>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Долги</h2>
            <p class="caption">Отдельная панель взаиморасчётов</p>
          </div>
        </div>
        <div class="list" id="debtsFull"></div>
      </section>
    </section>
  </main>

  <div class="sheet-backdrop" id="sheetBackdrop">
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Детали записи" aria-labelledby="sheetTitle" aria-describedby="sheetSubtitle">
      <div class="sheet-head">
        <div>
          <h2 id="sheetTitle">Запись</h2>
          <p class="caption" id="sheetSubtitle"></p>
        </div>
        <button class="icon-button" id="closeSheet" type="button" title="Закрыть" aria-label="Закрыть детали">×</button>
      </div>
      <div class="details" id="sheetDetails"></div>
      <div class="actions" id="sheetActions">
        <button class="secondary" id="sheetCloseAction" type="button">Готово</button>
        <button class="primary" id="sheetSave" type="button">Сохранить</button>
        <button class="danger" id="sheetAction" type="button">Удалить</button>
      </div>
    </section>
  </div>

  <script>
${miniAppClientScript}
  </script>
</body>
</html>`;
}

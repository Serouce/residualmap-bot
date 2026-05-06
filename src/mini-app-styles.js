export const miniAppStyles = `
    :root {
      color-scheme: light dark;
      --bg: var(--tg-theme-bg-color, #f4f6f8);
      --surface: var(--tg-theme-secondary-bg-color, #ffffff);
      --surface-raised: #ffffff;
      --surface-soft: #eef2f6;
      --surface-tint: #f8fafc;
      --text: var(--tg-theme-text-color, #101722);
      --muted: var(--tg-theme-hint-color, #667085);
      --subtle: #7b8494;
      --line: var(--tg-theme-section-separator-color, rgba(16, 23, 34, .12));
      --accent: var(--tg-theme-button-color, #116b5f);
      --accent-2: #315d86;
      --accent-text: var(--tg-theme-button-text-color, #ffffff);
      --expense: #b43e57;
      --income: #157a5c;
      --debt: #91651c;
      --support: #6d5cae;
      --category-a: #315d86;
      --category-b: #8b4f67;
      --category-c: #9a6a2d;
      --category-d: #43757b;
      --category-e: #5b6d91;
      --shadow: 0 18px 46px rgba(15, 23, 42, .09);
      --shadow-soft: 0 8px 24px rgba(15, 23, 42, .07);
      --shadow-tight: 0 1px 2px rgba(15, 23, 42, .06), 0 10px 30px rgba(15, 23, 42, .06);
      --radius: 8px;
      --tap: 44px;
    }

    :root[data-scheme="dark"] {
      --bg: var(--tg-theme-bg-color, #0d1117);
      --surface: var(--tg-theme-secondary-bg-color, #151b24);
      --surface-raised: #1b2330;
      --surface-soft: #212a36;
      --surface-tint: #111821;
      --text: var(--tg-theme-text-color, #f6f8fb);
      --muted: var(--tg-theme-hint-color, #aab4c2);
      --subtle: #c2cad5;
      --line: var(--tg-theme-section-separator-color, rgba(255, 255, 255, .13));
      --accent: var(--tg-theme-button-color, #69beb0);
      --accent-2: #9cb9e5;
      --accent-text: var(--tg-theme-button-text-color, #061210);
      --expense: #f08ca1;
      --income: #82d8b5;
      --debt: #e0b762;
      --support: #b4a6f2;
      --category-a: #9cb9e5;
      --category-b: #d7a3b8;
      --category-c: #e1bc83;
      --category-d: #9bcbd1;
      --category-e: #aeb9d6;
      --shadow: 0 20px 52px rgba(0, 0, 0, .32);
      --shadow-soft: 0 12px 30px rgba(0, 0, 0, .24);
      --shadow-tight: 0 1px 2px rgba(0, 0, 0, .18), 0 14px 34px rgba(0, 0, 0, .22);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-scheme="light"]) {
        --bg: var(--tg-theme-bg-color, #0d1117);
        --surface: var(--tg-theme-secondary-bg-color, #151b24);
        --surface-raised: #1b2330;
        --surface-soft: #212a36;
        --surface-tint: #111821;
        --text: var(--tg-theme-text-color, #f6f8fb);
        --muted: var(--tg-theme-hint-color, #aab4c2);
        --subtle: #c2cad5;
        --line: var(--tg-theme-section-separator-color, rgba(255, 255, 255, .13));
        --accent: var(--tg-theme-button-color, #69beb0);
        --accent-2: #9cb9e5;
        --accent-text: var(--tg-theme-button-text-color, #061210);
        --expense: #f08ca1;
        --income: #82d8b5;
        --debt: #e0b762;
        --support: #b4a6f2;
        --category-a: #9cb9e5;
        --category-b: #d7a3b8;
        --category-c: #e1bc83;
        --category-d: #9bcbd1;
        --category-e: #aeb9d6;
        --shadow: 0 20px 52px rgba(0, 0, 0, .32);
        --shadow-soft: 0 12px 30px rgba(0, 0, 0, .24);
        --shadow-tight: 0 1px 2px rgba(0, 0, 0, .18), 0 14px 34px rgba(0, 0, 0, .22);
      }
    }

    * {
      box-sizing: border-box;
    }

    html {
      min-height: 100%;
      background: var(--bg);
    }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-soft) 66%, var(--bg)) 0%, var(--bg) 38%, color-mix(in srgb, var(--accent) 4%, var(--bg)) 100%);
      font: 16px/1.45 ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif;
      font-variant-numeric: tabular-nums;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button {
      border: 0;
      color: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:disabled {
      cursor: progress;
      opacity: .68;
    }

    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    .clickable:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--accent) 34%, transparent);
      outline-offset: 2px;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    h1 {
      margin-top: 8px;
      font-size: 44px;
      line-height: .98;
      font-weight: 790;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    h2 {
      font-size: 21px;
      line-height: 1.2;
      font-weight: 780;
      letter-spacing: 0;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    svg text {
      font-family: inherit;
    }

    .app-shell {
      width: min(920px, 100%);
      margin: 0 auto;
      padding:
        max(8px, env(safe-area-inset-top))
        max(10px, env(safe-area-inset-right))
        max(28px, calc(env(safe-area-inset-bottom) + 18px))
        max(10px, env(safe-area-inset-left));
    }

    .topbar {
      position: sticky;
      top: max(0px, env(safe-area-inset-top));
      z-index: 20;
      margin-bottom: 12px;
      padding: 10px;
      border: 1px solid color-mix(in srgb, var(--line) 86%, transparent);
      border-radius: var(--radius);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface) 90%, var(--bg)));
      box-shadow: var(--shadow-tight);
      backdrop-filter: blur(18px);
    }

    .brand-row,
    .brand,
    .panel-head,
    .records-head,
    .sheet-head {
      display: flex;
      align-items: center;
    }

    .brand-row {
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      padding: 0 2px;
    }

    .brand {
      min-width: 0;
      gap: 10px;
    }

    .brand-mark {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: var(--radius);
      color: var(--accent-text);
      background:
        linear-gradient(145deg, color-mix(in srgb, var(--accent) 86%, #ffffff), color-mix(in srgb, var(--accent-2) 78%, #000000));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22), 0 12px 24px color-mix(in srgb, var(--accent) 18%, transparent);
      font-size: 18px;
      font-weight: 820;
    }

    .brand-copy {
      display: grid;
      gap: 1px;
      min-width: 0;
    }

    .brand-title {
      font-size: 21px;
      line-height: 1.08;
      font-weight: 790;
      letter-spacing: 0;
    }

    .brand-meta,
    .sync-status,
    .caption,
    .hero-meta,
    .side-note,
    .eyebrow,
    .side-label,
    .field-label,
    .label,
    .meta {
      color: var(--muted);
      overflow-wrap: anywhere;
    }

    .brand-meta {
      font-size: 13.5px;
      line-height: 1.25;
    }

    .sync-status {
      font-size: 12.5px;
      line-height: 1.2;
    }

    .icon-button {
      min-width: var(--tap);
      height: var(--tap);
      display: inline-grid;
      place-items: center;
      border: 1px solid color-mix(in srgb, var(--line) 88%, transparent);
      border-radius: var(--radius);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-raised) 96%, #ffffff), color-mix(in srgb, var(--surface-soft) 72%, var(--surface)));
      box-shadow: var(--shadow-soft);
      font-size: 20px;
      line-height: 1;
      transition: transform .16s ease, background-color .16s ease, border-color .16s ease;
    }

    .icon-button:active,
    .segments button:active,
    .tabs button:active,
    .quick-filters button:active,
    .view-switch button:active,
    .density-button:active,
    .primary:active,
    .secondary:active,
    .danger:active {
      transform: translateY(1px);
    }

    .segments,
    .tabs,
    .quick-filters,
    .view-switch {
      display: grid;
      gap: 5px;
      padding: 4px;
      border: 1px solid color-mix(in srgb, var(--line) 90%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-soft) 70%, var(--surface));
      box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-raised) 80%, transparent);
    }

    .segments {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 8px;
    }

    .tabs {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .quick-filters {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .view-switch {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .segments button,
    .tabs button,
    .quick-filters button,
    .view-switch button {
      min-height: var(--tap);
      border: 1px solid transparent;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
      font-size: 14.5px;
      font-weight: 730;
      letter-spacing: 0;
      transition: background-color .16s ease, color .16s ease, border-color .16s ease, box-shadow .16s ease, transform .16s ease;
    }

    .segments button:hover,
    .tabs button:hover,
    .quick-filters button:hover,
    .view-switch button:hover,
    .density-button:hover,
    .icon-button:hover {
      color: var(--text);
      background: color-mix(in srgb, var(--surface) 74%, transparent);
    }

    .segments button.active,
    .tabs button.active,
    .quick-filters button.active,
    .view-switch button.active {
      background: var(--surface-raised);
      color: var(--text);
      border-color: color-mix(in srgb, var(--line) 84%, transparent);
      box-shadow: 0 8px 22px rgba(15, 23, 42, .08);
    }

    .segments button.active {
      color: var(--accent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent), 0 8px 22px color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .tabs button.active {
      background: var(--text);
      color: var(--bg);
      border-color: var(--text);
    }

    .tabs button.has-data::after {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-left: 6px;
      border-radius: 50%;
      background: var(--debt);
      vertical-align: middle;
    }

    .view {
      display: none;
      animation: viewIn .22s ease both;
    }

    .view.active {
      display: block;
    }

    @keyframes viewIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-grid,
    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.12fr) minmax(230px, .88fr);
      gap: 12px;
    }

    .hero-grid {
      margin-bottom: 10px;
    }

    .dashboard-grid {
      align-items: start;
    }

    .panel,
    .hero-card,
    .metric-card {
      min-width: 0;
      border: 1px solid color-mix(in srgb, var(--line) 88%, transparent);
      border-radius: var(--radius);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-raised) 98%, transparent), color-mix(in srgb, var(--surface) 94%, var(--surface-tint)));
      box-shadow: var(--shadow-tight);
    }

    .panel,
    .hero-card {
      padding: 18px;
    }

    .primary-panel {
      position: relative;
      overflow: hidden;
      background:
        linear-gradient(140deg, color-mix(in srgb, var(--surface-raised) 96%, transparent), color-mix(in srgb, var(--accent) 8%, var(--surface)) 58%, color-mix(in srgb, var(--accent-2) 8%, var(--surface)));
      border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
    }

    .primary-panel::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--expense));
      opacity: .82;
    }

    .balance-panel {
      display: grid;
      align-content: start;
      gap: 8px;
      color: var(--bg);
      background:
        linear-gradient(150deg, color-mix(in srgb, var(--text) 96%, var(--accent)), color-mix(in srgb, var(--text) 88%, var(--accent-2)));
      box-shadow: var(--shadow);
    }

    .balance-panel .side-label,
    .balance-panel .side-note {
      color: color-mix(in srgb, var(--bg) 72%, transparent);
    }

    .eyebrow,
    .side-label,
    .caption,
    .label,
    .field-label {
      font-size: 13.5px;
      line-height: 1.35;
      font-weight: 690;
      letter-spacing: 0;
    }

    .hero-meta,
    .side-note,
    .hint,
    .meta {
      font-size: 13.5px;
      line-height: 1.35;
    }

    .side-value {
      font-size: 31px;
      line-height: 1.1;
      font-weight: 790;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    .insight-card {
      margin-top: 14px;
      padding: 12px 13px;
      border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-raised) 66%, var(--accent) 10%);
      box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-raised) 72%, transparent);
      color: var(--text);
      font-size: 14px;
      line-height: 1.38;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 10px;
    }

    .metric-card {
      min-height: 98px;
      padding: 14px;
      transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    }

    .metric-card:hover {
      border-color: color-mix(in srgb, var(--accent) 22%, var(--line));
      background: color-mix(in srgb, var(--accent) 4%, var(--surface));
    }

    .metric-grid .error {
      grid-column: 1 / -1;
    }

    .metric-card .value {
      margin-top: 6px;
      font-size: 21px;
      line-height: 1.15;
      font-weight: 790;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    .hint {
      margin-top: 5px;
      color: var(--muted);
      overflow-wrap: anywhere;
    }

    .panel-head {
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 13px;
    }

    .wide {
      grid-column: span 2;
    }

    .strong {
      font-weight: 760;
    }

    .chart-surface {
      min-height: 250px;
      padding: 10px;
      border: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-tint) 78%, var(--surface));
      overflow: hidden;
    }

    .chart-svg rect:first-child {
      fill: transparent;
    }

    .chart-bar {
      transform-box: fill-box;
      transform-origin: bottom;
      animation: barRise .38s ease both;
    }

    @keyframes barRise {
      from {
        transform: scaleY(.08);
        opacity: .42;
      }
      to {
        transform: scaleY(1);
        opacity: 1;
      }
    }

    .chart-readout {
      margin-top: 8px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 680;
    }

    .day-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      margin-top: 10px;
      color: var(--muted);
      font-size: 13.5px;
      font-weight: 680;
    }

    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .expense-dot {
      background: var(--expense);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--expense) 15%, transparent);
    }

    .income-dot {
      background: var(--income);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--income) 15%, transparent);
    }

    .category-layout {
      display: grid;
      grid-template-columns: 176px minmax(0, 1fr);
      gap: 18px;
      align-items: center;
    }

    .donut {
      width: 168px;
      height: 168px;
      display: grid;
      place-items: center;
      margin: 0 auto;
      border-radius: 50%;
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--line) 70%, transparent),
        0 16px 36px rgba(15, 23, 42, .08);
    }

    .donut-core {
      width: 102px;
      height: 102px;
      display: grid;
      place-items: center;
      border: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
      border-radius: 50%;
      background: color-mix(in srgb, var(--surface-raised) 96%, transparent);
      color: var(--muted);
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-raised) 80%, transparent);
    }

    .donut-core strong {
      display: block;
      color: var(--text);
      font-size: 14px;
      overflow-wrap: anywhere;
    }

    .list,
    .records-canvas {
      display: grid;
      gap: 8px;
    }

    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: start;
      padding: 14px 0;
      border-top: 1px solid var(--line);
    }

    .row:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .title {
      color: var(--text);
      font-size: 16px;
      font-weight: 760;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    .amount {
      color: var(--text);
      font-size: 16px;
      font-weight: 790;
      letter-spacing: 0;
      text-align: right;
      white-space: nowrap;
    }

    .expense {
      color: var(--expense);
    }

    .income {
      color: var(--income);
    }

    .debt {
      color: var(--debt);
    }

    .support {
      color: var(--support);
    }

    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      max-width: 100%;
      padding: 4px 9px;
      border: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--surface-raised) 72%, transparent);
      color: var(--muted);
      font-size: 12.5px;
      font-weight: 760;
      overflow-wrap: anywhere;
    }

    .amount-pill {
      color: var(--support);
    }

    .progress {
      height: 9px;
      margin-top: 8px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--muted) 14%, transparent);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--expense);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22);
    }

    .swatch {
      width: 10px;
      height: 10px;
      display: inline-block;
      flex: 0 0 auto;
      border-radius: 3px;
    }

    .category-title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .records-panel {
      overflow: hidden;
    }

    .records-toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr) auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }

    .density-button {
      min-height: var(--tap);
      padding: 0 12px;
      border: 1px solid color-mix(in srgb, var(--line) 88%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-raised) 88%, var(--surface));
      color: var(--muted);
      font-size: 14px;
      font-weight: 740;
      transition: background-color .16s ease, color .16s ease, transform .16s ease;
      white-space: nowrap;
    }

    .density-button[aria-pressed="true"] {
      color: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
      background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    }

    .controls {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(150px, .6fr) minmax(170px, .7fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .field-wrap {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .search-wrap {
      position: relative;
    }

    .field {
      width: 100%;
      min-height: var(--tap);
      border: 1px solid color-mix(in srgb, var(--line) 84%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-raised) 88%, var(--surface));
      color: var(--text);
      padding: 10px 12px;
      outline: none;
    }

    .search-wrap .field {
      padding-right: 44px;
    }

    textarea.field {
      min-height: 92px;
      resize: vertical;
    }

    .clear-search {
      position: absolute;
      right: 5px;
      bottom: 5px;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
      font-size: 20px;
    }

    .record-card,
    .date-group {
      border: 1px solid color-mix(in srgb, var(--line) 86%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-raised) 92%, var(--surface));
      box-shadow: var(--shadow-soft);
    }

    .record-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: start;
      padding: 13px;
      transition: border-color .16s ease, background-color .16s ease, transform .16s ease;
    }

    .record-card:hover,
    .ledger-table tbody tr:hover,
    .group-row:hover {
      border-color: color-mix(in srgb, var(--accent) 24%, var(--line));
      background: color-mix(in srgb, var(--accent) 5%, var(--surface));
    }

    .clickable {
      cursor: pointer;
    }

    .record-main {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .record-title {
      color: var(--text);
      font-size: 15.5px;
      font-weight: 780;
      overflow-wrap: anywhere;
    }

    .record-meta,
    .record-tags {
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .record-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 2px;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 23px;
      padding: 2px 7px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--surface-soft) 74%, var(--surface));
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    .record-side {
      display: grid;
      gap: 5px;
      justify-items: end;
      text-align: right;
    }

    .record-id {
      color: var(--muted);
      font-size: 12px;
      font-weight: 720;
    }

    .table-scroll {
      overflow-x: auto;
      border: 1px solid color-mix(in srgb, var(--line) 86%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-raised) 90%, var(--surface));
      box-shadow: var(--shadow-soft);
    }

    .ledger-table {
      width: 100%;
      min-width: 760px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .ledger-table th,
    .ledger-table td {
      padding: 12px 10px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      font-size: 13.5px;
    }

    .ledger-table th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: color-mix(in srgb, var(--surface-soft) 86%, var(--surface));
      color: var(--muted);
      font-size: 12px;
      font-weight: 780;
      text-transform: uppercase;
    }

    .ledger-table tbody tr {
      transition: background-color .16s ease;
    }

    .ledger-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .ledger-table .amount-cell,
    .ledger-table .id-cell {
      text-align: right;
      white-space: nowrap;
    }

    .sort-button {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 28px;
      padding: 0;
      background: transparent;
      color: inherit;
      font-size: inherit;
      font-weight: inherit;
      text-transform: inherit;
    }

    .sort-arrow {
      color: var(--accent);
      font-size: 11px;
    }

    .date-group {
      overflow: hidden;
    }

    .date-group-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 13px;
      background: color-mix(in srgb, var(--surface-soft) 64%, var(--surface));
      border-bottom: 1px solid var(--line);
    }

    .date-title {
      color: var(--text);
      font-size: 15px;
      font-weight: 790;
    }

    .date-total {
      color: var(--muted);
      font-size: 13px;
      font-weight: 740;
      text-align: right;
    }

    .group-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      padding: 11px 13px;
      border-bottom: 1px solid var(--line);
      transition: background-color .16s ease;
    }

    .group-row:last-child {
      border-bottom: 0;
    }

    .density-compact .record-card,
    .density-compact .group-row {
      padding-top: 9px;
      padding-bottom: 9px;
    }

    .density-compact .record-title,
    .density-compact .title {
      font-size: 14.5px;
    }

    .density-compact .record-tags {
      display: none;
    }

    .density-compact .ledger-table th,
    .density-compact .ledger-table td {
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .empty,
    .error {
      min-height: 118px;
      display: grid;
      place-items: center;
      padding: 20px;
      border: 1px solid color-mix(in srgb, var(--line) 82%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-soft) 64%, var(--surface));
      color: var(--muted);
      text-align: center;
      font-weight: 680;
    }

    .error {
      color: var(--expense);
    }

    .skeleton {
      min-height: 92px;
      border-radius: var(--radius);
      background:
        linear-gradient(90deg, color-mix(in srgb, var(--surface-soft) 66%, transparent), color-mix(in srgb, var(--surface-raised) 90%, transparent), color-mix(in srgb, var(--surface-soft) 66%, transparent));
      background-size: 200% 100%;
      animation: shine 1.25s infinite linear;
    }

    @keyframes shine {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -200% 0;
      }
    }

    .sheet-backdrop {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: none;
      align-items: flex-end;
      background: rgba(15, 23, 42, .34);
      backdrop-filter: blur(9px);
    }

    .sheet-backdrop.open {
      display: flex;
    }

    .sheet {
      width: min(720px, 100%);
      max-height: 86vh;
      overflow: auto;
      margin: 0 auto;
      padding: 14px;
      border: 1px solid color-mix(in srgb, var(--line) 88%, transparent);
      border-bottom: 0;
      border-radius: var(--radius) var(--radius) 0 0;
      background: var(--surface);
      box-shadow: 0 -20px 60px rgba(15, 23, 42, .24);
      animation: sheetIn .22s ease both;
    }

    @keyframes sheetIn {
      from {
        transform: translateY(18px);
        opacity: .72;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .sheet-head {
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .details,
    .edit-form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }

    .detail,
    .edit-field {
      min-width: 0;
      border: 1px solid color-mix(in srgb, var(--line) 84%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-soft) 58%, var(--surface));
    }

    .detail {
      padding: 10px;
    }

    .detail.full,
    .edit-field.full {
      grid-column: span 2;
    }

    .detail .value {
      margin-top: 4px;
      color: var(--text);
      font-size: 15px;
      font-weight: 760;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .edit-field {
      display: grid;
      gap: 5px;
      padding: 10px;
    }

    .edit-field .field {
      background: var(--surface);
    }

    .actions {
      position: sticky;
      bottom: 0;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      padding-top: 8px;
      background: var(--surface);
    }

    .actions.editing {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .primary,
    .secondary,
    .danger {
      min-height: var(--tap);
      border-radius: var(--radius);
      font-weight: 800;
      transition: transform .16s ease, filter .16s ease;
    }

    .primary {
      background: var(--accent);
      color: var(--accent-text);
    }

    .secondary {
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--surface-raised) 88%, var(--surface));
      color: var(--text);
    }

    .danger {
      background: color-mix(in srgb, var(--expense) 15%, var(--surface));
      color: var(--expense);
    }

    @media (max-width: 820px) {
      .hero-grid,
      .dashboard-grid,
      .category-layout,
      .records-toolbar,
      .controls {
        grid-template-columns: 1fr;
      }

      .wide {
        grid-column: span 1;
      }

      .metric-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .day-cards {
        grid-template-columns: 1fr;
      }

      .donut {
        width: 180px;
        height: 180px;
      }

      .donut-core {
        width: 108px;
        height: 108px;
      }

      .density-button {
        width: 100%;
      }
    }

    @media (max-width: 520px) {
      .app-shell {
        padding:
          max(8px, env(safe-area-inset-top))
          max(8px, env(safe-area-inset-right))
          max(24px, calc(env(safe-area-inset-bottom) + 16px))
          max(8px, env(safe-area-inset-left));
      }

      .topbar {
        padding: 8px;
      }

      .brand-row {
        margin-bottom: 8px;
      }

      .brand-title {
        font-size: 20px;
      }

      .brand-meta {
        font-size: 13px;
      }

      .sync-status {
        display: none;
      }

      .brand-mark,
      .icon-button {
        width: 40px;
        height: 40px;
        min-width: 40px;
      }

      .segments,
      .tabs,
      .quick-filters,
      .view-switch {
        gap: 4px;
      }

      .segments button,
      .tabs button,
      .quick-filters button,
      .view-switch button {
        min-height: 40px;
        padding: 7px 4px;
        font-size: 13.5px;
      }

      .panel,
      .hero-card {
        padding: 15px;
      }

      h1 {
        font-size: 38px;
      }

      h2 {
        font-size: 20px;
      }

      .side-value {
        font-size: 28px;
      }

      .metric-card {
        min-height: 94px;
        padding: 12px;
      }

      .metric-card .value {
        font-size: 18px;
      }

      .chart-surface {
        padding: 8px;
      }

      .row,
      .record-card,
      .group-row {
        grid-template-columns: 1fr;
      }

      .amount,
      .record-side {
        justify-items: start;
        text-align: left;
      }

      .details,
      .edit-form,
      .actions,
      .actions.editing {
        grid-template-columns: 1fr;
      }

      .detail.full,
      .edit-field.full {
        grid-column: span 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: .001ms !important;
      }

      .skeleton {
        animation: none;
      }
    }
`;

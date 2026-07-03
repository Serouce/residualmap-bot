export const miniAppStyles = `
    :root {
      color-scheme: light dark;
      --bg: var(--tg-theme-bg-color, #f5f6f2);
      --bg-elevated: #fbfbf7;
      --surface: var(--tg-theme-secondary-bg-color, #ffffff);
      --surface-raised: #ffffff;
      --surface-panel: #f8f9f5;
      --surface-soft: #eef1ea;
      --surface-tint: #f7f8f3;
      --text: var(--tg-theme-text-color, #0d141f);
      --muted: var(--tg-theme-hint-color, #637083);
      --subtle: #858b82;
      --line: var(--tg-theme-section-separator-color, rgba(13, 20, 31, .105));
      --line-strong: rgba(13, 20, 31, .17);
      --accent: #0b8a76;
      --accent-2: #a97827;
      --accent-text: #ffffff;
      --expense: #b33b54;
      --income: #14765a;
      --debt: #956518;
      --support: #5d628f;
      --warning: #a45d17;
      --duplicate: #5753a1;
      --skipped: #647083;
      --category-a: #2f6871;
      --category-b: #8b4f67;
      --category-c: #9a6a2d;
      --category-d: #4a7563;
      --category-e: #5b6d91;
      --shadow: 0 22px 56px rgba(15, 23, 42, .105);
      --shadow-soft: 0 8px 22px rgba(15, 23, 42, .055);
      --shadow-tight: 0 1px 1px rgba(15, 23, 42, .045), 0 10px 28px rgba(15, 23, 42, .045);
      --hairline: color-mix(in srgb, var(--line) 78%, transparent);
      --radius: 8px;
      --tap: 44px;
    }

    :root[data-scheme="dark"] {
      --bg: var(--tg-theme-bg-color, #0f100f);
      --bg-elevated: #12130f;
      --surface: var(--tg-theme-secondary-bg-color, #171815);
      --surface-raised: #202018;
      --surface-panel: #1a1b17;
      --surface-soft: #25261f;
      --surface-tint: #12130f;
      --text: var(--tg-theme-text-color, #f6f8fb);
      --muted: var(--tg-theme-hint-color, #b6b1a4);
      --subtle: #8f8a7e;
      --line: var(--tg-theme-section-separator-color, rgba(255, 255, 255, .16));
      --line-strong: rgba(255, 255, 255, .24);
      --accent: #39c7a6;
      --accent-2: #d0a257;
      --accent-text: #061210;
      --expense: #f08ca1;
      --income: #82d8b5;
      --debt: #e0b762;
      --support: #b9b4e7;
      --warning: #f0b36d;
      --duplicate: #b8b3ff;
      --skipped: #b6bfca;
      --category-a: #8bc6bb;
      --category-b: #d7a3b8;
      --category-c: #e1bc83;
      --category-d: #9fc6a7;
      --category-e: #aeb9d6;
      --shadow: 0 20px 52px rgba(0, 0, 0, .34);
      --shadow-soft: 0 12px 30px rgba(0, 0, 0, .22);
      --shadow-tight: 0 1px 2px rgba(0, 0, 0, .18), 0 14px 34px rgba(0, 0, 0, .18);
      --hairline: color-mix(in srgb, var(--line) 74%, transparent);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-scheme="light"]) {
        --bg: var(--tg-theme-bg-color, #0f100f);
        --bg-elevated: #12130f;
        --surface: var(--tg-theme-secondary-bg-color, #171815);
        --surface-raised: #202018;
        --surface-panel: #1a1b17;
        --surface-soft: #25261f;
        --surface-tint: #12130f;
        --text: var(--tg-theme-text-color, #f6f8fb);
        --muted: var(--tg-theme-hint-color, #b6b1a4);
        --subtle: #8f8a7e;
        --line: var(--tg-theme-section-separator-color, rgba(255, 255, 255, .16));
        --line-strong: rgba(255, 255, 255, .24);
        --accent: #39c7a6;
        --accent-2: #d0a257;
        --accent-text: #061210;
        --expense: #f08ca1;
        --income: #82d8b5;
        --debt: #e0b762;
        --support: #b9b4e7;
        --warning: #f0b36d;
        --duplicate: #b8b3ff;
        --skipped: #b6bfca;
        --category-a: #8bc6bb;
        --category-b: #d7a3b8;
        --category-c: #e1bc83;
        --category-d: #9fc6a7;
        --category-e: #aeb9d6;
        --shadow: 0 20px 52px rgba(0, 0, 0, .32);
        --shadow-soft: 0 12px 30px rgba(0, 0, 0, .24);
        --shadow-tight: 0 1px 2px rgba(0, 0, 0, .18), 0 14px 34px rgba(0, 0, 0, .22);
        --hairline: color-mix(in srgb, var(--line) 74%, transparent);
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
        linear-gradient(180deg, color-mix(in srgb, var(--bg-elevated) 92%, var(--accent) 4%) 0, var(--bg) 330px);
      font: 16px/1.45 ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif;
      font-variant-numeric: tabular-nums;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
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
      font-size: 36px;
      line-height: 1.02;
      font-weight: 850;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    h2 {
      font-size: 20px;
      line-height: 1.2;
      font-weight: 820;
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

    [hidden] {
      display: none !important;
    }

    .app-shell {
      width: min(1040px, 100%);
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
      margin-bottom: 10px;
      padding: 8px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface) 88%, var(--bg));
      box-shadow: 0 1px 0 color-mix(in srgb, var(--surface-raised) 70%, transparent), var(--shadow-tight);
      backdrop-filter: blur(20px);
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
      background: var(--accent);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .18), 0 10px 24px color-mix(in srgb, var(--accent) 20%, transparent);
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
      background: color-mix(in srgb, var(--surface-raised) 86%, var(--surface));
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
      min-width: 0;
      width: 100%;
      gap: 5px;
      padding: 4px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-soft) 58%, var(--surface));
      box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-raised) 66%, transparent);
    }

    .segments {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 8px;
    }

    .tabs {
      grid-template-columns: repeat(4, minmax(0, 1fr));
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
      min-width: 0;
      min-height: var(--tap);
      border: 1px solid transparent;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
      font-size: 14.5px;
      font-weight: 760;
      letter-spacing: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      border-color: color-mix(in srgb, var(--line-strong) 74%, transparent);
      box-shadow: 0 6px 18px rgba(15, 23, 42, .07);
    }

    .segments button.active {
      color: var(--accent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent), 0 8px 22px color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .tabs button.active {
      background: var(--text);
      color: var(--surface);
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
      grid-template-columns: minmax(0, 1fr) minmax(260px, .58fr);
      margin-bottom: 10px;
    }

    .dashboard-grid {
      align-items: start;
    }

    .panel,
    .hero-card,
    .metric-card {
      min-width: 0;
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-panel) 86%, var(--surface));
      box-shadow: var(--shadow-tight);
    }

    .panel,
    .hero-card {
      padding: 16px;
    }

    .hero-card {
      min-height: 136px;
    }

    .primary-panel {
      position: relative;
      overflow: hidden;
      background: color-mix(in srgb, var(--surface-raised) 88%, var(--accent) 5%);
      border-color: color-mix(in srgb, var(--accent) 26%, var(--line));
      box-shadow: var(--shadow);
    }

    .primary-panel::after {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent-2) 82%, var(--accent)));
    }

    .balance-panel {
      display: grid;
      align-content: start;
      gap: 8px;
      color: var(--text);
      background: color-mix(in srgb, var(--surface-panel) 88%, var(--income) 4%);
      border-color: color-mix(in srgb, var(--income) 24%, var(--line));
    }

    .balance-panel .side-label,
    .balance-panel .side-note {
      color: var(--muted);
    }

    .summary-topline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .period-badge,
    .flow-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      max-width: 100%;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
      background: color-mix(in srgb, var(--surface-soft) 66%, var(--surface));
      color: var(--muted);
      font-size: 12px;
      font-weight: 820;
      overflow-wrap: anywhere;
      text-align: center;
    }

    .flow-chip.income {
      color: var(--income);
      border-color: color-mix(in srgb, var(--income) 34%, var(--line));
      background: color-mix(in srgb, var(--income) 12%, var(--surface));
    }

    .flow-chip.expense {
      color: var(--expense);
      border-color: color-mix(in srgb, var(--expense) 34%, var(--line));
      background: color-mix(in srgb, var(--expense) 12%, var(--surface));
    }

    .overview-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: 14px;
    }

    .overview-actions .secondary {
      min-height: 40px;
      justify-content: center;
    }

    .overview-dock {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
      margin-bottom: 9px;
    }

    .dock-item {
      min-width: 0;
      min-height: 70px;
      display: grid;
      gap: 3px;
      justify-items: start;
      align-content: center;
      padding: 10px 11px;
      border: 1px solid var(--hairline);
      border-top-width: 3px;
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-panel) 76%, var(--surface));
      box-shadow: none;
      text-align: left;
      transition: transform .16s ease, border-color .16s ease, background-color .16s ease;
    }

    .dock-item:hover {
      border-color: color-mix(in srgb, var(--accent) 32%, var(--line));
      background: color-mix(in srgb, var(--accent) 5%, var(--surface));
    }

    .dock-item:active {
      transform: translateY(1px);
    }

    .dock-import {
      border-top-color: var(--debt);
    }

    .dock-records {
      border-top-color: var(--accent);
    }

    .dock-debts {
      border-top-color: var(--support);
    }

    .dock-label {
      color: var(--muted);
      font-size: 11.5px;
      font-weight: 760;
      text-transform: uppercase;
    }

    .dock-item strong {
      max-width: 100%;
      color: var(--text);
      font-size: 16px;
      line-height: 1.16;
      font-weight: 820;
      overflow-wrap: anywhere;
    }

    .dock-item span:last-child {
      max-width: 100%;
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.3;
      font-weight: 680;
      overflow-wrap: anywhere;
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

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }

    .notice-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      padding: 13px;
      border: 1px solid color-mix(in srgb, var(--debt) 28%, var(--line));
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-raised) 82%, var(--debt) 5%);
      box-shadow: var(--shadow-tight);
    }

    .notice-title {
      color: var(--text);
      font-size: 16px;
      font-weight: 840;
    }

    .notice-meta {
      margin-top: 2px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 680;
      overflow-wrap: anywhere;
    }

    .notice-strip .secondary {
      flex: 0 0 auto;
      padding: 0 13px;
    }

    .review-queue {
      display: grid;
      grid-template-columns: minmax(150px, .32fr) minmax(0, 1fr);
      align-items: stretch;
      gap: 10px;
      border-color: color-mix(in srgb, var(--accent) 32%, var(--line));
      background: color-mix(in srgb, var(--surface-raised) 86%, var(--accent) 6%);
      box-shadow: var(--shadow);
    }

    .review-queue.is-clear {
      grid-template-columns: 1fr;
      border-color: color-mix(in srgb, var(--income) 24%, var(--line));
      background: color-mix(in srgb, var(--surface-raised) 88%, var(--income) 5%);
      box-shadow: var(--shadow-tight);
    }

    .review-queue-head {
      display: grid;
      align-content: center;
      gap: 2px;
      min-width: 0;
    }

    .review-items {
      display: grid;
      gap: 7px;
      min-width: 0;
    }

    .review-item {
      min-width: 0;
      min-height: var(--tap);
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      padding: 10px 11px;
      border: 1px solid color-mix(in srgb, var(--line) 82%, transparent);
      border-left-width: 3px;
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-panel) 84%, var(--surface));
      text-align: left;
      box-shadow: none;
      transition: transform .16s ease, background-color .16s ease, border-color .16s ease;
    }

    .review-item:hover {
      border-color: color-mix(in srgb, var(--accent) 34%, var(--line));
      background: color-mix(in srgb, var(--accent) 5%, var(--surface));
    }

    .review-item:active {
      transform: translateY(1px);
    }

    .review-import {
      border-left-color: var(--debt);
    }

    .review-debt {
      border-left-color: var(--support);
    }

    .review-item span,
    .review-item strong,
    .review-item small,
    .review-item b {
      min-width: 0;
      max-width: 100%;
    }

    .review-item span {
      display: grid;
      gap: 1px;
    }

    .review-item strong {
      color: var(--text);
      font-size: 14.5px;
      line-height: 1.25;
      font-weight: 840;
      overflow-wrap: anywhere;
    }

    .review-item small {
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.3;
      font-weight: 680;
      overflow-wrap: anywhere;
    }

    .review-item b {
      color: var(--accent);
      font-size: 13px;
      font-weight: 830;
      white-space: nowrap;
    }

    .metric-card {
      min-height: 92px;
      padding: 13px;
      background: color-mix(in srgb, var(--surface-panel) 78%, var(--surface));
      box-shadow: none;
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
      font-size: 22px;
      line-height: 1.15;
      font-weight: 850;
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
      padding: 13px 0;
      border-top: 1px solid color-mix(in srgb, var(--line) 74%, transparent);
    }

    .row:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .title {
      color: var(--text);
      font-size: 15.5px;
      font-weight: 800;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    .amount {
      color: var(--text);
      font-size: 16.5px;
      font-weight: 860;
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

    .duplicate {
      color: var(--duplicate);
    }

    .skipped {
      color: var(--skipped);
    }

    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      max-width: 100%;
      padding: 4px 9px;
      border: 1px solid var(--hairline);
      border-radius: 999px;
      background: color-mix(in srgb, var(--surface-panel) 76%, var(--surface));
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
      background: color-mix(in srgb, var(--muted) 11%, transparent);
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

    .import-panel {
      overflow: hidden;
    }

    .import-toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-bottom: 10px;
    }

    .import-toolbar .secondary {
      padding: 0 13px;
    }

    .imports-canvas {
      display: grid;
      gap: 10px;
    }

    .import-filters {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 10px;
    }

    .import-filters button {
      padding-inline: 5px;
      overflow-wrap: anywhere;
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

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      min-height: 28px;
      margin: -4px 0 12px;
    }

    .filter-chip,
    .filter-reset {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      max-width: 100%;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
      background: color-mix(in srgb, var(--surface-soft) 62%, var(--surface));
      color: var(--muted);
      font-size: 12px;
      font-weight: 740;
      overflow-wrap: anywhere;
    }

    .filter-reset {
      min-height: var(--tap);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 8%, var(--surface));
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
      padding-right: 52px;
    }

    textarea.field {
      min-height: 92px;
      resize: vertical;
    }

    .clear-search {
      position: absolute;
      right: 0;
      bottom: 0;
      width: var(--tap);
      height: var(--tap);
      display: grid;
      place-items: center;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
      font-size: 20px;
    }

    .record-card,
    .import-card,
    .date-group {
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-panel) 84%, var(--surface));
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

    .import-card {
      display: grid;
      gap: 11px;
      padding: 13px;
      box-shadow: var(--shadow-tight);
    }

    .import-card.import-draft {
      border-color: color-mix(in srgb, var(--debt) 28%, var(--line));
      background: color-mix(in srgb, var(--surface-raised) 84%, var(--debt) 4%);
    }

    .import-card.import-confirmed {
      border-color: color-mix(in srgb, var(--income) 30%, var(--line));
    }

    .import-card.import-cancelled {
      opacity: .84;
    }

    .import-card.import-failed {
      border-color: color-mix(in srgb, var(--expense) 36%, var(--line));
    }

    .import-card.is-target {
      outline: 3px solid color-mix(in srgb, var(--accent) 34%, transparent);
      outline-offset: 2px;
    }

    .record-card:hover,
    .import-card:hover,
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

    .import-card-head,
    .import-row,
    .import-actions {
      display: grid;
      gap: 10px;
    }

    .import-card-head {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
    }

    .import-title-wrap {
      min-width: 0;
    }

    .import-title {
      color: var(--text);
      font-size: 17px;
      line-height: 1.18;
      font-weight: 850;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .import-subtitle {
      margin-top: 2px;
      color: var(--muted);
      font-size: 12.5px;
      font-weight: 680;
      overflow-wrap: anywhere;
    }

    .import-review-steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      padding: 6px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-soft) 42%, var(--surface));
    }

    .import-step {
      min-width: 0;
      display: grid;
      gap: 2px;
      padding: 8px;
      border: 1px solid transparent;
      border-radius: calc(var(--radius) - 2px);
      color: var(--muted);
      background: transparent;
    }

    .import-step span,
    .import-step small {
      overflow-wrap: anywhere;
    }

    .import-step span {
      color: var(--text);
      font-size: 12.5px;
      line-height: 1.2;
      font-weight: 840;
    }

    .import-step small {
      color: var(--muted);
      font-size: 11.5px;
      line-height: 1.25;
      font-weight: 680;
    }

    .step-done {
      border-color: color-mix(in srgb, var(--income) 24%, var(--line));
      background: color-mix(in srgb, var(--income) 8%, var(--surface));
    }

    .step-active {
      border-color: color-mix(in srgb, var(--debt) 32%, var(--line));
      background: color-mix(in srgb, var(--debt) 10%, var(--surface));
    }

    .step-failed {
      border-color: color-mix(in srgb, var(--expense) 32%, var(--line));
      background: color-mix(in srgb, var(--expense) 10%, var(--surface));
    }

    .step-cancelled {
      border-color: color-mix(in srgb, var(--muted) 26%, var(--line));
      background: color-mix(in srgb, var(--muted) 9%, var(--surface));
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      max-width: 100%;
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
      background: color-mix(in srgb, var(--surface-soft) 68%, var(--surface));
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      overflow-wrap: anywhere;
      white-space: normal;
      text-align: center;
    }

    .status-draft {
      border-color: color-mix(in srgb, var(--debt) 34%, var(--line));
      background: color-mix(in srgb, var(--debt) 12%, var(--surface));
      color: var(--debt);
    }

    .status-confirmed,
    .status-imported {
      border-color: color-mix(in srgb, var(--income) 34%, var(--line));
      background: color-mix(in srgb, var(--income) 12%, var(--surface));
      color: var(--income);
    }

    .status-duplicate {
      border-color: color-mix(in srgb, var(--duplicate) 36%, var(--line));
      background: color-mix(in srgb, var(--duplicate) 12%, var(--surface));
      color: var(--duplicate);
    }

    .status-skipped {
      border-color: color-mix(in srgb, var(--skipped) 34%, var(--line));
      background: color-mix(in srgb, var(--skipped) 10%, var(--surface));
      color: var(--skipped);
    }

    .status-cancelled {
      border-color: color-mix(in srgb, var(--muted) 30%, var(--line));
      background: color-mix(in srgb, var(--muted) 10%, var(--surface));
      color: var(--muted);
    }

    .status-failed {
      border-color: color-mix(in srgb, var(--expense) 34%, var(--line));
      background: color-mix(in srgb, var(--expense) 12%, var(--surface));
      color: var(--expense);
    }

    .import-facts {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }

    .import-fact {
      min-width: 0;
      padding: 9px;
      border: 1px solid color-mix(in srgb, var(--line) 74%, transparent);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-panel) 72%, var(--surface));
    }

    .import-fact.fact-debt,
    .import-fact.fact-duplicate,
    .import-fact.fact-skipped,
    .import-fact.fact-expense,
    .import-fact.fact-income {
      border-color: color-mix(in srgb, currentColor 20%, var(--line));
      background: color-mix(in srgb, currentColor 7%, var(--surface));
    }

    .import-fact.fact-debt {
      color: var(--debt);
    }

    .import-fact.fact-duplicate {
      color: var(--duplicate);
    }

    .import-fact.fact-skipped {
      color: var(--skipped);
    }

    .import-fact.fact-expense {
      color: var(--expense);
    }

    .import-fact.fact-income {
      color: var(--income);
    }

    .import-fact .value {
      margin-top: 2px;
      color: var(--text);
      font-size: 14px;
      font-weight: 850;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .import-decision-summary,
    .import-notice,
    .import-history-summary,
    .import-preview-head {
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-soft) 42%, var(--surface));
    }

    .import-history-summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      padding: 6px;
      background: color-mix(in srgb, var(--income) 7%, var(--surface));
    }

    .history-fact {
      min-width: 0;
      padding: 8px;
      border: 1px solid color-mix(in srgb, var(--income) 18%, var(--line));
      border-radius: calc(var(--radius) - 2px);
      background: color-mix(in srgb, var(--surface-panel) 82%, var(--surface));
    }

    .history-fact .value {
      margin-top: 2px;
      color: var(--text);
      font-size: 13.5px;
      font-weight: 840;
      overflow-wrap: anywhere;
    }

    .import-decision-summary {
      display: grid;
      gap: 2px;
      padding: 10px 11px;
      border-left: 4px solid var(--debt);
      background: color-mix(in srgb, var(--debt) 9%, var(--surface));
    }

    .import-decision-summary strong {
      color: var(--text);
      font-size: 14.5px;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .import-decision-summary span {
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.35;
      font-weight: 680;
      overflow-wrap: anywhere;
    }

    .import-notices {
      display: grid;
      gap: 6px;
    }

    .import-notice {
      display: grid;
      grid-template-columns: minmax(72px, auto) minmax(0, 1fr);
      gap: 8px;
      align-items: start;
      padding: 8px 10px;
      border-left: 3px solid var(--warning);
      color: var(--warning);
      font-size: 12.5px;
      font-weight: 720;
      overflow-wrap: anywhere;
    }

    .import-notice span {
      font-weight: 840;
    }

    .import-notice p {
      color: var(--text);
      font-weight: 680;
      overflow-wrap: anywhere;
    }

    .notice-duplicate {
      border-left-color: var(--duplicate);
      color: var(--duplicate);
    }

    .notice-skipped {
      border-left-color: var(--skipped);
      color: var(--skipped);
    }

    .notice-truncated,
    .notice-warning {
      border-left-color: var(--warning);
      color: var(--warning);
    }

    .import-inline-error {
      min-height: 0;
      display: block;
      padding: 9px 10px;
      text-align: left;
    }

    .import-preview {
      display: grid;
      gap: 0;
      overflow: hidden;
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-tint) 74%, var(--surface));
    }

    .import-preview-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 10px;
      color: var(--muted);
      font-size: 12.5px;
      font-weight: 740;
    }

    .import-row {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      padding: 10px 11px;
      border-top: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
    }

    .import-row:first-child {
      border-top: 0;
    }

    .import-row.status-duplicate,
    .import-row.status-skipped {
      background: color-mix(in srgb, var(--muted) 7%, transparent);
    }

    .import-row-main {
      min-width: 0;
    }

    .import-actions {
      grid-template-columns: 1fr 1fr;
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
      min-height: var(--tap);
      max-width: 100%;
      padding: 0 4px;
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
      border: 1px solid var(--hairline);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface-panel) 68%, var(--surface));
      color: var(--muted);
      text-align: center;
      font-weight: 680;
    }

    .empty.compact {
      min-height: 72px;
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    .error {
      color: var(--expense);
    }

    .skeleton {
      min-height: 92px;
      border-radius: var(--radius);
      background:
        linear-gradient(90deg, color-mix(in srgb, var(--surface-soft) 58%, transparent), color-mix(in srgb, var(--surface-raised) 86%, transparent), color-mix(in srgb, var(--surface-soft) 58%, transparent));
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
      background: color-mix(in srgb, var(--surface) 92%, var(--bg));
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
      padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
      background: var(--surface);
    }

    .actions.editing {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .primary,
    .secondary,
    .danger {
      position: relative;
      display: inline-grid;
      place-items: center;
      min-height: var(--tap);
      min-width: 0;
      padding: 0 12px;
      border-radius: var(--radius);
      font-weight: 800;
      letter-spacing: 0;
      overflow: hidden;
      transition: transform .16s ease, filter .16s ease;
    }

    .button-label {
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .primary.is-loading .button-label,
    .secondary.is-loading .button-label,
    .danger.is-loading .button-label {
      opacity: 0;
    }

    .primary.is-loading::after,
    .secondary.is-loading::after,
    .danger.is-loading::after {
      content: attr(data-loading-label);
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 0 12px;
      color: inherit;
      white-space: nowrap;
    }

    .primary {
      background: var(--accent);
      color: var(--accent-text);
      box-shadow: 0 10px 22px color-mix(in srgb, var(--accent) 16%, transparent);
    }

    .secondary {
      border: 1px solid var(--hairline);
      background: color-mix(in srgb, var(--surface-panel) 82%, var(--surface));
      color: var(--text);
    }

    .danger {
      background: color-mix(in srgb, var(--expense) 15%, var(--surface));
      color: var(--expense);
      border: 1px solid color-mix(in srgb, var(--expense) 22%, var(--line));
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

      .overview-dock {
        grid-template-columns: repeat(3, minmax(0, 1fr));
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

      .import-facts {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .import-toolbar {
        justify-content: stretch;
      }

      .import-toolbar .secondary {
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
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .brand-mark,
      .icon-button {
        width: var(--tap);
        height: var(--tap);
        min-width: var(--tap);
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
        min-height: var(--tap);
        padding: 7px 4px;
        font-size: 13.5px;
      }

      .panel,
      .hero-card {
        padding: 15px;
      }

      .hero-card {
        min-height: 0;
      }

      .overview-dock {
        grid-template-columns: 1fr;
      }

      .dock-item {
        min-height: 68px;
      }

      h1 {
        font-size: 30px;
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
        white-space: normal;
      }

      .details,
      .edit-form,
      .actions,
      .actions.editing {
        grid-template-columns: 1fr;
      }

      .notice-strip,
      .review-queue,
      .import-card-head,
      .import-review-steps,
      .import-history-summary,
      .import-row,
      .import-actions {
        grid-template-columns: 1fr;
      }

      .notice-strip {
        display: grid;
      }

      .notice-strip .secondary {
        width: 100%;
      }

      .review-item {
        grid-template-columns: 1fr;
      }

      .review-item b {
        white-space: normal;
      }

      .status-badge {
        justify-self: start;
      }

      .import-notice {
        grid-template-columns: 1fr;
      }

      .import-facts {
        grid-template-columns: 1fr;
      }

      .detail.full,
      .edit-field.full {
        grid-column: span 1;
      }
    }

    /* Premium v2: stronger hierarchy, lighter chrome, less card soup. */
    .app-shell {
      width: min(920px, 100%);
      padding:
        max(10px, env(safe-area-inset-top))
        max(14px, env(safe-area-inset-right))
        max(30px, calc(env(safe-area-inset-bottom) + 18px))
        max(14px, env(safe-area-inset-left));
    }

    .topbar {
      margin: 0 0 14px;
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 5px 0 12px;
      border: 0;
      border-bottom: 1px solid var(--hairline);
      border-radius: 0;
      background: color-mix(in srgb, var(--bg) 82%, transparent);
      box-shadow: none;
      backdrop-filter: blur(22px);
    }

    .brand-row {
      margin-bottom: 12px;
      padding: 0;
    }

    .brand {
      gap: 11px;
    }

    .brand-mark {
      width: 38px;
      height: 38px;
      border: 1px solid color-mix(in srgb, var(--accent) 38%, var(--line));
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--accent) 92%, #ffffff), color-mix(in srgb, var(--accent-2) 82%, #14120c));
      box-shadow: 0 10px 26px color-mix(in srgb, var(--accent) 16%, transparent);
      font-size: 17px;
    }

    .brand-title {
      font-size: 22px;
      line-height: 1.02;
      font-weight: 880;
    }

    .brand-meta {
      font-size: 12.5px;
      line-height: 1.2;
      color: var(--subtle);
    }

    .sync-status {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .icon-button {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-color: var(--hairline);
      background: color-mix(in srgb, var(--surface-panel) 70%, transparent);
      box-shadow: none;
      font-size: 18px;
    }

    .segments,
    .tabs,
    .quick-filters,
    .view-switch {
      gap: 5px;
      width: 100%;
      max-width: 100%;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .segments {
      margin-bottom: 8px;
    }

    .segments button,
    .tabs button,
    .quick-filters button,
    .view-switch button {
      width: 100%;
      min-width: 0;
      min-height: 36px;
      padding: 7px 8px;
      border: 1px solid transparent;
      border-radius: var(--radius);
      color: var(--muted);
      font-size: 13px;
      font-weight: 770;
      background: transparent;
    }

    .segments button.active,
    .tabs button.active,
    .quick-filters button.active,
    .view-switch button.active {
      border-color: color-mix(in srgb, var(--accent) 26%, var(--line));
      background: color-mix(in srgb, var(--accent) 9%, var(--surface));
      color: var(--text);
      box-shadow: none;
    }

    .tabs button.active {
      border-color: transparent;
      background: transparent;
      color: var(--text);
      box-shadow: inset 0 -2px 0 var(--accent);
    }

    .hero-grid {
      grid-template-columns: minmax(0, 1.15fr) minmax(220px, .85fr);
      gap: 0;
      margin-bottom: 12px;
      padding: 18px;
      border: 1px solid color-mix(in srgb, var(--accent) 24%, var(--line));
      border-radius: var(--radius);
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--surface-raised) 80%, var(--accent) 9%), color-mix(in srgb, var(--surface-panel) 82%, var(--accent-2) 7%));
      box-shadow: 0 22px 70px color-mix(in srgb, #000 18%, transparent);
      overflow: hidden;
      position: relative;
    }

    .hero-grid::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 9%, transparent), transparent),
        repeating-linear-gradient(90deg, transparent 0 27px, color-mix(in srgb, var(--line) 26%, transparent) 27px 28px);
      opacity: .34;
    }

    .hero-card,
    .primary-panel,
    .balance-panel {
      position: relative;
      z-index: 1;
      min-height: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .primary-panel::after {
      display: none;
    }

    .balance-panel {
      align-content: center;
      padding-left: 18px;
      border-left: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
    }

    h1 {
      margin-top: 6px;
      color: var(--text);
      -webkit-text-fill-color: currentColor;
      font-size: 48px;
      line-height: .96;
      font-weight: 900;
      text-shadow: 0 1px 0 color-mix(in srgb, var(--surface-raised) 28%, transparent);
    }

    .side-value {
      color: var(--text);
      -webkit-text-fill-color: currentColor;
      font-size: 34px;
      line-height: 1;
      font-weight: 880;
      text-shadow: 0 1px 0 color-mix(in srgb, var(--surface-raised) 28%, transparent);
    }

    .hero-meta,
    .side-note {
      margin-top: 8px;
      color: var(--subtle);
      font-size: 13px;
    }

    .period-badge,
    .flow-chip {
      min-height: 26px;
      padding: 3px 9px;
      background: color-mix(in srgb, var(--surface-soft) 42%, transparent);
      border-color: color-mix(in srgb, var(--accent-2) 18%, var(--line));
      font-size: 11.5px;
    }

    .overview-actions {
      margin-top: 16px;
      gap: 8px;
    }

    .overview-actions .secondary {
      min-height: 38px;
      background: color-mix(in srgb, var(--surface-panel) 76%, transparent);
    }

    .notice-strip.review-queue,
    .review-queue {
      grid-template-columns: minmax(132px, .28fr) minmax(0, 1fr);
      margin: 0 0 12px;
      padding: 0 0 12px;
      border: 0;
      border-bottom: 1px solid var(--hairline);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .review-queue-head {
      align-content: start;
      padding-top: 2px;
    }

    .notice-title {
      font-size: 18px;
      font-weight: 850;
    }

    .review-items {
      gap: 6px;
    }

    .review-item {
      min-height: 50px;
      padding: 10px 12px;
      border-color: var(--hairline);
      background: color-mix(in srgb, var(--surface-panel) 78%, var(--surface));
      box-shadow: inset 2px 0 0 color-mix(in srgb, var(--accent) 70%, transparent);
    }

    .overview-dock {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      margin-bottom: 10px;
    }

    .dock-item {
      min-height: 58px;
      padding: 8px 9px;
      border-top-width: 2px;
      background: color-mix(in srgb, var(--surface-panel) 48%, transparent);
    }

    .dock-label {
      font-size: 10px;
    }

    .dock-item strong {
      font-size: 13.5px;
    }

    .dock-item span:last-child {
      font-size: 11.2px;
    }

    .metric-grid {
      gap: 7px;
    }

    .metric-card {
      min-height: 76px;
      padding: 10px;
      border-color: var(--hairline);
      background: color-mix(in srgb, var(--surface-panel) 58%, transparent);
    }

    .metric-card .value {
      font-size: 19px;
      font-weight: 860;
    }

    .dashboard-grid {
      gap: 10px;
    }

    .panel {
      border-color: var(--hairline);
      background: color-mix(in srgb, var(--surface-panel) 44%, transparent);
      box-shadow: none;
    }

    .import-panel {
      background: transparent;
      border-color: transparent;
      padding: 0;
    }

    .import-panel > .panel-head {
      padding: 0 2px;
    }

    .import-card {
      padding: 14px;
      border-color: color-mix(in srgb, var(--line-strong) 70%, transparent);
      background: color-mix(in srgb, var(--surface-panel) 82%, var(--surface));
      box-shadow: var(--shadow-tight);
    }

    .import-card.import-draft {
      border-color: color-mix(in srgb, var(--debt) 26%, var(--line));
      background: color-mix(in srgb, var(--surface-panel) 86%, var(--debt) 3%);
    }

    .import-review-steps {
      background: color-mix(in srgb, var(--bg) 46%, transparent);
    }

    .import-step {
      padding: 9px;
    }

    .import-facts {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .import-fact {
      padding: 8px;
      background: color-mix(in srgb, var(--surface-panel) 58%, transparent);
    }

    .import-decision-summary {
      border-left-width: 3px;
      background: color-mix(in srgb, var(--debt) 7%, transparent);
    }

    .primary {
      background: var(--accent);
      color: var(--accent-text);
    }

    @media (max-width: 820px) {
      .hero-grid {
        grid-template-columns: 1fr;
      }

      .balance-panel {
        margin-top: 16px;
        padding-top: 15px;
        padding-left: 0;
        border-left: 0;
        border-top: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
      }

      .import-facts {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 520px) {
      .app-shell {
        padding:
          max(10px, env(safe-area-inset-top))
          max(10px, env(safe-area-inset-right))
          max(26px, calc(env(safe-area-inset-bottom) + 16px))
          max(10px, env(safe-area-inset-left));
      }

      .topbar {
        padding-top: 2px;
      }

      .brand-title {
        font-size: 20px;
      }

      .segments button,
      .tabs button,
      .quick-filters button,
      .view-switch button {
        min-height: 32px;
        padding: 5px 2px;
        font-size: 11px;
      }

      .segments,
      .tabs {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 3px;
      }

      .hero-grid {
        padding: 16px;
      }

      h1 {
        font-size: 42px;
      }

      .side-value {
        font-size: 31px;
      }

      .notice-strip.review-queue,
      .review-queue {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .review-item {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .overview-dock {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .dock-item {
        min-height: 64px;
      }

      .metric-card {
        min-height: 78px;
      }

      .metric-card .value {
        font-size: 18px;
      }

      .import-facts,
      .import-history-summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .import-review-steps {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .import-step {
        padding: 7px 5px;
      }

      .import-step span {
        font-size: 11.5px;
      }

      .import-step small {
        font-size: 10.5px;
      }
    }

    :root[data-scheme="dark"] .primary-panel h1,
    :root[data-scheme="dark"] .balance-panel .side-value {
      color: #f7f3e8;
      -webkit-text-fill-color: #f7f3e8;
      text-shadow: 0 8px 28px rgba(0, 0, 0, .28);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-scheme="light"]) .primary-panel h1,
      :root:not([data-scheme="light"]) .balance-panel .side-value {
        color: #f7f3e8;
        -webkit-text-fill-color: #f7f3e8;
        text-shadow: 0 8px 28px rgba(0, 0, 0, .28);
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

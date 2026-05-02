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
    :root {
      color-scheme: light dark;
      --bg: var(--tg-theme-bg-color, #f6f7f9);
      --surface: var(--tg-theme-secondary-bg-color, #ffffff);
      --surface-raised: #ffffff;
      --surface-soft: #f0f3f6;
      --text: var(--tg-theme-text-color, #171b23);
      --muted: var(--tg-theme-hint-color, #5f6875);
      --subtle: #667085;
      --line: var(--tg-theme-section-separator-color, rgba(23,27,35,.12));
      --accent: var(--tg-theme-button-color, #2b6f68);
      --accent-text: var(--tg-theme-button-text-color, #ffffff);
      --expense: #a64257;
      --income: #24775b;
      --debt: #8a611a;
      --category-a: #344e7c;
      --category-b: #7a4d8a;
      --category-c: #8a5a2c;
      --category-d: #3d6f7a;
      --shadow: 0 12px 28px rgba(15,23,42,.08);
      --shadow-soft: 0 6px 18px rgba(15,23,42,.06);
      --ink: var(--text);
      --solid: var(--surface);
      --soft-muted: var(--muted);
      --hairline: var(--line);
      --rose: var(--expense);
      --green: var(--income);
      --gold: var(--debt);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: var(--tg-theme-bg-color, #0f1116);
        --surface: var(--tg-theme-secondary-bg-color, #171a21);
        --surface-raised: #1d212a;
        --surface-soft: #222733;
        --text: var(--tg-theme-text-color, #f3f5f7);
        --muted: var(--tg-theme-hint-color, #a9b0bd);
        --subtle: #b5bdca;
        --line: var(--tg-theme-section-separator-color, rgba(255,255,255,.12));
        --accent: var(--tg-theme-button-color, #5fb1a5);
        --accent-text: var(--tg-theme-button-text-color, #08110f);
        --expense: #df8699;
        --income: #71c5a4;
        --debt: #d5a956;
        --category-a: #8ea9df;
        --category-b: #c09ad0;
        --category-c: #d3ad82;
        --category-d: #8dbdc5;
        --shadow: 0 12px 30px rgba(0,0,0,.22);
        --shadow-soft: 0 8px 18px rgba(0,0,0,.2);
      }
    }
    :root[data-scheme="dark"] {
      --bg: var(--tg-theme-bg-color, #0f1116);
      --surface: var(--tg-theme-secondary-bg-color, #171a21);
      --surface-raised: #1d212a;
      --surface-soft: #222733;
      --text: var(--tg-theme-text-color, #f3f5f7);
      --muted: var(--tg-theme-hint-color, #a9b0bd);
      --subtle: #b5bdca;
      --line: var(--tg-theme-section-separator-color, rgba(255,255,255,.12));
      --accent: var(--tg-theme-button-color, #5fb1a5);
      --accent-text: var(--tg-theme-button-text-color, #08110f);
      --expense: #df8699;
      --income: #71c5a4;
      --debt: #d5a956;
      --category-a: #8ea9df;
      --category-b: #c09ad0;
      --category-c: #d3ad82;
      --category-d: #8dbdc5;
      --shadow: 0 12px 30px rgba(0,0,0,.22);
      --shadow-soft: 0 8px 18px rgba(0,0,0,.2);
    }
    body {
      color: var(--text);
      background: var(--bg);
      font: 16px/1.45 ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif;
      font-variant-numeric: tabular-nums;
    }
    button, input, select {
      font: inherit;
    }
    button {
      color: inherit;
      -webkit-tap-highlight-color: transparent;
    }
    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    .clickable:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--accent) 34%, transparent);
      outline-offset: 2px;
    }
    .app {
      width: min(860px, 100%);
      padding:
        max(8px, env(safe-area-inset-top))
        max(10px, env(safe-area-inset-right))
        max(26px, calc(env(safe-area-inset-bottom) + 18px))
        max(10px, env(safe-area-inset-left));
    }
    .top {
      padding: 8px 0 9px;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      backdrop-filter: blur(18px);
      border-bottom: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
      transition: padding .18s ease, box-shadow .18s ease;
    }
    body.is-scrolled .top {
      padding-top: 5px;
      box-shadow: 0 10px 28px rgba(15,23,42,.08);
    }
    body.is-scrolled .brand-row {
      margin-bottom: 6px;
    }
    body.is-scrolled .mark {
      width: 32px;
      height: 32px;
    }
    body.is-scrolled .brand-sub,
    body.is-scrolled .sync-status {
      display: none;
    }
    .brand-row {
      margin-bottom: 9px;
    }
    .mark {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--accent) 14%, var(--surface));
      box-shadow: none;
      color: var(--accent);
      font-size: 18px;
      transition: width .18s ease, height .18s ease;
    }
    .brand-title {
      font-size: 20px;
      line-height: 1.1;
      font-weight: 780;
    }
    .brand-sub {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.25;
    }
    .brand-meta {
      display: grid;
      gap: 1px;
      min-width: 0;
    }
    .sync-status {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.2;
    }
    .icon-btn {
      min-width: 44px;
      height: 44px;
      border-radius: 8px;
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: none;
      color: var(--text);
      font-size: 20px;
    }
    .icon-btn[disabled] {
      cursor: progress;
      opacity: .7;
    }
    .icon-btn.loading {
      color: var(--accent);
    }
    .segments,
    .tabs {
      gap: 6px;
    }
    .segments {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 7px;
    }
    .tabs {
      padding: 3px;
      border-radius: 8px;
      background: var(--surface-soft);
      border: 1px solid var(--line);
      box-shadow: none;
    }
    .segments button,
    .tabs button {
      min-height: 44px;
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      font-size: 15px;
      font-weight: 720;
      box-shadow: none;
    }
    .segments button.active {
      background: color-mix(in srgb, var(--accent) 13%, var(--surface));
      color: var(--text);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 34%, transparent);
    }
    .tabs button.active {
      background: var(--text);
      color: var(--bg);
      box-shadow: none;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      box-shadow: var(--shadow-soft);
      backdrop-filter: none;
    }
    .hero {
      grid-template-columns: minmax(0, 1.3fr) minmax(210px, .7fr);
      gap: 10px;
      margin: 12px 0 10px;
    }
    .hero-main,
    .hero-side {
      padding: 18px;
      background: var(--surface);
      color: var(--text);
    }
    .hero-main {
      border-color: color-mix(in srgb, var(--accent) 26%, var(--line));
    }
    .hero-side {
      display: grid;
      align-content: start;
      gap: 10px;
      background: var(--text);
      color: var(--bg);
    }
    .eyebrow,
    .side-label,
    .caption,
    .label {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
      font-weight: 690;
    }
    .hero-side .side-label,
    .hero-side .caption {
      color: color-mix(in srgb, var(--bg) 70%, transparent);
    }
    h1 {
      margin: 7px 0 4px;
      font-size: 42px;
      line-height: 1.02;
      font-weight: 790;
      letter-spacing: 0;
    }
    h2 {
      font-size: 21px;
      line-height: 1.2;
      font-weight: 780;
    }
    .side-value {
      margin-top: 5px;
      font-size: 28px;
      line-height: 1.1;
      font-weight: 790;
    }
    .hint {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
    }
    .insight {
      margin-top: 12px;
      padding: 11px 12px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--accent) 10%, var(--surface));
      color: var(--text);
      font-size: 15px;
      line-height: 1.35;
      font-weight: 680;
    }
    .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }
    .metric {
      min-height: 88px;
      padding: 12px;
      background: var(--surface);
    }
    .metric:nth-child(n) {
      background: var(--surface);
    }
    .value,
    .amount {
      font-variant-numeric: tabular-nums;
    }
    .value {
      margin-top: 6px;
      font-size: 20px;
      line-height: 1.16;
      font-weight: 790;
    }
    .dashboard {
      grid-template-columns: minmax(0, 1.08fr) minmax(280px, .92fr);
      gap: 10px;
    }
    .panel {
      padding: 16px;
    }
    .panel-head {
      margin-bottom: 13px;
    }
    .chart {
      min-height: 0;
    }
    svg.chart-svg text {
      font-size: 13px;
      fill: var(--muted);
    }
    .legend {
      gap: 12px;
      margin-top: 9px;
      color: var(--muted);
      font-size: 14px;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: var(--expense);
    }
    .dot.income {
      background: var(--income);
    }
    .category-layout {
      display: block;
    }
    .donut {
      display: none;
    }
    .list {
      gap: 0;
    }
    .row {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      padding: 13px 0;
      border-top: 1px solid var(--line);
    }
    .row:first-child {
      border-top: 0;
      padding-top: 0;
    }
    .clickable {
      cursor: pointer;
      border-radius: 8px;
      margin: 0 -8px;
      padding-left: 8px;
      padding-right: 8px;
    }
    .clickable:active,
    .clickable:hover {
      background: color-mix(in srgb, var(--accent) 7%, transparent);
    }
    .title {
      font-size: 16px;
      line-height: 1.3;
      font-weight: 760;
    }
    .meta {
      margin-top: 4px;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
    }
    .amount {
      font-size: 16px;
      line-height: 1.25;
      font-weight: 790;
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
      color: var(--category-c);
    }
    .pill {
      min-height: 28px;
      padding: 4px 10px;
      background: var(--surface-soft);
      color: var(--muted);
      font-size: 14px;
    }
    .progress {
      height: 8px;
      margin-top: 9px;
      background: color-mix(in srgb, var(--muted) 16%, transparent);
    }
    .progress-fill {
      background: var(--accent);
    }
    .controls {
      grid-template-columns: minmax(0, 1.2fr) repeat(3, minmax(130px, .6fr));
      gap: 9px;
      margin: 11px 0 14px;
    }
    .field-wrap {
      display: grid;
      gap: 5px;
      min-width: 0;
    }
    .field-label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }
    .search-wrap {
      position: relative;
    }
    .search-wrap .field {
      padding-right: 42px;
    }
    .clear-search {
      position: absolute;
      right: 5px;
      bottom: 5px;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: transparent;
      color: var(--muted);
      font-size: 20px;
    }
    .field {
      min-height: 44px;
      border-radius: 8px;
      background: var(--surface);
      border: 1px solid var(--line);
      color: var(--text);
      padding: 10px 11px;
    }
    .field:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    }
    .empty,
    .error {
      min-height: 112px;
      color: var(--muted);
      border: 1px dashed color-mix(in srgb, var(--muted) 32%, transparent);
      background: var(--surface);
      font-size: 15px;
      line-height: 1.4;
    }
    .error {
      color: var(--expense);
    }
    .skeleton {
      min-height: 86px;
      border-radius: 8px;
      background: linear-gradient(90deg, color-mix(in srgb, var(--surface-soft) 82%, transparent), var(--surface), color-mix(in srgb, var(--surface-soft) 82%, transparent));
    }
    .day-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
      gap: 8px;
    }
    .day-card {
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface-soft);
    }
    .day-date {
      color: var(--muted);
      font-size: 14px;
      font-weight: 720;
    }
    .day-amount {
      margin-top: 7px;
      color: var(--expense);
      font-size: 20px;
      font-weight: 790;
    }
    .day-income {
      margin-top: 2px;
      color: var(--income);
      font-size: 14px;
      font-weight: 720;
    }
    .chart-readout {
      margin-top: 8px;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
    }
    .category-row .title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .swatch {
      width: 10px;
      height: 10px;
      flex: 0 0 auto;
      border-radius: 999px;
      background: var(--accent);
    }
    .debt-section {
      display: grid;
      gap: 4px;
      padding: 4px 0 12px;
      border-top: 1px solid var(--line);
    }
    .debt-section:first-child {
      border-top: 0;
      padding-top: 0;
    }
    .debt-heading {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 14px;
      font-weight: 760;
    }
    .sheet-backdrop {
      background: rgba(0,0,0,.42);
      backdrop-filter: blur(8px);
    }
    .sheet {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--line);
      box-shadow: 0 -18px 56px rgba(0,0,0,.22);
    }
    .detail {
      background: var(--surface-soft);
    }
    .actions {
      background: var(--surface);
    }
    .primary,
    .danger {
      min-height: 46px;
      border-radius: 8px;
    }
    .primary {
      background: var(--accent);
      color: var(--accent-text);
    }
    .danger {
      background: color-mix(in srgb, var(--expense) 13%, var(--surface));
      color: var(--expense);
    }
    @media (max-width: 820px) {
      .hero,
      .dashboard {
        grid-template-columns: 1fr;
      }
      .wide {
        grid-column: span 1;
      }
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .controls {
        grid-template-columns: 1fr 1fr;
      }
      .search-wrap {
        grid-column: span 2;
      }
    }
    @media (max-width: 520px) {
      .app {
        padding:
          max(8px, env(safe-area-inset-top))
          max(9px, env(safe-area-inset-right))
          max(24px, calc(env(safe-area-inset-bottom) + 16px))
          max(9px, env(safe-area-inset-left));
      }
      .brand-title {
        font-size: 19px;
      }
      .segments button,
      .tabs button {
        min-height: 42px;
        padding: 7px 4px;
        font-size: 14px;
      }
      .hero-main,
      .hero-side,
      .panel {
        padding: 14px;
      }
      h1 {
        font-size: 36px;
      }
      h2 {
        font-size: 20px;
      }
      .side-value {
        font-size: 25px;
      }
      .grid {
        gap: 8px;
      }
      .row {
        grid-template-columns: minmax(0, 1fr) auto;
      }
      .controls {
        grid-template-columns: 1fr;
      }
      .search-wrap {
        grid-column: span 1;
      }
      .details {
        grid-template-columns: 1fr;
      }
      .detail.full {
        grid-column: span 1;
      }
      .actions {
        grid-template-columns: 1fr;
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
  </style>
</head>
<body>
  <main class="app">
    <section class="top">
      <div class="brand-row">
        <div class="brand">
          <div class="mark" aria-hidden="true">R</div>
          <div class="brand-meta">
            <div class="brand-title">ResidualMap</div>
            <div class="brand-sub" id="profile">Загрузка данных...</div>
            <div class="sync-status" id="syncStatus">Подготовка панели</div>
          </div>
        </div>
        <button class="icon-btn" id="refresh" title="Обновить" aria-label="Обновить данные">↻</button>
      </div>
      <nav class="segments" id="periods" aria-label="Период аналитики">
        <button data-period="today" aria-pressed="false">Сегодня</button>
        <button data-period="week" aria-pressed="false">Неделя</button>
        <button data-period="last_30_days" aria-pressed="false">30 дн.</button>
        <button data-period="month" class="active" aria-pressed="true">Месяц</button>
      </nav>
      <nav class="tabs" id="tabs" role="tablist" aria-label="Разделы панели">
        <button data-tab="overview" class="active" role="tab" aria-selected="true" aria-controls="view-overview">Обзор</button>
        <button data-tab="records" role="tab" aria-selected="false" aria-controls="view-records">Записи</button>
        <button data-tab="debts" role="tab" aria-selected="false" aria-controls="view-debts">Долги</button>
      </nav>
    </section>

    <section class="view active" id="view-overview" role="tabpanel">
      <section class="hero">
        <div class="hero-main card">
          <div class="eyebrow" id="periodName">Месяц</div>
          <h1 id="heroSpend">0 ₸</h1>
          <div class="hint" id="heroMeta">Расходы за выбранный период</div>
          <div class="insight" id="insightText">Собираю главную финансовую картину.</div>
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

    <section class="view" id="view-records" role="tabpanel">
      <section class="panel card">
        <div class="panel-head">
          <div><h2>Записи</h2><div class="caption">Поиск, проверка и безопасные действия</div></div>
          <span class="pill" id="recordCount">0</span>
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
            <span class="field-label">Тип</span>
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
          </label>
          <label class="field-wrap">
            <span class="field-label">Категория</span>
            <select class="field" id="categoryFilter">
              <option value="">Все категории</option>
            </select>
          </label>
        </div>
        <div class="list" id="records"></div>
      </section>
    </section>

    <section class="view" id="view-debts" role="tabpanel">
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
        <button class="icon-btn" id="closeSheet" title="Закрыть" aria-label="Закрыть детали">×</button>
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
    const colors = ["var(--category-a)", "var(--category-b)", "var(--category-c)", "var(--category-d)", "var(--accent)"];
    const state = {
      period: "month",
      tab: "overview",
      data: null,
      records: [],
      categories: [],
      selected: null,
      searchTimer: null,
      resizeTimer: null,
      lastFocus: null,
      backHandler: null
    };

    setupTelegramShell();

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
    document.getElementById("clearSearch").addEventListener("click", function() {
      const input = document.getElementById("recordSearch");
      input.value = "";
      input.focus();
      loadRecords();
    });
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
    document.getElementById("records").addEventListener("keydown", function(event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      const row = event.target.closest("[data-id]");
      if (!row) return;
      event.preventDefault();
      const item = state.records.find(function(record) { return String(record.id) === row.dataset.id; });
      if (item) openSheet(item);
    });
    document.getElementById("closeSheet").addEventListener("click", closeSheet);
    document.getElementById("sheetCloseAction").addEventListener("click", closeSheet);
    document.getElementById("sheetBackdrop").addEventListener("click", function(event) {
      if (event.target.id === "sheetBackdrop") closeSheet();
    });
    document.getElementById("sheetBackdrop").addEventListener("keydown", handleSheetKeydown);
    document.getElementById("sheetAction").addEventListener("click", runSheetAction);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", scheduleChartRerender);

    function setActive(selector, active) {
      for (const item of document.querySelectorAll(selector)) {
        const isActive = item === active;
        item.classList.toggle("active", isActive);
        if (item.hasAttribute("aria-pressed")) item.setAttribute("aria-pressed", String(isActive));
        if (item.getAttribute("role") === "tab") item.setAttribute("aria-selected", String(isActive));
      }
    }

    function setupTelegramShell() {
      applyTelegramTheme();
      handleScroll();
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

    function handleScroll() {
      document.body.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    function scheduleChartRerender() {
      clearTimeout(state.resizeTimer);
      state.resizeTimer = setTimeout(function() {
        if (state.data && state.tab === "overview") renderDailyChart(state.data.summary);
      }, 120);
    }

    function setLoadingState(isLoading, message) {
      const button = document.getElementById("refresh");
      const status = document.getElementById("syncStatus");
      button.disabled = isLoading;
      button.classList.toggle("loading", isLoading);
      status.textContent = message || (isLoading ? "Обновление..." : "Данные актуальны");
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
        setLoadingState(false, "Обновлено только что");
      } catch (error) {
        setLoadingState(false, "Не удалось обновить");
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
      const familyHelp = selectedKzt(summary.family_help || []);
      const familyHelpMinor = Number(familyHelp.amount_minor || 0);
      const periodDays = dayCount(summary.period.start, summary.period.end);
      const series = buildDailySeries(summary);
      const activeDays = series.filter(function(item) { return item.expense_minor > 0; }).length;
      const topCategory = firstKzt(summary.category_totals || []);
      const topCategoryPct = topCategory && expense ? Math.round(Number(topCategory.amount_minor || 0) / expense * 100) : 0;
      document.getElementById("profile").textContent = "KZT · " + (data.user.timezone || "Asia/Qyzylorda");
      document.getElementById("periodName").textContent = summary.period.label;
      document.getElementById("heroSpend").textContent = money(expense);
      document.getElementById("heroMeta").textContent = "Личные расходы · " + formatRange(summary.period.start, summary.period.end) + " · " + plural(summary.transaction_count || 0, "запись", "записи", "записей");
      document.getElementById("netFlow").textContent = signedMoney(net);
      document.getElementById("sideNote").textContent = loanOut > 0
        ? "Дано в долг: " + money(loanOut)
        : "Доходы минус личные расходы. Долги и помощь семье показаны отдельно.";
      document.getElementById("insightText").textContent = insightText(expense, income, topCategory, topCategoryPct, activeDays, periodDays);
      document.getElementById("rangeLabel").textContent = formatRange(summary.period.start, summary.period.end);
      document.getElementById("metrics").innerHTML = [
        metric("Доходы", money(income), "поступления", "income"),
        metric("Чистый поток", signedMoney(net), "доходы минус расходы", net >= 0 ? "income" : "expense"),
        metric("Топ категория", topCategory ? topCategory.category : "Пока нет", topCategory ? topCategoryPct + "% · " + money(topCategory.amount_minor) : "нет расходов"),
        metric("Дней с расходами", activeDays + " из " + periodDays, familyHelpMinor > 0 ? "помощь семье: " + money(familyHelpMinor) : "активные дни периода")
      ].join("");

      renderDailyChart(summary);
      renderCategoryTotals(summary.category_totals || []);
      renderCategories(summary.categories || []);
      renderLargest(summary.largest_expenses || []);
      renderFamilyHelp(summary.family_help || [], summary.family_help_counterparties || []);
      renderDebts(data.debts || [], "debtsFull", 50);
    }

    function insightText(expense, income, topCategory, topCategoryPct, activeDays, periodDays) {
      if (expense > 0 && topCategory) {
        return "Основная категория: " + topCategory.category + ", " + topCategoryPct + "% расходов. Дней с расходами: " + activeDays + " из " + periodDays + ".";
      }
      if (income > 0) return "Личных расходов пока нет; доходы уже учтены в чистом потоке.";
      return "За этот период пока нет личных расходов. Добавьте запись в чате, и здесь появится аналитика.";
    }

    function metric(label, value, hint, tone) {
      return "<article class='metric card'><div class='label'>" + escapeHtml(label) + "</div><div class='value" + (tone ? " " + escapeAttr(tone) : "") + "'>" + escapeHtml(value) + "</div><div class='hint'>" + escapeHtml(hint || "") + "</div></article>";
    }

    function showOverviewSkeletons() {
      document.getElementById("insightText").textContent = "Обновляю финансовую картину...";
      document.getElementById("metrics").innerHTML = "<div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div><div class='skeleton'></div>";
      document.getElementById("dailyChart").innerHTML = "<div class='skeleton'></div>";
      document.getElementById("categoryTotals").innerHTML = "<div class='skeleton'></div>";
      document.getElementById("categories").innerHTML = "<div class='skeleton'></div>";
      document.getElementById("largest").innerHTML = "<div class='skeleton'></div>";
      document.getElementById("familyHelpPanel").hidden = true;
      document.getElementById("familyHelp").innerHTML = "<div class='skeleton'></div>";
    }

    function renderDailyChart(summary) {
      const root = document.getElementById("dailyChart");
      const series = buildDailySeries(summary);
      const hasValues = series.some(function(item) { return item.expense_minor > 0 || item.income_minor > 0; });
      if (!hasValues) {
        root.innerHTML = "<div class='empty'>За этот период пока нет личных расходов или доходов. Добавьте запись в чате, и график появится здесь.</div>";
        return;
      }
      if (series.length <= 3) {
        root.innerHTML = "<div class='day-cards'>" + series.map(function(item) {
          return "<article class='day-card'><div class='day-date'>" + escapeHtml(formatDate(item.date)) + "</div><div class='day-amount'>" + escapeHtml(money(item.expense_minor)) + "</div><div class='day-income'>" + escapeHtml(item.income_minor > 0 ? money(item.income_minor) + " доход" : "доходов нет") + "</div></article>";
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
        bars += "<rect x='" + (x - barW / 2).toFixed(2) + "' y='" + barY.toFixed(2) + "' width='" + barW.toFixed(2) + "' height='" + barHeight.toFixed(2) + "' rx='4' fill='var(--expense)'></rect>";
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
      const root = document.getElementById("categoryTotals");
      const totalEl = document.getElementById("donutTotal");
      const filtered = kztItems(items).filter(function(item) { return Number(item.amount_minor || 0) > 0; });
      const total = filtered.reduce(function(sum, item) { return sum + Number(item.amount_minor || 0); }, 0);
      totalEl.textContent = money(total);
      if (!filtered.length) {
        root.innerHTML = "<div class='empty'>Категории появятся после первой личной траты в выбранном периоде.</div>";
        return;
      }
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
      const root = document.getElementById("categories");
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
        root.appendChild(row("Помощь семье", plural(total.count || 0, "запись", "записи", "записей"), money(totalMinor), "support"));
        return;
      }
      for (const item of filtered) {
        root.appendChild(row(item.counterparty || "Без имени", plural(item.count || 0, "запись", "записи", "записей"), money(item.amount_minor), "support"));
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
      const receivable = filtered.filter(function(item) { return Number(item.receivable_minor) > 0; });
      const payable = filtered.filter(function(item) { return Number(item.payable_minor) > 0; });
      appendDebtSection(root, "Мне должны", receivable, "receivable_minor", "должен вам", maxItems);
      appendDebtSection(root, "Я должен", payable, "payable_minor", "вы должны", maxItems);
    }

    function appendDebtSection(root, title, items, field, meta, maxItems) {
      if (!items.length) return;
      const section = document.createElement("section");
      section.className = "debt-section";
      const heading = document.createElement("div");
      heading.className = "debt-heading";
      heading.textContent = title;
      section.appendChild(heading);
      for (const item of items.slice(0, maxItems || 50)) {
        section.appendChild(row(item.counterparty || "Без имени", meta, money(item[field]), "debt"));
      }
      root.appendChild(section);
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
        element.tabIndex = 0;
        element.setAttribute("role", "button");
        element.setAttribute("aria-label", "Открыть детали записи " + item.id);
        root.appendChild(element);
      }
    }

    function openSheet(item) {
      state.selected = item;
      state.lastFocus = document.activeElement;
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
      if (tg && tg.BackButton) {
        state.backHandler = closeSheet;
        if (typeof tg.BackButton.onClick === "function") tg.BackButton.onClick(state.backHandler);
        if (typeof tg.BackButton.show === "function") tg.BackButton.show();
      }
      setTimeout(function() { document.getElementById("closeSheet").focus(); }, 0);
    }

    function closeSheet() {
      document.getElementById("sheetBackdrop").classList.remove("open");
      if (tg && tg.BackButton && state.backHandler) {
        if (typeof tg.BackButton.offClick === "function") tg.BackButton.offClick(state.backHandler);
        if (typeof tg.BackButton.hide === "function") tg.BackButton.hide();
        state.backHandler = null;
      }
      state.selected = null;
      if (state.lastFocus && typeof state.lastFocus.focus === "function") {
        state.lastFocus.focus();
      }
      state.lastFocus = null;
    }

    function handleSheetKeydown(event) {
      if (!document.getElementById("sheetBackdrop").classList.contains("open")) return;
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

    function categoryRow(title, pct, meta, amount, color) {
      const element = rowWithProgress(title, pct + "% · " + meta, amount, pct, color, "expense");
      element.classList.add("category-row");
      const titleEl = element.querySelector(".title");
      titleEl.innerHTML = "<i class='swatch' aria-hidden='true'></i><span></span>";
      titleEl.querySelector(".swatch").style.background = color;
      titleEl.querySelector("span").textContent = title || "";
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
      document.getElementById("syncStatus").textContent = "Нужен запуск из Telegram";
      document.getElementById("heroSpend").textContent = "Нет данных";
      document.getElementById("heroMeta").textContent = message;
      document.getElementById("insightText").textContent = "Откройте Mini App из Telegram, чтобы увидеть личную аналитику.";
      document.getElementById("metrics").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("dailyChart").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("categoryTotals").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("categories").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
      document.getElementById("largest").innerHTML = "<div class='error'>" + escapeHtml(message) + "</div>";
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

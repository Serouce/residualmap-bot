# Premium Mini App Pass

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. The global plan rules are in `C:\Users\GIS\.codex\PLANS.md`; this file follows those rules.

## Purpose / Big Picture

This change raises the Telegram Mini App from a functional MVP look to a calmer, more premium personal-finance control panel. After the work, the first screen should immediately answer three questions: how money moved in the selected period, what requires review now, and where to inspect the evidence. The import screen should feel like a bank-style review workflow for PDF statements rather than a technical card dump.

The pass is frontend-only. It uses existing data from `POST /api/app-data`, `POST /api/imports`, and `POST /api/import-action`. It does not add D1 migrations, new API routes, item-level PDF editing, or a full review inbox.

## Progress

- [x] (2026-07-03 11:54Z) Confirmed `main` is clean and read the global ExecPlan rules.
- [x] (2026-07-03 11:56Z) Restored prior Mini App UX memory and confirmed the existing `Нужно проверить` plus `MainButton` direction remains in scope.
- [x] (2026-07-03 12:00Z) Audited current Mini App structure and styles for the premium pass.
- [x] (2026-07-03 12:18Z) Implemented the command-center Overview order and visual system token pass.
- [x] (2026-07-03 12:24Z) Reworked import cards into a review-flow presentation while preserving existing `/api/import-action`.
- [x] (2026-07-03 12:54Z) Ran syntax checks, inline Mini App validation, full tests, `git diff --check`, `npm.cmd run check:application`, and reviewed the diff for secrets.
- [x] (2026-07-03 12:57Z) Attempted visual QA with local preview and Chrome headless; recorded environment limits below.

## Surprises & Discoveries

- Observation: The current Mini App already has strong functional pieces, but many surfaces have the same visual weight.
  Evidence: `src/mini-app-styles.js` applies similar borders, shadows, gradients, and radius to `.panel`, `.hero-card`, `.metric-card`, `.record-card`, `.import-card`, `.overview-dock`, and `.review-queue`.
- Observation: The next premium pass can stay frontend-only.
  Evidence: `src/mini-app.js` already contains Overview, Import, Records, and Debts sections; `src/mini-app-client.js` already renders import summaries, review queue items, category rows, charts, records, and the Telegram `MainButton`.
- Observation: The review queue was visually more useful when moved above the dock and metrics.
  Evidence: `src/mini-app.js` now places `#importAttention` immediately after the hero finance summary, before `overview-dock` and `metric-grid`.
- Observation: In-app browser automation remained unstable for this local preview, but static HTTP and Chrome headless worked.
  Evidence: the in-app browser session timed out while opening `http://127.0.0.1:9798/`; `curl.exe -I --max-time 5 http://127.0.0.1:9798/` returned HTTP 200, and Chrome headless wrote screenshots under `%TEMP%`.
- Observation: Chrome headless mobile screenshots displayed a wider layout crop for the top segmented controls, so the CSS now defensively prevents horizontal overflow in nav controls.
  Evidence: `src/mini-app-styles.js` adds `min-width: 0`, `width: 100%`, ellipsis, and `overflow-x: hidden` safeguards for the page and segmented controls.

## Decision Log

- Decision: Keep the pass operational and finance-focused, not decorative.
  Rationale: The user wants a premium feel, but this Mini App is a repeated-use finance tool. The improvement should come from hierarchy, precise typography, clearer states, and safer review flows rather than marketing hero sections, blobs, or ornamental graphics.
  Date/Author: 2026-07-03 / Codex
- Decision: Do not add new backend surfaces in this pass.
  Rationale: The earlier UX decision explicitly scoped the first review queue to existing data. A visual premium pass can improve the current experience without new database risk.
  Date/Author: 2026-07-03 / Codex

## Outcomes & Retrospective

Implementation is complete for this pass. `Обзор` now puts `Нужно проверить` directly after the finance summary and lowers the visual weight of secondary dock/metric cards. `Импорт` now presents each draft as a review workflow with `Черновик`, `Проверка`, and `Запись` stages plus clearer semantic fact lanes. Automated checks passed; visual QA was limited by the local browser behavior recorded above.

## Context and Orientation

The project is a Cloudflare Worker Telegram bot and Mini App. `src/worker.js` serves `/app` and the Mini App APIs. `src/mini-app.js` defines the static HTML shell. `src/mini-app-client.js` fills the shell with data and handles tabs, imports, records, review queue, and Telegram Web App APIs. `src/mini-app-styles.js` contains the CSS tokens and component styling.

The Mini App currently has four tabs: `Обзор`, `Записи`, `Импорт`, and `Долги`. `Обзор` begins with a large hero grid, then dock items, metrics, a `Нужно проверить` queue, charts, categories, details, and largest expenses. `Импорт` shows filter buttons and import cards with facts, notices, row previews, and confirm/cancel actions. Telegram `MainButton` already mirrors the active import confirm action.

## Plan of Work

First, update `src/mini-app.js` so the Overview hierarchy matches a command center: financial totals, then `Нужно проверить`, then operational dock and secondary analytics. Keep IDs unchanged where client code depends on them.

Second, update `src/mini-app-client.js` only where markup from render helpers needs richer semantic structure. The main target is `importCard()` and related helper output, so a PDF draft reads as a review workflow: file identity, period, risk lanes, totals, preview, and actions.

Third, update `src/mini-app-styles.js` with a premium token pass. Add clearer background and surface levels, calmer semantic colors, stronger numeric typography, restrained borders, and separate dark theme tuning. Reduce repeated card heaviness and make only active review/action blocks feel raised.

Fourth, validate the app. Run the existing syntax and test commands. If local Wrangler or browser QA fails due environment constraints, record the exact failure in this plan and still validate the published `/app` HTML where possible.

## Concrete Steps

Work from `C:\Users\GIS\Documents\Codex\2026-04-30\1-codex-2-codex-3-codex\residualmap-bot`.

Inspect status:

    git status --short --branch

Validate after edits:

    node --check src/worker.js
    node --check src/mini-app.js
    node --check src/mini-app-client.js
    node --check src/mini-app-styles.js
    node -e "Promise.all([import('./src/mini-app-client.js'), import('./src/mini-app.js')]).then(([client, app]) => { new Function(client.miniAppClientScript); const html = app.miniAppHtml(); for (const id of ['importAttention','view-import','importsCanvas','metrics']) { if (!html.includes(id)) throw new Error('missing ' + id); } console.log('mini app premium pass syntax ok'); })"
    npm.cmd run check
    git diff --check
    npm.cmd run check:application

Review for secrets and unrelated edits before handoff:

    git diff --stat
    git diff -- src/mini-app.js src/mini-app-client.js src/mini-app-styles.js docs/execplans/premium-mini-app-pass.md

## Validation and Acceptance

Automated acceptance requires all syntax checks and `npm.cmd run check` to pass. `git diff --check` must pass. The inline Mini App validation must print `mini app premium pass syntax ok`.

Human acceptance is: on `Обзор`, the first screen reads as a command center with a clear money summary and a visible `Нужно проверить` block before secondary analytics. On `Импорт`, a PDF draft reads as a review task with clear risk lanes and totals before row previews. At 360px width, long merchant names, buttons, facts, and badges must wrap without overlap. In dark theme, background, surfaces, borders, muted text, and semantic colors remain legible.

## Idempotence and Recovery

The pass is safe to retry because it does not mutate data, schema, or external services. If a visual change causes a layout regression, revert the relevant CSS block or the small markup change while keeping the existing backend routes unchanged. The existing card confirm/cancel flow and Telegram `MainButton` should remain available throughout.

## Artifacts and Notes

This plan builds on the already implemented `Нужно проверить Lite` and Telegram `MainButton` slice from `docs/execplans/review-lite-mainbutton.md`. The new pass deliberately improves the visual and interaction quality of those existing pieces instead of expanding their backend scope.

## Interfaces and Dependencies

Do not add npm dependencies. Use vanilla HTML, CSS, and the existing Mini App client script. Preserve IDs used by `src/mini-app-client.js`: `appShell`, `periods`, `tabs`, `heroSpend`, `periodName`, `heroMeta`, `netFlow`, `flowState`, `sideNote`, `importAttention`, `metrics`, `dailyChart`, `categoryTotals`, `categories`, `largest`, `importsCanvas`, and related record/import controls. Preserve Telegram Mini App integration by leaving `window.Telegram.WebApp` feature checks in the client.

Revision note, 2026-07-03: Created for the user-requested premium design pass after three design subagents agreed that the UI needs stronger hierarchy, calmer finance-grade styling, and import review-flow polish rather than decorative effects.

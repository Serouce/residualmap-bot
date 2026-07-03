# Mini App UI/UX Polish

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. The global plan rules are in `C:\Users\GIS\.codex\PLANS.md`; this file follows those rules.

## Purpose / Big Picture

This work improves the ResidualMap Telegram Mini App so the new PDF import workflow feels like a normal part of the finance product rather than an added screen. After this change, a user should open the Mini App on a phone, quickly see whether any PDF import drafts need attention, review draft and historical imports without confusion, and continue using overview, records, and debts without layout breakage. The observable result is a denser, calmer, mobile-first UI that still uses Telegram theme colors, safe areas, accessible tabs, and deterministic data from the Worker API.

## Progress

- [x] (2026-07-02 13:45Z) Started two read-only subagents: one for user-flow UX audit and one for visual/accessibility audit.
- [x] (2026-07-02 13:46Z) Started one UI worker with ownership limited to `src/mini-app.js`, `src/mini-app-client.js`, and `src/mini-app-styles.js`.
- [x] (2026-07-02 13:47Z) Read `AGENTS.md` and `C:\Users\GIS\.codex\PLANS.md`; confirmed this work needs a living ExecPlan.
- [x] (2026-07-02 13:57Z) Received the read-only UX audit and forwarded frontend-only findings to the UI worker.
- [x] (2026-07-02 14:00Z) Received the visual/accessibility audit and forwarded target-size, tabs, dialog, and live-region findings to the UI worker.
- [x] (2026-07-02 14:27Z) Integrated the UI worker changes and added final CSS/HTML refinements for 44px targets and live-region accessibility.
- [x] (2026-07-03 05:10Z) Ran Mini App syntax checks, inline script validation, full project checks, `git diff --check`, and `check:application`.
- [x] (2026-07-03 05:20Z) Received final reviewer findings; fixed sheet focus-before-inert ordering and added a route test for the Telegram `web_app` import panel button.
- [ ] Run a final review pass for secrets, unrelated edits, mobile layout risks, and deploy impact, then commit and push.

## Surprises & Discoveries

- Observation: The local GitHub and Cloudflare deployment path is now functional through GitHub Actions, but local Wrangler still lacks a Cloudflare token.
  Evidence: the previous deploy succeeded only after updating the GitHub `CLOUDFLARE_API_TOKEN` secret and rerunning GitHub Actions; local `npm.cmd run db:migrate` had failed without `CLOUDFLARE_API_TOKEN`.
- Observation: Browser QA may be constrained by the Codex browser security policy for localhost-style mock servers.
  Evidence: the previous attempt to open a local mock Mini App at `127.0.0.1` was blocked by browser policy, so visual verification may require either a deployed Worker URL or a permitted browser target.
- Observation: The PDF summary button currently opens the panel as a normal URL instead of as a Telegram Mini App.
  Evidence: the UX audit found `buildImportDraftKeyboard` uses `url: env.MINI_APP_URL`; the Mini App client requires Telegram `initData`, so a normal browser open can show an access error.
- Observation: The import view lacks context-preserving navigation from a PDF draft.
  Evidence: the UX audit found the client always starts at `overview` and does not parse `tab=import` or `batch=<id>` from the Mini App URL.
- Observation: Several interactive targets can shrink below 44px on mobile.
  Evidence: the visual/accessibility audit found mobile CSS overrides that set tab-like buttons and icon buttons to 40px, `.clear-search` to 34px, and `.sort-button` to 28px.
- Observation: The bottom sheet has visual modal behavior but incomplete assistive-technology semantics.
  Evidence: the visual/accessibility audit found `role="dialog"` and focus trapping, but no `aria-labelledby`, no `aria-describedby`, and no `inert` or `aria-hidden` on the background app shell.
- Observation: Browser QA could not be completed safely in this session.
  Evidence: `npx.cmd --yes --package @playwright/cli playwright-cli --help` timed out under the restricted sandbox, and the escalated retry was rejected by auto-review because it would download and execute third-party npm code for optional visual QA.
- Observation: Final reviewer found no critical security or Telegram auth issues, but did find one accessibility bug in sheet focus ordering and one cheap test gap.
  Evidence: `openSheet()` set `inert` on the app shell before moving focus into the sheet; `test/worker.test.js` did not assert the new Telegram `web_app` button. Both were addressed before the final check run.

## Decision Log

- Decision: Use two read-only explorer agents, one UI-writing worker, and one final reviewer instead of multiple concurrent UI writers.
  Rationale: The Mini App files are tightly coupled; concurrent edits to `src/mini-app-client.js` and `src/mini-app-styles.js` would create unnecessary conflicts, while read-only audits can still run in parallel.
  Date/Author: 2026-07-02 / Codex
- Decision: Do not start a backend worker unless audit findings prove the Mini App lacks API data.
  Rationale: The existing import endpoints already expose draft counts, totals, status, warnings, and preview rows, so UI polish should stay focused on the frontend until a concrete API gap appears.
  Date/Author: 2026-07-02 / Codex
- Decision: Make one narrow backend touch in the main agent for Telegram-native opening of the Mini App.
  Rationale: This is not an API data gap, but it is a P0 UX issue: Telegram inline buttons must use `web_app` to open the Mini App with valid Telegram context.
  Date/Author: 2026-07-02 / Codex
- Decision: Keep the UI implementation vanilla JavaScript and CSS.
  Rationale: The project currently renders the Mini App from Worker modules without a frontend framework, and the requested polish does not justify adding dependencies.
  Date/Author: 2026-07-02 / Codex

## Outcomes & Retrospective

The UI polish is implemented and passed final automated validation. The current uncommitted change touches `src/worker.js`, `src/mini-app.js`, `src/mini-app-client.js`, `src/mini-app-styles.js`, `test/worker.test.js`, and this ExecPlan. Automated checks passed: `node --check src/worker.js`, `node --check src/mini-app.js`, `node --check src/mini-app-client.js`, `node --check src/mini-app-styles.js`, the inline Mini App client syntax check, `npm.cmd run check` with 58 passing tests, `git diff --check`, and `npm.cmd run check:application`. Visual/browser QA was not run because acquiring Playwright CLI would require unsandboxed third-party npm execution; this limitation is recorded rather than bypassed.

## Context and Orientation

The repository is a Cloudflare Worker project. `src/worker.js` serves the Telegram webhook, Mini App HTML route `/app`, and authenticated Mini App JSON APIs. The Mini App frontend is split into `src/mini-app.js` for HTML structure, `src/mini-app-client.js` for browser behavior, and `src/mini-app-styles.js` for CSS. The new PDF import workflow already exists in the backend through `POST /api/imports` and `POST /api/import-action`. An import draft is a parsed PDF statement saved in D1 tables before the user confirms inserting rows into the main `transactions` table.

The current Mini App has four top-level tabs: `Обзор`, `Записи`, `Импорт`, and `Долги`. The UI must remain mobile-first for Telegram, meaning it should respect Telegram theme variables, use safe-area padding for phones with notches or gesture bars, keep important controls at least 44px tall, support reduced motion, and avoid text overlap on narrow screens.

## Plan of Work

First, collect the read-only UX and visual/accessibility findings. Treat these findings as input for the final polish, but do not let multiple agents edit the same frontend files at the same time.

Next, integrate the UI worker patch. Review changes in `src/mini-app.js`, `src/mini-app-client.js`, and `src/mini-app-styles.js` for consistency with the existing API contract. Keep the `Импорт` tab states clear: empty state explains sending a PDF to the bot; draft state highlights importable rows, duplicates, skipped rows, totals, and warnings; history state should not look like an error just because it has no preview rows.

Then, run syntax and behavioral checks. At minimum run `node --check` on the Worker and all Mini App modules, run the inline Mini App client syntax check with `new Function(miniAppClientScript)`, run `npm.cmd run check`, and run `git diff --check`. If browser access is allowed, verify `/app` or a safe mock at mobile and desktop widths, including dark theme and long import data. If browser access is blocked, record that limitation explicitly and rely on static checks plus code review.

Finally, run a reviewer agent against the integrated diff. Address any concrete defects, then commit and push. Because deployment is handled by the GitHub Actions deploy workflow on `main`, pushing to `main` should run checks, apply any pending D1 migrations, and deploy the Worker. This UI polish should not require a new migration.

## Concrete Steps

Work from `C:\Users\GIS\Documents\Codex\2026-04-30\1-codex-2-codex-3-codex\residualmap-bot`.

Inspect the final diff:

    git status --short --branch
    git diff --stat
    git diff -- src/mini-app.js src/mini-app-client.js src/mini-app-styles.js

Run syntax checks:

    node --check src/worker.js
    node --check src/mini-app.js
    node --check src/mini-app-client.js
    node --check src/mini-app-styles.js

Run the inline Mini App client check:

    node -e "Promise.all([import('./src/mini-app-client.js'), import('./src/mini-app.js')]).then(([client, app]) => { new Function(client.miniAppClientScript); const html = app.miniAppHtml(); for (const id of ['overview-tab','records-tab','import-tab','debts-tab','view-import','importsCanvas','refreshImports','importAttention']) { if (!html.includes(id)) throw new Error('missing ' + id); } console.log('mini app inline client syntax ok'); })"

Run full checks:

    npm.cmd run check
    git diff --check

Commit after review:

    git add src/mini-app.js src/mini-app-client.js src/mini-app-styles.js docs/execplans/mini-app-ux-polish.md
    git commit -m "feat: polish mini app import ux"
    git push origin main

## Validation and Acceptance

Automated acceptance requires `npm.cmd run check` to pass with all existing tests, and the inline Mini App client syntax check to print `mini app inline client syntax ok`. The Worker syntax check must still pass because the Worker imports and serves the Mini App modules.

Human acceptance requires the Mini App to open with four compact tabs. In `Обзор`, an import attention strip should appear only when draft imports exist. In `Импорт`, an empty account should show a clear instruction to send a PDF to the bot. A draft import should show file name, period, row counts, importable rows, duplicates, skipped rows, expense and income totals, warning or truncation messages when present, and clear confirm/cancel buttons. A confirmed or cancelled historical batch should read as history, not as an error. Long file names, merchants, categories, and KZT sums must wrap or compress without overlapping adjacent controls on 320px-wide screens.

## Idempotence and Recovery

Frontend changes are safe to retry because they do not mutate D1 data or external services. If a UI change breaks the Mini App, revert only the specific frontend patch made in this work, not unrelated commits. If GitHub Actions deploy fails after pushing this frontend-only change, inspect the failed step before rerunning; the known deployment path requires valid GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Artifacts and Notes

The previous deployment run for backdated entries and PDF import succeeded after rerunning GitHub Actions. The successful run applied D1 migration `0004_statement_import_drafts.sql` and deployed the Worker. This UI polish should not change the database schema.

## Interfaces and Dependencies

Use only existing modules and browser APIs. Do not add npm dependencies. Preserve the Mini App API contract:

    POST /api/app-data returns summary, debts, and imports_summary.
    POST /api/imports returns import batches with counts, totals, warnings, and preview items.
    POST /api/import-action accepts batch_id and action confirm or cancel.

The frontend must continue to send Telegram `initData` with API requests through the existing `api()` helper in `src/mini-app-client.js`. All user-controlled display text that is rendered with `innerHTML` must continue to use `escapeHtml()` or be assigned through `textContent`.

Revision note, 2026-07-02: This plan was created to coordinate parallel UX audit, one frontend worker, and final review for Mini App UI polish after successful deployment of the PDF import backend.

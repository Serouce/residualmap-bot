# Review Lite And Telegram MainButton

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. The global plan rules are in `C:\Users\GIS\.codex\PLANS.md`; this file follows those rules.

## Purpose / Big Picture

This change makes the Mini App feel like a working queue for decisions, not only an analytics dashboard. After it is implemented, a user who opens `Обзор` will see a compact `Нужно проверить` block when a PDF import draft or open debts need attention. When the user opens `Импорт` with a draft that can be imported, Telegram's native bottom `MainButton` will say `Импортировать N строк` and will trigger the same safe confirmation flow as the existing card button.

The first iteration deliberately stays narrow. It uses existing data from `POST /api/app-data` and `POST /api/imports`, existing import confirmation through `POST /api/import-action`, and existing Telegram Mini App APIs. There is no new D1 migration, no item-level PDF row editor, and no new `/api/review-queue` endpoint.

## Progress

- [x] (2026-07-03 09:05Z) Restored the arbitrated UX decision from memory and confirmed the worktree is clean on `main`.
- [x] (2026-07-03 09:06Z) Read `C:\Users\GIS\.codex\PLANS.md` and created this ExecPlan for the new iteration.
- [x] (2026-07-03 09:17Z) Implemented `Нужно проверить Lite` on `Обзор` using existing import summary and debt data.
- [x] (2026-07-03 09:19Z) Implemented Telegram `MainButton` synchronization for active PDF drafts on the `Импорт` tab.
- [x] (2026-07-03 11:11Z) Ran syntax checks, inline Mini App script validation, full project tests, `git diff --check`, `npm.cmd run check:application`, and reviewed the diff for secrets.
- [x] (2026-07-03 11:32Z) Created a local feature commit for the Mini App UX change.
- [ ] Push and confirm GitHub Actions CI/deploy.

## Surprises & Discoveries

- Observation: The first iteration can stay frontend-only.
  Evidence: `imports_summary` and `debts` are already available through `POST /api/app-data`, and import confirmation already exists through `POST /api/import-action`.
- Observation: Local Wrangler started in this environment only outside the sandbox, but HTTP requests to `/app` timed out even after Wrangler printed `Ready on http://127.0.0.1:8787`.
  Evidence: `curl.exe -I --max-time 8 http://127.0.0.1:8787/app` timed out with zero bytes, and Wrangler emitted no request-level error. Static Mini App validation still passed.
- Observation: Browser QA against a temporary `file://` snapshot is blocked by the in-app browser URL policy.
  Evidence: The browser rejected navigation to `file:///C:/Users/GIS/AppData/Local/Temp/residualmap-miniapp-mock.html`; no project files were changed for this attempt.

## Decision Log

- Decision: Implement `Нужно проверить Lite` instead of a full Review Inbox.
  Rationale: A broad inbox would require new task semantics and possibly new endpoints. A compact queue for PDF drafts and open debts uses existing data and gives immediate user-visible value.
  Date/Author: 2026-07-03 / Codex
- Decision: Use Telegram `MainButton` only for active import drafts with `importable_count > 0`.
  Rationale: The native bottom button is more visible than another card button, but it should not appear on unrelated tabs or for drafts that cannot be imported.
  Date/Author: 2026-07-03 / Codex

## Outcomes & Retrospective

Implementation is complete and committed locally. The expected outcome is that the next decision is obvious from `Обзор`, and the highest-priority import action is available as a native Telegram button on `Импорт`. Automated validation passed; direct visual QA of `/app` remains limited by the local Wrangler/browser behavior recorded above.

## Context and Orientation

The repository is a Cloudflare Worker app. `src/worker.js` serves Telegram webhook routes, Mini App API routes, and the Mini App HTML route `/app`. `src/mini-app.js` defines the Mini App HTML shell. `src/mini-app-client.js` runs in the Telegram WebView and handles tabs, API calls, records, imports, sheets, and Telegram Web App APIs. `src/mini-app-styles.js` contains the Mini App CSS.

`imports_summary` is returned by `POST /api/app-data` and already includes import draft summary information for overview rendering. `POST /api/imports` returns import batch cards for the `Импорт` tab. `POST /api/import-action` confirms or cancels an import draft. Telegram `MainButton` is the native bottom button provided by Telegram Mini Apps through `window.Telegram.WebApp.MainButton`.

## Plan of Work

First, replace the current import-only attention strip with a compact review queue. Keep the existing HTML element `#importAttention` to avoid structural churn, but render it as `Нужно проверить` with up to two rows: a PDF draft row when `imports_summary.draft_count > 0`, and an open debts row when the current debt list has open balances. Each row should be a button-style action with `data-open-tab` so it reuses existing tab switching. If there are no review items, show a compact positive state or hide the block; the implementation should choose the less noisy option that still makes the feature visible.

Second, add client-side `MainButton` synchronization. The app should compute the first active draft with `status === "draft"` and `importable_count > 0`. When the current tab is `import`, the draft exists, and Telegram `MainButton` is available, configure the button text to `Импортировать N строк`, show it, and wire a click handler that confirms the same batch. When leaving the import tab, after confirm/cancel, or when there is no importable draft, hide the button and remove the handler. Existing card buttons remain as fallback.

Third, reuse the existing confirmation path. Avoid duplicating API logic: create a small helper that takes `batchId` and `action`, confirms with the user, calls `/api/import-action`, updates imports and overview, and handles inline errors. Both the card button and `MainButton` should use this helper.

Finally, update tests only where the current suite can cheaply cover the contract. The route tests already cover `/api/import-action`; frontend behavior will be covered by syntax checks and inline script validation unless a simple module-level test is practical without adding dependencies.

## Concrete Steps

Work from `C:\Users\GIS\Documents\Codex\2026-04-30\1-codex-2-codex-3-codex\residualmap-bot`.

Inspect the changed files:

    git status --short --branch
    git diff -- src/mini-app.js src/mini-app-client.js src/mini-app-styles.js src/worker.js

Run validation:

    node --check src/worker.js
    node --check src/mini-app.js
    node --check src/mini-app-client.js
    node --check src/mini-app-styles.js
    node -e "Promise.all([import('./src/mini-app-client.js'), import('./src/mini-app.js')]).then(([client, app]) => { new Function(client.miniAppClientScript); const html = app.miniAppHtml(); for (const id of ['importAttention','view-import','importsCanvas']) { if (!html.includes(id)) throw new Error('missing ' + id); } console.log('mini app review lite syntax ok'); })"
    npm.cmd run check
    git diff --check
    npm.cmd run check:application

## Validation and Acceptance

Automated acceptance requires `npm.cmd run check` to pass with all existing tests, the inline Mini App script validation to print `mini app review lite syntax ok`, and `git diff --check` to pass.

Human acceptance is: with a PDF draft, `Обзор` shows a `Нужно проверить` block with a PDF row and a `Проверить` action; opening `Импорт` shows Telegram `MainButton` with `Импортировать N строк`; confirming through that native button produces the same result as confirming through the card button. With no PDF draft, the button is hidden. If open debts exist, `Обзор` shows a debts review row that opens `Долги`.

## Idempotence and Recovery

The change is frontend-first and safe to retry. It does not mutate D1 schema or external services. If the `MainButton` behavior causes trouble, hide it by reverting only the `MainButton` synchronization helper in `src/mini-app-client.js`; card buttons continue to work.

## Artifacts and Notes

The decision was saved in local Codex memory as `extensions/ad_hoc/notes/2026-07-03-residualmap-next-ux-decision.md`. This ExecPlan repeats the relevant content so it can stand alone.

## Interfaces and Dependencies

Do not add npm dependencies. Use the existing Telegram Web App object `window.Telegram.WebApp`, guarded by feature checks. Use the existing API helper `api()` in `src/mini-app-client.js` and existing route `/api/import-action`. Preserve Telegram `initData` validation by leaving all Mini App API requests through the current helper.

Revision note, 2026-07-03: Created from the arbitrated subagent decision to implement `Нужно проверить Lite` and Telegram `MainButton` as the next UX iteration.

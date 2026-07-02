# Backdated Entries and PDF Statement Import

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. The global plan rules are in `C:\Users\GIS\.codex\PLANS.md`; this file follows those rules.

## Purpose / Big Picture

After this change, a Telegram user can write an expense with an older date, such as `1 июля 1453 такси`, and the bot stores it under that date instead of the day the message was sent. The user can also send a PDF bank statement to the bot, review a draft import, and confirm insertion of non-duplicate KZT rows into the same `transactions` table used by manual entries.

## Progress

- [x] (2026-07-02 06:50Z) Read project instructions, inspected the current Worker, migrations, and test structure.
- [x] (2026-07-02 07:05Z) Implemented date parsing and rejection of explicit future dates for manual entries.
- [x] (2026-07-02 07:08Z) Added D1 draft import tables for statement batches and extracted items.
- [x] (2026-07-02 07:30Z) Added Telegram PDF document handling, OpenAI extraction, draft summary, and callback confirmation/cancellation.
- [x] (2026-07-02 07:45Z) Added route and unit tests for date parsing, PDF draft creation, authorization, file validation, and confirmation idempotency.
- [x] (2026-07-02 07:55Z) Ran syntax checks, full project tests, and diff review.
- [x] (2026-07-02 08:35Z) Addressed parallel review findings: full numeric dates no longer become amounts, downloaded PDF bytes are checked before OpenAI, duplicate detection now requires matching text, cancel callback and webhook backdated insert tests were added.
- [x] (2026-07-02 09:30Z) Strengthened statement import for real bank tables: preserved signed amount text, made plus/minus determine income versus expense, added deterministic merchant categorization, and added a visible truncation warning.
- [x] (2026-07-02 09:40Z) Added tests for `YANDEX.GO`, `Beeline`, `Google One`, `DodoPizza`, `Wolt`, negative external transfers, positive income rows, tiyn/cents precision, and truncated extraction summaries.
- [x] (2026-07-02 10:25Z) Added authenticated Mini App import endpoints, route tests, and `/api/app-data.imports_summary` for draft attention state.
- [x] (2026-07-02 10:40Z) Added the Mini App `Импорт` tab, draft/history cards, confirm/cancel actions, dashboard import attention, denser top navigation, and safer tab accessibility.
- [x] (2026-07-02 10:45Z) Ran `npm.cmd run check`; syntax checks and all 58 route/unit tests passed.

## Surprises & Discoveries

- Observation: The existing schema already separates `occurred_at` from `local_date`, so manual backdated entries can be implemented without changing `transactions`.
  Evidence: `migrations/0001_initial.sql` defines `local_date TEXT NOT NULL` and `src/worker.js` already inserts `resolveLocalDate(intent.date_text, timezone, now)`.
- Observation: Wolt delivery categorization is already present.
  Evidence: `CATEGORY_RULES` and `migrations/0003_canonicalize_food_delivery_categories.sql` include Wolt aliases for `Еда > Доставка`.
- Observation: JavaScript `\b` word boundaries are not reliable for Russian month names.
  Evidence: the first test run captured `1 июля 1453` as the date instead of `1 июля`; switching to Unicode-aware non-letter/non-number boundaries fixed the failing tests.
- Observation: Numeric date tokens need whole-token handling.
  Evidence: parallel review found `такси 1453 2026-07-01` and `такси 1453 01.07.2026` could pick `1` or `2026` as the amount; the fix ignores every numeric match inside a valid ISO or dotted date token.
- Observation: Telegram PDF metadata is not enough to prove a file is a PDF.
  Evidence: parallel review noted spoofed `.pdf` files would reach OpenAI; the implementation now checks downloaded bytes for the `%PDF-` header before extraction.
- Observation: The first PDF import version asked OpenAI to return positive `amount` values and a separate `direction`, so the original plus or minus sign from a bank statement could be lost.
  Evidence: the statement schema did not include the source amount text, and `normalizeStatementImportItem` previously trusted `row.direction`; tests now cover `- 5 000,00 ₸ | Перевод` becoming an `expense` and `+ 2 250,00 ₸` becoming an `income`.
- Observation: AI category hints must not outrank known merchants.
  Evidence: a mocked PDF row for `YANDEX.GO` with wrong `category_hint: "Доставка"` now inserts `Транспорт > Такси`, and a mocked `Wolt` row with wrong `category_hint: "Такси"` still inserts `Еда > Доставка`.
- Observation: Completeness for very large PDFs still depends on the model accurately reporting truncation.
  Evidence: reviewer found no code regression, but noted the residual risk that if the model returns exactly `MAX_IMPORT_ITEMS` rows and `truncated: false`, the Worker cannot independently prove more rows existed without a separate PDF text/page extraction step.
- Observation: The Mini App UI work needed frontend wiring in addition to backend endpoints.
  Evidence: the import API existed, but `src/mini-app-client.js` registered `handleImportAction` before any function or `/api/import-action` client call had been implemented.
- Observation: Removing the old insight card required matching JavaScript cleanup.
  Evidence: `src/mini-app.js` no longer rendered `insightText`, while the client still wrote to that element before the UI refresh patch.

## Decision Log

- Decision: Dates without a year use the nearest past date, not always the current year.
  Rationale: The user wants to add expenses after the fact; a date-only entry should not silently create a future transaction.
  Date/Author: 2026-07-02 / Codex
- Decision: PDF imports must create drafts and require confirmation before inserting transactions.
  Rationale: Bank statement parsing can misread rows, categories, and duplicates; confirmation prevents accidental bulk writes.
  Date/Author: 2026-07-02 / Codex
- Decision: Use additive `import_batches` and `import_items` tables instead of changing existing transaction rows.
  Rationale: Draft state, skipped rows, duplicate flags, and audit evidence need a place before final insertion.
  Date/Author: 2026-07-02 / Codex
- Decision: Treat a statement row as a duplicate only when amount/date/kind/currency match and merchant/description/raw text also overlaps.
  Rationale: Amount-only matching can incorrectly skip two legitimate same-amount transactions on the same day.
  Date/Author: 2026-07-02 / Codex
- Decision: Preserve `amount_text` in OpenAI's strict JSON response and derive imported `kind` from the sign before trusting the model's `direction`.
  Rationale: Bank statements make the sign authoritative. A negative row labeled `Перевод` is still a real outgoing transaction unless the row clearly says it is a transfer between the user's own accounts.
  Date/Author: 2026-07-02 / Codex
- Decision: Apply deterministic merchant rules before AI category hints for expense statement rows.
  Rationale: Frequent merchants such as `YANDEX.GO`, `Beeline`, `Google One`, `DodoPizza`, and `Wolt` should be stable and testable, while AI hints remain a fallback for unknown merchants.
  Date/Author: 2026-07-02 / Codex
- Decision: Do not add a migration for sign-aware import.
  Rationale: Existing `import_items.raw_text` and `metadata_json` can carry source amount, operation text, and truncation details without changing the stored transaction contract.
  Date/Author: 2026-07-02 / Codex
- Decision: Keep Mini App import management on the existing authenticated POST pattern.
  Rationale: `/api/imports` and `/api/import-action` can reuse Telegram init data validation, internal `user.id` scoping, and the existing deterministic confirm/cancel code instead of adding a separate auth surface.
  Date/Author: 2026-07-02 / Codex
- Decision: Use a vanilla JS/CSS operational UI refresh instead of a new frontend framework.
  Rationale: The project is compact, already renders the Mini App from the Worker, and the requested import workflow can be shipped with narrow changes to `src/mini-app.js`, `src/mini-app-client.js`, and `src/mini-app-styles.js`.
  Date/Author: 2026-07-02 / Codex

## Outcomes & Retrospective

Implemented the requested behavior and addressed follow-up parallel review findings. Manual dated entries now parse relative words, Russian month dates, dotted dates, and ISO dates, while explicit future or invalid dates stop before insertion. PDF documents from allowed Telegram users now create import drafts through OpenAI file input after metadata and byte-level PDF checks, and inline callbacks confirm or cancel the draft. Confirmation inserts only non-duplicate draft rows and writes audit records.

The PDF draft import now better matches real bank tables with columns such as Date, Amount, Operation, and Details. The model is asked to return both a numeric amount and the original signed amount text. Deterministic code turns `- 6 315,75 ₸` into `amount_minor = 631575` and `kind = expense`, and turns `+ 2 250,00 ₸` into `amount_minor = 225000` and `kind = income`. Known merchant rules classify `YANDEX.GO` as `Транспорт > Такси`, `Beeline` as `Связь > Мобильная связь`, `Google One` as `Подписки > Сервисы`, and `Wolt` or `DodoPizza` as `Еда > Доставка` before AI hints can override them.

One limitation remains: the Worker warns about truncation when the model reports `truncated: true` or when more than `MAX_IMPORT_ITEMS` rows somehow arrive, but it does not yet independently count PDF rows before sending the file to OpenAI. A future chunking milestone should split large statements by page or use a deterministic PDF text extractor before AI parsing.

## Context and Orientation

The project is a Cloudflare Worker in `src/worker.js`. Telegram updates arrive at `/telegram`; plain text is classified by `classifyText`, normalized by `normalizeIntent`, and inserted by `insertTransaction`. The D1 database schema lives in `migrations/`. Tests live in `test/worker.test.js` and run with `npm run check`.

The term "draft import" means rows extracted from a PDF statement are saved to D1 but are not yet real financial transactions. A confirmed import creates normal `transactions` rows for draft items that are valid KZT rows and not likely duplicates.

## Plan of Work

First, extend date parsing in `src/worker.js` so fallback classification preserves date phrases and `resolveLocalDate` can parse relative words, Russian month names, dotted dates, and ISO dates. Add a validation helper so explicit future or invalid dates stop insertion with a user-facing message.

Next, add a new migration that creates `import_batches` and `import_items`. These tables track the Telegram file, file hash, parse totals, status, duplicate flags, and eventual transaction IDs.

Then, extend Telegram update handling to support document messages and callback queries. PDF messages from allowed users are downloaded from Telegram, sent to OpenAI as a file input, normalized into draft rows, checked against existing active transactions for duplicates, saved to the import tables, and summarized with confirm/cancel inline buttons. Callback confirmation imports only active draft, non-duplicate items and marks the batch confirmed; cancellation marks the draft cancelled.

For real bank statements, keep the OpenAI response strict but preserve source fields that deterministic code needs. Each row should include `amount_text`, such as `- 6 315,75 ₸`, and `operation`, such as `Покупка` or `Перевод`. Code in `normalizeStatementImportItem` derives the transaction kind from the sign first, treats external negative transfers as expenses, and only keeps `transfer` when the row text clearly describes movement between the user's own accounts. Known merchant matching runs before `category_hint` for expense rows.

Finally, add tests around the date helper, document validation, draft creation, statement signs, merchant rules, truncation warnings, and confirmation flow. Run syntax checks and the full test command.

## Concrete Steps

Work from `C:\Users\GIS\Documents\Codex\2026-04-30\1-codex-2-codex-3-codex\residualmap-bot`.

Run:

    node --check src/worker.js
    npm.cmd run check
    git diff --check

Expected result: all commands exit with code 0. `npm.cmd run check` includes the new tests for backdated entries and PDF import.

## Validation and Acceptance

Manual date acceptance: a test for `1 июля 1453 такси` sent with `now = 2026-07-02` must resolve to `2026-07-01`, and the created Telegram message must display that date.

PDF draft acceptance: a PDF document update from a denied Telegram user must not call Telegram `getFile`; a non-PDF or oversized document from an allowed user must be rejected; a valid PDF with mocked OpenAI extraction must create `import_batches` and `import_items` rows and send a draft summary without inserting into `transactions`.

Confirmation acceptance: a callback for the batch must insert only non-duplicate draft rows once, update draft item statuses, mark the batch confirmed, and audit the import.

## Idempotence and Recovery

Telegram update idempotency remains based on `processed_updates`. Confirmation is idempotent because only `draft` batches can be confirmed, and only `draft` import items are inserted. If a PDF parse fails, the update is marked failed and can be retried by sending the PDF again.

## Artifacts and Notes

Validation run:

    npm.cmd run check
    ...
    tests 54
    pass 54
    fail 0

Focused validation after sign-aware merchant import:

    node --test test\worker.test.js
    tests 54
    pass 54
    fail 0

    git diff --check
    exit code 0

PowerShell blocked `npm run check` through `npm.ps1`, so validation used `npm.cmd run check` without changing system execution policy.

## Interfaces and Dependencies

No new npm dependency is planned. PDF extraction uses the existing OpenAI API key and the Responses API with an `input_file` item carrying base64 PDF data. Telegram file download uses Bot API `getFile` followed by `https://api.telegram.org/file/bot<TOKEN>/<file_path>`. The new D1 tables are additive and do not change existing `transactions`. Merchant rules are local JavaScript regular expressions in `src/worker.js`; they are deterministic and run before AI category hints for expense statement rows.

Revision note, 2026-07-02: This plan was updated after implementing sign-aware bank statement rows and deterministic merchant classification. The update records why `amount_text` is preserved, why known merchants outrank AI hints, and how truncated PDF extraction is surfaced to the user.

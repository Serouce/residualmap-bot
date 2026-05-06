# AGENTS.md

## Project Stack

- Runtime: Cloudflare Workers, entrypoint `src/worker.js`.
- Language: JavaScript ES modules (`"type": "module"`).
- Telegram integration: Bot API webhook at `/telegram`; Mini App page at `/app`.
- Database: Cloudflare D1, binding `DB`, migrations in `migrations/`.
- AI: OpenAI Responses API for intent parsing and optional analytics summaries.
- Deployment/config: Wrangler via `wrangler.toml`.
- Frontend: Telegram Mini App HTML/CSS/JS lives in `src/mini-app.js` and is rendered by the Worker.

## Key Files

- `src/worker.js` - main Worker, Telegram webhook handlers, Mini App API routes, OpenAI calls, D1 queries, and CSV export.
- `src/mini-app.js` - Telegram Mini App HTML/CSS/JS for analytics, records, debts, and transaction detail actions.
- `migrations/*.sql` - D1 schema and additive migrations for idempotency/status tracking and transaction search metadata.
- `wrangler.toml` - Worker name, entrypoint, non-secret vars, and D1 binding.
- `.github/workflows/deploy.yml` - GitHub Actions check, migration, and deploy workflow for pushes to `main`.
- `.dev.vars.example` - example local secret/config values.
- `README.md` - user-facing project overview and bot commands.

## Commands

Install dependencies:

```sh
npm install
```

Run locally with Wrangler:

```sh
npm run dev
```

Deploy Worker:

```sh
npm run deploy
```

Create the D1 database:

```sh
npm run db:create
```

Apply migrations to the remote D1 database:

```sh
npm run db:migrate
```

Syntax-check the Worker:

```sh
node --check src/worker.js
```

There is currently no dedicated build step and no automated test suite in `package.json`.

## Code Rules

- Treat D1 as the source of truth. OpenAI may classify text into structured fields, but final totals must be calculated by SQL or deterministic code.
- Store money as integer minor units in `amount_minor`; format only at the output boundary.
- Use prepared D1 statements with `.bind()` for all user-controlled values.
- Keep deletes soft: set transaction `status = 'deleted'`, set `deleted_at`, and write to `audit_log`.
- Keep Telegram access restricted through `ALLOWED_TELEGRAM_IDS`.
- Do not commit real secrets or personal Telegram IDs. Use Cloudflare secrets or local `.dev.vars`; `.dev.vars.example` must stay placeholder-only.
- Escape user-controlled output sent with Telegram `parse_mode: "HTML"` using `escapeHtml()`.
- Preserve Telegram Mini App auth validation through `validateTelegramInitData()` before returning user data from `/api/app-data`.
- If changing Mini App UI, prefer editing `src/mini-app.js`; keep API contract changes in `src/worker.js` explicit and narrow.
- If changing schema, add a new migration file instead of editing already-applied migration history unless the database has not been deployed yet.
- Keep analytics deterministic first. AI summaries may explain SQL aggregates, not invent totals, categories, or dates.
- Prefer small, local helpers over new dependencies. The current project only depends on Wrangler for development.

## Self-Check Instructions

Before handing off a change:

1. Run `node --check src/worker.js`.
2. Run `git diff --check`.
3. Review `git diff` and confirm no secrets, tokens, chat IDs beyond intended config, or unrelated edits were added.
4. If Worker routing, Telegram commands, OpenAI parsing, Mini App data, or D1 queries changed, run `npm run dev` and manually exercise the affected path.
5. If migrations changed, test them on a local or staging D1 database before applying to remote.
6. For Telegram message changes, verify HTML is valid and all interpolated user/database values are escaped.
7. For Mini App changes, verify `/app` renders and `/api/app-data` still rejects missing or invalid Telegram `initData`.

## Collaboration Notes

- This repository is compact, and many features currently live in `src/worker.js`. Avoid parallel edits to that file unless ownership is clearly split.
- If another agent is actively working, use review mode or work on separate files/migrations to reduce merge conflicts.
- Keep README and this file aligned when commands, deployment steps, or project structure change.

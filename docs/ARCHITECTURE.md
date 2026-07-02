# Architecture

ResidualMap Bot is a Cloudflare Workers application with a Telegram webhook, a Telegram Mini App, a Cloudflare D1 database, and optional OpenAI Responses API calls.

## Request routes

`GET /app` returns the Telegram Mini App HTML.

`POST /telegram` receives Telegram Bot API webhook updates. Requests must include `X-Telegram-Bot-Api-Secret-Token` matching `TELEGRAM_WEBHOOK_SECRET`.

`POST /api/app-data` returns Mini App overview data after validating Telegram `initData` and `ALLOWED_TELEGRAM_IDS`.

`POST /api/transactions` returns filtered transaction records for the authenticated Mini App user.

`POST /api/transaction-action` updates, soft-deletes, or restores one authenticated user's transaction.

`POST /admin/set-webhook`, `/admin/webhook-info`, `/admin/delete-webhook`, and `/admin/health` are protected by `Authorization: Bearer <SETUP_TOKEN>`.

## Main Worker flow

`src/worker.js` is the Worker entrypoint. It routes HTTP requests, handles Telegram updates, validates Mini App auth, performs D1 queries, calls OpenAI when configured, and formats Telegram responses.

For Telegram messages:

1. The Worker verifies the Telegram webhook secret.
2. The Worker extracts the Telegram user ID.
3. `/id` is allowed so a user can discover their ID.
4. Other actions require the ID to be present in `ALLOWED_TELEGRAM_IDS`.
5. Text is parsed with OpenAI if `OPENAI_API_KEY` is configured, otherwise the deterministic fallback parser is used.
6. Records are stored in D1 with integer minor units in `amount_minor`.
7. Summaries are calculated from SQL aggregates, not invented by AI.

## Mini App flow

The Mini App frontend is assembled from:

- `src/mini-app.js`
- `src/mini-app-client.js`
- `src/mini-app-styles.js`

The browser sends Telegram `initData` with each Mini App API request. The Worker validates the hash with the bot token, checks expiry, extracts the Telegram user, and then applies `ALLOWED_TELEGRAM_IDS`.

Mini App endpoints always query by the authenticated internal `user_id`.

## Database

Migrations live in `migrations/`.

Core tables:

- `users` stores Telegram user identity, timezone, and currency.
- `transactions` stores financial records with `user_id`, `amount_minor`, category fields, raw text, dates, and soft-delete status.
- `processed_updates` tracks Telegram update idempotency.
- `audit_log` stores create, edit, delete, restore, and canonicalization actions.
- `category_aliases` stores global or per-user category aliases.

D1 is the source of truth. OpenAI may classify text, but final totals must come from SQL or deterministic code.

## OpenAI usage

The Worker uses the OpenAI Responses API for:

- parsing free-form transaction text into structured fields;
- optional natural-language analytics summaries.

Requests set `store: false`. If `OPENAI_API_KEY` is missing, transaction parsing falls back to deterministic local code.

## Security and isolation

- Telegram webhook secret protects `/telegram`.
- `SETUP_TOKEN` protects admin endpoints.
- Telegram Mini App `initData` protects `/api/*` user data.
- `ALLOWED_TELEGRAM_IDS` keeps deployments private by default.
- D1 queries use prepared statements and `.bind()`.
- User records are separated by internal `user_id`.
- Deletes are soft deletes and are recorded in `audit_log`.

## Deployment shape

`wrangler.toml` defines the Worker entrypoint, default variables, observability, and D1 binding. Operators must replace the D1 `database_id` with their own database before deploying their own copy.

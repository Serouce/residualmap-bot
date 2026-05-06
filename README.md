# ResidualMap Expense Bot

Telegram bot for personal expense tracking on Cloudflare Workers, Cloudflare D1, and the OpenAI Responses API.

## Core rules

- The database is the source of truth.
- OpenAI classifies text into structured JSON, but does not calculate final totals.
- Analytics totals are calculated with SQL first, then optionally summarized by AI.
- Deletions are soft deletes and are recorded in `audit_log`.
- Telegram access is restricted by `ALLOWED_TELEGRAM_IDS`.
- v1 is KZT-only. Messages classified as another currency are rejected instead of being hidden in analytics.
- The default OpenAI model is `gpt-5.4-mini` for a lower-cost parsing and summary path; override it with Worker secrets or environment variables if needed.

## Commands

- `/start` - short onboarding.
- `/help` - examples and commands.
- `/id` - show your Telegram user ID.
- `/today` - summary for today.
- `/week` - summary for the current week.
- `/month` - summary for the current month.
- `/debts` - open debts.
- `/last` - show latest active records with IDs.
- `/last deleted` - show latest deleted records.
- `/undo` - delete the latest active record.
- `/delete 123` - delete record by ID.
- `/restore 123` - restore a deleted record by ID.
- `/export` - download CSV export.
- `/settings` - show current bot settings.
- `/app` - open the Telegram Mini App finance panel.

## Mini App

The Mini App is a KZT-first dashboard with three views:

- Overview: KPIs, daily income/expense chart, category infographic, and largest expenses.
- Records: searchable and filterable transaction list with transaction details.
- Debts: focused view of open receivables and payables.

Mini App data is served through Telegram-authenticated JSON endpoints:

- `POST /api/app-data`
- `POST /api/transactions`
- `POST /api/transaction-action` for update, delete, and restore actions.

## Runtime configuration

Non-secret defaults live in `wrangler.toml` under `[vars]`, so GitHub deploys keep them attached to the Worker:

- `DEFAULT_CURRENCY` (keep `KZT` for v1)
- `DEFAULT_TIMEZONE`
- `OPENAI_MODEL_PARSE`
- `OPENAI_MODEL_ANALYTICS`
- `MINI_APP_URL`

`ALLOWED_TELEGRAM_IDS` is intentionally not committed to `wrangler.toml` because it contains personal Telegram identifiers. Set it as a Cloudflare secret or in local `.dev.vars`.

## Local checks

Run the syntax checks and focused parser tests before deploying:

```sh
npm run check
```

## Required Cloudflare secrets

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `SETUP_TOKEN`
- `ALLOWED_TELEGRAM_IDS`

Optional GitHub Actions deploy secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `ALLOWED_TELEGRAM_IDS`

## Deployment outline

1. Create a D1 database named `residualmap_expenses`.
2. Put its `database_id` into `wrangler.toml`.
3. Apply all migrations in `migrations/` with `npm run db:migrate`.
4. Add the required secrets to the Worker.
5. Deploy the Worker.
6. Set the Telegram webhook with the Worker URL and `TELEGRAM_WEBHOOK_SECRET`.

Admin webhook endpoints are POST-only and expect `Authorization: Bearer <SETUP_TOKEN>`:

```sh
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/set-webhook
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/webhook-info
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/delete-webhook
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/health
```

`/admin/health` checks D1 connectivity, configured Telegram/OpenAI secrets, active model names, and the latest failed Telegram updates.

## GitHub workflow

Pushes to `main` trigger `.github/workflows/deploy.yml`: install dependencies, run `npm run check`, apply D1 migrations remotely, sync `ALLOWED_TELEGRAM_IDS` as a Worker secret, and deploy the Worker. Configure `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `ALLOWED_TELEGRAM_IDS` in repository secrets before relying on the workflow.

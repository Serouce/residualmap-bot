# ResidualMap Expense Bot

Telegram bot for personal expense tracking on Cloudflare Workers, Cloudflare D1, and the OpenAI Responses API.

## Core rules

- The database is the source of truth.
- OpenAI classifies text into structured JSON, but does not calculate final totals.
- Analytics totals are calculated with SQL first, then optionally summarized by AI.
- Deletions are soft deletes and are recorded in `audit_log`.
- Telegram access is restricted by `ALLOWED_TELEGRAM_IDS`.

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

## Runtime configuration

Non-secret defaults live in `wrangler.toml` under `[vars]`, so GitHub deploys keep them attached to the Worker:

- `ALLOWED_TELEGRAM_IDS`
- `DEFAULT_CURRENCY`
- `DEFAULT_TIMEZONE`
- `OPENAI_MODEL_PARSE`
- `OPENAI_MODEL_ANALYTICS`

## Required Cloudflare secrets

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `SETUP_TOKEN`

## Deployment outline

1. Create a D1 database named `residualmap_expenses`.
2. Put its `database_id` into `wrangler.toml`.
3. Apply the migration in `migrations/0001_initial.sql`.
4. Add the required secrets to the Worker.
5. Deploy the Worker.
6. Set the Telegram webhook with the Worker URL and `TELEGRAM_WEBHOOK_SECRET`.

## GitHub workflow

Pushes to `main` trigger a Cloudflare Workers build and deploy.

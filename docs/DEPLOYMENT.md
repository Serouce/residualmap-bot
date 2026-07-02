# Deployment Guide

This guide explains how to deploy your own copy of ResidualMap Bot. It assumes you want a private self-hosted deployment, not a shared public service.

## Prerequisites

- Node.js 22 or newer.
- A Cloudflare account.
- Wrangler access to your Cloudflare account.
- A Telegram bot created with BotFather.
- An OpenAI API key if you want AI parsing and AI summaries.

## 1. Install dependencies

From the repository root:

```sh
npm install
```

## 2. Create a Telegram bot

In Telegram, open BotFather and create a bot. Save the bot token as `TELEGRAM_BOT_TOKEN`.

Generate a long random `TELEGRAM_WEBHOOK_SECRET`. Telegram will include this value in the `X-Telegram-Bot-Api-Secret-Token` header, and the Worker will reject webhook requests without it.

Generate a long random `SETUP_TOKEN`. This protects admin routes such as `/admin/set-webhook`.

## 3. Prepare Wrangler config

For a fresh self-hosted deployment, start from the public template config:

```sh
copy wrangler.example.toml wrangler.toml
```

If your checkout already has a deployment-specific `wrangler.toml`, replace its Worker URL and D1 database ID with values from your own Cloudflare account before deploying.

## 4. Create a D1 database

Run:

```sh
npm run db:create
```

Wrangler prints a database name and `database_id`. Replace the `database_id` in `wrangler.toml` with your own value.

Use `wrangler.example.toml` as the safe public template. Set `MINI_APP_URL` in `wrangler.toml` to your own deployed `/app` URL after deployment.

The committed `database_id`, if present in `wrangler.toml`, is not an application secret, but it belongs to another deployment and will not work for your account. Use your own D1 database.

## 5. Configure local development

Copy:

```sh
copy .dev.vars.example .dev.vars
```

Fill `.dev.vars` with your own values:

```txt
TELEGRAM_BOT_TOKEN=your_botfather_token
TELEGRAM_WEBHOOK_SECRET=your_long_random_webhook_secret
OPENAI_API_KEY=your_openai_project_key
ALLOWED_TELEGRAM_IDS=your_numeric_telegram_id
SETUP_TOKEN=your_long_random_admin_setup_token
```

Do not commit `.dev.vars`.

Find your Telegram ID by temporarily running the bot locally or deployed and sending `/id`. If access is not configured yet, the bot response includes the ID that must be added to `ALLOWED_TELEGRAM_IDS`.

## 6. Apply migrations

For the remote D1 database:

```sh
npm run db:migrate
```

Migrations create the `users`, `transactions`, `processed_updates`, `audit_log`, and `category_aliases` tables.

## 7. Run checks

```sh
npm run check
```

On Windows PowerShell, use:

```sh
npm.cmd run check
```

## 8. Deploy the Worker

```sh
npm run deploy
```

Keep secrets in Cloudflare, not in `wrangler.toml`. You can set them through the Cloudflare dashboard or Wrangler.

Required Worker secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `SETUP_TOKEN`
- `ALLOWED_TELEGRAM_IDS`

## 9. Set the Telegram webhook

After deployment, call the protected admin endpoint:

```sh
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/set-webhook
```

The Worker registers `https://your-worker.example/telegram` with Telegram and passes your `TELEGRAM_WEBHOOK_SECRET`.

Useful admin endpoints:

```sh
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/webhook-info
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/health
curl -X POST -H "Authorization: Bearer $SETUP_TOKEN" https://your-worker.example/admin/delete-webhook
```

## 10. Configure the Mini App URL

Set `MINI_APP_URL` to your deployed `/app` URL, for example:

```txt
MINI_APP_URL=https://your-worker.example/app
```

The `/app` command sends a Telegram Web App button using this URL.

## 11. Verify the bot

In Telegram:

1. Send `/id` and confirm the bot sees your Telegram ID.
2. Add that ID to `ALLOWED_TELEGRAM_IDS` if needed.
3. Send `1400 taxi` or a similar expense phrase.
4. Run `/today` or `/month`.
5. Run `/app` and open the Mini App from Telegram.

Expected result: records are created only for allowed Telegram IDs, analytics are calculated from D1, and the Mini App rejects missing or invalid Telegram `initData`.

## Shared public deployments

This guide does not make the bot a safe public SaaS. Before running a shared public bot, add rate limits, abuse controls, user deletion, privacy terms, retention policy, and cost monitoring.

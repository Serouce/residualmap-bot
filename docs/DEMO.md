# Demo Walkthrough

This walkthrough shows ResidualMap Bot with synthetic data only. Do not use real financial records, real Telegram IDs, or production screenshots in public demo materials.

## Demo positioning

ResidualMap is a self-hosted finance bot template. A good public demo should show the product shape without implying that the maintainer runs a central hosted service for users.

Use demo language like:

ResidualMap helps you deploy your own Telegram finance bot. Your deployment uses your Telegram bot, your Cloudflare Worker, your D1 database, and your OpenAI API key.

## Synthetic records

Use examples like these when recording screenshots or a video:

- `1400 taxi`
- `groceries 6200`
- `wolt 5100`
- `salary 350000`
- `lent Alex 5000`
- `Alex returned 2000`
- `paid Dana debt 3000`

Avoid examples that include real people, real merchants, real addresses, real account names, real family members, or sensitive categories.

## Suggested demo script

1. Show the repository README and explain that this is a self-hosted template.
2. Show `.dev.vars.example` with placeholders.
3. Show `wrangler.example.toml` with placeholder `database_id` and `MINI_APP_URL`.
4. Show a Telegram chat with synthetic messages.
5. Run `/today`, `/month`, `/debts`, and `/last`.
6. Open `/app` from Telegram and show Overview, Records, and Debts.
7. Delete and restore a synthetic record.
8. Run `/export` and show only the CSV headers or synthetic rows.
9. End by showing `PRIVACY.md` and the data flow.

## Screenshot checklist

- Use a throwaway Telegram bot or blur the bot username.
- Use synthetic records only.
- Hide Telegram user profile photos.
- Hide Telegram chat IDs and user IDs.
- Hide Cloudflare account identifiers.
- Hide Worker deployment logs.
- Hide OpenAI API keys and dashboard pages.
- Show `ALLOWED_TELEGRAM_IDS` only as placeholder text.

## Included synthetic assets

The repository includes SVG preview assets that contain only fake values:

- `docs/assets/demo-overview.svg`
- `docs/assets/demo-records.svg`
- `docs/assets/demo-flow.svg`

These are safe for the public README because they are hand-authored mockups, not production screenshots.

## Real screenshots to add later

Recommended future files:

- `docs/assets/demo-overview.png`
- `docs/assets/demo-records.png`
- `docs/assets/demo-debts.png`
- `docs/assets/demo-telegram-chat.png`

Only add PNG or video assets after verifying they contain no private data.

## Acceptance checklist for a public demo

- A new reader understands this is self-hosted.
- The demo uses only synthetic records.
- The demo shows the Telegram bot and Mini App working together.
- The demo shows privacy posture, not just UI.
- The demo does not reveal production deployment identifiers or secrets.

# Privacy

ResidualMap Bot is a self-hosted template. The project maintainer does not run a central hosted service or central financial database for users of this repository.

Each operator controls their own deployment and is responsible for their own data handling, access controls, backups, retention, and compliance obligations.

## Data flow

In a typical deployment:

1. A user sends a message to a Telegram bot controlled by the operator.
2. Telegram delivers the update to the operator's Cloudflare Worker webhook.
3. The Worker validates access with `ALLOWED_TELEGRAM_IDS`.
4. The Worker stores records in the operator's Cloudflare D1 database.
5. If `OPENAI_API_KEY` is configured, message text and analytics context may be sent to the OpenAI Responses API for parsing or summary generation.
6. The Telegram Mini App sends Telegram `initData` to the Worker API routes so the Worker can validate the Telegram user before returning data.

## Data stored by the app

The D1 database stores:

- Telegram user identifiers and profile fields from Telegram;
- transaction records such as amount, date, kind, category, counterparty, description, and raw text;
- soft-delete status and timestamps;
- audit log entries for creates, edits, deletes, restores, and related actions;
- category aliases.

CSV exports are sent back through Telegram when a user runs `/export`.

## Third-party processors

Depending on configuration and usage, data may pass through:

- Telegram, for bot messages, Mini App launch data, and document delivery;
- Cloudflare, for Workers, D1, logs, and deployment infrastructure;
- OpenAI, for AI parsing and analytics summaries when an OpenAI API key is configured.

OpenAI API requests in this project set `store: false`, but operators should still review OpenAI's API data policies for their own account and use case.

## Local development

Local `.dev.vars` files may contain secrets and personal Telegram IDs. They are ignored by git and must not be committed.

Developers should avoid using real financial records in tests, screenshots, issue reports, or pull requests.

## Running a shared public bot

The default project is designed for private self-hosting. If an operator chooses to run a shared public bot, they should add their own privacy notice, user deletion flow, abuse controls, rate limits, retention policy, and support process before inviting users.

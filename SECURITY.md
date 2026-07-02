# Security Policy

ResidualMap Bot handles financial records, Telegram identity data, and API credentials. Please treat security reports carefully and avoid posting exploit details, tokens, or personal financial data in public issues.

## Supported versions

The default supported version is the current `main` branch. This project is early-stage, so security fixes should target `main` first.

## Reporting a vulnerability

If GitHub private vulnerability reporting is enabled for the repository, use it. Otherwise, contact the maintainer privately before opening a public issue with details.

When reporting, include:

- affected route or file;
- expected behavior;
- observed behavior;
- minimal reproduction steps;
- whether secrets, Telegram IDs, or financial data could be exposed or modified.

Do not include real bot tokens, OpenAI keys, Cloudflare tokens, Telegram webhook secrets, personal Telegram IDs, or copied financial records.

## Security boundaries

ResidualMap is a self-hosted template. Each operator is responsible for their own Telegram bot, Cloudflare Worker, D1 database, OpenAI API key, Cloudflare secrets, deployment logs, backups, and access control.

The repository does not operate a central hosted finance database for template users.

## Operational recommendations

- Keep `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `OPENAI_API_KEY`, `SETUP_TOKEN`, and `ALLOWED_TELEGRAM_IDS` in Cloudflare secrets or local `.dev.vars`.
- Do not commit `.dev.vars`, CSV exports, production logs, screenshots with personal records, or real Telegram identifiers.
- Use a long random `TELEGRAM_WEBHOOK_SECRET`.
- Use a long random `SETUP_TOKEN`.
- Keep `ALLOWED_TELEGRAM_IDS` narrow unless you intentionally run a shared deployment.
- Review Cloudflare Worker logs before sharing them publicly.
- Rotate secrets if they are exposed.

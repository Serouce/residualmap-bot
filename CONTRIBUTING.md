# Contributing

Thanks for helping improve ResidualMap Bot. This project is a self-hosted finance bot template, so changes should preserve private-by-default operation and avoid assumptions about a central hosted service.

## Development setup

Install dependencies:

```sh
npm install
```

Copy local development variables:

```sh
copy .dev.vars.example .dev.vars
```

Fill `.dev.vars` with your own local values. Never commit `.dev.vars`, real Telegram IDs, bot tokens, OpenAI keys, Cloudflare tokens, CSV exports, screenshots containing personal records, or copied production data.

Run checks before opening a pull request:

```sh
npm run check
```

On Windows PowerShell, use `npm.cmd run check` if script execution policy blocks `npm`.

## Pull request guidelines

- Keep changes focused and explain the user-visible behavior.
- Preserve D1 as the source of truth for totals and analytics.
- Use prepared D1 statements with `.bind()` for user-controlled values.
- Keep deletes soft: set `status = 'deleted'`, set `deleted_at`, and write to `audit_log`.
- Keep Telegram access restricted through `ALLOWED_TELEGRAM_IDS`.
- Escape user-controlled Telegram HTML output with `escapeHtml()`.
- Keep Mini App auth validation through `validateTelegramInitData()`.
- Add a new migration for schema changes instead of editing old migrations after deployment.
- Prefer small local helpers over new dependencies.

## Documentation expectations

If a change affects setup, deployment, routes, secrets, D1 schema, or user data flow, update the matching documentation in `README.md` or `docs/`.

For releases, migrations, or production deployment changes, follow `docs/RELEASE_CHECKLIST.md`. For database export or restore guidance, follow `docs/BACKUP_RESTORE.md`.

## Security-sensitive changes

For authentication, authorization, data isolation, webhook handling, Mini App auth, or secret handling, include a short security note in the pull request and run the relevant path locally when practical.

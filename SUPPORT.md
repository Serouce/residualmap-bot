# Support

ResidualMap Bot is a self-hosted template. The maintainer does not operate a central hosted finance service or have access to your Telegram bot, Cloudflare Worker, D1 database, OpenAI account, or financial records.

## Before Asking for Help

Check:

- `README.md` for project overview and commands;
- `docs/DEPLOYMENT.md` for setup;
- `docs/ARCHITECTURE.md` for routes and data flow;
- `docs/BACKUP_RESTORE.md` for D1 export and restore guidance;
- `docs/RELEASE_CHECKLIST.md` before production deployment changes;
- `PRIVACY.md` for data flow;
- `SECURITY.md` for vulnerability reporting.

Run:

```sh
npm run check
```

On Windows PowerShell:

```sh
npm.cmd run check
```

## What to Include in Public Issues

Safe public details:

- operating system;
- Node.js version;
- Wrangler version;
- command name, route, or document section;
- redacted error messages;
- synthetic reproduction steps;
- whether the issue happens locally, on Cloudflare, or in Telegram.

Do not include:

- `.dev.vars`;
- Telegram bot tokens;
- Telegram webhook secrets;
- OpenAI API keys;
- Cloudflare API tokens;
- real Telegram IDs;
- D1 database IDs;
- Worker URLs for private deployments;
- CSV exports;
- screenshots with real financial records;
- private Worker logs;
- copied production data.

## Security Issues

If the issue could expose or modify financial records, Telegram identity data, secrets, D1 data, exports, or logs, follow `SECURITY.md` and avoid posting details publicly.

## Self-Hosting Reports

Successful self-hosting reports are useful for the project, but keep them minimal:

- mention the general platform setup;
- mention docs that helped or confused you;
- avoid posting private URLs, IDs, logs, screenshots, or records.

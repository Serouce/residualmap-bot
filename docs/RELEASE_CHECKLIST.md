# Release Checklist

Use this checklist before tagging a release, merging a risky pull request, or deploying changes to a production ResidualMap bot.

ResidualMap is a self-hosted finance project. A release should protect existing operators, avoid data loss, and make privacy tradeoffs explicit.

## Scope

Write a short release note that answers:

- What changed for Telegram commands, Mini App screens, D1 schema, OpenAI parsing, or deployment?
- Does this affect existing financial records?
- Does this require a new secret, new Cloudflare binding, new Telegram BotFather setting, or migration?
- Can operators roll back the Worker without rolling back D1?

## Code and Test Checks

Run:

```sh
npm run check
git diff --check
```

On Windows PowerShell, use:

```sh
npm.cmd run check
git diff --check
```

Review the diff manually for:

- no `.dev.vars`, `.env`, tokens, Telegram IDs, CSV exports, screenshots with real records, or private logs;
- no user-controlled SQL without prepared `.bind()` values;
- no Telegram HTML interpolation without `escapeHtml()`;
- no Mini App API route that bypasses `validateTelegramInitData()`;
- no transaction query that loses `user_id` scoping;
- no hard delete unless the release explicitly documents why soft delete is not appropriate.

## Migration Checks

If a release changes D1 schema:

1. Add a new migration file in `migrations/`.
2. Do not edit already-applied migration history for deployed databases.
3. Run the migration against a staging or throwaway D1 database first.
4. Confirm existing commands still work after migration.
5. Document whether rollback requires restoring a D1 backup.

Suggested smoke test after migration:

- send `/id`;
- add one synthetic expense;
- run `/last`;
- run `/month`;
- open the Mini App;
- delete and restore the synthetic record;
- run `/export` and verify only expected synthetic rows in the test environment.

## Deployment Checks

Before deploying production:

- Confirm `wrangler.toml` points to the intended Worker and D1 database.
- Confirm secrets are set in Cloudflare, not committed to Git.
- Confirm `ALLOWED_TELEGRAM_IDS` is restricted to the intended Telegram accounts.
- Confirm `MINI_APP_URL` points to the intended `/app` URL.
- Confirm the Telegram webhook secret matches the Worker secret.

Deploy:

```sh
npm run deploy
```

GitHub Actions deployment is manual-only. Do not deploy production from a public template branch with placeholder `wrangler.toml`; see `docs/PRIVATE_PRODUCTION.md`.

D1 migrations are intentionally manual:

```sh
npm run db:migrate
```

Run migrations only after confirming the target D1 database.

## Post-Deploy Smoke Test

From an allowed Telegram account:

1. Send `/id`.
2. Send `/settings`.
3. Add a synthetic record.
4. Run `/last`.
5. Run `/month`.
6. Open `/app`.
7. Delete and restore the synthetic record.
8. Run `/export` only if the environment is safe for export testing.

If any step fails, avoid repeated deploys. Capture the error, check Cloudflare Worker logs privately, and decide whether to roll back the Worker or restore D1 from a backup.

## Public Release Notes

Public release notes should not contain:

- real transaction examples;
- real Telegram IDs;
- Worker URLs for private deployments;
- D1 database IDs;
- screenshots from production data;
- copied logs with secrets or personal records.

Use synthetic examples from `docs/DEMO.md` instead.

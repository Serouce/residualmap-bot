# D1 Backup and Restore Guide

This guide is for self-hosted ResidualMap operators. Financial data is sensitive, so treat exported SQL files like private records: do not commit them, attach them to public issues, or share them in support threads.

Cloudflare D1 has multiple recovery paths. This project uses Cloudflare D1 as the source of truth, so backup and restore work should be tested on a staging database before touching production data.

## Before You Start

- Confirm you are logged in to the correct Cloudflare account.
- Confirm the database name in `wrangler.toml` or `wrangler.example.toml`.
- Run commands from the repository root.
- Store backup files outside the repository or in a private encrypted location.
- Never put SQL exports, CSV exports, or production records in Git.

## Manual SQL Export

Export a remote D1 database to a SQL file:

```sh
npx wrangler d1 export residualmap_expenses --remote --output ./private-backups/residualmap.sql
```

If you only need schema, add `--no-data=true`:

```sh
npx wrangler d1 export residualmap_expenses --remote --output ./private-backups/residualmap-schema.sql --no-data=true
```

Recommended verification after export:

```sh
npx wrangler d1 execute residualmap_expenses --remote --command "SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name;"
```

The expected table list should include `users`, `transactions`, `audit_log`, `processed_updates`, and any tables added by later migrations.

## Restore Into a New D1 Database

Prefer restoring into a new database first. That gives you a safe place to verify the data before changing a live bot.

1. Create a new D1 database:

```sh
npx wrangler d1 create residualmap_expenses_restore_test
```

2. Import the SQL file into the new database:

```sh
npx wrangler d1 execute residualmap_expenses_restore_test --remote --file ./private-backups/residualmap.sql
```

3. Verify the restored database:

```sh
npx wrangler d1 execute residualmap_expenses_restore_test --remote --command "SELECT COUNT(*) AS count FROM transactions;"
```

4. Point a staging Worker at the restored database and run a smoke test with a throwaway Telegram bot before using it for production.

## Production Restore Pattern

For production incidents, use this conservative sequence:

1. Stop making bot changes until you understand the failure.
2. Export the current damaged state if possible, so you can inspect it later.
3. Restore into a new D1 database first.
4. Verify table counts and a few synthetic or known non-sensitive records.
5. Update only the intended deployment's D1 binding.
6. Run `/id`, `/last`, `/month`, and `/export` from an allowed Telegram account.
7. Keep the old database until the restored deployment has been stable.

Do not overwrite a production database directly unless you have already tested the exact restore command on a staging database.

## Time Travel and Managed Backups

Cloudflare D1 also documents Time Travel and managed backup features. Use those features from Cloudflare's current documentation when you need point-in-time recovery rather than a manual SQL file. Always confirm the command against the current Cloudflare docs before running a destructive restore.

## Public Support Policy

When asking for help publicly:

- Share table names, migration numbers, command names, and redacted error messages.
- Do not share exported rows, Telegram IDs, bot tokens, OpenAI keys, Worker secrets, Cloudflare account IDs, or real transaction text.
- If a reproduction is needed, create synthetic records like the examples in `docs/DEMO.md`.

## Sources

This guide follows Cloudflare's D1 import/export and Wrangler command documentation checked on 2026-06-06:

- https://developers.cloudflare.com/d1/best-practices/import-export-data/
- https://developers.cloudflare.com/d1/wrangler-commands/
- https://developers.cloudflare.com/d1/reference/time-travel/

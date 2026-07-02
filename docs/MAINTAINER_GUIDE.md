# Maintainer Guide

This guide describes how to maintain ResidualMap Bot as a public self-hosted OSS template.

The project handles sensitive domains: financial records, Telegram identity data, Cloudflare D1 storage, OpenAI calls, exports, logs, and deployment secrets. Maintenance should favor small changes, clear review, and privacy-preserving examples.

## Maintainer Priorities

1. Keep the project self-hosted by default.
2. Keep `ALLOWED_TELEGRAM_IDS` and Telegram Mini App `initData` validation intact.
3. Keep D1 as the source of truth for totals and analytics.
4. Keep transaction queries scoped by `user_id`.
5. Keep deletes soft and audited.
6. Keep user-controlled Telegram HTML escaped.
7. Keep docs honest about Telegram, Cloudflare, D1, and OpenAI data flow.
8. Avoid committing secrets, real Telegram IDs, logs, exports, screenshots, or production records.

## Issue Triage

For each public issue:

- confirm it does not contain secrets or personal financial data;
- ask the reporter to replace private examples with synthetic data if needed;
- tag the issue as `bug`, `documentation`, `enhancement`, `security`, `privacy`, `test`, or `good first issue` where appropriate;
- route possible vulnerabilities to `SECURITY.md`;
- keep feature requests aligned with the self-hosted template model.

Close or edit issues that expose secrets or real records. If a secret appears, tell the reporter to rotate it.

## Pull Request Review

For every pull request, check:

- `npm run check` passes locally or in CI;
- no `.dev.vars`, `.env`, tokens, Telegram IDs, D1 IDs, logs, exports, or screenshots with real records are included;
- docs are updated when setup, routes, commands, schema, secrets, or data flow change;
- SQL uses prepared statements with `.bind()` for user-controlled values;
- Telegram HTML output uses `escapeHtml()`;
- Mini App APIs call `validateTelegramInitData()` before returning user data;
- transaction reads and writes are scoped by `user_id`;
- deletes remain soft and write `audit_log`;
- OpenAI summaries explain deterministic data rather than inventing totals.

If a PR touches authentication, authorization, D1 queries, Telegram output, exports, backup/restore, or deployment, request extra review and ask for focused tests.

## Dependency Updates

Dependabot is configured for npm and GitHub Actions.

For dependency PRs:

1. Read the changelog for breaking changes.
2. Run `npm run check`.
3. If Wrangler changes, verify local `wrangler dev` or a staging deploy when practical.
4. Do not apply D1 migrations as part of dependency update review unless the PR explicitly changes migrations.

## Release Readiness

Before a release or production deployment, follow `docs/RELEASE_CHECKLIST.md`.

If a release changes D1 schema, Telegram commands, Mini App API responses, secrets, OpenAI model behavior, exports, or backup guidance, update the relevant docs and mention the change in release notes.

## Public Communication

Do not overstate adoption. It is fine to say the project is early.

Good public phrasing:

ResidualMap is an early self-hosted OSS template for people who want to run their own Telegram finance bot and keep their database in their own Cloudflare account.

Avoid:

- implying the maintainer runs a hosted finance service;
- promising absolute privacy;
- claiming stars, users, forks, or deployments that do not exist;
- posting production screenshots or logs.

## Codex Usage

If Codex or API credits are available for maintenance, use them for:

- PR review on security-sensitive diffs;
- focused tests for reported bugs;
- docs consistency checks after route, schema, or deployment changes;
- release note drafts;
- safe refactor planning.

Do not use maintainer automation to process real user financial records. Use synthetic examples from `docs/DEMO.md`.

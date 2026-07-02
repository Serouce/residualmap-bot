# Roadmap

ResidualMap Bot is being prepared as a public self-hosted OSS template. The roadmap focuses on making it safer, easier to deploy, and easier for outside contributors to understand.

Copy-ready drafts for the first public issues live in `docs/ISSUE_DRAFTS.md`.
The first public-feedback plan lives in `docs/ADOPTION_SIGNALS.md`.

## Near term

- Add public PNG screenshots or a short demo video using synthetic records only.
- Replace or supplement the included SVG mockups in `docs/assets/` with verified synthetic screenshots.
- Add a setup checklist that helps first-time self-hosters avoid leaking secrets.

## Security and privacy

- Add optional per-user or per-chat rate limits for operators who run shared deployments.
- Add a documented user data deletion workflow for shared deployments.
- Expand audit-log coverage examples in the docs.
- Expand route-level tests for Telegram delete/restore commands, CSV export, and backup guidance examples.
- Add restore smoke-test examples for staging D1 databases.

## Maintainer automation candidates

- Use Codex to review pull requests that touch authentication, D1 queries, Telegram output, or deployment docs.
- Use Codex to draft release notes from merged changes.
- Use Codex to check documentation consistency after route, command, migration, or secret changes.
- Use Codex to propose focused tests when a bug report includes a reproduction.
- Use Dependabot PRs as routine maintenance entry points, with extra review for Wrangler updates.

## Adoption evidence to collect

- Public GitHub stars and forks.
- Issues or discussions from people trying the self-hosted setup.
- Pull requests from external contributors.
- Screenshots or demo videos that do not contain real financial data.
- Volunteer reports of successful self-hosted deployments.

## Pre-application evidence target

Before submitting the Codex for Open Source application, aim for a small but real evidence bundle:

- public repository with template-safe config;
- passing GitHub CI;
- 3-5 public maintainer issues;
- one or more outside comments, stars, forks, or setup-review notes;
- no inflated adoption claims.

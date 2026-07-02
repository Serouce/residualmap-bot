# Publishing Checklist

Use this checklist before switching the GitHub repository from private to public.

## Required public-readiness checks

- `LICENSE` is present.
- `README.md` explains that ResidualMap is a self-hosted template, not a hosted SaaS.
- `PRIVACY.md` explains the Telegram, Cloudflare, and OpenAI data flow.
- `SECURITY.md` explains private vulnerability reporting and secret handling.
- `CONTRIBUTING.md` explains local setup and checks.
- `CODE_OF_CONDUCT.md` and `SUPPORT.md` are present.
- `.gitignore` excludes `.dev.vars`, `.env` files, `.wrangler/`, logs, and `private-backups/`.
- `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md` are present.
- `.github/workflows/ci.yml` runs checks for pull requests and pushes.
- `.github/workflows/deploy.yml` is manual-only, so public template pushes do not automatically deploy production.
- `.github/dependabot.yml` is present for npm and GitHub Actions updates.
- `docs/APPLICATION_PACKET.md` has final public repository URL and form drafts.
- `docs/PUBLICATION_RUNBOOK.md` has been followed.
- `docs/ROADMAP.md` lists concrete maintainer work.
- `docs/BACKUP_RESTORE.md` explains safe D1 export and restore handling.
- `docs/RELEASE_CHECKLIST.md` covers migrations, secrets, and post-deploy smoke tests.
- `docs/PRIVATE_PRODUCTION.md` explains how to keep private deployment config out of the public branch.
- `docs/MAINTAINER_GUIDE.md` covers triage, PR review, dependency updates, and Codex usage.
- `docs/ISSUE_DRAFTS.md` contains first public issue drafts.
- `docs/DEMO.md` explains how to record screenshots without private data.
- `npm.cmd run check` passes.
- `npm.cmd run check:application` passes.
- `npm.cmd run check:public` passes on the public template branch.
- `git diff --check` passes.

## Secret and personal-data checks

Do not publish:

- `.dev.vars`;
- `.env` files;
- Telegram bot tokens;
- Telegram webhook secrets;
- OpenAI API keys;
- Cloudflare API tokens;
- real personal Telegram IDs;
- CSV exports;
- screenshots with real records;
- private Worker logs;
- copied production data.

## Wrangler configuration

This repository includes `wrangler.example.toml` as the public template configuration.

Before publishing, decide how to handle `wrangler.toml`:

1. Preferred for a public template: replace deployment-specific values in `wrangler.toml` with the same placeholders used in `wrangler.example.toml`.
2. If you need to keep a private production config, keep production deployment values out of the public branch and use local Cloudflare secrets or a private branch for deployment.

The current `database_id` and Worker URL are not API tokens, but they are deployment-specific and make the repo look less reusable as a public template.

Follow `docs/PUBLICATION_RUNBOOK.md` before changing GitHub visibility.

After replacing deployment-specific values, run:

```sh
npm.cmd run prepare:public-config
npm.cmd run check:public
```

`prepare:public-config` is a dry run unless called with `-- --apply`. `check:public` is expected to fail while `wrangler.toml` still contains the private production Worker URL or D1 database ID.

## GitHub repository settings

Recommended description:

Self-hosted Telegram Mini App and expense-tracking bot for Cloudflare Workers, D1, and OpenAI.

Recommended topics:

telegram-bot, telegram-mini-app, cloudflare-workers, cloudflare-d1, openai, responses-api, self-hosted, personal-finance, expense-tracker, privacy

Recommended first public issues:

Use the copy-ready drafts in `docs/ISSUE_DRAFTS.md`.

1. Add verified synthetic PNG screenshots and a demo walkthrough.
2. Add optional rate limits for shared deployments.
3. Add user data deletion workflow for shared deployments.
4. Add route-level soft-delete and restore command regression tests.
5. Add route-level CSV export regression tests.
6. Add Telegram command output snapshot tests for common flows.
7. Add staging restore smoke-test examples for D1 backups.
8. Add GitHub Discussions templates for self-hosting support.

## Final step

After the repository is public, verify the public page in a logged-out browser session. Confirm that README links work and that no private deployment data is visible beyond intentional placeholders.

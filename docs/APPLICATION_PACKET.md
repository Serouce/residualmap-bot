# Codex for Open Source Application Packet

This packet is the operational checklist for applying to OpenAI's Codex for Open Source program. Use it after the repository is public.

## Pre-application checks

- Final publication gate: immediately before submitting, verify that `Serouce/residualmap-bot` is public and readable without GitHub authentication.
- Template-safety gate: immediately before changing visibility, verify that `wrangler.toml` contains the same reusable placeholders as `wrangler.example.toml`.
- GitHub profile is public.
- Repository is public.
- `README.md` presents ResidualMap as a self-hosted OSS template, not a hosted SaaS.
- `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, `SECURITY.md`, and `PRIVACY.md` are present.
- `docs/DEPLOYMENT.md`, `docs/ARCHITECTURE.md`, `docs/BACKUP_RESTORE.md`, `docs/RELEASE_CHECKLIST.md`, `docs/MAINTAINER_GUIDE.md`, `docs/ROADMAP.md`, and `docs/CODEX_FOR_OSS.md` are present.
- `docs/ISSUE_DRAFTS.md` contains copy-ready first public issue text.
- `docs/ADOPTION_SIGNALS.md` is filled with current public evidence before submission.
- `docs/DEMO.md` explains how to create screenshots with synthetic data only.
- `docs/assets/` contains only hand-authored synthetic demo assets.
- `docs/PUBLISHING_CHECKLIST.md` is complete.
- `docs/PUBLICATION_RUNBOOK.md` is complete and the public branch has template-safe Wrangler values.
- `wrangler.example.toml` is present and contains only placeholders.
- GitHub issue templates and pull request template are present.
- GitHub CI workflow runs `npm run check` for pull requests and pushes.
- Dependabot is configured for npm and GitHub Actions maintenance.
- Mini App auth rejection, webhook secret rejection, Telegram HTML escaping, route-level CSV export scoping, route-level undo/delete/restore scoping, soft-delete/restore helper, CSV escaping, and per-user transaction query isolation tests are present.
- No `.dev.vars`, real Telegram IDs, real tokens, OpenAI keys, Cloudflare tokens, CSV exports, private logs, or real financial records are committed.
- `npm.cmd run check` passes.
- `npm.cmd run check:application` passes without failures, and any warnings are understood.
- `git diff --check` passes.

## Submission timing recommendation

Do not submit the OpenAI form before the repository is public and the public branch is template-safe. The official form asks for a public GitHub profile and public repository URL, so submitting earlier wastes the strongest first impression.

Best near-term sequence:

1. Publish the template-safe repository.
2. Open 3-5 public roadmap issues.
3. Ask 2-3 trusted developers to read the README/deployment guide.
4. Record any true public signal: star, fork, issue, feedback, or self-host attempt.
5. Submit with honest early-stage wording.

If there are no external signals after a few days, it is still reasonable to apply. Do not wait for large adoption if the repository is already clean, public, documented, and visibly maintained.

Use `docs/ADOPTION_SIGNALS.md` to run the first 72 hours after publication and keep the evidence table honest.

Before pasting the form fields into OpenAI's application form, run:

```sh
npm.cmd run check:application
```

This validates the copy-ready drafts against the 500-character limits and flags overconfident wording.

## Repository settings to apply before submission

Recommended GitHub description:

Self-hosted Telegram Mini App and expense-tracking bot for Cloudflare Workers, D1, and OpenAI.

Recommended topics:

telegram-bot, telegram-mini-app, cloudflare-workers, cloudflare-d1, openai, responses-api, self-hosted, personal-finance, expense-tracker, privacy

Recommended homepage:

Use the deployed `/app` URL only if it is safe to show publicly. Otherwise leave it blank until a demo deployment exists.

Recommended first public issues:

Use the copy-ready drafts in `docs/ISSUE_DRAFTS.md`.

1. Add verified synthetic PNG screenshots and demo walkthrough.
2. Add optional rate limits for shared deployments.
3. Add user data deletion workflow for shared deployments.
4. Expand route-level undo/delete/restore command edge cases.
5. Expand route-level CSV export regression tests.
6. Add Telegram command output snapshot tests for common flows.
7. Add staging restore smoke-test examples for D1 backups.
8. Add GitHub Discussions templates for self-hosting support.

## Form field drafts

Use the final public GitHub URL: `https://github.com/Serouce/residualmap-bot`.

Describe your role:

I am the primary maintainer. I built and maintain the Worker, Telegram webhook, Mini App, D1 schema, OpenAI parsing path, deployment docs, and security/privacy documentation.

Why does this repository qualify? (500 chars max)

ResidualMap is an early self-hosted OSS template for private-by-default finance tracking on Telegram, Cloudflare Workers/D1, and OpenAI. Each operator runs their own bot and D1 instead of a central finance database. The repo documents security, privacy, deployment, backup/restore, releases, maintainer review, and includes auth, D1 isolation, undo/delete/restore, export, HTML escaping, and CSV tests.

How will you use API credits for your project? (500 chars max)

I would use credits for OSS maintenance: Codex-assisted PR review, security review of Telegram webhook/Mini App auth, D1 query isolation, docs checks, release notes, and safe refactors. API usage would be limited to this public repo and maintainer automation, not user financial data processing.

Anything else we should know? (500 chars max)

Current status: early public template, not yet widely adopted. I am applying honestly for support to make it safer and easier to self-host before promoting it. The value is privacy-oriented: users can deploy their own finance bot and keep transaction data in their own Cloudflare account.

## Shorter fallback drafts

Use these if the form UI rejects a field near the 500-character limit.

Why this repository qualifies:

ResidualMap is an early self-hosted OSS template for private-by-default finance tracking on Telegram, Cloudflare Workers/D1, and OpenAI. Each operator runs their own bot and D1 instead of a central finance database. The repo includes deployment, privacy, security, backup, release, and maintainer docs, plus auth, D1 isolation, undo/delete/restore, export, HTML escaping, and CSV tests.

API credits use:

Credits would support OSS maintenance only: Codex-assisted PR review, security review of Telegram webhook and Mini App auth, D1 isolation checks, docs review, release notes, and safe refactors. They would not be used to process user financial data for a hosted service.

Anything else:

This is an early public template, not a widely adopted project yet. I am applying honestly for support to make it safer and easier to self-host before promoting it. Its value is privacy-oriented: users deploy their own finance bot and keep transaction data in their own Cloudflare account.

## Outreach checklist

After publishing the repository:

- Ask 2-3 trusted developers to read the README and tell you where setup is unclear.
- Ask one person to try the deployment guide with their own Cloudflare account, if practical.
- Open the first roadmap issues before applying, so the repository visibly has active maintainer work.
- Track signals in `docs/ADOPTION_SIGNALS.md`.
- Add screenshots only with synthetic data.
- Do not imply adoption that is not real.

## Evidence to collect over time

- Stars and forks.
- Issues from outside users.
- Pull requests from outside contributors.
- Public comments from people who tried the setup.
- Successful self-hosted deployment reports.
- Screenshots or demo video using synthetic records.

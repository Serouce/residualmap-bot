# Public Repository Runbook

Use this runbook when you are ready to switch `Serouce/residualmap-bot` from private to public and then apply to Codex for Open Source.

The goal is to publish ResidualMap as a self-hosted OSS template without breaking the current private production bot.

## Current Blockers

As of 2026-06-06, two known blockers must be resolved before submitting the OpenAI application:

1. The GitHub repository is still private.
2. `wrangler.toml` contains deployment-specific values:
   - the current production Worker `/app` URL;
   - the current D1 `database_id`.

These values are not API tokens, but they weaken the public-template story and make it easier for readers to confuse the project with a hosted service.

## Recommended Publishing Strategy

Use a public template branch for OSS and keep private production deployment details out of that branch.

Recommended shape:

- `main`: public OSS template, safe placeholders only.
- private local notes, Cloudflare dashboard secrets, or a private deployment branch: production-only values.

This keeps the public repository useful to other self-hosters while preserving the current private bot.

See `docs/PRIVATE_PRODUCTION.md` for ways to keep private production deployment config separate after publication.

## Step 1: Save Production Values Privately

Before replacing public config values, save the current production values outside the repository:

- production Worker URL;
- D1 database ID;
- Telegram webhook secret;
- Telegram bot token;
- OpenAI API key;
- `ALLOWED_TELEGRAM_IDS`;
- `SETUP_TOKEN`;
- Cloudflare account and API token information.

Do not store this list in Git, public issues, screenshots, or README text.

## Step 2: Make `wrangler.toml` Template-Safe

For the public branch, make `wrangler.toml` match the safe placeholder shape from `wrangler.example.toml`:

```toml
MINI_APP_URL = "https://your-worker.example/app"
database_id = "replace_with_your_cloudflare_d1_database_id"
```

You can dry-run the config cutover first:

```sh
npm.cmd run prepare:public-config
```

On the public template branch only, apply the cutover:

```sh
npm.cmd run prepare:public-config -- --apply
```

Do not commit real Telegram IDs, bot tokens, OpenAI keys, Cloudflare tokens, webhook secrets, or production logs.

After this change, local production deploys should not be run from the public template branch unless you restore the private production config first.

## Step 3: Verify Public Safety

Run:

```sh
npm.cmd run check
npm.cmd run check:public
git diff --check
```

Search for obvious private values:

```sh
rg -n --glob "!docs/PUBLICATION_RUNBOOK.md" "OPENAI_API_KEY=sk-|TELEGRAM_BOT_TOKEN=.+[0-9]:|ALLOWED_TELEGRAM_IDS=[0-9]|database_id = \"[0-9a-f-]{36}\"|https://[^ ]+\\.workers\\.dev/app" .
```

Expected result:

- no real OpenAI keys;
- no real Telegram bot tokens;
- no real personal Telegram IDs;
- no real Cloudflare API tokens;
- no real production Worker URL in public docs;
- no real D1 database ID in public template config.
- `npm.cmd run check:public` passes.

The search may find placeholder examples. That is fine if they are obviously fake.

## Step 4: Publish GitHub Repository

In GitHub repository settings:

1. Confirm the default branch is the public template branch.
2. Confirm `README.md` renders correctly.
3. Switch visibility from private to public.
4. Set repository description:

```text
Self-hosted Telegram Mini App and expense-tracking bot for Cloudflare Workers, D1, and OpenAI.
```

5. Add topics:

```text
telegram-bot, telegram-mini-app, cloudflare-workers, cloudflare-d1, openai, responses-api, self-hosted, personal-finance, expense-tracker, privacy
```

6. Leave homepage blank unless you have a safe public demo deployment.
7. Keep production deploys manual. The deploy workflow should not automatically deploy from every public `main` push.

## Step 5: Create First Public Issues

Open the first issues from `docs/ISSUE_DRAFTS.md`.

Start with 3-5 issues, not all of them, so the repository looks active but not artificially inflated. Good first set:

1. Synthetic screenshots and demo walkthrough.
2. Optional rate limits for shared deployments.
3. Soft-delete and restore regression tests.
4. CSV export regression tests.
5. Staging restore smoke-test examples.

Do not claim outside adoption until it exists.

## Step 6: Logged-Out Review

Open the public repository in a logged-out or private browser session.

Check:

- README preview images render;
- links to `docs/` work;
- issue templates are visible;
- CI workflow is visible;
- no production Worker URL or D1 ID is visible;
- no `.dev.vars`, secrets, logs, CSV exports, or real screenshots are visible.

## Step 7: Submit Codex for Open Source Application

Use `docs/APPLICATION_PACKET.md` for copy-ready application text.

Application posture:

- honest early-stage status;
- primary maintainer role;
- self-hosted privacy-first value;
- real docs, CI, tests, and release process;
- no inflated claims about users, stars, forks, or adoption.

## Step 8: After Submission

Collect lightweight evidence:

- stars and forks;
- issues from people reading or trying the setup;
- feedback from 2-3 trusted developers;
- one successful self-hosting report if possible;
- synthetic demo screenshots or video.

Update `docs/CODEX_FOR_OSS.md` and `docs/APPLICATION_PACKET.md` only with evidence that is true.

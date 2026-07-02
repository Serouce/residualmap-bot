# Private Production Deployment

Use this note if you maintain a real private ResidualMap bot while the public repository stays a self-hosted OSS template.

The public branch should contain placeholder configuration. The private production bot should keep deployment-specific values outside the public branch.

## Recommended Setup

Keep this in the public branch:

- source code;
- migrations;
- tests;
- docs;
- `wrangler.example.toml`;
- a template-safe `wrangler.toml`;
- GitHub Actions CI.

Keep this outside the public branch:

- real Worker URL;
- real D1 `database_id`;
- Telegram bot token;
- Telegram webhook secret;
- OpenAI API key;
- `ALLOWED_TELEGRAM_IDS`;
- `SETUP_TOKEN`;
- Cloudflare API tokens;
- production logs and exports.

## Deployment Options

### Option A: Manual Private Deployment

Use a local checkout or private branch that has the real production `wrangler.toml`.

Before deploying:

```sh
npm.cmd run check
git diff --check
```

Then deploy from the private config context:

```sh
npm.cmd run deploy
```

Do not push the private production config to the public branch.

### Option B: Private Deployment Branch

Keep a private branch for production-only config and deployment.

Recommended rules:

- never merge the private config into the public template branch;
- keep production-only commits small and easy to inspect;
- run `npm.cmd run check` before every deploy;
- run `npm.cmd run check:public` only on the public template branch.

### Option C: Manual GitHub Actions Deploy

The deploy workflow is intentionally manual-only. This avoids accidental production deploys when public template commits change `wrangler.toml`.

Before using GitHub Actions deploy:

- confirm the branch being deployed contains the intended Worker and D1 config;
- confirm `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured as repository secrets;
- confirm Worker secrets are already set in Cloudflare;
- confirm the public branch does not contain private deployment values.

## Public Template Cutover

For the public template branch, dry-run:

```sh
npm.cmd run prepare:public-config
```

Apply only on the public template branch:

```sh
npm.cmd run prepare:public-config -- --apply
```

Then verify:

```sh
npm.cmd run check
npm.cmd run check:application
npm.cmd run check:public
git diff --check
```

If `check:public` fails, do not make the repository public yet.

## Production Safety Rule

Never run production deploys from a placeholder `wrangler.toml`.

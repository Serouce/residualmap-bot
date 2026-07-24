# Adoption Signals Playbook

Use this playbook after the repository is public and template-safe. The goal is to collect honest public evidence before submitting the Codex for Open Source application.

Do not manufacture activity. Do not ask people to say they used the project if they did not. A small amount of real feedback is stronger than inflated claims.

## Why this matters

OpenAI's official Codex for Open Source materials ask for a public GitHub profile, a public repository URL, maintainer role, and a short explanation of why the repository qualifies. The criteria are qualitative: repository usage, ecosystem importance, active maintenance, and maintainer responsibilities.

There is no official public star threshold in the OpenAI materials checked for this repo. Some third-party posts mention numeric thresholds, but those are not stated in the official OpenAI form or program terms.

## First 72 Hours

### Before publishing

- Complete `docs/PUBLICATION_RUNBOOK.md`.
- Make the public branch template-safe.
- Confirm `wrangler.toml` has no production Worker URL or real D1 database ID in the public branch.
- Run `npm.cmd run check`.
- Run `git diff --check`.
- Confirm `.dev.vars` is not present in Git.

### Hour 0: publish

- Switch the repository to public.
- Set the GitHub description and topics from `docs/APPLICATION_PACKET.md`.
- Open 3-5 issues from `docs/ISSUE_DRAFTS.md`.
- Check the public page in a logged-out browser.

### Hours 1-24: ask for review

Ask 2-3 trusted developers for specific feedback:

```text
I published an early self-hosted OSS template: ResidualMap Bot.

It is a Telegram Mini App and expense tracker for Cloudflare Workers, D1, and OpenAI. The main idea is that each person deploys their own bot and keeps the financial DB in their own Cloudflare account.

Could you skim the README and deployment guide and tell me:
1. what is unclear;
2. whether you would trust the self-hosting/privacy explanation;
3. what would block you from trying it?

Please do not post private tokens, Telegram IDs, Worker URLs, logs, or real financial data in public feedback.
```

Use public GitHub issues or discussions when feedback is safe to share. Use private messages for anything involving secrets, real deployment details, or financial records.

### Hours 24-72: convert feedback into visible maintenance

- Open issues for real setup confusion.
- Fix small docs gaps quickly.
- Thank reviewers in issue comments when appropriate.
- Record true signals in the table below.
- Do not claim "users" unless someone actually tried or deployed it.

## Evidence Table

Keep this table current before submitting the application.

| Signal | Current value | Evidence link or note |
| --- | --- | --- |
| Repository visibility | Public and verified without authentication | `https://github.com/Serouce/residualmap-bot` |
| Public stars | 0 | GitHub repository page, checked 2026-07-24 |
| Public forks | 0 | GitHub repository page, checked 2026-07-24 |
| Public issues opened by maintainer | 3 | [#9](https://github.com/Serouce/residualmap-bot/issues/9), [#10](https://github.com/Serouce/residualmap-bot/issues/10), [#11](https://github.com/Serouce/residualmap-bot/issues/11) |
| External issues or comments | 0 until real feedback | Link only public safe feedback |
| External self-host attempt | 0 until confirmed | Public issue/discussion or private note |
| External PRs | 0 until real PRs | Pull requests page |
| Demo assets | Synthetic SVG mockups present | `docs/assets/` |
| CI status | GitHub CI passed; automatic deployment checks failed against intentionally placeholder-only public config | CI run for `2cef1f1`; deployment is being changed to manual-only for the public template |

## Go/No-Go For Application

The strongest submission has all of these:

- GitHub profile is public.
- Repository is public.
- Public branch has template-safe `wrangler.toml`.
- README, privacy, security, deployment, architecture, and maintainer docs are present.
- CI is visible and passing.
- Application form text is honest about early-stage adoption.

Better but not mandatory:

- At least 3 public issues show active maintainer work.
- 1-3 stars or forks.
- One external comment about setup clarity.
- One issue opened from real feedback.
- One person tried the deployment guide.

Do not submit yet if:

- The repository is private.
- The public branch contains real production Worker URL or D1 ID.
- The README implies a hosted SaaS or absolute privacy.
- Screenshots include real financial data.
- The application text claims adoption that does not exist.

## Phrases To Use

- "early self-hosted OSS template"
- "primary maintainer"
- "private-by-default deployment model"
- "users run their own Worker and D1 database"
- "not a hosted SaaS"
- "Codex would support maintainer review, security checks, docs, tests, and releases"

## Phrases To Avoid

- "fully private" or "zero data leaves your infrastructure"
- "widely adopted" before evidence exists
- "users" when only the maintainer uses it
- "guaranteed approval"
- "OpenAI stores no data" without the precise API/data-flow context

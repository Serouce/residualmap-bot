# Codex for Open Source Notes

This file collects positioning notes for a future Codex for Open Source application.

## Project pitch

ResidualMap Bot is a self-hosted Telegram Mini App and expense-tracking bot for Cloudflare Workers, D1, and OpenAI. It is designed so each user runs their own deployment and keeps their financial database in their own Cloudflare account, instead of trusting a central hosted service with personal transaction data.

## Why this can matter

Many personal finance tools ask users to trust a hosted service with sensitive transaction history. ResidualMap takes the opposite approach: it is an inspectable self-hosted template that combines a Telegram interface, a Mini App dashboard, D1 storage, deterministic SQL analytics, and optional OpenAI parsing.

The project can help developers learn how to build private-by-default AI-assisted tools on Cloudflare Workers without centralizing user financial data under the template maintainer.

## How Codex and API credits would help

- Review security-sensitive changes around Telegram auth, Mini App `initData`, D1 query isolation, and secret handling.
- Continue expanding route-level tests for Telegram command edge cases, CSV export edge cases, and backup workflows.
- Improve deployment docs for new self-hosters.
- Maintain compatibility with Cloudflare Workers, D1, Telegram Bot API, and OpenAI Responses API.
- Build safer optional features such as backup/export workflows, rate limits, and abuse controls for operators who choose to run shared deployments.

## Current application status

The project should not be presented as widely adopted yet unless there is evidence. Before applying, collect what is true:

- public GitHub repository URL;
- maintainer role;
- license;
- README and deployment documentation;
- screenshots or demo walkthrough;
- automated checks for Mini App auth rejection, Telegram webhook secret rejection, Telegram HTML escaping, and per-user D1 query isolation;
- stars, forks, issues, pull requests, or external users if available;
- examples of real self-hosted deployments if users volunteer them.

## Research notes as of 2026-06-06

Official OpenAI sources say the current Codex for Open Source program is for maintainers of active open-source projects. The application form asks for a public GitHub username, a public repository URL, whether the applicant is a primary or core maintainer, why the repository qualifies, and how API credits would be used. OpenAI says it looks at repository usage, ecosystem importance, evidence of active maintenance, and maintainer responsibilities such as pull request review, issue triage, release management, and security or code-quality work.

OpenAI's program terms are deliberately discretionary. They say benefits can include a limited-duration ChatGPT Pro benefit, API credits, and conditional Codex Security access, but the exact availability, duration, scope, and timing can vary by applicant, repository, and use case. Applying does not guarantee selection.

Observed public cases are mixed:

- Albumentations reported receiving an explicit approval email offering 6 months of ChatGPT Pro for the Albumentations ecosystem. That project has very strong public evidence: thousands of stars, many downloads, academic citations, and NumFOCUS affiliation. This is a high-bar example.
- Public LinkedIn posts show individual open-source contributors also reporting 6 months of ChatGPT Pro through Codex for Open Source, including people whose public profiles emphasize GSoC, Kubeflow, Jaeger, MLOps, hackathons, and broader OSS contributions. This suggests OpenAI may consider contributor profile and ecosystem work, not only ownership of a very large personal repository.
- A Reddit approval post claims the applicant got 6 months of Pro through Codex for Open Source, while commenters debated project size and one commenter claimed the user's top repository had around 60 stars. This is weak evidence because it is anonymous and not fully verifiable, but it argues against assuming there is a strict public star threshold.
- OSS.Fund tracks the program as live and notes that OpenAI does not publish public recipient counts or total credit amounts, so the overall acceptance rate is not knowable from public data.

Sources checked:

- https://openai.com/form/codex-for-oss/
- https://developers.openai.com/codex/codex-for-oss-terms
- https://openai.com/form/codex-open-source-fund/
- https://albumentations.ai/blog/2026/01-openai-support-is-an-ai/
- https://www.oss.fund/codex-for-open-source/
- https://www.reddit.com/r/OpenAI/comments/1szui89/got_6_months_of_chatgpt_pro_for_free_thanks/
- https://www.linkedin.com/posts/harshvirpotpose_got-a-nice-surprise-in-my-inbox-today-an-activity-7439966135082627072-VXt1

## Research refresh as of 2026-06-08

The official OpenAI form still makes two hard public-readiness requirements explicit: the GitHub profile must be public and the repository URL must point to a public repository. The form also still says selected maintainers can receive 6 months of ChatGPT Pro, conditional Codex Security access, and API credits for coding, maintainer automation, release workflows, and core OSS work.

The official criteria remain discretionary rather than threshold-based. OpenAI says maintainers of active OSS projects can apply, and that it looks for meaningful usage, broad adoption, or clear ecosystem importance. The form also says applicants should still apply when a project does not neatly fit the criteria but plays an important ecosystem role. The developer community page adds that the program is aimed at core maintainers with write access and projects using Codex/API credits for pull request review, maintainer automation, release workflows, or other core OSS work.

Public evidence continues to suggest that the bar is not only "huge project or no chance", but strong public signals matter:

- Albumentations remains the clearest high-bar public case. It has very strong ecosystem evidence, and its maintainer posted about receiving an explicit approval email, while also describing activation/support friction after approval.
- LinkedIn posts from individual contributors, including Harshvir Potpose and Himanshu Kumar, report receiving 6 months of ChatGPT Pro through Codex for Open Source. These are weaker than official case studies, but they support the idea that OpenAI may consider individual OSS contribution history and maintainer work, not only the star count of one repository.
- OSS.Fund still lists the program as live and verified, but notes that OpenAI does not publish recipient counts or total credit amounts. That means acceptance rate cannot be inferred from public data.
- Some third-party summaries mention numeric star thresholds, but those thresholds were not found in the official OpenAI form, developer page, or program terms. Treat them as commentary, not application rules.

Conclusion for ResidualMap: it is still worth applying after publication, but the strongest honest angle is not "large adoption". The strongest angle is "early but serious self-hosted OSS template in a sensitive domain, with privacy/security docs, CI, Dependabot, maintainer docs, release/backup guidance, and regression tests". Before applying, public repository visibility and template-safe `wrangler.toml` remain non-negotiable blockers.

Additional sources checked:

- https://openai.com/form/codex-for-oss/
- https://developers.openai.com/community/codex-for-oss
- https://developers.openai.com/codex/codex-for-oss-terms
- https://openai.com/form/codex-open-source-fund/
- https://www.oss.fund/codex-for-open-source/
- https://www.linkedin.com/in/himanshu748
- https://www.linkedin.com/posts/harshvirpotpose_got-a-nice-surprise-in-my-inbox-today-an-activity-7439966135082627072-VXt1
- https://albumentations.ai/blog/2026/01-openai-support-is-an-ai/

## Decision memo as of 2026-06-08

Verdict: this is worth doing, but not as "publish and instantly win". The realistic path is "publish a clean, serious self-hosted template, collect a few honest public signals, then submit a precise maintainer application".

What the public evidence suggests:

- No evidence of a strict public star threshold was found in official OpenAI sources.
- Strong adoption helps a lot. Albumentations is the clearest public approval case and is far above ResidualMap in ecosystem maturity.
- Smaller applicants may still have a chance if the maintainer role and ecosystem value are clear, but public proof is weaker and acceptance rates are unknown.
- Applying while the repository is private is not viable because the official form asks for public GitHub profile and public repository URL.
- Applying with production-specific `wrangler.toml` values still visible would weaken the self-hosted template story, even if those values are not API secrets.

Recommended timing:

1. Do not submit while the repository is private.
2. Make the public branch template-safe.
3. Publish the repository.
4. Open the first 3-5 public issues from `docs/ISSUE_DRAFTS.md`.
5. Ask 2-3 developers to read or try the setup guide.
6. Add any true signals: stars, forks, issues, feedback, or one successful self-host attempt.
7. Submit the application after those signals exist. If no signals arrive after a few days, submit anyway with honest early-stage wording rather than waiting for "large adoption".

Use `docs/ADOPTION_SIGNALS.md` to run this first public-feedback window.

Risk level:

- Current private repo: no chance to submit successfully.
- Public repo with current OSS docs/tests but zero external signals: possible, but weak-to-moderate.
- Public repo plus a few visible external signals and clean template config: meaningfully better.
- Large project-level adoption: strongest, but not required to make an honest attempt.

## Application strategy

The best near-term strategy is not to claim broad adoption that does not exist. Instead, present ResidualMap as a small but serious self-hosted OSS template with clear security value: it helps developers run AI-assisted finance tracking without centralizing personal financial data under a third-party maintainer.

The application should emphasize:

- primary maintainer role;
- public repository with MIT license and complete self-hosting docs;
- pull-request CI that runs the project checks for outside contributors;
- community health files for contribution, support, conduct, security, and privacy;
- Dependabot and maintainer guidance for dependency updates, triage, PR review, and releases;
- private-by-default security posture through `ALLOWED_TELEGRAM_IDS`;
- regression tests for webhook auth, Mini App auth, Telegram HTML escaping, D1 user isolation, route-level CSV export scoping, route-level undo/delete/restore scoping, soft-delete/restore helpers, and CSV escaping;
- maintainer docs for D1 backup/restore and release safety;
- concrete maintainer workload where Codex helps: security review, D1 isolation hardening, Telegram Mini App auth coverage, deployment docs, release notes, and issue triage;
- honest current status: early public template, not yet widely adopted;
- why the project still matters: privacy-preserving architecture for a sensitive domain and a compact reference implementation for Telegram, Cloudflare Workers, D1, and OpenAI Responses API.

Before applying, improve evidence by adding screenshots, a demo walkthrough, public issues for roadmap work, a clean public GitHub URL, and at least one external signal such as stars, feedback, a fork, a discussion, or another person trying the self-hosting guide.

Before making the repository public, complete `docs/PUBLICATION_RUNBOOK.md` and `docs/PUBLISHING_CHECKLIST.md` so deployment-specific config does not weaken the public-template story.

After publishing, open the first public issues from `docs/ISSUE_DRAFTS.md` so the repository visibly shows active maintainer work and contributor entry points.

## 500-character application draft

ResidualMap Bot is a self-hosted Telegram Mini App and expense tracker for Cloudflare Workers, D1, and OpenAI. It helps users run their own private finance bot, keeping the financial database in their own Cloudflare account instead of a central hosted service. Codex would help maintain security reviews, tests, deployment docs, and safer AI-assisted parsing workflows.

## Ready-to-submit form fields

Use these only after the repository is public and the GitHub URL is final.

Primary/core maintainer role:

I am the primary maintainer. I built and maintain the Worker, Telegram webhook, Mini App, D1 schema, OpenAI parsing path, deployment docs, and security/privacy documentation.

Why this repository qualifies:

ResidualMap is an early self-hosted OSS template for private-by-default finance tracking on Telegram, Cloudflare Workers/D1, and OpenAI. Each operator runs their own bot and D1. The repo documents security, privacy, deployment, and maintainer workflows, with regression tests for webhook auth, Mini App auth, HTML escaping, D1 isolation, undo/delete/restore scoping, CSV export scoping, and CSV escaping.

How API credits would be used:

I would use credits for OSS maintenance: Codex-assisted PR review, security review of Telegram webhook/Mini App auth, D1 isolation, docs checks, release notes, and safe refactors. API usage would be limited to this public repo and maintainer automation, not user financial data processing.

Anything else:

Current status: early public template, not yet widely adopted. I am applying honestly for support to make it safer and easier to self-host before promoting it. The value is privacy-oriented: users can deploy their own finance bot and keep transaction data in their own Cloudflare account.

## Adoption checklist

- Publish the repository with MIT license.
- Add screenshots or a short demo.
- Open issues for roadmap items.
- Invite feedback from Cloudflare Workers and Telegram bot developers.
- Track stars, forks, deployments, issues, and PRs.
- Keep the README honest about current adoption.

For a submission-ready checklist and copy-ready form fields, see `docs/APPLICATION_PACKET.md`.

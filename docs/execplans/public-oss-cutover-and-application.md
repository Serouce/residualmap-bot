# Publish ResidualMap safely and submit the Codex for OSS application

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept current as work proceeds. It is maintained in accordance with the global `C:\Users\GIS\.codex\PLANS.md`.

## Purpose / Big Picture

After this work, `Serouce/residualmap-bot` will be a public, template-safe GitHub repository instead of a private production-shaped checkout, and the primary maintainer will have submitted an honest Codex for Open Source application. A reader can verify the result by opening the repository without GitHub authentication, seeing placeholder Cloudflare values in `wrangler.toml`, running the repository checks successfully, and seeing the application confirmation page or receipt.

The work deliberately does not claim that ResidualMap is widely adopted. The application presents it as an early self-hosted open-source template and asks for support with security review, tests, documentation, release work, and maintainer automation.

## Progress

- [x] (2026-07-24 04:40Z) Confirmed the requested end state and created this ExecPlan.
- [x] (2026-07-24 04:40Z) Confirmed that the local branch is `main`, the worktree began clean, the remote is `Serouce/residualmap-bot`, and GitHub currently reports the repository as private.
- [x] (2026-07-24 04:40Z) Confirmed that `npm.cmd run check` passes with 58 tests while `npm.cmd run check:public` fails only for the concrete Worker URL and D1 database ID.
- [x] (2026-07-24 04:42Z) Created `codex/public-oss-cutover` and replaced the production Worker URL and D1 identifier with public placeholders.
- [x] (2026-07-24 04:42Z) Replaced stale private-repository blocker text with final verification gates without inventing users or adoption.
- [ ] Audit the current tree and all reachable Git history for credentials, personal Telegram IDs, private keys, and private environment files without printing any secret values. (Completed: no token, API key, private key, or private env file found; one personal Telegram ID was found in old `wrangler.toml` blobs. Remaining: rewrite and repeat the audit.)
- [ ] Run syntax checks, 58 or more tests, public-readiness checks, application-copy checks, and `git diff --check`.
- [ ] Commit the intended publication changes, push the branch, review the exact diff, and merge it into `main`.
- [ ] Change only `Serouce/residualmap-bot` from private to public and verify the repository from an unauthenticated view.
- [ ] Fill and submit the official Codex for Open Source form with the public repository URL and truthful prepared copy.
- [ ] Record the final commit, repository visibility, application confirmation, and any remaining limitations here.

## Surprises & Discoveries

- Observation: GitHub CLI is installed, but its saved token for `Serouce` is invalid.
  Evidence: `gh auth status` reported “The token in default is invalid.” The connected GitHub application still reports admin, maintain, push, and triage permissions for the exact repository, so connector-backed GitHub operations and a separately authenticated Git push remain possible alternatives.

- Observation: The repository already contains a substantial publication packet rather than needing a new OSS story.
  Evidence: `docs/APPLICATION_PACKET.md`, `docs/CODEX_FOR_OSS.md`, `docs/ADOPTION_SIGNALS.md`, `docs/PUBLISHING_CHECKLIST.md`, and `scripts/prepare-public-config.mjs` are present.

- Observation: The public-readiness failure is intentionally narrow.
  Evidence: `npm.cmd run check:public` currently reports only the concrete `workers.dev` Mini App URL and the concrete D1 `database_id`.

- Observation: The first history scan produced 40 path-level matches, but classification reduced them to two unique values.
  Evidence: `.dev.vars.example` contained only the known placeholder `123456789`; historical `wrangler.toml` blobs contained one distinct personal Telegram ID candidate. No OpenAI key, Telegram bot token, Cloudflare token, private-key marker, private environment file, or private backup path was found.

- Observation: `git filter-repo` is not installed in the current toolchain.
  Evidence: Git returned “'filter-repo' is not a git command.” A temporary isolated installation is preferable to the legacy `git filter-branch` for content replacement across 33 commits.

## Decision Log

- Decision: Publish the project as a self-hosted template, not as a hosted finance service.
  Rationale: Each operator supplies their own Telegram, Cloudflare, D1, and OpenAI configuration. This is both the existing architecture and the honest privacy-oriented OSS value.
  Date/Author: 2026-07-24 / Codex

- Decision: Do not wait for stars, forks, or independent deployments before applying.
  Rationale: The user explicitly prefers a low-cost honest attempt over building artificial adoption signals. The official application has no published minimum star threshold.
  Date/Author: 2026-07-24 / Codex

- Decision: Use the dedicated `codex/public-oss-cutover` branch and review its diff before merging.
  Rationale: The current `main` contains deployment-specific values. A branch provides an auditable safety boundary before repository visibility changes.
  Date/Author: 2026-07-24 / Codex

- Decision: Treat any credential-shaped value found in reachable Git history as a publication blocker.
  Rationale: Replacing a value only in the latest commit does not remove it from history after a private repository becomes public. Actual credentials require rotation and/or a deliberate history rewrite before publication.
  Date/Author: 2026-07-24 / Codex

- Decision: Rewrite the private repository history before publication, preserving it first in a verified local Git bundle.
  Rationale: A personal Telegram ID exists in historical `wrangler.toml` blobs. The same rewrite will replace the non-secret production Worker URL and D1 identifier so the entire public history is template-safe. The repository is still private, has one author in the reachable history, and has no public consumers, which makes this the lowest-risk time for the rewrite.
  Date/Author: 2026-07-24 / Codex

## Outcomes & Retrospective

Work is in progress. The repository remains private until the audit, merge, and unauthenticated verification are complete. The application has not yet been submitted.

## Context and Orientation

The repository is a JavaScript ES module project for Cloudflare Workers. `src/worker.js` handles the Telegram webhook, D1 database access, OpenAI parsing, and API routes. `src/mini-app.js`, `src/mini-app-client.js`, and `src/mini-app-styles.js` render the Telegram Mini App. `wrangler.toml` is the active Cloudflare configuration, while `wrangler.example.toml` already contains reusable placeholder values.

“Template-safe” means that the public branch contains only reusable example configuration: no production Worker hostname, D1 database identifier, Telegram user ID, bot token, webhook secret, OpenAI key, Cloudflare token, personal financial data, or private backup. `scripts/prepare-public-config.mjs` performs the two known non-secret identifier replacements. `scripts/public-readiness-check.mjs` checks the public file set and credential-shaped values in the current tree. Because GitHub exposes repository history when visibility becomes public, a separate history audit is required before the visibility change.

The prepared OpenAI application copy is in `docs/APPLICATION_PACKET.md`. The official form requires the GitHub profile and repository to be public, identifies the applicant as a primary or core maintainer, and limits the main narrative fields to 500 characters. The application must use `https://github.com/Serouce/residualmap-bot` and must not claim broad adoption.

## Plan of Work

Create `codex/public-oss-cutover` from the current `main`. Run the public-config script in dry-run mode and confirm that it names only `MINI_APP_URL` and `D1 database_id`; then apply it. Update `docs/APPLICATION_PACKET.md` and `docs/ADOPTION_SIGNALS.md` only where facts change from private/pre-public to public/submission-ready. Keep the language “early self-hosted OSS template” and do not claim adoption unless GitHub provides real public activity before submission.

Audit both the current checkout and all reachable Git objects. The audit reports only the path, commit or object identifier, and pattern category; it must never echo a matched secret. Check for committed `.dev.vars` or `.env` files, OpenAI key shapes, Telegram bot token shapes, Cloudflare token assignments, private-key markers, and numeric `ALLOWED_TELEGRAM_IDS`. If an actual credential or personal identifier is found in history, do not make the repository public. Record the finding and choose a recoverable rotation and history-rewrite path before proceeding. Concrete Worker and D1 identifiers are not authentication secrets, but their history exposure must be recorded and handled deliberately rather than overlooked.

After the tree is safe, run the full repository checks. Review `git diff`, stage only the publication files, commit, push, and open a GitHub pull request. Use the connected GitHub application for PR operations when possible because the local `gh` token is invalid. Merge only after the pushed commit has passed the local checks and the exact diff has been reviewed.

Once `origin/main` contains the safe tree, change the visibility of only `Serouce/residualmap-bot` to public. Verify the public repository URL without relying on the authenticated GitHub view. Then open the official Codex for Open Source application form, use the email associated with the current ChatGPT account, retrieve the current OpenAI organization ID through the authenticated OpenAI account if required, fill the prepared fields, and submit. Do not include secrets, production identifiers, or confidential information in the form.

## Concrete Steps

All commands run in:

    C:\Users\GIS\Documents\Codex\2026-04-30\1-codex-2-codex-3-codex\residualmap-bot

Create the branch and preview the cutover:

    git switch -c codex/public-oss-cutover
    npm.cmd run prepare:public-config

The preview must report only `MINI_APP_URL` and `D1 database_id`. Apply it:

    npm.cmd run prepare:public-config -- --apply

Run the project checks after the documentation and audit work:

    npm.cmd run check
    npm.cmd run check:public
    npm.cmd run check:application
    node --check src/worker.js
    git diff --check

Expected acceptance output includes 58 or more passing tests, “Public readiness check passed,” “Application packet check passed,” and no `git diff --check` output.

Before staging, inspect:

    git status --short --branch
    git diff --stat
    git diff

Stage only reviewed publication files, commit, push the branch, open and merge the publication pull request, and confirm that `origin/main` points to the reviewed commit. Change repository visibility only after that confirmation.

## Validation and Acceptance

The local acceptance gate is:

- `npm.cmd run check` exits zero with all tests passing.
- `npm.cmd run check:public` exits zero.
- `npm.cmd run check:application` exits zero and does not retain stale private-repository blocker warnings.
- The history audit reports no credential, personal Telegram ID, private key, or private environment-file findings.
- `git diff --check` exits zero.
- The reviewed publication diff contains placeholders in `wrangler.toml` and no unrelated application changes.

The GitHub acceptance gate is:

- The publication change is merged into `main`.
- GitHub reports `visibility: public` for repository ID `1226356766`, full name `Serouce/residualmap-bot`.
- An unauthenticated request to `https://github.com/Serouce/residualmap-bot` can see the README.
- The public default branch contains placeholder values and the expected MIT license.

The application acceptance gate is:

- The official OpenAI form contains the exact public repository URL and identifies the user as primary maintainer.
- The three narrative fields are at most 500 characters and retain early-stage wording.
- The API-credit use is limited to public-repository maintenance rather than processing private financial records.
- Submission reaches an explicit confirmation state or produces a receipt that can be recorded without exposing personal account details.

## Idempotence and Recovery

The dry-run config command and all check commands are safe to repeat. If the applied config needs to be retried before commit, rerun the same script; it recognizes already-safe placeholder values.

Before any Git history rewrite, create a local recovery bundle in a temporary directory and record its path in this plan. Do not force-push or delete the existing remote branch unless a history finding makes it necessary and the exact recovery path has been verified. If no credential-shaped history is found, no history rewrite is needed for authentication safety.

If pushing through the normal Git credential helper fails, do not paste tokens into commands or logs. Use the connected GitHub application for supported operations or complete an interactive GitHub authentication flow. If the OpenAI form requires account details that cannot be discovered from the authenticated session, stop at the filled form and request only the missing value rather than guessing.

Changing a repository from private to public is intentionally externally visible. Recovery is possible by returning it to private, but public clones and caches cannot be recalled. Therefore visibility changes happen only after all local and history gates pass.

## Artifacts and Notes

Initial verification:

    npm.cmd run check
    tests 58
    pass 58
    fail 0

Initial public gate:

    Public readiness check failed:
    - wrangler.toml contains a concrete workers.dev Mini App URL.
    - wrangler.toml contains a concrete D1 database_id.

Initial GitHub metadata:

    repository: Serouce/residualmap-bot
    repository id: 1226356766
    default branch: main
    visibility: private
    connected permissions: admin, maintain, push, triage

## Interfaces and Dependencies

No runtime dependency is added for the publication cutover. Node.js runs the existing validation and configuration scripts. Git manages the local branch and commit. The connected GitHub application is preferred for repository and pull-request operations; the normal Git credential helper may handle the branch push. Browser control is used only for UI operations that have no suitable connector or CLI coverage, especially the OpenAI application form and, if necessary, GitHub visibility settings.

Revision note (2026-07-24 04:40Z): Created the initial self-contained plan after the user authorized the complete safe-publication and application workflow.

Revision note (2026-07-24 04:42Z): Recorded the actual `codex/` branch name, the successful two-value config cutover, and neutral final-verification language in the application evidence files.

Revision note (2026-07-24 04:48Z): Recorded the classified historical Telegram ID finding and selected a recoverable, regex-based history rewrite after a verified Git bundle.

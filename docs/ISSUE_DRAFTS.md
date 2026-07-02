# First Public Issue Drafts

Use these drafts after the repository is public. They are written to show a clear maintainer roadmap without claiming adoption that does not exist yet.

Do not paste real Telegram IDs, Worker URLs, D1 database IDs, screenshots with real records, exported CSVs, or private logs into public issues.

## 1. Add Verified Synthetic PNG Screenshots and Demo Walkthrough

Title:

```text
[Docs]: Add verified synthetic screenshots and demo walkthrough
```

Labels:

```text
documentation, good first issue
```

Body:

```md
## Goal

Add public demo screenshots or a short walkthrough that shows ResidualMap without exposing real financial records or private deployment details.

## Scope

- Use only synthetic records from `docs/DEMO.md`.
- Cover Telegram chat, `/last`, `/month`, `/debts`, Mini App Overview, Records, and Debts.
- Add screenshots under `docs/assets/`.
- Update `README.md` and `docs/DEMO.md`.

## Safety Requirements

- No real Telegram IDs.
- No real names, merchants, addresses, or financial records.
- No Cloudflare account IDs, Worker logs, D1 IDs, or API keys.
- No production screenshots unless every private field is removed or replaced.

## Acceptance

- A new reader can understand what the bot and Mini App look like.
- The demo clearly says ResidualMap is self-hosted, not a hosted SaaS.
- `npm run check` still passes.
```

## 2. Add Optional Rate Limits for Shared Deployments

Title:

```text
[Feature]: Add optional rate limits for shared deployments
```

Labels:

```text
enhancement, security
```

Body:

```md
## Goal

Add optional rate limiting for operators who choose to run a shared deployment. The default self-hosted single-user setup should stay simple.

## Scope

- Protect `/telegram` from noisy or repeated messages.
- Protect Mini App API routes from accidental high-frequency requests.
- Keep the feature optional and documented.
- Avoid storing unnecessary personal data.

## Design Notes

Prefer a minimal implementation that works on Cloudflare Workers. If state is needed, document whether it uses D1, KV, Durable Objects, or another Cloudflare service.

## Acceptance

- The default private deployment continues to work without extra configuration.
- Rate-limit behavior is documented.
- Tests cover allowed and rate-limited cases.
```

## 3. Add User Data Deletion Workflow for Shared Deployments

Title:

```text
[Feature]: Document and implement user data deletion workflow
```

Labels:

```text
enhancement, privacy
```

Body:

```md
## Goal

Define a clear deletion workflow for operators who run ResidualMap for more than one user.

## Scope

- Document how an operator can delete one user's records from D1.
- Decide whether the first implementation should be docs-only or include an admin command.
- Preserve auditability where appropriate.
- Avoid accidental deletion of another user's data.

## Privacy Notes

ResidualMap is primarily self-hosted. This workflow is for operators who choose to run a shared deployment.

## Acceptance

- The docs explain when this is needed and when it is not.
- The workflow is scoped by `user_id` or Telegram identity.
- The release checklist mentions deletion workflow changes.
```

## 4. Expand Route-Level Undo/Delete/Restore Command Edge Cases

Title:

```text
[Test]: Expand route-level undo/delete/restore command edge cases
```

Labels:

```text
test, security
```

Body:

```md
## Goal

Expand route-level tests proving that Telegram undo, delete, and restore commands remain soft and user-scoped across edge cases.

## Scope

- Preserve existing `/undo`, `/delete`, and `/restore` route-level tests.
- Add not-found and invalid-ID edge cases where useful.
- Verify `status = 'deleted'` and `deleted_at` are used instead of hard deletion.
- Verify `audit_log` receives the expected action.
- Verify one user cannot delete or restore another user's transaction.

## Acceptance

- Tests fail if a hard delete is introduced accidentally.
- Tests fail if `user_id` scoping is removed.
- Existing route-level `/undo`, `/delete`, and `/restore` tests remain in place.
- Existing helper-level soft-delete/restore tests remain in place.
- `npm run check` passes.
```

## 5. Expand Route-Level CSV Export Regression Tests

Title:

```text
[Test]: Expand route-level CSV export regression tests
```

Labels:

```text
test, privacy
```

Body:

```md
## Goal

Expand route-level tests for `/export` so operators can trust exports without leaking deleted records or another user's data.

## Scope

- Preserve the existing route-level test that verifies exports include only the authenticated user's active records.
- Verify CSV cells remain escaped safely.
- Verify the export filename does not include private user data.
- Add edge cases for empty exports and formula-prefixed cell values.
- Use synthetic rows only.

## Acceptance

- Existing CSV cell escaping tests remain in place.
- Existing route-level export scoping test remains in place.
- Deleted records are excluded unless a future feature explicitly changes that behavior.
- `npm run check` passes.
```

## 6. Add Telegram Command Output Snapshot Tests

Title:

```text
[Test]: Add Telegram command output snapshot tests for common flows
```

Labels:

```text
test, good first issue
```

Body:

```md
## Goal

Add focused tests for common Telegram command responses so future changes do not accidentally break user-facing text, HTML escaping, or command behavior.

## Scope

- Cover `/help`, `/settings`, `/last`, `/month`, and unknown commands where practical.
- Prefer deterministic helper-level tests over full Telegram network calls.
- Use synthetic data only.

## Acceptance

- Tests cover at least one response with user-controlled text.
- Telegram HTML output remains escaped.
- `npm run check` passes.
```

## 7. Add Staging Restore Smoke-Test Examples for D1 Backups

Title:

```text
[Docs]: Add staging restore smoke-test examples for D1 backups
```

Labels:

```text
documentation, safety
```

Body:

```md
## Goal

Improve `docs/BACKUP_RESTORE.md` with a concrete staging restore smoke test that operators can follow before touching production D1 data.

## Scope

- Use a throwaway D1 database name.
- Use synthetic records only.
- Include table-count verification examples.
- Include Telegram smoke-test steps.

## Acceptance

- A self-hoster can test a restore without using production screenshots or records.
- The guide makes destructive production restore actions clearly separate from staging verification.
```

## 8. Add GitHub Discussions Templates for Self-Hosting Support

Title:

```text
[Docs]: Add GitHub Discussions templates for self-hosting support
```

Labels:

```text
documentation, community
```

Body:

```md
## Goal

Prepare discussion prompts for self-hosting help, deployment reports, and feature ideas without encouraging users to post private data.

## Scope

- Add suggested GitHub Discussions categories or starter prompts.
- Include a safety reminder for secrets, Telegram IDs, Worker URLs, D1 IDs, logs, and real transaction text.
- Link to `SUPPORT.md`, `SECURITY.md`, `PRIVACY.md`, `docs/DEPLOYMENT.md`, and `docs/DEMO.md`.

## Acceptance

- New users know where to ask setup questions.
- Public support prompts clearly discourage sharing private finance data.
```

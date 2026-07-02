## Summary

Describe the user-visible change and why it matters for a self-hosted ResidualMap operator.

## Type of change

- [ ] Documentation
- [ ] Telegram webhook or commands
- [ ] Mini App UI or API
- [ ] D1 schema or queries
- [ ] OpenAI parsing or analytics
- [ ] Security or privacy
- [ ] Maintenance or tests

## Safety checklist

- [ ] I did not commit `.dev.vars`, secrets, real Telegram IDs, financial records, CSV exports, or private logs.
- [ ] User-controlled values sent with Telegram HTML are escaped.
- [ ] User-controlled SQL values use prepared D1 statements with `.bind()`.
- [ ] Mini App data access still validates Telegram `initData`.
- [ ] Transaction queries remain scoped to the authenticated `user_id`.
- [ ] Deletes remain soft deletes with `audit_log` entries.

## Validation

- [ ] `npm run check` passes.
- [ ] `git diff --check` passes.
- [ ] Documentation was updated when setup, routes, secrets, commands, schema, or data flow changed.

## Notes for reviewers

Call out any security-sensitive routes, migrations, or privacy tradeoffs that deserve extra review.

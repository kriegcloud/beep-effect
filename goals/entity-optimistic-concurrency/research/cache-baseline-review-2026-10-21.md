# Cache baseline review — 2026-10-21 (repo-cli test inputs)

Drifted task: `@beep/repo-cli#test` (subject `@beep/repo-cli`). Configuration-source drift:
`packages/tooling/tool/cli/turbo.json`, which the root subject `//` reviews as a
configuration source; no root task or root input changes.

Input change: `packages/tooling/tool/cli/turbo.json` adds
`$TURBO_ROOT$/packages/_internal/db-admin/drizzle/**` to the `test` task's
`inputs`. Nothing else changes: task name, command, outputs, cache flag,
`test:property`, and the root `turbo.json` are untouched. No qualification is
granted, no exception row is added.

Reason: `test/architecture-operation-plan.test.ts` regenerates every
manifest-included architecture proof file, including the db-admin drizzle
migrations, and compares them to the repo. The `test` cache key did not cover
`packages/_internal/db-admin/drizzle/**`, so after #1941 added migration
`20261021041032_row_version_default` the hosted Test Unit lane replayed a stale
green (`cache hit, replaying logs`) while every uncached run failed with ENOENT.
With the input declared, a migration change invalidates the cached result.

Re-request 2026-10-22 (S43 batch remediation, `fix/s43-batch-main-reds`): the original request's
`previous` no longer matched main after later baseline registrations, so the cherry-pick kept main's
`standards/cache-qualification-baseline.json` and the request is re-submitted with `previous` set to the
SHA-256 of main's current baseline text. `bun run beep cache audit` on the batch branch reports the same
single drift: BLOCK `@beep/repo-cli#test`, REVIEW `packages/tooling/tool/cli/turbo.json`.

Review round 1 on #2040 (2026-10-22): `drizzle/**` alone left the same stale-green hazard, because
`architecture-operation-plan.test.ts` compares every manifest-included file under
`packages/architecture-lab/*`, `apps/architecture-lab-proof` and `packages/_internal/db-admin`. @beep/repo-cli
depends on none of them, and the root `test` task only `dependsOn` `^transit`. The `test` inputs now
cover those three roots as `**`, with scoped exclusions for the generated segments the test itself skips
(`dist`, `docs`, `.turbo`, `node_modules`). `db-admin/**` subsumes the earlier `drizzle/**` line. A turbo
dry run lists the architecture-lab, proof-app and db-admin `src` and `drizzle` files among the task inputs,
and no `dist`, `node_modules` or `docs` paths. The drift is still the single subject
`@beep/repo-cli#test`. Command, outputs and cache flags are unchanged, and no qualification is granted.

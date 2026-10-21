# Opportunities

## 2026-10-20 — A blind overwrite looked like a correct update in every test

- Work: inventory every entity UPDATE path before adding the version guard.
- Evidence: `SyncItem.repo.ts` `update` ran `.set(insert).where(eq(id))` and
  `ProviderInstance.repo.ts` wrote `rowVersion + 1` with no `row_version`
  predicate. Each adapter's suite passed because no test held two copies of one
  row. `ProviderInstanceUseCases.probe` reverted a configuration update that
  landed during the CLI probe.
- Prevention: the shared stale-write contract
  (`packages/documents/server/test/SyncRepositoryVersioning.contract.ts`) runs
  against both adapters; a new repository adds its scenario there or alongside.
- Disposition: fixed in this packet (SPEC D1, D2, D2b).

## 2026-10-20 — PGlite cannot interleave a read-modify-write race

- Work: prove `markReviewed` and the replacing `upsert` reject a write that
  lost a race.
- Evidence: two fibers through `Effect.all(..., { concurrency: "unbounded" })`
  on one PGlite session ran each read and write back to back; both succeeded
  (versions 3 and 4), so the test proved nothing.
- Prevention: `packages/documents/server/test/CompetingWrite.ts` decorates the
  `PgClient` so the next UPDATE on a table first commits a competing
  `row_version` bump. A mutation check (guard removed) turns the test red. A
  shared test-kit helper would let other slices reuse it.
- Disposition: local helper here; promotion to `@beep/test-utils` waits on a
  second consumer.

## 2026-10-20 — effect-drizzle README assembly drifts on main

- Work: refresh the README after editing `version()` JSDoc.
- Evidence: `bun run --cwd packages/ecosystem/effect-drizzle readme` rewrote
  535 lines (removed constants, shifted every `[Source]` line anchor) and did
  not include the edited JSDoc, so the committed README is already stale on
  main and the assembler reads built output, not source.
- Prevention: a freshness check for the assembled README, run after a build.
- Disposition: not fixed here (unrelated churn); README left unchanged.

## 2026-10-20 — Fresh worktree type errors pointed at stale dists

- Work: first typecheck of `@beep/shared-domain` after the schema change.
- Evidence: `tsc-rs -p tsconfig.check.json` reported errors in untouched files
  (`EntityRef.errors.ts`: `alwaysEquivalent` missing on
  `@beep/schema` `dist/`) until `turbo run build --filter='@beep/shared-domain^...'`.
- Prevention: known (`fresh-lane-tsc-measure-needs-dep-dists`); package-verify
  builds upstreams first, so use it for the first measurement.
- Disposition: environment-only.

## 2026-10-21 — Schema-catalog drift surfaced only in hosted Repo Sanity

- Work: first hosted run of #1941 after a green local cheap-gates publish.
- Evidence: Repo Sanity failed `lint:schema-catalog`:
  `stale standards/schema-catalog/@beep/agents-use-cases.generated.jsonc` and
  `.../@beep/documents-use-cases.generated.jsonc` (the five new
  `*VersionConflict` error schemas). Local cheap-gates ran the observability
  catalog check but not the schema-catalog check.
- Prevention: add `lint:schema-catalog` to the cheap-gates tier, or run
  `bun run beep lint schema-catalog --write` whenever a PR adds an exported
  schema.
- Disposition: shards regenerated in the fix wave (5 added entries).

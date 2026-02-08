# P8 Repository Law Remediation Report

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-08  
**Objective**: Remediate `Storage.ts` repo-law violations and wire enforcement so regressions fail fast.

## Incident Summary

`packages/knowledge/server/src/Service/Storage.ts` was authored in a prior session in a way that violated multiple repository laws:

- Promise-first IO instead of Effect
- Node fs/path usage instead of `@effect/platform` services
- Unsafe assertions (`as unknown as`) and weak schemas
- Native `Date`, `Map`, and ad-hoc JSON encode/decode

This report captures the concrete remediation and enforcement changes implemented to prevent recurrence.

## Code Remediation

### Storage Service Rewrite

Updated:

- `packages/knowledge/server/src/Service/Storage.ts`

Key changes:

- Uses `@effect/platform` `FileSystem` + `Path` for filesystem and path operations.
- Models IO as `Effect` and scopes resources (not promise-first).
- Uses `Effect.fn("StableName")` for reusable effectful boundaries.
- Uses `Option`, `HashMap`, `Match`, `effect/Array`, `effect/String` utilities (no native string/array methods in the hot paths).
- Uses `effect/DateTime` for persisted timestamp semantics.
- SQLite backend implemented via `@effect/sql` + `SqlSchema` + `@effect/sql-sqlite-bun` (no promise-based ORM in this module).
- Optimistic concurrency conflicts now explicitly fail via `Effect.fail(new StorageGenerationConflictError(...))`.

### Durable EventBus Correctness Fix

Updated:

- `packages/knowledge/server/src/Service/EventBus.ts`

Fix:

- Durable `decodeEnvelope` no longer ends with an unconditional `Effect.as(O.none())` that caused every journal entry to be dropped, leading to a durable publish/subscribe test timeout.

## Guardrails and Enforcement

### Rules Are No Longer Manual-Only

Updated:

- `.claude/rules/effect-patterns.md`
- `.cursor/rules/effect-patterns.mdc`

Change:

- Enabled always-on application across TypeScript sources via rule frontmatter (`trigger: always` / `alwaysApply: true`) plus `globs`.

### Remove Misleading Examples

Updated:

- `.claude/rules/code-standards.md`
- `.cursor/rules/code-standards.mdc`

Change:

- Removed example snippets that used `JSON.parse(...) as Type` and raw `JSON.parse` parsing patterns. Replaced with Schema-first parsing via `S.decode(S.parseJson(...))`.

### Pre-Commit Scoped Checks

Updated:

- `.husky/pre-commit`

Change:

- When `packages/knowledge/server/src/**` files are staged, run:
  - `bun run verify:patterns --filter @beep/knowledge-server --severity critical`
- When `packages/knowledge/domain/src/**` files are staged, run:
  - `bun run verify:entityids`

### CI Enforcement

Added:

- `.github/workflows/repo-law.yml`

Runs:

- `bun run agents:validate:strict`
- `bun run verify:patterns:ci`
- `bun run verify:entityids`

## Verification Evidence

Executed locally:

```bash
bun test packages/knowledge/server/test/Service/
bun test packages/knowledge/server/test/Service/Storage.test.ts
bun test packages/knowledge/server/test/Service/StorageLocal.test.ts
bun test packages/knowledge/server/test/Service/StorageSql.test.ts
```

Observed results:

- `bun test packages/knowledge/server/test/Service/`: PASS (`35 pass, 0 fail`) (2026-02-08)
- Storage tests: PASS (2026-02-08)

## Residual Risk / Follow-Ups

- Pre-commit enforcement is intentionally scoped to knowledge slice for speed. If you want repo-wide enforcement, broaden the staged-file detection and/or add a dedicated `verify` pipeline target.

# Phase 8 Handoff: Repository Law Remediation

**Date**: 2026-02-08  
**From**: Phase 7 parity closure (capability acceleration)  
**To**: Phase 8 (repo-law remediation + enforcement wiring)  
**Status**: In progress (implementation + guardrails updated)

## Why Phase 8 Exists

`packages/knowledge/server/src/Service/Storage.ts` regressed into non-Effect, promise-first, weakly-typed patterns in a previous session (pre-compaction). This phase exists to:

- restore repo-law compliance for the storage module (and related durable components), and
- harden enforcement so the next regression is caught immediately.

## Work Completed In This Phase

### Code Remediation

- Rewrote `packages/knowledge/server/src/Service/Storage.ts` to use:
  - `@effect/platform` `FileSystem` + `Path`
  - `Effect.fn` boundaries
  - `Option`, `HashMap`, `Match`, `Array`, `String`, `DateTime`
  - `@effect/sql` + `SqlSchema` + `@effect/sql-sqlite-bun`
  - Schema JSON encoding/decoding (`S.parseJson`, `S.encode`, `S.decode*`) where applicable
- Fixed a durable EventBus correctness issue:
  - `packages/knowledge/server/src/Service/EventBus.ts` decoder no longer drops every journal entry (previously ended with an unconditional `Effect.as(O.none())`).

### Guardrails / Enforcement

- `.claude/rules/effect-patterns.md`: moved from manual to always-on with globs targeting TS sources.
- `.cursor/rules/effect-patterns.mdc`: enabled `alwaysApply` + globs for TS sources.
- `.claude/rules/code-standards.md` and `.cursor/rules/code-standards.mdc`: removed JSON.parse + casting “examples” that could be copied into production code.
- `.husky/pre-commit`: added scoped `verify:patterns` (knowledge-server) and `verify:entityids` checks when relevant sources are staged.
- `.github/workflows/repo-law.yml`: added CI job to run `agents:validate:strict`, `verify:patterns:ci`, and `verify:entityids`.
- `.codex/patterns/README.md`: corrected `.claude/patterns` path references to `.codex/patterns`.

## Verification Snapshot

- `bun test packages/knowledge/server/test/Service/` now passes (`35 pass, 0 fail`) after EventBus durable decoder fix.
- Storage-focused tests pass:
  - `packages/knowledge/server/test/Service/Storage.test.ts`
  - `packages/knowledge/server/test/Service/StorageLocal.test.ts`
  - `packages/knowledge/server/test/Service/StorageSql.test.ts`

## Remaining Follow-Ups (If Needed)

- Decide whether to broaden pre-commit enforcement beyond knowledge slice (currently scoped for speed).
- Optionally add a “verify” step into `check:all` if you want repo-law checks to be the default locally.

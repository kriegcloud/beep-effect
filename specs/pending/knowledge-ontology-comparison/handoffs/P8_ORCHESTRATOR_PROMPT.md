# Phase 8 Orchestrator Prompt: Repository Law Remediation

You are implementing **Phase 8: Repository Law Remediation** for `knowledge-ontology-comparison`.

## Goal

Prevent recurrence of the `packages/knowledge/server/src/Service/Storage.ts` regression by:

1. fixing remaining repo-law violations in the knowledge storage surface, and
2. wiring enforcement so violations fail fast (rules + pre-commit + CI), with test evidence.

## Scope

- `packages/knowledge/server/src/Service/Storage.ts`
- `packages/knowledge/server/src/Service/EventBus.ts` (durable path correctness)
- Guardrails:
  - `.claude/rules/*`
  - `.cursor/rules/*`
  - `.husky/pre-commit`
  - `.github/workflows/*`
  - `tooling/cli/src/commands/verify/*`

## Repository Law Checklist

- No `node:fs`, `fs/promises`, `node:path` in application services (use `@effect/platform` FileSystem/Path).
- No Promise-first IO; model IO as `Effect` and scope resources (`Effect.scoped`).
- Prefer `Effect.fn("StableName")` for exported/reusable effectful helpers.
- Prefer `effect/DateTime` for timestamps in persisted/contract surfaces.
- Prefer `S.Class` / `S.TaggedError` constructors for boundary models and errors.
- Prefer `Option` over nullish for absence, `HashMap` over `Map`, Effect `Array`/`String` utilities over native methods.
- Prefer `Match.*` utilities for discriminated unions.
- Avoid `as unknown as`, `as any`, and unchecked assertions.
- Prefer Schema-based JSON parse/encode (`S.parseJson`) over `JSON.parse`/`JSON.stringify` in application code.

## Required Outputs

- `specs/pending/knowledge-ontology-comparison/outputs/P8_REPOSITORY_LAW_REMEDIATION_REPORT.md`
- Update `specs/pending/knowledge-ontology-comparison/REFLECTION_LOG.md` with the incident postmortem + enforcement changes.

## Verification

Run and record results:

```bash
bun run verify:patterns --filter @beep/knowledge-server --severity critical
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Service/Storage.test.ts
bun test packages/knowledge/server/test/Service/StorageLocal.test.ts
bun test packages/knowledge/server/test/Service/StorageSql.test.ts
bun test packages/knowledge/server/test/Service/EventBus.test.ts
```

## Success Criteria

- Storage surface follows repo Effect patterns without unsafe assertions.
- Durable EventBus test is deterministic (no timeouts) and reflects real behavior.
- Guardrails are not manual-only: `.claude`/`.cursor` rules apply across TypeScript sources.
- Violations fail pre-commit (scoped) and CI (repo-wide).

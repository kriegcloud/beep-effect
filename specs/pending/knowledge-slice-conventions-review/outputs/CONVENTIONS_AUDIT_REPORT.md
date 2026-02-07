# Conventions Audit Report

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Summary

- Findings: `5` (P1: 2, P2: 2, P3: 1)
- Fixes applied: domain import normalization; server RPM limiter concurrency fix + regression test; server cast removal; server lint cleanup
- Remaining follow-ups: schema-class candidates tracked in `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md` (Phase 2)

## Findings (Prioritized)

| Priority | Area | Finding | Fix | Evidence (Code/Test/Command/Result) | Owner | Target Date |
|---|---|---|---|---|---|---|
| P1 | imports | `@beep/knowledge-domain/...` subpath import included a `.ts` extension (inconsistent and can mis-resolve under `exports` patterns). | Drop the `.ts` extension. | `packages/knowledge/domain/test/_shared/TestLayers.ts:1` + `bun run --cwd packages/knowledge/domain test` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P2 | imports | `Split.service.ts` used a relative import for an exported error type; other services use the package alias. | Switch to `@beep/knowledge-domain/errors/...` import. | `packages/knowledge/domain/src/services/Split.service.ts:3` + `bun run --cwd packages/knowledge/domain check` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P1 | correctness | `EmbeddingRateLimiter.acquire` could exceed RPM under concurrency due to non-atomic check/increment ordering. | Enforce RPM atomically with `Ref.modify` after taking the concurrency permit; release permit on failure; add regression test. | `packages/knowledge/server/src/EmbeddingRateLimiter.ts:126` + `packages/knowledge/server/test/EmbeddingRateLimiter.test.ts:14` + `bun run --cwd packages/knowledge/server test` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P2 | types | Unnecessary unchecked cast (`as ParseResult`) in `SparqlParser.parse`. | Remove the cast. | `packages/knowledge/server/src/Sparql/SparqlParser.ts:180` + `bun run --cwd packages/knowledge/server check` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P3 | lint | Biome `useTemplate` lint failure in `ContentEnrichmentAgent`. | Replace string concatenation with template literal. | `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts:79` + `bun run --cwd packages/knowledge/server lint` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |

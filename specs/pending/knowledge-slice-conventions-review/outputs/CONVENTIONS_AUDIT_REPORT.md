# Conventions Audit Report

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Summary

- Findings: `5` (P1: 2, P2: 2, P3: 1)
- Fixes applied (Phase 1): domain import normalization; server RPM limiter concurrency fix + regression test; server cast removal; server lint cleanup
- Fixes applied (Phase 2): completed `S.Class` conversions for `WorkflowExecutionRecord` and `ExtractedEmailDocument` (including boundary decode + tests)
- Remaining follow-ups: Phase 3 synthesis write-up (no remaining schema-class candidates)

## Findings (Prioritized)

| Priority | Area | Finding | Fix | Evidence (Code/Test/Command/Result) | Owner | Target Date |
|---|---|---|---|---|---|---|
| P1 | imports | `@beep/knowledge-domain/...` subpath import included a `.ts` extension (inconsistent and can mis-resolve under `exports` patterns). | Drop the `.ts` extension. | `packages/knowledge/domain/test/_shared/TestLayers.ts:1` + `bun run --cwd packages/knowledge/domain test` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P2 | imports | `Split.service.ts` used a relative import for an exported error type; other services use the package alias. | Switch to `@beep/knowledge-domain/errors/...` import. | `packages/knowledge/domain/src/services/Split.service.ts:3` + `bun run --cwd packages/knowledge/domain check` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P1 | correctness | `EmbeddingRateLimiter.acquire` could exceed RPM under concurrency due to non-atomic check/increment ordering. | Enforce RPM atomically with `Ref.modify` after taking the concurrency permit; release permit on failure; add regression test. | `packages/knowledge/server/src/EmbeddingRateLimiter.ts:126` + `packages/knowledge/server/test/EmbeddingRateLimiter.test.ts:14` + `bun run --cwd packages/knowledge/server test` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P2 | types | Unnecessary unchecked cast (`as ParseResult`) in `SparqlParser.parse`. | Remove the cast. | `packages/knowledge/server/src/Sparql/SparqlParser.ts:180` + `bun run --cwd packages/knowledge/server check` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P3 | lint | Biome `useTemplate` lint failure in `ContentEnrichmentAgent`. | Replace string concatenation with template literal. | `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts:79` + `bun run --cwd packages/knowledge/server lint` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |

## Phase 2 Fixes (Cross-Cut)

| Priority | Area | Fix | Evidence (Code/Test/Command/Result) | Owner | Date |
|---|---|---|---|---|---|
| P2 | schema | Converted `WorkflowExecutionRecord` from `interface` to `S.Class` and added DB-row boundary decode via `decodeWorkflowExecutionRecord`. | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` + `packages/knowledge/server/test/Workflow/WorkflowPersistence.schema.test.ts` + `bun run --cwd packages/knowledge/server test` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |
| P2 | schema | Converted `EmailMetadata` + `ExtractedEmailDocument` to `S.Class` and decoded adapter output before returning to callers. | `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` + `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` + `bun run --cwd packages/knowledge/server test` + PASS (2026-02-07) | `knowledge` | 2026-02-07 |

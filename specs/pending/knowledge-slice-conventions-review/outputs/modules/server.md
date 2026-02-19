# Module

- Path: `packages/knowledge/server`
- Owner surfaces (public exports): `src/index.ts` (`Ai`, `Adapters`, `db`, `Embedding`, `EntityResolution`, `Extraction`, `GraphRAG`, `Grounding`, `Nlp`, `Ontology`, `Rdf`, `Reasoning`, `Runtime`, `Rpc`, `Service`, `Sparql`, `Validation`)
- Internal-only surfaces: `src/**` that are not re-exported via `src/index.ts` (some subpaths are still reachable via `@beep/knowledge-server/*` package exports)

## Findings (Prioritized)

| Priority | Area | Finding | Fix | Evidence Links (Code/Test) | Verification (Command + Result + Date) |
|---|---|---|---|---|---|
| P1 | correctness/concurrency | `EmbeddingRateLimiter.acquire` could exceed `requestsPerMinute` under concurrency because the “check” and “increment” were not atomic and happened before semaphore gating. | Make RPM enforcement atomic with `Ref.modify` after acquiring the concurrency permit; release the permit when failing. Added a regression test that would flake/fail under the old logic. | `packages/knowledge/server/src/EmbeddingRateLimiter.ts:126`, `packages/knowledge/server/test/EmbeddingRateLimiter.test.ts:14` | `bun run --cwd packages/knowledge/server test` + PASS (2026-02-07) |
| P2 | conventions/types | Unnecessary unchecked cast in `SparqlParser.parse` (`as ParseResult`). | Remove the cast; the object already satisfies the interface. | `packages/knowledge/server/src/Sparql/SparqlParser.ts:180` | `bun run --cwd packages/knowledge/server check` + PASS (2026-02-07) |
| P3 | conventions/style | Biome lint flagged string concatenation in prompt construction. | Use a template literal. | `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts:79` | `bun run --cwd packages/knowledge/server lint` + PASS (2026-02-07) |

## Interface -> S.Class Candidates

Potential Phase 2 candidates (not converted in this pass):

| File | Symbol | Current | Proposed | Boundary | Notes |
|---|---|---|---|---|---|
| `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | `WorkflowExecutionRecord` | `interface` | `S.Class` | persist | Would enable decode/validation of DB rows + consistent JSONB encoding. |
| `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` | `ExtractedEmailDocument` | `interface` | `S.Class` | parse/rpc | Would harden external API ingestion payloads and reduce unchecked assumptions. |

## Fixes Applied

- `packages/knowledge/server/src/EmbeddingRateLimiter.ts`: atomic RPM enforcement under concurrency + permit release on failure.
- `packages/knowledge/server/test/EmbeddingRateLimiter.test.ts`: new regression test for concurrent RPM enforcement.
- `packages/knowledge/server/src/Sparql/SparqlParser.ts`: removed unnecessary `as ParseResult` cast.
- `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`: template literal for prompt truncation.

## Verification Run For This Module

```bash
bun run --cwd packages/knowledge/server check
bun run --cwd packages/knowledge/server lint
bun run --cwd packages/knowledge/server test

rg -n '\\bany\\b|@ts-ignore|as unknown as|\\bas any\\b' packages/knowledge/server/src packages/knowledge/server/test
```

Results:

- `bun run --cwd packages/knowledge/server check`: `PASS` (2026-02-07)
- `bun run --cwd packages/knowledge/server lint`: `PASS` (2026-02-07)
- `bun run --cwd packages/knowledge/server test`: `PASS` (2026-02-07)
- `rg ...`: `PASS` (matches are allowlisted prompt/test text) (2026-02-07)


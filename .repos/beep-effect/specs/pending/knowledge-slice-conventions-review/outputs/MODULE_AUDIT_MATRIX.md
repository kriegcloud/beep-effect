# Module Audit Matrix

> Filled incrementally as the orchestrator steps through modules and applies fixes.

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Modules

| Module | Status | Key Fixes | Evidence Links (Code/Test) | Verification (Command + Result + Date) |
|---|---|---|---|---|
| `packages/knowledge/domain` | `DONE` | Import normalization (`.ts` extension + internal relative import) | `packages/knowledge/domain/test/_shared/TestLayers.ts:1`, `packages/knowledge/domain/src/services/Split.service.ts:3` | `bun run --cwd packages/knowledge/domain check`: PASS (2026-02-07); `bun run --cwd packages/knowledge/domain lint`: PASS (2026-02-07); `bun run --cwd packages/knowledge/domain test`: PASS (2026-02-07); `rg ...`: PASS (2026-02-07) |
| `packages/knowledge/tables` | `DONE` | No changes required | `n/a` | `bun run --cwd packages/knowledge/tables check`: PASS (2026-02-07); `bun run --cwd packages/knowledge/tables lint`: PASS (2026-02-07); `bun run --cwd packages/knowledge/tables test`: PASS (2026-02-07); `rg ...`: PASS (2026-02-07) |
| `packages/knowledge/server` | `DONE` | Fix RPM limiter concurrency race; remove unchecked cast; lint cleanup | `packages/knowledge/server/src/EmbeddingRateLimiter.ts:126`, `packages/knowledge/server/test/EmbeddingRateLimiter.test.ts:14`, `packages/knowledge/server/src/Sparql/SparqlParser.ts:180` | `bun run --cwd packages/knowledge/server check`: PASS (2026-02-07); `bun run --cwd packages/knowledge/server lint`: PASS (2026-02-07); `bun run --cwd packages/knowledge/server test`: PASS (2026-02-07); `rg ...`: PASS (2026-02-07) |
| `packages/knowledge/client` | `DONE` | No changes required (scaffold) | `n/a` | `bun run --cwd packages/knowledge/client check`: PASS (2026-02-07); `bun run --cwd packages/knowledge/client lint`: PASS (2026-02-07); `bun run --cwd packages/knowledge/client test`: PASS (2026-02-07); `rg ...`: PASS (2026-02-07) |
| `packages/knowledge/ui` | `DONE` | No changes required (scaffold) | `n/a` | `bun run --cwd packages/knowledge/ui check`: PASS (2026-02-07); `bun run --cwd packages/knowledge/ui lint`: PASS (2026-02-07); `bun run --cwd packages/knowledge/ui test`: PASS (2026-02-07); `rg ...`: PASS (2026-02-07) |

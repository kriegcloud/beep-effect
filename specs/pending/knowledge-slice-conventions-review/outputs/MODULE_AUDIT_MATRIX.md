# Module Audit Matrix

> Filled incrementally as the orchestrator steps through modules and applies fixes.

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Modules

| Module | Status | Key Fixes | Evidence Links (Code/Test) | Verification (Command + Result + Date) |
|---|---|---|---|---|
| `packages/knowledge/domain` | `DONE` | Import normalization (`.ts` extension + internal relative import) | `packages/knowledge/domain/test/_shared/TestLayers.ts:1`, `packages/knowledge/domain/src/services/Split.service.ts:3` | `bun run --cwd packages/knowledge/domain check`: PASS (2026-02-07); `bun run --cwd packages/knowledge/domain lint`: PASS (2026-02-07); `bun run --cwd packages/knowledge/domain test`: PASS (2026-02-07); `rg ...`: PASS (2026-02-07) |
| `packages/knowledge/tables` | `DONE` | No changes required | `n/a` | `bun run --cwd packages/knowledge/tables check`: PASS (2026-02-07); `bun run --cwd packages/knowledge/tables lint`: PASS (2026-02-07); `bun run --cwd packages/knowledge/tables test`: PASS (2026-02-07); `rg ...`: PASS (2026-02-07) |
| `packages/knowledge/server` | `PENDING` | `___` | `___` | `___` |
| `packages/knowledge/client` | `PENDING` | `___` | `___` | `___` |
| `packages/knowledge/ui` | `PENDING` | `___` | `___` | `___` |

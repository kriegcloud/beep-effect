# Quick Start: Knowledge Completion

> 5-minute triage guide for completing the knowledge graph integration.

---

## TL;DR

The `packages/knowledge/*` slice is 57% complete. The main blocker is a custom `AiService` that should use `@effect/ai` instead.

**Priority Order:**
1. Refactor to `@effect/ai` (Phase 4)
2. Add tests (Phase 5)
3. Implement GraphRAG (Phase 6)

---

## Current Status Check

```bash
# Check what exists
ls packages/knowledge/*/src/

# Check for type errors
bun run check --filter @beep/knowledge-server

# Check test status
bun run test --filter @beep/knowledge-server
```

---

## The Problem

Current implementation:
```typescript
// packages/knowledge/server/src/Ai/AiService.ts
export interface AiService {
  readonly generateObject: <A, I>(schema, prompt, config?) => Effect<...>
}
```

Should be:
```typescript
// Using @effect/ai
import { LanguageModel } from "@effect/ai"
const llm = yield* LanguageModel.LanguageModel
yield* llm.generateObject({ prompt: Prompt.make(...), schema, objectName })
```

---

## Reference Implementation

See `tmp/effect-ontology/packages/@core-v2/src/Service/Extraction.ts` for the correct pattern.

Key files:
- `Service/Extraction.ts` - Uses `LanguageModel.LanguageModel`
- `Service/LlmWithRetry.ts` - Retry wrapper pattern
- `Runtime/ProductionRuntime.ts` - Provider Layer composition

---

## Phase 1: Start Here

Read the handoff document:
```
specs/knowledge-completion/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

Or copy-paste the prompt directly to start Phase 1 (Discovery & Research).

---

## Quick Verification

After each phase:
```bash
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

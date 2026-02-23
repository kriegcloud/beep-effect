# Phase 1 Orchestrator Prompt

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

Copy-paste this prompt to start Phase 1 implementation.

---

## Context

This is the initial phase of the Knowledge Graph POC Demo. We are building a demo page in the todox app that showcases knowledge graph extraction capabilities. The knowledge graph services (`ExtractionPipeline`, `GraphRAGService`, etc.) are already implemented in `packages/knowledge/*`.

**Full Context:** `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P1.md`

---

## Your Mission

Create the basic extraction UI with these deliverables:

1. **Page Route** - Create `/knowledge-demo` page in todox app
2. **EmailInputPanel** - Textarea with sample email dropdown selector
3. **Server Action** - `extractFromText` calling `ExtractionPipeline`
4. **EntityCardList** - Display extracted entities in card grid
5. **Loading/Error States** - Handle async states properly

---

## Phase Tasks

| Task | Agent | Priority |
|------|-------|----------|
| Create page route structure | Orchestrator | P0 |
| Create EmailInputPanel component | Orchestrator | P0 |
| Create sample-emails.ts data file | Orchestrator | P0 |
| Create server action (mock or real) | Orchestrator | P0 |
| Create EntityCardList component | Orchestrator | P0 |
| Wire up loading/error states | Orchestrator | P1 |
| Verify type checks pass | Orchestrator | P1 |

---

## Critical Patterns

**Effect Service Access:**
```typescript
import { ExtractionPipeline } from "@beep/knowledge-server/Extraction";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const pipeline = yield* ExtractionPipeline;
  return yield* pipeline.run(text, ontologyContent, config);
});

return Effect.runPromise(program.pipe(Effect.provide(/* layers */)));
```

**Namespace Imports:**
```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as O from "effect/Option";
```

---

## Success Criteria

- [ ] Page renders at `/knowledge-demo`
- [ ] Can select from 5 sample emails via dropdown
- [ ] "Extract" button triggers extraction (may use mock for now)
- [ ] Extracted entities display in card format
- [ ] Loading state shows during extraction
- [ ] Error state displays on failure

---

## Verification

After each step:
```bash
bun run check --filter @beep/todox
```

Test manually:
```bash
bun run dev
# Navigate to http://localhost:3000/knowledge-demo
```

---

## Reference Files

1. `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P1.md` - Full context
2. `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Sample email content
3. `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` - Service API
4. `packages/knowledge/domain/src/entities/entity/entity.model.ts` - Entity schema

---

## Important Notes

1. **Layer Composition Challenge**: The full `ExtractionPipeline` requires LLM providers. For Phase 1, you may need to create a mock pipeline that returns sample data.

2. **Sample Data Location**: Copy email content from `specs/knowledge-graph-poc-demo/sample-data/emails.md` into the data file.

3. **Component Library**: Use `@beep/ui` components (Button, Card, Select, Textarea, Badge).

---

## Handoff Instructions

After completing Phase 1:

1. Update `REFLECTION_LOG.md` with learnings
2. Document any mock layers created in handoff
3. Proceed to `handoffs/P2_ORCHESTRATOR_PROMPT.md` for Phase 2

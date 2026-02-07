# Phase 3 Orchestrator Prompt

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

Copy-paste this prompt to start Phase 3 implementation.

---

## Context

Phases 1-2 established extraction and visualization. Phase 3 adds the GraphRAG query interface, enabling natural language queries against the extracted knowledge graph.

**Full Context:** `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P3.md`

**Previous Phases:**
- P1: Basic extraction UI
- P2: Relations & evidence UI

---

## Your Mission

Create the GraphRAG query interface with these deliverables:

1. **GraphRAGQueryPanel** - Container for query functionality
2. **QueryInput** - Natural language query text field
3. **QueryConfigForm** - topK slider and hops dropdown
4. **QueryResultDisplay** - Retrieved entities, relations, context
5. **Server Action** - Call GraphRAGService

---

## Phase Tasks

| Task | Agent | Priority |
|------|-------|----------|
| Create GraphRAGQueryPanel container | Orchestrator | P0 |
| Add QueryInput component | Orchestrator | P0 |
| Add QueryConfigForm (topK, hops) | Orchestrator | P0 |
| Create server action for queries | Orchestrator | P0 |
| Create QueryResultDisplay | Orchestrator | P0 |
| Add context preview panel | Orchestrator | P1 |
| Add query stats display | Orchestrator | P1 |

---

## Critical Patterns

**GraphRAG Server Action:**
```typescript
"use server";

import { GraphRAGService } from "@beep/knowledge-server/GraphRAG";
import * as Effect from "effect/Effect";

export async function queryGraph(
  queryText: string,
  config: { topK: number; maxHops: number }
) {
  const program = Effect.gen(function* () {
    const service = yield* GraphRAGService;
    return yield* service.query(queryText, {
      ...config,
      organizationId: "demo_org",
    });
  });

  return Effect.runPromise(
    program.pipe(Effect.provide(/* layers */))
  );
}
```

**Query Panel State:**
```typescript
const [query, setQuery] = React.useState("");
const [topK, setTopK] = React.useState(10);
const [maxHops, setMaxHops] = React.useState(1);
const [result, setResult] = React.useState<GraphRAGResult | null>(null);
const [isQuerying, setIsQuerying] = React.useState(false);

const handleQuery = async () => {
  setIsQuerying(true);
  try {
    const result = await queryGraph(query, { topK, maxHops });
    setResult(result);
  } catch (e) {
    // Handle error
  } finally {
    setIsQuerying(false);
  }
};
```

---

## Success Criteria

- [ ] Text input for natural language queries
- [ ] topK slider works (1-50, default 10)
- [ ] hops selector works (0-3, default 1)
- [ ] Query returns relevant entities
- [ ] Formatted context shown
- [ ] Query stats displayed

---

## Verification

After each step:
```bash
bun run check --filter @beep/todox
```

Test queries:
1. Extract sample email first
2. Query: "Who works at Acme Corp?"
3. Verify relevant people returned
4. Check context preview
5. Adjust topK/hops, re-query

---

## Reference Files

1. `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P3.md` - Full context
2. `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts` - Service API
3. `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Query test cases

---

## Important Notes

1. **Embedding Service**: GraphRAG needs embeddings. May require mock embedding provider for demo.

2. **Query Performance**: Allow 1-5 seconds for query. Show loading state.

3. **Context Format**: The `formattedContext` is ready for LLM consumption. Display it in a readable format.

---

## Handoff Instructions

After completing Phase 3:

1. Update `REFLECTION_LOG.md` with learnings
2. Document embedding provider approach
3. Proceed to `handoffs/P4_ORCHESTRATOR_PROMPT.md` for Entity Resolution UI

# Handoff P3: GraphRAG Query Interface

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,800 | OK |
| Episodic Memory | 1,000 tokens | ~700 | OK |
| Semantic Memory | 500 tokens | ~450 | OK |
| Procedural Memory | 500 tokens | ~300 | OK |
| **Total** | **4,000 tokens** | **~3,250** | **OK** |

---

## Working Memory (Current Phase)

### Phase 3 Goal

Enable natural language queries against the extracted knowledge graph using GraphRAG semantic search.

### Deliverables

1. `GraphRAGQueryPanel` - Query input and configuration
2. `QueryConfigForm` - topK and hops parameters
3. `QueryResultDisplay` - Show retrieved entities, relations, context
4. Server action for GraphRAG queries
5. Context preview for LLM consumption

### Success Criteria

- [ ] Text input for natural language queries
- [ ] topK slider (1-50, default 10)
- [ ] hops selector (0-3, default 1)
- [ ] Query returns relevant entities and relations
- [ ] Formatted context shown for LLM consumption
- [ ] Query stats displayed (seed count, entities, hops, tokens)

### Blocking Issues

- **P1/P2 Required**: Must have extraction and evidence UI working
- **Graph Data**: Need extracted data to query against
- **Embedding Service**: May need mock embeddings for demo

### Key Constraints

1. **GraphRAG Service API**
   - `query(text, config)` returns `GraphRAGResult`
   - Config includes `topK`, `maxHops`, `organizationId`
   - Result has `seeds`, `entities`, `relations`, `formattedContext`

2. **Context Assembly**
   - GraphRAG assembles context for LLM consumption
   - Show raw context string for transparency
   - Include token estimate for context size

3. **Performance**
   - Queries may take 1-5 seconds
   - Show loading state during query
   - Cancel previous query if new one starts

### Implementation Order

1. Create `GraphRAGQueryPanel` container
2. Add `QueryInput` component
3. Add `QueryConfigForm` (topK slider, hops dropdown)
4. Create server action for queries
5. Create `QueryResultDisplay` with entity/relation cards
6. Add context preview panel
7. Add query stats display

---

## Episodic Memory (Previous Context)

### Phase 1 Summary

- Created page route at `/knowledge-demo`
- `EmailInputPanel` with sample selector
- `EntityCardList` for results
- Server action for extraction
- Basic loading/error states

### Phase 2 Summary

**Completed:**
- `RelationTable` showing triples
- `EntityDetailDrawer` with evidence
- Source text highlighting
- Evidence navigation
- Predicate filtering

**Architecture Established:**
- `ResultsTabs` container pattern
- State management for selected entity
- Evidence span highlighting approach

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| QueryPanel | `apps/todox/src/app/knowledge-demo/components/GraphRAGQueryPanel.tsx` |
| QueryConfig | `apps/todox/src/app/knowledge-demo/components/QueryConfigForm.tsx` |
| QueryResults | `apps/todox/src/app/knowledge-demo/components/QueryResultDisplay.tsx` |
| Actions | `apps/todox/src/app/knowledge-demo/actions.ts` |

### GraphRAG Service API

```typescript
import { GraphRAGService } from "@beep/knowledge-server/GraphRAG";

interface GraphRAGConfig {
  organizationId: string;
  topK: number;         // 1-50
  maxHops: number;      // 0-3
}

interface GraphRAGResult {
  seeds: Entity[];           // Direct semantic matches
  entities: Entity[];        // All retrieved entities
  relations: Relation[];     // Graph connections
  formattedContext: string;  // Ready for LLM
  stats: {
    seedCount: number;
    entityCount: number;
    relationCount: number;
    hopsTraversed: number;
    tokenEstimate: number;
  };
}
```

### UI Components Needed

| Component | From |
|-----------|------|
| Slider | `@beep/ui/components/slider` |
| Input | `@beep/ui/components/input` |
| Card | `@beep/ui/components/card` |
| Textarea (read-only) | `@beep/ui/components/textarea` |

---

## Procedural Memory (Reference Links)

### Effect Patterns

- `.claude/rules/effect-patterns.md` - Required patterns

### Existing Code References

- `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts` - Service API
- `packages/knowledge/domain/src/retrieval/graph-rag-result.model.ts` - Result schema

### Spec Documents

- `specs/knowledge-graph-poc-demo/README.md` - GraphRAGQueryPanel spec
- `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Query test cases

### Query Test Cases

| Query | Expected Results |
|-------|------------------|
| "Who works at Acme Corp?" | John, Sarah, Mike, Alex, Lisa |
| "What projects is John working on?" | Q4 Release |
| "What was discussed in meetings?" | Q4 Release, tech decisions |
| "What are the upcoming deadlines?" | December 15, November 30 |

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check | `bun run check --filter @beep/todox` | No errors |
| Lint | `bun run lint` | No errors |
| Dev server | `bun run dev` | No console errors |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Query input works | Type query, press Enter or click Search |
| Config controls work | Adjust topK slider, hops dropdown |
| Results display | See entity cards, relation list |
| Context shown | Expand context preview, see formatted text |
| Stats accurate | Compare stats to visible results |

---

## Handoff to Phase 4

After completing Phase 3:

1. Update `REFLECTION_LOG.md` with learnings
2. Document mock embedding approach if used
3. Note query performance characteristics
4. Proceed to Phase 4: Entity Resolution UI

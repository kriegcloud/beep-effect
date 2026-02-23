# Handoff P1: Basic Extraction UI

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,800 | OK |
| Episodic Memory | 1,000 tokens | ~200 | OK |
| Semantic Memory | 500 tokens | ~400 | OK |
| Procedural Memory | 500 tokens | ~300 | OK |
| **Total** | **4,000 tokens** | **~2,700** | **OK** |

---

## Working Memory (Current Phase)

### Phase 1 Goal

Create the foundation for the knowledge graph demo: input UI, extraction trigger, and basic entity display.

### Deliverables

1. Page route at `/knowledge-demo` in todox app
2. `EmailInputPanel` component with sample email selector dropdown
3. Server action `extractFromText` calling `ExtractionPipeline`
4. `EntityCardList` component for displaying results
5. Loading and error states

### Success Criteria

- [ ] Page renders at `/knowledge-demo`
- [ ] Can select from 5 sample emails via dropdown
- [ ] "Extract" button triggers extraction pipeline
- [ ] Extracted entities display in card format (name, types, confidence)
- [ ] Loading state shows during extraction
- [ ] Error state displays on failure

### Blocking Issues

None - this is the initial phase.

### Key Constraints

1. **Effect Patterns Required**
   - Use `Effect.gen` for all async operations
   - Namespace imports: `import * as Effect from "effect/Effect"`
   - No `async/await` in Effect code

2. **Path Aliases Required**
   - `@beep/knowledge-server` for services
   - `@beep/knowledge-domain` for types
   - `@beep/ui` for UI components

3. **Layer Composition Challenge**
   - `ExtractionPipeline` has nested dependencies (LLM, NLP, etc.)
   - For P1, consider mock layers returning sample data
   - Full integration can follow in later phases

### Implementation Order

1. Create page route structure
2. Create `KnowledgeDemoClient` container component
3. Create `EmailInputPanel` with sample selector
4. Create sample data file with 5 emails
5. Create server action (mock or real)
6. Create `EntityCardList` for results
7. Wire up loading/error states

---

## Episodic Memory (Previous Context)

### Previous Phases

None - P1 is the initial phase.

### Decisions Made

- Route location: `apps/todox/src/app/knowledge-demo/`
- Sample data from `specs/knowledge-graph-poc-demo/sample-data/emails.md`
- Using `@beep/ui` components (Button, Card, Select, Textarea, Badge)

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| Page route | `apps/todox/src/app/knowledge-demo/page.tsx` |
| Components | `apps/todox/src/app/knowledge-demo/components/` |
| Server actions | `apps/todox/src/app/knowledge-demo/actions.ts` |
| Sample data | `apps/todox/src/app/knowledge-demo/data/sample-emails.ts` |
| Source emails | `specs/knowledge-graph-poc-demo/sample-data/emails.md` |

### Key Services

| Service | Import |
|---------|--------|
| ExtractionPipeline | `@beep/knowledge-server/Extraction` |
| Entity model | `@beep/knowledge-domain` |

### Entity Model Shape

```typescript
interface Entity {
  id: string;
  mention: string;           // "John Smith"
  types: string[];           // ["http://schema.org/Person"]
  attributes: Record<string, string>;
  groundingConfidence?: number;
  mentions?: EvidenceSpan[];
}
```

### Extraction Result Shape

```typescript
interface ExtractionResult {
  graph: KnowledgeGraph;
  stats: {
    entityCount: number;
    relationCount: number;
    tokensUsed: number;
    durationMs: number;
  };
}
```

---

## Procedural Memory (Reference Links)

### Effect Patterns

- `.claude/rules/effect-patterns.md` - Required patterns

### Testing Patterns

- `.claude/commands/patterns/effect-testing-patterns.md`

### Existing Code References

- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` - Service API
- `packages/knowledge/domain/src/entities/entity/entity.model.ts` - Entity schema
- `apps/todox/src/app/page.tsx` - Example page structure

### Spec Documents

- `specs/knowledge-graph-poc-demo/README.md` - Full spec
- `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Email content

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check | `bun run check --filter @beep/todox` | No errors |
| Lint | `bun run lint` | No errors |
| Dev server | `bun run dev` | Page loads |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Page renders | Navigate to `http://localhost:3000/knowledge-demo` |
| Sample selector works | Select email from dropdown, see textarea populate |
| Extraction triggers | Click "Extract", see loading state |
| Entities display | After extraction, see entity cards |
| Error handling | Disconnect network, trigger extraction |

---

## Handoff to Phase 2

After completing Phase 1:

1. Update `REFLECTION_LOG.md` with learnings
2. Document any mock layers created
3. Note any challenges with layer composition
4. Create Phase 2 handoff focusing on relations and evidence UI

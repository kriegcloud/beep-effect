# Handoff P2: Relations & Evidence UI

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,700 | OK |
| Episodic Memory | 1,000 tokens | ~600 | OK |
| Semantic Memory | 500 tokens | ~400 | OK |
| Procedural Memory | 500 tokens | ~300 | OK |
| **Total** | **4,000 tokens** | **~3,000** | **OK** |

---

## Working Memory (Current Phase)

### Phase 2 Goal

Show relations between entities and link evidence spans to source text highlighting.

### Deliverables

1. `RelationTable` component showing subject-predicate-object triples
2. `EntityDetailDrawer` with full entity details and evidence
3. Source text highlighting for evidence spans
4. Evidence span navigation ("Jump to source")
5. Relation filtering by predicate

### Success Criteria

- [ ] Relations display in table format (Subject | Predicate | Object | Confidence)
- [ ] Click entity opens drawer with full details
- [ ] Entity drawer shows evidence spans with source references
- [ ] Click evidence span highlights text in source panel
- [ ] Can filter relations by predicate type
- [ ] Relation click expands to show evidence

### Blocking Issues

- **P1 Required**: Must have basic extraction UI working first
- **Mock Data**: May need to enhance mock to include relations with evidence

### Key Constraints

1. **Evidence Span Structure**
   - `EvidenceSpan` has `start`, `end`, `text` properties
   - Must map offsets to source text correctly
   - Handle overlapping spans gracefully

2. **Component Communication**
   - EntityDetailDrawer needs access to full extraction result
   - Source highlighting requires shared state with drawer

3. **Performance**
   - Avoid re-rendering entire source on each highlight
   - Use CSS classes for highlighting, not DOM manipulation

### Implementation Order

1. Add `ResultsTabs` container (Entities | Relations | Evidence tabs)
2. Create `RelationTable` component
3. Create `EntityDetailDrawer` component
4. Add source text panel with highlighting capability
5. Wire up evidence span click handlers
6. Add predicate filter dropdown

---

## Episodic Memory (Previous Context)

### Phase 1 Summary

**Completed:**
- Page route at `/knowledge-demo`
- `EmailInputPanel` with sample selector
- `EntityCardList` for displaying entities
- Server action (mock or real)
- Basic loading/error states

**Decisions Made:**
- Route: `apps/todox/src/app/knowledge-demo/`
- Components in `components/` subdirectory
- Using `@beep/ui` component library
- Mock layers if needed for initial extraction

**Known Issues:**
- Layer composition may require mock providers
- Document any workarounds used

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| RelationTable | `apps/todox/src/app/knowledge-demo/components/RelationTable.tsx` |
| EntityDetailDrawer | `apps/todox/src/app/knowledge-demo/components/EntityDetailDrawer.tsx` |
| SourceTextPanel | `apps/todox/src/app/knowledge-demo/components/SourceTextPanel.tsx` |
| ResultsTabs | `apps/todox/src/app/knowledge-demo/components/ResultsTabs.tsx` |

### Relation Model Shape

```typescript
interface Relation {
  id: string;
  subjectId: string;
  predicate: string;         // "http://demo.beep.dev/ontology#leadsProject"
  objectId?: string;
  literalValue?: string;
  evidence?: EvidenceSpan;
  groundingConfidence?: number;
}

interface EvidenceSpan {
  start: number;
  end: number;
  text: string;
  sourceUri?: string;
}
```

### UI Components Needed

| Component | From |
|-----------|------|
| Table | `@beep/ui/components/table` |
| Sheet (Drawer) | `@beep/ui/components/sheet` |
| Tabs | `@beep/ui/components/tabs` |
| Select | `@beep/ui/components/select` |
| ScrollArea | `@beep/ui/components/scroll-area` |

---

## Procedural Memory (Reference Links)

### Effect Patterns

- `.claude/rules/effect-patterns.md` - Required patterns

### Existing Code References

- `packages/knowledge/domain/src/entities/relation/relation.model.ts` - Relation schema
- `packages/knowledge/domain/src/entities/evidence/evidence.model.ts` - Evidence schema

### Spec Documents

- `specs/knowledge-graph-poc-demo/README.md` - Full spec (UI component hierarchy)
- `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Expected relations per email

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
| Relations display | Extract email, see Relations tab with table |
| Entity drawer | Click entity card, drawer opens with details |
| Evidence shown | Drawer shows evidence spans with text |
| Source highlighting | Click evidence, source text highlights |
| Filter works | Select predicate, table filters |

---

## Handoff to Phase 3

After completing Phase 2:

1. Update `REFLECTION_LOG.md` with learnings
2. Document evidence highlighting approach
3. Note any state management patterns used
4. Proceed to Phase 3: GraphRAG Query Interface

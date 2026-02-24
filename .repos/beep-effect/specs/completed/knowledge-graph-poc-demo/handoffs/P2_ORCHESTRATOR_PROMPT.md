# Phase 2 Orchestrator Prompt

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

Copy-paste this prompt to start Phase 2 implementation.

---

## Context

Phase 1 established the basic extraction UI with email input and entity display. Phase 2 adds relation visualization and evidence linking to create a complete knowledge graph exploration experience.

**Full Context:** `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P2.md`

**Previous Phase:** `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P1.md`

---

## Your Mission

Add relations and evidence UI with these deliverables:

1. **RelationTable** - Display subject-predicate-object triples with confidence
2. **EntityDetailDrawer** - Full entity details with evidence spans
3. **SourceTextPanel** - Source text with highlighting capability
4. **Evidence Navigation** - Click evidence to highlight in source
5. **Predicate Filter** - Filter relations by type

---

## Phase Tasks

| Task | Agent | Priority |
|------|-------|----------|
| Add ResultsTabs container | Orchestrator | P0 |
| Create RelationTable component | Orchestrator | P0 |
| Create EntityDetailDrawer component | Orchestrator | P0 |
| Create SourceTextPanel with highlighting | Orchestrator | P0 |
| Wire up evidence click handlers | Orchestrator | P1 |
| Add predicate filter dropdown | Orchestrator | P1 |
| Verify all interactions work | Orchestrator | P1 |

---

## Critical Patterns

**Evidence Highlighting:**
```typescript
// Mark evidence spans in source text
function highlightEvidence(source: string, spans: EvidenceSpan[]) {
  // Sort spans by start position (descending to avoid offset issues)
  const sorted = A.sort(spans, Order.reverse(Order.number));

  let result = source;
  for (const span of sorted) {
    const before = result.slice(0, span.start);
    const highlighted = `<mark>${result.slice(span.start, span.end)}</mark>`;
    const after = result.slice(span.end);
    result = before + highlighted + after;
  }
  return result;
}
```

**Drawer State Management:**
```typescript
const [selectedEntity, setSelectedEntity] = React.useState<Entity | null>(null);
const [highlightedSpan, setHighlightedSpan] = React.useState<EvidenceSpan | null>(null);

// In EntityDetailDrawer
const handleEvidenceClick = (span: EvidenceSpan) => {
  setHighlightedSpan(span);
  // Scroll source panel to span position
};
```

---

## Success Criteria

- [ ] Relations display in table format
- [ ] Click entity opens drawer with full details
- [ ] Entity drawer shows evidence spans
- [ ] Click evidence span highlights text in source
- [ ] Can filter relations by predicate type
- [ ] Relation click expands to show evidence

---

## Verification

After each step:
```bash
bun run check --filter @beep/todox
```

Test manually:
1. Extract a sample email
2. Switch to Relations tab - see triples
3. Click an entity - drawer opens
4. Click evidence span - source highlights
5. Filter by predicate - table filters

---

## Reference Files

1. `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P2.md` - Full context
2. `packages/knowledge/domain/src/entities/relation/relation.model.ts` - Relation schema
3. `packages/knowledge/domain/src/entities/evidence/evidence.model.ts` - Evidence schema
4. `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Expected relations

---

## Important Notes

1. **Evidence Span Offsets**: Spans reference character positions in the original source text. Ensure offsets are correctly mapped.

2. **Overlapping Spans**: Multiple evidence spans may overlap. Consider visual strategies (nested highlights, sequential).

3. **Component Communication**: Drawer and SourceTextPanel need shared state for highlighted span.

---

## Handoff Instructions

After completing Phase 2:

1. Update `REFLECTION_LOG.md` with learnings
2. Document highlighting approach used
3. Proceed to `handoffs/P3_ORCHESTRATOR_PROMPT.md` for GraphRAG Query Interface

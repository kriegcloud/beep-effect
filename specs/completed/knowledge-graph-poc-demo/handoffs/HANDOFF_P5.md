# Handoff P5: Polish & Integration

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,600 | OK |
| Episodic Memory | 1,000 tokens | ~900 | OK |
| Semantic Memory | 500 tokens | ~400 | OK |
| Procedural Memory | 500 tokens | ~300 | OK |
| **Total** | **4,000 tokens** | **~3,200** | **OK** |

---

## Working Memory (Current Phase)

### Phase 5 Goal

Polish the demo to production quality: comprehensive error handling, visual consistency, loading states, and demo flow guidance.

### Deliverables

1. Comprehensive error handling across all components
2. Loading states with skeletons and progress indicators
3. Visual consistency with todox app design
4. Demo walkthrough hints/tutorial
5. Performance optimization (Suspense, lazy loading)
6. Component documentation

### Success Criteria

- [ ] All error states handled gracefully with helpful messages
- [ ] Loading skeletons for all async operations
- [ ] Visual design matches todox app patterns
- [ ] Demo can be completed without console errors
- [ ] Responsive on desktop and tablet
- [ ] Type check and lint pass with no errors

### Blocking Issues

- **P1-P4 Required**: All functionality must be working
- **Review Previous Phases**: May need to fix issues found during polish

### Key Focus Areas

1. **Error Handling**
   - Network failures during extraction
   - Invalid input validation
   - Service unavailable states
   - Partial failures (some emails extract, others fail)

2. **Loading States**
   - Extraction progress (multi-stage)
   - Query processing
   - Resolution processing
   - Initial page load

3. **Visual Polish**
   - Consistent spacing and typography
   - Proper use of color for states
   - Icons for actions and entity types
   - Animations for transitions

4. **Demo Experience**
   - Clear first-time user guidance
   - Suggested demo flow
   - Reset/clear functionality
   - Export results option

### Implementation Order

1. Audit all error paths, add handling
2. Add loading skeletons to all panels
3. Visual review and consistency fixes
4. Add demo hints/onboarding
5. Performance audit (React DevTools)
6. Final type check and lint pass
7. Manual testing of full demo flow

---

## Episodic Memory (Previous Context)

### Phase 1 Summary

- Page route at `/knowledge-demo`
- `EmailInputPanel` with sample selector
- `EntityCardList` for results
- Server action for extraction
- Basic loading/error states

### Phase 2 Summary

- `RelationTable` showing triples
- `EntityDetailDrawer` with evidence
- Source text highlighting
- Evidence navigation

### Phase 3 Summary

- `GraphRAGQueryPanel` with query input
- `QueryConfigForm` (topK, hops)
- `QueryResultDisplay` with entities/relations
- Context preview for LLM consumption

### Phase 4 Summary

**Completed:**
- Multi-extraction support
- `EntityResolutionPanel` with resolve trigger
- `ClusterList` showing grouped duplicates
- `SameAsLinkTable` with provenance
- Resolution statistics

**Known Issues to Address:**
- Review error handling in each component
- Check loading states for completeness
- Verify visual consistency

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| Page | `apps/todox/src/app/knowledge-demo/page.tsx` |
| Components | `apps/todox/src/app/knowledge-demo/components/` |
| Actions | `apps/todox/src/app/knowledge-demo/actions.ts` |
| Styles | Use Tailwind utilities |

### UI Components to Use

| Component | Purpose |
|-----------|---------|
| Skeleton | Loading states |
| Alert | Error messages |
| Progress | Multi-stage progress |
| Tooltip | Hint text |
| Badge | Status indicators |

### Design Patterns

| Pattern | Implementation |
|---------|----------------|
| Error boundary | Wrap each panel |
| Loading skeleton | Match content shape |
| Empty state | Helpful message + action |
| Disabled state | Clear visual indication |

---

## Procedural Memory (Reference Links)

### Effect Patterns

- `.claude/rules/effect-patterns.md` - Required patterns

### UI Patterns

- `packages/ui/ui/src/components/` - Available components
- `apps/todox/src/app/` - Existing page patterns

### Spec Documents

- `specs/knowledge-graph-poc-demo/README.md` - Full spec
- `specs/knowledge-graph-poc-demo/RUBRICS.md` - Quality rubrics

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
| Error handling | Disconnect network, trigger actions |
| Loading states | Slow network simulation |
| Visual consistency | Side-by-side with todox pages |
| Responsive | Test at 1024px and 768px widths |
| Full demo flow | Complete all 5 sample emails |

### Demo Flow Checklist

| Step | Expected |
|------|----------|
| 1. Load page | Page renders, hints visible |
| 2. Select email 1 | Textarea populates |
| 3. Extract | Loading state, then entities |
| 4. View relations | Table shows triples |
| 5. Click entity | Drawer opens with details |
| 6. Click evidence | Source highlights |
| 7. Extract email 2-5 | Count increments |
| 8. Resolve | Clusters displayed |
| 9. Query | Results returned |
| 10. Clear | State resets |

---

## Completion Checklist

### Required Before Marking Complete

- [ ] All type checks pass
- [ ] All lint checks pass
- [ ] No console errors in dev
- [ ] Demo flow works end-to-end
- [ ] Error states tested
- [ ] Loading states visible
- [ ] REFLECTION_LOG.md updated

### Documentation

- [ ] Component props documented
- [ ] Server actions documented
- [ ] Demo flow documented
- [ ] Known limitations noted

---

## Final Handoff

After completing Phase 5:

1. Update `REFLECTION_LOG.md` with full spec learnings
2. Mark spec as complete in `specs/README.md`
3. Create PR if not already done
4. Document any remaining tech debt

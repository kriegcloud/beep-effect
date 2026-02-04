# Handoff — Phase 4: Validation & Refinement

> Context document for Phase 4 implementation.

---

## Context Budget Status

| Memory Type | Est. Tokens | Budget | Status |
|-------------|-------------|--------|--------|
| Working | TBD | ≤2,000 | ⏳ Pending |
| Episodic | TBD | ≤1,000 | ⏳ Pending |
| Semantic | ~200 | ≤500 | ✅ OK |
| Procedural | Links | N/A | ✅ OK |
| **Total** | **TBD** | **≤4,000** | **⏳ Pending** |

> ⚠️ This handoff will be fully populated when Phase 3 completes.

---

## Working Context (≤2K tokens)

### Phase 4 Mission

Validate the complete system and refine based on testing.

### Tasks

| ID | Task | Agent | Output |
|----|------|-------|--------|
| 4.1 | Test agent with new context | Manual testing | Test results |
| 4.2 | Identify missing context | codebase-researcher | Gap list |
| 4.3 | Generate missing context | doc-writer | Additional context files |
| 4.4 | Final AGENTS.md review | spec-reviewer | `outputs/final-review.md` |
| 4.5 | Document maintenance | doc-writer | `documentation/context-maintenance.md` |

### Success Criteria

- [ ] All subtrees accessible and searchable
- [ ] All context files linked and accurate
- [ ] AGENTS.md navigation complete
- [ ] Maintenance workflow documented
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] REFLECTION_LOG.md finalized

### Blocking Issues

*To be identified during Phase 3 completion.*

---

## Episodic Context (≤1K tokens)

### Phase 3 Summary

*To be filled by Phase 3 orchestrator with:*
- Index sections added
- Cross-references created
- Any navigation gaps

---

## Semantic Context (≤500 tokens)

### Validation Protocol

1. **Subtree Validation**: Verify `.repos/effect/` accessible and searchable
2. **Context Validation**: Verify 20+ context files exist and follow template
3. **Index Validation**: Verify AGENTS.md has navigation section
4. **Build Validation**: `bun run check` and `bun run test` pass

### Maintenance Cadence

- **Subtree Updates**: Quarterly (or on major Effect releases)
- **Context Refresh**: When patterns change significantly
- **Index Updates**: When adding new skills or specs

---

## Procedural Context (Links only)

| Resource | Path | Purpose |
|----------|------|---------|
| Master Orchestration | `MASTER_ORCHESTRATION.md` | Full Phase 4 workflow |
| Spec Guide | `specs/_guide/README.md` | Completion criteria |
| Rubrics | `RUBRICS.md` | Phase 4 scoring |

---

## Spec Completion

After completing Phase 4:
1. Finalize REFLECTION_LOG.md with all learnings
2. Update README.md status to "✅ Complete"
3. Promote validated patterns to PATTERN_REGISTRY if scored 75+

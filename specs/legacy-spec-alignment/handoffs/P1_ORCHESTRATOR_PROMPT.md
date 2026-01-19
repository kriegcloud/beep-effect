# Phase 1 Orchestrator Prompt: knowledge-graph-integration Alignment

**Spec**: `specs/legacy-spec-alignment/`
**Phase**: 1 (knowledge-graph-integration Alignment)
**Objective**: Split oversized phases, add handoff chain, update README

---

## Prerequisites

- P0 Analysis MUST be complete
- Read `outputs/violation-catalog.md` for specific violations
- Read `outputs/spec-inventory.md` for current state

---

## Context

The `knowledge-graph-integration` spec has the following violations:

| Phase | Current Items | Limit | Over By |
|-------|---------------|-------|---------|
| Phase 0 | 15 | 7 | 8 |

This phase focuses ONLY on aligning `specs/knowledge-graph-integration/`.

---

## Work Items (6)

### 1. Analyze Current Phase Structure
**DELEGATE TO**: `codebase-researcher`
```
Prompt: "Read specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md.
List all work items in Phase 0. Group them into logical clusters
of max 7 items each."
```

### 2. Split Phase 0 into Sub-Phases
**DIRECT (orchestrator)**: Based on agent analysis:
- Create Phase 0a (7 items max)
- Create Phase 0b (remaining items, max 7)
- Ensure dependencies flow correctly

### 3. Update MASTER_ORCHESTRATION.md
**DIRECT (orchestrator)**: Edit file to reflect new structure:
- New phase numbering (0a, 0b or 0, 1 with renumbering)
- Delegation matrix for each phase
- Exit criteria for each phase

### 4. Create Missing Handoffs
**DIRECT (orchestrator)**: Add handoff files:
- `handoffs/HANDOFF_P1.md` (if missing)
- Orchestrator prompts for new sub-phases

### 5. Update README.md
**DELEGATE TO**: `doc-writer`
```
Prompt: "Update specs/knowledge-graph-integration/README.md to follow
canonical template. Add: Success Criteria table, Phase Progression
table with agents, Exit Criteria checklist."
```

### 6. Verification
**DIRECT (orchestrator)**: Confirm all phases ≤7 items

---

## Delegation Matrix

| Task | Delegate To | Never Do Directly |
|------|-------------|-------------------|
| Reading MASTER_ORCHESTRATION | `codebase-researcher` | Direct file reads |
| Phase analysis and grouping | `codebase-researcher` | Manual counting |
| File structure edits | Direct (orchestrator) | N/A (<3 files) |
| README restructuring | `doc-writer` | Large markdown edits |

---

## Context Budget Protocol

| Metric | Green | Yellow | Red (STOP!) |
|--------|-------|--------|-------------|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**If Yellow**: Consider creating interim checkpoint
**If Red**: STOP immediately, create handoff before continuing

---

## Exit Criteria

- [ ] Phase 0 split into ≤7 item sub-phases
- [ ] MASTER_ORCHESTRATION.md updated with new structure
- [ ] Delegation matrix present in all phases
- [ ] README.md follows canonical template
- [ ] All handoff files created

---

## Expected Outputs

### 1. Updated `specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md`
New phase structure with proper sizing.

### 2. Updated `specs/knowledge-graph-integration/README.md`
Canonical template compliance.

### 3. `handoffs/HANDOFF_P1_COMPLETE.md`
Summary of changes made and verification results.

---

## Anti-Patterns to Avoid

1. **Don't read the entire spec** - Use codebase-researcher
2. **Don't change spec outcomes** - Only restructure phases
3. **Don't create new work** - Redistribute existing items
4. **Don't merge phases** - Only split oversized ones

# Phase 2 Orchestrator Prompt: rls-implementation Alignment

**Spec**: `specs/legacy-spec-alignment/`
**Phase**: 2 (rls-implementation Alignment)
**Objective**: Split oversized phases, add handoff chain, update README

---

## Prerequisites

- P0 Analysis MUST be complete
- Read `outputs/violation-catalog.md` for specific violations
- Read `outputs/spec-inventory.md` for current state

---

## Context

The `rls-implementation` spec has the following violations:

| Phase | Current Items | Limit | Over By |
|-------|---------------|-------|---------|
| Phase 1 | 8 | 7 | 1 |
| Phase 2 | 8 | 7 | 1 |
| Phase 5 | 15 | 7 | 8 |

This phase focuses ONLY on aligning `specs/rls-implementation/`.

---

## Work Items (6)

### 1. Analyze Current Phase Structure
**DELEGATE TO**: `codebase-researcher`
```
Prompt: "Read specs/rls-implementation/MASTER_ORCHESTRATION.md.
List all work items in Phases 1, 2, and 5. Identify which items
can be deferred to sub-phases."
```

### 2. Split Phase 5 into Sub-Phases
**DIRECT (orchestrator)**: Phase 5 is the most oversized:
- Create Phase 5a (7 items max)
- Create Phase 5b (remaining items, max 7)
- Ensure dependencies flow correctly

### 3. Trim Phases 1 and 2
**DIRECT (orchestrator)**: Each is only 1 over:
- Move 1 item from Phase 1 to Phase 1b OR merge into another phase
- Move 1 item from Phase 2 to Phase 2b OR merge into another phase

### 4. Update MASTER_ORCHESTRATION.md
**DIRECT (orchestrator)**: Edit file to reflect new structure:
- New phase numbering
- Delegation matrix for each phase
- Exit criteria for each phase

### 5. Update README.md
**DELEGATE TO**: `doc-writer`
```
Prompt: "Update specs/rls-implementation/README.md to follow
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

- [ ] Phase 5 split into ≤7 item sub-phases
- [ ] Phases 1 and 2 reduced to ≤7 items
- [ ] MASTER_ORCHESTRATION.md updated with new structure
- [ ] Delegation matrix present in all phases
- [ ] README.md follows canonical template

---

## Expected Outputs

### 1. Updated `specs/rls-implementation/MASTER_ORCHESTRATION.md`
New phase structure with proper sizing.

### 2. Updated `specs/rls-implementation/README.md`
Canonical template compliance.

### 3. `handoffs/HANDOFF_P2_COMPLETE.md`
Summary of changes made and verification results.

---

## Anti-Patterns to Avoid

1. **Don't read the entire spec** - Use codebase-researcher
2. **Don't change spec outcomes** - Only restructure phases
3. **Don't create new work** - Redistribute existing items
4. **Don't merge phases** - Only split oversized ones
5. **Don't over-optimize** - 1 item over is minor; prefer minimal changes

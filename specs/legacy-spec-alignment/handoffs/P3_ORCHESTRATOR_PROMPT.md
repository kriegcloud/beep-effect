# Phase 3 Orchestrator Prompt: Verification

**Spec**: `specs/legacy-spec-alignment/`
**Phase**: 3 (Verification)
**Objective**: Validate all specs meet canonical constraints

---

## Prerequisites

- P1 (knowledge-graph-integration) MUST be complete
- P2 (rls-implementation) MUST be complete
- Read completion handoffs from P1 and P2

---

## Context

Phases 1 and 2 aligned two specs to canonical patterns:
- `knowledge-graph-integration` - Phase 0 was split
- `rls-implementation` - Phases 1, 2, 5 were split

This phase validates the entire spec library meets constraints.

---

## Work Items (4)

### 1. Run Compliance Check
**DELEGATE TO**: `codebase-researcher`
```
Prompt: "For each spec in specs/ with MASTER_ORCHESTRATION.md,
count work items per phase. Report any phase with >7 items.
Format: spec_name | phase | item_count"
```

### 2. Handoff Chain Audit
**DELEGATE TO**: `codebase-researcher`
```
Prompt: "For each spec in specs/, compare phases in MASTER_ORCHESTRATION.md
against files in handoffs/. Report missing HANDOFF or PROMPT files."
```

### 3. Generate Alignment Report
**DIRECT (orchestrator)**: Create final report:
- List all specs with their compliance status
- Document any remaining violations
- Note specs exempted (e.g., `orchestrator-context-optimization` defines the rules)

### 4. Update Spec Status
**DIRECT (orchestrator)**:
- Update `specs/legacy-spec-alignment/README.md` status to COMPLETE
- Add completion date
- Add final changelog entry

---

## Delegation Matrix

| Task | Delegate To | Never Do Directly |
|------|-------------|-------------------|
| Multi-spec scanning | `codebase-researcher` | Sequential file reads |
| Handoff auditing | `codebase-researcher` | Manual directory listing |
| Report synthesis | Direct (orchestrator) | N/A (synthesis task) |
| README update | Direct (orchestrator) | N/A (<3 lines) |

---

## Context Budget Protocol

| Metric | Green | Yellow | Red (STOP!) |
|--------|-------|--------|-------------|
| Direct tool calls | 0-8 | 9-12 | 13+ |
| Large file reads | 0-1 | 2-3 | 4+ |
| Sub-agent delegations | 0-3 | 4-5 | 6+ |

---

## Exit Criteria

- [ ] All specs pass phase sizing constraint (≤7 items)
- [ ] All multi-phase specs have handoff chains
- [ ] Alignment report generated
- [ ] Spec status updated to COMPLETE
- [ ] REFLECTION_LOG updated with final learnings

---

## Expected Outputs

### 1. `outputs/alignment-report.md`
Final compliance report for all specs.

### 2. Updated `README.md`
Status changed to COMPLETE with date.

### 3. Updated `REFLECTION_LOG.md`
Final phase learnings and meta-observations.

---

## Success Verification

```bash
# Verify no spec has phases with >7 items
# (This should return empty if compliant)
grep -r "Work Items" specs/*/MASTER_ORCHESTRATION.md | grep -E "\([89]|1[0-9]|2[0-9]\)"

# Verify all specs have REFLECTION_LOG
ls specs/*/REFLECTION_LOG.md

# Verify handoff directories exist for multi-phase specs
ls specs/*/handoffs/
```

# Legacy Spec Alignment - Master Orchestration

## Phase Dependencies

```
P0: Analysis ──────────┬──> P1: knowledge-graph-integration
                       │
                       └──> P2: rls-implementation
                                    │
                                    v
                              P3: Verification
```

**Note**: P1 and P2 can execute in parallel after P0 completes.

---

## Phase 0: Analysis

**Objective**: Inventory all specs and catalog specific violations

### Work Items (5)

1. **Spec inventory** - List all specs in `specs/` directory
2. **Phase count analysis** - Count work items per phase in each spec
3. **Violation catalog** - Document specific violations per spec
4. **Handoff chain audit** - Check for missing HANDOFF_P[N].md files
5. **Alignment plan** - Prioritize specs by violation severity

### Delegation Matrix

| Task | Delegate To | Rationale |
|------|-------------|-----------|
| Spec inventory | `codebase-researcher` | >3 files to scan |
| Phase analysis | `codebase-researcher` | Multi-file pattern matching |
| Violation report | Direct (orchestrator) | Synthesis task |

### Exit Criteria

- [ ] All specs catalogued with work item counts
- [ ] Violations documented with line numbers
- [ ] Missing handoffs identified
- [ ] P1/P2 alignment tasks scoped

### Handoff Output

`handoffs/HANDOFF_P1.md` with:
- Complete violation inventory
- Per-spec alignment requirements
- Estimated work items per phase

---

## Phase 1: knowledge-graph-integration Alignment

**Objective**: Split oversized phases, add handoff chain, update README

### Work Items (6)

1. **Split Phase 0** - 15 items → Phase 0a (7 items) + Phase 0b (8→7 items)
2. **Update MASTER_ORCHESTRATION** - Reflect new phase structure
3. **Create missing handoffs** - Add HANDOFF_P[N].md files
4. **Add delegation matrix** - Include mandatory delegation section
5. **Update README.md** - Align to canonical template
6. **Verification** - Confirm all phases ≤7 items

### Delegation Matrix

| Task | Delegate To | Rationale |
|------|-------------|-----------|
| Phase analysis | `codebase-researcher` | Multi-file review |
| File edits | Direct (orchestrator) | <3 files per edit |
| README update | `doc-writer` | Large restructure |

### Exit Criteria

- [ ] All phases ≤7 work items
- [ ] Handoff chain complete
- [ ] README follows canonical template
- [ ] Delegation matrix present

### Handoff Output

`handoffs/HANDOFF_P1_COMPLETE.md` with:
- Changes made summary
- New phase structure
- Verification results

---

## Phase 2: rls-implementation Alignment

**Objective**: Split oversized phases, add handoff chain, update README

### Work Items (6)

1. **Split Phase 1** - 8 items → 7 items (defer 1 to Phase 1b)
2. **Split Phase 2** - 8 items → 7 items (defer 1 to Phase 2b)
3. **Split Phase 5** - 15 items → Phase 5a (7) + Phase 5b (8→7)
4. **Create missing handoffs** - Add HANDOFF_P[N].md files
5. **Update README.md** - Align to canonical template
6. **Verification** - Confirm all phases ≤7 items

### Delegation Matrix

| Task | Delegate To | Rationale |
|------|-------------|-----------|
| Phase analysis | `codebase-researcher` | Multi-file review |
| File edits | Direct (orchestrator) | <3 files per edit |
| README update | `doc-writer` | Large restructure |

### Exit Criteria

- [ ] All phases ≤7 work items
- [ ] Handoff chain complete
- [ ] README follows canonical template
- [ ] Delegation matrix present

### Handoff Output

`handoffs/HANDOFF_P2_COMPLETE.md` with:
- Changes made summary
- New phase structure
- Verification results

---

## Phase 3: Verification

**Objective**: Validate all specs meet canonical constraints

### Work Items (4)

1. **Run compliance check** - Verify all phases ≤7 items across all specs
2. **Handoff chain audit** - Confirm all phases have handoffs
3. **Generate alignment report** - Document final state
4. **Update spec README** - Mark COMPLETE

### Delegation Matrix

| Task | Delegate To | Rationale |
|------|-------------|-----------|
| Compliance check | `codebase-researcher` | Multi-spec analysis |
| Report generation | Direct (orchestrator) | Synthesis task |

### Exit Criteria

- [ ] All specs pass phase sizing constraint
- [ ] All handoff chains complete
- [ ] Final report generated
- [ ] Spec marked COMPLETE

---

## Canonical Pattern Reference

### Phase Sizing (from SPEC_CREATION_GUIDE.md)

```markdown
Maximum work items per phase: 7
Recommended: 5-6 work items
If phase exceeds 7: Split into sub-phases (e.g., Phase 2a, Phase 2b)
```

### Handoff Requirements (from HANDOFF_STANDARDS.md)

Each phase MUST produce:
- `HANDOFF_P[N].md` for next orchestrator
- Entry in spec's `outputs/` if producing artifacts

### README Template

```markdown
# Spec Name

> One-line description

**Status**: [emoji] **STATE** (date or phase)

---

## Problem Statement
## Success Criteria
## Scope
## Key Deliverables
## Phases Overview
## Getting Started
## Changelog
```

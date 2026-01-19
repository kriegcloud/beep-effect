# Rubrics: Legacy Spec Alignment

> Scoring criteria for evaluating spec alignment to canonical patterns.

---

## Evaluation Dimensions

### 1. Phase Sizing (Weight: 30%)

| Score | Criteria |
|-------|----------|
| 5/5 | All phases have ≤7 work items |
| 4/5 | At most 1 phase with 8 items |
| 3/5 | 2-3 phases with 8 items, none >8 |
| 2/5 | Any phase with 9-10 items |
| 1/5 | Any phase with >10 items |

**Evidence Required**: MASTER_ORCHESTRATION.md work item count per phase

### 2. Delegation Matrix (Weight: 25%)

| Score | Criteria |
|-------|----------|
| 5/5 | All phases have delegation matrix with agent assignments |
| 4/5 | Delegation matrix present but missing rationale column |
| 3/5 | Delegation matrix only in orchestrator prompts, not phases |
| 2/5 | Partial delegation matrix (some phases missing) |
| 1/5 | No delegation matrix |

**Evidence Required**: Delegation table in each phase section

### 3. Handoff Chain (Weight: 25%)

| Score | Criteria |
|-------|----------|
| 5/5 | HANDOFF_P[N].md + P[N]_ORCHESTRATOR_PROMPT.md for all phases |
| 4/5 | Orchestrator prompts for all phases, handoffs for completed phases |
| 3/5 | Orchestrator prompts only |
| 2/5 | Partial handoff chain |
| 1/5 | No handoff files |

**Evidence Required**: Files in handoffs/ directory

### 4. README Compliance (Weight: 20%)

| Score | Criteria |
|-------|----------|
| 5/5 | All canonical sections present and populated |
| 4/5 | Missing 1 section OR 1 section is minimal |
| 3/5 | Missing 2 sections |
| 2/5 | Missing 3+ sections |
| 1/5 | README is stub or missing |

**Canonical Sections**:
- Problem Statement
- Success Criteria (table)
- Scope (In/Out)
- Key Deliverables (table)
- Phases Overview (table)
- Agent-Phase Mapping (table)
- File Reference (table)
- Exit Criteria (checklist)
- Getting Started
- Changelog

---

## Overall Score Calculation

```
Overall = (Phase Sizing × 0.30) +
          (Delegation Matrix × 0.25) +
          (Handoff Chain × 0.25) +
          (README Compliance × 0.20)
```

### Pass/Fail Thresholds

| Overall Score | Result |
|---------------|--------|
| 4.5+ | **PASS** - Production ready |
| 3.5-4.4 | **CONDITIONAL** - Minor fixes needed |
| 2.5-3.4 | **NEEDS WORK** - Significant gaps |
| <2.5 | **FAIL** - Major restructuring required |

---

## Quick Checklist

### Phase Sizing
- [ ] Each phase has ≤7 work items
- [ ] Work items are bounded (no "complete refactor" items)
- [ ] Oversized phases are split into sub-phases

### Delegation Matrix
- [ ] Table present in MASTER_ORCHESTRATION
- [ ] Task → Agent mapping documented
- [ ] Rationale column explains why

### Handoff Chain
- [ ] Orchestrator prompts for all phases
- [ ] HANDOFF files for completed phases
- [ ] Files follow naming convention

### README
- [ ] All 10 canonical sections present
- [ ] Tables are properly formatted
- [ ] Exit criteria is a checklist
- [ ] Changelog has at least one entry

---

## Scoring Examples

### Example: knowledge-graph-integration (Pre-Alignment)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Phase Sizing | 1/5 | Phase 0 has 15 items |
| Delegation Matrix | 2/5 | Partial, missing from some phases |
| Handoff Chain | 3/5 | Has prompts, missing HANDOFF files |
| README Compliance | 3/5 | Missing Agent-Phase Mapping, File Reference |

**Overall**: (1×0.30) + (2×0.25) + (3×0.25) + (3×0.20) = **2.15/5 (FAIL)**

### Example: Post-Alignment Target

| Dimension | Score | Notes |
|-----------|-------|-------|
| Phase Sizing | 5/5 | All phases ≤7 items |
| Delegation Matrix | 5/5 | Full matrix in each phase |
| Handoff Chain | 4/5 | Prompts complete, handoffs for done phases |
| README Compliance | 5/5 | All sections present |

**Overall**: (5×0.30) + (5×0.25) + (4×0.25) + (5×0.20) = **4.75/5 (PASS)**

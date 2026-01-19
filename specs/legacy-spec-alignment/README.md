# Legacy Spec Alignment

> Retrofit existing specs to follow canonical patterns established in the Orchestrator Context Optimization spec.

**Status**: 🔄 **IN PROGRESS** (Phase 0)

---

## Problem Statement

The `orchestrator-context-optimization` spec established canonical patterns for:
- Phase sizing constraints (max 7 work items per phase)
- Orchestrator delegation rules
- Context budget protocol
- Handoff chain standards

However, existing specs were written before these patterns existed and exhibit violations that would cause context exhaustion if re-executed.

### Specs Requiring Alignment

| Spec | Violations | Severity |
|------|------------|----------|
| `knowledge-graph-integration` | Phase 0: 15 items (8 over limit) | High |
| `rls-implementation` | Phase 1: 8, Phase 2: 8, Phase 5: 15 items | High |
| `orchestrator-context-optimization` | Phases 0-2: 8-9 items each | Medium |

---

## Success Criteria

| Criteria | Metric | Target |
|----------|--------|--------|
| **Phase compliance** | All phases ≤7 work items | 100% |
| **Handoff chain** | All phases have HANDOFF_P[N].md | 100% |
| **Delegation rules** | Mandatory delegation matrix present | All specs |
| **README format** | Follows canonical template | All specs |

---

## Scope

### In Scope

- Split oversized phases into context-safe sub-phases
- Add missing handoff files
- Update README.md to canonical format
- Add delegation matrices where missing

### Out of Scope

- Re-executing any spec phases
- Modifying actual implementation code
- Changing spec outcomes or deliverables

---

## Key Deliverables

| Deliverable | Description |
|-------------|-------------|
| `knowledge-graph-integration` updates | Split Phase 0, add handoff chain |
| `rls-implementation` updates | Split Phases 1, 2, 5; add handoff chain |
| `orchestrator-context-optimization` updates | Split Phases 0-2 (optional, self-referential) |
| Alignment verification report | Confirm all specs meet constraints |

---

## Phases Overview

| Phase | Objective | Work Items | Primary Agent(s) |
|-------|-----------|------------|------------------|
| **P0: Analysis** | Inventory all specs, catalog violations | 5 | `codebase-researcher` |
| **P1: knowledge-graph-integration** | Align KG spec to canonical pattern | 6 | `doc-writer`, `codebase-researcher` |
| **P2: rls-implementation** | Align RLS spec to canonical pattern | 6 | `doc-writer`, `codebase-researcher` |
| **P3: Verification** | Validate all specs meet constraints | 4 | `codebase-researcher` |

**Note**: P1 and P2 can execute in parallel after P0 completes.

---

## Agent-Phase Mapping

| Phase | Primary Agent | Supporting Agent | Delegation Rationale |
|-------|---------------|------------------|---------------------|
| P0 | `codebase-researcher` | — | Multi-file inventory requires systematic exploration |
| P1 | `doc-writer` | `codebase-researcher` | README/MASTER_ORCHESTRATION restructuring |
| P2 | `doc-writer` | `codebase-researcher` | Same pattern as P1 |
| P3 | `codebase-researcher` | — | Multi-spec validation scan |

---

## File Reference

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `README.md` | Spec overview and status | Phase 0, on completion |
| `QUICK_START.md` | 5-minute triage guide | Phase 0, on completion |
| `MASTER_ORCHESTRATION.md` | Full workflow with exit criteria | Phase 0 only |
| `AGENT_PROMPTS.md` | Sub-agent prompt templates | Phase 0 only |
| `RUBRICS.md` | Scoring criteria for alignment | Phase 0 only |
| `REFLECTION_LOG.md` | Accumulated learnings | After each phase |
| `handoffs/P0_ORCHESTRATOR_PROMPT.md` | Phase 0 start prompt | Phase 0 only |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Phase 1 start prompt | After P0 |
| `handoffs/P2_ORCHESTRATOR_PROMPT.md` | Phase 2 start prompt | After P0 |
| `handoffs/P3_ORCHESTRATOR_PROMPT.md` | Phase 3 start prompt | After P0 |
| `templates/*.md` | Output templates | Phase 0 only |
| `outputs/spec-inventory.md` | All specs with metadata | P0 output |
| `outputs/violation-catalog.md` | Phase sizing violations | P0 output |

---

## Exit Criteria

- [ ] All specs in `specs/` catalogued with work item counts
- [ ] Violations documented with severity ranking
- [ ] All aligned specs have ≤7 work items per phase
- [ ] All aligned specs have complete handoff chains
- [ ] REFLECTION_LOG has entries for each completed phase
- [ ] Final verification report generated

---

## Getting Started

1. Read `QUICK_START.md` for 5-minute orientation
2. Start with `handoffs/P0_ORCHESTRATOR_PROMPT.md`
3. Follow `MASTER_ORCHESTRATION.md` for detailed phase workflows
4. Use `AGENT_PROMPTS.md` for sub-agent delegation templates
5. Score alignment using `RUBRICS.md` criteria

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-18 | Initial spec creation |

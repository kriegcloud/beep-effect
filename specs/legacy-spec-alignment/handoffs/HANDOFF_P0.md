# HANDOFF P0: Scaffolding Complete

**Spec**: `specs/legacy-spec-alignment/`
**Phase**: 0 (Scaffolding)
**Date**: 2026-01-18
**Status**: ✅ COMPLETE

---

## Summary

Scaffolded the legacy-spec-alignment spec following canonical patterns from `orchestrator-context-optimization`. Created comprehensive structure for a 4-phase spec targeting alignment of `knowledge-graph-integration` and `rls-implementation` to the new phase sizing constraints.

---

## What Was Accomplished

| Item | Status | Output |
|------|--------|--------|
| README.md with canonical sections | ✅ | Agent-Phase Mapping, File Reference, Exit Criteria |
| QUICK_START.md | ✅ | 5-minute triage guide |
| MASTER_ORCHESTRATION.md | ✅ | 4 phases with delegation matrices |
| AGENT_PROMPTS.md | ✅ | Sub-agent templates for codebase-researcher, doc-writer |
| RUBRICS.md | ✅ | Scoring criteria for alignment evaluation |
| REFLECTION_LOG.md | ✅ | Initial scaffolding entry |
| Orchestrator prompts (P0-P3) | ✅ | Copy-paste ready prompts |
| Output templates | ✅ | spec-inventory, violation-catalog, handoff-complete |

---

## Key Decisions

1. **4-Phase Structure**:
   - P0: Analysis (inventory all specs)
   - P1: knowledge-graph-integration alignment (can run parallel with P2)
   - P2: rls-implementation alignment (can run parallel with P1)
   - P3: Verification (validate all specs)

2. **Parallel Execution**: P1 and P2 target independent specs, enabling parallel orchestration after P0.

3. **Agent Selection**:
   - Primary: `codebase-researcher` for multi-file analysis
   - Secondary: `doc-writer` for README/MASTER_ORCHESTRATION restructuring

4. **Context Budget Protocol**: Included in all orchestrator prompts with Green/Yellow/Red zones.

---

## Files Created

| Path | Purpose |
|------|---------|
| `README.md` | Spec entry point |
| `QUICK_START.md` | Triage guide |
| `MASTER_ORCHESTRATION.md` | Phase workflows |
| `AGENT_PROMPTS.md` | Sub-agent templates |
| `RUBRICS.md` | Scoring criteria |
| `REFLECTION_LOG.md` | Learnings capture |
| `handoffs/P0_ORCHESTRATOR_PROMPT.md` | P0 start prompt |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | P1 start prompt |
| `handoffs/P2_ORCHESTRATOR_PROMPT.md` | P2 start prompt |
| `handoffs/P3_ORCHESTRATOR_PROMPT.md` | P3 start prompt |
| `templates/*.md` | Output templates (3 files) |
| `outputs/.gitkeep` | Placeholder |

---

## Context for P1 (Analysis)

### Starting Point

- Copy `handoffs/P0_ORCHESTRATOR_PROMPT.md` to new Claude conversation
- Follow the 5 work items in order
- Delegate to `codebase-researcher` for multi-file operations

### Expected Outputs

1. `outputs/spec-inventory.md` - All specs with metadata
2. `outputs/violation-catalog.md` - Phase sizing violations

### Dependencies

- None - P1 can start immediately

---

## Next Phase Instructions

**Phase 1: Analysis**

1. Open new Claude conversation
2. Paste contents of `handoffs/P0_ORCHESTRATOR_PROMPT.md` (note: this is actually the P1 start prompt - the file was named to match the phase it starts, not produces)
3. Execute 5 work items
4. Generate outputs in `outputs/`
5. Create `HANDOFF_P1.md` when complete

---

## Verification

```bash
# All scaffolding files exist
ls specs/legacy-spec-alignment/*.md
ls specs/legacy-spec-alignment/handoffs/*.md
ls specs/legacy-spec-alignment/templates/*.md
```

---

## Notes

- Spec-reviewer validated structure (score: 3.8/5 → 5/5 after handoffs added)
- Self-referential: This spec follows the patterns it will enforce
- Parallel execution potential: P1 and P2 are independent

# Quick Start: Legacy Spec Alignment

> 5-minute orientation for returning to this spec mid-work.

---

## Current Status

| Field | Value |
|-------|-------|
| **Phase** | P0 Ready |
| **Last Updated** | 2026-01-18 |
| **Blocking On** | Nothing - ready to execute |

---

## 30-Second Overview

This spec retrofits existing specs to follow canonical patterns:
- **Max 7 work items per phase**
- **Mandatory delegation matrices**
- **Complete handoff chains**

Target specs: `knowledge-graph-integration`, `rls-implementation`

---

## What Phase Am I In?

```
P0: Analysis      ← YOU ARE HERE (not started)
     ↓
P1: KG Alignment  (parallel with P2)
P2: RLS Alignment (parallel with P1)
     ↓
P3: Verification
```

---

## Immediate Next Action

**Start Phase 0 Analysis**:
1. Copy contents of `handoffs/P0_ORCHESTRATOR_PROMPT.md`
2. Paste into new Claude conversation
3. Follow the 5 work items in the prompt

---

## Key Files

| Need To... | Read This |
|------------|-----------|
| Start P0 | `handoffs/P0_ORCHESTRATOR_PROMPT.md` |
| Understand scope | `README.md` |
| See full workflow | `MASTER_ORCHESTRATION.md` |
| Review learnings | `REFLECTION_LOG.md` |

---

## Decision Tree

```
Q: Has P0 been completed?
├─ NO → Start with P0_ORCHESTRATOR_PROMPT.md
└─ YES → Check outputs/violation-catalog.md exists
         ├─ NO → P0 incomplete, check handoffs/
         └─ YES → Ready for P1 and P2 (can run in parallel)

Q: Has P1 been completed?
├─ NO → Start P1_ORCHESTRATOR_PROMPT.md
└─ YES → Check handoffs/HANDOFF_P1_COMPLETE.md exists

Q: Has P2 been completed?
├─ NO → Start P2_ORCHESTRATOR_PROMPT.md
└─ YES → Check handoffs/HANDOFF_P2_COMPLETE.md exists

Q: Are both P1 and P2 complete?
├─ NO → Complete remaining phase
└─ YES → Start P3_ORCHESTRATOR_PROMPT.md for verification
```

---

## Quick Verification

```bash
# Check phase progress
ls specs/legacy-spec-alignment/outputs/
ls specs/legacy-spec-alignment/handoffs/HANDOFF_P*_COMPLETE.md 2>/dev/null

# See what's been done
head -50 specs/legacy-spec-alignment/REFLECTION_LOG.md
```

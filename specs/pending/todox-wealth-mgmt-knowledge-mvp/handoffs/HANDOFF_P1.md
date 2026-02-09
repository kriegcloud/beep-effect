# Phase P1 Handoff: MVP Demo Implementation Plan

**Date**: 2026-02-09  
**From**: Phase P0 (Decisions + contracts)  
**To**: Phase P1 (PR breakdown + gates)  
**Status**: Ready

---

## Phase P0 Summary (What P1 Inherits)

P0 locked the demo narrative and contracts:

- `outputs/P0_DECISIONS.md` is authoritative for decisions/contracts.
- `outputs/R0_SYNTHESIZED_REPORT_V3.md` is the single synthesis input.
- Evidence-of-record and offset drift invariants are locked (C-02, C-05).

---

## Source Verification (MANDATORY)

P1 produces a plan only (no external API response schemas are introduced here). Any external API response schemas introduced during implementation must follow `specs/_guide/HANDOFF_STANDARDS.md` and be recorded in the relevant phase handoff (typically P2+).

| Method | Source File | Line | Test File | Verified |
|--------|-------------|------|----------|----------|
| N/A | N/A | N/A | N/A | N/A |

---

## Context for Phase P1

### Working Context (≤2K tokens)

- Current task: produce an executable PR breakdown with acceptance gates.
- Success criteria:
  - Each PR has: scope, deliverables, acceptance gates, verification commands.
  - Blockers are encoded as gates (not prose), especially:
    - multi-account selection + `providerAccountId` enforcement
    - thread aggregation read model
    - meeting-prep evidence persistence (demo requirement)
    - relation evidence-of-record (`relation_evidence`, no fragile join paths)
    - `/knowledge` UI depends on persisted evidence
- Blocking issues:
  - None expected; if ambiguity is discovered, lock it in `outputs/P0_DECISIONS.md` + changelog.
- Immediate dependencies:
  - `outputs/P0_DECISIONS.md`
  - `outputs/P1_PR_BREAKDOWN.md` (update in place)
  - `README.md` success criteria and phase plan

### Episodic Context (≤1K tokens)

- P0 eliminated prior drift:
  - Connections UI host is TodoX Settings → Connections (D-01).
  - Evidence.List contract is canonical (C-02) and includes `documentVersionId`.

### Semantic Context (≤500 tokens)

- Non-negotiable invariants:
  - Evidence is SQL spans; UI shows nothing without evidence.
  - Offsets pin to immutable document versions (C-05).
  - TodoX UI must call `apps/server` for Gmail/OAuth operations.

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `documentation/EFFECT_PATTERNS.md`

---

## Context Budget Status

- Direct tool calls: 0 (baseline; update during phase execution)
- Large file reads (>200 lines): 0 (baseline; update during phase execution)
- Sub-agent delegations: 0 (baseline; update during phase execution)
- Zone: Green (baseline; update during phase execution)

## Context Budget Checklist

- [ ] Working context ≤2,000 tokens
- [ ] Episodic context ≤1,000 tokens
- [ ] Semantic context ≤500 tokens
- [ ] Procedural context is links only
- [ ] Critical information at document start/end
- [ ] Total context ≤4,000 tokens

# Phase P0 Handoff: Decisions + Contracts

**Date**: 2026-02-09  
**From**: Spec bootstrap  
**To**: Phase P0 (Decisions + contracts)  
**Status**: Ready

---

## Phase P0 Summary

Phase P0 exists to lock the demo narrative and the contracts that prevent rework:

- MVP scope is locked: Gmail → Documents → Knowledge graph → `/knowledge` UI → meeting prep with persisted evidence.
- Evidence-of-record is locked: SQL spans only (`mention`, `relation_evidence`), and `Evidence.List` is canonical (C-02).
- Offset drift is locked out: evidence spans pin to `documentVersionId` and UTF-16 indices (C-05).
- Demo-fatal gaps are converted into PR gates: multi-account selection (`providerAccountId`), thread aggregation read model, meeting-prep persistence.

## Key Learnings Applied

- Cross-doc drift is easy to reintroduce; treat `outputs/P0_DECISIONS.md` and `outputs/P1_PR_BREAKDOWN.md` as executable sources of truth.
- Any doc that uses old evidence field names (`sourceType/sourceId`) must either be updated or explicitly marked as deprecated.

---

## Source Verification (MANDATORY)

This phase does not introduce new response schemas for external APIs (Google APIs, Better Auth). Any external API response schemas introduced during implementation must follow `specs/_guide/HANDOFF_STANDARDS.md` verification process and be recorded in the relevant phase handoff.

| Method | Source File | Line | Test File | Verified |
|--------|-------------|------|----------|----------|
| N/A | N/A | N/A | N/A | N/A |

---

## Context for Phase P0

### Working Context (≤2K tokens)

- Current task: finalize and lock P0 decisions/contracts so P1 can execute without rediscovery.
- Success criteria:
  - `outputs/P0_DECISIONS.md` has no `PROPOSED` decisions blocking MVP.
  - Contracts C-01/C-02/C-03/C-05 are consistent across spec outputs and PR gates.
  - `outputs/P1_PR_BREAKDOWN.md` includes explicit acceptance gates for demo-fatal constraints.
- Blocking issues:
  - None expected; if new gaps are discovered, record them as `LOCKED` decisions or PR gates.
- Immediate dependencies:
  - `outputs/R0_SYNTHESIZED_REPORT_V3.md`
  - `outputs/P0_DECISIONS.md`
  - `outputs/P1_PR_BREAKDOWN.md`

### Episodic Context (≤1K tokens)

- Prior state: the spec originally drifted across outputs (Evidence.List shape, Connections UI host).
- What was fixed:
  - Evidence.List canonical contract is locked (C-02) and reconciled across outputs.
  - Connections UI is locked to TodoX Settings → Connections (D-01).

### Semantic Context (≤500 tokens)

- Tech stack: Bun monorepo, Effect 3, Next.js App Router, Postgres/Drizzle, better-auth, Redis.
- Architectural constraints:
  - Slice boundaries: no cross-slice DB coupling; store `providerAccountId` as typed string (IAM `account.id`), not FK.
  - TodoX is a demo UI only; all Gmail operations run behind `apps/server` with `AuthContext.layer` + `GoogleWorkspace.layer`.
- Evidence invariants:
  - `Evidence.List` returns `documentId + documentVersionId + offsets`, never RDF.

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

# Phase P2 Handoff: Hardening (Restart Safety, Isolation, Integrity)

**Date**: 2026-02-09  
**From**: Phase P1 (PR breakdown + gates)  
**To**: Phase P2 (implementation + hardening)  
**Status**: Ready

---

## Phase P1 Summary (What P2 Inherits)

- P0 contracts are locked in `outputs/P0_DECISIONS.md` (no drift allowed without changelog update).
- The executable PR plan is `outputs/P1_PR_BREAKDOWN.md`.
- `/knowledge` UI must not ship without persisted evidence-backed meeting prep (PR4 blocked on PR3 + PR5).

---

## Source Verification (MANDATORY)

P2 will touch external APIs (Google APIs via adapters, Better Auth OAuth flows). Before implementing or changing any response schemas for these APIs, verify shapes against source and record them here.

| Method / Surface | Source File | Line | Test File | Verified |
|------------------|------------|------|----------|----------|
| IAM OAuth link flow (`oauth2.link`) | `packages/iam/client/src/oauth2/link/*` | TBD | TBD | N |
| Account listing (`core.listAccounts`) | `packages/iam/client/src/core/list-accounts/*` | TBD | TBD | N |
| Google token validation (`getValidToken`) | `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts` | TBD | TBD | N |
| Gmail adapter required scopes + call sites | `packages/comms/server/src/adapters/GmailAdapter.ts` | TBD | TBD | N |

**Verification Process**: follow `specs/_guide/HANDOFF_STANDARDS.md` and replace TBD/N with file:line + Verified=Y when complete.

---

## Context for Phase P2

### Working Context (≤2K tokens)

- Current task: implement and harden the MVP demo path so it is deterministic, restart-safe, and isolation-safe.
- Success criteria:
  - Restart-safe: after full server restart, `/knowledge` flow works and evidence highlights resolve.
  - Evidence integrity: every UI claim resolves to `documentId + documentVersionId + offsets` (C-02, C-05).
  - No fragile join paths: relation evidence never depends on `relation.extractionId -> extraction.documentId`.
  - Multi-tenant isolation: cross-org tests cover the entire demo critical path (including embeddings).
  - Idempotency: reruns do not duplicate documents/extractions/evidence.
- Blocking issues:
  - If any `documentVersionId` is missing in evidence tables, treat it as demo-fatal (offset drift).
- Immediate dependencies:
  - `outputs/P0_DECISIONS.md`
  - `outputs/P1_PR_BREAKDOWN.md`
  - `outputs/R12_EVIDENCE_MODEL_CANON.md`
  - `outputs/R13_PII_REDACTION_ENCRYPTION_PLAN.md`

### Episodic Context (≤1K tokens)

- The spec previously drifted on evidence shape and UI host; those have been reconciled.
- The plan now encodes demo-fatal constraints as PR gates (multi-account, thread read model, meeting-prep persistence).

### Semantic Context (≤500 tokens)

- Non-goals: calendar sync, push watch/webhooks, Outlook/IMAP, doc editor, multi-source resolution.
- Boundaries: TodoX is demo UI; Gmail/OAuth live behind `apps/server`.
- Data invariants:
  - document content is immutable per version; evidence pins to version (C-05).
  - SQL is evidence-of-record; RDF provenance is supplemental only.

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

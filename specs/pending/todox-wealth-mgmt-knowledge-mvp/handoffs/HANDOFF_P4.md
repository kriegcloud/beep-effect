# Phase P4 Handoff: Production Readiness (Scale / Ops / Compliance)

**Date**: 2026-02-09  
**From**: Phase P3 (IaC + staging deploy)  
**To**: Phase P4 (production readiness)  
**Status**: Ready

---

## Phase P3 Summary (What P4 Inherits)

- Staging exists (or is planned) with reproducible provisioning/deploy.
- Observability (OTLP) and migrations-as-a-job are non-negotiable gates.

---

## Source Verification (MANDATORY)

P4 is production readiness work. If any new external API integrations are added for ops (e.g., paging, incident hooks), verify and record response shapes here.

| Method / Surface | Source File | Line | Test File | Verified |
|------------------|------------|------|----------|----------|
| N/A | N/A | N/A | N/A | N/A |

---

## Context for Phase P4

### Working Context (≤2K tokens)

- Current task: close production readiness gates with artifacts that an operator can actually run.
- Success criteria:
  - Runbooks exist and are executable (not placeholders): `outputs/P4_RUNBOOK_beep-api_prod.md`.
  - Production readiness checklist is closed with explicit PASS/FAIL: `outputs/P4_PROD_READINESS_CHECKLIST_prod.md`.
  - Isolation tests exist and pass in staging.
  - Retention + audit posture is defined for documents, evidence, and meeting-prep outputs.
  - Meeting-prep output includes compliance-safe disclaimer and avoids guarantees (D-17).
- Immediate dependencies:
  - `outputs/P4_PROD_READINESS_CHECKLIST_prod.md`
  - `outputs/P4_RUNBOOK_beep-api_prod.md`
  - `outputs/R15_PII_AI_ARCHITECTURE_RESEARCH_SUMMARY.md`
  - `inputs/PII_AI_RESEARCH_RAW.md`

### Episodic Context (≤1K tokens)

- MVP is demo-first, but production posture must be credible for wealth management:
  - safe-buttons tool boundary (no arbitrary SQL/code)
  - prompt minimization + citations
  - no PII logging

### Semantic Context (≤500 tokens)

- Security/compliance invariants:
  - evidence is auditable and persisted
  - disclosure is evidence-cited and necessary only (D-17)
- Ops invariants:
  - backups/restore documented
  - rollback/backout practiced in staging

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`

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

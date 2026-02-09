# Phase P3 Handoff: IaC / Staging

**Date**: 2026-02-09  
**From**: Phase P2 (hardening implementation)  
**To**: Phase P3 (IaC + staging deploy)  
**Status**: Ready

---

## Phase P2 Summary (What P3 Inherits)

- MVP scope is fixed; do not widen product scope in infra work.
- All secrets/env vars must match `@beep/shared-env` schemas; do not introduce ad-hoc env names.
- Migrations run as a job (pre-deploy), not at app startup.

---

## Source Verification (MANDATORY)

P3 is infrastructure-focused. External services/providers (Cloud Run, Secret Manager, Cloud SQL, Redis, OTLP collectors, AWS S3) are configured, not schema-modeled. If any external API contracts are introduced (e.g., deploy webhook integrations), verify and record here.

| Method / Surface | Source File | Line | Test File | Verified |
|------------------|------------|------|----------|----------|
| N/A | N/A | N/A | N/A | N/A |

---

## Context for Phase P3

### Working Context (≤2K tokens)

- Current task: create a reproducible staging environment (and a clear production path) using the IaC decision (Terraform).
- Success criteria:
  - Staging deploy is reproducible end-to-end.
  - Secrets live only in a secret manager and are injected at runtime.
  - Migrations job exists and is observable; failures block deploy.
  - OTLP traces/logs/metrics are visible in dashboards with actionable alerts.
- Immediate dependencies:
  - IaC gates: `outputs/P3_IAC_GATES_staging.md`
  - Prod readiness checklist (staging): `outputs/P4_PROD_READINESS_CHECKLIST_staging.md`
  - Runbook (staging): `outputs/P4_RUNBOOK_beep-api_staging.md`
  - IaC tool decision: `outputs/R14_IAC_TOOLING_DECISION_SST_VS_TF.md`

### Episodic Context (≤1K tokens)

- The repo accepts a cross-cloud posture for MVP: GCP Cloud Run runtime with AWS S3 credentials in env schema.

### Semantic Context (≤500 tokens)

- Invariants:
  - no PII logging
  - demo critical path must remain org-scoped
  - schema-validated env var names only (`@beep/shared-env`)

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

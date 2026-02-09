# Phase P3 Handoff: IaC / Staging

**Date**: 2026-02-09  
**From**: Phase P2 (hardening implementation)  
**To**: Phase P3 (IaC + staging deploy)  
**Status**: Ready

---

## Phase P2 Summary (What P3 Inherits)

- MVP credibility is now guarded by tests and hard invariants:
  - Evidence spans are SQL-of-record and are version-pinned: `{ documentId, documentVersionId, startChar, endChar }` using UTF-16 JS indices, 0-indexed, end-exclusive.
  - Multi-tenant isolation is enforced with RLS and hardening tests (including embeddings/vector search).
  - Server never selects a default provider account when `providerAccountId` is missing (typed C-06 payload instead).
- UI surface for OAuth callback deep-links exists:
  - `/settings` route in `apps/web` redirects to `/dashboard` while preserving `settingsTab=connections` and other query params.
  - Connections tab exists in Account Settings and persists org-level active Google `providerAccountId` via org `metadata`.
- P3 must preserve these invariants and keep the demo path working under staging URLs.
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
  - Demo hardening gates remain green in staging (at minimum: evidence list + meeting prep evidence click-through; no cross-org leakage).
- Immediate dependencies:
  - IaC gates: `outputs/P3_IAC_GATES_staging.md`
  - Prod readiness checklist (staging): `outputs/P4_PROD_READINESS_CHECKLIST_staging.md`
  - Runbook (staging): `outputs/P4_RUNBOOK_beep-api_staging.md`
  - IaC tool decision: `outputs/R14_IAC_TOOLING_DECISION_SST_VS_TF.md`

### High-Signal P2 Changes (for troubleshooting in staging)

- Evidence resolvability is validated against immutable document version content length in JS (UTF-16):
  - `packages/knowledge/server/src/rpc/v1/evidence/list.ts`
- Meeting prep generation persists output transactionally (bullets + citations are inserted atomically); restart-safety is asserted in DB hardening tests:
  - `packages/knowledge/server/src/rpc/v1/meetingprep/generate.ts`
  - `packages/_internal/db-admin/test/hardening/DemoCriticalPathHardening.test.ts`
- Provider account selection is enforced and unit-tested:
  - `packages/runtime/server/src/AuthContext/providerAccountSelection.ts`
  - `packages/runtime/server/test/AuthContextProviderAccountSelection.test.ts`
- Cross-org leakage coverage was expanded to include Evidence.List and `knowledge_meeting_prep_evidence`:
  - `packages/_internal/db-admin/test/hardening/DemoCriticalPathHardening.test.ts`
- PII/logging hardening: Gmail extraction no longer annotates logs with raw query text:
  - `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`
- OAuth callback deep-link compatibility:
  - `apps/web/src/app/settings/page.tsx`
  - `apps/web/src/features/account/connections/ConnectionsTabPanel.tsx`

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

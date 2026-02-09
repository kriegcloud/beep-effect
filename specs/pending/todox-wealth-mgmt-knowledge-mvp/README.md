# TodoX Wealth Mgmt Knowledge MVP

**Status**: Phase P0 (Decisions + contracts)  
**Complexity**: Complex (multi-phase, multi-session)  
**Primary input**: `outputs/R0_SYNTHESIZED_REPORT_V3.md`
**PII/AI research (raw)**: `inputs/PII_AI_RESEARCH_RAW.md`  
**P0 decision record**: `outputs/P0_DECISIONS.md`  
**P0 decision changelog**: `outputs/P0_DECISIONS_CHANGELOG.md`  
**P1 execution plan**: `outputs/P1_PR_BREAKDOWN.md`  

## Purpose

Ship a credible, demo-first **Knowledge Base** MVP for wealth management that can:

- Ingest Gmail messages into Documents
- Extract entities/relations into Knowledge (persisted to SQL)
- Render a Knowledge Graph UI with **Evidence Always**
- Produce meeting-prep output grounded in persisted evidence

The MVP is explicitly demo-narrative driven: a 5-minute end-to-end story that works from a clean login without manual endpoint calls.

## Background (Why This Exists)

The current repo has most of the building blocks (IAM OAuth2 server/client, Knowledge extraction contracts, graph visualization UI components), but the synthesized research surfaced blockers that prevent an end-to-end Gmail-driven demo:

- No IAM UI path to link/relink Google accounts or manage incremental scopes.
- Missing typed contract for scope expansion errors, which makes deterministic UX impossible.
- Provenance in RDF is ephemeral/incomplete; UI-grade evidence must be persisted in SQL (primarily `knowledge.mention`).

See `outputs/R0_SYNTHESIZED_REPORT_V3.md` for the full synthesis and “load-bearing decisions”.

## Scope

### In Scope (MVP demo path)

- **Connected Accounts UX (Google)**
  - Link/relink Google via UI (incremental consent supported)
  - Display which scopes are present
  - Unlink account
- **Gmail -> Documents materialization**
  - Documents-owned mapping table (e.g. `document_source`) keyed by `(organizationId, providerAccountId, sourceId)`
  - Idempotent upsert policy for re-runs
- **Knowledge persistence**
  - Extractions persist to SQL tables (entities/relations/mentions)
  - Embeddings computed/stored for extracted entities (so GraphRAG/meeting prep is not “empty”)
- **Evidence-first contracts**
  - `Evidence.List` (or equivalent) returns spans with `documentId + documentVersionId + offsets` for deterministic highlighting
  - Relation evidence is resolvable (no optional-join dead ends)
- **Single Knowledge Base UI route**
  - One `/knowledge` screen (graph + query/meeting-prep + inspector/evidence)
  - No happy-path mocks on the demo flow
- **WM synthetic demo dataset**
  - Required content and expected outcomes are pre-defined (see Success Criteria)

### Non-Goals (Explicit exclusions for MVP)

- Full Calendar sync (read/write)
- Real-time Gmail push/webhooks (watch + Pub/Sub)
- Outlook/IMAP support
- Full document editor and manual annotation UX
- Multi-source entity resolution and long-horizon identity merge workflows
- Multi-tenant performance tuning beyond what’s required for the demo

## Success Criteria (Demo Pass/Fail)

The demo is “pass” only if ALL are true:

- A user can link or relink Google entirely via UI, including incremental scope expansion when missing.
- Dataset contains: meeting date, account detail, life event, action item, and at least one compliance-sensitive phrase.
- The Knowledge Graph shows at least:
  - one Household, one Client, one Account, one LifeEvent, one ActionItem
  - typed edges linking them
- Meeting prep output includes: summary, recent comms, open actions, and evidence references for each section.
- Evidence is inspectable in the UI for at least:
  - one entity
  - one relation or claim
  - one meeting-prep bullet
- No cross-household/org data appears in any query path used in the demo.
- Output avoids guarantees and includes a compliance-safe disclaimer where applicable.

## Architecture Overview (Gmail -> Docs -> Knowledge -> UI)

High-level pipeline and ownership boundaries (slice-safe):

```
Google OAuth (IAM)  ──►  Gmail API (adapter)
        │                     │
        │                     ▼
        │             Documents materializer
        │          - document + version creation
        │          - Documents-owned document_source mapping
        │                     │
        ▼                     ▼
Connections UI         Knowledge extraction pipeline
 - link/relink         - persist entity/relation/mention to SQL
 - scope display       - compute/store embeddings
 - unlink              - Evidence.List (spans w/ docId + offsets)
                              │
                              ▼
                      TodoX UI: /knowledge
                       - left: query + meeting prep
                       - center: graph
                       - right: inspector + evidence
```

Boundary rules to keep intact:

- The Gmail-to-Documents mapping table is owned by **Documents** (not Knowledge).
- Avoid cross-slice DB coupling: store IAM account identifiers as typed strings, not foreign keys.
- Treat SQL as the evidence-of-record for UI; RDF provenance can exist, but must not be the UI source of truth.

## Phase Plan (To Production)

This spec is organized as a production-oriented plan with explicit gates.

### Phase Overview

| Phase | Name | Primary Output | Exit Criteria (Pass/Fail) |
|------:|------|----------------|------------------|
| **P0** | Decisions + contracts | `outputs/P0_DECISIONS.md` + locked scope/dataset/contracts | All P0 open questions resolved and recorded; evidence model has no unresolved joins or ambiguous ownership |
| **P1** | MVP demo implementation plan | `outputs/P1_PR_BREAKDOWN.md` | Plan is executable: each PR has scoped diffs, explicit acceptance gates, and verification commands |
| **P2** | Hardening | Integrity constraints + restart safety + isolation tests + PII/logging gates | Restart-safe demo + org isolation tests + evidence resolvability tests + idempotency validated |
| **P3** | IaC / Staging | IaC baseline + migrations job + secrets/OTLP wiring | Staging deploy is reproducible end-to-end; env vars match `@beep/shared-env`; telemetry and alerts verified |
| **P4** | Scale / Prod readiness | Load tests, runbooks, retention/audit posture, rollout plan | Production readiness checklist complete; runbooks exist; rollout gates defined (pilot -> staging -> prod) |

## Production Readiness (Explicit Gates)

These gates are tracked across phases but must be closed by **P4**. Templates live in `templates/` for turning these into environment-specific documents under `outputs/`.

Recommended artifacts:

- `templates/PROD_READINESS_CHECKLIST_TEMPLATE.md` -> `outputs/P4_PROD_READINESS_CHECKLIST_[env].md`
- `templates/IAC_GATES_TEMPLATE.md` -> `outputs/P3_IAC_GATES_[env].md`
- `templates/RUNBOOK_TEMPLATE.md` -> `outputs/P4_RUNBOOK_[service]_[env].md`

Concrete environment stubs (this spec):

- IaC gates:
  - `outputs/P3_IAC_GATES_staging.md`
  - `outputs/P3_IAC_GATES_prod.md`
- Prod readiness checklists:
  - `outputs/P4_PROD_READINESS_CHECKLIST_staging.md`
  - `outputs/P4_PROD_READINESS_CHECKLIST_prod.md`
- Runbooks:
  - `outputs/P4_RUNBOOK_beep-api_staging.md` (`apps/server` / `beep-api`)
  - `outputs/P4_RUNBOOK_beep-api_prod.md` (`apps/server` / `beep-api`)

### Security & Compliance Gates (Pass/Fail)

- PII logging:
  - No PII in logs; redaction rules documented; sensitive payloads never logged.
- Audit posture:
  - Evidence access is auditable (who accessed what, when).
  - Meeting-prep claims are traceable to persisted evidence spans.
- Retention posture:
  - Retention windows are defined for documents, mentions, and meeting-prep artifacts.
  - Deletion/erasure pathway is documented (may be manual for MVP, but must be explicit).
- Disclaimers:
  - Meeting-prep output includes a compliance-safe disclaimer (no guarantees, no advice language).

### Multi-Tenant Isolation Gates (Pass/Fail)

- Cross-org tests exist and pass for every demo query path:
  - Gmail -> Documents mapping (idempotent materialization per org).
  - Knowledge queries (entities/relations/mentions).
  - Embeddings/vector paths (no mixed org corpus).
  - Evidence listing/highlighting (`documentId + documentVersionId + offsets` remain org-scoped).
  - Meeting-prep generation and persisted citations.
- Query scoping invariants are consistent across services (no "forgot to filter by orgId" edge paths).

### Ops Gates (Pass/Fail)

- Migrations:
  - Migrations run as a job (serialized pre-deploy), not at app startup.
  - Failure blocks deploy and is observable.
- Secrets:
  - Secrets stored only in a secret manager; injected at runtime; never committed.
- Backups/DR:
  - Backups configured with retention; restore procedure documented.
  - DR posture documented with RPO/RTO targets (even if best-effort for MVP).
- SLOs:
  - Availability/latency/error SLOs defined for the `/knowledge` critical path.

### Observability Gates (Pass/Fail)

- OTLP configured and verified for traces/logs/metrics (server; client if enabled).
- Dashboards exist for:
  - API latency/error rate
  - DB/Redis saturation and failures
  - workflow/worker health (if applicable)
- Alerts exist and are actionable (high error rate, elevated latency, migration failures, auth/session failures).

### Workflow Topology Gates (Pass/Fail)

- A single topology decision is recorded and enforced:
  - `SingleRunner` vs multi-node/cluster.
- If multi-node/cluster:
  - Table prefixing/ownership/isolation rules are explicit and verified (no shared tables across environments/orgs).
  - Idempotency keys and replay safety are defined for background/materialization work.
- If single-node:
  - Cold start and restart behavior are documented; recovery steps exist.

## Release / Rollout (Pilot -> Staging -> Prod)

### Pilot

- Entry criteria:
  - MVP demo path works end-to-end locally; cross-org isolation tests exist and pass.
  - Evidence resolvability and meeting-prep citations are persisted and restart-safe.
- Exit criteria:
  - Pilot users complete the 5-minute demo narrative without manual endpoint calls.
  - Known issues list is captured with severity and a backout plan.

### Staging

- Entry criteria:
  - IaC gates satisfied in staging (`outputs/P3_IAC_GATES_staging.md` or equivalent).
  - Migrations job and secret manager wiring are validated.
- Exit criteria:
  - Smoke test passes on staging: login -> link/relink -> `/knowledge` -> evidence inspect.
  - Telemetry visible in dashboards; alerts configured and verified at least once.

### Production

- Entry criteria:
  - Production readiness checklist complete (`outputs/P4_PROD_READINESS_CHECKLIST_prod.md` or equivalent).
  - Runbooks exist for primary services and failure modes.
- Exit criteria:
  - Rollout completed with monitoring gates and backout verified.
  - Post-release review captured (incidents, latency/errors, and next hardening items).

## Key Decisions To Lock In P0 (No Ambiguity)

These decisions are load-bearing for avoiding rework (see `outputs/R0_SYNTHESIZED_REPORT_V3.md`):

- OAuth UX surface: implement “Connections” in existing settings tab (`settingsTab=connections`) vs new route.
- Typed scope expansion contract: define the tagged error payload shape (must include `missingScopes` and relink parameters).
- Gmail materialization identity: decide what `providerAccountId` means (IAM account id vs external provider identity).
- Message-to-document policy: `1 message = 1 document` for MVP vs attachments-as-documents (future).
- Immutability policy for Gmail-sourced documents (lock vs editable + materialization policy).
- Idempotency: exact `sourceHash` inputs and normalization rules.
- Soft-delete + uniqueness semantics for `document_source` (partial unique on `deleted_at IS NULL` vs strict unique).
- Relation evidence resolvability: relation evidence-of-record is `relation_evidence` rows (D-08). Evidence must not depend on `relation.extractionId -> extraction.documentId`.
- Evidence-of-record: commit to `knowledge.mention` as the span store for entity evidence; deprecate JSONB mentions for UI.
- Meeting-prep evidence persistence model (bullets -> citations) and when it lands (demo requirement; PR4 blocked on PR5).
- Knowledge Base UI route decision: a single `/knowledge` screen for demo; other demo pages are dev tools only.
- Workflow topology decision: `SingleRunner` vs durable cluster; if cluster, prefix/isolate tables and document ownership.
- Environment contract source-of-truth: `@beep/shared-env` schemas; IaC variables must match exactly.

## Open Questions (Track and Close in P0)

- Which Google scopes are mandatory for the demo path (Gmail only vs Gmail + Calendar) and how are they displayed?
- What is the minimal WM ontology registry entry (entity/relation sets + required attributes) for the dataset?
- What constitutes a “claim” in meeting prep (bullet, section, sentence) for evidence mapping and audit?
- What’s the target staging platform (and storage posture, S3-only vs future) for P3?

## Key Risks (And Why They Matter)

- **IAM UI linking gap**: blocks Gmail workflows unless Connected Accounts exists and is usable.
- **Untyped scope expansion errors**: forces string matching; leads to broken relink UX and demo failures.
- **Ephemeral RDF provenance**: loses evidence on restart; cannot meet “Evidence Always”.
- **Relation evidence dead ends**: any model allowing evidence without a resolvable document will create UI dead links.
- **Cross-tenant leakage**: embeddings + mentions + graph queries must remain org-scoped; leakage is demo-fatal.
- **Env/IaC drift**: env var naming mismatches create fragile staging/prod deploys; treat env schemas as authoritative.

## Orchestration + Handoff Rules

This spec is designed for multi-session execution.

- Orchestration rules live in `AGENT_PROMPTS.md`.
- **Handoff gate (explicit)**: when context feels ~50% consumed (or before starting a large/risky task), STOP and checkpoint even if the phase is not "done".
  - Minimum checkpoint artifacts:
    - `handoffs/HANDOFF_P[N].md`
    - `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
  - At the same gate, create/update next-phase artifacts (so a fresh instance can continue):
    - `handoffs/HANDOFF_P[N+1].md`
    - `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`

## Decision Freeze (P0)

- Implementation planning (P1) must treat `outputs/P0_DECISIONS.md` as the contract surface.
- Any change to a `LOCKED` decision requires:
  - updating `outputs/P0_DECISIONS.md`
  - recording an entry in `outputs/P0_DECISIONS_CHANGELOG.md`
  - updating affected gates in `outputs/P1_PR_BREAKDOWN.md`

## Research Inputs (R0-R16)

- R0 synthesis (use this as the orchestrator’s single input):
  - `outputs/R0_SYNTHESIZED_REPORT_V3.md`
- Research reports:
  - `outputs/R1_TOP_SPECS_5_OF_5_PATTERNS.md`
  - `outputs/R2_EFFECT_WORKFLOW_CLUSTER_PATTERNS.md`
  - `outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`
  - `outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`
  - `outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`
  - `outputs/R6_OAUTH_SCOPE_EXPANSION_FLOW.md`
  - `outputs/R7_GMAIL_DOCUMENT_MAPPING_DESIGN.md`
  - `outputs/R8_PROVENANCE_PERSISTENCE_AND_API.md`
  - `outputs/R9_TODOX_KNOWLEDGE_BASE_UI_PLAN.md`
  - `outputs/R10_THREAD_AGGREGATION_LAYER.md`
  - `outputs/R11_MULTI_ACCOUNT_ORG_PLAN.md`
  - `outputs/R12_EVIDENCE_MODEL_CANON.md`
  - `outputs/R13_PII_REDACTION_ENCRYPTION_PLAN.md`
  - `outputs/R14_IAC_TOOLING_DECISION_SST_VS_TF.md`
  - `outputs/R15_PII_AI_ARCHITECTURE_RESEARCH_SUMMARY.md`
  - `outputs/R16_GAPS_AUDIT.md`

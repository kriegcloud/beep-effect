# P1 PR Breakdown (Executable Plan)

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Phase**: P1 (MVP demo implementation plan)  
**Status**: Draft (depends on finalizing `outputs/P0_DECISIONS.md`)  

This document turns the spec into small, reviewable PRs with explicit acceptance gates.

Decision dependencies:
- P0 decision record: `outputs/P0_DECISIONS.md`
- Any change to `LOCKED` decisions must be recorded in: `outputs/P0_DECISIONS_CHANGELOG.md`

## Global Rules (Apply to Every PR)

- No happy-path mocks for the demo flow.
- Every UI fact must have evidence (`documentId + offsets`) or it must not be displayed.
- No cross-org leakage: every PR includes at least one isolation test/guard relevant to its changes.
- Do not implement Calendar/webhooks/Outlook/IMAP/doc editor/multi-source resolution.

## PR0: Connected Accounts + Typed Scope Expansion Contract

Goal: unblock Google link/relink UX and deterministic scope expansion remediation.

Deliverables:
- A “Connections” UI (settings tab) that can:
  - link Google
  - relink with expanded scopes
  - unlink
  - display current scope string
- A typed error contract surfaced from Gmail/Calendar-dependent endpoints:
  - includes `missingScopes` + relink params (per `outputs/P0_DECISIONS.md`)

Acceptance gates (pass/fail):
- Missing scopes produces a deterministic UI relink prompt.
- A user can link/relink entirely via UI (no manual endpoint calls).

P0 decision dependencies:
- D-01 (LOCKED): OAuth UX surface = settings tab `connections`
- D-02 (LOCKED): typed scope expansion contract (no string matching)

Verification commands:
```bash
bun run check
bun run test
```

## PR1: Gmail → Documents Materialization + Idempotency

Goal: create durable, slice-correct identity mapping and document materialization.

Deliverables:
- Documents-owned mapping table (e.g. `document_source`) keyed by:
  - `(organizationId, providerAccountId, sourceType="gmail", sourceId=gmailMessageId)`
- Materializer service:
  - creates/updates document + version
  - upserts mapping row
  - stores minimal metadata (`threadId`, `sourceHash`, etc.)

Acceptance gates:
- Re-running sync does not duplicate documents.
- Mapping is org-scoped and provider-account-scoped (no collisions across linked accounts).
- No cross-slice DB foreign keys introduced (IAM id stored as typed string).

P0 decision dependencies:
- D-03 (LOCKED): providerAccountId = IAM `account.id` stored as typed string
- D-04 (LOCKED): 1 Gmail message = 1 document (MVP)
- D-05 (LOCKED): Gmail-sourced documents immutable/locked (MVP)
- D-06 (PROPOSED): sourceHash inputs/normalization must be locked before merging PR1
- D-07 (PROPOSED): soft delete semantics must be locked before merging PR1

Verification commands:
```bash
bun run check --filter @beep/documents-server
bun run test  --filter @beep/documents-server
```

## PR2: Extraction Persistence + Embeddings

Goal: ensure Knowledge extraction writes to SQL tables and embeddings exist so GraphRAG is non-empty.

Deliverables:
- Authoritative ingestion step that persists:
  - extraction row lifecycle
  - entities
  - relations
  - mentions (span store)
  - embeddings for extracted entities

Acceptance gates:
- After extraction, GraphRAG queries return non-empty results for the demo dataset.
- Restart does not lose extracted graph state (SQL is record-of-truth).

Verification commands:
```bash
bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server
```

## PR3: Evidence Surfaces (`Evidence.List`) + Relation Evidence Resolvability

Goal: make “Evidence Always” real and deterministic in UI.

Deliverables:
- `Evidence.List` endpoint/RPC:
  - supports entity, relation, and meeting-prep bullet filters
  - returns `documentId + offsets` spans
- Relation evidence invariant is enforced (no optional join dead ends):
  - choose and implement the invariant from `outputs/P0_DECISIONS.md` (D-08)

Acceptance gates:
- Evidence panel can highlight source text deterministically for:
  - one entity mention
  - one relation/claim
- No evidence item can exist without a resolvable source doc/span.

P0 decision dependencies:
- D-08 (PROPOSED): lock relation evidence resolvability invariant before merging PR3
- D-09 (LOCKED): SQL is evidence-of-record; Evidence.List returns docId+offset spans

Verification commands:
```bash
bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server
```

## PR4: `/knowledge` UI (Single Demo Surface)

Goal: wire the demo to real APIs and consolidate UI into one route.

Deliverables:
- `/knowledge` page:
  - left: query + meeting-prep
  - center: graph
  - right: inspector + evidence panel
- No happy-path mocks; UI uses real endpoints.

Acceptance gates:
- 5-minute demo script runs start-to-finish without visiting dev/demo routes.

Verification commands:
```bash
bun run check --filter @beep/todox
```

## PR5: Meeting-Prep Evidence Persistence (P2 “Hardening” Starts Here)

Goal: make meeting-prep auditable and restart-safe (bullets → citations).

Deliverables:
- Persist meeting-prep output as:
  - structured sections/bullets
  - citations referencing evidence spans
- Evidence retrieval supports bullet click-through.

Acceptance gates:
- After restart, meeting-prep bullets still resolve to citations and highlights.

Verification commands:
```bash
bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server
```

## PR6: IaC Baseline for Staging (P3)

Goal: make staging deploy reproducible with gates.

Deliverables:
- IaC created/updated to satisfy:
  - `outputs/P3_IAC_GATES_staging.md`
- Migrations job, Secret Manager wiring, OTLP wiring, DNS/TLS, CORS locked down.

Acceptance gates:
- Staging deploy is reproducible end-to-end; smoke test passes.

## PR7: Production Readiness Closure (P4)

Goal: complete production checklist + runbooks + rollout gates.

Deliverables:
- Close:
  - `outputs/P4_PROD_READINESS_CHECKLIST_prod.md`
  - `outputs/P4_RUNBOOK_beep-api_prod.md`
- Pilot → staging → prod rollout gate documentation.

Acceptance gates:
- Runbooks exist and are executable; rollback is verified in staging; backups/restore documented.

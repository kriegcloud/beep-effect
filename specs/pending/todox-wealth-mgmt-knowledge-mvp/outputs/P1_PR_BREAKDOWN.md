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
- TodoX does not call Gmail directly from Next route handlers. TodoX UI calls `apps/server`, and `apps/server` composes `AuthContext.layer` + `GoogleWorkspace.layer` inside protected handlers.
- Every UI fact must have evidence (`documentId + documentVersionId + offsets`) or it must not be displayed.
- Evidence spans must be deterministic (D-18 / C-05): pin spans to a specific document version and a single offset unit end-to-end.
- No cross-org leakage: every PR includes at least one isolation test/guard relevant to its changes.
- Do not implement Calendar/webhooks/Outlook/IMAP/doc editor/multi-source resolution.
- Safe-buttons only (D-15): LLM cannot emit executable SQL/code; all actions go through approved RPC/tools.
- Prompt minimization (D-16): meeting prep/Q&A uses context slices + citations; no full inbox/thread content by default.
- Record-of-truth rule: extraction state, evidence spans, and meeting prep outputs persist to Postgres. Redis/KV is permitted only for caches, rate limits, queues, and short-lived workflow scratch state.

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
- TodoX calls only `apps/server` for OAuth/Gmail actions; no Next route handler calls to Gmail APIs.

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
- D-06 (LOCKED): sourceHash hashes the exact persisted content string used for highlighting
- D-07 (LOCKED): strict unique forever mapping with tombstone + resurrect semantics
- D-18 (LOCKED): evidence spans pinned to a specific document version + offsets (no silent drift)

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

## PR2A: Multi-Account Selection + `providerAccountId` Enforcement (Demo-Critical)

Goal: make it impossible to sync/extract from the wrong Google account when multiple accounts are linked.

Rationale (why this must exist in MVP):
- Without an explicit account selector, `getAccessToken({ providerId, userId })`-style APIs will silently choose an arbitrary linked account.
- In wealth management, cross-account cross-org leakage is demo-fatal and also a production data incident.

Deliverables:
- Update OAuth token retrieval and any Gmail sync/extraction entrypoints to require:
  - `providerAccountId` (LOCKED D-03): IAM `account.id`
- Add a deterministic failure mode:
  - if multiple Google accounts are linked and no `providerAccountId` is provided, error with a typed payload (not "pick first")
- Add org-level connection selection persistence:
  - org chooses which provider accounts are active for sync/extraction
  - UI supports selecting the active account for the org (minimal surface: dropdown + "active" badge)

Acceptance gates:
- Two linked Google accounts cannot be mixed:
  - sync for account A never ingests account B data even if both are linked to the same user.
- All Gmail → Documents sync calls require `providerAccountId` (no defaults).

Verification commands:
```bash
bun run check
bun run test
```

## PR2B: Thread Aggregation Read Model (Planned P0, Needed for Meeting Prep)

Goal: build a Knowledge-owned thread read model so meeting prep and evidence anchoring work at thread-level without re-parsing raw inbox data.

Deliverables:
- Tables + service per `outputs/R10_THREAD_AGGREGATION_LAYER.md`:
  - `knowledge_email_thread`
  - `knowledge_email_thread_message`
- Sync logic:
  - after `document_source` upsert (PR1), upsert message rows and map message → documentId
  - maintain `ingestSeq` (monotonic, never renumbered) and a deterministic `sortKey` for display ordering
 - Define soft-delete semantics aligned with D-07:
   - tombstoning a `document_source` must not delete/recreate thread rows in a way that renumbers `ingestSeq` or creates duplicates.

Acceptance gates:
- Thread view can list message documents deterministically even after re-sync and restarts.
- Thread-level meeting prep can reference message evidence spans without drift.
- Tombstone + resurrect does not duplicate thread messages and does not change `ingestSeq` for existing messages.

Verification commands:
```bash
bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server
```

## PR2C: Ontology Registry Wiring (Demo Blocker)

Goal: make ontology selection deterministic and deployable (no inline ontology JSON pasted into requests).

Deliverables:
- A registry file (or table) of available ontologies with stable ids.
- Boot-time wiring to load the registry and expose it via RPC for UI selection.
- Extraction pipeline accepts `ontologyId` (registry id) and loads the ontology from the registry.

Acceptance gates:
- A user can select an ontology by id in the demo UI without manual configuration.
- Extraction fails with a typed error if an unknown/disabled ontology id is requested (no silent fallback).

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
  - returns `documentId + documentVersionId + offsets` spans (per C-05)
- Implement dedicated relation evidence persistence:
  - create `relation_evidence` table (or equivalent) so relation citations are first-class records
  - ensure `Evidence.List` uses `relation_evidence` as the source of truth for relation claims
  - include a migration/backfill step (best-effort) for any existing `relation.evidence` JSONB so legacy data does not break the demo
- Relation evidence invariant is enforced (no optional join dead ends):
  - `relation_evidence` always stores `documentId + documentVersionId + offsets` directly (no optional join path required)

Acceptance gates:
- Evidence panel can highlight source text deterministically for:
  - one entity mention
  - one relation/claim
- No evidence item can exist without a resolvable source doc/span.
- Hard gate (no fragile join paths): relation evidence resolution must not depend on `relation.extractionId -> extraction.documentId`.
  - If `relation_evidence` cannot directly return `(documentId, documentVersionId, startChar, endChar)`, the PR is incomplete.
- Evidence.List requires `providerAccountId`-scoped access (ties to PR2A) and can power thread-based UX (ties to PR2B).

P0 decision dependencies:
- D-08 (LOCKED): dedicated `relation_evidence` table is the relation evidence-of-record
- D-09 (LOCKED): SQL is evidence-of-record; Evidence.List returns docId+offset spans

Verification commands:
```bash
bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server
```

## PR5: Meeting-Prep Evidence Persistence (Demo Requirement)

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

## PR4: `/knowledge` UI (Single Demo Surface)

Goal: wire the demo to real APIs and consolidate UI into one route.

Hard dependency (demo integrity):
- PR4 is blocked on PR3 + PR5 being complete. Shipping `/knowledge` without persisted evidence-backed meeting prep produces a UI that looks plausible but cannot satisfy auditability or restart-safety.

Deliverables:
- `/knowledge` page:
  - left: query + meeting-prep
  - center: graph
  - right: inspector + evidence panel
- No happy-path mocks; UI uses real endpoints.

Acceptance gates:
- 5-minute demo script runs start-to-finish without visiting dev/demo routes.
- Meeting prep output shown in UI always has persisted citations (no transient-only bullets).

Verification commands:
```bash
bun run check --filter @beep/todox
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

# P1 PR Breakdown (Executable Plan)

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Phase**: P1 (MVP demo implementation plan)  
**Status**: Ready (P0 contracts locked; gates are authoritative)

This document turns the spec into small, reviewable PRs with explicit acceptance gates.

Decision dependencies:
- P0 decision record: `outputs/P0_DECISIONS.md`
- Any change to `LOCKED` decisions must be recorded in: `outputs/P0_DECISIONS_CHANGELOG.md`

## Non-Negotiable Gate Style (Examples)

Acceptance gates:
- [PASS/FAIL] TodoX calls only `apps/server` for Gmail/OAuth actions.
- [PASS/FAIL] Evidence.List returns `documentVersionId` for every evidence row.
- [PASS/FAIL] Relation evidence never requires `relation.extractionId -> extraction.documentId`.
- [PASS/FAIL] Evidence spans always include `documentVersionId`.

Hard dependency (demo integrity):
- `/knowledge` UI is blocked on persisted evidence-backed meeting prep (no transient-only bullets).

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

## Global Demo-Fatal Acceptance Gates (Must Stay True)

Acceptance gates:
- [PASS/FAIL] TodoX calls only `apps/server` for Gmail/OAuth actions.
- [PASS/FAIL] Server never selects a default provider account when `providerAccountId` is missing; it returns the typed C-06 payload instead.
- [PASS/FAIL] Evidence.List returns `documentVersionId` for every evidence row.
- [PASS/FAIL] Evidence spans always include `documentVersionId` and use UTF-16 JS string indices, 0-indexed, end-exclusive: `[startChar, endChar)`.
- [PASS/FAIL] Relation evidence never requires `relation.extractionId -> extraction.documentId` to resolve spans.
- [PASS/FAIL] `/knowledge` UI is blocked on persisted evidence-backed meeting prep (no transient-only bullets).

## PR0: Connected Accounts + Typed Scope Expansion Contract

Goal: unblock Google link/relink UX and deterministic scope expansion remediation.

Deliverables:
- A "Connections" UI (settings tab) that can:
  - link Google
  - relink with expanded scopes
  - unlink
  - display current scope string
- A typed error contract surfaced from Gmail-dependent endpoints (C-01):
  - payload includes `tag + providerId + missingScopes + relink{ callbackURL, errorCallbackURL, scopes }`
  - no string matching on error messages; client branches on `tag`
  - relink uses IAM `oauth2.link` with the `relink.scopes` + callback URLs from the payload

Acceptance gates:
- [PASS/FAIL] Missing scopes produces a deterministic UI relink prompt driven by the typed C-01 payload (no string matching).
- [PASS/FAIL] Scope error payload serializes `tag` (not `_tag`) and `tag === "GoogleScopeExpansionRequiredError"`.
- [PASS/FAIL] Scope error payload includes `providerId === "google"`.
- [PASS/FAIL] Scope error payload includes `missingScopes.length > 0` and `missingScopes ⊆ relink.scopes`.
- [PASS/FAIL] Scope error payload includes `relink.callbackURL === "/settings?settingsTab=connections"`.
- [PASS/FAIL] Scope error payload includes `relink.errorCallbackURL === "/settings?settingsTab=connections&relink=failed"`.
- [PASS/FAIL] Client branches on `payload.tag` (and optionally `providerId`), not `instanceof` or substring matching.
- [PASS/FAIL] A user can link, relink (scope expansion), and unlink entirely via the Settings → Connections UI (no manual endpoint calls).
- [PASS/FAIL] TodoX calls only `apps/server` for OAuth/Gmail actions; no Next route handler calls to Google APIs.

P0 decision dependencies:
- D-01 (LOCKED): OAuth UX surface = settings tab `connections`
- D-02 (LOCKED): typed scope expansion contract (no string matching)
- C-01 (LOCKED): typed scope expansion error payload (wire shape + relink params)

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
  - stores minimal metadata (`sourceThreadId`, `sourceHash`, etc.) per C-03
  - persists an immutable canonical text blob addressable by `documentVersionId` (C-05):
    - simplest path: add/store a `content` (text) snapshot on the version record
    - if an alternative store is used, `documentVersionId` MUST still resolve to an immutable text string (no silent remap)
    - repo note: today, `documents.documentVersion` does not store a plain text snapshot; expect to add a `content` field to:
      - `packages/documents/tables/src/tables/document-version.table.ts`
      - `packages/documents/domain/src/entities/document-version/document-version.model.ts`

Acceptance gates:
- [PASS/FAIL] Mapping key is enforced as unique (including tombstones): `(organizationId, providerAccountId, sourceType="gmail", sourceId=gmailMessageId)`.
- [PASS/FAIL] Re-running materialization for the same mapping key reuses the same `documentId` (no duplicate documents).
- [PASS/FAIL] Mapping is org-scoped and provider-account-scoped (Gmail message ids do not collide across linked accounts).
- [PASS/FAIL] If `sourceHash` is unchanged, materialization creates 0 new document versions and does not mutate the canonical stored content string.
- [PASS/FAIL] If `sourceHash` changes, materialization creates exactly 1 new document version and updates the mapping row’s `sourceHash`.
- [PASS/FAIL] `sourceHash` is computed from the exact persisted canonical content string used for highlighting (D-06); no lossy normalization that can drift offsets.
- [PASS/FAIL] Tombstone + resurrect (D-07): tombstoning the mapping then re-syncing resurrects the same mapping row and reuses the same `documentId` (new version only if `sourceHash` changes).
- [PASS/FAIL] Version pinning (C-05): materialization produces a stable `documentVersionId` that resolves to an immutable text string used for highlighting.
- [PASS/FAIL] No cross-slice DB foreign keys are introduced; `providerAccountId` is stored as a typed string (IAM `account.id`) per D-03.

P0 decision dependencies:
- D-03 (LOCKED): providerAccountId = IAM `account.id` stored as typed string
- D-04 (LOCKED): 1 Gmail message = 1 document (MVP)
- D-05 (LOCKED): Gmail-sourced documents immutable/locked (MVP)
- D-06 (LOCKED): sourceHash hashes the exact persisted content string used for highlighting
- D-07 (LOCKED): strict unique forever mapping with tombstone + resurrect semantics
- D-18 (LOCKED): evidence spans pinned to a specific document version + offsets (no silent drift)
- C-03 (LOCKED): Gmail → Documents mapping invariants (key + idempotency + tombstone rules)

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
  - mentions (span store) with version pinning:
    - every mention row stores `documentId + documentVersionId + startChar + endChar` (C-05)
    - repo note: today, `knowledge.mention` lacks `documentVersionId`; expect to extend:
      - `packages/knowledge/tables/src/tables/mention.table.ts`
  - embeddings for extracted entities

Acceptance gates:
- [PASS/FAIL] After extraction, GraphRAG queries return non-empty results for the demo dataset (no “empty graph” failure mode).
- [PASS/FAIL] Restart does not lose extracted graph state; SQL is record-of-truth (no process-local-only provenance).
- [PASS/FAIL] No mention row exists without a `documentVersionId` (demo-fatal, C-05).
- [PASS/FAIL] Mention offsets are interpretable against the immutable version content string referenced by `documentVersionId` (C-05).
- [PASS/FAIL] Embeddings are persisted for extracted entities and can be queried to support similarity search (no transient-only vectors).

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
  - repo note: today, `AuthContext.oauth.getProviderAccount` selects `A.head` and will silently pick an arbitrary linked account:
    - `packages/runtime/server/src/AuthContext.layer.ts`
- Add a deterministic failure mode:
  - if no `providerAccountId` is provided, error with a typed payload (C-06) and never "pick first"
- Add org-level connection selection persistence:
  - org chooses which provider accounts are active for sync/extraction
  - UI supports selecting the active account for the org (minimal surface: dropdown + "active" badge)

Acceptance gates:
- [PASS/FAIL] Two linked Google accounts cannot be mixed: syncing for account A never ingests account B data (even when linked to the same user).
- [PASS/FAIL] All Gmail → Documents sync and extraction calls require `providerAccountId` (no defaults; no “pick first linked account”).
- [PASS/FAIL] Missing `providerAccountId` returns the typed C-06 payload (no string matching).
- [PASS/FAIL] C-06 wire payload fields match exactly: `tag === "ProviderAccountSelectionRequiredError"`, `providerId === "google"`, `requiredParam === "providerAccountId"`.
- [PASS/FAIL] C-06 payload includes `candidates.length > 0` and candidates contain IAM `account.id` values only (no tokens/secrets).
- [PASS/FAIL] A test asserts the server does not select an arbitrary linked account when `providerAccountId` is missing.
- [PASS/FAIL] Org-level selection persistence works end-to-end and survives restart: the org’s active `providerAccountId` is persisted.
- [PASS/FAIL] UI always passes `providerAccountId` explicitly to sync/extraction calls (no hidden server defaults).

Verification commands:
```bash
bun run check
bun run test
```

P0 decision dependencies:
- D-03 (LOCKED): providerAccountId = IAM `account.id`
- C-06 (LOCKED): provider account selection required error payload (typed, no defaults)

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
  - tombstoning a `document_source` must not delete/recreate thread rows in a way that renumbers `ingestSeq` or creates duplicates

Acceptance gates:
- [PASS/FAIL] Thread view can list message documents deterministically even after re-sync and restarts.
- [PASS/FAIL] Thread-level meeting prep can reference message evidence spans without drift (doc version + offsets remain valid).
- [PASS/FAIL] Tombstone + resurrect does not duplicate thread messages and does not change `ingestSeq` for existing messages.
- [PASS/FAIL] `ingestSeq` is monotonic and never renumbered; ordering is stable via deterministic `sortKey`.

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
- [PASS/FAIL] A user can select an ontology by id in the demo UI without manual configuration.
- [PASS/FAIL] Extraction fails with a typed error if an unknown/disabled ontology id is requested (no silent fallback).
- [PASS/FAIL] Ontology registry ids are stable across restarts and deploys (no “random id per boot”).

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
  - MUST match C-02 canonical contract (typed `source` shape + required `documentVersionId`)
  - returns `documentId + documentVersionId + offsets` spans (per C-05)
- Implement dedicated relation evidence persistence:
  - create `relation_evidence` table (or equivalent) so relation citations are first-class records
  - ensure `Evidence.List` uses `relation_evidence` as the source of truth for relation claims
  - include a migration/backfill step (best-effort) for any existing `relation.evidence` JSONB so legacy data does not break the demo
- Relation evidence invariant is enforced (no optional join dead ends):
  - `relation_evidence` always stores `documentId + documentVersionId + offsets` directly (no optional join path required)

Acceptance gates:
- [PASS/FAIL] Evidence.List matches C-02 exactly (request filters + response shape), including required `documentVersionId`.
- [PASS/FAIL] Evidence.List returns `documentVersionId` for every evidence row.
- [PASS/FAIL] Evidence panel can highlight source text deterministically for at least 1 entity mention and 1 relation/claim.
- [PASS/FAIL] Highlight semantics match C-05: `highlightedText === documentContent.slice(startChar, endChar)` (0-indexed, end-exclusive).
- [PASS/FAIL] Bounds are validated (`startChar >= 0`, `endChar >= startChar`, `endChar <= content.length`); invalid spans are rejected/omitted deterministically.
- [PASS/FAIL] Relation evidence is sourced from dedicated `relation_evidence` rows (D-08), not JSONB fields.
- [PASS/FAIL] Relation evidence rows store `(documentId, documentVersionId, startChar, endChar)` directly (no optional join required).
- [PASS/FAIL] No fragile join path for relation evidence: relation evidence never requires `relation.extractionId -> extraction.documentId` to resolve spans.
- [PASS/FAIL] Migration/backfill is present and best-effort: legacy `relation.evidence` JSONB does not break Evidence.List for existing demo data.

P0 decision dependencies:
- D-08 (LOCKED): dedicated `relation_evidence` table is the relation evidence-of-record
- D-09 (LOCKED): SQL is evidence-of-record; Evidence.List returns docId+offset spans
- C-02 (LOCKED): Evidence.List canonical contract (request filters + response shape)
- C-05 (LOCKED): offset drift invariant contract (version pin + UTF-16 offsets)

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
  - citations referencing evidence spans (C-02/C-05):
    - citations MUST resolve to `documentId + documentVersionId + startChar + endChar` (no drift)
    - citations MAY reference `mentionId` / `relationEvidenceId` or store an inline document span (but must still include `documentVersionId`)
- Evidence retrieval supports bullet click-through.

Acceptance gates:
- [PASS/FAIL] Meeting-prep output persists to SQL as structured sections/bullets plus citations (D-10).
- [PASS/FAIL] After restart, meeting-prep bullets still resolve to citations and highlights.
- [PASS/FAIL] Every displayed bullet has at least 1 persisted citation that resolves to `documentId + documentVersionId + startChar + endChar`.
- [PASS/FAIL] Evidence.List can power bullet click-through: `Evidence.List({ meetingPrepBulletId })` returns only version-pinned spans (`documentVersionId` required).
- [PASS/FAIL] At least 1 bullet in the demo has a citation whose source is `relation_evidence` (D-08), not JSONB.
- [PASS/FAIL] Output posture is compliant with D-17: meeting-prep output includes a compliance-safe disclaimer and avoids guarantees/advice language.

Verification commands:
```bash
bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server
```

## PR4: `/knowledge` UI (Single Demo Surface)

Goal: wire the demo to real APIs and consolidate UI into one route.

Hard dependency (demo integrity):
- PR4 is blocked on PR3 + PR5 being complete.
- `/knowledge` UI is blocked on persisted evidence-backed meeting prep (no transient-only bullets).
- Shipping `/knowledge` without persisted evidence-backed meeting prep produces a UI that looks plausible but cannot satisfy auditability or restart-safety.

Deliverables:
- `/knowledge` page:
  - left: query + meeting-prep
  - center: graph
  - right: inspector + evidence panel
- No happy-path mocks; UI uses real endpoints.

Acceptance gates:
- [PASS/FAIL] 5-minute demo script runs start-to-finish without visiting dev/demo routes.
- [PASS/FAIL] `/knowledge` UI shows meeting prep only when it has persisted citations; no transient-only bullets.
- [PASS/FAIL] `/knowledge` UI evidence panel resolves highlights only via Evidence.List (no local “best effort” evidence).

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
- [PASS/FAIL] Staging deploy is reproducible end-to-end; smoke test passes.

## PR7: Production Readiness Closure (P4)

Goal: complete production checklist + runbooks + rollout gates.

Deliverables:
- Close:
  - `outputs/P4_PROD_READINESS_CHECKLIST_prod.md`
  - `outputs/P4_RUNBOOK_beep-api_prod.md`
- Pilot → staging → prod rollout gate documentation.

Acceptance gates:
- [PASS/FAIL] Runbooks exist and are executable; rollback is verified in staging; backups/restore documented.

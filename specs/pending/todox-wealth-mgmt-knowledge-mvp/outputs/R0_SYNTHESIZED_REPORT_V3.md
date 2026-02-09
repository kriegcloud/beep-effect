# TodoX Wealth Mgmt Knowledge MVP (Synthesis V3)

Date: 2026-02-09  
Spec: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
This V3 synthesis folds in: R10 (thread aggregation), R11 (multi-account org), R12 (evidence canon), R13 + R15 (PII + AI guardrails), R14 (IaC decision), and R16 (gaps audit).

## What We’re Building

**MVP narrative (non-negotiable):** Gmail → Documents → Knowledge graph → `/knowledge` UI → meeting prep with persisted evidence (`documentId + documentVersionId + offsets`). This is explicitly the P0 scope reminder and the demo goal.

**Boundaries that matter:**
- Vertical slices remain isolated: cross-slice imports only through `@beep/shared/*` or `@beep/common/*`.
- Documents owns durable document persistence and provenance mapping. Knowledge owns extraction + evidence-of-record models.
- Multi-account-per-org must be explicit; “first linked account wins” is considered a functional bug (see R11).

**What we are not building in MVP:** calendar sync, webhooks/watch, Outlook/IMAP, full agent framework, multi-source entity resolution, dashboards. (R3 + P0 scope reminder.)

## P0 Decisions That Matter (Demo-Fatal if Wrong)

These are the contracts that most directly determine whether the demo is credible, auditable, and safe to ship:

1. **Connections UX + typed scope expansion**
   - OAuth UX surface is the Settings “Connections” tab (D-01 LOCKED).
   - Scope expansion must use a typed error payload (missingScopes + relink params), no string matching (D-02 LOCKED).

2. **Identity + idempotency (Gmail → Documents)**
   - `providerAccountId` stored in `documents.document_source` is **IAM `account.id`** (typed string, no FK) (D-03 LOCKED; R7).
   - Granularity is **1 Gmail message = 1 document** for MVP (D-04 LOCKED).
   - Gmail-sourced docs are immutable/locked in MVP (D-05 LOCKED).
   - Materialization idempotency uses `sourceHash = sha256(canonicalJson({ title, content, metadata }))` where `content` is the exact persisted string used for evidence offsets (D-06 LOCKED).
   - Soft delete semantics for mapping are tombstone + resurrect to preserve stable identity (D-07 LOCKED).

3. **Evidence-of-record is SQL spans (not RDF)**
   - Entity evidence-of-record is `knowledge.mention` storing `documentId + startChar/endChar` (D-09 LOCKED; R12).
   - Relation evidence-of-record is a dedicated `knowledge.relation_evidence` table (D-08 LOCKED; R12). Avoid optional-join evidence that can’t resolve to a document.
   - Meeting prep outputs must be persisted with citations (D-10 LOCKED; R12).

4. **Thread aggregation is a Knowledge-owned read model**
   - Add Knowledge-owned thread tables (`knowledge_email_thread`, `knowledge_email_thread_message`) keyed by `(organizationId, providerAccountId, sourceThreadId)` and `(organizationId, providerAccountId, sourceId)` (R10).
   - Preserve stable evidence anchors via `ingestSeq` (monotonic, never renumbered) while presenting chronological order via a deterministic `sortKey` (R10).

5. **Multi-account-per-org must be enforced in APIs**
   - Current OAuth API surface is ambiguous: `getAccessToken({ providerId, userId })` picks the first account row and will silently mis-route when multiple Google accounts are linked (R11).
   - Contract change required: add an explicit selector (IAM `account.id`) and error when multiple accounts exist without selection (R11).
   - Org-level connection selection must be persisted (org chooses which linked provider accounts are active), not inferred from “user has Google linked” (R11).

6. **PII + AI guardrails (minimum credible posture)**
   - `S.Redacted` is log-safety and serialization safety, not encryption-at-rest (R13).
   - Encrypt content bodies and retrievable PII with `EncryptionService` (AES-256-GCM) and store a redacted derivative for UI/search (R13).
   - LLM boundary for MVP is safe-buttons only: no arbitrary SQL/code; only approved RPC/tools (D-15 LOCKED; R15).
   - Prompt minimization is hybrid by workflow: extraction may need raw content; meeting prep/Q&A must use context slices + citations (D-16 LOCKED; R15).

7. **IaC tool decision**
   - Use **Terraform** as the IaC baseline; do not adopt SST for this repo (R14). Pulumi is only a later option if TypeScript-first infra becomes non-negotiable.

## MVP Demo Path (TodoX → apps/server)

This is the smallest end-to-end path that demonstrates regulated-grade “evidence always” behavior without building production infrastructure upfront. It corresponds closely to the PR breakdown in `outputs/P1_PR_BREAKDOWN.md`.

1. **Connect Google account(s) and select org connections**
   - UI: `apps/todox` Settings → Connections (D-01).
   - Behavior:
     - Link/relink must surface typed scope errors and remediation (D-02).
     - If multiple Google accounts exist, org selects which IAM `account.id`(s) are active for sync (R11).

2. **Ingest Gmail messages and materialize Documents (idempotent)**
   - Server entrypoint: `apps/server` orchestrates ingestion using Google Workspace integration and Documents server.
   - Documents writes:
     - `documents.document` + `documents.document_version` (content is canonical for offsets)
     - `documents.document_source` mapping keyed by `(organizationId, providerAccountId=iam.account.id, sourceType="gmail", sourceId=gmailMessageId)` (R7; D-03/D-04/D-06).

3. **Run Knowledge extraction and persist the graph**
   - Knowledge writes (minimum):
     - `knowledge.extraction` lifecycle row
     - `knowledge.entity`, `knowledge.relation`
     - `knowledge.mention` spans (entity evidence-of-record)
     - `knowledge.relation_evidence` spans (relation evidence-of-record)
     - embeddings (required for GraphRAG to be non-empty) (gaps called out in R4)

4. **Thread aggregation (for meeting prep narratives and stable anchors)**
   - On document materialization and/or extraction, upsert Knowledge thread tables:
     - `knowledge_email_thread` (org/account/threadId)
     - `knowledge_email_thread_message` (org/account/messageId → documentId; `ingestSeq` + `sortKey`) (R10)

5. **Expose a single evidence API**
   - `Evidence.List` must resolve every returned item to `documentId + documentVersionId + offsets` with no optional joins (R12, C-05).
   - This powers deterministic highlight/click-through in the UI.

6. **UI: `/knowledge` is the only demo surface**
   - Route: new `/knowledge` (D-11).
   - Panels:
     - Graph view (household/client subgraph)
     - Inspector (entity/relation details)
     - Evidence panel (highlights source spans via Evidence.List)
     - Meeting prep generator (persists bullets + citations; D-10)

## Production Hardening Path

This is what turns a working demo into something that can run in staging/prod without relying on process-local state or implicit assumptions.

1. **Org isolation: repo filters plus DB RLS**
   - MVP: enforce org filters everywhere and add cross-org regression tests.
   - Staging/prod: enable DB RLS as defense-in-depth (D-14 target).

2. **Durability and auditability**
   - Treat SQL as the record of truth for evidence and meeting prep outputs (R12).
   - Do not rely on in-memory RDF provenance for UI; RDF can remain supplemental but not evidence-of-record (R8 + R12).

3. **PII posture**
   - Encrypt raw bodies + retrievable PII at rest using `EncryptionService`; store redacted derivatives for UI/search (R13).
   - Add strict logging/telemetry gates to prevent emitting raw subjects/bodies/attachments metadata (R13).
   - Enforce safe-buttons-only tool execution and prompt minimization policies (D-15/D-16; R15).

4. **Multi-account operational correctness**
   - Make `providerAccountId` explicit in all sync/extraction entrypoints and OAuth token retrieval; error on ambiguity (R11).
   - Add org-level connection records with statuses (`active`, `needs_relink`, `missing_scopes`) and UI remediation (R11).

5. **Infrastructure baseline**
   - IaC: Terraform (R14), aligning with Cloud Run + Secret Manager assumptions and the existing Terraform reference in `.repos/effect-ontology/infra`.
   - Add Cloud Run Job (or equivalent) for migrations; wire Secret Manager for all `@beep/shared-env` required vars (R14).

## Known Gaps and Owners

This is the “what will break the demo / what will break production” list. Owners are functional, not individual.

- **OAuth multi-account ambiguity (demo + prod correctness)**
  - Gap: OAuth token APIs select “first account” for `(userId, providerId)`; unsafe with multiple Google accounts.
  - Owner: Runtime/IAM
  - Source: R11

- **Org-level connection selection does not exist**
  - Gap: no persistent org-scoped record for which IAM `account.id` is active for sync/extraction; UX missing selection step.
  - Owner: IAM + TodoX UI
  - Source: R11

- **Gmail → Documents materialization missing end-to-end**
  - Gap: Gmail extraction exists but no durable document creation + `document_source` mapping wired to ingestion.
  - Owner: Documents + Integrations
  - Source: R4 (blocker #1), R7

- **Extraction persistence missing (GraphRAG reads empty tables)**
  - Gap: extraction writes in-memory RDF only; SQL tables not populated (extraction/entity/relation/mention/etc).
  - Owner: Knowledge
  - Source: R4 (blocker #2)

- **Embeddings never written**
  - Gap: embeddings service exists but extraction pipeline doesn’t call it; GraphRAG similarity search will be empty.
  - Owner: Knowledge
  - Source: R4 (blocker #3)

- **Evidence surfaces incomplete for relations + meeting prep**
  - Gap: relation evidence must be first-class (`relation_evidence`), and meeting prep must persist bullets + citations.
  - Owner: Knowledge
  - Source: R12, P0 D-08/D-10, R4 (provenance/UI gap)

- **Provenance durability mismatch**
  - Gap: RDF provenance is process-local and span-less; cannot satisfy UI click-through. Must not be presented as evidence-of-record.
  - Owner: Knowledge
  - Source: R8

- **Thread aggregation not implemented**
  - Gap: meeting prep needs thread-level narrative with stable anchors; requires Knowledge-owned thread tables and sync semantics.
  - Owner: Knowledge + Documents (integration points)
  - Source: R10

- **PII plan needs concrete wiring (redaction vs encryption)**
  - Gap: redaction primitives exist, but MVP needs explicit “encrypt raw, store redacted derivative” storage contracts and logging gates.
  - Owner: Shared domain + Knowledge + Documents
  - Source: R13, R15

- **Input discrepancy resolved: Gmail schemas are present**
  - Note: R13 reported `tmp/gmail-schemas` missing; repo currently contains `tmp/gmail-schemas/gmail-schemas.ts`. Treat this as an available input for field mapping, not a blocker.
  - Owner: Spec (documentation correction only)

- **IaC pipeline not yet implemented**
  - Gap: Terraform is the tool decision, but CI/CD plan/apply + deploy gates must still be built (staging then prod).
  - Owner: Ops
  - Source: R14

# Thread Aggregation Layer Plan (Gmail -> Documents -> Knowledge)

## Scope + Inputs
- Gmail extraction already supports thread context in `GmailExtractionAdapter` (`extractThreadContext` returns participants, subject, messages, date range).
- Document provenance mapping is defined in `R7_GMAIL_DOCUMENT_MAPPING_DESIGN.md` via a `document_source` table keyed by `(organizationId, providerAccountId, sourceId)` and including `sourceThreadId`.
- Knowledge needs a thread-level aggregation layer to power meeting prep and evidence trails.

## Boundary Constraints (Must Respect)
- Cross-slice code imports must only go through `@beep/shared/*` or `@beep/common/*`. Knowledge should not import Documents tables directly.
- DB-level joins across schemas are allowed, but application code should avoid hard references to other slices' table definitions.
- Gmail message IDs are unique per mailbox only. Thread aggregation must include `organizationId` and `providerAccountId` in all unique keys.

## Data Model Options
### Option A: Derived View Only
Create a DB view (or query) that aggregates per-thread data by joining:
- `documents.document_source` (sourceType, sourceId, sourceThreadId, providerAccountId, sourceInternalDate)
- `documents.document` (document content, title, userId)
- `knowledge.evidence` (references to documentId or sourceUri)

Pros:
- No new tables.
- Always reflects latest documents.

Cons:
- Evidence offsets are not stable if new earlier messages are ingested (chronological order changes).
- Complex multi-join query path for every read.
- Harder to attach durable thread-level metadata (summaries, flags, prep notes).

### Option B: Materialized Thread Tables (Recommended)
Add knowledge-owned tables that store a stable, append-only thread index plus per-message stable keys.
This avoids cross-slice code imports by treating Documents as an upstream source of truth and copying only the needed identifiers.

Recommended tables (Knowledge slice):

1) `knowledge_email_thread`
- `id` (KnowledgeEntityIds.EmailThreadId)
- `organizationId`
- `providerAccountId` (text; no FK)
- `sourceThreadId` (Gmail thread ID)
- `subject` (latest observed subject)
- `participants` (array of normalized email strings)
- `dateRangeEarliest` / `dateRangeLatest` (UTC timestamps)
- `lastSyncedAt` (UTC)
- `sourceType` ("gmail")

Unique index: `(organizationId, providerAccountId, sourceThreadId)`

2) `knowledge_email_thread_message`
- `id` (KnowledgeEntityIds.EmailThreadMessageId)
- `threadId` (FK -> `knowledge_email_thread.id`)
- `organizationId`
- `providerAccountId`
- `sourceId` (Gmail message ID)
- `documentId` (Documents document ID)
- `sourceInternalDate` (UTC timestamp)
- `sourceHistoryId` (text)
- `sourceHash` (text) from materialization
- `ingestSeq` (bigint, monotonic)
- `sortKey` (text, deterministic, e.g. `"${internalDateEpochMs}:${sourceId}"`)

Unique index: `(organizationId, providerAccountId, sourceId)`
Secondary index: `(threadId, sortKey)`

Rationale:
- `ingestSeq` provides a stable offset for evidence references (never renumbered).
- `sortKey` provides a consistent chronological ordering for reads without mutating offsets.
- `documentId` bridges to Documents without requiring a code-level table import.

## Aggregation Semantics
1) **Source of truth**
   - `documents.document_source` remains the authoritative provenance mapping.
   - Thread aggregation only mirrors identifiers and derived metadata.

2) **Thread discovery**
   - When a Gmail message is materialized into a Document, read `sourceThreadId` from `document_source`.
   - Upsert `knowledge_email_thread` by `(organizationId, providerAccountId, sourceThreadId)`.

3) **Message upsert**
   - Upsert `knowledge_email_thread_message` by `(organizationId, providerAccountId, sourceId)`.
   - If `sourceHash` is unchanged: no-op.
   - If `sourceHash` changed: update `documentId`, `sourceHistoryId`, `sourceInternalDate`, and `sortKey` but do not change `ingestSeq`.

4) **Participants + subject**
   - Use `GmailExtractionAdapter.extractThreadContext` for full participant set and subject.
   - On each sync, recompute participants as a deduped union; update `subject` to the newest non-empty subject.

5) **Date range**
   - `dateRangeEarliest` and `dateRangeLatest` are derived from message internal dates.
   - For missing dates, fall back to `extractedAt` from email extraction.

6) **Concurrency + partial data**
   - Allow missing messages in a thread. Aggregation is eventually consistent.
   - If thread fetch fails, keep thread row but mark `lastSyncedAt` unchanged and record error telemetry.

## Idempotency Keys
- **Document materialization:** `(organizationId, providerAccountId, sourceId)` as in R7.
- **Thread row:** `(organizationId, providerAccountId, sourceThreadId)`.
- **Thread message row:** `(organizationId, providerAccountId, sourceId)`.
- **Idempotency token for sync job:** `hash(organizationId, providerAccountId, sourceThreadId, sourceHistoryId)`.
  - If `sourceHistoryId` changes, re-sync.
  - If unchanged, short-circuit.

## Meeting Prep Consumption
Meeting prep should read from the thread tables, not directly from Gmail or Documents.

Recommended query flow:
1. Resolve relevant threads for the meeting:
   - by participant overlap (email addresses),
   - by time window (meeting date +/- X days),
   - optionally by subject match.
2. Fetch `knowledge_email_thread_message` for those threads ordered by `sortKey`.
3. Join on `documentId` to fetch the document content summary if needed.
4. Use `ingestSeq` to create stable evidence anchors in the prep output.

This ensures:
- A consistent narrative view of the thread (chronological via `sortKey`).
- Stable references for evidence (via `ingestSeq`).

## Evidence Offset Stability
Evidence offsets should not shift when older messages are backfilled.
The plan uses two separate fields:
- `ingestSeq`: stable, monotonic, and never recomputed.
- `sortKey`: deterministic chronological sort for read-time ordering.

Rules:
- Evidence must reference `thread_message_id` and expose `ingestSeq` as the stable offset.
- When a new message arrives with an earlier internal date, it gets a new `ingestSeq` at the end.
- Read paths can still present chronological order using `sortKey` without touching evidence offsets.

If product requires chronological offsets, add a second offset (`chronSeq`) computed on read and not stored in evidence.

## Failure Modes + Mitigations
- **Thread fetch missing messages:** still insert/update known messages; schedule a resync.
- **Message ID collision across accounts:** unique keys include `providerAccountId` and `organizationId` to avoid collisions.
- **Subject drift or aliasing:** update `subject` with latest non-empty subject but keep full thread metadata in messages.
- **Soft deletes in Documents:** if a document is soft-deleted, keep the thread message row but mark a `documentDeletedAt` field (optional).

## Open Questions
- Should thread aggregation live under Knowledge tables, or as a shared read model in `packages/shared`?
- Do we need to track attachments as separate messages or as part of the same `documentId`?
- Should meeting prep include only messages with `labels` (e.g., "SENT", "INBOX")?

## Recommendation Summary
Use materialized Knowledge tables (`knowledge_email_thread` and `knowledge_email_thread_message`) keyed by organization/account/thread. Maintain stable evidence offsets via `ingestSeq` and chronological ordering via `sortKey`. Keep the Documents mapping table as the provenance source, and sync thread metadata using Gmail's thread context where available.

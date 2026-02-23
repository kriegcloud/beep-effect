# R12 Evidence Model Canon (Evidence-of-Record)

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Inputs**: D-08 (dedicated `relation_evidence`), D-09 (`knowledge.mention` is evidence-of-record), meeting-prep citations requirement  
**Status**: Canonical evidence-of-record contract

## Scope

Define the single evidence-of-record model for:
- Entity click-through (mentions)
- Relation/claim click-through (relations)
- Meeting-prep citations (bullets -> evidence)

RDF provenance can exist but is not a UI source of truth.

## Canonical Tables (Evidence-of-Record)

### 1) `knowledge.mention` (entity evidence-of-record)

Required fields (existing table, plus migration for `document_version_id` if missing):
- `id` (PK)
- `organization_id` (tenant scope)
- `entity_id`
- `document_id`
- `document_version_id` (required; see C-05 offset drift invariant)
- `text`
- `start_char`
- `end_char`
- `confidence?`
- `extraction_id?`

Required invariants:
- Every evidence span used by UI must be resolvable directly to `document_id + start_char + end_char`.
- Evidence spans are offsets into the canonical stored document content for the specific version (`document_version_id`) (no normalization drift).

### 2) `knowledge.relation_evidence` (relation evidence-of-record)

Dedicated table required by D-08. This replaces `relation.evidence` as the UI source of truth.

Required fields:
- `id` (PK)
- `organization_id`
- `relation_id` (FK to `knowledge.relation`)
- `document_id`
- `document_version_id` (required; see C-05 offset drift invariant)
- `start_char`
- `end_char`
- `text`
- `confidence?`
- `extraction_id?`
- `created_at`

Required invariants:
- Evidence rows must store `document_id + start_char + end_char` directly. No optional join path is allowed.
- Evidence rows must pin to `document_version_id` so UI highlighting remains deterministic across new document versions.
- A relation can have multiple evidence rows (multi-span support).

### 3) `knowledge_meeting_prep_bullet` (meeting-prep outputs)

Required fields:
- `id` (PK)
- `organization_id`
- `meeting_prep_id` (execution/run identifier)
- `bullet_index` (ordering per run)
- `text`
- `created_at`

Required invariants:
- Bullets are immutable outputs for auditability and restart safety.

### 4) `knowledge_meeting_prep_evidence` (meeting-prep citations)

Required fields:
- `id` (PK)
- `organization_id`
- `bullet_id` (FK to `knowledge_meeting_prep_bullet`)
- `source_type` (`mention` | `relation` | `document_span`)
- `mention_id?`
- `relation_evidence_id?`
- `document_id?`
- `document_version_id?`
- `start_char?`
- `end_char?`
- `text?`
- `confidence?`
- `extraction_id?`
- `created_at`

Required invariants:
- One of the following must be true per row:
  - `source_type = 'mention'` and `mention_id` is set
  - `source_type = 'relation'` and `relation_evidence_id` is set
  - `source_type = 'document_span'` and `document_id + document_version_id + start_char + end_char` are set
- All cited evidence must resolve to `document_id + document_version_id + start_char + end_char` without optional joins.

## Evidence.List (Canonical Query Contract)

**Request** (one-of filters, always org-scoped):
- `organizationId`
- `entityId?`
- `relationId?`
- `meetingPrepBulletId?`
- `documentId?`
- `limit?`

**Response**: `evidence: EvidenceSpan[]`

**EvidenceSpan** (minimum fields):
- `documentId`
- `documentVersionId`
- `startChar`
- `endChar`
- `text`
- `confidence?`
- `kind`: `"mention" | "relation" | "bullet"`
- `source`: `{ mentionId?; relationEvidenceId?; meetingPrepBulletId?; extractionId?; ontologyId?; }`

**Resolution rules** (single path, no optional joins):
1. `entityId` -> query `knowledge.mention` by `(organization_id, entity_id)`.
2. `relationId` -> query `knowledge.relation_evidence` by `(organization_id, relation_id)`.
3. `meetingPrepBulletId` -> query `knowledge_meeting_prep_evidence` and resolve:
   - `mention_id` -> `knowledge.mention` for span
   - `relation_evidence_id` -> `knowledge.relation_evidence` for span
   - `document_span` -> use inline `document_id + document_version_id + offsets`
4. `documentId` -> optional direct span listing for that document (by mentions + relation_evidence + meeting_prep evidence), if needed for UI.

Invariant: Evidence.List must only return rows that already include or resolve to `documentId + documentVersionId + offsets` without optional joins.
Invariant (offset drift): Evidence.List must include `documentVersionId` so the UI highlights against the exact immutable content blob that was cited (C-05).

## Deprecated/Non-Canonical Sources

- `knowledge.entity.mentions` JSONB is deprecated for UI evidence (no `document_id`, unsafe for merged entities).
- `knowledge.relation.evidence` JSONB is deprecated for UI evidence (no `document_id`, optional join path).
- RDF/PROV-O store is not an evidence-of-record source for UI (ephemeral and spanless).

## Migration Strategy (Short, Converge to Canon)

1. **Add tables**: create `knowledge.relation_evidence`, `knowledge_meeting_prep_bullet`, `knowledge_meeting_prep_evidence`.
2. **Backfill relation evidence**:
   - For each `knowledge.relation` with `evidence` and `extraction_id`, resolve `document_id` via extraction, then resolve/pin `document_version_id` for the exact persisted content used for offsets, then insert `relation_evidence` rows.
   - If `extraction_id` is missing, mark relation as requiring re-extraction or manual remediation; do not emit unresolved evidence.
3. **Write-path switch**:
   - Update extraction pipeline to write `relation_evidence` rows and stop writing `relation.evidence` for UI use.
   - Ensure mentions are written to `knowledge.mention` (already evidence-of-record per D-09).
4. **Meeting-prep persistence**:
   - Persist bullets + citations using the new meeting-prep tables.
   - Evidence.List uses meeting-prep citations first; no in-memory-only citations.
5. **Read-path switch + deprecation**:
   - Evidence.List uses `knowledge.mention` and `knowledge.relation_evidence` only.
   - Keep `entity.mentions` and `relation.evidence` as legacy fields for now, but remove UI dependency and add follow-up cleanup tasks.

## Acceptance Gates (Evidence Always)

- Every UI-displayed claim links to at least one evidence span with `documentId + documentVersionId + offsets`.
- No relation evidence exists without a resolvable `document_id`.
- Meeting-prep bullets remain auditable after restart (citations are durable).

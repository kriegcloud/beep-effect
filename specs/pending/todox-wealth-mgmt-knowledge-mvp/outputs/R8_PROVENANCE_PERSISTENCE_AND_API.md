# R8 Provenance Persistence and API

## Scope and Audit Targets

Reviewed:
- `packages/knowledge/server/src/Rdf/ProvenanceEmitter.ts`
- `packages/knowledge/server/src/Rdf/RdfStoreService.ts`
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- `packages/knowledge/domain/src/entities/{Entity,Relation,Mention}.model.ts`
- `packages/knowledge/domain/src/value-objects/EvidenceSpan.value.ts`
- `packages/knowledge/tables/src/tables/{entity,relation,mention,mention-record,extraction}.table.ts`
- `packages/knowledge/domain/src/value-objects/reasoning/InferenceResult.ts`

## Findings (Durability and Gaps)

1. **RDF store is in-memory only.**
   - `RdfStoreService` uses an in-process `N3.Store`, which is ephemeral and not persisted. Any RDF provenance emitted by `ProvenanceEmitter` will be lost across process restarts.

2. **ProvenanceEmitter emits activity/document links but no text spans.**
   - `ProvenanceEmitter` writes PROV-O quads that link entities/relations to an extraction activity, actor, and document. It does not attach evidence spans or mention IDs, so UI click-through to source text cannot be satisfied from RDF alone.

3. **Existing durable evidence storage already exists, but it is fragmented.**
   - `knowledge.mention` table: durable, per-mention spans (`text`, `startChar`, `endChar`, `documentId`, `extractionId`, `confidence`, `context`). This is the strongest candidate for entity click-through.
   - `knowledge.relation` table: stores `evidence` JSONB with `text`, `startChar`, `endChar`, optional `confidence`. **Missing `documentId` in evidence**; relies on `relation.extractionId` (optional) to map to `extraction.documentId`.
   - `knowledge.entity` table: has `mentions` JSONB array of spans, but no `documentId` per span. This cannot safely support cross-document provenance if an entity is merged across documents.
   - `knowledge.mention_record` captures LLM output metadata but no offsets; not sufficient for UI highlighting.

4. **Meeting-prep / GraphRAG provenance is not persisted.**
   - `InferenceResult` provenance is in-memory only and not written to SQL. There is no table for meeting-prep bullets or their citations.

## Conclusion: Where Evidence Spans Should Live

- **Entity click-through:** Use `knowledge.mention` as the source of truth for spans. It has document IDs and offsets; do not rely on `entity.mentions` JSONB for UI.
- **Relation click-through:** Use `relation.evidence` for the span, but require a `documentId` to be resolvable. Today that requires `relation.extractionId → extraction.documentId`. This is fragile because `extractionId` is optional.
- **Meeting-prep bullet click-through:** Requires a new durable link table to bind bullets to evidence spans (mentions or relations) or directly to source document spans.

## Minimal Persistence Plan

### Option A: Reuse Existing Tables (minimum change)

- **Entity evidence:** Query `knowledge.mention` by `entityId` and `organizationId`. This yields spans with document IDs and offsets.
- **Relation evidence:** Use `relation.evidence` and require `relation.extractionId` to be present. Resolve document via `extraction`.
- **Meeting-prep bullet evidence:** Add a new, minimal table to store bullet text + citations referencing existing `mention` or `relation` records.

### Option B: Minimal New Schema (recommended)

Keep existing tables, add two tables to make click-through deterministic without special-case joins:

```sql
-- Stores the bullet text produced by meeting prep (or any GraphRAG output)
create table knowledge_meeting_prep_bullet (
  id text primary key,
  organization_id text not null,
  meeting_prep_id text not null,
  bullet_index int not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- Links bullets to evidence spans, referencing existing mentions/relations or raw doc spans
create table knowledge_meeting_prep_evidence (
  id text primary key,
  organization_id text not null,
  bullet_id text not null references knowledge_meeting_prep_bullet(id) on delete cascade,
  source_type text not null, -- 'mention' | 'relation' | 'document_span'
  mention_id text,
  relation_id text,
  document_id text,
  start_char int,
  end_char int,
  text text,
  confidence real,
  extraction_id text,
  created_at timestamptz not null default now(),
  check (
    (source_type = 'mention' and mention_id is not null) or
    (source_type = 'relation' and relation_id is not null) or
    (source_type = 'document_span' and document_id is not null and start_char is not null and end_char is not null)
  )
);
```

Notes:
- `meeting_prep_id` can be the ID of a query/run log (if/when added). If none exists yet, it can be the batch execution ID or request ID.
- This schema keeps evidence spans inside SQL and avoids dependence on ephemeral RDF stores.

### Optional Hardening (small additions)

- Add `documentId` (or `evidenceDocumentId`) to `knowledge.relation` so relation evidence is resolvable even when `extractionId` is null.
- Deprecate or ignore `entity.mentions` for UI evidence because it does not include document IDs.

## API Surface (Minimal, Evidence-First)

Design a single evidence endpoint with targeted filters. This avoids multiple overlapping RPCs while supporting entity/relation/bullet use cases.

### `Evidence.List`

**Request**
- `organizationId`
- `entityId?`
- `relationId?`
- `meetingPrepBulletId?`
- `documentId?`
- `limit?`

**Response**
- `evidence: EvidenceSpan[]`

**EvidenceSpan**
- `sourceType: 'mention' | 'relation' | 'document_span'`
- `sourceId: string` (mentionId or relationId or generated id)
- `documentId: string`
- `startChar: number`
- `endChar: number`
- `text: string`
- `confidence?: number`
- `extractionId?: string`

### Resolution Rules

- If `entityId` is provided: select from `knowledge.mention` by `entityId`.
- If `relationId` is provided: select from `knowledge.relation` evidence and resolve `documentId` via `extraction` (or direct column if added).
- If `meetingPrepBulletId` is provided: select from `knowledge_meeting_prep_evidence` and join to mentions/relations/doc spans for `documentId` and offsets.

## Risks and Assumptions (Explicit)

- The current RDF provenance graph is not durable and cannot serve UI click-through on its own.
- `relation.extractionId` is optional; relying on it is a data integrity risk for evidence retrieval.
- `entity.mentions` JSONB is insufficient for multi-document provenance because it omits document IDs.

## Next Steps

1. Decide whether to add `documentId` to `knowledge.relation` or enforce `extractionId` for all relation evidence.
2. Implement `Evidence.List` RPC and repo queries for mention/relations/bullet evidence.
3. Add meeting-prep evidence persistence (minimal tables above) once meeting-prep output is generated.

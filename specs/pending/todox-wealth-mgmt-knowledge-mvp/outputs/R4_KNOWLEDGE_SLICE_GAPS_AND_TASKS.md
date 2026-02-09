# Knowledge Slice Gaps And Tasks (Gmail E2E)

## Scope Notes
- Request targets the knowledge slice, but a Gmail-to-knowledge demo crosses `integrations/google-workspace`, `runtime`, and `documents` slices. The gaps below cite those cross-slice touchpoints where they block the knowledge flow.
- Code paths cited are current; no extrapolation beyond what exists in the repo.

## Current State (Observed Paths)
- Gmail read adapter exists but is not wired into extraction or document materialization: `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`.
- Extraction pipeline operates on raw text + ontology content and writes only to in-memory RDF store: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`, `packages/knowledge/server/src/Rdf/RdfStoreService.ts`.
- GraphRAG and entity/relation lookups query SQL repositories, but there is no write path populating those tables: `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`, `packages/knowledge/server/src/db/repos/Entity.repo.ts`, `packages/knowledge/server/src/db/repos/Relation.repo.ts`.
- Demo UI uses mock data and arbitrary graphs, not pipeline outputs: `apps/todox/src/app/knowledge-demo/actions.ts`, `apps/todox/src/app/2d-force-graph/page.tsx`.
- Ontology registry service exists but no registry file or runtime wiring is present: `packages/knowledge/server/src/Service/OntologyRegistry.ts`.
- Knowledge RPC handlers are partial and not wired into runtime RPC router: `packages/knowledge/server/src/rpc/v1/_rpcs.ts`, `packages/runtime/server/src/Rpc.layer.ts`.

## Demo Blockers (Must-Fix To Show Gmail → Knowledge Graph)

### 1) Document Materialization Is Missing
**Gap**: Gmail extraction returns `ExtractedEmailDocument` but nothing creates a `Document` or `DocumentVersion`, and nothing maps Gmail message IDs to `DocumentsEntityIds.DocumentId`.
- Gmail adapter output only: `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`.
- Document persistence exists separately: `packages/documents/server/src/db/repos/Document.repo.ts`, `packages/documents/domain/src/entities/document/document.rpc.ts`.

**Why it blocks a demo**: Knowledge extraction requires `documentId` (`ExtractionPipelineConfig.documentId`) and expects document-level provenance; Gmail data never becomes a document.
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`.

**Task**:
- Create a minimal “Gmail → Document materializer” that:
  - Creates a `Document` (and optionally `DocumentVersion`) for each Gmail message or thread.
  - Stores raw email text (body) and links to Gmail `sourceId`.
  - Returns the new `DocumentsEntityIds.DocumentId` to the extraction workflow.

### 2) Extraction Is Not Persisted (Entities/Relations/Mentions/Extractions)
**Gap**: Extraction pipeline only returns a `KnowledgeGraph` and writes RDF quads to an in-memory store. No SQL persistence for extraction rows, entities, relations, mentions, or mention records.
- Extraction pipeline: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`.
- Knowledge tables exist but are unused in pipeline:
  - `packages/knowledge/tables/src/tables/extraction.table.ts`
  - `packages/knowledge/tables/src/tables/entity.table.ts`
  - `packages/knowledge/tables/src/tables/relation.table.ts`
  - `packages/knowledge/tables/src/tables/mention.table.ts`
  - `packages/knowledge/tables/src/tables/mention-record.table.ts`

**Why it blocks a demo**: GraphRAG and entity listing read from SQL repos; extraction writes nothing, so queries return empty results.
- `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`

**Task**:
- Add an extraction persistence stage (post-`GraphAssembler`) to insert:
  - `Extraction` row (status, counts, timing) into `extraction` table.
  - `Entity`, `Relation`, `Mention`, `MentionRecord` rows tied to the extractionId.
- Ensure the pipeline calls `MentionRecordRepo` when clustering is enabled (currently only builds in-memory objects).

### 3) Embeddings Are Never Stored For Extracted Entities
**Gap**: `EmbeddingService.embedEntities` writes embeddings, but it is never called in extraction pipeline or workflow.
- `packages/knowledge/server/src/Embedding/EmbeddingService.ts`.
- Extraction pipeline does not call embedding: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`.

**Why it blocks a demo**: `GraphRAGService.query` relies on embeddings to find seed entities; without embeddings, similarity search yields no results.
- `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`.

**Task**:
- Call `EmbeddingService.embedEntities` after entity persistence (or with assembled entities) to populate `embedding` table.

### 4) Ontology Registry Not Used Or Seeded
**Gap**: `OntologyRegistry` expects `ontology/registry.json` in storage, but no registry file is shipped, and no runtime wiring loads it.
- Registry service: `packages/knowledge/server/src/Service/OntologyRegistry.ts`.
- Storage default is in-memory: `packages/knowledge/server/src/Service/Storage.ts`.

**Why it blocks a demo**: The extraction workflow expects ontology content in payload; there’s no way to select a named ontology or resolve IDs to content.
- Batch payload requires `ontologyContent`: `packages/knowledge/domain/src/rpc/Batch/StartBatch.ts`.

**Task**:
- Provide a default registry JSON and load it on boot.
- Add a lookup to load ontology content by registry entry or stored ontology in DB.

### 5) Missing RPC Surfaces For Extraction + Ontology
**Gap**: Domain RPC contracts exist for extraction and ontology, but server handlers are missing; runtime RPC router only mounts shared rpcs.
- Domain contracts:
  - `packages/knowledge/domain/src/rpc/Extraction/Extract.ts`
  - `packages/knowledge/domain/src/rpc/Extraction/List.ts`
  - `packages/knowledge/domain/src/rpc/Ontology/List.ts`
- Server RPCs only include batch/entity/relation/graphrag: `packages/knowledge/server/src/rpc/v1/_rpcs.ts`.
- Runtime router mounts only shared rpcs: `packages/runtime/server/src/Rpc.layer.ts`.

**Why it blocks a demo**: There is no API entrypoint to start an extraction using Gmail content or to list ontologies.

**Task**:
- Implement knowledge RPC handlers for Extraction + Ontology.
- Mount knowledge RPC group in runtime server.

### 6) Provenance Is Not Exposed In UI
**Gap**: Provenance quads are emitted but no API or UI exposes them; demo UI uses mock data without provenance.
- Provenance emitter: `packages/knowledge/server/src/Rdf/ProvenanceEmitter.ts`.
- RDF store is in-memory and not queryable via UI.
- Demo UI uses mock data: `apps/todox/src/app/knowledge-demo/actions.ts`.

**Why it blocks a demo**: The “why should I trust this graph?” story is missing. No evidence spans or extraction provenance can be shown.

**Task**:
- Add API to fetch provenance by `extractionId` and `documentId`.
- UI panel to display evidence spans (mention context, relation evidence, provenance chain).

## Production Hardening Gaps (Beyond Demo)

### A) Persistence And Durability
- RDF store is purely in-memory: `packages/knowledge/server/src/Rdf/RdfStoreService.ts`.
- Storage defaults to in-memory for registry and storage-backed artifacts: `packages/knowledge/server/src/Service/Storage.ts`.

**Tasks**:
- Add persistent RDF backend or materialize RDF from SQL on demand.
- Provide durable storage backend (S3/DB) for registry + ontology content.

### B) Repository Wiring Is Incomplete
- DataAccess layer only includes knowledge repos for ontology/class/property/embedding. Entity/Relation/Mention repos are not wired into the runtime data layer.
  - Knowledge repos layer: `packages/knowledge/server/src/db/repositories.ts`.
  - Runtime data access: `packages/runtime/server/src/DataAccess.layer.ts`.

**Tasks**:
- Add `EntityRepo`, `RelationRepo`, `MentionRecordRepo`, `MentionRepo`, `ExtractionRepo` to `KnowledgeRepos.layer`.
- Expose those repos via `DataAccess.layer`.

### C) Extraction Status, Retry, And Idempotency
- Extraction workflow emits events but there is no persisted extraction status row tied to `ExtractionId`.
- Batch orchestration is present, but no concrete idempotency based on Gmail message IDs.
  - `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`

**Tasks**:
- Persist extraction status updates in `extraction` table.
- Add idempotency keys keyed to Gmail `messageId`/`threadId`.

### D) Access Control / RLS Enforcement
- Entity/Relation repos rely on `organizationId` filters in queries but no enforcement is shown for extraction writes.
- RLS patterns are documented but not wired for extraction insertions.
  - RLS registry: `documentation/patterns/rls-patterns.md`

**Tasks**:
- Enforce organization scoping on all insertion paths.
- Validate that AuthContext is present and used when materializing data.

### E) Observability + Failure Handling
- Extraction pipeline logs but doesn’t persist failures or partial results.
- No central failure queue for retries.

**Tasks**:
- Write error details to `extraction.errorMessage` and metrics for retry queues.
- Add DLQ or retry policy for Gmail fetch failures and extraction steps.

## Recommended Implementation Order (Minimal Demo → Hardening)
1. **Materialize Gmail → Document** (create `Document`, map to Gmail IDs, produce text payload).
2. **Extraction persistence** (insert `Extraction`, `Entity`, `Relation`, `Mention`, `MentionRecord`).
3. **Embedding generation + storage** for extracted entities.
4. **RPC surface** for extraction + ontology + registry; wire into runtime.
5. **Basic provenance UI** (show evidence spans and extraction metadata).
6. **Persist RDF / registry storage** for production hardening.

## Appendix: Key Code Paths (For Quick Navigation)
- Gmail extraction adapter: `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`
- Extraction pipeline: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- Graph assembly: `packages/knowledge/server/src/Extraction/GraphAssembler.ts`
- RDF store + provenance: `packages/knowledge/server/src/Rdf/RdfStoreService.ts`, `packages/knowledge/server/src/Rdf/ProvenanceEmitter.ts`
- Embedding service: `packages/knowledge/server/src/Embedding/EmbeddingService.ts`
- GraphRAG service: `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`
- Knowledge tables: `packages/knowledge/tables/src/tables/*.table.ts`
- Knowledge RPC server layer: `packages/knowledge/server/src/rpc/v1/_rpcs.ts`
- Runtime RPC router: `packages/runtime/server/src/Rpc.layer.ts`
- Demo UI (mocked): `apps/todox/src/app/knowledge-demo/actions.ts`

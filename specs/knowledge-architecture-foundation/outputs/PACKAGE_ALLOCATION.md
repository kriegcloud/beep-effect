# Package Allocation Matrix

## Document Metadata

| Field        | Value                                      |
|--------------|--------------------------------------------|
| Status       | COMPLETE                                   |
| Created      | 2026-02-03                                 |
| Spec         | knowledge-architecture-foundation          |
| Phase        | -1 (Architectural Foundation)              |

---

## 1. Existing Components (Audit)

### 1.1 Domain Layer (`@beep/knowledge-domain`)

#### Entities

| Component           | Current Location                                         | Status   | Notes                                              |
|---------------------|----------------------------------------------------------|----------|----------------------------------------------------|
| ClassDefinition     | `src/entities/class-definition/`                         | Complete | Model with OntologyId FK                           |
| Embedding           | `src/entities/embedding/`                                | Complete | Model with EntityId/RelationId FK                  |
| Entity              | `src/entities/entity/`                                   | Complete | Core entity model, needs RPC contracts             |
| EntityCluster       | `src/entities/entity-cluster/`                           | Complete | Clustering results model                           |
| Extraction          | `src/entities/extraction/`                               | Complete | Extraction run metadata                            |
| Mention             | `src/entities/mention/`                                  | Complete | Text mention with EvidenceSpan                     |
| Ontology            | `src/entities/ontology/`                                 | Complete | Ontology metadata model                            |
| PropertyDefinition  | `src/entities/property-definition/`                      | Complete | Property definition with domain/range              |
| Relation            | `src/entities/relation/`                                 | Complete | Triple relation model, needs RPC contracts         |
| SameAsLink          | `src/entities/same-as-link/`                             | Complete | owl:sameAs tracking                                |

#### Value Objects

| Component      | Current Location                        | Status   | Notes                              |
|----------------|----------------------------------------|----------|------------------------------------|
| Attributes     | `src/value-objects/attributes.value.ts` | Complete | Key-value attributes schema        |
| ClassIri       | `src/value-objects/class-iri.value.ts`  | Complete | Validated IRI schema               |
| EvidenceSpan   | `src/value-objects/evidence-span.value.ts` | Complete | Text span evidence                |

#### Errors

| Component             | Current Location                      | Status   | Notes                           |
|-----------------------|---------------------------------------|----------|---------------------------------|
| EntityResolutionErrors | `src/errors/entity-resolution.errors.ts` | Complete | Resolution failure errors       |
| ExtractionErrors       | `src/errors/extraction.errors.ts`       | Complete | Extraction pipeline errors      |
| GroundingErrors        | `src/errors/grounding.errors.ts`        | Complete | Grounding/validation errors     |
| OntologyErrors         | `src/errors/ontology.errors.ts`         | Complete | Ontology parsing/lookup errors  |

### 1.2 Tables Layer (`@beep/knowledge-tables`)

| Component            | Current Location                              | Status   | Notes                                    |
|----------------------|-----------------------------------------------|----------|------------------------------------------|
| class-definition     | `src/tables/class-definition.table.ts`        | Complete | OrgTable.make() pattern                  |
| embedding            | `src/tables/embedding.table.ts`               | Complete | pgvector column for embeddings           |
| entity               | `src/tables/entity.table.ts`                  | Complete | Core entity storage                      |
| entity-cluster       | `src/tables/entity-cluster.table.ts`          | Complete | Cluster membership                       |
| extraction           | `src/tables/extraction.table.ts`              | Complete | Extraction run tracking                  |
| mention              | `src/tables/mention.table.ts`                 | Complete | Mention with evidence span               |
| ontology             | `src/tables/ontology.table.ts`                | Complete | Ontology metadata                        |
| property-definition  | `src/tables/property-definition.table.ts`     | Complete | Property constraints                     |
| relation             | `src/tables/relation.table.ts`                | Complete | Subject-predicate-object triples         |
| same-as-link         | `src/tables/same-as-link.table.ts`            | Complete | owl:sameAs relationships                 |

### 1.3 Server Layer (`@beep/knowledge-server`)

#### Services

| Component               | Current Location                                    | Status   | Notes                                     |
|-------------------------|-----------------------------------------------------|----------|-------------------------------------------|
| EmbeddingService        | `src/Embedding/EmbeddingService.ts`                 | Complete | OpenAI/Mock embedding providers           |
| EntityResolutionService | `src/EntityResolution/EntityResolutionService.ts`   | Complete | Within-batch resolution                   |
| EntityClusterer         | `src/EntityResolution/EntityClusterer.ts`           | Complete | Similarity-based clustering               |
| CanonicalSelector       | `src/EntityResolution/CanonicalSelector.ts`         | Complete | Canonical entity selection                |
| SameAsLinker            | `src/EntityResolution/SameAsLinker.ts`              | Complete | owl:sameAs link creation                  |
| ExtractionPipeline      | `src/Extraction/ExtractionPipeline.ts`              | Complete | Non-durable extraction orchestration      |
| MentionExtractor        | `src/Extraction/MentionExtractor.ts`                | Complete | LLM-based mention extraction              |
| EntityExtractor         | `src/Extraction/EntityExtractor.ts`                 | Complete | Entity classification                     |
| RelationExtractor       | `src/Extraction/RelationExtractor.ts`               | Complete | Relation extraction                       |
| GraphAssembler          | `src/Extraction/GraphAssembler.ts`                  | Complete | Graph construction from extractions       |
| GraphRAGService         | `src/GraphRAG/GraphRAGService.ts`                   | Complete | k-NN + N-hop traversal + RRF scoring      |
| ContextFormatter        | `src/GraphRAG/ContextFormatter.ts`                  | Complete | Context assembly for LLM                  |
| RrfScorer               | `src/GraphRAG/RrfScorer.ts`                         | Complete | Reciprocal rank fusion                    |
| GroundingService        | `src/Grounding/GroundingService.ts`                 | Complete | Entity grounding against ontology         |
| ConfidenceFilter        | `src/Grounding/ConfidenceFilter.ts`                 | Complete | Confidence-based filtering                |
| NlpService              | `src/Nlp/NlpService.ts`                             | Complete | Text preprocessing                        |
| TextChunk               | `src/Nlp/TextChunk.ts`                              | Complete | Chunking utilities                        |
| OntologyService         | `src/Ontology/OntologyService.ts`                   | Complete | Ontology management, class hierarchy      |
| OntologyParser          | `src/Ontology/OntologyParser.ts`                    | Complete | Turtle parsing via N3.js                  |
| OntologyCache           | `src/Ontology/OntologyCache.ts`                     | Complete | In-memory ontology cache                  |
| PromptTemplates         | `src/Ai/PromptTemplates.ts`                         | Complete | LLM prompt templates                      |
| LlmLayers               | `src/Runtime/LlmLayers.ts`                          | Complete | LLM provider configuration                |

#### Repositories

| Component               | Current Location                           | Status   | Notes                           |
|-------------------------|-------------------------------------------|----------|---------------------------------|
| ClassDefinitionRepo     | `src/db/repos/ClassDefinition.repo.ts`     | Complete | CRUD for class definitions      |
| EmbeddingRepo           | `src/db/repos/Embedding.repo.ts`           | Complete | Embedding storage with pgvector |
| EntityRepo              | `src/db/repos/Entity.repo.ts`              | Complete | Entity CRUD                     |
| EntityClusterRepo       | `src/db/repos/EntityCluster.repo.ts`       | Complete | Cluster CRUD                    |
| OntologyRepo            | `src/db/repos/Ontology.repo.ts`            | Complete | Ontology CRUD                   |
| PropertyDefinitionRepo  | `src/db/repos/PropertyDefinition.repo.ts`  | Complete | Property definition CRUD        |
| RelationRepo            | `src/db/repos/Relation.repo.ts`            | Complete | Relation CRUD                   |
| SameAsLinkRepo          | `src/db/repos/SameAsLink.repo.ts`          | Complete | SameAs link CRUD                |

### 1.4 Client Layer (`@beep/knowledge-client`)

| Component | Current Location     | Status  | Notes                            |
|-----------|---------------------|---------|----------------------------------|
| index     | `src/index.ts`       | Stub    | Placeholder, no RPC client setup |

### 1.5 UI Layer (`@beep/knowledge-ui`)

| Component | Current Location     | Status  | Notes                 |
|-----------|---------------------|---------|----------------------|
| index     | `src/index.ts`       | Stub    | Placeholder          |

---

## 2. New Components (To Create)

### 2.1 Domain Layer (`@beep/knowledge-domain`)

#### Value Objects - RDF (`src/value-objects/rdf/`)

| File                | Description                               | Priority | Dependencies |
|---------------------|-------------------------------------------|----------|--------------|
| `index.ts`          | Barrel export for RDF value objects       | P0       | None         |
| `Quad.ts`           | RDF quad schema (subject, predicate, object, graph) | P0 | None |
| `QuadPattern.ts`    | Query pattern with optional fields        | P0       | Quad.ts      |
| `RdfFormat.ts`      | Serialization format enum (Turtle, N-Triples, JSON-LD) | P0 | None |
| `Term.ts`           | RDF term types (NamedNode, BlankNode, Literal) | P0 | None |

#### Value Objects - SPARQL (`src/value-objects/sparql/`)

| File                  | Description                                    | Priority | Dependencies |
|-----------------------|------------------------------------------------|----------|--------------|
| `index.ts`            | Barrel export for SPARQL value objects         | P0       | None         |
| `SparqlBindings.ts`   | Query result bindings schema                   | P0       | None         |
| `SparqlQuery.ts`      | Query string wrapper with validation           | P1       | None         |
| `SparqlResultFormat.ts` | Result format enum (JSON, XML, CSV)          | P1       | None         |

#### Value Objects - Reasoning (`src/value-objects/reasoning/`)

| File                  | Description                                    | Priority | Dependencies |
|-----------------------|------------------------------------------------|----------|--------------|
| `index.ts`            | Barrel export for reasoning value objects      | P1       | None         |
| `InferenceResult.ts`  | Inference output with inferred quads           | P1       | Quad.ts      |
| `ReasoningProfile.ts` | Reasoning profile enum (RDFS, OWL-RL)          | P1       | None         |
| `InferenceTrace.ts`   | Step-by-step inference explanation             | P2       | None         |

#### Error Schemas (`src/errors/`)

| File                    | Description                             | Priority | Dependencies |
|-------------------------|-----------------------------------------|----------|--------------|
| `sparql.errors.ts`      | SPARQL parsing/execution errors         | P0       | None         |
| `rdf.errors.ts`         | RDF serialization/parsing errors        | P0       | None         |
| `reasoning.errors.ts`   | Reasoning/inference errors              | P1       | None         |
| `workflow.errors.ts`    | Workflow execution errors               | P0       | None         |

#### RPC Contracts - Entity (`src/rpc/v1/entity/`)

| File           | Description                                      | Priority | Dependencies         |
|----------------|--------------------------------------------------|----------|----------------------|
| `_rpcs.ts`     | RpcGroup composition for Entity domain           | P0       | All contracts below  |
| `get.ts`       | Get entity by ID contract                        | P0       | Entity.model         |
| `list.ts`      | List entities (streaming) contract               | P0       | Entity.model         |
| `create.ts`    | Create entity contract                           | P0       | Entity.model         |
| `update.ts`    | Update entity contract                           | P0       | Entity.model         |
| `delete.ts`    | Delete entity contract                           | P1       | Entity.model         |
| `search.ts`    | Search entities by embedding similarity          | P1       | Entity.model         |

#### RPC Contracts - Relation (`src/rpc/v1/relation/`)

| File           | Description                                      | Priority | Dependencies         |
|----------------|--------------------------------------------------|----------|----------------------|
| `_rpcs.ts`     | RpcGroup composition for Relation domain         | P0       | All contracts below  |
| `get.ts`       | Get relation by ID contract                      | P0       | Relation.model       |
| `list.ts`      | List relations (streaming) contract              | P0       | Relation.model       |
| `create.ts`    | Create relation contract                         | P0       | Relation.model       |
| `delete.ts`    | Delete relation contract                         | P1       | Relation.model       |
| `findByEntity.ts` | Find relations involving entity               | P0       | Relation.model       |

#### RPC Contracts - GraphRAG (`src/rpc/v1/graph-rag/`)

| File           | Description                                      | Priority | Dependencies         |
|----------------|--------------------------------------------------|----------|----------------------|
| `_rpcs.ts`     | RpcGroup composition for GraphRAG domain         | P0       | All contracts below  |
| `query.ts`     | Execute GraphRAG query contract                  | P0       | GraphRAGResult       |
| `explain.ts`   | Get reasoning trace for query (P2)               | P2       | InferenceTrace       |

#### RPC Contracts - SPARQL (`src/rpc/v1/sparql/`)

| File           | Description                                      | Priority | Dependencies         |
|----------------|--------------------------------------------------|----------|----------------------|
| `_rpcs.ts`     | RpcGroup composition for SPARQL domain           | P1       | All contracts below  |
| `select.ts`    | Execute SELECT query contract                    | P1       | SparqlBindings       |
| `construct.ts` | Execute CONSTRUCT query contract                 | P1       | Quad                 |
| `ask.ts`       | Execute ASK query contract                       | P2       | None                 |

#### RPC Contracts - Extraction (`src/rpc/v1/extraction/`)

| File           | Description                                      | Priority | Dependencies         |
|----------------|--------------------------------------------------|----------|----------------------|
| `_rpcs.ts`     | RpcGroup composition for Extraction domain       | P0       | All contracts below  |
| `extract.ts`   | Start extraction contract (streaming progress)   | P0       | ExtractionResult     |
| `status.ts`    | Get extraction status contract                   | P0       | ExtractionStatus     |
| `cancel.ts`    | Cancel running extraction contract               | P1       | None                 |

#### RPC Contracts - Resolution (`src/rpc/v1/resolution/`)

| File           | Description                                      | Priority | Dependencies         |
|----------------|--------------------------------------------------|----------|----------------------|
| `_rpcs.ts`     | RpcGroup composition for Resolution domain       | P1       | All contracts below  |
| `resolve.ts`   | Trigger entity resolution contract               | P1       | ResolutionResult     |
| `merge.ts`     | Manually merge entities contract                 | P1       | Entity.model         |
| `split.ts`     | Split merged entity contract                     | P2       | Entity.model         |

### 2.2 Tables Layer (`@beep/knowledge-tables`)

| File                             | Description                              | Priority | Dependencies |
|----------------------------------|------------------------------------------|----------|--------------|
| `mention-record.table.ts`        | Immutable extraction evidence            | P1       | None         |
| `entity-merge-history.table.ts`  | Entity merge decision audit trail        | P1       | None         |
| `workflow-execution.table.ts`    | @effect/workflow execution state         | P0       | None         |
| `workflow-activity.table.ts`     | Workflow activity checkpoints            | P0       | None         |
| `workflow-signal.table.ts`       | Workflow signal events                   | P0       | None         |

### 2.3 Server Layer (`@beep/knowledge-server`)

#### RDF Services (`src/Rdf/`)

| File                  | Description                                      | Priority | Dependencies        |
|-----------------------|--------------------------------------------------|----------|---------------------|
| `index.ts`            | Barrel export for RDF services                   | P0       | None                |
| `RdfStoreService.ts`  | N3.Store wrapper with Effect service             | P0       | N3.js               |
| `NamedGraph.ts`       | Named graph management                           | P0       | RdfStoreService     |
| `RdfBuilder.ts`       | Fluent RDF construction API                      | P1       | RdfStoreService     |
| `Serializer.ts`       | Turtle/N-Triples/JSON-LD serialization           | P0       | N3.js               |

#### SPARQL Services (`src/Sparql/`)

| File                  | Description                                      | Priority | Dependencies        |
|-----------------------|--------------------------------------------------|----------|---------------------|
| `index.ts`            | Barrel export for SPARQL services                | P1       | None                |
| `SparqlService.ts`    | SPARQL query execution                           | P1       | RdfStoreService     |
| `SparqlParser.ts`     | SPARQL parsing via sparqljs                      | P1       | sparqljs            |
| `ResultFormatter.ts`  | Format SPARQL results                            | P1       | None                |

#### Reasoning Services (`src/Reasoning/`)

| File                  | Description                                      | Priority | Dependencies        |
|-----------------------|--------------------------------------------------|----------|---------------------|
| `index.ts`            | Barrel export for reasoning services             | P1       | None                |
| `ReasonerService.ts`  | Forward-chaining reasoner                        | P1       | RdfStoreService     |
| `RdfsRules.ts`        | RDFS entailment rules                            | P1       | None                |
| `OwlRlRules.ts`       | OWL RL subset rules                              | P2       | None                |
| `InferenceCache.ts`   | Cache for inferred triples                       | P2       | None                |

#### Validation Services (`src/Validation/`)

| File                  | Description                                      | Priority | Dependencies        |
|-----------------------|--------------------------------------------------|----------|---------------------|
| `index.ts`            | Barrel export for validation services            | P1       | None                |
| `ShaclService.ts`     | SHACL shape validation                           | P1       | RdfStoreService     |
| `ShaclParser.ts`      | Parse SHACL shapes from RDF                      | P1       | None                |
| `ValidationReport.ts` | SHACL validation report schema                   | P1       | None                |

#### Workflow Services (`src/Workflow/`)

| File                     | Description                                   | Priority | Dependencies          |
|--------------------------|-----------------------------------------------|----------|-----------------------|
| `index.ts`               | Barrel export for workflow services           | P0       | None                  |
| `ExtractionWorkflow.ts`  | @effect/workflow definition                   | P0       | @effect/workflow      |
| `DurableActivities.ts`   | Activity implementations                      | P0       | ExtractionPipeline    |
| `WorkflowPersistence.ts` | PostgreSQL persistence layer                  | P0       | Workflow tables       |
| `ProgressStream.ts`      | SSE progress events                           | P0       | None                  |
| `BatchStateMachine.ts`   | State machine for batch processing            | P0       | None                  |

#### Enhanced Entity Resolution (`src/EntityResolution/`)

| File                      | Description                                   | Priority | Dependencies          |
|---------------------------|-----------------------------------------------|----------|-----------------------|
| `EntityRegistry.ts`       | Cross-batch entity lookup                     | P1       | EntityRepo            |
| `MergeHistory.ts`         | Track entity merge decisions                  | P1       | MergeHistory table    |
| `IncrementalClusterer.ts` | Add new mentions to existing clusters         | P2       | EntityClusterer       |

#### Enhanced GraphRAG (`src/GraphRAG/`)

| File                        | Description                                 | Priority | Dependencies          |
|-----------------------------|---------------------------------------------|----------|-----------------------|
| `GroundedAnswerGenerator.ts` | Generate answers with citations            | P2       | SparqlService         |
| `ReasoningTraceFormatter.ts` | Format inference paths                     | P2       | ReasonerService       |
| `CitationValidator.ts`       | Validate claims against graph              | P2       | SparqlService         |
| `AnswerSchemas.ts`           | Grounded answer output schemas             | P2       | None                  |

#### Resilience Services (`src/Resilience/`)

| File                  | Description                                      | Priority | Dependencies        |
|-----------------------|--------------------------------------------------|----------|---------------------|
| `index.ts`            | Barrel export for resilience services            | P3       | None                |
| `CircuitBreaker.ts`   | Circuit breaker pattern                          | P1       | None                |
| `RetryPolicy.ts`      | Configurable retry policies                      | P2       | None                |
| `RateLimiter.ts`      | Token bucket rate limiting                       | P3       | None                |

#### RPC Handlers (`src/rpc/v1/`)

| Directory             | Description                                      | Priority | Dependencies        |
|-----------------------|--------------------------------------------------|----------|---------------------|
| `entity/_rpcs.ts`     | Entity RPC handler layer composition             | P0       | Entity.Rpcs         |
| `relation/_rpcs.ts`   | Relation RPC handler layer composition           | P0       | Relation.Rpcs       |
| `graph-rag/_rpcs.ts`  | GraphRAG RPC handler layer composition           | P0       | GraphRAG.Rpcs       |
| `sparql/_rpcs.ts`     | SPARQL RPC handler layer composition             | P1       | Sparql.Rpcs         |
| `extraction/_rpcs.ts` | Extraction RPC handler layer composition         | P0       | Extraction.Rpcs     |
| `resolution/_rpcs.ts` | Resolution RPC handler layer composition         | P1       | Resolution.Rpcs     |

### 2.4 Client Layer (`@beep/knowledge-client`)

| File                     | Description                                   | Priority | Dependencies          |
|--------------------------|-----------------------------------------------|----------|-----------------------|
| `KnowledgeRpcClient.ts`  | RPC client setup                              | P0       | All domain RPCs       |
| `hooks/useEntity.ts`     | React hook for entity operations              | P1       | KnowledgeRpcClient    |
| `hooks/useGraphRAG.ts`   | React hook for GraphRAG queries               | P1       | KnowledgeRpcClient    |
| `hooks/useExtraction.ts` | React hook for extraction with progress       | P1       | KnowledgeRpcClient    |

---

## 3. Dependency Rules

### 3.1 Allowed Dependencies

```
KNOWLEDGE-DOMAIN:
  @beep/shared-domain          # EntityIds, common schemas
  @beep/schema                 # Schema utilities (BS helpers)
  @effect/rpc                  # RPC contract definitions
  effect/*                     # Core Effect modules

KNOWLEDGE-TABLES:
  @beep/knowledge-domain       # EntityIds for column types
  @beep/shared-domain          # SharedEntityIds
  @beep/db-utils               # OrgTable.make(), Table.make()
  drizzle-orm                  # Table definitions

KNOWLEDGE-SERVER:
  @beep/knowledge-domain       # Domain models, RPC contracts, errors
  @beep/knowledge-tables       # Table definitions for queries
  @beep/shared-domain          # SharedEntityIds, Policy
  @beep/shared-server          # DbClient, shared services
  @beep/common-utils           # Utility functions
  @effect/rpc                  # RPC handler implementation
  @effect/ai                   # LLM integration
  @effect/sql-pg               # Database queries
  @effect/workflow             # Durable execution (Phase 3)
  n3                           # RDF parsing/storage
  sparqljs                     # SPARQL parsing (Phase 1)

KNOWLEDGE-CLIENT:
  @beep/knowledge-domain       # Domain models, RPC contracts
  @beep/shared-domain          # SharedEntityIds
  @effect/rpc                  # RPC client
  effect/*                     # Core Effect modules
  react                        # React integration
```

### 3.2 Forbidden Dependencies

```
CROSS-SLICE IMPORTS (FORBIDDEN):
  knowledge-* --> iam-*                     # NO cross-slice imports
  knowledge-* --> documents-*               # NO cross-slice imports
  knowledge-* --> calendar-*                # NO cross-slice imports
  knowledge-* --> comms-*                   # NO cross-slice imports
  knowledge-* --> customization-*           # NO cross-slice imports

REVERSE DEPENDENCIES (FORBIDDEN):
  knowledge-domain --> knowledge-server     # Domain NEVER imports server
  knowledge-domain --> knowledge-tables     # Domain NEVER imports tables
  knowledge-domain --> knowledge-client     # Domain NEVER imports client
  knowledge-tables --> knowledge-server     # Tables NEVER imports server

CIRCULAR DEPENDENCIES (FORBIDDEN):
  Any import cycle between knowledge packages

LAYER VIOLATIONS (FORBIDDEN):
  knowledge-domain: Service implementations, database access, external APIs
  knowledge-tables: Query logic, repository methods, business logic
  knowledge-server: Domain type definitions, table definitions
```

### 3.3 Dependency Direction Diagram

```
                    @beep/shared-domain
                           |
            +--------------+---------------+
            |              |               |
            v              v               v
    knowledge-domain  knowledge-tables  knowledge-server
            |              |               |
            |              +-------+-------+
            |                      |
            v                      v
    knowledge-client         (internal imports)
```

---

## 4. Implementation Order

### Phase -1A: Foundation (Week 1, Days 1-2)

**Goal**: Establish package structure and EntityId definitions

1. **Create value object directories**
   - `src/value-objects/rdf/index.ts`
   - `src/value-objects/sparql/index.ts`
   - `src/value-objects/reasoning/index.ts`

2. **Create RPC directory structure**
   - `src/rpc/v1/entity/`
   - `src/rpc/v1/relation/`
   - `src/rpc/v1/graph-rag/`
   - `src/rpc/v1/extraction/`
   - `src/rpc/v1/sparql/`
   - `src/rpc/v1/resolution/`

3. **Verify EntityId exports**
   - Confirm `KnowledgeEntityIds` in `@beep/shared-domain` includes all needed IDs
   - Add missing IDs if needed: `WorkflowId`, `MentionRecordId`

### Phase -1B: Value Objects (Week 1, Days 2-3)

**Goal**: Create all value object schemas

1. **RDF Value Objects** (P0)
   ```
   Term.ts -> Quad.ts -> QuadPattern.ts -> RdfFormat.ts -> index.ts
   ```

2. **SPARQL Value Objects** (P0)
   ```
   SparqlBindings.ts -> SparqlQuery.ts -> SparqlResultFormat.ts -> index.ts
   ```

3. **Reasoning Value Objects** (P1)
   ```
   ReasoningProfile.ts -> InferenceResult.ts -> InferenceTrace.ts -> index.ts
   ```

### Phase -1C: Error Schemas (Week 1, Day 3)

**Goal**: Create tagged error schemas

1. **Create error files**
   ```
   sparql.errors.ts
   rdf.errors.ts
   reasoning.errors.ts
   workflow.errors.ts
   ```

2. **Update errors/index.ts** to export new errors

### Phase -1D: RPC Contracts (Week 1, Days 3-5)

**Goal**: Define all RPC contracts (domain layer only, no implementations)

**Order by priority and dependency**:

1. **Entity RPCs** (P0) - No dependencies
   ```
   get.ts -> list.ts -> create.ts -> update.ts -> delete.ts -> search.ts -> _rpcs.ts
   ```

2. **Relation RPCs** (P0) - No dependencies
   ```
   get.ts -> list.ts -> create.ts -> delete.ts -> findByEntity.ts -> _rpcs.ts
   ```

3. **GraphRAG RPCs** (P0) - Depends on Entity/Relation models
   ```
   query.ts -> explain.ts -> _rpcs.ts
   ```

4. **Extraction RPCs** (P0) - No dependencies
   ```
   extract.ts -> status.ts -> cancel.ts -> _rpcs.ts
   ```

5. **SPARQL RPCs** (P1) - Depends on SPARQL value objects
   ```
   select.ts -> construct.ts -> ask.ts -> _rpcs.ts
   ```

6. **Resolution RPCs** (P1) - Depends on Entity model
   ```
   resolve.ts -> merge.ts -> split.ts -> _rpcs.ts
   ```

### Phase -1E: Server RPC Scaffolding (Week 1, Day 5)

**Goal**: Create handler layer composition (placeholder implementations)

1. **Create handler directories**
   ```
   src/rpc/v1/entity/_rpcs.ts
   src/rpc/v1/relation/_rpcs.ts
   src/rpc/v1/graph-rag/_rpcs.ts
   src/rpc/v1/extraction/_rpcs.ts
   src/rpc/v1/sparql/_rpcs.ts
   src/rpc/v1/resolution/_rpcs.ts
   ```

2. **Wire up to main RPC layer**
   - Create `src/rpc/v1/_rpcs.ts` merging all handler layers

---

## 5. RPC Pattern Reference

### Domain Layer Contract Definition

**File**: `packages/knowledge/domain/src/rpc/v1/entity/_rpcs.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Get from "./get";
import * as List from "./list";
import * as Create from "./create";
import * as Update from "./update";
import * as Delete from "./delete";

const $I = $KnowledgeDomainId.create("rpc/v1/entity/_rpcs");

export class Rpcs extends RpcGroup.make(
  Get.Contract,
  List.Contract,
  Create.Contract,
  Update.Contract,
  Delete.Contract,
).prefix("entity_") {}
```

**File**: `packages/knowledge/domain/src/rpc/v1/entity/get.ts`

```typescript
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import { Entity } from "../../../entities";
import * as Errors from "./errors";

export const Contract = Rpc.make("get", {
  payload: { id: KnowledgeEntityIds.EntityId },
  success: Entity.Model.json,
  error: Errors.EntityNotFoundError,
});
```

### Server Layer Handler Implementation

**File**: `packages/knowledge/server/src/rpc/v1/entity/_rpcs.ts`

```typescript
import { Policy } from "@beep/shared-domain";
import { Entity } from "@beep/knowledge-domain";
import * as Get from "./get";
import * as List from "./list";
import * as Create from "./create";
import * as Update from "./update";
import * as Delete from "./delete";

// 1. Apply middleware FIRST
const EntityRpcsWithMiddleware = Entity.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

// 2. Create implementation using .of()
const implementation = EntityRpcsWithMiddleware.of({
  entity_get: Get.Handler,
  entity_list: List.Handler,
  entity_create: Create.Handler,
  entity_update: Update.Handler,
  entity_delete: Delete.Handler,
});

// 3. Create layer from implementation
export const layer = EntityRpcsWithMiddleware.toLayer(implementation);
```

**File**: `packages/knowledge/server/src/rpc/v1/entity/get.ts`

```typescript
import * as Effect from "effect/Effect";
import { EntityRepo } from "../../../db/repos/Entity.repo";

export const Handler = (payload: { id: KnowledgeEntityIds.EntityId.Type }) =>
  Effect.gen(function* () {
    const repo = yield* EntityRepo;
    return yield* repo.findByIdOrFail(payload.id);
  }).pipe(Effect.withSpan("Entity.handlers.get", { captureStackTrace: false }));
```

---

## 6. Verification Checklist

### Phase -1 Completion Criteria

- [ ] All value object directories created with index.ts exports
- [ ] All RPC contract directories created
- [ ] EntityIds defined for all new entities (WorkflowId, MentionRecordId)
- [ ] Error schemas created for sparql, rdf, reasoning, workflow
- [ ] RPC contracts compile without implementation
- [ ] Server handler scaffolding in place with placeholder implementations
- [ ] Dependency rules enforced by TypeScript imports
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes

### Dependency Verification Commands

```bash
# Verify no circular dependencies
bun run lint --filter @beep/knowledge-domain

# Verify type compilation
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server

# Verify import boundaries (manual check)
grep -r "from.*@beep/iam" packages/knowledge/
# Should return empty (no cross-slice imports)
```

---

## Document History

| Date       | Author       | Changes                              |
|------------|--------------|--------------------------------------|
| 2026-02-03 | Architecture | Initial allocation matrix creation   |

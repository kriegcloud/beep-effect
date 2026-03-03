# Effect-Ontology @core-v2 System Architecture

> **Version:** 2.6.0
> **Last Updated:** December 2025
> **Status:** Unified Extraction Pipeline - Streaming First + WebSocket Events

## Table of Contents

1. [Overview](#overview)
2. [System Context](#system-context)
3. [Component Architecture](#component-architecture)
4. [Workflow Pipeline](#workflow-pipeline)
5. [Service Layer](#service-layer)
6. [Embedding Infrastructure](#embedding-infrastructure)
7. [Data Model](#data-model)
8. [Infrastructure](#infrastructure)
9. [Layer Composition](#layer-composition)
10. [API Reference](#api-reference)
11. [Document Preprocessing](#document-preprocessing)
12. [GraphRAG: Knowledge Graph Querying](#graphrag-knowledge-graph-querying)

---

## Overview

Effect-Ontology is a knowledge graph extraction system that transforms unstructured text into RDF triples using LLM-powered entity and relation extraction, guided by domain ontologies.

### Key Capabilities

- **Ontology-Guided Extraction**: Uses SKOS/OWL ontologies to constrain entity types and relation predicates
- **Unified Streaming Pipeline**: 6-phase extraction (Chunk → Mention → Entity → Property Scope → Relation → Ground)
- **Durable Workflows**: @effect/workflow-based pipelines with PostgreSQL persistence for crash recovery
- **SSE Streaming**: Real-time batch state streaming via Server-Sent Events
- **Batch Processing**: 5-stage workflow (Preprocess → Extract → Resolve → Validate → Ingest) wrapping 6-phase extraction
- **Agentic Document Preprocessing**: LLM-based document classification, adaptive chunking strategies, and intelligent batch ordering
- **Entity Resolution**: Graph-based clustering for entity deduplication
- **Grounding Verification**: Embedding-based relation filtering for context alignment (confidence ≥ 0.8)
- **SHACL Validation**: Optional shape-based constraint checking
- **GraphRAG Querying**: Retrieval-augmented generation with knowledge graph context, grounded answers with citations, and explainable reasoning traces

---

## System Context

```mermaid
C4Context
    title System Context Diagram

    Person(user, "API Consumer", "Application or service consuming the extraction API")

    System(core, "Effect-Ontology Core", "Knowledge graph extraction service")

    System_Ext(llm, "LLM Provider", "Anthropic/OpenAI/Google AI")
    System_Ext(gcs, "Google Cloud Storage", "Document and graph storage")
    System_Ext(postgres, "PostgreSQL", "Workflow state persistence")

    Rel(user, core, "POST /v1/extract/batch → SSE", "HTTPS")
    Rel(user, core, "GET /v1/batch/:id", "HTTPS")
    Rel(core, llm, "Generate entities/relations", "HTTPS")
    Rel(core, gcs, "Read/write documents and graphs", "HTTPS")
    Rel(core, postgres, "Persist workflow state", "TCP")
```

---

## Component Architecture

```mermaid
graph TB
    subgraph "HTTP Layer"
        API[HTTP Server]
        MW[Middleware<br/>CORS, Logging, Auth]
        HC[Health Check]
    end

    subgraph "Service Layer"
        subgraph "Orchestration"
            WO[WorkflowOrchestrator]
            BSH[BatchStateHub<br/>PubSub]
            BSP[BatchStatePersistence]
        end

        subgraph "Extraction"
            EE[EntityExtractor]
            RE[RelationExtractor]
            ME[MentionExtractor]
            GR[Grounder]
        end

        subgraph "Entity Resolution"
            ERS[EntityResolutionService]
            EL[EntityLinker]
            RLink[RelationLinker]
            SS2[SimilarityScorer]
        end

        subgraph "Embedding"
            ES[EmbeddingService]
            EP[EmbeddingProvider]
            EC[EmbeddingCache]
            ER[EmbeddingResolver]
            ERL[EmbeddingRateLimiter]
        end

        subgraph "GraphRAG"
            GRAG[GraphRAG]
            EIdx[EntityIndex]
            SGE[SubgraphExtractor]
        end

        subgraph "Core Services"
            CS[ConfigService]
            SS[StorageService]
            OS[OntologyService]
            OL[OntologyLoader]
            RB[RdfBuilder]
            SHACL[ShaclService]
        end

        subgraph "LLM Control"
            TB[TokenBudget]
            ST[StageTimeout]
            RL[RateLimiter]
        end
    end

    subgraph "Workflow Layer"
        BW[BatchExtractionWorkflow]
        SEA[StreamingExtractionActivity<br/>6-phase unified pipeline]
        SE[StreamingExtraction<br/>Core extraction engine]
        ERA[EntityResolutionActivity]
        VA[ValidationActivity]
        CEA[ComputeEmbeddingsActivity]
    end

    subgraph "Runtime Layer"
        PR[ProductionRuntime]
        TR[TestRuntime]
        PS[PostgresPersistence]
        WE[WorkflowEngine]
    end

    subgraph "Domain Layer"
        ID[Identity Types]
        PL[PathLayout]
        MD[Domain Models]
        OE[OntologyEmbeddings]
        SC[Schemas]
    end

    API --> MW
    MW --> WO
    MW --> BSH

    WO --> WE
    WO --> BSH
    BSH --> BSP
    WE --> BW
    BW --> SEA
    SEA --> SE

    SE --> EE
    SE --> RE
    SE --> ME
    SE --> GR
    SE --> NLP
    SEA --> SS
    SEA --> RB
    SEA --> ERS
    SEA --> SHACL

    EE --> OS
    RE --> OS
    GR --> OS
    GR --> SS2

    ERS --> ES
    SS2 --> ES
    ES --> EP
    ES --> EC
    ES --> ER
    EP --> ERL
    ER --> EP

    OL --> ES
    OL --> RB

    EE --> TB
    EE --> ST
    EE --> RL

    GRAG --> EIdx
    GRAG --> SGE
    EIdx --> ES
    SGE --> EIdx

    WE --> PS
    PS --> PostgreSQL[(PostgreSQL)]

    SS --> GCS[(GCS)]
    SS --> Local[(Local FS)]

    style WO fill:#e1f5fe
    style BW fill:#fff3e0
    style SEA fill:#a5d6a7
    style SE fill:#c8e6c9
    style ERS fill:#ffe0b2
    style ES fill:#e1bee7
    style GRAG fill:#b2dfdb
    style PS fill:#f3e5f5
```

---

## Workflow Pipeline

### Unified Extraction Architecture

The system uses a **unified streaming extraction pipeline** wrapped in durable workflow stages. The core extraction engine (`StreamingExtraction`) implements a 6-phase pipeline that is:

- **Single source of truth**: One extraction path for both batch and streaming use cases
- **Durable**: Wrapped in `StreamingExtractionActivity` for crash recovery
- **Grounded**: Includes embedding-based verification for context alignment

### Batch Extraction Workflow

The workflow orchestration layer consists of 5 durable stages, with the **Extracting** stage using the 6-phase unified pipeline:

```mermaid
stateDiagram-v2
    [*] --> Pending: start()

    Pending --> Preprocessing: Load manifest

    Preprocessing --> Extracting: Documents classified
    Preprocessing --> Failed: Preprocessing error

    Extracting --> Resolving: All documents extracted
    Extracting --> Failed: Extraction error

    Resolving --> Validating: Graphs merged
    Resolving --> Failed: Resolution error

    Validating --> Ingesting: SHACL conforms
    Validating --> Failed: Validation failed

    Ingesting --> Complete: Written to canonical
    Ingesting --> Failed: Ingestion error

    Complete --> [*]
    Failed --> [*]

    note right of Preprocessing
        Agentic classification
        Adaptive chunking
        Batch ordering
    end note

    note right of Extracting
        6-phase unified pipeline:
        Chunk → Mention → Entity →
        Property Scope → Relation → Ground
        Parallel execution (concurrency: 5)
    end note

    note right of Validating
        Optional SHACL
        shapes validation
    end note
```

### 6-Phase Unified Extraction Pipeline

The `StreamingExtraction` module implements the core extraction logic used by all extraction paths:

```mermaid
graph LR
    subgraph "Phase 1: Chunking"
        DOC[Document Text]
        CHUNK[NlpService.chunk]
        CHUNKS[TextChunk[]]
    end

    subgraph "Phase 2: Mention Detection"
        ME[MentionExtractor]
        MENTIONS[EntityMention[]]
    end

    subgraph "Phase 3: Entity Extraction"
        EE[EntityExtractor]
        CTX[OntologyContext]
        ENTITIES[ExtractedEntity[]]
    end

    subgraph "Phase 4: Property Scoping"
        OS[OntologyService.getPropertiesFor]
        PROPS[ScopedProperty[]]
    end

    subgraph "Phase 5: Relation Extraction"
        RE[RelationExtractor]
        RELS[ExtractedRelation[]]
    end

    subgraph "Phase 6: Grounding"
        GR[Grounder.verifyRelationBatch]
        FILTER[Filter ≥ 0.8 confidence]
        GROUNDED[GroundedRelation[]]
    end

    DOC --> CHUNK --> CHUNKS
    CHUNKS --> ME --> MENTIONS
    MENTIONS --> EE
    CTX --> EE
    EE --> ENTITIES
    ENTITIES --> OS --> PROPS
    ENTITIES --> RE
    PROPS --> RE
    RE --> RELS
    RELS --> GR --> FILTER --> GROUNDED

    style DOC fill:#e3f2fd
    style GROUNDED fill:#c8e6c9
    style GR fill:#a5d6a7
```

| Phase | Service | Input | Output | Purpose |
|-------|---------|-------|--------|---------|
| 1. Chunk | NlpService | Document text | TextChunk[] | Split into processable segments |
| 2. Mention | MentionExtractor | TextChunk[] | EntityMention[] | Detect entity mention spans |
| 3. Entity | EntityExtractor | Mentions + OntologyContext | ExtractedEntity[] | LLM-based entity typing |
| 4. Property | OntologyService | Entity types | ScopedProperty[] | Domain/range filtered properties |
| 5. Relation | RelationExtractor | Entities + Properties | ExtractedRelation[] | LLM-based relation extraction |
| 6. Ground | Grounder | Relations + Context | GroundedRelation[] | Filter by embedding similarity ≥ 0.8 |

### Activity Sequence

```mermaid
sequenceDiagram
    participant C as Client
    participant WO as WorkflowOrchestrator
    participant WE as WorkflowEngine
    participant PA as PreprocessingActivity
    participant SEA as StreamingExtractionActivity
    participant SE as StreamingExtraction
    participant RA as ResolutionActivity
    participant VA as ValidationActivity
    participant IA as IngestionActivity
    participant S as StorageService
    participant LLM as LLM Provider
    participant PG as PostgreSQL

    C->>WO: start(payload)
    WO->>WE: execute(BatchExtractionWorkflow)
    WE->>PG: Journal workflow start

    Note over WE: Stage 1: Preprocessing
    WE->>PA: makePreprocessingActivity
    PA->>S: Load document previews (first 4KB)
    PA->>LLM: Classify documents (batched)
    PA->>PA: Compute chunking strategies
    PA->>PA: Order documents by priority
    PA->>S: Write enriched manifest
    WE->>PG: Journal activity complete

    Note over WE: Stage 2: Extraction (6-phase pipeline)
    loop For each document (parallel x5, priority order)
        WE->>SEA: makeStreamingExtractionActivity
        SEA->>S: Read source document
        SEA->>SE: extract(text, config)
        Note over SE: Phase 1: Chunk<br/>Phase 2: Mention<br/>Phase 3: Entity<br/>Phase 4: Property Scope<br/>Phase 5: Relation<br/>Phase 6: Ground (≥0.8)
        SE-->>SEA: KnowledgeGraph
        SEA->>SEA: knowledgeGraphToClaims()
        SEA->>S: Write document graph
        WE->>PG: Journal activity complete
    end

    Note over WE: Stage 3: Resolution
    WE->>RA: makeResolutionActivity
    RA->>S: Read all document graphs
    RA->>S: Write merged graph
    WE->>PG: Journal activity complete

    Note over WE: Stage 4: Validation
    WE->>VA: makeValidationActivity
    VA->>S: Read merged graph
    VA->>S: Read SHACL shapes (optional)
    VA->>S: Write validation report
    WE->>PG: Journal activity complete

    Note over WE: Stage 5: Ingestion
    WE->>IA: makeIngestionActivity
    IA->>S: Read validated graph
    IA->>S: Write to canonical store
    WE->>PG: Journal workflow complete

    WE-->>WO: BatchState (Complete)
    WO-->>C: executionId
```

---

## Service Layer

### Service Dependency Graph

```mermaid
graph LR
    subgraph "Entry Points"
        WO[WorkflowOrchestrator]
        SSE[SSE Streaming]
    end

    subgraph "State Management"
        BSH[BatchStateHub]
        BSP[BatchStatePersistence]
    end

    subgraph "Extraction Services"
        EE[EntityExtractor]
        RE[RelationExtractor]
        ME[MentionExtractor]
        GR[Grounder]
        NLP[NlpService]
    end

    subgraph "Entity Resolution"
        ERS[EntityResolutionService]
        EL[EntityLinker]
        RLink[RelationLinker]
        SS2[SimilarityScorer]
    end

    subgraph "Embedding"
        ES[EmbeddingService]
        EP[EmbeddingProvider]
        EC[EmbeddingCache]
        ERL[EmbeddingRateLimiter]
        Nomic[NomicEmbeddingProvider]
        Voyage[VoyageEmbeddingProvider]
    end

    subgraph "GraphRAG"
        GRAG[GraphRAG]
        EIdx[EntityIndex]
        SGE[SubgraphExtractor]
    end

    subgraph "Ontology"
        OS[OntologyService]
        OL[OntologyLoader]
        IS[InheritanceService]
    end

    subgraph "Core Services"
        CS[ConfigService]
        SS[StorageService]
        RB[RdfBuilder]
        SHACL[ShaclService]
    end

    subgraph "LLM Stack"
        LM[LanguageModel]
        LR[LlmWithRetry]
        LS[LlmSemaphore]
        CB[CircuitBreaker]
    end

    subgraph "LLM Control"
        TB[TokenBudgetService]
        ST[StageTimeoutService]
        RL[CentralRateLimiter]
    end

    subgraph "Run Management"
        ER[ExtractionRun]
        ECa[ExtractionCache]
        ED[ExecutionDeduplicator]
    end

    WO --> WE[WorkflowEngine]
    WO --> SS
    WO --> BSH

    SSE --> BSH
    BSH --> BSP
    BSP --> SS

    EE --> LR
    RE --> LR
    GR --> LR
    ME --> NLP

    LR --> LM
    LR --> LS
    LR --> CB

    EE --> TB
    EE --> ST
    EE --> RL

    EE --> OS
    RE --> OS
    GR --> NLP
    GR --> SS2

    ERS --> ES
    EL --> ERS
    RLink --> ERS
    SS2 --> ES

    ES --> EP
    ES --> EC
    EP --> Nomic
    EP --> Voyage
    EP --> ERL

    OL --> RB
    OL --> ES
    OL --> SS
    IS --> OS

    OS --> RB
    OS --> SS

    SHACL --> RB

    RB --> CS
    SS --> CS
    NLP --> CS
    Nomic --> CS
    Voyage --> CS

    ER --> SS
    ECa --> SS

    GRAG --> EIdx
    GRAG --> SGE
    EIdx --> ES
    SGE --> EIdx

    style WO fill:#bbdefb
    style EE fill:#c8e6c9
    style ERS fill:#ffe0b2
    style ES fill:#e1bee7
    style GRAG fill:#b2dfdb
    style CS fill:#fff9c4
```

### Service Specifications

| Service | Purpose | Layer | Dependencies |
|---------|---------|-------|--------------|
| **Orchestration** ||||
| `WorkflowOrchestrator` | High-level batch workflow API | Service | WorkflowEngine, BatchStateHub |
| `BatchStateHub` | PubSub for real-time state changes | Service | PubSub |
| `BatchStatePersistence` | State snapshots in storage | Service | StorageService, KeyValueStore |
| **Extraction** ||||
| `EntityExtractor` | LLM-based named entity recognition | Service | LanguageModel, OntologyService |
| `RelationExtractor` | LLM-based relation extraction | Service | LanguageModel, OntologyService |
| `MentionExtractor` | Entity mention detection via NLP | Service | NlpService |
| `Grounder` | Entity grounding/linking | Service | NlpService, OntologyService |
| `SimilarityScorer` | Embedding-based entity similarity | Service | EmbeddingService |
| **Entity Resolution** ||||
| `EntityResolutionService` | Graph clustering and entity matching | Service | EmbeddingService |
| `EntityLinker` | Canonical entity ID queries | Util | EntityResolutionGraph |
| `RelationLinker` | Relation canonicalization | Service | EntityResolutionGraph |
| **GraphRAG** ||||
| `GraphRAG` | Retrieval-augmented generation with KG context | Service | EntityIndex, SubgraphExtractor, LanguageModel |
| `EntityIndex` | In-memory k-NN entity index via embeddings | Service | EmbeddingService |
| `SubgraphExtractor` | N-hop subgraph extraction around seeds | Service | EntityIndex |
| **Embedding** ||||
| `EmbeddingService` | Provider-agnostic embedding service with caching | Service | EmbeddingProvider, EmbeddingCache, EmbeddingResolver |
| `EmbeddingProvider` | Abstract embedding interface (Nomic/Voyage) | Service | ConfigService, EmbeddingRateLimiter |
| `EmbeddingCache` | Content-addressable embedding cache with TTL | Service | Clock, Ref |
| `EmbeddingResolver` | Request API batching and deduplication | Resolver | EmbeddingProvider |
| `EmbeddingRateLimiter` | RPM and concurrency control for API providers | Service | Clock, Ref, Semaphore |
| `NomicEmbeddingProvider` | Local Transformers.js embedding provider | Service | NomicNlpService, ConfigService |
| `VoyageEmbeddingProvider` | Voyage AI API embedding provider | Service | ConfigService, HttpClient, EmbeddingRateLimiter |
| **Ontology** ||||
| `OntologyService` | SKOS/OWL ontology operations | Core | RdfBuilder, StorageService |
| `OntologyLoader` | Ontology + embeddings loading | Service | RdfBuilder, EmbeddingService, StorageService |
| `InheritanceService` | Class hierarchy property inheritance | Service | OntologyService |
| **Core Infrastructure** ||||
| `ConfigService` | Centralized configuration | Core | Environment |
| `StorageService` | Abstracted storage (GCS/Local/Memory) | Core | ConfigService |
| `RdfBuilder` | RDF parsing/serialization (N3.js) | Core | ConfigService |
| `ShaclService` | SHACL validation engine | Core | RdfBuilder |
| **Run Management** ||||
| `ExtractionRun` | Run management with artifact storage | Service | StorageService |
| `ExtractionCache` | Filesystem extraction result cache | Service | FileSystem |
| `ExecutionDeduplicator` | Idempotency key deduplication | Service | Ref |

---

## Embedding Infrastructure

### Overview

The embedding infrastructure provides provider-agnostic vector embeddings with automatic batching, caching, and rate limiting. It supports both local inference (Nomic via Transformers.js) and API providers (Voyage AI), with dynamic provider selection via configuration.

### Architecture

```mermaid
graph TB
    subgraph "Public API"
        ES[EmbeddingService]
    end

    subgraph "Request Processing"
        REQ[Effect Request API]
        RESOLVER[EmbeddingResolver<br/>Batching + Deduplication]
    end

    subgraph "Provider Abstraction"
        EP[EmbeddingProvider<br/>Interface]
        NOMIC[NomicEmbeddingProvider<br/>Local Transformers.js]
        VOYAGE[VoyageEmbeddingProvider<br/>Voyage AI API]
    end

    subgraph "Infrastructure"
        CACHE[EmbeddingCache<br/>Versioned Cache Keys]
        RL[EmbeddingRateLimiter<br/>RPM + Concurrency]
        HTTP[HttpClient]
    end

    ES --> CACHE
    ES --> REQ
    REQ --> RESOLVER
    RESOLVER --> EP
    EP -.implements.-> NOMIC
    EP -.implements.-> VOYAGE
    NOMIC --> NLP[NomicNlpService]
    VOYAGE --> HTTP
    VOYAGE --> RL

    style ES fill:#e1bee7
    style EP fill:#b39ddb
    style CACHE fill:#fff9c4
    style RL fill:#ffcc80
```

### Key Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Provider Abstraction** | Switch between Nomic (local) and Voyage (API) via config | `EmbeddingProvider` interface |
| **Automatic Batching** | Collects requests into batches for efficient processing | Effect Request API via `EmbeddingResolver` |
| **Deduplication** | Same text+taskType returns same instance | Request hash: `provider::model::taskType::text` |
| **Versioned Caching** | Cache keys include model ID and dimension | `hashVersionedEmbeddingKey()` |
| **Rate Limiting** | RPM and concurrency control for API providers | `EmbeddingRateLimiter` with sliding window |
| **Multi-Dimension** | Supports different embedding dimensions per provider | Nomic: 64-768, Voyage: 512-1024 |
| **Task Types** | Optimized embeddings for search/clustering/classification | Voyage-compatible superset |

### Provider Selection

The system selects the embedding provider based on the `EMBEDDING_PROVIDER` environment variable:

```typescript
// Dynamic provider selection via Layer.unwrapEffect
export const EmbeddingProviderFromConfig: Layer.Layer<
  EmbeddingProvider,
  never,
  ConfigService | NomicNlpService | EmbeddingRateLimiter | HttpClient
> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* ConfigService
    return config.embedding.provider === "voyage"
      ? VoyageEmbeddingProviderLive
      : NomicEmbeddingProviderLive
  })
)
```

### Request API Batching

The system uses Effect's Request API for automatic batching and deduplication:

```mermaid
sequenceDiagram
    participant App
    participant ES as EmbeddingService
    participant Cache
    participant Resolver
    participant Provider
    participant API

    App->>ES: embedBatch(["text1", "text2", "text3"])
    ES->>Cache: get("hash1")
    Cache-->>ES: Some(embedding1)
    ES->>Cache: get("hash2")
    Cache-->>ES: None
    ES->>Cache: get("hash3")
    Cache-->>ES: None

    Note over ES,Resolver: Batch window collects requests
    ES->>Resolver: Request("text2", taskType)
    ES->>Resolver: Request("text3", taskType)

    Resolver->>Resolver: Group by taskType<br/>Deduplicate by hash
    Resolver->>Provider: embedBatch([req2, req3])
    Provider->>API: POST /embeddings
    API-->>Provider: [emb2, emb3]
    Provider-->>Resolver: [emb2, emb3]
    Resolver-->>ES: emb2, emb3

    ES->>Cache: set("hash2", emb2)
    ES->>Cache: set("hash3", emb3)
    ES-->>App: [embedding1, emb2, emb3]
```

### Cache Key Versioning

Cache keys include provider, model, and dimension to prevent cross-contamination:

```typescript
// Format: sha256(provider:model:dimension:taskType:text)
const hash = await hashVersionedEmbeddingKey(
  "Hello world",
  "search_document",
  { providerId: "voyage", modelId: "voyage-3-lite", dimension: 512 }
)
// Result: "a1b2c3d4..." (64 hex chars)
```

This ensures that changing the model invalidates the cache automatically.

### Rate Limiting

API providers enforce rate limits via `EmbeddingRateLimiter`:

```typescript
// Voyage AI limits: 100 RPM, 10 concurrent
export const VOYAGE_RATE_LIMITS: EmbeddingRateLimiterConfig = {
  provider: "voyage",
  requestsPerMinute: 100,
  maxConcurrent: 10
}

// Local models: effectively unlimited
export const LOCAL_RATE_LIMITS: EmbeddingRateLimiterConfig = {
  provider: "nomic",
  requestsPerMinute: 10000,
  maxConcurrent: 50
}
```

The rate limiter uses a sliding window for RPM tracking and a semaphore for concurrency control.

### Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `EMBEDDING_PROVIDER` | Provider to use (nomic \| voyage) | nomic |
| `VOYAGE_API_KEY` | Voyage AI API key | - |
| `VOYAGE_MODEL` | Voyage model (voyage-3 \| voyage-3-lite) | voyage-3-lite |
| `EMBEDDING_DIMENSION` | Embedding dimension (provider-specific) | 768 (nomic), 512 (voyage-3-lite) |
| `EMBEDDING_CACHE_TTL_HOURS` | Cache TTL in hours | 1 |
| `EMBEDDING_CACHE_MAX_ENTRIES` | Max cache entries | 10000 |

### Layer Composition

```typescript
// Production: Config-driven provider selection
export const EmbeddingInfrastructure: Layer.Layer<
  EmbeddingProvider | EmbeddingRateLimiter | EmbeddingCache,
  never,
  ConfigService
> = Layer.mergeAll(
  EmbeddingProviderFromConfig,
  EmbeddingRateLimiterFromConfig,
  EmbeddingCache.Default
)

// Development: Force Nomic (local)
export const NomicEmbeddingInfrastructure = Layer.mergeAll(
  NomicEmbeddingProviderDefault,
  EmbeddingRateLimiterLocal,
  EmbeddingCache.Default
)

// Production: Force Voyage (API)
export const VoyageEmbeddingInfrastructure = Layer.mergeAll(
  VoyageEmbeddingProviderDefault,
  EmbeddingRateLimiterVoyage,
  EmbeddingCache.Default
)
```

### Testing Patterns

```typescript
import { EmbeddingProvider } from "./EmbeddingProvider.js"
import { Layer } from "effect"

// Mock provider for deterministic tests
const MockEmbeddingProvider = Layer.succeed(EmbeddingProvider, {
  metadata: { providerId: "mock", modelId: "mock", dimension: 768 },
  embedBatch: (requests) => Effect.succeed(
    requests.map(() => Array(768).fill(0))
  ),
  cosineSimilarity: (a, b) => 0.9
})

// Use in tests
const program = Effect.gen(function* () {
  const embeddings = yield* EmbeddingService
  const result = yield* embeddings.embed("test")
  // result: [0, 0, 0, ..., 0] (768 dimensions)
}).pipe(
  Effect.provide(EmbeddingService.Default),
  Effect.provide(MockEmbeddingProvider)
)
```

---

## Data Model

### Branded Identity Types

```mermaid
classDiagram
    class BatchId {
        +String value
        +Pattern: batch-[a-f0-9]{12}
    }

    class DocumentId {
        +String value
        +Pattern: doc-[a-f0-9]{12}
    }

    class GcsUri {
        +String value
        +Pattern: gs://bucket/path
    }

    class OntologyVersion {
        +String value
        +Pattern: namespace/name@[a-f0-9]{16}
    }

    class Namespace {
        +String value
        +Pattern: [a-z][a-z0-9-]*
    }
```

### BatchState Union Type

```mermaid
classDiagram
    class BatchState {
        <<union>>
    }

    class Pending {
        +_tag: "Pending"
        +batchId: BatchId
        +manifestUri: GcsUri
        +ontologyVersion: OntologyVersion
        +createdAt: DateTime
    }

    class Extracting {
        +_tag: "Extracting"
        +...Pending fields
        +documentsTotal: number
        +documentsCompleted: number
    }

    class Resolving {
        +_tag: "Resolving"
        +...fields
        +documentGraphUris: GcsUri[]
    }

    class Validating {
        +_tag: "Validating"
        +...fields
        +resolvedGraphUri: GcsUri
    }

    class Ingesting {
        +_tag: "Ingesting"
        +...fields
        +validatedGraphUri: GcsUri
        +conforms: boolean
    }

    class Complete {
        +_tag: "Complete"
        +...fields
        +canonicalGraphUri: GcsUri
        +stats: BatchStats
        +completedAt: DateTime
    }

    class Failed {
        +_tag: "Failed"
        +...fields
        +error: string
        +failedAt: DateTime
        +stage: string
    }

    BatchState <|-- Pending
    BatchState <|-- Extracting
    BatchState <|-- Resolving
    BatchState <|-- Validating
    BatchState <|-- Ingesting
    BatchState <|-- Complete
    BatchState <|-- Failed
```

### Storage Path Layout

```mermaid
graph TD
    ROOT["📁 Storage Root"]

    ROOT --> BATCHES["📁 batches/"]
    ROOT --> DOCS["📁 documents/"]
    ROOT --> CANON["📁 canonical/"]
    ROOT --> ONTOS["📁 ontologies/"]

    BATCHES --> BATCH_ID["📁 batch-id/"]
    BATCH_ID --> MANIFEST["📄 manifest.json"]
    BATCH_ID --> STATUS["📄 status.json"]
    BATCH_ID --> RESOL["📁 resolution/"]
    BATCH_ID --> VALID["📁 validation/"]
    BATCH_ID --> BATCH_CANON["📁 canonical/"]

    RESOL --> MERGED["📄 merged.ttl"]
    VALID --> VALID_GRAPH["📄 graph.ttl"]
    VALID --> REPORT["📄 report.json"]
    BATCH_CANON --> BATCH_ENTITIES["📄 entities.ttl"]

    DOCS --> DOC_ID["📁 doc-id/"]
    DOC_ID --> INPUT["📄 input.txt"]
    DOC_ID --> DOC_GRAPH["📄 graph.ttl"]

    CANON --> NS["📁 namespace/"]
    NS --> NS_ENTITIES["📄 entities.ttl"]
    NS --> NS_RELATIONS["📄 relations.ttl"]

    ONTOS --> ONT_NS["📁 namespace/"]
    ONT_NS --> ONTOLOGY["📄 ontology.ttl"]
    ONT_NS --> SHAPES["📄 shapes.ttl"]
```

---

## Infrastructure

### GCP Architecture

```mermaid
graph TB
    subgraph "Google Cloud Platform"
        subgraph "Compute"
            CR[Cloud Run<br/>effect-ontology-core]
            CE[Compute Engine<br/>e2-micro<br/>PostgreSQL 15]
        end

        subgraph "Storage"
            GCS[Cloud Storage<br/>effect-ontology-prod]
            SM[Secret Manager<br/>API Keys]
        end

        subgraph "Networking"
            VPC[VPC Network]
            CONN[VPC Connector]
            FW[Firewall Rules]
            NAT[Cloud NAT]
            ROUTER[Cloud Router]
        end
    end

    subgraph "External"
        LLM[LLM Providers<br/>Anthropic/OpenAI]
        CLIENT[API Clients]
        DOCKER[Docker Hub]
    end

    CLIENT -->|HTTPS| CR
    CR -->|HTTPS| LLM
    CR -->|HTTPS| GCS
    CR -->|Read| SM
    CR -->|TCP via VPC| CONN
    CONN --> VPC
    VPC --> CE
    FW -->|Allow 5432| CE
    CE -->|Pull images| NAT
    NAT --> ROUTER
    ROUTER -->|Egress| DOCKER

    style CR fill:#4285f4,color:#fff
    style CE fill:#34a853,color:#fff
    style GCS fill:#fbbc04,color:#000
```

### Terraform Module Structure

```mermaid
graph TD
    subgraph "infra/"
        MAIN[main.tf]
        VARS[variables.tf]
        OUT[outputs.tf]

        subgraph "modules/"
            CR_MOD[cloud_run/]
            STORAGE_MOD[storage/]
            PG_MOD[postgres/]
            SECRETS_MOD[secrets/]
        end
    end

    MAIN --> CR_MOD
    MAIN --> STORAGE_MOD
    MAIN --> PG_MOD
    MAIN --> SECRETS_MOD

    CR_MOD --> CR_RES[google_cloud_run_v2_service]
    STORAGE_MOD --> GCS_RES[google_storage_bucket]
    PG_MOD --> CE_RES[google_compute_instance]
    PG_MOD --> VPC_RES[google_compute_network]
    SECRETS_MOD --> SM_RES[google_secret_manager_secret]
```

### Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_PROVIDER` | LLM backend (anthropic/openai/google) | anthropic |
| `LLM_MODEL` | Model identifier | claude-haiku-4-5 |
| `LLM_API_KEY` | API key (from Secret Manager) | required |
| `STORAGE_TYPE` | Storage backend (gcs/local/memory) | local |
| `STORAGE_BUCKET` | GCS bucket name | - |
| `ONTOLOGY_PATH` | Path to ontology file | required |
| `POSTGRES_HOST` | PostgreSQL host | localhost |
| `POSTGRES_PORT` | PostgreSQL port | 5432 |
| `POSTGRES_DATABASE` | Database name | workflow |
| `POSTGRES_USER` | Database user | workflow |
| `POSTGRES_PASSWORD` | Database password (secret) | required |

---

## Layer Composition

### Effect Layer Stack

```mermaid
graph TB
    subgraph "Application Layer"
        APP[Application Program]
    end

    subgraph "HTTP Layer"
        HTTP[HttpServer.Default]
    end

    subgraph "Orchestration Layer"
        WO_LAYER[WorkflowOrchestratorFullLive]
        WO_IMPL[WorkflowOrchestratorLive]
        BW_LAYER[BatchExtractionWorkflowLayer]
    end

    subgraph "Workflow Engine Layer"
        WE_MEM[WorkflowEngine.layerMemory<br/>Tests/Dev]
        WE_PG[ClusterWorkflowEngine<br/>Production]
    end

    subgraph "Persistence Layer"
        PG_LIVE[PostgresPersistenceLive]
        MSG[SqlMessageStorage]
        RUN[SqlRunnerStorage]
        PG_CLIENT[PgClient]
    end

    subgraph "Service Layers"
        EXTRACT[EntityExtractor.Default<br/>RelationExtractor.Default]
        GROUNDER[Grounder.Default]
        CORE[StorageService.Default<br/>OntologyService.Default<br/>RdfBuilder.Default]
        CONFIG[ConfigService.Default]
    end

    subgraph "LLM Layers"
        LLM_CTRL[LlmControlLayers<br/>TokenBudget + Timeout + Rate]
        LLM_MODEL[LanguageModel.layer]
    end

    subgraph "Platform Layer"
        BUN[BunContext.layer]
    end

    APP --> HTTP
    HTTP --> WO_LAYER
    WO_LAYER --> WO_IMPL
    WO_LAYER --> BW_LAYER

    WO_IMPL --> WE_MEM
    WO_IMPL --> WE_PG

    WE_PG --> PG_LIVE
    PG_LIVE --> MSG
    PG_LIVE --> RUN
    MSG --> PG_CLIENT
    RUN --> PG_CLIENT

    BW_LAYER --> EXTRACT
    BW_LAYER --> CORE

    EXTRACT --> GROUNDER
    EXTRACT --> LLM_CTRL
    EXTRACT --> LLM_MODEL

    CORE --> CONFIG
    CONFIG --> BUN

    style WO_LAYER fill:#e3f2fd
    style PG_LIVE fill:#f3e5f5
    style CONFIG fill:#fff8e1
```

### Test vs Production Layers

```mermaid
graph LR
    subgraph "Test Configuration"
        T_WE[WorkflowEngine.layerMemory]
        T_SS[StorageServiceTest<br/>In-memory Map]
        T_EE[EntityExtractor.Test<br/>Deterministic stub]
        T_RE[RelationExtractor.Test<br/>Deterministic stub]
        T_GR[Grounder.Test<br/>Always pass]
        T_LM[MockLanguageModel<br/>Empty responses]
        T_CS[ConfigServiceTest<br/>DEFAULT_CONFIG]
    end

    subgraph "Production Configuration"
        P_WE[ClusterWorkflowEngine<br/>PostgreSQL-backed]
        P_SS[StorageService.Default<br/>GCS/Local]
        P_EE[EntityExtractor.Default<br/>LLM-powered]
        P_RE[RelationExtractor.Default<br/>LLM-powered]
        P_GR[Grounder.Default<br/>Embedding-based]
        P_LM[AnthropicLanguageModel<br/>Real API calls]
        P_CS[ConfigService.Default<br/>From environment]
    end

    T_WE -.->|swap| P_WE
    T_SS -.->|swap| P_SS
    T_EE -.->|swap| P_EE
    T_RE -.->|swap| P_RE
    T_GR -.->|swap| P_GR
    T_LM -.->|swap| P_LM
    T_CS -.->|swap| P_CS
```

---

## API Reference

### REST Endpoints

```mermaid
graph LR
    subgraph "Health"
        H1[GET /health/live]
        H2[GET /health/ready]
        H3[GET /health/deep]
    end

    subgraph "Extraction (SSE)"
        E1[POST /v1/extract/batch<br/>→ SSE Stream]
        E2[POST /v1/extract<br/>→ SSE Stream]
    end

    subgraph "Batch Status"
        B1[GET /v1/batch/:id]
        B2[POST /v1/batch/:id/resume]
    end
```

### SSE Streaming

The extraction endpoints return Server-Sent Events streaming `BatchState` transitions:

```
POST /v1/extract/batch
Content-Type: application/json
Accept: text/event-stream

← HTTP/1.1 200 OK
← Content-Type: text/event-stream

← event: state
← id: batch-abc123-Pending-1702300000000
← data: {"_tag":"Pending","batchId":"batch-abc123",...}

← event: state
← id: batch-abc123-Extracting-1702300001000
← data: {"_tag":"Extracting","documentsCompleted":1,"documentsTotal":3,...}

← retry: 15000

← event: state
← id: batch-abc123-Complete-1702300010000
← data: {"_tag":"Complete","stats":{...},...}
```

### SSE Deployment Configuration (Cloud Run)

Server-Sent Events require specific Cloud Run configuration for reliable streaming:

```bash
# Required settings for SSE
gcloud run services update SERVICE \
  --timeout=3600 \           # 60 min max (default 5 min is too short)
  --no-cpu-throttling \      # CPU always allocated during streaming
  --min-instances=1          # Prevent cold starts killing connections
```

| Setting | Default | Required | Purpose |
|---------|---------|----------|---------|
| `--timeout` | 300s | **3600s** | Prevents premature connection close |
| `--no-cpu-throttling` | throttled | **always-on** | Keeps CPU during idle streaming |
| `--min-instances` | 0 | **1+** | Avoids scale-to-zero killing connections |

**Important**: Clients must use **HTTP/1.1** for SSE connections. HTTP/2 has protocol compatibility issues with Cloud Run's load balancer for SSE streams.

```bash
# Client example (force HTTP/1.1)
curl --http1.1 -H "Accept: text/event-stream" https://SERVICE/v1/extract/batch
```

Required response headers (already configured in HttpServer.ts):

```text
Content-Type: text/event-stream
Cache-Control: no-cache, no-store, must-revalidate
Connection: keep-alive
X-Accel-Buffering: no
```

### WebSocket Event Streaming

Real-time event synchronization between frontend and backend via `@effect/experimental/EventLog`.

#### Authentication

WebSocket connections support dual-mode authentication:

| Mode | Query Param | Use Case |
|------|-------------|----------|
| Dev | `?dev=true` | Local development, bypasses auth when `API_REQUIRE_AUTH=false` |
| Prod | `?ticket=xxx` | Production, requires single-use ticket from `/v1/auth/ticket` |

#### Ticket Lifecycle

```
Frontend                              Backend
─────────                             ───────
1. POST /v1/auth/ticket        →      TicketService.createTicket()
   X-API-Key: your-key                - Generates 32-byte secure token
   {"ontologyId": "seattle"}          - Stores in HashMap with 5-min TTL
                               ←      {"ticket": "xxx", "expiresAt": ..., "ttlSeconds": 300}

2. Connect WebSocket           →      EventStreamRouter
   ws://.../events/ws?ticket=xxx      - validateWebSocketAuth()
                                      - TicketService.validateTicket() (consumes ticket)
                               ←      WebSocket upgrade (if valid)
```

#### Key Implementation Details

**Backend (EventStreamRouter)**:
- Uses `@effect/experimental/EventLogServer` for WebSocket protocol
- Validates ticket on upgrade, returns 401/403 on auth failure
- Single-use tickets prevent replay attacks

**Frontend (EventBusClient)**:
- Uses `@effect/experimental/EventLogRemote` for client sync
- Layer composition order is critical (leaf → root):
  ```typescript
  // CORRECT order:
  Layer.provide(EventLogRemote.layerWebSocketBrowser(wsUrl)),  // Root
  Layer.provide(EventLog.layerEventLog),                        // Intermediate
  Layer.provide(TicketClientDefault),                           // Leaf
  Layer.provide(IdentityLayer),                                 // Leaf
  Layer.provide(OntologyEventJournalLayer(ontologyId))          // Leaf
  ```
- `layerWebSocketBrowser` automatically provides `EventLogEncryption` and socket

**Services**:
| Service | Location | Purpose |
|---------|----------|---------|
| `TicketService` | `src/Service/Ticket.ts` | In-memory ticket management |
| `AuthRouter` | `src/Runtime/AuthRouter.ts` | `POST /v1/auth/ticket` endpoint |
| `EventStreamRouter` | `src/Runtime/EventStreamRouter.ts` | WebSocket with auth |
| `TicketClient` | `web/src/services/TicketClient.ts` | Frontend ticket fetching |
| `EventBusClient` | `web/src/services/EventBusClient.ts` | Frontend event sync |

### BatchStatusResponse Union

The `GET /v1/batch/:id` endpoint returns a discriminated union:

| Variant | Description | HTTP Status |
|---------|-------------|-------------|
| `Active` | Workflow running or completed | 200 |
| `Suspended` | Workflow suspended (can resume) | 200 |
| `NotFound` | Batch ID not found | 404 |

### WorkflowOrchestrator Interface

```typescript
interface WorkflowOrchestrator {
  // Start workflow (fire-and-forget)
  start(payload: BatchWorkflowPayload): Effect<string, string>

  // Start and wait for completion
  startAndWait(payload: BatchWorkflowPayload): Effect<BatchState, string>

  // Poll for result
  poll(executionId: string): Effect<Workflow.Result<BatchState, string> | undefined>

  // Interrupt running workflow
  interrupt(executionId: string): Effect<void>

  // Resume suspended workflow
  resume(executionId: string): Effect<void>
}
```

### BatchRequest Schema (API Input)

```typescript
// Request body for POST /v1/extract/batch
// Server generates batchId and createdAt
const BatchRequest = Schema.Struct({
  ontologyUri: GcsUri,
  ontologyVersion: OntologyVersion,
  shaclUri: Schema.optional(GcsUri),
  targetNamespace: Namespace,
  documents: Schema.NonEmptyArray(Schema.Struct({
    documentId: Schema.optional(DocumentId),  // Server generates if omitted
    sourceUri: GcsUri,
    contentType: Schema.String,
    sizeBytes: Schema.optional(Schema.Number)
  }))
})
```

### BatchWorkflowPayload Schema (Internal)

```typescript
// Used internally for workflow execution
// Includes all fields for idempotency key derivation
const BatchWorkflowPayload = Schema.Struct({
  batchId: BatchId,
  manifestUri: GcsUri,
  ontologyVersion: OntologyVersion,
  ontologyUri: GcsUri,
  targetNamespace: Namespace,
  shaclUri: Schema.optional(GcsUri),
  documentIds: Schema.Array(DocumentId)
})
```

### BatchManifest Schema

```typescript
const BatchManifest = Schema.Struct({
  batchId: BatchId,
  ontologyUri: GcsUri,
  ontologyVersion: OntologyVersion,
  shaclUri: Schema.optional(GcsUri),
  targetNamespace: Namespace,
  documents: Schema.Array(Schema.Struct({
    documentId: DocumentId,
    sourceUri: GcsUri,
    contentType: Schema.String,
    sizeBytes: Schema.Number
  })),
  createdAt: Schema.DateTimeUtc
})
```

---

## File Reference

| Path | Purpose |
|------|---------|
| `src/Service/WorkflowOrchestrator.ts` | High-level workflow API with Result handling |
| `src/Service/BatchState.ts` | BatchStateHub (PubSub) + persistence |
| `src/Service/Config.ts` | Centralized configuration |
| `src/Service/Storage.ts` | Storage abstraction (GCS/Local/Memory) |
| `src/Service/Extraction.ts` | Entity/Relation extractors |
| `src/Service/Grounder.ts` | Entity grounding |
| `src/Service/Embedding.ts` | Provider-agnostic embedding service with caching |
| `src/Service/EmbeddingProvider.ts` | Embedding provider interface |
| `src/Service/EmbeddingCache.ts` | Versioned embedding cache with TTL and LRU |
| `src/Service/EmbeddingResolver.ts` | Request API batching resolver |
| `src/Service/EmbeddingRateLimiter.ts` | RPM and concurrency rate limiting |
| `src/Service/EmbeddingRequest.ts` | Request types for batching |
| `src/Service/NomicEmbeddingProvider.ts` | Local Transformers.js embedding provider |
| `src/Service/VoyageEmbeddingProvider.ts` | Voyage AI API embedding provider |
| `src/Runtime/EmbeddingLayers.ts` | Layer composition for embedding infrastructure |
| `src/Service/GraphRAG.ts` | **NEW**: GraphRAG retrieval and generation |
| `src/Service/EntityIndex.ts` | **NEW**: Entity embedding k-NN index |
| `src/Service/SubgraphExtractor.ts` | **NEW**: N-hop subgraph extraction |
| `src/Service/DocumentClassifier.ts` | LLM-based document classification |
| `src/Workflow/Activities.ts` | @effect/workflow durable activities |
| `src/Workflow/DurableActivities.ts` | Durable activity implementations |
| `src/Workflow/StreamingExtraction.ts` | 6-phase unified extraction engine |
| `src/Workflow/StreamingExtractionActivity.ts` | Durable activity wrapper for streaming extraction |
| `src/Workflow/EntityResolution.ts` | Graph-based entity resolution |
| `src/Runtime/HttpServer.ts` | HTTP routes + SSE streaming |
| `src/Runtime/ProductionRuntime.ts` | Production layer stack |
| `src/Runtime/TestRuntime.ts` | Test layer stack |
| `src/Runtime/ActivityRunner.ts` | Cloud Run Jobs activity dispatcher |
| `src/Domain/Identity.ts` | Branded ID types |
| `src/Domain/PathLayout.ts` | Type-safe storage paths |
| `src/Domain/Model/BatchWorkflow.ts` | BatchState union type |
| `src/Domain/Schema/Batch.ts` | BatchManifest, BatchWorkflowPayload |
| `src/Domain/Schema/BatchRequest.ts` | API request schema |
| `src/Domain/Schema/DocumentMetadata.ts` | **NEW**: DocumentMetadata, EnrichedManifest schemas |
| `src/Domain/Schema/BatchStatusResponse.ts` | Active/Suspended/NotFound union |
| `src/Domain/Error/Workflow.ts` | WorkflowError, WorkflowSuspendedError |
| `infra/modules/postgres/` | Terraform for PostgreSQL |
| `infra/modules/cloud-run/` | Terraform for Cloud Run |
| `infra/modules/preprocess-job/` | **NEW**: Terraform for preprocessing Cloud Run Job |

---

## Workflow Annotations

The `BatchExtractionWorkflow` uses @effect/workflow annotations for resilience:

| Annotation | Value | Purpose |
|------------|-------|---------|
| `SuspendOnFailure` | `true` | Suspend workflow on any error (can be resumed) |
| `CaptureDefects` | `true` | Capture unexpected errors in Result |
| `suspendedRetrySchedule` | Exponential backoff (5 retries) | Auto-retry suspended workflows |

```typescript
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (p) => `${p.batchId}-${hashSemanticInputs(p)}`,
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered
  )
})
```

---

## Document Preprocessing

### Overview

Document preprocessing is an agentic pipeline stage that analyzes documents before extraction to optimize chunking strategies, classify content, and order batches for efficient processing.

### Architecture

```mermaid
graph TB
    subgraph "Preprocessing Pipeline"
        INPUT[BatchManifest<br/>documents: ManifestDocument[]]

        subgraph "Stage 1: Load Previews"
            LP[Load first 4KB<br/>of each document]
        end

        subgraph "Stage 2: LLM Classification"
            CL[Batch classify<br/>10 docs at a time]
            DT[Document Type]
            DOM[Domain Tags]
            COMP[Complexity Score]
            DENS[Entity Density]
        end

        subgraph "Stage 3: Strategy Selection"
            CS[Chunking Strategy]
            SIZE[Chunk Size]
            OVER[Overlap]
        end

        subgraph "Stage 4: Batch Optimization"
            PRI[Priority Scoring]
            ORD[Batch Ordering]
            TOK[Token Estimation]
        end

        OUTPUT[EnrichedManifest<br/>documents: DocumentMetadata[]]
    end

    INPUT --> LP
    LP --> CL
    CL --> DT
    CL --> DOM
    CL --> COMP
    CL --> DENS
    DT --> CS
    DOM --> CS
    COMP --> CS
    DENS --> CS
    CS --> SIZE
    CS --> OVER
    SIZE --> PRI
    OVER --> PRI
    COMP --> PRI
    PRI --> ORD
    ORD --> TOK
    TOK --> OUTPUT

    style INPUT fill:#e3f2fd
    style OUTPUT fill:#c8e6c9
    style CL fill:#fff3e0
```

### Cloud Deployment Options

| Batch Size | Strategy | Infrastructure | Timeout |
|------------|----------|----------------|---------|
| Small (<50 docs) | Inline Activity | Same Cloud Run service | 5 min |
| Medium (50-500 docs) | Cloud Run Job | Dedicated job instance | 30 min |
| Large (>500 docs) | Cloud Tasks Fan-out | Parallel job workers | 60 min |

```mermaid
graph TB
    subgraph "Cloud Architecture"
        CR[Cloud Run Service<br/>effect-ontology-core]

        subgraph "Small Batch Path"
            IA[Inline<br/>PreprocessingActivity]
        end

        subgraph "Large Batch Path"
            CRJ[Cloud Run Job<br/>effect-ontology-preprocess]
            CT[Cloud Tasks Queue]
        end

        GCS[(Cloud Storage<br/>enriched-manifest.json)]
        PG[(PostgreSQL<br/>Workflow State)]
    end

    CR -->|"<50 docs"| IA
    CR -->|"≥50 docs"| CT
    CT --> CRJ
    IA --> GCS
    CRJ --> GCS
    IA --> PG
    CRJ --> PG

    style CR fill:#4285f4,color:#fff
    style CRJ fill:#34a853,color:#fff
    style GCS fill:#fbbc04
```

### DocumentMetadata Schema

```typescript
// Domain/Schema/DocumentMetadata.ts

export const DocumentType = Schema.Literal(
  "article",      // News, blog posts
  "transcript",   // Meeting notes, interviews
  "report",       // Technical reports, whitepapers
  "contract",     // Legal documents
  "correspondence", // Emails, letters
  "reference",    // Wikipedia, encyclopedic
  "narrative",    // Stories, descriptions
  "structured",   // Tables, lists, forms
  "unknown"
)

export const EntityDensity = Schema.Literal(
  "sparse",       // Few entities, mostly narrative
  "moderate",     // Average entity density
  "dense"         // Many entities per sentence
)

export const ChunkingStrategy = Schema.Literal(
  "standard",         // Default: 500 chars, 2 sentence overlap
  "fine_grained",     // Dense: 300 chars, 3 sentence overlap
  "high_overlap",     // Complex: 400 chars, 4 sentence overlap
  "section_aware",    // Contracts: respect section boundaries
  "speaker_aware",    // Transcripts: respect speaker turns
  "paragraph_based"   // Articles: natural paragraph breaks
)

export const DocumentMetadata = Schema.Struct({
  // === Original fields ===
  documentId: DocumentId,
  sourceUri: GcsUri,
  contentType: Schema.String,
  sizeBytes: Schema.Number,

  // === Preprocessing timestamp ===
  preprocessedAt: Schema.DateTimeUtc,

  // === Basic extraction (always populated) ===
  title: Schema.optional(Schema.String),
  language: Schema.String,              // ISO 639-1: "en", "es", etc.
  estimatedTokens: Schema.Number,

  // === LLM Classification ===
  documentType: DocumentType,
  domainTags: Schema.Array(Schema.String),  // ["sports", "football"]
  complexityScore: Schema.Number.pipe(      // 0-1 scale
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(1)
  ),
  entityDensityHint: EntityDensity,

  // === Chunking Strategy (derived) ===
  chunkingStrategy: ChunkingStrategy,
  suggestedChunkSize: Schema.Number,
  suggestedOverlap: Schema.Number,

  // === Batch Optimization ===
  priority: Schema.Number,              // Lower = process first
  estimatedExtractionCost: Schema.Number
})

export const EnrichedManifest = Schema.Struct({
  batchId: BatchId,
  ontologyUri: GcsUri,
  ontologyVersion: OntologyVersion,
  shaclUri: Schema.optional(GcsUri),
  targetNamespace: Namespace,
  documents: Schema.Array(DocumentMetadata),  // Enriched!
  createdAt: Schema.DateTimeUtc,

  // === Preprocessing Stats ===
  preprocessingStats: Schema.Struct({
    totalDocuments: Schema.Number,
    classifiedCount: Schema.Number,
    totalEstimatedTokens: Schema.Number,
    preprocessingDurationMs: Schema.Number,
    averageComplexity: Schema.Number
  })
})
```

### Chunking Strategy Selection

```typescript
// Strategy decision tree based on classification

const selectChunkingStrategy = (
  documentType: DocumentType,
  entityDensity: EntityDensity,
  complexity: number
): { strategy: ChunkingStrategy; chunkSize: number; overlap: number } => {
  // Document type takes precedence
  if (documentType === "transcript") {
    return { strategy: "speaker_aware", chunkSize: 1000, overlap: 3 }
  }
  if (documentType === "contract") {
    return { strategy: "section_aware", chunkSize: 800, overlap: 1 }
  }
  if (documentType === "article" || documentType === "narrative") {
    return { strategy: "paragraph_based", chunkSize: 600, overlap: 2 }
  }

  // Entity density for other types
  if (entityDensity === "dense") {
    return { strategy: "fine_grained", chunkSize: 300, overlap: 3 }
  }

  // Complexity fallback
  if (complexity > 0.8) {
    return { strategy: "high_overlap", chunkSize: 400, overlap: 4 }
  }

  // Default
  return { strategy: "standard", chunkSize: 500, overlap: 2 }
}
```

### Batch Priority Scoring

Documents are ordered to optimize resource utilization:

```typescript
// Lower priority = process first
const computePriority = (metadata: DocumentMetadata): number => {
  let priority = 50  // Base priority

  // Simple documents first (fail fast on easy wins)
  priority -= (1 - metadata.complexityScore) * 20

  // Smaller documents first
  if (metadata.estimatedTokens < 1000) priority -= 10
  if (metadata.estimatedTokens > 10000) priority += 10

  // Sparse entity density is faster
  if (metadata.entityDensityHint === "sparse") priority -= 5
  if (metadata.entityDensityHint === "dense") priority += 5

  return priority
}
```

### Storage Layout

```text
batches/{batch-id}/
  manifest.json              # Original (unchanged)
  enriched-manifest.json     # NEW: With DocumentMetadata[]
  preprocessing-report.json  # NEW: Stats and timings
  ...
```

### Terraform Module (Phase 4)

```hcl
# infra/modules/preprocess-job/main.tf

resource "google_cloud_run_v2_job" "preprocess" {
  name     = "effect-ontology-preprocess-${var.environment}"
  location = var.region

  template {
    template {
      service_account = var.cloud_run_sa
      timeout         = "1800s"  # 30 minutes max

      containers {
        image = var.image
        args  = ["--mode", "preprocess"]

        resources {
          limits = {
            cpu    = "2"
            memory = "4Gi"
          }
        }

        # Environment variables (same as main service)
        env { name = "LLM_PROVIDER"; value = var.llm_provider }
        env { name = "LLM_MODEL"; value = var.llm_model }
        env {
          name = "LLM_API_KEY"
          value_source {
            secret_key_ref {
              secret  = var.llm_api_key_secret
              version = "latest"
            }
          }
        }
        env { name = "STORAGE_TYPE"; value = "gcs" }
        env { name = "STORAGE_BUCKET"; value = var.storage_bucket }
      }
    }
  }
}
```

### Implementation Phases

| Phase | Scope | Files | Depends On |
|-------|-------|-------|------------|
| **1** | `DocumentMetadata` and `EnrichedManifest` schemas | `Domain/Schema/DocumentMetadata.ts` | - |
| **2** | `PreprocessingActivity` (inline) | `Workflow/DurableActivities.ts` | Phase 1 |
| **3** | `BatchState.Preprocessing` state | `Domain/Model/BatchWorkflow.ts` | Phase 2 |
| **4** | Extraction uses preprocessing hints | `Workflow/StreamingExtractionActivity.ts`, `Service/Nlp.ts` | Phase 3 |
| **5** | Cloud Run Job for large batches | `infra/modules/preprocess-job/` | Phase 4 |
| **6** | Cloud Tasks fan-out (optional) | Future | Phase 5 |

---

## GraphRAG: Knowledge Graph Querying

### Overview

GraphRAG (Graph Retrieval-Augmented Generation) enables LLMs to answer questions by retrieving relevant subgraphs from extracted knowledge, reducing hallucinations and providing traceable reasoning paths.

### Architecture

```mermaid
graph TB
    subgraph "GraphRAG Pipeline"
        Q[Natural Language Query]

        subgraph "1. Entity Retrieval"
            EI[EntityIndex]
            EMB[Query Embedding]
            KNN[k-NN Search]
        end

        subgraph "2. Subgraph Extraction"
            SE[SubgraphExtractor]
            BFS[N-hop BFS Traversal]
            PRUNE[Node Pruning]
        end

        subgraph "3. Context Scoring"
            RRF[RRF Fusion Scoring]
            FMT[Context Formatting]
        end

        subgraph "4. Grounded Generation"
            GRAG[GraphRAG Service]
            LLM[LLM w/ Schema]
            ANS[GroundedAnswer]
        end

        subgraph "5. Reasoning Trace"
            PATH[Path Extraction]
            EXP[NL Explanation]
            TRACE[ReasoningTrace]
        end
    end

    Q --> EMB
    EMB --> KNN
    KNN --> EI
    EI --> SE
    SE --> BFS
    BFS --> PRUNE
    PRUNE --> RRF
    RRF --> FMT
    FMT --> GRAG
    GRAG --> LLM
    LLM --> ANS
    ANS --> PATH
    PATH --> EXP
    EXP --> TRACE

    style EI fill:#b2dfdb
    style SE fill:#b2dfdb
    style GRAG fill:#b2dfdb
    style ANS fill:#c8e6c9
    style TRACE fill:#fff3e0
```

### Core Types

```typescript
// Grounded answer with citations
interface GroundedAnswer {
  answer: string                    // Generated response
  citations: string[]               // Entity IDs cited
  confidence: number                // 0-1 score
  reasoning: string                 // Brief explanation
  retrieval: RetrievalResult        // Full context used
}

// Reasoning trace for explainability
interface ReasoningTrace {
  steps: ReasoningStep[]            // Path through graph
  explanation: string               // NL explanation
  confidence: number                // Inherited from answer
  query: string                     // Original query
  involvedEntities: string[]        // All entity IDs
}

interface ReasoningStep {
  from: Entity                      // Source entity
  relation: Relation                // Edge traversed
  to: Entity                        // Target entity
  explanation: string               // Step explanation
}
```

### Retrieval Pipeline

| Stage | Service | Method | Output |
|-------|---------|--------|--------|
| **Index** | EntityIndex | `index(graph)` | Entities indexed with embeddings |
| **Search** | EntityIndex | `findSimilar(query, k)` | Top-k similar entities |
| **Extract** | SubgraphExtractor | `extract(seeds, hops)` | N-hop subgraph |
| **Score** | GraphRAG | RRF fusion | Scored nodes |
| **Format** | GraphRAG | `formatContext()` | LLM-ready context |
| **Generate** | GraphRAG | `generate(llm, query)` | GroundedAnswer |
| **Explain** | GraphRAG | `explain(llm, answer)` | ReasoningTrace |

### RRF Scoring

Reciprocal Rank Fusion combines multiple ranking signals:

```
score = Σ (1 / (rank_i + 60))
```

Signals used:
- Embedding similarity rank
- Hop distance from seed (closer = better)
- Type relevance (if filtering)

### Usage Example

```typescript
import { GraphRAG } from "./Service/GraphRAG.js"

const program = Effect.gen(function*() {
  const graphRAG = yield* GraphRAG
  const llm = yield* LanguageModel.LanguageModel

  // 1. Full pipeline: index + retrieve + generate
  const answer = yield* graphRAG.answer(
    llm,
    knowledgeGraph,
    "Where does Alice work?",
    { topK: 5, hops: 2 }
  )

  console.log(answer.answer)      // "Alice works at ACME Corporation"
  console.log(answer.citations)   // ["alice", "acme_corp"]
  console.log(answer.confidence)  // 0.95

  // 2. Generate reasoning trace
  const trace = yield* graphRAG.explain(llm, answer)

  for (const step of trace.steps) {
    console.log(`${step.from.mention} → ${step.to.mention}`)
    console.log(`  ${step.explanation}`)
  }
})
```

### Service Dependencies

```mermaid
graph LR
    GraphRAG --> EntityIndex
    GraphRAG --> SubgraphExtractor
    GraphRAG --> LanguageModel

    EntityIndex --> EmbeddingService
    SubgraphExtractor --> EntityIndex

    EmbeddingService --> NomicNlpService
    EmbeddingService --> EmbeddingCache
```

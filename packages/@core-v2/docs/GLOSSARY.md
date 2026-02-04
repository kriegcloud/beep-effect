# Glossary

Quick reference for domain terminology used across the Effect Ontology codebase.

---

## Domain Models

| Term | Definition | See Also |
|------|------------|----------|
| **BatchWorkflow** | Top-level orchestration unit for processing a document against an ontology. Contains multiple extraction runs. | `Domain/Model/BatchWorkflow.ts` |
| **ExtractionRun** | Single execution of the extraction pipeline on a document chunk. Produces entities and relations. | `Domain/Model/BatchWorkflow.ts` |
| **KnowledgeGraph** | Output of extraction: a set of entities and relations that form a graph structure. | `Domain/Model/Entity.ts` |
| **KnowledgeIndex** | HashMap-based index over ontology classes and properties, built via monoid folding. Used for prompt generation. | `Domain/Model/Ontology.ts` |
| **Entity** | Extracted named thing (person, place, concept) with types, properties, and a unique ID. | `Domain/Model/Entity.ts` |
| **Relation** | Typed connection between two entities (subject → predicate → object). | `Domain/Model/Entity.ts` |
| **OntologyContext** | Parsed ontology providing class hierarchy, property definitions, and constraints. | `Domain/Model/Ontology.ts` |

---

## Ontology & RDF Concepts

| Term | Definition |
|------|------------|
| **OWL** | Web Ontology Language. Formal language for defining ontologies with classes, properties, and constraints. |
| **RDF** | Resource Description Framework. Graph-based data model using subject-predicate-object triples. |
| **Turtle** | Terse RDF Triple Language. Human-readable serialization format for RDF (`.ttl` files). |
| **SHACL** | Shapes Constraint Language. Validation language for RDF graphs (defines required properties, cardinality, etc.). |
| **IRI** | Internationalized Resource Identifier. Unique identifier for RDF resources (e.g., `http://example.org/Person`). |
| **Local Name** | The fragment after the last `/` or `#` in an IRI (e.g., `Person` from `http://example.org/Person`). |
| **Named Graph** | RDF dataset feature allowing triples to be grouped and identified by an IRI. Used for provenance. |
| **owl:sameAs** | OWL property asserting two IRIs refer to the same real-world entity. |

---

## Pipeline Stages

| Stage | Description | Service |
|-------|-------------|---------|
| **Chunking** | Splitting input text into processable segments with overlap. | `NlpService` |
| **Entity Extraction** | LLM-based identification of entities from text using ontology-guided prompts. | `EntityExtractor` |
| **Relation Extraction** | LLM-based identification of relations between extracted entities. | `RelationExtractor` |
| **Grounding** | Linking extracted entities to ontology classes using embedding similarity. | `Grounder` |
| **Entity Resolution** | Clustering and deduplicating entities across chunks (determining which mentions refer to the same thing). | `EntityResolutionActivity` |
| **Validation** | SHACL-based validation of the extracted graph against ontology constraints. | `ShaclValidationActivity` |

---

## Embedding & Vector Search

| Term | Definition | See Also |
|------|------------|----------|
| **Embedding** | Dense vector representation of text for semantic similarity. Typically 512-1024 dimensions. | `architecture/embedding-architecture.md` |
| **EmbeddingProvider** | Abstract interface for embedding backends (Nomic, Voyage, etc.). Enables provider switching via config. | `Service/EmbeddingProvider.ts` |
| **Nomic** | Local embedding provider using Transformers.js. CPU-bound, no API limits. | `Service/NomicEmbeddingProvider.ts` |
| **Voyage** | Cloud embedding provider via API. Rate-limited (100 RPM, 10 concurrent). | `Service/VoyageEmbeddingProvider.ts` |
| **Request API** | Effect pattern for automatic batching and deduplication of requests. | `Service/EmbeddingResolver.ts` |
| **Versioned Cache Key** | Cache key including provider/model/dimension to prevent stale embeddings on model change. | `architecture/embedding-architecture.md` |
| **Task Type** | Embedding optimization hint (search_query, search_document, clustering, classification). | `Service/EmbeddingProvider.ts` |
| **Rate Limiter** | Sliding window + semaphore for enforcing API limits (RPM, concurrency). | `Service/EmbeddingRateLimiter.ts` |
| **RRF** | Reciprocal Rank Fusion. Combines BM25 (lexical) and semantic rankings for hybrid search. | `Utils/Retrieval.ts` |

---

## Effect Patterns

| Term | Definition | Reference |
|------|------------|-----------|
| **Effect** | Core type representing a computation that may succeed, fail, or require dependencies. `Effect<Success, Error, Requirements>` | Effect docs |
| **Layer** | Blueprint for constructing services. Describes how to build a service from its dependencies. | `architecture/effect-patterns-guide.md` |
| **Service** | Dependency-injected capability. Defined with `Effect.Service` and consumed via `yield*`. | `EFFECT_MODULE_STYLE_GUIDE.md` |
| **Scope** | Resource lifetime manager. Services with cleanup needs use scoped layers. | Effect docs |
| **Tag** | Type-level identifier for a service in the dependency graph. Created by `Effect.Service`. | Effect docs |
| **Default Layer** | Standard production implementation of a service (e.g., `MyService.Default`). | `EFFECT_MODULE_STYLE_GUIDE.md` |
| **DefaultWithoutDependencies** | Layer providing a service without its transitive dependencies (for composition). | `EFFECT_MODULE_STYLE_GUIDE.md` |
| **Accessor** | Auto-generated static methods on a service class for calling service methods. Enabled with `accessors: true`. | `EFFECT_MODULE_STYLE_GUIDE.md` |
| **Request** | Effect type for batched operations. Automatically groups requests within a time window for efficiency. | Effect docs |
| **RequestResolver** | Handler that processes batches of requests. Implements the actual batching logic. | Effect docs |

---

## LLM Control

| Term | Definition | See Also |
|------|------------|----------|
| **Token Budget** | Allocated token limit for a pipeline stage. Prevents runaway costs. | `LLM_CONTROL_QUICK_REFERENCE.md` |
| **Stage Timeout** | Per-stage time limit for extraction operations. | `LLM_CONTROL_QUICK_REFERENCE.md` |
| **LLM Semaphore** | Concurrency limiter for parallel LLM calls. | `Service/LlmControl/` |
| **Circuit Breaker** | Failure protection that stops calling failing services after threshold exceeded. | `Service/LlmControl/` |

---

## Workflow & Persistence

| Term | Definition |
|------|------------|
| **Durable Workflow** | Long-running workflow that survives process restarts via event journaling. |
| **Activity** | Unit of work within a workflow that can be retried and checkpointed. |
| **Idempotency Key** | Unique identifier ensuring an operation is only executed once, even if retried. |
| **Event Journal** | Append-only log of workflow events for replay and recovery. |
| **BatchState** | Union type representing workflow states: `pending`, `running`, `completed`, `failed`. |

---

## Abbreviations

| Abbrev | Meaning |
|--------|---------|
| ER | Entity Resolution |
| NLP | Natural Language Processing |
| LLM | Large Language Model |
| SOTA | State of the Art |
| SSE | Server-Sent Events |
| GCP | Google Cloud Platform |

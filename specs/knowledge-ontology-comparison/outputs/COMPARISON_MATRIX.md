# Comparison Matrix

## Summary

This matrix provides a comprehensive feature-by-feature comparison between the `effect-ontology` reference implementation and the current `knowledge-slice` in the beep-effect codebase. The comparison spans six major capability categories: Query & Reasoning, Entity Resolution, GraphRAG, Workflow Orchestration, RDF Infrastructure, and Service Architecture.

The analysis reveals that `knowledge-slice` has achieved strong parity in Entity Resolution (with full clustering, canonical selection, and sameAs linking) and GraphRAG (complete 5-stage retrieval pipeline with RRF scoring). However, significant gaps exist in Query & Reasoning (no SPARQL engine, no forward-chaining reasoner, no SHACL validation) and Workflow Orchestration (no durable execution, no batch state streaming, no cross-batch coordination).

The RDF Infrastructure category presents the most fundamental architectural divergence: `effect-ontology` uses a true triple store (N3.Store + Oxigraph) with full RDF serialization, while `knowledge-slice` uses a relational PostgreSQL model with JSONB storage. This design decision was intentional for the beep-effect domain but limits semantic web interoperability. Service Architecture shows partial parity with Effect patterns but lacks resilience primitives (circuit breakers, retry policies) and layer composition bundles.

## Legend

- ✅ Full: Feature fully implemented with parity
- 🟡 Partial: Feature exists but incomplete
- ❌ Gap: Feature missing entirely
- ➖ N/A: Not applicable to knowledge-slice design

## Matrix

| # | Category | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|----------|------------|-----------------|-----------------|--------|-------|
| 1 | Query & Reasoning | SPARQL 1.1 SELECT | ✅ Oxigraph WASM with SparqlBindings | ❌ None | GAP | Full query language missing |
| 2 | Query & Reasoning | SPARQL 1.1 ASK | ✅ Boolean result type | ❌ None | GAP | Existence queries not possible |
| 3 | Query & Reasoning | SPARQL 1.1 CONSTRUCT | ✅ Quad generation | ❌ None | GAP | Cannot generate new graphs from queries |
| 4 | Query & Reasoning | SPARQL 1.1 DESCRIBE | ✅ Node description | ❌ None | GAP | Cannot describe entity neighborhoods |
| 5 | Query & Reasoning | Oxigraph Store Integration | ✅ WASM-based triple store | ❌ None | GAP | No in-memory triple store |
| 6 | Query & Reasoning | N3 to Turtle Serialization | ✅ Three-step pipeline | 🟡 Parse only | PARTIAL | Can parse but not serialize |
| 7 | Query & Reasoning | Forward-Chaining Reasoner | ✅ N3.js Reasoner | ❌ None | GAP | No inference engine |
| 8 | Query & Reasoning | RDFS Subclass Rule | ✅ RDFS_SUBCLASS_RULE | ❌ None | GAP | Manual hierarchy traversal only |
| 9 | Query & Reasoning | RDFS Subproperty Rule | ✅ RDFS_SUBPROPERTY_RULE | ❌ None | GAP | No property inheritance |
| 10 | Query & Reasoning | RDFS Domain/Range Rules | ✅ RDFS_DOMAIN_RULE, RDFS_RANGE_RULE | ❌ None | GAP | No type inference from properties |
| 11 | Query & Reasoning | OWL sameAs Reasoning | ✅ OWL_SAMEAS_RULE | 🟡 SameAsLinker (post-hoc) | PARTIAL | Generates links but no reasoning |
| 12 | Query & Reasoning | Reasoning Profiles | ✅ rdfs, rdfs-subclass, owl-sameas, custom | ❌ None | GAP | No configurable profiles |
| 13 | Query & Reasoning | SHACL Validation | ✅ shacl-engine with N3.Store | ❌ None | GAP | No constraint validation |
| 14 | Query & Reasoning | SHACL Violation Reporting | ✅ ShaclViolation, ValidationPolicy | ❌ None | GAP | Cannot report shape violations |
| 15 | Query & Reasoning | Shapes Caching | ✅ Hash-based cache | ❌ None | GAP | No validation caching |
| 16 | Query & Reasoning | Re-SHACL Pattern | ✅ reasonForValidation() | ❌ None | GAP | No pre-validation inference |
| 17 | Entity Resolution | MentionRecord (Immutable Evidence) | ✅ Extraction evidence layer | ❌ None | GAP | No immutable mention tracking |
| 18 | Entity Resolution | ResolvedEntity (Canonical) | ✅ Aggregated canonical form | ✅ Via CanonicalSelector | FULL | Both produce canonical entities |
| 19 | Entity Resolution | ResolutionEdge Types | ✅ exact, similarity, containment, neighbor | 🟡 similarity only | PARTIAL | Missing containment/neighbor methods |
| 20 | Entity Resolution | RelationEdge (Predicate URIs) | ✅ Full predicate support | ✅ Via RelationRepo | FULL | Both support typed relations |
| 21 | Entity Resolution | Agglomerative Clustering | ✅ Configurable weights | ✅ EntityClusterer (0.85 threshold) | FULL | Similar algorithms |
| 22 | Entity Resolution | Embedding Similarity | ✅ embeddingWeight config | ✅ Embedding-based clustering | FULL | Both use vector similarity |
| 23 | Entity Resolution | Canonical Selection Strategies | ✅ Implicit in resolution | ✅ highest_confidence, most_attributes, hybrid | FULL | knowledge-slice more configurable |
| 24 | Entity Resolution | Attribute Merging | ✅ Merged attributes{} | ✅ AttributeMerger service | FULL | Both aggregate attributes |
| 25 | Entity Resolution | Cross-Batch Resolution | ✅ CrossBatchEntityResolver | ❌ None | GAP | Cannot resolve across batches |
| 26 | Entity Resolution | Cumulative Entity Registry | ✅ Persistent across batches | ❌ None | GAP | No persistent registry |
| 27 | Entity Resolution | EntityLinker Service | ✅ getCanonicalId(), getMentionsForEntity() | 🟡 Via SameAsLinker | PARTIAL | Different API surface |
| 28 | GraphRAG | Embedding Search (Stage 1) | ✅ EntityIndex with caching | ✅ EmbeddingRepo k-NN | FULL | Both support vector search |
| 29 | GraphRAG | N-Hop Extraction (Stage 2) | ✅ SubgraphExtractor BFS | ✅ BFS traversal | FULL | Both use breadth-first |
| 30 | GraphRAG | RRF Fusion (Stage 3) | ✅ k=60 default | ✅ RrfScorer k=60 | FULL | Identical algorithm |
| 31 | GraphRAG | Context Formatting (Stage 4) | ✅ Token budget truncation | ✅ ContextFormatter with maxTokens | FULL | Both manage context windows |
| 32 | GraphRAG | ScoredNode Type | ✅ relevance, hopDistance, isSeed | ✅ Similar scoring model | FULL | Both track node scores |
| 33 | GraphRAG | Grounded Answer Generation | ✅ generateObjectWithFeedback() | ❌ None | GAP | No LLM answer generation |
| 34 | GraphRAG | Reasoning Trace | ✅ ReasoningTrace with citing paths | ❌ None | GAP | No trace generation |
| 35 | GraphRAG | Citation Validation | ✅ Path verification | ❌ None | GAP | Cannot validate citations |
| 36 | Workflow Orchestration | Durable Activities | ✅ @effect/workflow PostgreSQL | ❌ None | GAP | No durability |
| 37 | Workflow Orchestration | Batch State Machine | ✅ PENDING→EXTRACTING→...→COMPLETED | ❌ None | GAP | No state tracking |
| 38 | Workflow Orchestration | BatchStateHub (PubSub) | ✅ Real-time streaming | ❌ None | GAP | No SSE streaming |
| 39 | Workflow Orchestration | Fire-and-Forget Mode | ✅ Non-blocking execution | ❌ None | GAP | All sync execution |
| 40 | Workflow Orchestration | Preprocessing Stage | ✅ Classification, adaptive chunking | 🟡 NlpService chunking | PARTIAL | No classification |
| 41 | Workflow Orchestration | 6-Phase Extraction | ✅ Chunk→Mention→Entity→Property→Relation→Ground | ✅ 6-stage ExtractionPipeline | FULL | Comparable stages |
| 42 | Workflow Orchestration | Cross-Batch Orchestration | ✅ Coordinates multiple batches | ❌ None | GAP | Single-batch only |
| 43 | Workflow Orchestration | Validation Stage | ✅ SHACL validation stage | ❌ None | GAP | No validation in pipeline |
| 44 | Workflow Orchestration | Ingestion Stage | ✅ RDF persistence | 🟡 PostgreSQL persistence | PARTIAL | Different storage model |
| 45 | Workflow Orchestration | SqlMessageStorage | ✅ Workflow cluster messages | ❌ None | GAP | No message persistence |
| 46 | Workflow Orchestration | SqlRunnerStorage | ✅ Activity runner state | ❌ None | GAP | No runner persistence |
| 47 | RDF Infrastructure | Triple Store | ✅ N3.Store wrapper (RdfStore) | ❌ Relational model | GAP | Fundamental design difference |
| 48 | RDF Infrastructure | Turtle Parsing | ✅ parseTurtle() | ✅ OntologyParser | FULL | Both use N3.js |
| 49 | RDF Infrastructure | N3 Parsing | ✅ parseN3() | ❌ None | GAP | No N3 rule parsing |
| 50 | RDF Infrastructure | Turtle Serialization | ✅ toTurtle() | ❌ None | GAP | Cannot export RDF |
| 51 | RDF Infrastructure | N-Triples Serialization | ✅ toNTriples() | ❌ None | GAP | No interchange format |
| 52 | RDF Infrastructure | QuadPattern Queries | ✅ query() with wildcards | ❌ None | GAP | No pattern matching |
| 53 | RDF Infrastructure | Named Graphs | ✅ Full quad support | ❌ None | GAP | No graph contexts |
| 54 | RDF Infrastructure | PROV-O Provenance | ✅ Activity, Entity, Agent | ❌ None | GAP | No provenance tracking |
| 55 | RDF Infrastructure | Vocabulary Constants | ✅ RDF, RDFS, OWL, XSD, SKOS, etc. | 🟡 Partial in OntologyParser | PARTIAL | Not centralized |
| 56 | Service Architecture | Effect.Service Pattern | ✅ effect, dependencies, accessors | ✅ Same pattern | FULL | Both use Effect services |
| 57 | Service Architecture | Default/Test Layers | ✅ .Default, .Test | ✅ Same pattern | FULL | Both provide layers |
| 58 | Service Architecture | Layer Bundles | ✅ LlmControlBundle, OntologyBundle, etc. | ❌ None | GAP | No bundle composition |
| 59 | Service Architecture | Tagged Errors | ✅ Data.TaggedError | ✅ GraphRAGError, etc. | FULL | Both use tagged errors |
| 60 | Service Architecture | CircuitBreaker | ✅ Resilience pattern | ❌ None | GAP | No circuit breaking |
| 61 | Service Architecture | Retry with Backoff | ✅ Exponential backoff (3 attempts) | ❌ None | GAP | No retry policies |
| 62 | Service Architecture | Rate Limiting | ✅ Request throttling | ❌ None | GAP | No rate limits |
| 63 | Service Architecture | Effect.log* Structured | ✅ Structured logging | ✅ Same pattern | FULL | Both use Effect logging |
| 64 | Service Architecture | Effect.withSpan | ✅ Tracing spans | ✅ Same pattern | FULL | Both support tracing |
| 65 | Service Architecture | 50+ Focused Services | ✅ Single responsibility | 🟡 ~15 services | PARTIAL | Fewer but similar design |

## Summary Statistics

| Category | Full | Partial | Gap | N/A | Total |
|----------|------|---------|-----|-----|-------|
| Query & Reasoning | 0 | 2 | 14 | 0 | 16 |
| Entity Resolution | 6 | 2 | 3 | 0 | 11 |
| GraphRAG | 5 | 0 | 3 | 0 | 8 |
| Workflow Orchestration | 1 | 2 | 9 | 0 | 12 |
| RDF Infrastructure | 1 | 1 | 7 | 0 | 9 |
| Service Architecture | 5 | 1 | 4 | 0 | 10 |
| **Total** | **18** | **8** | **40** | **0** | **66** |

## Priority Assessment

### Critical Gaps (P0 - Blocks Core Functionality)
1. **SPARQL Query Engine** - Cannot perform semantic queries
2. **Cross-Batch Resolution** - Cannot maintain entity consistency across documents
3. **Durable Workflow Execution** - No fault tolerance or resumability

### High Priority Gaps (P1 - Limits Capability)
1. **Forward-Chaining Reasoner** - No automatic inference
2. **SHACL Validation** - No constraint enforcement
3. **Batch State Streaming** - No real-time progress feedback
4. **Circuit Breaker / Retry** - No resilience patterns

### Medium Priority Gaps (P2 - Enhances Quality)
1. **Grounded Answer Generation** - Manual LLM integration required
2. **RDF Serialization** - Cannot export standard formats
3. **Reasoning Trace** - No explainability for answers
4. **Layer Bundles** - Manual layer composition

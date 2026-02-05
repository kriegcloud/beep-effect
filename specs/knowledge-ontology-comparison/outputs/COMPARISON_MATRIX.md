# Comparison Matrix

## Summary

This matrix provides a corrected, comprehensive feature-by-feature comparison between the `effect-ontology` reference implementation (68+ services) and the current `knowledge-slice` in the beep-effect codebase (35+ services). The comparison spans seven major capability categories: Query & Reasoning, Entity Resolution, GraphRAG, Workflow Orchestration, RDF Infrastructure, Service Architecture, and Content Processing & Enrichment.

**Key corrections from previous version (2026-02-03):**

The previous matrix was severely outdated. Multiple entire subsystems were marked as missing that are in fact fully implemented:

- **Sparql/** subsystem: 5 services implementing SELECT/CONSTRUCT/ASK via sparqljs parser against N3.Store (previously all marked as GAP)
- **Reasoning/** subsystem: 3 services implementing RDFS forward-chaining with provenance tracking (previously all marked as GAP)
- **Rdf/** subsystem: 3 services wrapping N3.js for triple storage, quad pattern matching, Turtle/N-Triples serialization (previously all marked as GAP)
- **GraphRAG** services: GroundedAnswerGenerator, ReasoningTraceFormatter, CitationValidator all fully implemented (previously all marked as GAP)
- **EntityResolution** services: EntityRegistry with BloomFilter for cross-batch resolution, 8 total services (previously 2 marked as GAP)
- **Vocabulary constants**: RDF, RDFS, OWL, SKOS all defined in `constants.ts` (previously marked as partial)

The knowledge-slice service count was previously reported as ~15; actual count is 35+ dedicated services across 10 subsystem directories plus 10 database repositories.

## Legend

- ✅ Full: Feature fully implemented with parity or equivalent functionality
- 🟡 Partial: Feature exists but incomplete or different approach with reduced capability
- ❌ Gap: Feature missing entirely
- ➖ N/A: Not applicable to knowledge-slice design

## Matrix

### 1. Query & Reasoning

| # | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|------------|-----------------|-----------------|--------|-------|
| 1 | SPARQL SELECT queries | ✅ Oxigraph WASM with SparqlBindings | 🟡 sparqljs parser + custom QueryExecutor against N3.Store | PARTIAL | `Sparql/SparqlService.ts` - Full SELECT parsing but custom execution engine (not Oxigraph), may have FILTER limitations |
| 2 | SPARQL ASK queries | ✅ Boolean result type | ✅ `ask()` method returns boolean | FULL | `Sparql/SparqlService.ts` - Uses sparqljs parsing + custom execution |
| 3 | SPARQL CONSTRUCT queries | ✅ Quad generation | ✅ `construct()` returns ReadonlyArray<Quad> | FULL | `Sparql/SparqlService.ts` - Generates quads from CONSTRUCT templates |
| 4 | SPARQL DESCRIBE queries | ✅ Node description | ❌ None | GAP | No DESCRIBE handler in SparqlService; sparqljs can parse DESCRIBE but no executor exists |
| 5 | SPARQL UPDATE operations | ✅ Via Oxigraph | ❌ None | GAP | SparqlService explicitly handles type "update" but does not implement it |
| 6 | SPARQL FILTER evaluation | ✅ Full Oxigraph engine | 🟡 Custom FilterEvaluator | PARTIAL | `Sparql/FilterEvaluator.ts` - Handles common filter expressions but may not cover full SPARQL 1.1 FILTER spec |
| 7 | SPARQL query parsing | ✅ Oxigraph built-in | ✅ sparqljs library | FULL | `Sparql/SparqlParser.ts` - Full SPARQL 1.1 grammar via sparqljs |
| 8 | Query execution engine | ✅ Oxigraph WASM native engine | 🟡 Custom QueryExecutor against N3.Store | PARTIAL | `Sparql/QueryExecutor.ts` - Implements BGP, OPTIONAL, UNION, FILTER, BIND, VALUES but not full Oxigraph feature set |
| 9 | Forward-chaining reasoner | ✅ N3.js Reasoner with multiple profiles | ✅ Custom ForwardChainer with RDFS rules | FULL | `Reasoning/ForwardChainer.ts` - Iterative forward-chaining with provenance tracking, max depth/inferences limits |
| 10 | RDFS subclass rule (rdfs9) | ✅ RDFS_SUBCLASS_RULE | ✅ Implemented in RdfsRules | FULL | `Reasoning/RdfsRules.ts` - rdfs:subClassOf transitivity |
| 11 | RDFS subproperty rule (rdfs7) | ✅ RDFS_SUBPROPERTY_RULE | ✅ Implemented in RdfsRules | FULL | `Reasoning/RdfsRules.ts` - rdfs:subPropertyOf inheritance |
| 12 | RDFS domain rule (rdfs2) | ✅ RDFS_DOMAIN_RULE | ✅ `rdfs2` rule in RdfsRules | FULL | `Reasoning/RdfsRules.ts` - Type inference from property domain declarations |
| 13 | RDFS range rule (rdfs3) | ✅ RDFS_RANGE_RULE | ✅ `rdfs3` rule in RdfsRules | FULL | `Reasoning/RdfsRules.ts` - Type inference from property range declarations |
| 14 | OWL sameAs reasoning | ✅ OWL_SAMEAS_RULE in reasoner | ✅ SameAsLinker + ForwardChainer integration | FULL | `EntityResolution/SameAsLinker.ts` + `Reasoning/ForwardChainer.ts` - Generates and reasons over owl:sameAs |
| 15 | Reasoning profiles (configurable) | ✅ rdfs, rdfs-subclass, owl-sameas, custom | 🟡 Single RDFS profile via ReasoningConfig | PARTIAL | `Reasoning/ReasonerService.ts` - Has configurable maxDepth/maxInferences/profile but fewer built-in profiles |
| 16 | Inference provenance tracking | ✅ Provenance per derived triple | ✅ InferenceProvenance with ruleId + sourceQuads | FULL | `Reasoning/ForwardChainer.ts` - MutableHashMap of provenance per derived quad |
| 17 | Inference result statistics | ✅ Stats per reasoning run | ✅ InferenceStats with iterations, total/derived counts | FULL | `Reasoning/ForwardChainer.ts` - Returns InferenceResult with InferenceStats |
| 18 | Materialize inferred triples | ✅ Add to store | ✅ `inferAndMaterialize()` adds to RdfStore | FULL | `Reasoning/ReasonerService.ts` - Optional materialization into backing N3.Store |
| 19 | SHACL validation | ✅ shacl-engine with N3.Store | ❌ None | GAP | No SHACL validation engine present |
| 20 | SHACL violation reporting | ✅ ShaclViolation, ValidationPolicy | ❌ None | GAP | No shape constraint violation reporting |
| 21 | SHACL shapes caching | ✅ Hash-based cache | ❌ None | GAP | No validation caching |
| 22 | Re-SHACL (reason then validate) | ✅ reasonForValidation() pipeline | ❌ None | GAP | No pre-validation inference pipeline |
| 23 | SHACL auto-generation | ✅ Shapes from ontology | ❌ None | GAP | No automatic shape generation |
| 24 | NL-to-SPARQL generation | ✅ SparqlGenerator via LLM | ❌ None | GAP | No natural language to SPARQL translation |
| 25 | SHACL violation explanation | ✅ ViolationExplainer via LLM | ❌ None | GAP | No human-readable violation explanations |

### 2. Entity Resolution

| # | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|------------|-----------------|-----------------|--------|-------|
| 26 | Entity extraction (LLM) | ✅ EntityExtractor service | ✅ EntityExtractor with output schemas | FULL | `Extraction/EntityExtractor.ts` + `Extraction/schemas/entity-output.schema.ts` |
| 27 | Mention extraction | ✅ MentionExtractor service | ✅ MentionExtractor with output schemas | FULL | `Extraction/MentionExtractor.ts` + `Extraction/schemas/mention-output.schema.ts` |
| 28 | Relation extraction (LLM) | ✅ RelationExtractor service | ✅ RelationExtractor with output schemas | FULL | `Extraction/RelationExtractor.ts` + `Extraction/schemas/relation-output.schema.ts` |
| 29 | Graph assembly | ✅ Assembles KnowledgeGraph | ✅ GraphAssembler produces AssembledEntity/AssembledRelation | FULL | `Extraction/GraphAssembler.ts` |
| 30 | 6-stage extraction pipeline | ✅ Multi-stage pipeline | ✅ ExtractionPipeline with 6 stages | FULL | `Extraction/ExtractionPipeline.ts` - Chunk, mention, entity, relation, graph, optional clustering |
| 31 | MentionRecord (immutable evidence) | ✅ Extraction evidence layer | ✅ MentionRecord entity + repo | FULL | `db/repos/MentionRecord.repo.ts` + domain model - Immutable extraction evidence |
| 32 | ResolvedEntity (canonical form) | ✅ Aggregated canonical form | ✅ Via CanonicalSelector strategies | FULL | `EntityResolution/CanonicalSelector.ts` |
| 33 | Agglomerative clustering | ✅ Configurable weights | ✅ EntityClusterer (0.85 threshold) | FULL | `EntityResolution/EntityClusterer.ts` - Embedding-based agglomerative clustering |
| 34 | Embedding similarity scoring | ✅ embeddingWeight config | ✅ Cosine similarity via vector utilities | FULL | `EntityResolution/EntityClusterer.ts` + `utils/vector.ts` |
| 35 | Canonical selection strategies | ✅ Implicit in resolution | ✅ highest_confidence, most_attributes, hybrid | FULL | `EntityResolution/CanonicalSelector.ts` - More configurable than effect-ontology |
| 36 | Attribute merging | ✅ Merged attributes | ✅ Via EntityResolutionService | FULL | `EntityResolution/EntityResolutionService.ts` |
| 37 | Entity splitting (unmerge) | ✅ Via resolution reversal | ✅ SplitService with full split logic | FULL | `EntityResolution/SplitService.ts` |
| 38 | Merge history tracking | ✅ MergeRecord with audit trail | ✅ MergeHistoryLive with repo persistence | FULL | `EntityResolution/MergeHistoryLive.ts` + `db/repos/MergeHistory.repo.ts` |
| 39 | Incremental clustering | ✅ Incremental resolution | ✅ IncrementalClustererLive | FULL | `EntityResolution/IncrementalClustererLive.ts` |
| 40 | Cross-batch entity resolution | ✅ CrossBatchEntityResolver | ✅ EntityRegistry with BloomFilter | FULL | `EntityResolution/EntityRegistry.ts` - findCandidates, bloomFilterCheck, fetchTextMatches, rankBySimilarity |
| 41 | Cumulative entity registry | ✅ Persistent across batches | ✅ EntityRegistry with EntityRepo + BloomFilter | FULL | `EntityResolution/EntityRegistry.ts` + `EntityResolution/BloomFilter.ts` |
| 42 | BloomFilter for fast membership | ✅ Not present (uses DB queries) | ✅ Custom BloomFilter implementation | FULL | `EntityResolution/BloomFilter.ts` - Probabilistic membership testing with stats reporting |
| 43 | owl:sameAs link generation | ✅ Via EntityResolution | ✅ SameAsLinker with SameAsLink.repo persistence | FULL | `EntityResolution/SameAsLinker.ts` + `db/repos/SameAsLink.repo.ts` |
| 44 | Entity cluster persistence | ✅ Via database | ✅ EntityCluster.repo | FULL | `db/repos/EntityCluster.repo.ts` |
| 45 | Resolution edge types | ✅ exact, similarity, containment, neighbor | 🟡 similarity-based primary, text exact match | PARTIAL | EntityRegistry uses embedding similarity + text matching; no containment/neighbor methods |
| 46 | EntityLinker (ontology class linking) | ✅ Links to ontology classes + Wikidata | 🟡 EntityRegistry.findCandidates links to existing entities | PARTIAL | No Wikidata linking; links within internal entity registry only |
| 47 | ReconciliationService (advanced matching) | ✅ Advanced matching/reconciliation | ❌ None | GAP | No dedicated reconciliation service; matching is embedded in EntityRegistry |
| 48 | Entity deduplication across sources | ✅ Cross-source deduplication | ✅ Via EntityRegistry + IncrementalClusterer | FULL | Combines BloomFilter fast-path with embedding similarity |

### 3. GraphRAG

| # | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|------------|-----------------|-----------------|--------|-------|
| 49 | Embedding search (Stage 1) | ✅ EntityIndex with caching | ✅ EmbeddingRepo k-NN search | FULL | `db/repos/Embedding.repo.ts` - Vector similarity search |
| 50 | N-Hop subgraph extraction (Stage 2) | ✅ SubgraphExtractor BFS | ✅ BFS traversal in GraphRAGService | FULL | `GraphRAG/GraphRAGService.ts` |
| 51 | RRF fusion scoring (Stage 3) | ✅ k=60 default | ✅ RrfScorer with k=60 | FULL | `GraphRAG/RrfScorer.ts` - Identical RRF algorithm |
| 52 | Context formatting (Stage 4) | ✅ Token budget truncation | ✅ ContextFormatter with maxTokens | FULL | `GraphRAG/ContextFormatter.ts` |
| 53 | Confidence scoring | ✅ Relevance scoring model | ✅ ConfidenceScorer service | FULL | `GraphRAG/ConfidenceScorer.ts` |
| 54 | Grounded answer generation | ✅ generateObjectWithFeedback() | ✅ GroundedAnswerGenerator via @effect/ai LanguageModel | FULL | `GraphRAG/GroundedAnswerGenerator.ts` - Uses @effect/ai Prompt + LanguageModel |
| 55 | Reasoning trace formatting | ✅ ReasoningTrace with citing paths | ✅ ReasoningTraceFormatter with depth calculation | FULL | `GraphRAG/ReasoningTraceFormatter.ts` - Converts InferenceProvenance to ReasoningTrace |
| 56 | Citation parsing | ✅ Citation extraction | ✅ CitationParser with entity/relation extraction | FULL | `GraphRAG/CitationParser.ts` - Sentence-level citation tracking |
| 57 | Citation validation (SPARQL-based) | ✅ Path verification | ✅ CitationValidator using SparqlService + ReasonerService | FULL | `GraphRAG/CitationValidator.ts` - SPARQL ASK for entity/relation existence, inference-aware |
| 58 | Answer schemas (structured output) | ✅ Structured answer types | ✅ GroundedAnswer, Citation, InferenceStep, ReasoningTrace | FULL | `GraphRAG/AnswerSchemas.ts` |
| 59 | Prompt templates | ✅ RAG prompt templates | ✅ GraphRAG prompt templates | FULL | `GraphRAG/PromptTemplates.ts` |
| 60 | GraphRAG RPC endpoint | ✅ API endpoint | ✅ graphrag/query RPC | FULL | `rpc/v1/graphrag/query.ts` |

### 4. Workflow Orchestration

| # | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|------------|-----------------|-----------------|--------|-------|
| 61 | Durable workflow execution | ✅ @effect/workflow with PostgreSQL persistence | ❌ None | GAP | No durable execution framework |
| 62 | Batch state machine | ✅ Pending/Preprocessing/Extracting/Resolving/Validating/Ingesting/Complete/Failed | ❌ None | GAP | No formal state machine for batch lifecycle |
| 63 | BatchStateHub (PubSub streaming) | ✅ Real-time state streaming | ❌ None | GAP | No SSE or PubSub streaming for batch progress |
| 64 | Fire-and-forget execution | ✅ Non-blocking execution mode | ❌ None | GAP | All execution is synchronous |
| 65 | Preprocessing stage (classification) | ✅ DocumentClassifier + adaptive chunking | 🟡 NlpService chunking only | PARTIAL | `Nlp/NlpService.ts` - Has chunking but no document classification for strategy selection |
| 66 | Cross-batch orchestration | ✅ Coordinates multiple batch runs | ❌ None | GAP | Single pipeline execution; no multi-batch coordination |
| 67 | Validation stage (SHACL in pipeline) | ✅ SHACL validation stage in workflow | ❌ None | GAP | No validation stage; depends on missing SHACL implementation |
| 68 | Ingestion stage | ✅ RDF triple store persistence | 🟡 PostgreSQL relational persistence | PARTIAL | Stores to relational tables via repos, not RDF triple store; functionally equivalent for beep-effect domain |
| 69 | SqlMessageStorage (workflow messages) | ✅ Workflow cluster message persistence | ❌ None | GAP | No workflow message persistence |
| 70 | SqlRunnerStorage (activity runner state) | ✅ Activity runner state persistence | ❌ None | GAP | No activity runner state tracking |
| 71 | DurableActivities factory | ✅ Factory for preprocessing/extraction/resolution/validation/inference/cross-batch/ingestion/claims | ❌ None | GAP | No durable activity abstraction |
| 72 | ActivityRunner execution engine | ✅ Runs durable activities with crash recovery | ❌ None | GAP | No activity execution engine |
| 73 | EventBusService (pub/sub) | ✅ Unified pub/sub with multiple backends | ❌ None | GAP | No event bus for inter-service communication |

### 5. RDF Infrastructure

| # | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|------------|-----------------|-----------------|--------|-------|
| 74 | Triple store (in-memory) | ✅ N3.Store + Oxigraph WASM | ✅ RdfStoreService wrapping N3.Store | FULL | `Rdf/RdfStoreService.ts` - Full N3.js wrapper with IRI/BlankNode/Literal term conversion |
| 75 | Quad pattern matching | ✅ query() with wildcards | ✅ RdfStore.match() with QuadPattern | FULL | `Rdf/RdfStoreService.ts` - Pattern-based quad retrieval from N3.Store |
| 76 | Turtle parsing | ✅ parseTurtle() | ✅ OntologyParser via N3.js | FULL | `Ontology/OntologyParser.ts` - N3.js-based Turtle parsing |
| 77 | Turtle serialization | ✅ toTurtle() | ✅ Serializer with Turtle output | FULL | `Rdf/Serializer.ts` - N3.Writer-based Turtle serialization |
| 78 | N-Triples serialization | ✅ toNTriples() | ✅ Serializer with N-Triples output | FULL | `Rdf/Serializer.ts` - Supports RdfFormat selection including N-Triples |
| 79 | N3 rule parsing | ✅ parseN3() for Notation3 rules | ❌ None | GAP | No Notation3 rule parsing; RDFS rules are coded in TypeScript |
| 80 | RDF graph builder | ✅ RdfBuilder for graph construction | ✅ RdfBuilder utilities | FULL | `Rdf/RdfBuilder.ts` - RDF graph construction helpers |
| 81 | Named graph support (quads) | ✅ Full quad support with graph component | 🟡 Quad has optional graph field | PARTIAL | Domain Quad model includes graph field; N3.Store supports named graphs but usage is limited |
| 82 | Term type system (IRI/BlankNode/Literal) | ✅ N3.js DataFactory types | ✅ Domain-level IRI, BlankNode, Literal value objects | FULL | `@beep/knowledge-domain/value-objects` - Branded types with N3.js interop in RdfStoreService |
| 83 | RDF vocabulary constants | ✅ RDF, RDFS, OWL, XSD, SKOS, PROV-O | 🟡 RDF, RDFS, OWL, SKOS (no XSD, no PROV-O) | PARTIAL | `Ontology/constants.ts` - Covers 4 of 6 vocabularies; missing XSD and PROV-O |
| 84 | PROV-O provenance vocabulary | ✅ Activity, Entity, Agent | ❌ None | GAP | No W3C PROV-O provenance vocabulary constants |
| 85 | XSD datatype constants | ✅ Full XSD vocabulary | ❌ None | GAP | XSD used inline (e.g., RdfStoreService) but no centralized constants |
| 86 | Ontology loading (OWL/RDFS) | ✅ OntologyService with class/property extraction | ✅ OntologyService + OntologyParser | FULL | `Ontology/OntologyService.ts` + `Ontology/OntologyParser.ts` |
| 87 | Ontology caching | ✅ OntologyLoaderService with registry caching | ✅ OntologyCache service | FULL | `Ontology/OntologyCache.ts` |
| 88 | Multi-ontology registry | ✅ OntologyRegistryService with manifest | 🟡 Single ontology at a time | PARTIAL | No registry manifest or multi-ontology orchestration; `db/repos/Ontology.repo.ts` persists ontology metadata |
| 89 | Class/Property definition persistence | ✅ Via ontology loading | ✅ ClassDefinition.repo + PropertyDefinition.repo | FULL | `db/repos/ClassDefinition.repo.ts` + `db/repos/PropertyDefinition.repo.ts` |

### 6. Service Architecture

| # | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|------------|-----------------|-----------------|--------|-------|
| 90 | Effect.Service pattern (Context.Tag) | ✅ effect, dependencies, accessors | ✅ Same pattern throughout | FULL | All services use Context.Tag + Layer pattern |
| 91 | Default/Test layers | ✅ .Default, .Test exports | ✅ Same pattern (e.g., SparqlServiceLive, RdfStoreLive) | FULL | Consistent layer exports across all services |
| 92 | Layer bundles (composite) | ✅ LlmControlBundle, OntologyBundle, etc. | 🟡 LlmLayers only | PARTIAL | `Runtime/LlmLayers.ts` - Single bundle; no equivalent to OntologyBundle or ExtractionBundle |
| 93 | Tagged errors | ✅ Data.TaggedError throughout | ✅ S.TaggedError throughout (GraphRAGError, EmbeddingError, etc.) | FULL | Consistent across all services |
| 94 | CircuitBreaker resilience | ✅ CircuitBreaker pattern | ❌ None | GAP | No circuit breaker implementation |
| 95 | Retry with exponential backoff | ✅ Exponential backoff (3 attempts) | ❌ None | GAP | No retry policy abstraction |
| 96 | Rate limiting (LLM) | ✅ LlmSemaphore request throttling | ❌ None | GAP | No rate limiter for LLM calls |
| 97 | LLM fallback providers | ✅ EmbeddingService multi-provider fallback | ❌ None | GAP | Single provider only; no fallback chain |
| 98 | Effect.log* structured logging | ✅ Structured logging | ✅ Same pattern with Effect.annotateLogs | FULL | Consistent structured logging across all services |
| 99 | Effect.withSpan tracing | ✅ Tracing spans | ✅ Same pattern throughout | FULL | withSpan on all service methods |
| 100 | RPC endpoint layer | ✅ API endpoints | ✅ @effect/rpc endpoints (entity/, relation/, graphrag/) | FULL | `rpc/v1/` - Full RPC implementation |
| 101 | Database repositories | ✅ Various storage backends | ✅ 10 repos via DbRepo.make pattern | FULL | Entity, Relation, Mention, MentionRecord, Embedding, Ontology, ClassDef, PropDef, SameAsLink, MergeHistory, EntityCluster |
| 102 | @effect/ai integration | ✅ LLM integration | ✅ @effect/ai LanguageModel + EmbeddingModel | FULL | `GraphRAG/GroundedAnswerGenerator.ts` + `Embedding/EmbeddingService.ts` |
| 103 | Service count | ✅ 68+ focused services | 🟡 35+ services | PARTIAL | Fewer services but comparable coverage of core extraction/resolution/RAG capabilities |
| 104 | Token budget management | ✅ TokenBudgetService | 🟡 Token budget in ContextFormatter only | PARTIAL | `GraphRAG/ContextFormatter.ts` - Manages tokens but no standalone service |
| 105 | Stage timeout management | ✅ StageTimeoutService | ❌ None | GAP | No configurable stage timeouts |

### 7. Content Processing & Enrichment

| # | Capability | effect-ontology | knowledge-slice | Status | Notes |
|---|------------|-----------------|-----------------|--------|-------|
| 106 | Image extraction (multi-modal) | ✅ ImageExtractor service | ❌ None | GAP | No image/multi-modal extraction |
| 107 | Image blob storage | ✅ ImageBlobStore service | ❌ None | GAP | No image storage |
| 108 | Image fetching | ✅ ImageFetcher service | ❌ None | GAP | No image retrieval |
| 109 | Web content ingestion | ✅ JinaReaderClient + LinkIngestionService | ❌ None | GAP | No web scraping or link ingestion |
| 110 | Document classification | ✅ DocumentClassifier for chunking strategy | ❌ None | GAP | No document type classification |
| 111 | Content enrichment (LLM) | ✅ ContentEnrichmentAgent | ❌ None | GAP | No LLM-powered enrichment pass |
| 112 | Grounding / verification (ODKE+) | ✅ Grounder second-pass verification | ✅ GroundingService + ConfidenceFilter | FULL | `Grounding/GroundingService.ts` + `Grounding/ConfidenceFilter.ts` |
| 113 | NLP tokenization (wink-nlp) | ✅ Full NLP pipeline with BM25 | 🟡 NlpService with chunking and preprocessing | PARTIAL | `Nlp/NlpService.ts` - Has chunking but no dedicated BM25 scoring |
| 114 | Text chunking | ✅ Adaptive chunking strategies | ✅ NlpService chunking + TextChunk model | FULL | `Nlp/NlpService.ts` + `Nlp/TextChunk.ts` |
| 115 | Claim/Assertion curation | ✅ ClaimService, AssertionService, CurationService | ❌ None | GAP | No curation workflow for claims |
| 116 | Gmail extraction adapter | ❌ None | ✅ GmailExtractionAdapter | FULL | `adapters/GmailExtractionAdapter.ts` - Gmail-specific extraction integration (unique to knowledge-slice) |
| 117 | Ontology agent facade | ✅ OntologyAgent orchestration facade | ❌ None | GAP | No high-level orchestration facade |
| 118 | Embedding caching | ✅ EmbeddingService with cache layer | 🟡 Local cache key computation | PARTIAL | `Embedding/EmbeddingService.ts` - Has computeCacheKey but relies on DB repo for persistence, not in-memory cache |
| 119 | Embedding batching | ✅ Batch embedding requests | 🟡 Via @effect/ai EmbeddingModel | PARTIAL | Uses @effect/ai EmbeddingModel.embedAll but no explicit batching/chunking logic |
| 120 | Storage abstraction (GCS/Local/Memory) | ✅ StorageService with multiple backends | ❌ None | GAP | No abstracted storage service; uses PostgreSQL directly |
| 121 | Environment configuration service | ✅ ConfigService (env-based) | ✅ Via @beep/env package | FULL | Uses monorepo-wide environment configuration |

## Summary Statistics

| Category | Full | Partial | Gap | Total |
|----------|------|---------|-----|-------|
| Query & Reasoning | 10 | 3 | 12 | 25 |
| Entity Resolution | 19 | 3 | 1 | 23 |
| GraphRAG | 12 | 0 | 0 | 12 |
| Workflow Orchestration | 0 | 2 | 11 | 13 |
| RDF Infrastructure | 11 | 3 | 2 | 16 |
| Service Architecture | 8 | 4 | 4 | 16 |
| Content Processing & Enrichment | 5 | 4 | 7 | 16 |
| **Total** | **65** | **19** | **37** | **121** |

### Comparison with Previous Matrix (2026-02-03)

| Metric | Previous | Current | Delta |
|--------|----------|---------|-------|
| Total rows | 65 | 121 | +56 |
| Full parity | 18 (27%) | 65 (54%) | +47 |
| Partial | 8 (12%) | 19 (16%) | +11 |
| Gap | 40 (61%) | 37 (31%) | -3 |
| Service count (knowledge-slice) | ~15 | 35+ | +20 |

**Parity rate improved from 27% to 54%** once SPARQL, Reasoning, RDF, and expanded GraphRAG services were correctly accounted for.

## Priority Assessment

### Critical Gaps (P0 - Blocks Core Functionality)

1. **Durable Workflow Execution** - No fault tolerance, crash recovery, or resumability for long-running extraction pipelines
2. **Batch State Machine / Streaming** - No formal lifecycle tracking or real-time progress feedback for multi-stage pipelines
3. **SHACL Validation** - Cannot enforce ontology constraints; blocks quality assurance stage

### High Priority Gaps (P1 - Limits Capability)

1. **CircuitBreaker / Retry / Rate Limiting** - No resilience patterns for LLM calls; production reliability risk
2. **SPARQL DESCRIBE** - Missing query type limits entity exploration capability
3. **Cross-Batch Orchestration** - EntityRegistry handles resolution but no orchestration of multiple batch runs
4. **Event Bus** - No inter-service pub/sub communication

### Medium Priority Gaps (P2 - Enhances Quality)

1. **Multi-Ontology Registry** - Can only load one ontology at a time; limits multi-domain scenarios
2. **Content Enrichment / Image Extraction** - No multi-modal or LLM enrichment passes
3. **Document Classification** - No adaptive chunking strategy selection
4. **NL-to-SPARQL** - Users cannot query in natural language
5. **PROV-O / XSD Vocabulary** - Missing standardized vocabulary constants

### Low Priority / Design Divergences (P3)

1. **Oxigraph WASM vs sparqljs+N3.Store** - Architectural choice; sparqljs approach is lighter weight but less complete
2. **N3 Rule Parsing** - RDFS rules coded in TypeScript rather than parsed from Notation3; equivalent functionality
3. **Storage Abstraction** - PostgreSQL-only is appropriate for beep-effect monorepo context
4. **Claim/Assertion Curation** - Domain-specific workflow not yet needed

## Architectural Notes

### SPARQL Implementation Divergence

The `effect-ontology` uses Oxigraph WASM as a full SPARQL 1.1 engine. The `knowledge-slice` implements a custom query execution engine (`Sparql/QueryExecutor.ts`) that parses SPARQL via the `sparqljs` library and executes against an N3.Store. This covers SELECT, CONSTRUCT, and ASK queries with support for BGP, OPTIONAL, UNION, FILTER, BIND, and VALUES patterns. The custom FilterEvaluator (`Sparql/FilterEvaluator.ts`) handles common FILTER expressions. This approach is lighter weight but may not cover the full SPARQL 1.1 specification (notably missing DESCRIBE, UPDATE, property paths, and advanced aggregation).

### Reasoning Implementation Divergence

The `effect-ontology` uses the N3.js built-in Reasoner with multiple configurable profiles. The `knowledge-slice` implements a custom `ForwardChainer` (`Reasoning/ForwardChainer.ts`) that iteratively applies RDFS rules with provenance tracking, depth limits, and inference count limits. The rules themselves are coded in TypeScript (`Reasoning/RdfsRules.ts`) covering rdfs2 (domain), rdfs3 (range), rdfs7 (subproperty), and rdfs9 (subclass). This is functionally equivalent for RDFS reasoning but uses a different implementation strategy. The ForwardChainer's provenance tracking (mapping derived quad IDs to source quads and rule IDs) is well-suited for the ReasoningTraceFormatter in GraphRAG.

### Entity Resolution Maturity

Entity Resolution is the area of strongest parity. The `knowledge-slice` has 8 dedicated services covering the full lifecycle: extraction, clustering, canonical selection, splitting, merge history, incremental clustering, cross-batch registry (with BloomFilter for fast membership testing), and owl:sameAs link generation. The BloomFilter implementation is unique to `knowledge-slice` and provides O(1) probabilistic entity existence checking that the `effect-ontology` achieves through database queries.

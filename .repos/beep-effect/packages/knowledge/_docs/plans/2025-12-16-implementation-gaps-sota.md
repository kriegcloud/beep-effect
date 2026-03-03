# Implementation Gaps: SOTA Ontology Extraction

> **Created**: 2025-12-16
> **Status**: Analysis Complete
> **Related Issue**: effect-ontology-zwp
> **Reference**: `ontology_research/sota_review.md`

## Executive Summary

This document identifies gaps between the current implementation and state-of-the-art (SOTA) approaches for ontology-guided knowledge extraction. The analysis covers six key areas and provides prioritized recommendations for bridging these gaps.

**Overall Assessment**: The codebase has strong Effect-native foundations. Several critical P0 capabilities have been completed:

| Area | Status | Notes |
|------|--------|-------|
| Entity Resolution | ✅ Complete | Graph clustering wired into workflow |
| Embedding Cache | ✅ Complete | Content-addressable cache with hash keys |
| RRF Score Fusion | ✅ Complete | `Utils/Retrieval.ts` |
| Pre-computed Embeddings | ✅ Complete | `OntologyEmbeddings` blob pattern |
| SHACL Auto-generation | ✅ Complete | Full OWL→SHACL in `Shacl.ts:389-610` |
| SHACL Workflow Integration | ✅ Complete | `BatchWorkflow.ts`, `WorkflowOrchestrator.ts` |
| owl:sameAs generation | ✅ Complete | `RdfBuilder.addSameAsLinks()` called in `DurableActivities.ts:596` |

**Remaining P0 gaps**: None! All P0 critical gaps are complete.

---

## 1. Entity Resolution & Linking

### Current State

**✅ IMPLEMENTED AND WIRED INTO WORKFLOWS** (Updated 2025-12-16)

| Component | Location | Status |
|-----------|----------|--------|
| Graph-based clustering | `Workflow/EntityResolutionGraph.ts` | ✅ Implemented |
| Union-find clustering | `Workflow/EntityResolution.ts` | ✅ Implemented |
| Embedding-based similarity | `EntityResolutionGraph.ts:96-113` | ✅ Implemented |
| Blocking strategy | `EntityResolutionGraph.ts:119-195` | ✅ Implemented |
| EntityResolutionService | `Service/EntityResolution.ts` | ✅ Implemented |
| Workflow integration | `DurableActivities.ts:441-581` | ✅ Wired |

**Resolution Activity** (`makeResolutionActivity`) now properly uses graph-based clustering:

```typescript
// Current: Uses EntityResolutionService with graph clustering
const resolutionGraph = yield* entityResolution.resolve(
  knowledgeGraphs,
  defaultEntityResolutionConfig
)
// Rewrites entity IDs to canonical IDs
const canonicalId = resolutionGraph.canonicalMap[entity.id] ?? entity.id
```

### SOTA Gap Analysis

| SOTA Technique | Current | Gap |
|----------------|---------|-----|
| Graph-based clustering | ✅ Yes | Connected components implemented |
| Embedding-based blocking | ✅ Yes | K-NN similarity pre-filtering |
| Cross-document linking | ✅ Yes | Canonical ID remapping across docs |
| Leiden clustering | No | Uses `connectedComponents` (simpler) |
| Correlation clustering | No | Not implemented |
| LLM-assisted matching | No | No uncertain-case verification |
| owl:sameAs generation | ✅ Yes | `RdfBuilder.addSameAsLinks()` in `DurableActivities.ts:596` |

### Recommended Actions

**P0 (Critical)**: ✅ ALL COMPLETED
1. ~~Wire `buildEntityResolutionGraph()` into `makeResolutionActivity`~~ ✅ Done
2. ~~Preserve provenance: which document(s) each entity came from~~ ✅ Done (via canonical map)
3. ~~Generate `owl:sameAs` triples linking mentions to canonical entities~~ ✅ Done (`RdfBuilder.addSameAsLinks`)

**P1 (High)**:
1. Add LLM verification pass for low-confidence matches (similarity < 0.7)
2. Implement Leiden clustering as alternative to connected components (better for dense graphs)

**P2 (Medium)**:
6. Add correlation clustering for pairwise constraint satisfaction
7. Cross-document temporal ordering (prefer earlier mentions as canonical)

### Effort Estimate

| Task | Effort |
|------|--------|
| Wire clustering into workflow | 2-3 days |
| owl:sameAs generation | 1 day |
| LLM verification | 2-3 days |
| Leiden clustering | 1 week |

---

## 2. SHACL Validation

### Current State

**✅ FULLY IMPLEMENTED** (Updated 2025-12-18)

| Component | Location | Status |
|-----------|----------|--------|
| Validation engine | `Service/Shacl.ts` | ✅ Working (shacl-engine) |
| Shape loading from URI | `Shacl.ts:364-387` | ✅ Working |
| Auto-generate from ontology | `Shacl.ts:389-610` | ✅ **Full implementation** |
| Workflow integration | `BatchWorkflow.ts:97`, `WorkflowOrchestrator.ts:450` | ✅ Wired |
| Severity-based policy | `Shacl.ts:622-709` | ✅ `validateWithPolicy()` |
| Shape caching | `Shacl.ts:391-403` | ✅ By ontology content hash |

**The `generateShapesFromOntology` method provides full OWL→SHACL conversion:**

```typescript
// Shacl.ts:389-610 - Full implementation, not a stub
generateShapesFromOntology: (ontologyStore: RdfStore["_store"]) =>
  Effect.gen(function*() {
    // Check cache by ontology hash first
    const cacheKey = hashStore(ontologyStore)
    // ...
    // Converts: owl:Class → sh:NodeShape + sh:targetClass
    // Converts: owl:ObjectProperty + rdfs:domain/range → sh:property + sh:class
    // Converts: owl:DatatypeProperty → sh:property + sh:datatype
    // Converts: owl:FunctionalProperty → sh:maxCount 1
    // Converts: owl:Restriction (min/max/exact cardinality) → sh:minCount/sh:maxCount
  })
```

**Workflow Integration:**

```typescript
// BatchWorkflow.ts:97-103
const validationResult = yield* makeValidationActivity({
  batchId,
  resolvedGraphUri: resolutionResult.resolvedUri,
  ontologyUri: manifest.ontologyUri,
  shaclUri: manifest.shaclUri,  // Optional: use provided shapes
  validationPolicy: { failOnViolation: true, failOnWarning: false }
})
```

### SOTA Gap Analysis

| SOTA Technique | Current | Gap |
|----------------|---------|-----|
| shacl-engine validation | ✅ Yes | Working correctly |
| Auto-shape generation | ✅ Yes | Full OWL→SHACL conversion |
| Severity-based filtering | ✅ Yes | `validateWithPolicy()` with configurable thresholds |
| Shape caching | ✅ Yes | Content-addressable by ontology hash |
| Incremental validation | No | Full revalidation each time |

### Recommended Actions

**P0 (Critical)**: ✅ ALL COMPLETED
1. ~~Implement `generateShapesFromOntology`~~ ✅ Done (`Shacl.ts:389-610`)
2. ~~Wire into batch workflow~~ ✅ Done (`BatchWorkflow.ts:97`)
3. ~~Add severity-based workflow control~~ ✅ Done (`validateWithPolicy`)
4. ~~Cache generated shapes~~ ✅ Done (by ontology content hash)

**P2 (Medium)**:
1. Investigate incremental validation (UpSHACL pattern) for large graphs
2. Add more OWL pattern support (`owl:unionOf` → `sh:or`, etc.)

---

## 3. NLP/Embedding Decoupling

### Current State

**✅ EMBEDDING CACHE IMPLEMENTED** (Updated 2025-12-16)

| Component | Location | Status |
|-----------|----------|--------|
| EmbeddingService | `Service/Embedding.ts` | ✅ Cache-through wrapper |
| EmbeddingCache | `Service/EmbeddingCache.ts` | ✅ Content-addressable cache |
| NomicNlpService | `Service/NomicNlp.ts` | ✅ Local Nomic model |
| Hash utilities | `Utils/Hash.ts` | ✅ XXHash-based key generation |

**Current Architecture**: `EmbeddingService` now has cache-through behavior:

```typescript
export const EmbeddingServiceLive = Layer.effect(
  EmbeddingService,
  Effect.gen(function*() {
    const nomic = yield* NomicNlpService
    const cache = yield* EmbeddingCache
    return {
      embed: (text, taskType = "search_document") =>
        Effect.gen(function*() {
          const hash = yield* hashEmbeddingKey(text, taskType)
          const cached = yield* cache.get(hash)
          if (Option.isSome(cached)) return cached.value
          const embedding = yield* nomic.embed(text, taskType)
          yield* cache.set(hash, embedding)
          return embedding
        }),
      cosineSimilarity: nomic.cosineSimilarity
    }
  })
)
```

### SOTA Gap Analysis

| SOTA Technique | Current | Gap |
|----------------|---------|-----|
| Nomic embeddings | ✅ Yes | Working |
| Embedding cache | ✅ Yes | Content-addressable by hash |
| Model selection | No | Hardcoded to Nomic |
| Batch embedding | Partial | Concurrency but not true batching |
| Per-mention retrieval | No | Per-chunk only |

### Recommended Actions

**P0 (Critical)**: ✅ COMPLETED
1. ~~Add embedding cache layer~~ ✅ Done (`EmbeddingCache` service)

**P1 (High)**:
2. Add model selection to ConfigService:
   - `EMBEDDING_MODEL`: nomic | bge-m3 | e5-large
3. Implement true batch embedding API:
   ```typescript
   embedBatch: (texts: Array<string>) => Effect<Array<Embedding>>
   ```

**P2 (Medium)**:
4. Decouple embedding service for horizontal scaling (separate process/container)
5. Add per-mention retrieval mode (extract mentions → embed → retrieve per mention)

### Effort Estimate

| Task | Effort |
|------|--------|
| Embedding cache (in-memory) | 1-2 days |
| Embedding cache (persistent) | 2-3 days |
| Model selection | 1 day |
| Batch API | 1 day |
| Per-mention retrieval | 3-5 days |

---

## 4. Retrieval Improvements

### Current State

**✅ RRF IMPLEMENTED** (Updated 2025-12-16)

| Component | Location | Status |
|-----------|----------|--------|
| BM25 search | `Service/Nlp.ts:238-276` | ✅ Working |
| Semantic search | `Service/Nlp.ts:289-332` | ✅ Working |
| RRF utilities | `Utils/Retrieval.ts` | ✅ Implemented |
| Hybrid search | `Service/OntologyLoader.ts` | ✅ Uses RRF fusion |

**Current RRF implementation** (`Utils/Retrieval.ts`):
```typescript
export const rrfScore = (ranks: ReadonlyArray<number>, k: number = 60): number =>
  ranks.reduce((sum, rank) => sum + 1 / (k + rank), 0)

export const rrfFusion = <T extends { id: string }>(
  rankedLists: ReadonlyArray<ReadonlyArray<T>>,
  k: number = 60
): ReadonlyArray<T & { rrfScore: number }> => {
  // Combines multiple ranked lists using RRF scores
  // Returns results sorted by descending RRF score
}
```

### SOTA Gap Analysis

| SOTA Technique | Current | Gap |
|----------------|---------|-----|
| BM25 | ✅ Yes | Working |
| Semantic search | ✅ Yes | Working |
| Reciprocal Rank Fusion | ✅ Yes | `rrfFusion` utility |
| Reranking | No | Not implemented |
| Contextual retrieval | No | No chunk context prepending |
| Lemmatization | No | Tokenization only |
| Query expansion | No | Raw query only |

### Recommended Actions

**P0 (Critical)**: ✅ COMPLETED
1. ~~Implement RRF score fusion~~ ✅ Done (`Utils/Retrieval.ts`)

**P1 (High)**:
2. Add lemmatization to BM25 preprocessing (wink-nlp has `.out(its.lemma)`)
3. Implement reranking pass (cross-encoder or LLM-based)
4. Add ontology-aware query expansion (synonyms from SKOS labels)

**P2 (Medium)**:
5. Implement contextual retrieval (prepend document context to chunks)
6. Three-stage pipeline: retrieve (50) → rerank (10) → LLM

### Effort Estimate

| Task | Effort |
|------|--------|
| RRF implementation | 1 day |
| Lemmatization | 1 day |
| Query expansion | 2 days |
| Reranking | 3-5 days |
| Contextual retrieval | 2-3 days |

---

## 5. Prompting & LLM Integration

### Current State

| Component | Location | Status |
|-----------|----------|--------|
| Prompt generation | `Prompt/PromptGenerator.ts` | Working |
| RuleSet patterns | `Prompt/RuleSet.ts` | Working |
| Ontology context | `PromptGenerator.ts:23-34` | Working |
| JSON schema output | `Service/Extraction.ts` | Using @effect/ai |

### SOTA Gap Analysis

| SOTA Technique | Current | Gap |
|----------------|---------|-----|
| Structured prompts | Yes | Working |
| Ontology class descriptions | Yes | Included |
| Property constraints | Yes | Domain/range included |
| Few-shot examples | No | No exemplars |
| Self-critique/verification | No | Single pass only |
| Domain/range enforcement | Partial | In prompt but not validated |
| CQ-driven prompts | No | No competency questions |

### Recommended Actions

**P1 (High)**:
1. Add few-shot exemplars to prompts:
   - Store gold examples per ontology
   - Select relevant examples based on input similarity

2. Implement self-critique pass:
   ```typescript
   // After extraction
   yield* verifyExtraction(entities, relations, sourceText)
   // "Review these extractions. Are any incorrect or missing?"
   ```

3. Add domain/range validation post-extraction:
   - Check each relation's subject type matches property domain
   - Check object type matches property range

**P2 (Medium)**:
4. Implement CQ-driven prompting (competency questions from SKOS examples)
5. Add confidence scores to extractions
6. Chain-of-thought extraction for complex relations

### Effort Estimate

| Task | Effort |
|------|--------|
| Few-shot exemplars | 2-3 days |
| Self-critique pass | 2 days |
| Domain/range validation | 1-2 days |
| Confidence scoring | 2 days |

---

## 6. Provenance & Data Quality

### Current State

| Component | Location | Status |
|-----------|----------|--------|
| Chunk index on entities | `Domain/Model/Entity.ts` | Optional field |
| Source text reference | `KnowledgeGraph.sourceText` | Full text only |
| Named graphs | N/A | Not implemented |
| Confidence scores | N/A | Not implemented |

### SOTA Gap Analysis

| SOTA Technique | Current | Gap |
|----------------|---------|-----|
| Chunk-level provenance | Partial | Index only, not IRI |
| Named graphs | No | All triples in default graph |
| RDF-star annotations | No | Not implemented |
| Confidence scores | No | Not captured |
| Datatype normalization | Partial | Basic only |

### Recommended Actions

**P1 (High)**:
1. Implement named graphs for provenance:
   ```turtle
   GRAPH <batch-123/doc-456/chunk-0> {
     ex:Arsenal a :FootballClub .
   }
   ```

2. Add confidence scores as RDF-star or separate triples:
   ```turtle
   << ex:Arsenal :playsIn :PremierLeague >> :confidence 0.95 .
   ```

**P2 (Medium)**:
3. Normalize datatypes on ingestion:
   - Dates → xsd:date
   - Numbers → xsd:decimal/xsd:integer
   - Booleans → xsd:boolean

4. Add extraction run metadata:
   - Model used
   - Timestamp
   - Input document hash

### Effort Estimate

| Task | Effort |
|------|--------|
| Named graphs | 2-3 days |
| Confidence scores | 2 days |
| Datatype normalization | 1-2 days |
| Extraction metadata | 1 day |

---

## Prioritized Implementation Roadmap

### Phase 1: Critical Gaps (1-2 weeks)

| Priority | Task | Effort | Status |
|----------|------|--------|--------|
| P0-1 | Wire entity resolution into workflow | 2-3 days | ✅ Complete |
| P0-2 | Implement `generateShapesFromOntology` | 2-3 days | ✅ Complete |
| P0-2b | Wire SHACL into batch workflow | 1 day | ✅ Complete |
| P0-3 | Add embedding cache | 1-2 days | ✅ Complete |
| P0-4 | Implement RRF score fusion | 1 day | ✅ Complete |
| P0-5 | Pre-computed ontology embeddings | 2-3 days | ✅ Complete |

### Phase 2: High Priority (2-3 weeks)

| Priority | Task | Effort | Status |
|----------|------|--------|--------|
| P1-1 | Generate owl:sameAs triples | 1 day | ✅ Complete |
| P1-2 | LLM verification for uncertain matches | 2-3 days | Open |
| P1-3 | Few-shot exemplars in prompts | 2-3 days | Open |
| P1-4 | Lemmatization in BM25 | 1 day | Open |
| P1-5 | Named graphs for provenance | 2-3 days | Open |
| P1-6 | Self-critique extraction pass | 2 days | Open |

### Phase 3: Medium Priority (3-4 weeks)

| Priority | Task | Effort | Dependencies |
|----------|------|--------|--------------|
| P2-1 | Leiden clustering | 1 week | P0-1 |
| P2-2 | Reranking pass | 3-5 days | P0-4 |
| P2-3 | Per-mention retrieval | 3-5 days | P0-3 |
| P2-4 | Contextual retrieval | 2-3 days | P0-3 |
| P2-5 | Model selection config | 1 day | P0-3 |

---

## Dependencies Graph

```
                     ┌─────────────────────┐
                     │  P0-1: Wire ER      │
                     │  into workflow      │
                     └──────────┬──────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
     ┌────────────────┐ ┌──────────────┐ ┌───────────────┐
     │ P1-1: owl:sameAs│ │P1-2: LLM     │ │P2-1: Leiden   │
     │ generation     │ │verification  │ │clustering     │
     └────────────────┘ └──────────────┘ └───────────────┘

     ┌─────────────────┐
     │ P0-3: Embedding │
     │ cache           │
     └────────┬────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│P2-3:    │ │P2-4:    │ │P2-5:    │
│Per-     │ │Context  │ │Model    │
│mention  │ │retrieval│ │selection│
└─────────┘ └─────────┘ └─────────┘

     ┌─────────────────┐
     │ P0-4: RRF       │
     │ fusion          │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │ P2-2: Reranking │
     └─────────────────┘
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Entity resolution slows batch processing | High | Add concurrency controls, test with large batches |
| SHACL shape generation too restrictive | Medium | Start with warnings-only mode |
| Embedding cache memory growth | Medium | Add TTL, consider Redis/persistent cache |
| LLM verification increases cost | High | Only verify low-confidence matches |

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Entity resolution F1 | Unknown | >0.85 | Gold standard test set |
| SHACL conformance rate | N/A | >95% | Validation reports |
| Retrieval precision@10 | Unknown | >0.70 | Manual evaluation |
| Extraction accuracy | Unknown | >0.80 | Gold standard test set |
| Processing time/doc | ~5s | <3s | Benchmark suite |

---

## Appendix: Code Locations

| Component | File | Key Functions |
|-----------|------|---------------|
| Entity clustering | `Workflow/EntityResolutionGraph.ts` | `clusterEntities`, `buildEntityResolutionGraph` |
| Resolution activity | `Workflow/DurableActivities.ts:312-372` | `makeResolutionActivity` |
| SHACL service | `Service/Shacl.ts` | `validate`, `generateShapesFromOntology` |
| Embedding service | `Service/Embedding.ts` | `embed`, `cosineSimilarity` |
| Hybrid search | `Service/Ontology.ts:595+` | `searchClassesHybrid` |
| Prompt generation | `Prompt/PromptGenerator.ts` | `generateEntityPrompt`, `generateRelationPrompt` |
| RDF builder | `Service/Rdf.ts` | `addEntities`, `addRelations`, `toTurtle` |

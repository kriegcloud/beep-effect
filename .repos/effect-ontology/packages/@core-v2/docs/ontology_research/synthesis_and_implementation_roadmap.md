# Synthesis: SOTA Review and Implementation Roadmap

**Date**: December 11, 2025
**Purpose**: Consolidate research findings into actionable implementation priorities for the Effect-TS ontology extraction pipeline.
**See Also**: [`sota_review.md`](./sota_review.md) for detailed analysis and gap assessment

---

## Executive Summary

This document synthesizes findings from four research areas:
1. **Entity Resolution & Clustering** - Blocking, matching, clustering algorithms, owl:sameAs management
2. **SHACL Validation & RDF Reasoning** - Production validators, incremental validation, provenance tracking
3. **NLP & Retrieval** - Hybrid search, embeddings, chunking strategies, per-mention retrieval
4. **LLM Prompting** (partial) - Few-shot patterns, validation feedback loops

### Key Finding: Current Pipeline Gaps

| Component | Current State | Gap | Priority |
|-----------|--------------|-----|----------|
| Entity Resolution | Concatenates Turtle files (stub) | No clustering, no sameAs | **Critical** |
| SHACL Validation | Returns `conforms: true` (stub) | No actual validation | **Critical** |
| Hybrid Search | BM25 + embeddings | No RRF fusion, no hierarchy expansion | **High** |
| Provenance | Chunk metadata not persisted | No named graphs or RDF-star | **High** |
| Datatype Handling | Untyped literals | No normalization, no range checks | **Medium** |
| Retrieval Granularity | Chunk-level aggregation | Should be per-mention | **Medium** |

---

## Top 10 Takeaways

### 1. Replace SHACL Stub with shacl-engine (15-26x Faster)

**Finding**: `shacl-engine` outperforms `rdf-validate-shacl` and pyshacl by 15-26x through optimized caching.

**Action**: Swap the stub in `src/Service/Rdf.ts` with:
```typescript
import SHACLValidator from 'shacl-engine'
import rdf from 'rdf-ext'

const validator = new SHACLValidator(shapesGraph, { factory: rdf })
const report = await validator.validate({ dataset: dataGraph })
```

**Effort**: 1-2 days | **Impact**: Catches invalid triples, prevents downstream errors

---

### 2. Wire Real Entity Resolution Using Leiden Clustering

**Finding**: The existing `EntityResolutionGraph.ts` has embedding-based blocking and graph clustering ready but isn't connected to the workflow.

**Action**: Replace the resolution activity stub with:
- Embedding-based blocking (k-NN with E5/BGE)
- Leiden clustering (guarantees connected clusters, unlike Louvain)
- Canonical URI generation with owl:sameAs links

**Effort**: 1-2 weeks | **Impact**: Eliminates duplicate entities across documents

---

### 3. Implement Reciprocal Rank Fusion (RRF) for Hybrid Search

**Finding**: RRF consistently outperforms complex score normalization by using rank-based aggregation:
```
score = Σ (1 / (rank_i + 60))
```

**Action**: Replace current hybrid fusion in `NlpService` with RRF algorithm.

**Effort**: 2 days | **Impact**: 25-49% retrieval improvement (documented in Anthropic contextual retrieval study)

---

### 4. Add Ontology Class Hierarchy Expansion for Query Recall

**Finding**: Expanding queries with parent/child classes and synonyms (rdfs:label, skos:altLabel) significantly improves recall.

**Action**: Before retrieval, expand search terms with:
- Synonyms from ontology labels (weight 0.9)
- Parent classes (weight 0.5)
- Child classes (weight 0.6)
- Control traversal depth to 1-2 levels to prevent drift

**Effort**: 3 days | **Impact**: Better ontology class matching, especially for general/specific queries

---

### 5. Materialize Provenance Using Named Graphs

**Finding**: Named graphs for chunk-level provenance are mature and well-supported in N3.js. RDF-star (RDF 1.2) is ideal for fine-grained confidence scores but has limited store support.

**Action**: Serialize extracted triples into TriG format with named graphs:
```turtle
:doc1#chunk5 {
  :Alice a :Person ;
         :name "Alice Johnson" .
}
:doc1#chunk5 prov:wasGeneratedBy :extractionRun42 ;
             :chunkId "chunk5" ;
             :confidence 0.92 .
```

**Effort**: 1-2 days | **Impact**: Enable source tracking, debugging, confidence filtering

---

### 6. Add Datatype Normalization and Validation

**Finding**: Use `rdf-validate-datatype` for literal format checking and coerce values based on ontology property ranges.

**Action**:
1. Infer expected datatype from property range
2. Normalize dates to ISO 8601, integers to xsd:integer, etc.
3. Validate with `rdf-validate-datatype` before RDF creation

**Effort**: 3-5 days | **Impact**: Enables downstream SHACL validation to succeed

---

### 7. Deploy Contextual Retrieval (Anthropic Pattern) with Prompt Caching

**Finding**: Prepending chunk-specific context (50-100 tokens) before embedding yields 35% retrieval failure reduction. Combined with BM25 and reranking: 67% reduction.

**Action**: During indexing, use LLM to generate context for each chunk:
```
"This chunk is from the Q2 2024 earnings report for TechCorp, discussing financial performance."
```
Use prompt caching to amortize LLM cost (~$1.02 per million document tokens).

**Effort**: 1 week | **Impact**: Significantly better retrieval for ambiguous chunks

---

### 8. Move from Chunk-Level to Per-Mention Retrieval

**Finding**: Single aggregated query per chunk loses precision. Per-mention retrieval with sentence context improves entity-to-class mapping.

**Action**: Refactor extraction flow:
```typescript
// Instead of aggregating all mentions
const perMentionClasses = await Promise.all(
  mentions.map(m => findCandidateClasses(m.text, { context: m.sentenceContext }))
)
```

**Effort**: 1 week | **Impact**: More accurate ontology class assignment

---

### 9. Add Lemmatization Preprocessing for BM25 and ID Generation

**Finding**: Lemmatization improves recall on ontology matching and normalizes entity mentions for consistent ID generation.

**Action**: Integrate `wink-nlp` or `compromise.js` for lemmatization before BM25 indexing and querying.

**Effort**: 2 days | **Impact**: Better recall, more consistent entity identifiers

---

### 10. Use LLM Verification for Uncertain Entity Matches

**Finding**: When embedding similarity is 0.5-0.8 (uncertain zone), LLM verification with few-shot examples achieves higher accuracy than threshold-only decisions. GPT-4 outperforms fine-tuned BERT by 40-68% F1 on cross-dataset entity matching.

**Action**: In entity resolution, route uncertain matches to LLM verification:
```typescript
if (similarity > 0.8) return { isMatch: true }
if (similarity < 0.5) return { isMatch: false }
return verifyMatchWithLLM(pair) // Ask LLM for uncertain range
```

**Effort**: 1 week | **Impact**: Higher precision entity resolution without labeled training data

---

## Quick Wins: Immediate Implementation (Week 1-2)

These require minimal architectural changes and have documented high ROI:

| Item | Effort | Impact | Files to Change |
|------|--------|--------|-----------------|
| 1. Replace SHACL stub with shacl-engine | 1-2 days | High | `src/Service/Rdf.ts` |
| 2. Implement RRF for hybrid search | 2 days | High | `src/Service/Nlp.ts` |
| 3. Add lemmatization preprocessing | 2 days | Medium | `src/Service/Nlp.ts` |
| 4. Materialize provenance (named graphs) | 1-2 days | Medium | `src/Workflow/DurableActivities.ts` |
| 5. Add datatype validation | 2-3 days | Medium | `src/Service/Extraction.ts` |
| 6. Enable embedding cache with versioning | 3 days | High (cost) | `src/Service/Embedding.ts` (new) |

**Total Estimated Time**: 2 weeks
**Expected Impact**:
- SHACL validation live (catches invalid data)
- 30-40% retrieval improvement
- Significant cost reduction from caching
- Provenance tracking enabled

---

## Short-Term Improvements (Weeks 3-6)

| Item | Effort | Impact | Notes |
|------|--------|--------|-------|
| Wire entity resolution into workflow | 1-2 weeks | Critical | Use existing `EntityResolutionGraph.ts` |
| Generate SHACL shapes from ontology | 3-5 days | High | Use Astrea tool, then manually refine |
| Implement ontology hierarchy expansion | 3 days | Medium | Parent/child/synonym expansion |
| Add per-mention retrieval | 1 week | Medium | Replace chunk-level aggregation |
| Implement RDFS reasoning (N3.js) | 1 week | Medium | Domain/range type propagation |
| Add cross-encoder reranking | 1 week | Medium | Three-stage retrieval pipeline |

---

## Medium-Term Enhancements (Months 2-3)

| Item | Effort | Impact | Notes |
|------|--------|--------|-------|
| Supervised contrastive blocking (SC-Block) | 2-3 weeks | High | 4x speedup, requires labeled pairs |
| Contextual retrieval (Anthropic pattern) | 1 week | High | LLM-generated chunk context |
| LLM verification for uncertain matches | 1 week | Medium | Hybrid embedding + LLM matching |
| Incremental validation (UpSHACL pattern) | 2-3 weeks | Medium | 10x speedup on updates |
| Property-specific conflict resolution | 1 week | Medium | Configure per ontology property |
| External KB linking (Wikidata pilot) | 2 weeks | Medium | Canonical IDs from authority |

---

## Long-Term Architecture (Months 4-6)

| Item | Effort | Impact | Notes |
|------|--------|--------|-------|
| Late chunking | 2 weeks | Medium | Embed full text, chunk during pooling |
| GraphRAG multi-hop retrieval | 3 weeks | Medium | Knowledge graph traversal |
| RDF-star for confidence scores | 1 week | Medium | When N3.js store supports it |
| External reasoner (RDFox API) | 2-3 weeks | Medium | For >1M triple graphs |
| Correlation clustering | 2 weeks | Medium | Better than Leiden for noisy matches |
| Interactive resolution UI | 3-4 weeks | Medium | Human-in-the-loop for conflicts |

---

## Architecture Patterns

### Service Layer (Effect-TS)

```typescript
// New/Updated Services
interface SHACLService {
  validate: (data: Store, shapes: Store) => Effect.Effect<ValidationReport, ValidationError>
}

interface EntityResolutionService {
  block: (entities: Entity[], k: number) => Effect.Effect<CandidatePair[], BlockingError>
  match: (candidates: CandidatePair[], threshold: number) => Effect.Effect<EntityPair[], MatchingError>
  cluster: (matches: EntityPair[], algo: ClusterAlgorithm) => Effect.Effect<EntityCluster[], ClusterError>
  canonicalize: (clusters: EntityCluster[]) => Effect.Effect<CanonicalEntity[], CanonicalError>
}

interface EmbeddingService {
  embed: (texts: string[], mode: 'semantic' | 'clustering') => Effect.Effect<Embedding[], EmbeddingError>
  clearCache: () => Effect.Effect<void, never>
}

interface ReasoningService {
  materialize: (data: Store, rules: RDFSRules) => Effect.Effect<Store, ReasoningError>
}
```

### Multi-Stage Retrieval Pipeline

```
Stage 1: Fast Retrieval (top 150)
├── BM25 with lemmatization
├── Dense embeddings (BGE-M3/Nomic)
├── Ontology hierarchy expansion
└── RRF fusion

Stage 2: Reranking (top 20)
├── Cross-encoder OR ColBERT
└── Score each candidate in detail

Stage 3: LLM Generation
├── Pass top results with context
└── Generate extraction with validation
```

### Entity Resolution Pipeline

```
Phase 1: Blocking
├── Embedding-based k-NN (k=10)
├── Optional: SC-Block for labeled data
└── Output: Candidate pairs

Phase 2: Matching
├── High confidence (>0.8): Accept
├── Low confidence (<0.5): Reject
├── Uncertain (0.5-0.8): LLM verification
└── Output: Matched pairs

Phase 3: Clustering
├── Leiden algorithm (guarantees connected)
├── Generate canonical URIs (UUID)
└── Output: Entity clusters

Phase 4: Merge
├── Property-specific conflict resolution
├── Generate owl:sameAs links
└── Attach provenance metadata
```

---

## Technology Stack Recommendations

### JavaScript/TypeScript Libraries

| Component | Recommended | Alternative | Notes |
|-----------|-------------|-------------|-------|
| SHACL Validation | shacl-engine | rdf-validate-shacl | 15-26x faster |
| RDF Parsing | N3.js | Oxigraph | Mature, RDF-star support |
| SPARQL Queries | Comunica | - | Modular, TypeScript |
| RDFS Reasoning | N3.js Reasoner | EYE-JS | <0.1s for typical datasets |
| Datatype Validation | rdf-validate-datatype | - | Per-literal format check |
| NLP (lemmatization) | wink-nlp | compromise.js | Lightweight, production-ready |
| Sentence Splitting | compromise.js | wtpsplit (Python) | Adequate for most cases |
| Vector Search | pgvector (PostgreSQL) | Vectra (file-based) | Production vs. development |

### Embedding Models

| Model | Dimensions | Multilingual | Context | Best For |
|-------|-----------|--------------|---------|----------|
| BGE-M3 | Higher | 100+ languages | 8192 | Best multilingual, multi-functionality |
| Nomic v1.5 | 768 | English | Standard | Lightweight, open source |
| E5-large | 768 | English | Standard | Enterprise quality |

**Recommendation**: BGE-M3 for production (multilingual + multi-vector support), Nomic for cost-sensitive development.

---

## Success Metrics

### Quantitative Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| SHACL validation rate | >90% conforming | Triples passing validation |
| Entity resolution precision | >0.90 | Manual evaluation on gold set |
| Entity resolution recall | >0.85 | Manual evaluation on gold set |
| Retrieval recall@20 | >0.95 | Relevant class in top 20 |
| Blocking reduction ratio | >0.99 | Candidate pairs / total pairs |
| Embedding cache hit rate | >80% | Cache hits / total requests |

### Qualitative Targets

- No obvious duplicates in output graphs
- Conflicting attributes resolved sensibly
- Canonical entities have complete properties
- sameAs links traceable to evidence
- Provenance available for all triples

---

## GCP Deployment Architecture

### Services

| Service | Resource | Purpose |
|---------|----------|---------|
| core-api | Cloud Run | HTTP + SSE API |
| batch-worker | Cloud Run | Workflow engine |
| er-validator | Cloud Run Job | Entity resolution + SHACL |
| embedding-service | Cloud Run | Centralized embeddings |

### Storage

| Resource | Purpose |
|----------|---------|
| PostgreSQL (Cloud SQL) | Workflow state, entity clusters, pgvector |
| GCS buckets | Documents, graphs, reports |
| Redis (Memorystore) | Embedding cache |

### Configuration

```hcl
# infra/modules/cloud-run/main.tf additions
resource "google_cloud_run_service" "er_validator" {
  name = "er-validator"
  template {
    spec {
      containers {
        image = "gcr.io/${var.project}/er-validator"
        resources {
          limits = { memory = "4Gi", cpu = "2" }
        }
      }
    }
  }
}

resource "google_cloud_run_service" "embedding_service" {
  name = "embedding-service"
  template {
    spec {
      containers {
        image = "gcr.io/${var.project}/embedding-service"
        resources {
          limits = { memory = "2Gi", cpu = "1" }
        }
      }
    }
  }
}
```

---

## Implementation Checklist

### Phase 1: Quick Wins (Week 1-2)
- [ ] Replace SHACL stub with shacl-engine
- [ ] Implement RRF for hybrid search
- [ ] Add lemmatization preprocessing
- [ ] Materialize provenance in named graphs
- [ ] Add datatype validation
- [ ] Set up embedding cache with versioning
- [ ] Create evaluation dataset (50-100 annotated samples)

### Phase 2: Core Resolution (Week 3-6)
- [ ] Wire entity resolution into workflow
- [ ] Generate SHACL shapes from ontology (Astrea)
- [ ] Implement ontology hierarchy expansion
- [ ] Add per-mention retrieval
- [ ] Implement RDFS reasoning (N3.js)
- [ ] Add cross-encoder reranking
- [ ] Set up metrics dashboard

### Phase 3: Production Hardening (Month 2-3)
- [ ] Deploy embedding service (Cloud Run)
- [ ] Implement LLM verification for uncertain matches
- [ ] Add incremental validation (UpSHACL pattern)
- [ ] Property-specific conflict resolution
- [ ] External KB linking pilot (Wikidata)
- [ ] Performance testing (1M+ entities)

### Phase 4: Advanced (Month 4-6)
- [ ] Late chunking implementation
- [ ] GraphRAG multi-hop retrieval
- [ ] RDF-star confidence scores
- [ ] External reasoner integration
- [ ] Correlation clustering
- [ ] Interactive resolution UI

---

## Sources

Full citations available in the individual research documents:
- `entity_resolution_clustering_research.md` - 50+ sources on ER/clustering
- `rdf_shacl_reasoning_research.md` - 70+ sources on SHACL/reasoning/provenance
- `advanced_retrieval_nlp_research.md` - 80+ sources on retrieval/NLP/chunking

---

## Appendix: File Mapping

| Recommendation | Files to Modify |
|----------------|-----------------|
| SHACL validation | `src/Service/Rdf.ts` |
| Entity resolution | `src/Workflow/DurableActivities.ts`, `src/Workflow/EntityResolutionGraph.ts` |
| RRF hybrid search | `src/Service/Nlp.ts` |
| Hierarchy expansion | `src/Service/Ontology.ts`, `src/Service/Nlp.ts` |
| Provenance | `src/Workflow/DurableActivities.ts`, `src/Service/Rdf.ts` |
| Datatype normalization | `src/Service/Extraction.ts` |
| Embedding service | NEW: `src/Service/Embedding.ts` |
| Per-mention retrieval | `src/Workflow/StreamingExtraction.ts`, `src/Service/Nlp.ts` |
| Lemmatization | `src/Service/Nlp.ts` |
| LLM verification | `src/Service/Extraction.ts`, `src/Workflow/EntityResolutionGraph.ts` |

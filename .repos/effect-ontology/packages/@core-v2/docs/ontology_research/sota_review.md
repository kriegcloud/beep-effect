# SOTA Review: NLP/LLM Extraction, Entity Resolution, and RDF Handling

**Last Updated**: December 11, 2025
**Status**: Expanded with primary source research

## Scope and Constraints
- Reviewed local research docs: `packages/@core-v2/docs/ontology_research/llm_owl.md` and `packages/@core-v2/docs/ontology_research/prod_owl_rdf_pipelines.md`.
- Code and workflows examined across `packages/@core-v2/src` (prompting, extraction services, resolution, RDF services, durable activities).
- **Primary source research conducted** on Entity Resolution, SHACL/RDF handling, and NLP/Retrieval (December 2025). See detailed documents:
  - `entity_resolution_clustering_research.md` - 50+ sources on ER/clustering algorithms
  - `rdf_shacl_reasoning_research.md` - 70+ sources on SHACL validation and provenance
  - `advanced_retrieval_nlp_research.md` - 80+ sources on retrieval and NLP techniques
  - `synthesis_and_implementation_roadmap.md` - Consolidated implementation priorities

## Research Doc Takeaways (Local)
- **LLM ↔ OWL**: Emphasizes prompt-constrained extraction/generation (local names, Turtle/JSON-LD output), few-shot and decomposed prompting, and validation loops (RDFLib/Owlready2 + feedback). Highlights RAG over ontology modules, memoryless CQ-by-CQ and Ontogenia-style iterative refinement, and structured outputs to bound hallucinations.
- **Pipelines (RDF/OWL/SHACL)**: Advocates incremental ingestion + reasoning + SHACL validation, entity consolidation before validation, and provenance via named graphs/RDF-star. Notes industrial patterns: incremental SHACL (GraphDB), DRed incremental reasoning (RDFox), SPARQL for transforms, and RDF/JS tooling (N3.js, Comunica, rdf-validate-shacl).

## Implementation Review
- **NLP + Retrieval** (`src/Service/Nlp.ts`, `Workflow/StreamingExtraction.ts`):
  - Sentence-aware chunking with overlap and hybrid class search (BM25 + embeddings via Nomic) on aggregated mentions per chunk. Good guardrails (timeouts, fallbacks), but retrieval is coarse: single aggregated query per chunk, no per-mention/topical RAG, and no subclass/parent expansion for recall.
- **Prompting & LLM Contracts** (`src/Prompt/PromptGenerator.ts`, `src/Prompt/RuleSet.ts`, `src/Service/Extraction.ts`):
  - Strong schema-prompt alignment: local-name outputs, rule sets, JSON Schema decoding with feedback/retry, and logging/telemetry. Grounder re-verifies relations with a second LLM pass.
  - Gaps: no few-shot/CQ-driven variants, no self-check traces, and prompts don’t carry per-class examples or property-specific constraints (domains/ranges not enforced in prompts beyond listing). Mention extraction is single-shot without context retrieval.
- **Entity/Relation Extraction** (`src/Service/Extraction.ts`):
  - Entities: candidate classes scoped via hybrid search; datatype properties fetched but only filtered post-hoc. Attribute validation is minimal (presence in provided datatype props), no type/range coercion, no literal normalization.
  - Relations: schema enforces allowed predicates and entity IDs, but domain/range compatibility is not checked post-LLM; datatype values are untyped literals. Grounding filters relations but not entity attributes.
- **Entity Resolution & Clustering**:
  - Two implementations exist: a simple similarity merge (`Workflow/EntityResolution.ts`) and an embedding/blocking-based graph clustering with Effect Graph (`Workflow/EntityResolutionGraph.ts`), including provenance-friendly models in `Domain/Model/EntityResolution*.ts`.
  - **Not wired into workflows**: streaming extraction stops at merge-by-id; durable resolution activity only concatenates Turtle and reports counts—no clustering, sameAs mapping, or relation re-pointing.
- **RDF Graph Handling** (`src/Service/Rdf.ts`, `src/Service/Ontology.ts`):
  - Ontology parsing covers labels/domains/ranges/hierarchies; RdfBuilder wraps N3 for parse/serialize and graph construction.
  - SHACL validation is a placeholder returning `conforms: true`; no OWL/RDFS reasoning or functional-property enforcement. Provenance fields (chunkId/chunkIndex) are not materialized into RDF (no named graphs/RDF-star).
- **Activity/Workflow Layer** (`src/Workflow/StreamingExtraction.ts`, `src/Workflow/DurableActivities.ts`, `src/Workflow/BatchWorkflow.ts`):
  - Streaming pipeline aligns with the functional spec (chunk → hybrid retrieval → entities → properties → relations → grounder → merge). Good failure handling for systemic errors.
  - Durable workflow (batch) runs extraction → “resolution” → validation → ingestion, but resolution is a noop merge of Turtle files and validation uses the SHACL stub, so downstream graphs can accumulate duplicates and invalid triples unchecked.

## Gaps and Risks
- No end-to-end entity resolution or cross-document linking in production workflows; duplicates and conflicting relations will persist.
- Validation is ineffective: SHACL stub and no reasoning; domain/range/functional constraints are never enforced.
- Provenance is not persisted in RDF; chunk-level metadata is dropped when serializing.
- Retrieval/prompting do not leverage competency questions, design patterns, or per-mention RAG as suggested by the research docs; recall and precision likely suffer.
- Relation extraction does not enforce ontology domain/range or datatype normalization; attribute literals remain untyped.

## Recommendations (Prioritized)
1) **Wire real ER + linking into workflows**: Replace the resolution activity with the graph-based clustering (`Workflow/EntityResolutionGraph.ts`) to emit canonical IDs, sameAs mappings, and remap relations; persist mappings for downstream merges.
2) **Introduce actual SHACL + light reasoning**: Integrate a validator (e.g., rdf-validate-shacl or pyshacl) in `RdfBuilder.validate` and enforce domain/range/functional constraints; run post-resolution and pre-ingestion. Add optional RDFS/OWL-RL materialization for type propagation.
3) **Upgrade prompts and retrieval**: Add per-mention RAG over ontology modules + few-shot exemplars; include domain/range cues and examples in prompts; adopt CQ-by-CQ or Ontogenia-style iterative prompts for complex docs; surface self-check/critique before acceptance.
4) **Provenance and typing in RDF**: Emit named graphs or RDF-star annotations carrying chunkId/chunkIndex and source doc; normalize literals with datatypes; attach confidence scores from grounder and ER.
5) **Attribute and relation normalization**: Enforce datatype ranges (dates/numbers/booleans), coerce/validate literals, and add domain/range post-filters before graph merge; propagate property hierarchy for scoping.
6) **Activity robustness**: Make resolution/validation steps fail the batch on ER/SHACL errors; store validation reports; add regression tests around extraction schemas, ER clustering, and RDF serialization.

## Quick Alignment Plan
- Short term: implement real SHACL validation + ER clustering in activities; persist provenance; add domain/range filters on relations.
- Medium term: introduce CQ-driven prompts with per-mention RAG and iterative refinement; add datatype normalization and hierarchy-aware scoping.
- Long term: incremental validation/reasoning in storage, RDF-star provenance, and external KB linking (Wikidata/DBpedia) for canonical IDs and clustering priors.

## GCP Wiring & Scale-Out Strategy (from system-architecture.md + gaps)
- **Execution substrate**: Cloud Run for stateless API + @effect/workflow engine; PostgreSQL on GCE for workflow journaling; GCS for documents/graphs. Add VPC connector for private PG, Secret Manager for LLM keys. Horizontal scale via Cloud Run revisions; set concurrency to small (e.g., 4–8) due to LLM latency.
- **LLM access**: Keep LanguageModel abstraction; configure per-provider through Secret Manager. Add circuit breaker + per-provider rate limiting; pool API keys if allowed to raise throughput.
- **Storage and I/O**: GCS buckets per env; use signed URLs for document ingest; write chunk artifacts, per-chunk provenance, and validation reports to GCS. If SHACL/ER become heavy, offload to a worker CR job reading from GCS and emitting status to Postgres/SSE.
- **Batch workflow**: Orchestrate via WorkflowEngine + Postgres persistence; ensure idempotency keys include ontology version + document IDs. For large batches, cap parallel extracts (e.g., 5–10) and use backpressure on LLM calls via central semaphore.
- **Entity Resolution at scale**: Run `EntityResolutionGraph` as a dedicated step (Cloud Run job or background worker) reading merged Turtle from GCS, writing resolved graph + sameAs map back. For large graphs, stream parse and use blocking + approximate NN embeddings (e.g., Vertex AI Matching Engine or PG pgvector) to prefilter candidates before clustering.
- **Validation at scale**: Replace stub with a SHACL service (pySHACL container or rdf-validate-shacl in Node). Trigger as a Cloud Run job; stream report back to SSE. For big graphs, run per-namespace or per-document delta validation and combine.
- **RDF serve/ingest**: After validation, write canonical graphs to GCS; optionally load into a managed triple store (e.g., Neptune/Blazegraph self-hosted) or keep PG + GCS if querying is external. Expose SPARQL endpoint via a separate service if needed.
- **Provenance & observability**: Emit chunk-level metadata (chunkId, offsets, confidence) as RDF-star or named graphs; keep OTEL traces from Cloud Run to PG/GCS operations; log LLM tokens/costs.
- **Security**: All secrets via Secret Manager; restrict GCS with per-service accounts; VPC-SC optional. PII handling: consider client-side encryption or per-namespace buckets with TTL.

## Reasoning & Prompting Upgrade Plan (cloud-aware)
- **Per-mention RAG**: Move retrieval to per-mention/per-span; index ontology snippets in a vector DB (pgvector in Postgres or Vertex AI Matching Engine). Pre-compute embeddings for classes/props and cache in PG/GCS.
- **CQ/Ontogenia tracks**: Add a pipeline mode that processes competency questions sequentially (memoryless or Ontogenia-style), persisting interim ontology slices in GCS; use Cloud Run job to avoid HTTP timeouts.
- **Prompt validation loops**: Keep generateObjectWithFeedback; add self-critique step with low-temp model; add domain/range assertions to prompts. For relations, include schema-informed slot-filling examples and negative examples.
- **Datatype and domain/range enforcement**: After extraction, run a fast filter (TypeScript) before writing to storage; add SHACL shapes generated from ontology (domains/ranges, functional properties).
- **Grounding + linking**: Use the Grounder in batch mode; attach confidence; for external linking, add optional Wikidata/DBpedia lookup (network-permitting) as a post-step in Cloud Run job.

## Concrete GCP Wiring Steps
- **Cloud Run services**: `core-api` (HTTP + SSE), `batch-worker` (workflow engine), `er-validator` (ER + SHACL job). Share ConfigService; deploy with min instances=0, max per budget.
- **PostgreSQL**: GCE or Cloud SQL; enable pgvector if used for ER candidate search. Keep migrations in infra; tune connection pooling (PGbouncer or Cloud Run connection pooling).
- **Buckets**: `...-raw/` (inputs), `...-chunks/`, `...-graphs/`, `...-reports/`, `...-canonical/`. Enforce lifecycle policies on intermediates.
- **Queues (optional)**: If throughput spikes, add Pub/Sub to queue document extraction tasks; workers pull and run StreamingExtraction, emitting results to GCS + Postgres state updates.
- **Monitoring**: Cloud Monitoring dashboards for LLM latency, token cost, SHACL failures, ER cluster sizes; alerts on sustained failure rates or PG backlog.

## Embedding Service Decoupling
- **Why**: Avoid duplicative embedding calls across mention retrieval, ER, and grounder; enable model upgrades without touching extraction code; scale independently of LLM throughput.
- **Shape**: Provide a small HTTP/GRPC service (or Effect service backed by a pool) with endpoints `embed(text[], model=semantic|clustering|search) -> vectors`, `health`, `stats`. Cache by text hash + model. Return metadata (model version, dims).
- **Hosting**: Cloud Run `embedding-service` with GPU optional; or Vertex AI Embeddings API wrapper; or self-hosted (e.g., E5/MiniLM) behind a connector. Use PG `pgvector` or Redis for cache/persistence of ontology and mention embeddings.
- **Integration points**:
  - `NlpService` to delegate semantic index builds to the service; store vectors in PG/pgvector or GCS parquet; keep BM25 local.
  - `EntityResolutionGraph` to fetch embeddings lazily per entity mention; prefetch in batches with concurrency caps.
  - Grounder/verification can re-use the same model for similarity prechecks before LLM.
- **Ops**: Add rate limits, batch endpoints, and circuit breaker; export Prometheus/OTEL metrics (requests, latency, cache hit rate). Version vectors in storage to allow rollback.

## High-ROI NLP Tasks (shortlist)
- **Lemmatization/Normalization for retrieval**: Apply before BM25 and embeddings to improve recall on ontology search and mention retrieval; inexpensive and purely local (wink-nlp or spaCy-lite). Also normalize casing/punctuation for ID generation consistency.
- **Embedding quality and specialization**: Use domain-tuned embeddings (e.g., E5-large, bge-m3) for ontology search and ER; store and reuse across runs. Add two “profiles”: semantic retrieval vs clustering (possibly different models).
- **Prompt ordering/tuning**:
  - Keep critical constraints first; ontology snippets + allowed IDs before examples; input text last (already done) but add few-shot and negative examples near the instruction block.
  - Use per-stage temps (mentions/entities: low temp; relations/grounding: medium) and enforce max tokens; add self-critique pass for high-value batches.
  - Inject domain/range hints and property examples in the prompt to cut hallucinated predicates.
- **Typed literal normalization**: Add lightweight regexp/parsing for dates, numbers, booleans; map to xsd datatypes pre-RDF write to improve SHACL pass rates.
- **Property hierarchy expansion**: Expand candidate classes/properties with parents/children for retrieval recall; filter with SHACL/domain-range afterward.
- **Stopword-aware blocking for ER**: Already partly present; add alias dictionaries from ontology labels/altLabels and lightweight transliteration for multilingual names.
- **Chunk-aware context filters**: Use per-mention/topical RAG to reduce context size and improve grounding before LLM calls.

---

## Primary Source Research Findings (December 2025)

The following sections summarize key findings from primary source research conducted to validate and expand the above recommendations.

### Entity Resolution: State of the Art

**Blocking Strategies (2023-2025)**
- **SC-Block (Supervised Contrastive Blocking)**: Uses contrastive learning to position matching entities close in embedding space. Achieves **50% smaller candidate sets** and **4x faster pipeline execution**. Requires labeled training pairs but training overhead is ~5 minutes. [arxiv.org/abs/2303.03132]
- **Embedding-based k-NN**: Pre-trained embeddings (E5, BGE) with k-NN search outperform token-level blocking. S-GTR-T5 shows 15% higher recall than DeepBlocker. BGE-M3 supports 8192 tokens and 100+ languages. [arxiv.org/abs/2304.12329]
- **Neural LSH**: Neuralized locality-sensitive hashing with custom similarity metrics for heterogeneous data.

**Clustering Algorithms**
- **Leiden** (recommended over Louvain): Guarantees connected communities, faster execution, better partition quality. Louvain can produce disconnected clusters (up to 25% in experiments).
- **Correlation Clustering**: Handles contradictory evidence (A-B match, B-C match, A-C non-match). NP-hard but 3-approximation algorithms available. Used by Google Enterprise Knowledge Graph.
- **Connected Components**: Simple, fast, deterministic but sensitive to false positives.

**LLM-Assisted Entity Matching**
- **Zero-shot LLMs match fine-tuned models**: GPT-4 outperforms best transferred PLM (Ditto) by **40-68% F1** with no training data. [arxiv.org/abs/2310.11244]
- **Hybrid approach**: Embedding-based blocking (fast, high recall) + LLM verification of uncertain matches (0.5-0.8 similarity).
- **Cost optimization**: Use cheap models (GPT-4o-mini, Claude Haiku) for high-volume verification; cache responses by entity pair hash.

**owl:sameAs Best Practices**
- **Problem**: 13%+ of owl:sameAs links in LinkLion repository are erroneous. Transitive closure explosion creates N² statements.
- **Solution**: Use synthetic canonical URIs (UUID or hash-based) with one-way sameAs links. Avoid symmetric closure.
- **Alternatives**: skos:exactMatch (less strict), skos:closeMatch (similar but not identical).

### SHACL Validation: Production-Ready Solutions

**JavaScript Validators (2024-2025)**
- **shacl-engine**: **15-26x faster** than rdf-validate-shacl and pyshacl. Optimized caching, SPARQL-based constraints, coverage tracking. [github.com/rdf-ext/shacl-engine]
- **rdf-validate-shacl**: Mature, RDF/JS compatible, but performance bottleneck on large datasets due to repeated Dataset.match calls.

**Incremental Validation**
- **UpSHACL**: Identifies subgraph affected by update, validates reduced subgraph. **10x speedup** over full validation.
- **Re-SHACL**: Targeted reasoning before validation—extracts relevant info from shapes graph to identify which data needs reasoning. Orders of magnitude faster than full-entailment SHACL.

**Auto-Generating SHACL from OWL**
- **Astrea** (OEG-UPM): Maintains knowledge graph mapping OWL patterns to SHACL patterns. Uses SPARQL queries over ontology to generate shapes. [github.com/oeg-upm/astrea]
- **Important caveat**: OWL (open-world inference) vs SHACL (closed-world validation) have different semantics. Generated shapes need manual refinement.

**SHACL for LLM Feedback Loops**
- **xpSHACL (2024)**: Explainable SHACL validation using LLMs. Combines rule-based justification trees with RAG for human-readable explanations of violations.
- **Challenge**: Simple SHACL violation messages don't effectively guide LLMs due to stateless nature.

### Reasoning: Lightweight Approaches

**RDFS Materialization**
- **N3.js Reasoner**: RDFS materialization on typical datasets in **<0.1s** (961 facts, 866 derivations, 14 rules). Semi-naive evaluation optimized for small rule sets. [ISWC 2024]
- **EYE-JS**: WebAssembly-based Notation3 reasoner with full backward-chaining support. Use for complex custom rules.

**Incremental Reasoning**
- **DRed Algorithm**: Delete and rederive for maintaining Datalog materialization. Used by RDFox.
- **RDFox Backward/Forward**: 2-3 million inferences/second, compatible with owl:sameAs rewriting. Commercial license.
- **JavaScript limitation**: No native incremental reasoner; batch reasoning on extraction completion is practical approach.

### Provenance: Tracking Extraction Sources

**Named Graphs vs RDF-star**
- **Named Graphs** (mature): One graph per chunk, TriG serialization, full SPARQL support. Use for chunk-level provenance.
- **RDF-star** (emerging): Statement-level annotations, being standardized in RDF 1.2. Use for confidence scores.
- **N3.js support**: Parsing/serialization for RDF-star mature; store support limited (issue #256).
- **Oxigraph**: Full RDF 1.2 triple term support, SPARQL-star queries.

**PROV-O Patterns**
- Model extraction as `prov:Activity`, source chunks as `prov:Entity` with `prov:wasGeneratedBy`, LLM service as `prov:Agent` with model version.

### Retrieval: Advanced Techniques

**Reciprocal Rank Fusion (RRF)**
- **Algorithm**: `score = Σ (1 / (rank_i + 60))` where k≈60 is experimentally optimal.
- **Advantage**: Avoids score normalization issues; consistently outperforms complex methods.
- **Impact**: Combined with contextual retrieval and reranking: **67% retrieval failure reduction**. [Anthropic 2024]

**Ontology-Aware Query Expansion**
- Expand queries with synonyms (rdfs:label, skos:altLabel), parent/child classes, related concepts.
- **Best practice**: Weight original terms 1.0, synonyms 0.9, parents 0.5, children 0.6. Limit traversal to 1-2 levels to prevent drift.

**Contextual Retrieval (Anthropic 2024)**
- Prepend chunk-specific context (50-100 tokens) generated by LLM before embedding and BM25 indexing.
- **Performance**: 35% retrieval failure reduction with embeddings alone; 49% with BM25; 67% with reranking.
- **Cost**: ~$1.02 per million document tokens with prompt caching.

**Late Chunking (2024)**
- Embed entire text first, then chunk during pooling step. Chunk embeddings include full contextual information.
- **Benefit**: ~3.5% relative improvement; smaller chunks benefit most.
- **Requirement**: Models with extended context windows (8,000+ tokens).

### Embeddings: Model Comparison

| Model | Accuracy | Latency | Languages | Best For |
|-------|----------|---------|-----------|----------|
| BGE-M3 | 72% (RAG) | 79-82ms | 100+ | Multilingual, multi-functionality |
| Nomic v1.5 | 86.2% | ~100ms+ | English | Precision-critical apps |
| E5-Base-v2 | 83-85% | 79-82ms | English | Enterprise, no license costs |

**Recommendation**: BGE-M3 for multilingual/production (supports dense, lexical, and ColBERT-style retrieval in one model); Nomic for cost-sensitive development.

### NLP Preprocessing

**Lemmatization**
- Improves recall on ontology matching by normalizing "running" → "run".
- **JavaScript options**: wink-nlp (pure JS, lightweight), compromise.js (NER + sentence splitting included).
- Use for BM25 indexing/querying and entity mention normalization.

**Sentence Boundary Detection**
- **State-of-the-art**: wtpsplit (EMNLP 2024) - universal, robust, adaptable.
- **JavaScript**: compromise.js or natural adequate for standard texts; deploy Python bridge for legal/technical documents.

**NER Pipeline Integration**
- **Standard flow**: NER (detect mentions) → Coreference (link mentions to same entity) → Entity Linking (map to KB).
- **SUNER Framework (IJCAI 2024)**: Separate span detection from entity type classification. +0.56% improvement over one-stage methods.

### Reranking: Cross-Encoders and ColBERT

**Cross-Encoder vs ColBERT**
- **Cross-encoder**: Highest accuracy (processes query+doc jointly), but slow (cannot pre-compute).
- **ColBERT (Late Interaction)**: Pre-compute document vectors, fast online MaxSim operation. Best balance of speed and accuracy.
- **BGE-M3**: First model supporting dense + lexical + multi-vector (ColBERT-style) in one.

**Three-Stage Pipeline (QIAS 2025)**
1. **Fast retrieval** (top 150): BM25 + dense embeddings + RRF fusion
2. **Reranking** (top 20): Cross-encoder or ColBERT
3. **LLM Generation**: Pass top results to LLM

**Impact**: Up to **25% accuracy improvement** over single-stage retrieval.

---

## Implementation Priority Matrix

| Priority | Item | Effort | Impact | Status |
|----------|------|--------|--------|--------|
| **P0** | Replace SHACL stub with shacl-engine | 1-2 days | High | Not started |
| **P0** | Wire entity resolution into workflow | 1-2 weeks | Critical | Not started |
| **P1** | Implement RRF for hybrid search | 2 days | High | Not started |
| **P1** | Add lemmatization preprocessing | 2 days | Medium | Not started |
| **P1** | Materialize provenance (named graphs) | 1-2 days | Medium | Not started |
| **P1** | Add datatype validation | 2-3 days | Medium | Not started |
| **P2** | Enable embedding cache | 3 days | High (cost) | Not started |
| **P2** | Generate SHACL shapes from ontology | 3-5 days | High | Not started |
| **P2** | Add ontology hierarchy expansion | 3 days | Medium | Not started |
| **P2** | Per-mention retrieval | 1 week | Medium | Not started |
| **P3** | Contextual retrieval | 1 week | High | Not started |
| **P3** | Cross-encoder reranking | 1 week | Medium | Not started |
| **P3** | LLM verification for uncertain ER | 1 week | Medium | Not started |

See `synthesis_and_implementation_roadmap.md` for full implementation details and GCP architecture.

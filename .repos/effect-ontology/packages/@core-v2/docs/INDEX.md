# @core-v2 Documentation Index

> **Last Updated**: December 2025
> **Status**: Living documentation aligned with codebase
> **See Also**: [`docs/CORE_V2_NEXT_STEPS.md`](../../../docs/CORE_V2_NEXT_STEPS.md) for strategic implementation guide

## Quick Navigation

| If you need... | Go to... |
|----------------|----------|
| System overview & diagrams | [architecture/system-architecture.md](./architecture/system-architecture.md) |
| Effect patterns & templates | [architecture/effect-patterns-guide.md](./architecture/effect-patterns-guide.md) |
| SOTA research & priorities | [ontology_research/sota_review.md](./ontology_research/sota_review.md) |
| Implementation roadmap | [ontology_research/synthesis_and_implementation_roadmap.md](./ontology_research/synthesis_and_implementation_roadmap.md) |
| **MVP blocker audit** | [audits/AUDIT_SUMMARY.md](./audits/AUDIT_SUMMARY.md) |
| Debugging extraction runs | [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) |
| LLM control reference | [LLM_CONTROL_QUICK_REFERENCE.md](./LLM_CONTROL_QUICK_REFERENCE.md) |
| Term definitions | [GLOSSARY.md](./GLOSSARY.md) |
| Doc/research procedures | [.claude/DOC_PROCEDURE.md](../../../.claude/DOC_PROCEDURE.md) |

---

## Architecture Documentation

### System Architecture
**[architecture/system-architecture.md](./architecture/system-architecture.md)** (v2.5.0)

Comprehensive system documentation including:
- System context (C4 diagram)
- Component architecture (Mermaid)
- **6-phase unified extraction pipeline** (Chunk → Mention → Entity → Property Scope → Relation → Ground)
- 5-stage batch workflow (Preprocess → Extract → Resolve → Validate → Ingest)
- Service layer dependency graph
- Data model (branded types, BatchState union)
- Storage path layout
- GCP infrastructure architecture
- Layer composition patterns
- API reference with SSE streaming

### Effect Patterns Guide
**[architecture/effect-patterns-guide.md](./architecture/effect-patterns-guide.md)**

Practical patterns for Effect-native development:
- Service definition patterns (Effect.Service vs Context.Tag)
- Layer composition (three-tier architecture)
- Error handling (Schema.TaggedError, catchTag)
- Schema & validation (branded types, JSON boundaries)
- Resource management (acquireRelease, finalizers)
- Workflow & activity patterns
- **Critical issues to address** (documented bugs)
- **Templates** for new services and activities

### Workflow State Patterns
**[architecture/workflow-state-patterns.md](./architecture/workflow-state-patterns.md)**

Documents the state management approach for durable workflows:
- Current race condition issue
- Recommended pattern (state via workflow return)
- Migration path

---

## SOTA Research & Implementation

### SOTA Review
**[ontology_research/sota_review.md](./ontology_research/sota_review.md)** (December 2025)

Comprehensive state-of-the-art review with implementation priorities:

**Entity Resolution:**
- Blocking strategies (SC-Block, k-NN embeddings)
- Clustering algorithms (Leiden, Correlation Clustering)
- LLM-assisted matching
- owl:sameAs best practices

**SHACL Validation:**
- JavaScript validators (shacl-engine: 15-26x faster)
- Incremental validation (UpSHACL, Re-SHACL)
- Auto-generating SHACL from OWL

**Retrieval & NLP:**
- Reciprocal Rank Fusion (RRF)
- Contextual retrieval (67% failure reduction)
- Embedding model comparison (BGE-M3, Nomic, E5)
- Three-stage pipeline (retrieval → rerank → LLM)

**Implementation Priority Matrix:**
| Priority | Item | Effort |
|----------|------|--------|
| P0 | Replace SHACL stub | 1-2 days |
| P0 | Wire entity resolution | 1-2 weeks |
| P1 | Implement RRF hybrid search | 2 days |
| P1 | Add lemmatization | 2 days |

### Supporting Research Documents
- [entity_resolution_clustering_research.md](./ontology_research/entity_resolution_clustering_research.md) - 50+ sources
- [rdf_shacl_reasoning_research.md](./ontology_research/rdf_shacl_reasoning_research.md) - 70+ sources
- [shacl_shape_management_research.md](./ontology_research/shacl_shape_management_research.md) - **NEW (2025-12-18)** SHACL shape repositories, design patterns, production tooling, shape management
- [owl_reasoning_validation_production.md](./ontology_research/owl_reasoning_validation_production.md) - **NEW (2025-12-18)** OWL vs SHACL, incremental reasoning, JS reasoners
- [advanced_retrieval_nlp_research.md](./ontology_research/advanced_retrieval_nlp_research.md) - 80+ sources
- [temporal_conflicting_claims_research.md](./ontology_research/temporal_conflicting_claims_research.md) - Temporal KG, corrections, belief revision
- [synthesis_and_implementation_roadmap.md](./ontology_research/synthesis_and_implementation_roadmap.md) - Consolidated plan

---

## Operational Documentation

### LLM Control
- [LLM_CONTROL_QUICK_REFERENCE.md](./LLM_CONTROL_QUICK_REFERENCE.md) - Quick reference card
- [LLM_CONTROL_STRATEGY_SUMMARY.md](./LLM_CONTROL_STRATEGY_SUMMARY.md) - Strategy overview
- [LLM_CONTROL_INDEX.md](./LLM_CONTROL_INDEX.md) - Full index

### Debugging & Operations
- [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) - Practical debugging guide
- [PRODUCTION_SPEC.md](./PRODUCTION_SPEC.md) - Production deployment spec

### Progress Streaming
- [PROGRESS_STREAMING_QUICKREF.md](./PROGRESS_STREAMING_QUICKREF.md) - Quick reference
- [PROGRESS_STREAMING_SUMMARY.md](./PROGRESS_STREAMING_SUMMARY.md) - Overview
- [PROGRESS_STREAMING_INDEX.md](./PROGRESS_STREAMING_INDEX.md) - Full index

---

## Implementation Plans

### Active Plans
- [plans/2025-12-19-unified-extraction-pipeline.md](./plans/2025-12-19-unified-extraction-pipeline.md) - **NEW (2025-12-19)** Unified 6-phase streaming extraction pipeline
- [plans/shacl-activity-implementation-plan.md](./plans/shacl-activity-implementation-plan.md) - SHACL validation activity
- [plans/postgres-workflow-engine-investigation.md](./plans/postgres-workflow-engine-investigation.md) - Workflow persistence
- [plans/local-postgres-dev-setup.md](./plans/local-postgres-dev-setup.md) - Local development setup

### Completed Plans
- [plans/domain_model_architecture.md](./plans/domain_model_architecture.md) - Domain model design
- [plans/2025-12-11-config-layer-unification.md](./plans/2025-12-11-config-layer-unification.md) - Config unification
- [plans/2025-12-11-workflow-layer-composition-fix.md](./plans/2025-12-11-workflow-layer-composition-fix.md) - Layer composition fix

---

## Code Audits

### Active Audits
- [audits/2025-12-18-medium-severity-modeling-audit.md](./audits/2025-12-18-medium-severity-modeling-audit.md) - **NEW (2025-12-18)** Comprehensive audit of MEDIUM and LOW severity modeling issues
- [audits/ACTION_ITEMS.md](./audits/ACTION_ITEMS.md) - **NEW (2025-12-18)** Concrete action items from modeling audit (5-8 day timeline)
- [audits/AUDIT_SUMMARY.md](./audits/AUDIT_SUMMARY.md) - **NEW (2025-12-18)** Executive summary and MVP blocker analysis

**Key Findings**:
- 3 MEDIUM issues are MVP-blocking for timeline queries
- Bitemporal timestamps missing from ontology (publishedAt, ingestedAt, assertedAt, derivedAt)
- Event time modeling uses incorrect OWL-Time pattern
- 5-8 days effort required for P0 fixes

---

## Archive

Historical documents moved to `archive/` directory:
- `archive/trace-analysis-2025-11-26.md` - Trace analysis
- `archive/mvp-persistence-surface.md` - Original persistence design
- `archive/idempotency-design.md` - Idempotency design

---

## Key Reference Files

| Document | Purpose |
|----------|---------|
| `/CLAUDE.md` | Project overview for AI assistants |
| `/docs/EFFECT_MODULE_STYLE_GUIDE.md` | Module style conventions |
| `/docs/EFFECT_APPLICATION_PATTERNS.md` | Application-level patterns |
| `functional_spec.md` | Original functional specification |

---

## Documentation Status

| Area | Status | Last Updated |
|------|--------|--------------|
| System Architecture | Current | Dec 2025 |
| Effect Patterns | Current | Dec 2024 |
| SOTA Research | Current | Dec 2025 |
| LLM Control | Current | Dec 2024 |
| Implementation Plans | Active | Dec 2025 |
| Unified Extraction | **NEW** | Dec 2025 |

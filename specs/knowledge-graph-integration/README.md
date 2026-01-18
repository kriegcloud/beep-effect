# Knowledge Graph Integration Specification

**Status**: Phase 0 (Foundation)
**Complexity**: Complex (10+ sessions expected)
**Reference Implementation**: [effect-ontology](https://github.com/pooks/effect-ontology)

---

## Purpose

Integrate ontology-guided knowledge extraction, semantic data modeling, and GraphRAG capabilities into the beep-effect monorepo. This enables Todox and future applications to:

1. **Extract structured knowledge** from unstructured text (emails, documents, notes)
2. **Model domain relationships** via formal OWL ontologies
3. **Provide intelligent agent context** through GraphRAG subgraph retrieval
4. **Unify multi-source data** via entity resolution and canonical schemas
5. **Maintain compliance audit trails** with evidence-linked provenance

### Core Concepts from Effect Ontology

| Concept | Description | Beep-Effect Integration |
|---------|-------------|-------------------------|
| **Ontology** | OWL/Turtle formal schema defining classes, properties, constraints | New `@beep/ontology-domain` package |
| **KnowledgeIndex** | HashMap-based monoid for prompt generation | Service in `@beep/knowledge-server` |
| **Topological Catamorphism** | DAG fold over class hierarchy | Pure function in domain layer |
| **6-Phase Pipeline** | Chunk → Mention → Entity → Scope → Relation → Ground | Workflow in `@beep/knowledge-server` |
| **Entity Resolution** | Clustering duplicate entities across sources | Service consuming embeddings |
| **GraphRAG** | Subgraph retrieval for agent context | Integration with `@beep/agents-*` |

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BEEP-EFFECT + KNOWLEDGE LAYER                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ Todox App        │  │ Notes App        │  │ Future Apps              │   │
│  │ (Email/Clients)  │  │ (Documents)      │  │ (CRM, Integrations)      │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────────────┘   │
│           │                     │                     │                       │
│           ▼                     ▼                     ▼                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    @beep/knowledge-client                                │ │
│  │  RPC contracts: extract, query, resolve, getAgentContext                │ │
│  └────────────────────────────────────────────────────┬────────────────────┘ │
│                                                       │                       │
│           ┌───────────────────────────────────────────┤                       │
│           │                                           │                       │
│           ▼                                           ▼                       │
│  ┌─────────────────────────┐              ┌─────────────────────────────────┐│
│  │ @beep/knowledge-server  │              │ @beep/knowledge-ui              ││
│  │                         │              │                                  ││
│  │ Services:               │              │ Components:                      ││
│  │ - ExtractionPipeline    │              │ - KnowledgeGraphViewer          ││
│  │ - EntityResolution      │              │ - EntityInspector               ││
│  │ - GraphRAGService       │              │ - RelationExplorer              ││
│  │ - OntologyService       │              │ - ExtractionProgress            ││
│  │ - GroundingService      │              │                                  ││
│  └─────────┬───────────────┘              └──────────────────────────────────┘│
│            │                                                                   │
│            ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    @beep/knowledge-tables                                │ │
│  │                                                                          │ │
│  │  Tables:                                                                 │ │
│  │  - ontologies (id, org_id, name, turtle_content, version)               │ │
│  │  - entities (id, org_id, types[], attributes, mentions[], confidence)   │ │
│  │  - relations (id, subject_id, predicate, object, evidence[], confidence)│ │
│  │  - extractions (id, org_id, source_uri, status, knowledge_graph_id)     │ │
│  │  - embeddings (id, entity_id, vector, provider, model)                  │ │
│  │                                                                          │ │
│  │  + pgvector extension for similarity search                              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    @beep/knowledge-domain                                │ │
│  │                                                                          │ │
│  │  Schemas: Entity, Relation, Mention, KnowledgeGraph, OntologyContext    │ │
│  │  Algebra: knowledgeIndexMonoid, mergeGraphs (associative, identity)     │ │
│  │  Errors: ExtractionError, OntologyError, GroundingError                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

### Quantitative

- [ ] Extraction pipeline processes 10KB document in <30s
- [ ] GraphRAG context assembly <500ms for 2-hop traversal
- [ ] Entity resolution achieves >85% F1 on duplicate detection
- [ ] Grounding threshold (0.8) filters >90% of hallucinated relations
- [ ] pgvector similarity search <100ms for 10K entities
- [ ] All schemas use Effect Schema (no Zod, no manual types)
- [ ] 100% of tables have org_id with RLS policies

### Qualitative

- [ ] Ontologies loadable from Turtle files or database
- [ ] Extraction pipeline is streaming (handles large documents)
- [ ] Entity types constrained to ontology classes
- [ ] Relations constrained to ontology properties
- [ ] Evidence spans link extracted facts to source text
- [ ] Agent context includes relationship traversal
- [ ] Integration with existing `@beep/shared-*` patterns

---

## Phase Overview

| Phase | Description | Sessions | Status |
|-------|-------------|----------|--------|
| **P0** | Foundation: Domain models, table schemas, RLS | 2-3 | Pending |
| **P1** | Ontology Service: OWL parsing, class hierarchy, property scoping | 2-3 | Pending |
| **P2** | Extraction Pipeline: 6-phase streaming extraction | 3-4 | Pending |
| **P3** | Embedding & Grounding: pgvector, similarity scoring | 2-3 | Pending |
| **P4** | Entity Resolution: Clustering, canonical entity selection | 2-3 | Pending |
| **P5** | GraphRAG: Subgraph retrieval, agent context assembly | 2-3 | Pending |
| **P6** | Todox Integration: Email extraction, client knowledge graph | 3-4 | Pending |
| **P7** | UI Components: Graph viewer, entity inspector | 2-3 | Pending |

---

## Key Technology Decisions

### RDF Storage: PostgreSQL + JSON

**Selected over**: Apache Jena, Neo4j, dedicated triple store

**Rationale**:
- Aligns with existing PostgreSQL infrastructure
- RLS policies for multi-tenancy work seamlessly
- JSON columns for flexible entity attributes
- pgvector for embedding similarity search
- Drizzle ORM compatibility with existing patterns

### Embedding Provider: Abstracted Service

**Pattern**: Provider-agnostic `EmbeddingService` with pluggable backends

**Providers**:
- Nomic (local, Transformers.js) for development
- Voyage AI (cloud) for production
- OpenAI (fallback)

### LLM Integration: @effect/ai

**Selected over**: Vercel AI SDK, LangChain

**Rationale**:
- Native Effect integration
- Effect Schema for structured output
- Consistent with beep-effect patterns
- McpServer for tool definitions

---

## Directory Structure

```
specs/knowledge-graph-integration/
├── README.md                         # This overview
├── QUICK_START.md                    # 5-minute triage
├── MASTER_ORCHESTRATION.md           # Phase workflows & checkpoints
├── AGENT_PROMPTS.md                  # Ready-to-use agent prompts
├── RUBRICS.md                        # Evaluation criteria
├── REFLECTION_LOG.md                 # Session learnings
├── outputs/
│   ├── codebase-context.md           # P0 research findings
│   ├── effect-ontology-analysis.md   # Reference implementation analysis
│   └── architecture-review.md        # Structure validation
├── handoffs/
│   ├── P0_ORCHESTRATOR_PROMPT.md     # Phase 0 starter prompt
│   ├── HANDOFF_P1.md                 # P0→P1 context
│   └── ...
└── templates/
    ├── entity.template.ts            # Entity schema template
    ├── service.template.ts           # Service definition template
    └── extraction-stage.template.ts  # Pipeline stage template
```

---

## Quick Start

### For New Instances

1. Read [QUICK_START.md](./QUICK_START.md) for 5-minute triage
2. Read `handoffs/P0_ORCHESTRATOR_PROMPT.md` for current phase
3. Execute Phase 0: Foundation

### Key Reference Files

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/` | Existing domain patterns |
| `packages/shared/server/src/DbClient/` | Database client patterns |
| `packages/shared/tables/src/` | Table factory patterns |
| `packages/iam/server/src/db/Db/` | Slice-scoped Db pattern |
| `.claude/rules/effect-patterns.md` | Mandatory Effect patterns |
| `tmp/effect-ontology/packages/@core-v2/src/` | Reference implementation |

---

## Agents Used

| Agent | Phase | Purpose |
|-------|-------|---------|
| `codebase-researcher` | P0, P1 | Explore existing beep-effect patterns |
| `mcp-researcher` | P1, P2 | Effect/AI, Schema documentation |
| `web-researcher` | P0 | OWL/RDF best practices |
| `architecture-pattern-enforcer` | All | Validate layer boundaries |
| `test-writer` | All | Create test coverage |
| `doc-writer` | P7 | Final documentation |
| `reflector` | All | Log and synthesize learnings |

---

## Implementation Scope

### In Scope

- New vertical slice: `packages/knowledge/*` (domain, tables, server, client, ui)
- OWL ontology parsing (N3.js for Turtle format)
- 6-phase streaming extraction pipeline
- pgvector embedding storage and similarity search
- Entity resolution via clustering
- GraphRAG subgraph retrieval
- Todox email/document extraction integration
- Basic graph visualization UI

### Out of Scope (Future Phases)

- SPARQL query endpoint
- Full reasoning engine (OWL DL)
- Real-time collaborative graph editing
- Custom ontology editor UI
- External knowledge base linking (Wikidata, DBpedia)
- Graph neural network entity resolution

---

## Related Documentation

- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Detailed phase workflows
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - Sub-agent prompts
- [RUBRICS.md](./RUBRICS.md) - Evaluation criteria
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [Database Patterns](../../documentation/patterns/database-patterns.md) - Table/repo patterns
- [effect-ontology TECHNICAL_WALKTHROUGH.md](../../tmp/effect-ontology/TECHNICAL_WALKTHROUGH.md) - Reference analysis

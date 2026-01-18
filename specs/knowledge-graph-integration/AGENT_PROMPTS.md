# Agent Prompts: Knowledge Graph Integration

> Ready-to-use prompts for specialized agents in knowledge graph integration.

---

## Phase 0 Agents

### codebase-researcher: Existing Patterns Analysis

```
Analyze the existing beep-effect patterns for the knowledge graph integration.

Research questions:
1. How are vertical slices structured in packages/iam/* and packages/documents/*?
2. What is the DbClient pattern in packages/shared/server/src/DbClient/?
3. How are repositories defined using DbRepo.make()?
4. What table factory patterns exist in packages/shared/tables/?
5. How does OrgTable.make() differ from Table.make()?
6. What RLS policy patterns are used for multi-tenancy?

Examine these specific files:
- packages/iam/domain/src/entities/Member/Member.model.ts
- packages/iam/tables/src/tables/member.table.ts
- packages/iam/tables/src/_check.ts
- packages/iam/server/src/db/Db/Db.ts
- packages/iam/server/src/db/repos/Member.repo.ts
- packages/shared/server/src/DbClient/DbClient.ts
- packages/shared/tables/src/org-table/OrgTable.ts

Output: Comprehensive pattern summary for replication in @beep/knowledge-*
```

### codebase-researcher: Effect Service Patterns

```
Analyze Effect service definition patterns in beep-effect.

Research questions:
1. How are services defined with Effect.Service?
2. What layer composition patterns are used?
3. How are dependencies declared and provided?
4. What error handling patterns are standard?
5. How is telemetry/logging integrated?

Examine:
- packages/shared/domain/src/services/
- packages/iam/server/src/services/
- packages/runtime/server/src/

Output: Service definition checklist for knowledge graph services
```

### architecture-pattern-enforcer: Slice Structure Validation

```
Validate the proposed knowledge graph slice structure.

Check against:
1. Layer dependency order (domain -> tables -> server -> client -> ui)
2. Cross-slice import restrictions
3. Path alias usage (@beep/knowledge-*)
4. Module organization patterns
5. Export index conventions

Input: Proposed structure from MASTER_ORCHESTRATION.md Task 0.1

Output: outputs/architecture-review.md with:
- Violations found
- Remediation recommendations
- Compliance score
```

---

## Phase 1 Agents

### mcp-researcher: Effect Schema Patterns

```
Research Effect Schema patterns for knowledge graph domain models.

Search topics:
1. S.Class for domain entities
2. Branded types for entity IDs
3. S.Union for polymorphic fields
4. S.optional vs S.optionalWith patterns
5. @effect/sql/Model integration with Drizzle

Focus on:
- How to define nested schemas (EvidenceSpan inside Entity)
- How to handle JSON columns with typed content
- How to create schema factories for ontology-constrained types

Output: Schema definition patterns for Entity, Relation, KnowledgeGraph
```

### mcp-researcher: N3.js Integration

```
Research N3.js library for OWL/Turtle parsing.

Search topics:
1. N3.Parser API for Turtle files
2. N3.Store for quad storage and querying
3. Extracting rdfs:subClassOf relationships
4. Extracting rdfs:domain and rdfs:range
5. Handling owl:imports for external vocabularies

Focus on:
- TypeScript integration patterns
- Effect wrapping for N3 async operations
- Memory management for large ontologies

Output: N3.js integration approach for OntologyParser service
```

### web-researcher: OWL Ontology Best Practices

```
Research OWL ontology modeling best practices.

Topics:
1. Class hierarchy design patterns
2. Property domain/range constraints
3. SKOS labeling conventions (prefLabel, altLabel)
4. Disjointness declarations
5. Common upper ontologies (DUL, DOLCE)

Focus on:
- Patterns that aid LLM extraction
- Minimal viable ontology for knowledge extraction
- External vocabulary reuse (FOAF, PROV-O, W3C ORG)

Output: Ontology design guidelines for wealth management domain
```

---

## Phase 2 Agents

### mcp-researcher: @effect/ai Integration

```
Research @effect/ai patterns for LLM integration.

Search topics:
1. AiService definition and configuration
2. generateObject for structured output
3. Effect Schema integration for response validation
4. Rate limiting and retry patterns
5. Token budget management

Focus on:
- How to create ontology-constrained output schemas
- How to handle LLM streaming responses
- Error handling for LLM failures (rate limits, timeouts)

Output: @effect/ai integration patterns for extraction services
```

### test-writer: Extraction Pipeline Tests

```
Create Effect-first tests for the extraction pipeline.

Target package: packages/knowledge/server/

Test coverage:
1. NlpService.chunkText - sentence preservation, overlap
2. MentionExtractor - mention span detection
3. EntityExtractor - ontology type constraints
4. RelationExtractor - property domain/range filtering
5. Grounder - confidence threshold filtering
6. mergeGraphs - monoid laws (associativity, identity)

Use @beep/testkit patterns:
- Effect.gen for test bodies
- Layer composition for dependencies
- Mock LLM service for deterministic tests

Output: packages/knowledge/server/src/__tests__/
```

### test-writer: Monoid Property Tests

```
Create property-based tests for KnowledgeGraph monoid.

Test properties:
1. Associativity: merge(merge(a, b), c) === merge(a, merge(b, c))
2. Identity: merge(empty, a) === a AND merge(a, empty) === a
3. Commutativity check: merge(a, b) may differ from merge(b, a) in conflict resolution
4. Idempotence check: merge(a, a) entity count

Use fast-check for property generation:
- Arbitrary KnowledgeGraph generator
- Entity ID collision scenarios
- Type voting edge cases

Output: packages/knowledge/domain/src/__tests__/Algebra.test.ts
```

---

## Phase 3 Agents

### web-researcher: pgvector Best Practices

```
Research pgvector for embedding storage and similarity search.

Topics:
1. HNSW vs IVFFlat index selection
2. Optimal vector dimensions for different models
3. Query patterns for k-NN search
4. Index tuning parameters (m, ef_construction)
5. Batch insert performance

Focus on:
- Multi-tenant considerations with RLS
- Performance benchmarks for 10K-1M vectors
- Index maintenance and reindexing

Output: pgvector configuration guide for knowledge embeddings
```

### mcp-researcher: Embedding Providers

```
Research embedding provider APIs and patterns.

Providers to compare:
1. Voyage AI - dimensions, rate limits, pricing
2. Nomic (Transformers.js) - local execution, model size
3. OpenAI embeddings - dimensions, pricing

Focus on:
- Task type optimization (search_query vs search_document)
- Batch API patterns for efficiency
- Caching strategies with versioned keys

Output: EmbeddingProvider interface design and implementation guide
```

---

## Phase 4 Agents

### mcp-researcher: Entity Resolution Algorithms

```
Research entity resolution and deduplication algorithms.

Search topics:
1. Similarity-based clustering algorithms (DBSCAN, hierarchical)
2. Threshold-based entity matching
3. Transitive closure for cluster merging
4. Confidence-weighted canonical selection
5. owl:sameAs semantics for provenance

Focus on:
- Effect-native clustering implementations
- Scalability to 10K+ entities per organization
- Incremental resolution (new entities added)
- Cross-source entity matching

Output: EntityResolution service design with clustering algorithm selection
```

### test-writer: Entity Resolution Tests

```
Create Effect-first tests for entity resolution.

Target package: packages/knowledge/server/

Test coverage:
1. Similarity matrix computation for entity pairs
2. Threshold-based clustering with configurable threshold
3. Type consistency enforcement (same-type only)
4. Canonical entity selection (mention frequency + confidence)
5. owl:sameAs link generation
6. Incremental resolution (adding new entities to existing clusters)

Edge cases to test:
- Empty entity set
- Single entity (no resolution needed)
- All entities identical (single cluster)
- No entities similar (N clusters)
- Transitive closure scenarios (A~B, B~C, but A!~C)

Use @beep/testkit patterns with mock embedding service.

Output: packages/knowledge/server/src/__tests__/EntityResolution.test.ts
```

### web-researcher: Entity Resolution State of the Art

```
Research state-of-the-art entity resolution techniques.

Topics:
1. Blocking strategies for scalable pairwise comparison
2. Active learning for threshold tuning
3. Deep learning approaches vs traditional clustering
4. Evaluation metrics (precision, recall, F1 for clusters)
5. Human-in-the-loop correction patterns

Focus on:
- Techniques that work with LLM-extracted entities
- Methods that leverage embeddings
- Approaches for multi-source heterogeneous data

Output: Entity resolution strategy recommendation for knowledge graph
```

---

## Phase 5 Agents

### codebase-researcher: Agent Context Patterns

```
Analyze existing agent/AI patterns in Todox.

Research questions:
1. How is AI chat implemented in apps/todox/src/components/ai-chat/?
2. What context sources are currently available to agents?
3. How are MCP tools defined (if any)?
4. What prompt construction patterns exist?

Examine:
- apps/todox/src/components/ai-chat/
- Any @effect/ai usage in the codebase
- Agent configuration patterns

Output: Integration points for GraphRAG context assembly
```

### mcp-researcher: GraphRAG Patterns

```
Research GraphRAG (Graph Retrieval-Augmented Generation) patterns.

Search topics:
1. k-NN entity retrieval from embeddings
2. N-hop subgraph traversal algorithms
3. Reciprocal Rank Fusion (RRF) for hybrid scoring
4. Context window optimization for large graphs
5. Citation and provenance tracking

Focus on:
- Effect-native graph traversal patterns
- Streaming subgraph assembly
- Context pruning for token limits

Output: GraphRAG service design for agent context assembly
```

---

## Phase 6 Agents

### codebase-researcher: Email Integration Patterns

```
Analyze existing email handling patterns in Todox.

Research questions:
1. How are emails fetched and stored in the documents slice?
2. What parsing is done on email content (HTML, attachments)?
3. How is email metadata indexed for search?
4. What triggers exist for processing new emails?

Examine:
- packages/documents/server/src/
- apps/todox/src/features/email/
- Any IMAP/email client integration

Output: Email-to-extraction pipeline integration points
```

### mcp-researcher: Streaming Extraction Triggers

```
Research Effect patterns for reactive/streaming triggers.

Search topics:
1. Effect.Stream for continuous processing
2. PubSub patterns with @effect/pubsub
3. Queue-based extraction with @effect/queue
4. Webhook trigger patterns
5. Polling vs event-driven approaches

Focus on:
- Backpressure handling for high-volume email ingestion
- Idempotent extraction (prevent re-processing)
- Progress reporting during extraction

Output: Real-time extraction trigger service design
```

### test-writer: Todox Integration Tests

```
Create Effect-first integration tests for Todox.

Target: apps/todox/src/__tests__/

Test coverage:
1. Email → Extraction trigger flow
2. Knowledge graph assembly from multiple sources
3. Agent context injection with GraphRAG
4. Progress event streaming
5. Error handling for failed extractions

Mock services:
- LLM service (deterministic responses)
- Email service (fixture emails)
- Embedding service (pre-computed vectors)

Use @beep/testkit patterns with Layer composition.

Output: apps/todox/src/__tests__/knowledge-integration.test.ts
```

---

## Phase 7 Agents

### codebase-researcher: UI Component Patterns

```
Analyze existing UI component patterns in Todox.

Research questions:
1. What component library is used (Radix, Shadcn, custom)?
2. How are complex visualizations handled (charts, graphs)?
3. What state management patterns exist (TanStack Query, signals)?
4. How are real-time updates displayed?
5. What inspector/panel patterns exist?

Examine:
- apps/todox/src/components/
- packages/common/ui/src/
- Any graph visualization libraries in use

Output: UI implementation patterns for knowledge graph components
```

### web-researcher: Graph Visualization Libraries

```
Research graph visualization libraries for React.

Compare:
1. react-force-graph - Force-directed 2D/3D graphs
2. vis-network - Network visualization
3. cytoscape.js - Graph theory visualization
4. d3-force with React - Low-level control
5. reactflow - Node-based UI builder

Evaluation criteria:
- Performance with 1000+ nodes
- Interactivity (pan, zoom, click handlers)
- Customization (node shapes, edge styles)
- React 19 compatibility
- Bundle size

Focus on:
- Entity-relation visualization patterns
- Hierarchical type display
- Evidence span highlighting

Output: Graph visualization library recommendation
```

### mcp-researcher: React Query Patterns for Graphs

```
Research TanStack Query patterns for graph data.

Search topics:
1. Infinite query for paginated graph traversal
2. Dependent queries for entity → relations fetching
3. Optimistic updates for entity editing
4. Cache invalidation strategies for graph mutations
5. Streaming/SSE integration for real-time updates

Focus on:
- Query key design for graph entities
- Normalization vs denormalization trade-offs
- Prefetching adjacent nodes

Output: TanStack Query patterns for knowledge graph UI
```

### test-writer: UI Component Tests

```
Create tests for knowledge graph UI components.

Target: packages/knowledge/ui/src/__tests__/

Test coverage:
1. KnowledgeGraphViewer - rendering, interactions, performance
2. EntityInspector - detail display, editing, evidence spans
3. RelationExplorer - filtering, traversal, confidence display
4. ExtractionProgress - status updates, error states

Testing patterns:
- React Testing Library for component tests
- Storybook stories for visual documentation
- Performance tests for large graphs (1000+ nodes)

Use existing patterns from:
- packages/iam/ui/src/__tests__/
- apps/todox/src/components/__tests__/

Output: packages/knowledge/ui/src/__tests__/
```

---

## Cross-Phase Agents

### reflector: Phase Synthesis

```
Analyze REFLECTION_LOG.md and synthesize learnings.

Input: Current REFLECTION_LOG.md entries

Output:
1. Pattern extraction (reusable approaches)
2. Anti-pattern warnings (what to avoid)
3. Prompt improvements for next phase
4. Documentation updates needed

Apply improvements to:
- MASTER_ORCHESTRATION.md (if workflows need refinement)
- AGENT_PROMPTS.md (this file, if prompts need improvement)
- README.md (if scope changed)
```

### doc-writer: Package Documentation

```
Create documentation for new knowledge packages.

For each new package (knowledge/domain, knowledge/tables, knowledge/server, knowledge/client, knowledge/ui):

1. Create AGENTS.md with:
   - Package architecture overview
   - Key abstractions and their purposes
   - Common modification patterns
   - Gotchas and edge cases

2. Create README.md with:
   - Package purpose
   - Installation
   - Usage examples with Effect patterns
   - API reference

Follow existing patterns from:
- packages/iam/client/AGENTS.md
- packages/iam/server/AGENTS.md
- packages/shared/domain/CLAUDE.md
```

### spec-reviewer: Quality Assessment

```
Review the knowledge-graph-integration spec for quality and completeness.

Check:
1. README.md follows META_SPEC_TEMPLATE structure
2. REFLECTION_LOG.md exists and has entries
3. MASTER_ORCHESTRATION.md has all phases defined
4. Handoff documents follow HANDOFF_STANDARDS.md
5. All code examples use Effect patterns
6. Success criteria are measurable

Output: outputs/spec-review.md with:
- Compliance score
- Issues found
- Recommended fixes
```

---

## Usage Notes

### Launching Agents

Use the Task tool with appropriate subagent_type:

```
Task tool:
  subagent_type: "codebase-researcher"
  prompt: [paste prompt from above]
```

### Agent Output Handling

- **read-only agents** (codebase-researcher, mcp-researcher): Inform orchestrator
- **write-reports agents** (reflector, spec-reviewer): Check outputs/ directory
- **write-files agents** (test-writer, doc-writer): Verify files created

### Parallel Execution

Independent research tasks can run in parallel:

```
Parallel-safe combinations:
- codebase-researcher + web-researcher + mcp-researcher
- test-writer (different packages)

Sequential requirements:
- architecture-pattern-enforcer AFTER structure changes
- reflector AFTER phase completion
- doc-writer AFTER implementation complete
```

### Effect Ontology Reference

When implementing patterns, reference the effect-ontology codebase at `tmp/effect-ontology/`:

| Pattern | Reference File |
|---------|----------------|
| Domain models | `tmp/effect-ontology/packages/@core-v2/src/Domain/Model/Entity.ts` |
| Monoid merge | `tmp/effect-ontology/packages/@core-v2/src/Workflow/Merge.ts` |
| Extraction pipeline | `tmp/effect-ontology/packages/@core-v2/src/Workflow/StreamingExtraction.ts` |
| Ontology service | `tmp/effect-ontology/packages/@core-v2/src/Service/Ontology.ts` |
| Embedding service | `tmp/effect-ontology/packages/@core-v2/src/Service/Embedding.ts` |

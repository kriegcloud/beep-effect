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
- packages/iam/domain/src/index.ts
- packages/iam/tables/src/schema.ts
- packages/iam/server/src/db/Db/Db.ts
- packages/iam/server/src/db/repos/UserRepo.ts
- packages/shared/server/src/DbClient/DbClient.ts
- packages/shared/tables/src/Table.ts

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

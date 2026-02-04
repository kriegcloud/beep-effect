# Knowledge RDF Foundation (Phase 0)

> Establish triple store abstraction enabling all semantic features for the knowledge slice.

---

## Status

**PLANNED** - Blocks Phase 1 (Query & Reasoning) and Phase 4 (GraphRAG+)

---

## Purpose

This specification implements Phase 0 (RDF Foundation) from the knowledge implementation roadmap. It establishes the triple store abstraction that enables SPARQL queries, RDFS reasoning, and semantic knowledge graph operations.

**Key Capabilities Delivered:**
1. **RdfStore service** - Effect.Service wrapping N3.Store for in-memory triple operations
2. **QuadPattern queries** - Pattern matching interface for triple retrieval
3. **Named graph support** - Graph isolation for provenance tracking
4. **RDF serialization** - Turtle, N-Triples, and JSON-LD import/export
5. **RdfBuilder service** - Fluent API for RDF construction

This phase provides the foundation for Phase 1 (SPARQL + Reasoning) and Phase 4 (GraphRAG with grounded answers).

---

## Complexity Classification

Using the formula from `specs/_guide/README.md`:

```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) + (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
```

| Factor | Value | Contribution |
|--------|-------|--------------|
| Phases | 3 | 6 |
| Agents | 3 | 9 |
| Cross-Package Dependencies | 3 | 12 |
| External Dependencies | 1 (N3.js) | 3 |
| Uncertainty | 2 | 10 |
| Research Required | 2 | 4 |
| **Total** | | **44** |

**Classification: High** (41-60 points)

This spec requires multi-phase implementation with external library integration (N3.js) and moderate uncertainty around performance characteristics.

---

## Related Specs

| Spec | Status | Relationship |
|------|--------|--------------|
| `specs/knowledge-architecture-foundation/` | COMPLETE | **Predecessor** - Package allocation, RPC patterns |
| `specs/knowledge-ontology-comparison/` | COMPLETE | Source of roadmap |
| `specs/knowledge-sparql-integration/` | PLANNED | **Successor** - Depends on RdfStore |
| `specs/knowledge-reasoning-engine/` | PLANNED | **Successor** - Depends on RdfStore |
| `specs/knowledge-entity-resolution-v2/` | PLANNED | Parallel track |
| `specs/knowledge-workflow-durability/` | PLANNED | Parallel track |

**Dependency Chain**: Phase -1 (COMPLETE) → **Phase 0 (this spec)** → Phase 1 (SPARQL/Reasoning) → Phase 4 (GraphRAG+)

---

## Goals

1. **RdfStore Service Implementation**
   - Wrap N3.Store with Effect.Service abstraction
   - Support quad add/remove/has operations
   - Implement pattern matching (foundation for SPARQL)
   - Design for future Oxigraph migration

2. **Named Graph Support**
   - Create/drop named graphs
   - Isolate triples by provenance
   - Support default graph operations

3. **RDF Serialization**
   - Parse Turtle ontologies (integrate with existing OntologyParser)
   - Serialize to Turtle, N-Triples formats
   - Support JSON-LD import/export (P2)

4. **RdfBuilder Service**
   - Fluent API for RDF construction
   - Type-safe triple creation
   - Batch operations support

5. **Integration with Existing Services**
   - `OntologyService.load()` optionally populates RdfStore
   - Preserve existing extraction pipeline behavior
   - Enable future semantic query capabilities

---

## Non-Goals

- **NOT** implementing SPARQL query execution (Phase 1)
- **NOT** implementing RDFS/OWL reasoning (Phase 1)
- **NOT** implementing SHACL validation (Phase 1)
- **NOT** optimizing for large-scale graph operations (use N3.Store initially)
- **NOT** creating database persistence for RDF triples (in-memory only for now)
- **NOT** modifying existing Entity/Relation extraction logic

This phase focuses ONLY on the RDF storage abstraction layer.

---

## Deliverables

| Item | Priority | Complexity | Estimate | Dependencies |
|------|----------|-----------|----------|--------------|
| RdfStore service (N3.Store wrapper) | P0 | L | 4 days | Phase -1 |
| QuadPattern query interface | P0 | M | 2 days | RdfStore |
| Named graph support | P0 | M | 2 days | RdfStore |
| RDF serialization (Turtle, N-Triples) | P0 | S | 1 day | RdfStore |
| RdfBuilder service for fluent construction | P1 | M | 2 days | RdfStore |
| RDF/JSON-LD import/export | P2 | S | 1 day | Serialization |

**Total Estimated Duration**: 2-3 weeks (12-15 days)

---

## Phase Overview

### Phase 1: Core RdfStore Service

**Focus**: Implement N3.Store wrapper with Effect patterns

**Deliverables**:
- `packages/knowledge/domain/src/value-objects/rdf/Quad.ts`
- `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts`
- `packages/knowledge/server/src/Rdf/RdfStoreService.ts`
- Unit tests for all public APIs

**Success Criteria**:
- [ ] RdfStore service compiles
- [ ] Quad add/remove/has operations work correctly
- [ ] Pattern matching returns correct results

### Phase 2: Named Graphs and Serialization

**Focus**: Add graph isolation and Turtle serialization

**Deliverables**:
- `packages/knowledge/server/src/Rdf/NamedGraph.ts`
- `packages/knowledge/server/src/Rdf/Serializer.ts`
- `packages/knowledge/domain/src/value-objects/rdf/RdfFormat.ts`

**Success Criteria**:
- [ ] Named graphs isolate triples correctly
- [ ] Serialization round-trips without data loss
- [ ] `OntologyService.load()` can populate RdfStore

### Phase 3: RdfBuilder and Integration

**Focus**: Fluent API and integration with existing services

**Deliverables**:
- `packages/knowledge/server/src/Rdf/RdfBuilder.ts`
- Integration tests with OntologyService
- Performance benchmarks

**Success Criteria**:
- [ ] RdfBuilder provides type-safe triple construction
- [ ] Batch operations perform acceptably (<100ms for 1000 triples)
- [ ] No regressions in existing ExtractionPipeline

---

## Success Criteria

### Implementation Criteria
- [ ] RdfStore can load Turtle ontologies via Effect service
- [ ] QuadPattern queries return correct results for subject/predicate/object patterns
- [ ] Quad insertion maintains immutability semantics
- [ ] All Effect patterns followed (namespace imports, branded EntityIds, Effect.gen)
- [ ] Performance acceptable for graphs <100K triples (benchmarked)

### Phase Completion Criteria (Multi-Session Handoff)
Each phase is complete ONLY when:
- [ ] Phase work is implemented and verified (`bun run check`)
- [ ] REFLECTION_LOG.md updated with phase learnings
- [ ] `handoffs/HANDOFF_P[N+1].md` created (full context document)
- [ ] `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)
- [ ] Both handoff files pass verification checklist from HANDOFF_STANDARDS.md

---

## Key Files to Create

```
packages/knowledge/domain/src/value-objects/rdf/
  index.ts                    # Public exports
  Quad.ts                     # Quad schema (subject, predicate, object, graph)
  QuadPattern.ts              # Pattern matching schema (wildcards supported)
  RdfFormat.ts                # Serialization format enum (Turtle, NTriples, JSONLD)

packages/knowledge/server/src/Rdf/
  index.ts                    # Public exports
  RdfStoreService.ts          # Effect.Service wrapping N3.Store
  NamedGraph.ts               # Named graph support for provenance
  RdfBuilder.ts               # Fluent RDF construction API
  Serializer.ts               # Turtle/N-Triples/JSON-LD serialization
```

---

## Service Interface Design

### RdfStoreService (Core API)

```typescript
// packages/knowledge/server/src/Rdf/RdfStoreService.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { N3 } from "n3";

export class RdfStore extends Effect.Service<RdfStore>()("@beep/knowledge-server/RdfStore", {
  accessors: true,
  effect: Effect.gen(function* () {
    // Initialize N3.Store
    const store = new N3.Store();

    return {
      // Core quad operations
      addQuad: (quad: Quad) =>
        Effect.gen(function* () {
          store.addQuad(quad);
        }).pipe(Effect.withSpan("RdfStore.addQuad")),

      removeQuad: (quad: Quad) =>
        Effect.gen(function* () {
          store.removeQuad(quad);
        }).pipe(Effect.withSpan("RdfStore.removeQuad")),

      hasQuad: (quad: Quad) =>
        Effect.gen(function* () {
          return store.has(quad);
        }).pipe(Effect.withSpan("RdfStore.hasQuad")),

      // Pattern matching (foundation for SPARQL)
      match: (pattern: QuadPattern) =>
        Effect.gen(function* () {
          return store.getQuads(
            pattern.subject,
            pattern.predicate,
            pattern.object,
            pattern.graph
          );
        }).pipe(Effect.withSpan("RdfStore.match")),

      // Named graphs
      createGraph: (iri: string) =>
        Effect.gen(function* () {
          // Named graph creation logic
        }).pipe(Effect.withSpan("RdfStore.createGraph")),

      dropGraph: (iri: string) =>
        Effect.gen(function* () {
          store.deleteGraph(iri);
        }).pipe(Effect.withSpan("RdfStore.dropGraph")),

      // Bulk operations
      loadTurtle: (content: string, graph?: string) =>
        Effect.gen(function* () {
          // Parse and load Turtle content
          return 0; // Return number of quads loaded
        }).pipe(Effect.withSpan("RdfStore.loadTurtle")),

      serialize: (format: RdfFormat, graph?: string) =>
        Effect.gen(function* () {
          // Serialize graph to specified format
          return "";
        }).pipe(Effect.withSpan("RdfStore.serialize")),
    };
  }),
}) {}
```

---

## Dependencies

**Hard Dependency**: Phase -1 (Architectural Foundation) MUST be complete

**Blocks**:
- Phase 1: Query & Reasoning Layer (requires RdfStore for SPARQL execution)
- Phase 4: GraphRAG Enhancements (requires reasoning infrastructure)

**Parallel Work**: Phases 2 (Entity Resolution) and 3 (Workflow Durability) can proceed independently

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| N3.js API changes | Low | Medium | Pin N3.js version, wrap all access through abstraction |
| Performance at scale | Medium | High | Design for future Oxigraph migration, benchmark early |
| Memory pressure from large graphs | Medium | Medium | Add graph size limits, streaming APIs for large loads |
| Integration complexity with OntologyParser | Low | Medium | Reuse existing Turtle parsing, add optional RdfStore population |

---

## Timeline

**Duration**: 2-3 weeks

| Week | Focus |
|------|-------|
| 1 | Phase 1 - Core RdfStore service implementation |
| 2 | Phase 2 - Named graphs and serialization |
| 3 | Phase 3 - RdfBuilder and integration testing |

---

## Team

| Role | Responsibility |
|------|----------------|
| Developer | RdfStore implementation, N3.js integration |
| Reviewer | Pattern compliance, Effect usage |
| QA | Integration testing, performance benchmarking |

---

## Reference Files

### Existing Patterns to Follow

```
packages/documents/domain/src/entities/Document/
  Document.model.ts           # Entity model pattern

packages/knowledge/server/src/services/
  OntologyParser.ts           # Existing Turtle parsing logic

packages/knowledge/server/src/services/
  OntologyService.ts          # Target for integration
```

### Knowledge Slice Current State

```
packages/knowledge/
  domain/src/
    entities/
      Entity/                 # Will use RdfStore for semantic queries
      Relation/               # Will use RdfStore for semantic queries
      Ontology/               # Existing ontology loading
    value-objects/
      Confidence.ts           # Existing value object pattern
  server/src/
    services/
      OntologyParser.ts       # Turtle parsing (will integrate)
      OntologyService.ts      # Will gain RdfStore integration
```

---

## Related Documentation

- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Session learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [IMPLEMENTATION_ROADMAP.md](../knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md) - Full roadmap
- [knowledge-architecture-foundation](../knowledge-architecture-foundation/) - Phase -1 foundation

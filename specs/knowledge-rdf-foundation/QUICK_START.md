# Quick Start: Knowledge RDF Foundation

> 5-minute triage guide for implementing the RDF triple store abstraction.

---

## 5-Minute Triage

### Current State

The RDF foundation is **PLANNED (Phase 0)**. This spec establishes the triple store abstraction that enables all semantic features for the knowledge slice.

### What Exists

- Entity and Relation domain models in `@beep/knowledge-domain`
- OntologyParser service for Turtle parsing
- OntologyService for loading ontologies
- Knowledge graph extraction pipeline

### What Needs Building

- Quad and QuadPattern value objects (RDF triple representation)
- RdfStore service wrapping N3.Store
- Named graph support for provenance tracking
- RDF serialization (Turtle, N-Triples, JSON-LD)
- RdfBuilder service for fluent RDF construction

---

## Critical Context

| Attribute | Value |
|-----------|-------|
| **Complexity** | High (44 points) |
| **Phases** | 3 |
| **Sessions** | 4-6 estimated |
| **Success Metric** | Load and query RDF triples via Effect service |
| **Key Dependency** | Phase -1 (Architectural Foundation) COMPLETE |
| **Blocks** | Phase 1 (SPARQL), Phase 4 (GraphRAG+) |

---

## Phase Overview

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| **P1** | Core RdfStore Service | N3.Store wrapper, quad operations, pattern matching | Pending |
| **P2** | Named Graphs & Serialization | Graph isolation, Turtle/N-Triples import/export | Pending |
| **P3** | RdfBuilder & Integration | Fluent API, OntologyService integration, benchmarks | Pending |

---

## Quick Decision Tree

```
START
  |
  +-- Does Quad value object exist?
  |     +-- NO -> Start Phase 1 (Core Service)
  |     +-- YES -> Does RdfStore.addQuad() work?
  |           +-- NO -> Continue Phase 1
  |           +-- YES -> Can RdfStore serialize to Turtle?
  |                 +-- NO -> Start Phase 2 (Serialization)
  |                 +-- YES -> Does RdfBuilder provide fluent API?
  |                       +-- NO -> Start Phase 3 (Integration)
  |                       +-- YES -> Complete
```

---

## Quick Commands

```bash
# Type check knowledge packages
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint and fix
bun run lint:fix
```

---

## Key Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Triple Store** | N3.js | Mature RDF library, active maintenance, SPARQL-compatible |
| **Storage** | In-memory (Phase 0) | Simplicity, design for future Oxigraph/database persistence |
| **Default Graph** | Empty string `""` | N3.js convention, simplifies null handling |
| **Future Migration** | Oxigraph | Production scale, native SPARQL, performance |

---

## Sample Usage

```typescript
import * as Effect from "effect/Effect";
import { RdfStore, Quad } from "@beep/knowledge-server";

// Add triple
const program = Effect.gen(function* () {
  const store = yield* RdfStore;

  const triple = new Quad({
    subject: "http://example.org/alice",
    predicate: "http://example.org/knows",
    object: "http://example.org/bob",
  });

  yield* store.addQuad(triple);
  const exists = yield* store.hasQuad(triple);
  // exists = true
});

// Pattern matching (wildcard query)
const query = Effect.gen(function* () {
  const store = yield* RdfStore;

  const pattern = new QuadPattern({
    subject: O.none(),  // Wildcard
    predicate: O.some("http://example.org/knows"),
    object: O.some("http://example.org/bob"),
    graph: O.none(),
  });

  const results = yield* store.match(pattern);
  // Results: all subjects that "know" Bob
});
```

---

## Critical Patterns

### Effect Service Pattern

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { N3 } from "n3";

export class RdfStore extends Effect.Service<RdfStore>()(
  "@beep/knowledge-server/RdfStore",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const store = new N3.Store();

      return {
        addQuad: (quad: Quad) =>
          Effect.gen(function* () {
            store.addQuad(quad);
          }).pipe(Effect.withSpan("RdfStore.addQuad")),
        // ...
      };
    }),
  }
) {}
```

### Testing Pattern

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("RdfStore.addQuad adds a quad", () =>
  Effect.gen(function* () {
    const store = yield* RdfStore;
    const quad = new Quad({
      subject: "http://example.org/alice",
      predicate: "http://example.org/knows",
      object: "http://example.org/bob",
    });

    yield* store.addQuad(quad);
    const hasQuad = yield* store.hasQuad(quad);

    strictEqual(hasQuad, true);
  }).pipe(Effect.provide(RdfStore.Default))
);
```

---

## Success Metrics

### Functional Requirements
- Load Turtle ontologies via Effect service
- Execute pattern matching queries (subject/predicate/object wildcards)
- Maintain immutability semantics (no mutation of existing quads)
- Support named graph isolation
- Round-trip serialization without data loss

### Performance Requirements
- Graphs <10K triples: <50ms query time
- Graphs <100K triples: <200ms query time
- Memory footprint scales linearly with triple count

---

## Context Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Full spec with detailed phase breakdown |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 context |
| [IMPLEMENTATION_ROADMAP.md](../knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md) | Full knowledge slice roadmap |

---

## Starting Phase 1

1. Read the orchestrator prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P1.md`
3. Create Quad value object in `packages/knowledge/domain/src/value-objects/rdf/Quad.ts`
4. Create QuadPattern value object in `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts`
5. Create RdfStore service in `packages/knowledge/server/src/Rdf/RdfStoreService.ts`
6. Write unit tests in `packages/knowledge/server/test/Rdf/RdfStoreService.test.ts`
7. Verify with `bun run check --filter @beep/knowledge-server`
8. Update `REFLECTION_LOG.md`
9. Create handoffs for P2

**Estimated Time**: 4-5 hours

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Forgetting Effect patterns | Use `Effect.gen` + `yield*`, never async/await |
| Native JS methods | Use `A.map`, `A.filter` from `effect/Array` |
| Plain string IDs | Use branded EntityIds from `@beep/shared-domain` |
| N3.Quad vs domain Quad | Map N3.Quad structure (`{ value }`) to flat domain schema |
| Default graph handling | Use `""` (empty string) for default graph, convert `Option.none()` via `O.getOrNull()` |
| TypeScript extensions | Import with `.js` extension in tests, NOT `.ts` |
| Skipping handoffs | Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` |

---

## Related Specs

| Spec | Relationship |
|------|-------------|
| `knowledge-architecture-foundation` | **Predecessor** - Package allocation, RPC patterns (COMPLETE) |
| `knowledge-ontology-comparison` | Source of implementation roadmap (COMPLETE) |
| `knowledge-sparql-integration` | **Successor** - SPARQL query execution (depends on RdfStore) |
| `knowledge-reasoning-engine` | **Successor** - RDFS/OWL reasoning (depends on RdfStore) |
| `knowledge-entity-resolution-v2` | Parallel track (independent) |

---

## Need Help?

- Full spec: [README.md](./README.md)
- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
- N3.js documentation: https://github.com/rdfjs/N3.js
- RDF 1.1 concepts: https://www.w3.org/TR/rdf11-concepts/

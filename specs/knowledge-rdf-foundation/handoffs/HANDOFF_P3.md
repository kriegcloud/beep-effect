# Phase 3 Handoff - RdfBuilder and Integration

> Context document for implementing fluent RDF construction API and integration with existing services.

---

## Working Context (≤2,000 tokens)

### Phase 3 Mission

Implement fluent RdfBuilder API for type-safe triple construction, integrate RdfStore with OntologyService for optional RDF population, and create performance benchmarks.

### Tasks to Complete

| Task | Priority | Files Affected | Verification |
|------|----------|----------------|--------------|
| Create RdfBuilder service | P0 | `packages/knowledge/server/src/Rdf/RdfBuilder.ts` | Type-check passes |
| Add OntologyService integration | P1 | `packages/knowledge/server/src/Ontology/OntologyService.ts` | Tests pass |
| Create RdfBuilder tests | P0 | `packages/knowledge/server/test/Rdf/RdfBuilder.test.ts` | Tests pass |
| Create integration tests | P1 | `packages/knowledge/server/test/Rdf/integration.test.ts` | Tests pass |
| Create performance benchmark | P2 | `packages/knowledge/server/test/Rdf/benchmark.test.ts` | <100ms for 1000 triples |
| Update exports | P0 | `*/index.ts` | Exports available |
| Update REFLECTION_LOG.md | P0 | `specs/knowledge-rdf-foundation/REFLECTION_LOG.md` | Entry added |

### Success Criteria

- [ ] RdfBuilder provides fluent API for triple construction
- [ ] RdfBuilder.subject().predicate().object() chain creates Quad
- [ ] RdfBuilder supports batch operations (multiple triples)
- [ ] OntologyService.load() optionally populates RdfStore
- [ ] Performance: <100ms to add 1000 triples
- [ ] No regressions in existing ExtractionPipeline
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings

### Critical Constraints

1. **MUST use Effect patterns** - No async/await, use Effect.gen
2. **MUST use namespace imports** - `import * as Effect from "effect/Effect"`
3. **MUST use @beep/testkit** - `effect()` helper, NOT raw bun:test
4. **MUST NOT break existing services** - OntologyService, ExtractionPipeline unchanged
5. **MUST be optional** - RdfStore population is opt-in

---

## Episodic Context (≤1,000 tokens)

### Phase 1 + Phase 2 Completion Summary

**Phase 1** implemented core RdfStore:
- Effect.Service wrapping N3.Store
- Quad CRUD operations (addQuad, removeQuad, hasQuad, match)
- Accessor methods (getSubjects, getPredicates, getObjects, getGraphs)
- 38 passing tests

**Phase 2** added serialization:
- RdfFormat enum (Turtle, NTriples, JSONLD)
- Serializer service with parseTurtle, serialize methods
- Named graph operations (createGraph, dropGraph, listGraphs)
- 38 additional passing tests (130 total)
- Round-trip preservation verified

### Key Learnings from Phase 1-2

1. **Effect.async for callbacks** - N3.Parser/Writer use callbacks, wrap with Effect.async
2. **Domain type conversions** - IRI, BlankNode, Literal require careful N3 conversion
3. **Graph wildcard behavior** - `undefined` is wildcard in QuadPattern, not "default graph only"
4. **Service dependencies** - Use Layer.provideMerge for shared instances in tests
5. **Idempotent operations** - N3.Store ignores duplicate quads

### Key Decisions from Phase -1

1. **Package allocation** - Domain owns value objects, server owns implementations
2. **EntityId standards** - All entities use branded IDs from @beep/shared-domain
3. **RPC patterns** - Slice-specific RPCs with `.prefix()` namespacing

---

## Semantic Context (≤500 tokens)

### Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| N3.js | ^1.17.0 | RDF parsing, serialization, storage |
| Effect | 3.x | Service abstraction, error handling |
| Schema | @effect/schema | Type-safe value objects |

### Existing Services

```typescript
// OntologyService - already exists
export class OntologyService extends Effect.Service<OntologyService>()("@beep/knowledge-server/OntologyService", {
  accessors: true,
  dependencies: [OntologyRepo.Default],
  effect: Effect.gen(function* () {
    const repo = yield* OntologyRepo;
    // ... existing methods
    return {
      load: (id: OntologyId, options?: { populateRdfStore?: boolean }) => ...,
    };
  }),
}) {}
```

### Package Structure

```
packages/knowledge/server/src/Rdf/
  index.ts                    # Update with RdfBuilder export
  RdfStoreService.ts          # Existing - Phase 1
  Serializer.ts               # Existing - Phase 2
  RdfBuilder.ts               # NEW - Phase 3

packages/knowledge/server/test/Rdf/
  RdfStoreService.test.ts     # Existing - Phase 1
  Serializer.test.ts          # Existing - Phase 2
  RdfBuilder.test.ts          # NEW - Phase 3
  integration.test.ts         # NEW - Phase 3
  benchmark.test.ts           # NEW - Phase 3
```

---

## Procedural Context (Links Only)

### Required Reading

- [Effect Patterns](../../../../.claude/rules/effect-patterns.md) - Namespace imports, Schema usage
- [Testing Patterns](../../../../.claude/commands/patterns/effect-testing-patterns.md) - @beep/testkit usage
- [HANDOFF_P1.md](./HANDOFF_P1.md) - Phase 1 context
- [HANDOFF_P2.md](./HANDOFF_P2.md) - Phase 2 context

### Reference Implementations

- `packages/knowledge/server/src/Rdf/RdfStoreService.ts` - Phase 1 patterns
- `packages/knowledge/server/src/Rdf/Serializer.ts` - Phase 2 patterns
- `packages/knowledge/server/src/Ontology/OntologyService.ts` - Integration target

### Verification Commands

```bash
# Type-check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint:fix --filter @beep/knowledge-server
```

---

## Implementation Specifications

### 1. RdfBuilder Service

**File**: `packages/knowledge/server/src/Rdf/RdfBuilder.ts`

```typescript
import { type IRI, Literal, makeIRI, Quad } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { RdfStore } from "./RdfStoreService";

/**
 * Subject context for fluent building
 */
interface SubjectContext {
  readonly subject: Quad["subject"];
  readonly graph: O.Option<IRI.Type>;
}

/**
 * Predicate context for fluent building
 */
interface PredicateContext extends SubjectContext {
  readonly predicate: Quad["predicate"];
}

/**
 * RdfBuilder Effect.Service
 *
 * Provides fluent API for RDF triple construction.
 *
 * @since 0.1.0
 * @category services
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const builder = yield* RdfBuilder;
 *
 *   // Build single triple
 *   yield* builder
 *     .subject(makeIRI("http://example.org/alice"))
 *     .predicate(makeIRI("http://xmlns.com/foaf/0.1/name"))
 *     .literal("Alice")
 *     .add();
 *
 *   // Build with graph
 *   yield* builder
 *     .inGraph(makeIRI("http://example.org/graph1"))
 *     .subject(makeIRI("http://example.org/bob"))
 *     .predicate(makeIRI("http://xmlns.com/foaf/0.1/name"))
 *     .literal("Bob")
 *     .add();
 * });
 * ```
 */
export class RdfBuilder extends Effect.Service<RdfBuilder>()("@beep/knowledge-server/RdfBuilder", {
  accessors: true,
  effect: Effect.gen(function* () {
    const store = yield* RdfStore;

    return {
      /**
       * Start building in a specific named graph
       */
      inGraph: (graph: IRI.Type) => createSubjectBuilder(store, O.some(graph)),

      /**
       * Start building in the default graph
       */
      subject: (subject: Quad["subject"]) => createPredicateBuilder(store, {
        subject,
        graph: O.none(),
      }),

      /**
       * Build multiple quads at once
       */
      batch: (quads: ReadonlyArray<Quad>): Effect.Effect<void> =>
        store.addQuads(quads).pipe(
          Effect.withSpan("RdfBuilder.batch", {
            attributes: { count: A.length(quads) },
          })
        ),
    };
  }),
}) {}

// Internal builder functions...
```

**Key Features**:
- `subject(iri)` - Start triple with subject
- `predicate(iri)` - Add predicate to subject
- `literal(value, lang?)` - Complete with literal object
- `object(iri)` - Complete with IRI object
- `add()` - Execute and add to store
- `inGraph(iri)` - Build in named graph
- `batch(quads)` - Add multiple quads at once

### 2. OntologyService Integration

**File**: Modify `packages/knowledge/server/src/Ontology/OntologyService.ts`

Add optional RdfStore population:

```typescript
load: (id: OntologyId, options?: { populateRdfStore?: boolean }): Effect.Effect<Ontology, OntologyError> =>
  Effect.gen(function* () {
    const ontology = yield* repo.findById(id);

    // Optional: populate RdfStore with ontology triples
    if (options?.populateRdfStore) {
      const rdfStore = yield* RdfStore;
      const serializer = yield* Serializer;
      // Load Turtle content into store
      yield* serializer.parseTurtle(ontology.content, makeIRI(`urn:ontology:${id}`));
    }

    return ontology;
  }).pipe(Effect.withSpan("OntologyService.load")),
```

**Important**: This should be opt-in via options parameter to avoid breaking existing behavior.

### 3. Performance Benchmark

**File**: `packages/knowledge/server/test/Rdf/benchmark.test.ts`

```typescript
import { effect, assertTrue } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

effect("should add 1000 triples in under 100ms", () =>
  Effect.gen(function* () {
    const store = yield* RdfStore;
    const quads = generateTestQuads(1000);

    const start = yield* Effect.clockWith(clock => clock.currentTimeMillis);
    yield* store.addQuads(quads);
    const end = yield* Effect.clockWith(clock => clock.currentTimeMillis);

    const duration = end - start;
    assertTrue(duration < 100);
  }).pipe(Effect.provide(RdfStore.Default))
);
```

---

## Known Issues & Gotchas

### 1. Service Dependency Order

**Issue**: RdfBuilder depends on RdfStore; OntologyService depends on RdfStore and Serializer

**Solution**: Use proper Layer composition:
```typescript
const TestLayer = Layer.mergeAll(
  RdfBuilder.Default,
  Serializer.Default,
  RdfStore.Default
);
```

### 2. Breaking Existing Behavior

**Issue**: OntologyService.load() must not change behavior for existing callers

**Solution**: Make RdfStore population opt-in via options parameter with default `false`

### 3. Fluent API Return Types

**Issue**: Fluent builders need type-safe chaining with proper Effect return types

**Solution**: Use intermediate interfaces (SubjectContext, PredicateContext) and return Effect only at `add()`

---

## Implementation Order

1. **Create RdfBuilder service** (2 hours)
   - Fluent API with subject/predicate/object chaining
   - Graph context support
   - Batch operations

2. **Create RdfBuilder tests** (1.5 hours)
   - Single triple building
   - Named graph building
   - Batch operations
   - Edge cases

3. **Add OntologyService integration** (1 hour)
   - Optional populateRdfStore parameter
   - Preserve existing behavior

4. **Create integration tests** (1 hour)
   - OntologyService + RdfStore
   - Verify no regressions

5. **Create performance benchmark** (30 min)
   - 1000 triple benchmark
   - Document baseline

6. **Update exports and verify** (30 min)
   - Update index files
   - Run verification commands

7. **Update REFLECTION_LOG.md** (15 min)
   - Document Phase 3 learnings

**Estimated Total Time**: 6-7 hours

---

## Handoff Checklist

- [x] Working context: Tasks, success criteria, constraints documented
- [x] Episodic context: Phase 1-2 summary, key learnings captured
- [x] Semantic context: Service interface, package structure
- [x] Procedural context: Links to patterns, references, commands
- [x] Implementation specs: RdfBuilder, OntologyService integration
- [x] Known issues: Gotchas documented with solutions
- [x] Implementation order: Step-by-step sequence with time estimates

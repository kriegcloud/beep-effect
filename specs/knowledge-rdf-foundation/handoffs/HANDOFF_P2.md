# Phase 2 Handoff - Named Graphs and Serialization

> Context document for implementing named graph support and RDF serialization.

---

## Working Context (≤2,000 tokens)

### Phase 2 Mission

Add named graph support for provenance isolation and implement Turtle/N-Triples serialization. Integrate with existing OntologyParser for seamless ontology loading into RdfStore.

### Tasks to Complete

| Task | Priority | Files Affected | Verification |
|------|----------|----------------|--------------|
| Create RdfFormat enum | P0 | `packages/knowledge/domain/src/value-objects/rdf/RdfFormat.ts` | Type-check passes |
| Create Serializer service | P0 | `packages/knowledge/server/src/Rdf/Serializer.ts` | Type-check passes |
| Add named graph operations | P0 | `packages/knowledge/server/src/Rdf/RdfStoreService.ts` | Tests pass |
| Create Serializer tests | P0 | `packages/knowledge/server/test/Rdf/Serializer.test.ts` | Tests pass |
| Update domain/server index exports | P0 | `*/index.ts` | Exports available |
| Update REFLECTION_LOG.md | P0 | `specs/knowledge-rdf-foundation/REFLECTION_LOG.md` | Entry added |
| **Create Phase 3 handoff documents** | P0 | `handoffs/HANDOFF_P3.md`, `handoffs/P3_ORCHESTRATOR_PROMPT.md` | Documents created |

### Success Criteria

- [ ] RdfFormat enum with Turtle, NTriples, JSONLD variants
- [ ] Serializer service parses Turtle into RdfStore
- [ ] Serializer service exports RdfStore to Turtle/N-Triples
- [ ] Named graph operations: createGraph, dropGraph, getGraphs
- [ ] Serialization round-trips without data loss
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] **HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md created**

### Critical Constraints

1. **MUST use Effect patterns** - No async/await, use Effect.gen
2. **MUST use namespace imports** - `import * as Effect from "effect/Effect"`
3. **MUST use S.Literal for enums** - `S.Literal("Turtle", "NTriples", "JSONLD")`
4. **MUST wrap operations in spans** - `Effect.withSpan("Serializer.operation")`
5. **MUST use @beep/testkit** - `effect()` helper, NOT raw bun:test
6. **MUST create Phase 3 handoff documents** - Required for phase completion

---

## Episodic Context (≤1,000 tokens)

### Phase 1 Completion Summary

Phase 1 implemented the core RdfStore service with:
- **RdfStoreService.ts** - Effect.Service wrapping N3.Store
- **Type-safe conversions** - IRI, BlankNode, Literal ↔ N3 terms
- **Full quad operations** - addQuad, removeQuad, hasQuad, match, countMatches, clear
- **Accessor methods** - getSubjects, getPredicates, getObjects, getGraphs
- **38 passing tests** - CRUD, pattern matching, term types, edge cases

### Key Learnings from Phase 1

1. **Domain types are sophisticated** - IRI, BlankNode, Literal are branded types, not plain strings
2. **N3.js conversion requires care** - BlankNode prefix `_:` handling, Literal language/datatype
3. **RdfJsTerm interfaces** - Generic interfaces handle type mismatches between @rdfjs/types and @types/n3
4. **TaggedError for defects** - RdfTermConversionError replaces native Error throws

### Key Decisions from Phase -1

1. **Package allocation** - Domain owns value objects, server owns implementations
2. **EntityId standards** - All entities use branded IDs from @beep/shared-domain
3. **RPC patterns** - Slice-specific RPCs with `.prefix()` namespacing

### Roadmap Position

**Current Phase**: Phase 0, Part 2 (Named Graphs and Serialization)
**Next Phase**: Phase 0, Part 3 (RdfBuilder and Integration)
**Blocks**: Phase 1 (SPARQL), Phase 4 (GraphRAG+)

---

## Semantic Context (≤500 tokens)

### Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| N3.js | ^1.17.0 | RDF parsing, serialization, storage |
| Effect | 3.x | Service abstraction, error handling |
| Schema | @effect/schema | Type-safe value objects |

### N3.js Serialization API

```typescript
import * as N3 from "n3";

// Parsing Turtle
const parser = new N3.Parser();
parser.parse(turtleString, (error, quad, prefixes) => {
  if (quad) store.addQuad(quad);
  else if (prefixes) { /* parsing complete */ }
});

// Serializing to Turtle
const writer = new N3.Writer({ format: 'text/turtle' });
for (const quad of store.getQuads(null, null, null, null)) {
  writer.addQuad(quad);
}
writer.end((error, result) => {
  // result is Turtle string
});

// N-Triples format
const ntWriter = new N3.Writer({ format: 'N-Triples' });
```

### Package Structure

```
packages/knowledge/
  domain/src/value-objects/rdf/
    RdfFormat.ts              # NEW - Serialization format enum
  server/src/Rdf/
    RdfStoreService.ts        # MODIFY - Add graph operations
    Serializer.ts             # NEW - Parse/serialize RDF
  server/test/Rdf/
    Serializer.test.ts        # NEW - Serialization tests
```

---

## Procedural Context (Links Only)

### Required Reading

- [Effect Patterns](../../../../.claude/rules/effect-patterns.md) - Namespace imports, Schema usage
- [Testing Patterns](../../../../.claude/commands/patterns/effect-testing-patterns.md) - @beep/testkit usage
- [HANDOFF_P1.md](./HANDOFF_P1.md) - Phase 1 context (completed)

### Reference Implementations

- `packages/knowledge/server/src/Rdf/RdfStoreService.ts` - Phase 1 implementation
- `packages/knowledge/server/src/Ontology/OntologyParser.ts` - Existing Turtle parsing
- `packages/knowledge/server/test/Rdf/RdfStoreService.test.ts` - Test patterns

### Verification Commands

```bash
# Type-check domain
bun run check --filter @beep/knowledge-domain

# Type-check server
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint:fix --filter @beep/knowledge-domain
bun run lint:fix --filter @beep/knowledge-server
```

---

## Implementation Specifications

### 1. RdfFormat Enum

**File**: `packages/knowledge/domain/src/value-objects/rdf/RdfFormat.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/RdfFormat");

/**
 * RDF serialization formats supported by the knowledge slice.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const RdfFormat = S.Literal("Turtle", "NTriples", "JSONLD").annotations(
  $I.annotations("RdfFormat", {
    title: "RDF Format",
    description: "Supported RDF serialization formats",
  })
);

export type RdfFormat = typeof RdfFormat.Type;

/**
 * MIME types for RDF formats
 */
export const RdfFormatMimeType: Record<RdfFormat, string> = {
  Turtle: "text/turtle",
  NTriples: "application/n-triples",
  JSONLD: "application/ld+json",
};
```

### 2. Serializer Service

**File**: `packages/knowledge/server/src/Rdf/Serializer.ts`

```typescript
import { RdfFormat, RdfFormatMimeType, Quad } from "@beep/knowledge-domain/value-objects";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as N3 from "n3";
import { RdfStore } from "./RdfStoreService";

/**
 * RDF Serializer Effect.Service
 *
 * Provides parsing and serialization capabilities for RDF formats.
 *
 * @since 0.1.0
 * @category services
 */
export class Serializer extends Effect.Service<Serializer>()("@beep/knowledge-server/Serializer", {
  accessors: true,
  dependencies: [RdfStore.Default],
  effect: Effect.gen(function* () {
    const store = yield* RdfStore;

    return {
      /**
       * Parse Turtle content and load into RdfStore
       *
       * @param content - Turtle string
       * @param graph - Optional named graph IRI
       * @returns Number of quads loaded
       */
      parseTurtle: (content: string, graph?: string): Effect.Effect<number, SerializerError> =>
        Effect.async<number, SerializerError>((resume) => {
          const parser = new N3.Parser();
          let count = 0;

          parser.parse(content, (error, quad, _prefixes) => {
            if (error) {
              resume(Effect.fail(new SerializerError({ ... })));
            } else if (quad) {
              // Convert N3.Quad to domain Quad and add to store
              count++;
            } else {
              resume(Effect.succeed(count));
            }
          });
        }).pipe(Effect.withSpan("Serializer.parseTurtle")),

      /**
       * Serialize quads to specified format
       *
       * @param format - Target format (Turtle, NTriples)
       * @param graph - Optional graph to serialize (all if omitted)
       * @returns Serialized string
       */
      serialize: (format: RdfFormat, graph?: string): Effect.Effect<string, SerializerError> =>
        Effect.gen(function* () {
          const quads = yield* store.match(new QuadPattern({ graph }));
          // Use N3.Writer to serialize
        }).pipe(Effect.withSpan("Serializer.serialize")),
    };
  }),
}) {}
```

### 3. Named Graph Operations (Add to RdfStoreService)

Add these methods to the existing RdfStoreService:

```typescript
/**
 * Create a named graph (no-op if exists)
 * Note: N3.Store creates graphs implicitly, this tracks explicitly created ones
 */
createGraph: (iri: IRI.Type): Effect.Effect<void> =>
  Effect.sync(() => {
    // Track in internal set of created graphs
  }).pipe(Effect.withSpan("RdfStore.createGraph")),

/**
 * Drop a named graph and all its quads
 */
dropGraph: (iri: IRI.Type): Effect.Effect<void> =>
  Effect.sync(() => {
    store.deleteGraph(iri);
  }).pipe(Effect.withSpan("RdfStore.dropGraph")),

/**
 * List all named graphs (excluding default graph)
 */
listGraphs: (): Effect.Effect<ReadonlyArray<IRI.Type>> =>
  Effect.sync(() => {
    const graphs = store.getGraphs(null, null, null);
    return A.filter(
      A.map(A.fromIterable(graphs), rdfJsGraphToDomain),
      (g): g is IRI.Type => g !== undefined
    );
  }).pipe(Effect.withSpan("RdfStore.listGraphs")),
```

---

## Known Issues & Gotchas

### 1. N3.Parser is Callback-Based

**Issue**: N3.Parser uses Node.js callback style, not Promise/Effect

**Solution**: Wrap in `Effect.async` with proper error handling

```typescript
Effect.async<number, SerializerError>((resume) => {
  parser.parse(content, (error, quad, prefixes) => {
    if (error) resume(Effect.fail(...));
    else if (quad) { /* accumulate */ }
    else resume(Effect.succeed(count)); // null quad = done
  });
});
```

### 2. N3.Writer is Also Callback-Based

**Issue**: N3.Writer.end() takes callback

**Solution**: Same `Effect.async` pattern

### 3. Graph IRI vs Default Graph

**Issue**: Default graph has `""` value in N3, but domain uses `undefined`

**Solution**: Filter out empty string when listing graphs, convert appropriately

### 4. Prefix Handling

**Issue**: Turtle parsing yields prefixes that should be preserved for serialization

**Solution**: Store prefixes in service state, use in serialization

---

## Implementation Order

1. **Create RdfFormat enum** (15 min)
   - `RdfFormat.ts` with Turtle, NTriples, JSONLD
   - Export from domain index

2. **Add named graph operations to RdfStore** (1 hour)
   - createGraph, dropGraph, listGraphs
   - Tests for graph operations

3. **Create Serializer service** (2 hours)
   - parseTurtle with Effect.async
   - serialize to Turtle/N-Triples
   - Error handling with SerializerError

4. **Create Serializer tests** (1.5 hours)
   - Round-trip tests
   - Named graph serialization
   - Error cases

5. **Update exports and verify** (30 min)
   - Update index files
   - Run verification commands

6. **Update REFLECTION_LOG.md** (15 min)
   - Document Phase 2 learnings

7. **Create Phase 3 handoff documents** (30 min)
   - HANDOFF_P3.md
   - P3_ORCHESTRATOR_PROMPT.md

**Estimated Total Time**: 6-7 hours

---

## Phase 3 Preview

After Phase 2 completes, Phase 3 will add:
- **RdfBuilder** - Fluent API for triple construction
- **OntologyService integration** - Optional RdfStore population
- **Performance benchmarks** - Verify <100ms for 1000 triples
- **Integration tests** - Verify no regressions in ExtractionPipeline

---

## Handoff Checklist

- [x] Working context: Tasks, success criteria, constraints documented
- [x] Episodic context: Phase 1 summary, key learnings captured
- [x] Semantic context: N3.js API, package structure
- [x] Procedural context: Links to patterns, references, commands
- [x] Implementation specs: RdfFormat, Serializer, graph operations
- [x] Known issues: Gotchas documented with solutions
- [x] Implementation order: Step-by-step sequence with time estimates
- [x] **Explicit requirement**: Phase 3 handoff documents in success criteria

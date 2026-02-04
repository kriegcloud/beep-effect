# Phase 1 Handoff - Core RdfStore Service

> Context document for implementing the core RdfStore service wrapping N3.Store.

---

## Working Context (≤2,000 tokens)

### Phase 1 Mission

Implement the core RdfStore service as an Effect.Service wrapping N3.Store, providing quad operations and pattern matching capabilities.

### Tasks to Complete

| Task | Priority | Files Affected | Verification |
|------|----------|----------------|--------------|
| Create Quad schema | P0 | `packages/knowledge/domain/src/value-objects/rdf/Quad.ts` | Type-check passes |
| Create QuadPattern schema | P0 | `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts` | Type-check passes |
| Create RdfStoreService | P0 | `packages/knowledge/server/src/Rdf/RdfStoreService.ts` | Type-check passes |
| Create unit tests | P0 | `packages/knowledge/server/test/Rdf/RdfStoreService.test.ts` | Tests pass |
| Update domain index | P0 | `packages/knowledge/domain/src/index.ts` | Exports available |
| Update server index | P0 | `packages/knowledge/server/src/index.ts` | Exports available |
| Update REFLECTION_LOG.md | P0 | `specs/knowledge-rdf-foundation/REFLECTION_LOG.md` | Entry added |
| **Create Phase 2 handoff documents** | P0 | `handoffs/HANDOFF_P2.md`, `handoffs/P2_ORCHESTRATOR_PROMPT.md` | Documents created |

### Success Criteria

- [ ] RdfStore service compiles without errors
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] Quad add/remove/has operations work correctly (tested)
- [ ] Pattern matching returns correct results (tested)
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] **HANDOFF_P2.md created** (full context for Phase 2)
- [ ] **P2_ORCHESTRATOR_PROMPT.md created** (copy-paste prompt for Phase 2)

### Critical Constraints

1. **MUST use Effect patterns** - No async/await, use Effect.gen
2. **MUST use namespace imports** - `import * as Effect from "effect/Effect"`
3. **MUST use Schema classes** - `S.Class` for Quad, `S.Struct` for QuadPattern
4. **MUST wrap operations in spans** - `Effect.withSpan("RdfStore.operation")`
5. **MUST use @beep/testkit** - `effect()` helper, NOT raw bun:test
6. **MUST create Phase 2 handoff documents** - Required for phase completion

---

## Episodic Context (≤1,000 tokens)

### Phase -1 Completion Summary

The architectural foundation phase established:
- Package allocation: domain owns value objects, server owns implementations
- EntityId standards: All entities use branded IDs from `@beep/shared-domain`
- RPC patterns: Slice-specific RPCs with `.prefix()` namespacing
- Layer boundaries: Clear ALLOWED/FORBIDDEN lists per package

### Key Decisions from Phase -1

1. **N3.Store as initial backend** - Start with N3.js, design for Oxigraph migration
2. **In-memory only for Phase 0** - Database persistence deferred to later phases
3. **Integration with OntologyParser** - Reuse existing Turtle parsing logic
4. **Pattern matching foundation** - QuadPattern interface enables future SPARQL

### Roadmap Position

**Current Phase**: Phase 0, Part 1 (Core RdfStore)
**Next Phase**: Phase 0, Part 2 (Named Graphs and Serialization)
**Blocks**: Phase 1 (SPARQL), Phase 4 (GraphRAG+)

---

## Semantic Context (≤500 tokens)

### Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| N3.js | ^1.17.0 | RDF parsing and storage |
| Effect | 3.x | Service abstraction, error handling |
| Schema | @effect/schema | Type-safe value objects |

### Knowledge Slice EntityIds

```typescript
// From @beep/shared-domain
KnowledgeEntityIds.EntityId       // Entity records
KnowledgeEntityIds.RelationId     // Relation records
KnowledgeEntityIds.OntologyId     // Ontology definitions
KnowledgeEntityIds.MentionRecordId // Extraction evidence
```

### Package Structure

```
packages/knowledge/
  domain/src/value-objects/rdf/    # Quad, QuadPattern schemas
  server/src/Rdf/                  # RdfStore implementation
  server/test/Rdf/                 # Tests
```

---

## Procedural Context (Links Only)

### Required Reading

- [Effect Patterns](../../../../.claude/rules/effect-patterns.md) - Namespace imports, Schema usage
- [Testing Patterns](../../../../.claude/commands/patterns/effect-testing-patterns.md) - @beep/testkit usage
- [IMPLEMENTATION_ROADMAP.md](../../knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md) - Phase 0 details

### Reference Implementations

- `packages/knowledge/server/src/services/OntologyParser.ts` - Existing N3.js usage
- `packages/documents/domain/src/entities/Document/Document.model.ts` - Schema.Class pattern
- `packages/documents/server/src/DocumentService.ts` - Effect.Service pattern

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

### 1. Quad Schema

**File**: `packages/knowledge/domain/src/value-objects/rdf/Quad.ts`

```typescript
import * as S from "effect/Schema";

/**
 * Represents an RDF quad (triple + graph).
 *
 * @category models
 * @since 0.1.0
 */
export class Quad extends S.Class<Quad>("Quad")({
  subject: S.String,   // IRI or blank node
  predicate: S.String, // IRI only
  object: S.String,    // IRI, blank node, or literal
  graph: S.optional(S.String, { default: () => "" }), // Default graph if omitted
}) {}
```

**Key Decisions**:
- Use `S.Class` for structural identity
- Use `S.String` for IRIs (validation deferred to Phase 1)
- Default graph is empty string (N3.js convention)

### 2. QuadPattern Schema

**File**: `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts`

```typescript
import * as S from "effect/Schema";
import * as O from "effect/Option";

/**
 * Pattern for matching RDF quads. Use Option.none() for wildcards.
 *
 * @category models
 * @since 0.1.0
 */
export class QuadPattern extends S.Class<QuadPattern>("QuadPattern")({
  subject: S.OptionFromNullOr(S.String),   // None = wildcard
  predicate: S.OptionFromNullOr(S.String), // None = wildcard
  object: S.OptionFromNullOr(S.String),    // None = wildcard
  graph: S.OptionFromNullOr(S.String),     // None = wildcard
}) {}
```

**Key Decisions**:
- Use `Option<string>` for wildcards (None = match any)
- `OptionFromNullOr` allows `null` in API, converts to Option internally

### 3. RdfStoreService

**File**: `packages/knowledge/server/src/Rdf/RdfStoreService.ts`

**Service Structure**:

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { N3 } from "n3";
import { Quad, QuadPattern } from "@beep/knowledge-domain";

export class RdfStore extends Effect.Service<RdfStore>()("@beep/knowledge-server/RdfStore", {
  accessors: true,
  effect: Effect.gen(function* () {
    const store = new N3.Store();

    return {
      addQuad: (quad: Quad): Effect.Effect<void> =>
        Effect.gen(function* () {
          store.addQuad(
            quad.subject,
            quad.predicate,
            quad.object,
            quad.graph || ""
          );
        }).pipe(Effect.withSpan("RdfStore.addQuad")),

      removeQuad: (quad: Quad): Effect.Effect<void> =>
        Effect.gen(function* () {
          store.removeQuad(
            quad.subject,
            quad.predicate,
            quad.object,
            quad.graph || ""
          );
        }).pipe(Effect.withSpan("RdfStore.removeQuad")),

      hasQuad: (quad: Quad): Effect.Effect<boolean> =>
        Effect.gen(function* () {
          return store.has(
            quad.subject,
            quad.predicate,
            quad.object,
            quad.graph || ""
          );
        }).pipe(Effect.withSpan("RdfStore.hasQuad")),

      match: (pattern: QuadPattern): Effect.Effect<ReadonlyArray<Quad>> =>
        Effect.gen(function* () {
          const quads = store.getQuads(
            O.getOrNull(pattern.subject),
            O.getOrNull(pattern.predicate),
            O.getOrNull(pattern.object),
            O.getOrNull(pattern.graph)
          );
          // Convert N3.Quad[] to Quad[]
          return quads.map((q) => new Quad({
            subject: q.subject.value,
            predicate: q.predicate.value,
            object: q.object.value,
            graph: q.graph.value,
          }));
        }).pipe(Effect.withSpan("RdfStore.match")),
    };
  }),
}) {}
```

**Critical Patterns**:
- Service tag: `"@beep/knowledge-server/RdfStore"`
- `accessors: true` enables `yield* RdfStore`
- MUST use `Effect.gen(function* () { ... })`
- NEVER use `async/await`

### 4. Unit Tests

**File**: `packages/knowledge/server/test/Rdf/RdfStoreService.test.ts`

**Test Structure**:

```typescript
import { effect, strictEqual, deepStrictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { RdfStore } from "../../src/Rdf/RdfStoreService.js";
import { Quad, QuadPattern } from "@beep/knowledge-domain";

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

effect("RdfStore.match with wildcard subject", () =>
  Effect.gen(function* () {
    const store = yield* RdfStore;

    // Add test data
    yield* store.addQuad(new Quad({
      subject: "http://example.org/alice",
      predicate: "http://example.org/knows",
      object: "http://example.org/bob",
    }));

    // Query with wildcard
    const pattern = new QuadPattern({
      subject: O.none(),
      predicate: O.some("http://example.org/knows"),
      object: O.some("http://example.org/bob"),
      graph: O.none(),
    });

    const results = yield* store.match(pattern);

    strictEqual(results.length, 1);
    strictEqual(results[0].subject, "http://example.org/alice");
  }).pipe(Effect.provide(RdfStore.Default))
);
```

**Critical Patterns**:
- Use `effect()` from `@beep/testkit` (NOT `test()` from bun:test)
- Use `strictEqual()` for primitive assertions
- Use `deepStrictEqual()` for object/array assertions
- Provide `RdfStore.Default` layer

---

## Known Issues & Gotchas

### 1. N3.Quad vs Domain Quad Conversion

**Issue**: N3.js uses `{ subject: { value: "..." }, ... }` structure, domain uses flat `{ subject: "..." }`

**Solution**: Map N3.Quad to domain Quad in `match()` method

### 2. Default Graph Handling

**Issue**: N3.Store uses empty string `""` for default graph, Option patterns may use `None`

**Solution**: Convert `Option<string>` to `string | null` via `O.getOrNull()`, treat `""` and `null` as default graph

### 3. TypeScript Path Aliases

**Issue**: Tests must use `.js` extensions for imports even though source is `.ts`

**Solution**: Import as `../../src/Rdf/RdfStoreService.js` (NOT `.ts`)

---

## Implementation Order

1. **Create domain value objects** (30 min)
   - `Quad.ts`
   - `QuadPattern.ts`
   - Update `domain/src/index.ts`

2. **Create RdfStoreService** (2 hours)
   - Implement service skeleton
   - Add quad operations
   - Add pattern matching
   - Update `server/src/index.ts`

3. **Type-check** (15 min)
   - Run `bun run check --filter @beep/knowledge-domain`
   - Run `bun run check --filter @beep/knowledge-server`
   - Fix any errors

4. **Create tests** (1.5 hours)
   - Test addQuad/removeQuad/hasQuad
   - Test pattern matching with wildcards
   - Test default graph handling

5. **Verify** (15 min)
   - Run `bun run test --filter @beep/knowledge-server`
   - Ensure all tests pass
   - Run `bun run lint:fix`

**Estimated Total Time**: 4-5 hours

---

## Next Phase Preview

After Phase 1 completes, Phase 2 will add:
- Named graph support (`createGraph`, `dropGraph`)
- Turtle serialization (`loadTurtle`, `serialize`)
- RdfFormat enum (Turtle, NTriples, JSONLD)
- Integration with existing `OntologyParser`

---

## Handoff Checklist

- [x] Working context: Tasks, success criteria, constraints documented
- [x] Episodic context: Phase -1 summary, key decisions captured
- [x] Semantic context: Tech stack, EntityIds, package structure
- [x] Procedural context: Links to patterns, references, commands
- [x] Implementation specs: Schema shapes, service structure, test patterns
- [x] Known issues: Gotchas documented with solutions
- [x] Implementation order: Step-by-step sequence with time estimates
- [x] Token budget: ≤4,000 tokens (verified below)

**Token Budget Verification**:
- Working Context: ~800 tokens (tasks, success criteria, constraints)
- Episodic Context: ~400 tokens (Phase -1 summary, roadmap position)
- Semantic Context: ~300 tokens (tech stack, EntityIds, package structure)
- Procedural Context: ~100 tokens (links only, no content)
- Implementation Specs: ~1,800 tokens (Quad, QuadPattern, RdfStore, tests)
- Known Issues: ~200 tokens (3 gotchas with solutions)
- Implementation Order: ~200 tokens (5 steps with time estimates)
- **Total: ~3,800 tokens** (under 4,000 budget)
- **Method**: Estimated using heuristic (lines × ~9.5 words/line × 4 tokens/word)

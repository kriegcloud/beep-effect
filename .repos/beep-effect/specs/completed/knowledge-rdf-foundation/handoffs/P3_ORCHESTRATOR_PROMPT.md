# Phase 3 Orchestrator Prompt

> Copy-paste this prompt to start Phase 3 in a fresh session.

---

You are implementing Phase 3 of the `knowledge-rdf-foundation` spec, which adds the RdfBuilder fluent API and integrates RdfStore with OntologyService.

### Context

Phase 1 and Phase 2 are complete. The RdfStore service exists with:
- Quad operations (addQuad, removeQuad, hasQuad, match, countMatches, clear)
- Named graph operations (createGraph, dropGraph, listGraphs)
- Accessor methods (getSubjects, getPredicates, getObjects, getGraphs)

The Serializer service exists with:
- parseTurtle - Parse Turtle and load into RdfStore
- parseOnly - Parse Turtle without loading
- serialize - Export to Turtle/N-Triples
- serializeQuads - Serialize specific quads

You are now adding the fluent builder API and optional OntologyService integration.

### Your Mission

Create the RdfBuilder and integration layer with:
1. **RdfBuilder service** - Fluent API for triple construction
2. **OntologyService integration** - Optional RdfStore population
3. **Unit tests** - Test all builder operations using @beep/testkit
4. **Integration tests** - Test OntologyService + RdfStore interaction
5. **Performance benchmark** - Verify <100ms for 1000 triples

**Deliverables**:
- `packages/knowledge/server/src/Rdf/RdfBuilder.ts`
- `packages/knowledge/server/test/Rdf/RdfBuilder.test.ts`
- `packages/knowledge/server/test/Rdf/integration.test.ts`
- `packages/knowledge/server/test/Rdf/benchmark.test.ts`
- Modifications to `packages/knowledge/server/src/Ontology/OntologyService.ts`

### Critical Patterns

#### 1. Fluent Builder Pattern

```typescript
// Single triple
yield* builder
  .subject(makeIRI("http://example.org/alice"))
  .predicate(makeIRI("http://xmlns.com/foaf/0.1/name"))
  .literal("Alice")
  .add();

// With named graph
yield* builder
  .inGraph(makeIRI("http://example.org/graph1"))
  .subject(makeIRI("http://example.org/bob"))
  .predicate(makeIRI("http://xmlns.com/foaf/0.1/name"))
  .literal("Bob")
  .add();

// Batch
yield* builder.batch([quad1, quad2, quad3]);
```

#### 2. Optional Service Integration

```typescript
// OntologyService.load with optional RdfStore population
load: (id: OntologyId, options?: { populateRdfStore?: boolean }) =>
  Effect.gen(function* () {
    const ontology = yield* repo.findById(id);

    if (options?.populateRdfStore) {
      const serializer = yield* Serializer;
      yield* serializer.parseTurtle(ontology.content, makeIRI(`urn:ontology:${id}`));
    }

    return ontology;
  }),
```

#### 3. Performance Test Pattern

```typescript
effect("should add 1000 triples in under 100ms", () =>
  Effect.gen(function* () {
    const store = yield* RdfStore;
    const quads = generateTestQuads(1000);

    const start = yield* Effect.clockWith(clock => clock.currentTimeMillis);
    yield* store.addQuads(quads);
    const end = yield* Effect.clockWith(clock => clock.currentTimeMillis);

    assertTrue(end - start < 100);
  }).pipe(Effect.provide(RdfStore.Default))
);
```

### Reference Files

**Read these before starting**:
- `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P3.md` - Full context document
- `.claude/rules/effect-patterns.md` - Mandatory Effect patterns
- `packages/knowledge/server/src/Rdf/RdfStoreService.ts` - Phase 1 implementation
- `packages/knowledge/server/src/Rdf/Serializer.ts` - Phase 2 implementation
- `packages/knowledge/server/src/Ontology/OntologyService.ts` - Integration target

### Verification

After each step, run:

```bash
# Type-check
bun run check --filter @beep/knowledge-server

# Tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint:fix --filter @beep/knowledge-server
```

### Success Criteria

- [ ] RdfBuilder.subject().predicate().literal().add() works
- [ ] RdfBuilder.subject().predicate().object().add() works
- [ ] RdfBuilder.inGraph() sets named graph context
- [ ] RdfBuilder.batch() adds multiple quads
- [ ] OntologyService.load({ populateRdfStore: true }) works
- [ ] OntologyService.load() without options unchanged
- [ ] Performance: <100ms for 1000 triples
- [ ] All tests pass
- [ ] No lint errors
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings

### Implementation Order

1. Create `RdfBuilder.ts` service (2 hours)
2. Create RdfBuilder tests (1.5 hours)
3. Modify OntologyService for optional integration (1 hour)
4. Create integration tests (1 hour)
5. Create performance benchmark (30 min)
6. Update exports and verify (30 min)
7. Update REFLECTION_LOG.md (15 min)

**Estimated time**: 6-7 hours

### Handoff Document

Read the full context in: `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P3.md`

This document contains detailed implementation specifications, builder patterns, and test examples.

---

**Start by reading HANDOFF_P3.md, then implement the builder, tests, and integration in order.**

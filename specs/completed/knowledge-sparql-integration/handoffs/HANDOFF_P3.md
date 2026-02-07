# Phase 3 Handoff - Result Formatting & Integration Testing

**Phase**: 1.3 - Result Formatting & Integration Testing
**Status**: NOT_STARTED
**Estimated Duration**: 3.5 days
**Dependencies**: Phase 1 (SparqlParser ✅) + Phase 2 (SparqlService ✅)

> **PHASE COMPLETION REQUIREMENT**: A phase is NOT complete until:
> 1. All deliverables pass type checking and tests
> 2. REFLECTION_LOG.md is updated with learnings
> 3. Next phase handoff documents created (or spec marked COMPLETE)

---

## 4-Tier Memory Structure

### Tier 1: Immediate Context (Session Working Memory)

**Current Task**: Implement W3C SPARQL JSON result formatting and integration tests

**Active Files**:
```
packages/knowledge/server/src/Sparql/
  ResultFormatter.ts      # NEW - W3C JSON format conversion

packages/knowledge/server/test/Sparql/
  ResultFormatter.test.ts # NEW - formatter unit tests
  integration.test.ts     # NEW - E2E query tests
  benchmark.test.ts       # NEW - performance tests
```

**EXISTING (from Phase 1 & 2)**:
```
packages/knowledge/server/src/Sparql/
  SparqlParser.ts         # ✅ Parser service
  SparqlService.ts        # ✅ Query execution service
  QueryExecutor.ts        # ✅ Pattern matching executor
  FilterEvaluator.ts      # ✅ FILTER expression evaluation
  index.ts                # UPDATE - add ResultFormatter export

packages/knowledge/domain/src/value-objects/rdf/
  SparqlBindings.ts       # ✅ Domain result type

packages/knowledge/server/src/Rdf/
  RdfStoreService.ts      # ✅ In-memory triple store
  RdfBuilder.ts           # ✅ Fluent builder for RDF graphs
```

**Immediate TODOs**:
- [ ] Create ResultFormatter for W3C SPARQL JSON format
- [ ] Create integration tests (ExtractionPipeline → RdfStore → SPARQL)
- [ ] Create performance benchmarks
- [ ] Add ResultFormatter to barrel exports
- [ ] Verify all SPARQL tests pass (73 existing + new)

**Phase Completion Checklist**:
- [ ] All deliverables implemented
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] Spec marked COMPLETE in README.md

---

### Tier 2: Phase Context (Multi-Session Memory)

**Phase Goal**: Format query results for client consumption and validate E2E flows

**Key Decisions**:
- W3C SPARQL Query Results JSON Format for SELECT bindings
- RDF triples array for CONSTRUCT results
- Boolean for ASK results
- Integration tests verify ExtractionPipeline → SPARQL query flow

**Integration Points**:
- **Input**: SparqlService returns `SparqlBindings | ReadonlyArray<Quad> | boolean`
- **Output**: W3C JSON format for client consumption
- **Validation**: ExtractionPipeline generates entities → RdfStore → SPARQL queries

**W3C SPARQL JSON Format**:
```json
{
  "head": { "vars": ["entity", "name"] },
  "results": {
    "bindings": [
      {
        "entity": { "type": "uri", "value": "http://example.org/entity/1" },
        "name": { "type": "literal", "value": "John Doe" }
      }
    ]
  }
}
```

---

### Tier 3: Specification Context (Cross-Phase Memory)

**Goal**: Enable SPARQL queries over RDF knowledge graph

**Phase Flow**: Phase 1 (Parser ✅) → Phase 2 (Service ✅) → **Phase 3 (Formatting)**

**Performance Targets**:
- < 100ms for simple queries (< 10K triples)
- < 200ms for complex queries (< 100K triples)

**Test Coverage Summary**:
- Phase 1: 45 parser tests
- Phase 2: 28 service tests
- Phase 3: Formatter tests + Integration tests + Benchmarks

---

### Tier 4: Project Context (Strategic Memory)

**Architecture**: Vertical slice monorepo with Effect-TS
**Layers**: Domain (value objects) → Server (services) → Client (future)

**Critical Rules** (see `.claude/rules/effect-patterns.md`):
- Namespace imports: `import * as Effect from "effect/Effect"`
- Effect utilities: `A.map`, `A.filter` (NEVER native methods)
- @beep/testkit (NEVER raw bun:test)
- Effect.Service with `accessors: true`

---

## Phase 3 Implementation Details

### ResultFormatter Interface

```typescript
import { SparqlBindings, Quad, Literal, isIRI, isBlankNode } from "@beep/knowledge-domain/value-objects";

/**
 * W3C SPARQL Query Results JSON Format types
 */
export interface W3cTerm {
  readonly type: "uri" | "literal" | "bnode";
  readonly value: string;
  readonly datatype?: string;
  readonly "xml:lang"?: string;
}

export interface W3cSelectResult {
  readonly head: { readonly vars: ReadonlyArray<string> };
  readonly results: {
    readonly bindings: ReadonlyArray<Record<string, W3cTerm>>;
  };
}

export interface W3cAskResult {
  readonly head: Record<string, never>;
  readonly boolean: boolean;
}

/**
 * Format SELECT results to W3C JSON
 */
export const formatSelectResult = (bindings: SparqlBindings): W3cSelectResult => {...};

/**
 * Format ASK results to W3C JSON
 */
export const formatAskResult = (result: boolean): W3cAskResult => {...};

/**
 * Convert domain Term to W3C term format
 */
export const termToW3c = (term: Term): W3cTerm => {
  if (isIRI(term)) {
    return { type: "uri", value: term };
  }
  if (isBlankNode(term)) {
    return { type: "bnode", value: term.slice(2) }; // Remove "_:" prefix
  }
  // Literal
  const lit = term as Literal;
  const w3c: W3cTerm = { type: "literal", value: lit.value };
  if (lit.datatype) w3c.datatype = lit.datatype;
  if (lit.language) w3c["xml:lang"] = lit.language;
  return w3c;
};
```

### Integration Test Structure

```typescript
describe("SPARQL Integration", () => {
  describe("ExtractionPipeline → RdfStore → SPARQL", () => {
    it.effect("should query extracted entities", () =>
      Effect.gen(function* () {
        // 1. Build RDF graph from extracted entities
        const builder = yield* RdfBuilder.make();
        yield* builder
          .subject("http://example.org/doc1")
          .addType("http://schema.org/Document")
          .addLiteral("http://schema.org/name", "Test Document")
          .build();

        // 2. Load into RdfStore
        const store = yield* RdfStore;
        yield* store.addQuads(yield* builder.getQuads());

        // 3. Query via SPARQL
        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?doc ?name WHERE {
            ?doc <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Document> .
            ?doc <http://schema.org/name> ?name
          }
        `);

        // 4. Verify results
        strictEqual(A.length(result.rows), 1);
      }).pipe(Effect.provide(IntegrationTestLayer))
    );
  });
});
```

### Performance Benchmark Structure

```typescript
import { live } from "@beep/testkit";

describe("SPARQL Performance Benchmarks", () => {
  live("should execute simple query under 100ms on 10K triples", () =>
    Effect.gen(function* () {
      // Setup: Generate 10K test triples
      const store = yield* RdfStore;
      yield* generateTestTriples(store, 10000);

      const sparql = yield* SparqlService;

      // Measure query time
      const start = yield* Effect.clockWith(c => c.currentTimeMillis);
      yield* sparql.select(`
        SELECT ?s WHERE { ?s <http://example.org/type> <http://example.org/Entity> }
        LIMIT 100
      `);
      const end = yield* Effect.clockWith(c => c.currentTimeMillis);

      const duration = end - start;
      assertTrue(duration < 100, `Query took ${duration}ms, expected < 100ms`);
    }).pipe(Effect.provide(BenchmarkTestLayer))
  );

  live("should execute complex multi-pattern query under 200ms", () =>
    Effect.gen(function* () {
      // Setup and measure complex query
      // ...
    }).pipe(Effect.provide(BenchmarkTestLayer))
  );
});
```

---

## Test Requirements

### ResultFormatter Unit Tests

```typescript
describe("ResultFormatter", () => {
  describe("formatSelectResult", () => {
    effect("should format empty bindings", () => ...);
    effect("should format IRI bindings as uri type", () => ...);
    effect("should format literal bindings with datatype", () => ...);
    effect("should format literal bindings with language tag", () => ...);
    effect("should format blank node bindings", () => ...);
    effect("should preserve column order in vars", () => ...);
  });

  describe("formatAskResult", () => {
    effect("should format true result", () => ...);
    effect("should format false result", () => ...);
  });

  describe("termToW3c", () => {
    effect("should convert IRI to uri type", () => ...);
    effect("should convert BlankNode to bnode type", () => ...);
    effect("should convert plain Literal to literal type", () => ...);
    effect("should include datatype for typed Literal", () => ...);
    effect("should include xml:lang for language-tagged Literal", () => ...);
  });
});
```

### Integration Test Scenarios

1. **Document Entity Query**: Extract document metadata → Query by type
2. **Relationship Query**: Extract relationships → Query connections
3. **Multi-hop Query**: Entity → Relationship → Related Entity
4. **FILTER with Extracted Data**: Query with literal filters
5. **CONSTRUCT Graph Extraction**: Build subgraph from query

### Performance Benchmark Scenarios

| Scenario | Triple Count | Target |
|----------|--------------|--------|
| Simple type query | 10K | < 100ms |
| Two-pattern join | 10K | < 100ms |
| Three-pattern join | 10K | < 150ms |
| Complex with FILTER | 10K | < 150ms |
| Large store simple | 100K | < 200ms |

---

## Verification Checklist

Before marking spec COMPLETE:

- [ ] `bun run check --filter @beep/knowledge-server` passes (or only pre-existing errors in unrelated modules)
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] ResultFormatter produces valid W3C JSON format
- [ ] Integration tests validate E2E query flow
- [ ] Performance benchmarks pass (< 100ms simple, < 200ms complex)
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] README.md status updated to COMPLETE

---

## Agent Recommendations

**Phase 3 Agents**:
1. **effect-code-writer**: ResultFormatter implementation
2. **test-writer**: Integration and benchmark tests
3. **codebase-researcher**: ExtractionPipeline integration patterns

**Workflow**:
1. Create ResultFormatter with W3C JSON conversion
2. Write formatter unit tests
3. Create integration test layer with RdfBuilder setup
4. Write integration test scenarios
5. Create benchmark test layer with data generation
6. Write performance benchmarks
7. Verify all tests pass
8. Update REFLECTION_LOG and mark spec COMPLETE

---

## Open Questions for Phase 3

1. **Streaming Results**: Should large result sets be streamed?
   - Proposal: Defer to future optimization, return full arrays for now

2. **Error Details in W3C Format**: How to format execution errors?
   - Proposal: Keep Effect error channel, don't encode in W3C JSON

3. **CONSTRUCT Format**: Should CONSTRUCT support W3C Graph format?
   - Proposal: Return raw Quad array, let caller serialize if needed

---

## References

- [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/)
- `packages/knowledge/server/src/Sparql/` - Existing SPARQL implementation
- `packages/knowledge/server/src/Rdf/RdfBuilder.ts` - Builder for test data
- `specs/knowledge-sparql-integration/REFLECTION_LOG.md` - Phase 1 & 2 learnings

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-04 | Claude Code | Initial Phase 3 handoff |

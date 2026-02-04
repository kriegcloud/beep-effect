# Phase 3 Orchestrator Prompt - Result Formatting & Integration Testing

Copy-paste this prompt to start Phase 3 with a fresh Claude Code session.

---

## Prompt

I need you to implement Phase 3 of the Knowledge SPARQL Integration spec: Result Formatting & Integration Testing.

**Specification Location**: `specs/knowledge-sparql-integration/`

**Context Files to Read**:
1. `specs/knowledge-sparql-integration/README.md` - Full specification
2. `specs/knowledge-sparql-integration/handoffs/HANDOFF_P3.md` - Phase 3 detailed handoff
3. `specs/knowledge-sparql-integration/REFLECTION_LOG.md` - Phase 1 & 2 learnings
4. `.claude/rules/effect-patterns.md` - Effect import conventions and patterns

**IMPORTANT - Phase 1 & 2 are COMPLETE**:
- SparqlParser wraps sparqljs with 45 tests passing
- SparqlService provides `select()`, `construct()`, `ask()`, `query()` methods
- QueryExecutor handles BGP, OPTIONAL, UNION patterns
- FilterEvaluator supports =, !=, <, >, regex, bound, isIRI, isLiteral, &&, ||
- 73 total SPARQL tests passing

**Phase 3 Objective**: Format query results and validate E2E flows.

**Deliverables**:
1. **ResultFormatter** (`@beep/knowledge-server`):
   - W3C SPARQL Query Results JSON Format for SELECT
   - W3C ASK result format
   - Term conversion (IRI → uri, BlankNode → bnode, Literal → literal)

2. **Integration Tests** (`@beep/knowledge-server/test/Sparql/`):
   - E2E: RdfBuilder → RdfStore → SPARQL query
   - Document entity queries
   - Relationship queries
   - Multi-hop queries
   - FILTER with extracted data
   - CONSTRUCT graph extraction

3. **Performance Benchmarks** (`@beep/knowledge-server/test/Sparql/`):
   - Simple query on 10K triples: < 100ms
   - Complex query on 10K triples: < 150ms
   - Simple query on 100K triples: < 200ms

**Critical Requirements**:
- Use namespace imports: `import * as Effect from "effect/Effect"`
- Use `@beep/testkit` for tests with proper TestLayers
- Use `live()` for benchmarks (real clock access)
- NEVER use native JavaScript methods (use Effect utilities)
- Performance measurements via `Effect.clockWith(c => c.currentTimeMillis)`

**W3C SPARQL JSON Format**:
```json
{
  "head": { "vars": ["entity", "name"] },
  "results": {
    "bindings": [
      {
        "entity": { "type": "uri", "value": "http://example.org/entity/1" },
        "name": { "type": "literal", "value": "John Doe", "datatype": "..." }
      }
    ]
  }
}
```

**Workflow**:
1. Read specification files (README.md, HANDOFF_P3.md, REFLECTION_LOG.md)
2. Create ResultFormatter with W3C JSON conversion
3. Write formatter unit tests
4. Create integration test layer with shared RdfStore
5. Write integration test scenarios
6. Create benchmark test layer with data generation
7. Write performance benchmarks
8. Verify with `bun run check --filter @beep/knowledge-server`
9. Run tests: `bun test test/Sparql/`
10. Update REFLECTION_LOG.md with Phase 3 learnings
11. Mark spec as COMPLETE in README.md

**Success Criteria**:
- [ ] ResultFormatter produces valid W3C JSON for SELECT
- [ ] ResultFormatter handles IRI, BlankNode, Literal terms
- [ ] ResultFormatter handles datatype and language tags
- [ ] ASK results formatted as W3C JSON
- [ ] Integration tests validate RdfBuilder → RdfStore → SPARQL
- [ ] Performance: < 100ms for simple queries on 10K triples
- [ ] Performance: < 200ms for complex queries on 100K triples
- [ ] All tests pass
- [ ] REFLECTION_LOG.md updated
- [ ] README.md status: COMPLETE

**SPEC COMPLETION REQUIREMENT**:
A spec is NOT complete until:
1. All deliverables pass type checking and tests
2. REFLECTION_LOG.md is updated with learnings
3. README.md status updated to COMPLETE

**Agent Recommendations**:
- Use `effect-code-writer` for ResultFormatter
- Use `test-writer` for integration and benchmark tests
- Use `live()` from @beep/testkit for real clock benchmarks

**Verification Commands**:
```bash
bun run check --filter @beep/knowledge-server
bun test test/Sparql/
```

Begin implementation when ready.

---

## Example Session Start

**User**: [Paste prompt above]

**Expected AI Response**:
"I'll implement Phase 3 of the SPARQL Integration spec. Let me start by reading the specification files."

[AI reads README.md, HANDOFF_P3.md, REFLECTION_LOG.md]

"Phase 3 focuses on:
1. Creating ResultFormatter for W3C SPARQL JSON format
2. Writing integration tests for E2E query flows
3. Creating performance benchmarks

Existing infrastructure (do not recreate):
- SparqlService: `select()`, `construct()`, `ask()`, `query()`
- SparqlBindings: Domain type with `columns` and `rows`
- RdfBuilder: Fluent builder for RDF graphs
- 73 passing SPARQL tests

I'll proceed with:
1. ResultFormatter implementation
2. Unit tests for formatter
3. Integration test layer setup
4. Integration test scenarios
5. Benchmark tests with 10K/100K triple generation

Starting with ResultFormatter..."

---

## Troubleshooting

### W3C JSON Format Issues
```typescript
// Correct W3C term format
const w3cTerm: W3cTerm = {
  type: "literal",
  value: "John Doe",
  datatype: "http://www.w3.org/2001/XMLSchema#string",  // Optional
  "xml:lang": "en"  // Optional, mutually exclusive with datatype
};
```

### Integration Test Layer
```typescript
// Proper Layer for integration tests
const IntegrationTestLayer = Layer.mergeAll(
  SparqlService.Default,
  RdfBuilder.Default,
  RdfStore.Default,
  SparqlParser.Default
);
```

### Benchmark Test Pattern
```typescript
import { live } from "@beep/testkit";

live("benchmark test", () =>
  Effect.gen(function* () {
    const start = yield* Effect.clockWith(c => c.currentTimeMillis);
    // ... operation ...
    const end = yield* Effect.clockWith(c => c.currentTimeMillis);
    assertTrue(end - start < 100);
  }).pipe(Effect.provide(BenchmarkLayer))
);
```

### Data Generation for Benchmarks
```typescript
const generateTestTriples = (store: RdfStore, count: number) =>
  Effect.gen(function* () {
    const quads: Quad[] = [];
    for (let i = 0; i < count; i++) {
      quads.push(new Quad({
        subject: makeIRI(`http://example.org/entity/${i}`),
        predicate: makeIRI("http://example.org/type"),
        object: makeIRI("http://example.org/Entity"),
      }));
    }
    yield* store.addQuads(quads);
  });
```

---

## Spec Completion

After Phase 3 completion:
1. Update REFLECTION_LOG.md with Phase 3 learnings
2. Update README.md status to COMPLETE
3. Run final verification: `bun test test/Sparql/`
4. Commit all changes

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-04 | Claude Code | Initial Phase 3 orchestrator prompt |

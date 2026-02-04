# Knowledge SPARQL Integration

**Spec ID**: `knowledge-sparql-integration`
**Phase**: 1.1 - Query Layer (SPARQL)
**Status**: PLANNED
**Owner**: TBD
**Created**: 2026-02-03
**Complexity**: HIGH

---

## Purpose and Scope

Enable SPARQL query capability over the RDF knowledge graph, providing semantic querying for entity relationships, ontology validation, and graph pattern matching. This specification implements the foundational query layer required for knowledge graph interrogation across IAM, Documents, Calendar, and other domain slices.

**In Scope:**
- SPARQL SELECT queries (basic pattern matching)
- SPARQL CONSTRUCT queries (graph transformation)
- SPARQL ASK queries (boolean pattern existence)
- Query result formatting (JSON, RDF, bindings)
- Basic FILTER expressions (equality, comparison, regex)
- PREFIX declarations and IRI resolution
- Integration with RdfStore service from Phase 0

**Out of Scope:**
- SPARQL UPDATE operations (INSERT/DELETE) - Phase 2
- Federated queries (SERVICE clause) - Future
- Full SPARQL 1.1 feature parity (aggregates, property paths, subqueries) - Incremental
- Graph database backend optimization (Oxigraph migration) - Phase 3
- SPARQL endpoint HTTP API - Phase 2

---

## Related Specs

| Spec | Status | Relationship |
|------|--------|--------------|
| `specs/knowledge-rdf-foundation/` | PLANNED | **Predecessor** - RdfStore must exist |
| `specs/knowledge-architecture-foundation/` | COMPLETE | Package allocation patterns |
| `specs/knowledge-reasoning-engine/` | PLANNED | Parallel track (both depend on RdfStore) |
| `specs/knowledge-graphrag-plus/` | PLANNED | **Successor** - Citation validation needs SPARQL |

---

## Goals and Non-Goals

### Goals
1. **Semantic Query Capability**: Query knowledge graph using declarative SPARQL patterns
2. **RdfStore Integration**: Execute queries against in-memory triple store from Phase 0
3. **Result Flexibility**: Support JSON bindings, RDF graphs, and boolean results
4. **Parser Extensibility**: Design for incremental SPARQL feature addition
5. **Performance Baseline**: Establish query performance metrics for graphs < 100K triples

### Non-Goals
1. Full SPARQL 1.1 compliance (target: common subset)
2. Query optimization (initial naive implementation acceptable)
3. Distributed query execution
4. SPARQL protocol HTTP endpoint (server API for internal use only)

---

## Complexity Classification

**Overall**: HIGH

| Dimension | Rating | Justification |
|-----------|--------|---------------|
| **Technical** | HIGH | SPARQL parsing, graph pattern matching, variable binding |
| **Integration** | MEDIUM | Depends on RdfStore (Phase 0), exposes service layer |
| **Risk** | MEDIUM | Query performance unknowns, parser completeness |
| **Duration** | 10 days | Parser (3d) + Service (5d) + Formatting (2d) |

---

## Deliverables

| Item | Priority | Complexity | Estimate | Dependencies | Package |
|------|----------|------------|----------|--------------|---------|
| SPARQL query value objects | P0 | S | 0.5 days | None | `@beep/knowledge-domain` |
| SPARQL parser (sparqljs wrapper) | P0 | L | 3 days | None | `@beep/knowledge-server` |
| SparqlService implementation | P0 | XL | 5 days | RdfStore, Parser | `@beep/knowledge-server` |
| Result formatter utilities | P0 | M | 2 days | SparqlService | `@beep/knowledge-server` |
| Integration tests (E2E query) | P0 | M | 1.5 days | All above | `@beep/knowledge-server` |

**Total Estimated Duration**: 12 days (includes buffer)

---

## Phase Overview

### Phase 1: Value Objects & Parser (3.5 days)

**Objective**: Define SPARQL query domain models and parse SPARQL strings into AST.

**Deliverables:**
- `SparqlQuery` value object (domain layer)
- `SparqlBindings` value object (domain layer)
- `SparqlParser` service (wraps sparqljs library)
- Parser unit tests (valid/invalid queries)

**Success Criteria:**
- Parse SELECT queries with WHERE clause and FILTER
- Parse CONSTRUCT queries with template and pattern
- Parse ASK queries
- Handle PREFIX declarations
- Validation errors for malformed queries

**Agent Assignment**: `effect-code-writer` (domain models) + `codebase-researcher` (sparqljs integration)

---

### Phase 2: SPARQL Service (5 days)

**Objective**: Execute parsed SPARQL queries against RdfStore and return bindings.

**Deliverables:**
- `SparqlService` interface and implementation
- Query executor for SELECT/CONSTRUCT/ASK
- Variable binding engine
- Basic FILTER evaluation (equality, comparison, regex)
- Integration with RdfStore.query()

**Success Criteria:**
- Execute query: `SELECT ?entity WHERE { ?entity rdf:type ex:Person }`
- Execute query: `SELECT ?s ?o WHERE { ?s ex:relatedTo ?o . FILTER(?o = "value") }`
- Execute CONSTRUCT: `CONSTRUCT { ?s ex:name ?n } WHERE { ?s foaf:name ?n }`
- Execute ASK: `ASK { ?s rdf:type ex:Organization }`
- Performance: < 100ms for queries over 10K triples

**Agent Assignment**: `codebase-researcher` (RdfStore integration) + `effect-code-writer` (service implementation)

---

### Phase 3: Result Formatting & Testing (3.5 days)

**Objective**: Format query results into consumable structures and validate E2E flows.

**Deliverables:**
- `ResultFormatter` utility (JSON bindings, RDF graphs, boolean)
- Integration tests querying entities from ExtractionPipeline
- Performance benchmarks (query execution time)
- Error handling for malformed queries and execution failures

**Success Criteria:**
- Format SELECT results as JSON array of variable bindings
- Format CONSTRUCT results as RDF triples
- Format ASK results as boolean
- Integration test: Extract entities → Store in RdfStore → Query via SPARQL
- Performance: < 200ms for complex multi-pattern queries (< 100K triples)

**Agent Assignment**: `test-writer` (integration tests) + `effect-code-writer` (formatter)

---

## Technology Decisions

### SPARQL Parser: sparqljs

**Decision**: Use `sparqljs` library for parsing SPARQL 1.1 queries into AST.

**Rationale:**
- Mature, well-tested SPARQL 1.1 parser
- JavaScript-native (no WASM overhead)
- Extensive query type support (SELECT, CONSTRUCT, ASK, DESCRIBE)
- Active maintenance

**Alternatives Considered:**
- Custom recursive descent parser → Rejected (reinventing wheel, high complexity)
- SPARQL.js (older fork) → Rejected (unmaintained)

**Migration Path**: Parser abstraction allows swapping to Oxigraph SPARQL engine in Phase 3.

---

### Query Executor: Custom Implementation over RdfStore

**Decision**: Implement custom SPARQL executor that translates AST to RdfStore.query() calls.

**Rationale:**
- RdfStore provides low-level triple pattern matching
- Custom executor allows incremental feature addition
- Avoids full database dependency (Oxigraph) in Phase 1
- Enables learning query optimization patterns

**Limitations:**
- Naive performance (no query planning)
- Limited SPARQL 1.1 features (no property paths, aggregates)
- Memory-bound execution (full result materialization)

**Migration Path**: Replace executor with Oxigraph native SPARQL engine in Phase 3 for production scale.

---

### Result Format: SPARQL Query Results JSON Format

**Decision**: Use W3C SPARQL Query Results JSON Format for SELECT bindings.

**Rationale:**
- Standard interchange format
- Native JSON Schema validation
- Compatible with RDF visualization tools
- Easy consumption by client layer

**Format Example:**
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

## Success Criteria

### Functional Requirements
- [ ] Parse and execute SELECT queries with basic graph patterns
- [ ] Parse and execute CONSTRUCT queries
- [ ] Parse and execute ASK queries
- [ ] Support PREFIX declarations
- [ ] Support FILTER expressions (equality, comparison, regex)
- [ ] Format results in SPARQL JSON format
- [ ] Integration test: Query entities extracted via ExtractionPipeline

### Non-Functional Requirements
- [ ] Query performance: < 100ms for simple queries (< 10K triples)
- [ ] Query performance: < 200ms for complex queries (< 100K triples)
- [ ] Parser handles malformed queries gracefully (tagged errors)
- [ ] Service layer uses Effect error handling (no throws)
- [ ] 100% type safety (no `any`, no unchecked casts)

### Integration Requirements
- [ ] SparqlService depends on RdfStore via Layer composition
- [ ] Query results compatible with client-layer rendering
- [ ] Error messages include query location (line/column from parser)

---

## Key Files to Create

### Domain Layer (`@beep/knowledge-domain`)
```
packages/knowledge/domain/src/value-objects/sparql/
  index.ts              # Barrel export
  SparqlQuery.ts        # Query value object
  SparqlBindings.ts     # Result bindings value object
```

### Server Layer (`@beep/knowledge-server`)
```
packages/knowledge/server/src/Sparql/
  index.ts              # Service export
  SparqlService.ts      # Query execution service
  SparqlParser.ts       # sparqljs wrapper
  QueryExecutor.ts      # Pattern matching executor
  ResultFormatter.ts    # Format conversion utilities
  errors.ts             # SPARQL-specific errors

packages/knowledge/server/test/Sparql/
  SparqlParser.test.ts
  SparqlService.test.ts
  integration.test.ts   # E2E query tests
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Query performance insufficient | MEDIUM | HIGH | Benchmark early, design Oxigraph migration path |
| SPARQL feature gaps block use cases | MEDIUM | MEDIUM | Prioritize common queries, incremental features |
| sparqljs parsing errors | LOW | MEDIUM | Extensive parser tests, fallback error handling |
| RdfStore query API limitations | LOW | HIGH | Verify RdfStore capabilities in Phase 0 handoff |

---

## Open Questions

1. **Query Timeouts**: What is acceptable query timeout threshold? (Proposal: 5 seconds)
2. **Result Pagination**: Should LIMIT/OFFSET be implemented in Phase 1? (Proposal: Yes, simple implementation)
3. **Named Graphs**: Support GRAPH clause in Phase 1? (Proposal: Defer to Phase 2)
4. **Blank Node Handling**: How to represent blank nodes in results? (Proposal: Generate stable identifiers)

---

## References

- [SPARQL 1.1 Query Language Spec](https://www.w3.org/TR/sparql11-query/)
- [SPARQL Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/)
- [sparqljs GitHub](https://github.com/RubenVerborgh/SPARQL.js)
- `specs/knowledge-rdf-foundation/` - RdfStore API contract
- `documentation/patterns/effect-patterns.md` - Service layer patterns

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-03 | Claude Code | Initial specification |

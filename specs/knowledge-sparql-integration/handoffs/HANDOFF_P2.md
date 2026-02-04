# Phase 2 Handoff - SPARQL Service Implementation

**Phase**: 1.2 - SPARQL Service Implementation
**Status**: NOT_STARTED
**Estimated Duration**: 5 days
**Dependencies**: Phase 1 (SparqlParser, SparqlQuery - COMPLETE)

> **PHASE COMPLETION REQUIREMENT**: A phase is NOT complete until:
> 1. All deliverables pass type checking and tests
> 2. REFLECTION_LOG.md is updated with learnings
> 3. Next phase handoff documents (HANDOFF_P{N+1}.md, P{N+1}_ORCHESTRATOR_PROMPT.md) are created

---

## 4-Tier Memory Structure

### Tier 1: Immediate Context (Session Working Memory)

**Current Task**: Implement SPARQL query execution against RdfStore

**Active Files**:
```
packages/knowledge/server/src/Sparql/
  SparqlService.ts      # NEW - query execution service
  QueryExecutor.ts      # NEW - pattern matching executor
  FilterEvaluator.ts    # NEW - FILTER expression evaluation
  index.ts              # UPDATE - add exports

packages/knowledge/server/test/Sparql/
  SparqlService.test.ts # NEW - service tests
  QueryExecutor.test.ts # NEW - executor tests
```

**EXISTING (from Phase 1)**:
```
packages/knowledge/server/src/Sparql/SparqlParser.ts    # Parser service
packages/knowledge/domain/src/value-objects/sparql/     # SparqlQuery
packages/knowledge/domain/src/value-objects/rdf/        # SparqlBindings, Quad, QuadPattern
packages/knowledge/server/src/Rdf/RdfStoreService.ts    # RdfStore (match, addQuad, etc.)
```

**Immediate TODOs**:
- [ ] Create SparqlService Effect.Service with `accessors: true`
- [ ] Implement QueryExecutor for basic graph pattern matching
- [ ] Implement FilterEvaluator for equality, comparison, regex
- [ ] Integrate with RdfStore.match() for triple pattern matching
- [ ] Handle variable binding and solution mapping
- [ ] Write comprehensive service tests

**Phase Completion Checklist**:
- [ ] All deliverables implemented
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] HANDOFF_P3.md created
- [ ] P3_ORCHESTRATOR_PROMPT.md created

---

### Tier 2: Phase Context (Multi-Session Memory)

**Phase Goal**: Execute SPARQL queries against RdfStore and return bindings

**Key Decisions**:
- Custom executor over RdfStore (not Oxigraph) for learning
- sparqljs AST as execution input (from Phase 1 parser)
- SparqlBindings (existing) for result representation
- FilterEvaluator as separate module for testability

**Integration Points**:
- **Input**: SparqlParser.parse() returns `{ query: SparqlQuery, ast: sparqljs.SparqlQuery }`
- **Store**: RdfStore.match(QuadPattern) returns `ReadonlyArray<Quad>`
- **Output**: SparqlBindings (existing domain type)

**Critical RdfStore API**:
```typescript
// From Phase 0 RDF foundation
interface RdfStore {
  match: (pattern: QuadPattern) => Effect.Effect<ReadonlyArray<Quad>>;
  countMatches: (pattern: QuadPattern) => Effect.Effect<number>;
  hasQuad: (quad: Quad) => Effect.Effect<boolean>;
  size: Effect.Effect<number>;
}
```

---

### Tier 3: Specification Context (Cross-Phase Memory)

**Goal**: Enable SPARQL queries over RDF knowledge graph

**Phase Flow**: Phase 1 (Parser ✅) → **Phase 2 (Service)** → Phase 3 (Formatting)

**Performance Targets**:
- < 100ms for simple queries (< 10K triples)
- < 200ms for complex queries (< 100K triples)

**Supported Query Types**:
- SELECT with basic graph patterns
- CONSTRUCT with template and pattern
- ASK for boolean existence check

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

## Phase 2 Implementation Details

### SparqlService Interface

```typescript
import { SparqlSyntaxError, SparqlExecutionError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { SparqlBindings, SparqlQuery } from "@beep/knowledge-domain/value-objects";
import { Quad } from "@beep/knowledge-domain/value-objects";
import * as Effect from "effect/Effect";
import type * as sparqljs from "sparqljs";

/**
 * Result types for different SPARQL query forms
 */
export type SelectResult = SparqlBindings;
export type ConstructResult = ReadonlyArray<Quad>;
export type AskResult = boolean;

export type QueryResult = SelectResult | ConstructResult | AskResult;

/**
 * SparqlService Effect.Service
 */
export class SparqlService extends Effect.Service<SparqlService>()("@beep/knowledge-server/SparqlService", {
  accessors: true,
  dependencies: [SparqlParser.Default, RdfStore.Default],
  effect: Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const store = yield* RdfStore;

    return {
      /**
       * Execute a SPARQL query string
       */
      query: (queryString: string): Effect.Effect<
        QueryResult,
        SparqlSyntaxError | SparqlExecutionError | SparqlUnsupportedFeatureError
      > => Effect.gen(function* () {
        const { query, ast } = yield* parser.parse(queryString);
        return yield* executeQuery(ast, store);
      }),

      /**
       * Execute a pre-parsed query (for efficiency when reusing queries)
       */
      execute: (ast: sparqljs.SparqlQuery): Effect.Effect<
        QueryResult,
        SparqlExecutionError | SparqlUnsupportedFeatureError
      > => executeQuery(ast, store),
    };
  }),
}) {}
```

### Query Execution Strategy

**1. SELECT Query Execution**:
```typescript
// Input: SELECT ?s ?name WHERE { ?s ex:name ?name }
// Steps:
// 1. Extract triple patterns from WHERE clause
// 2. For each pattern, call RdfStore.match() with wildcards for variables
// 3. Join results across patterns (nested loop join for simplicity)
// 4. Apply FILTER expressions to candidate solutions
// 5. Project requested variables into SparqlBindings
```

**2. Triple Pattern → QuadPattern Translation**:
```typescript
// SPARQL pattern: ?s ex:name ?name
// Translate to:
const pattern = new QuadPattern({
  subject: undefined,  // Variable = wildcard
  predicate: makeIRI("http://example.org/name"),  // Concrete IRI
  object: undefined,   // Variable = wildcard
});
const matches = yield* store.match(pattern);
// Returns all quads with ex:name predicate
```

**3. Variable Binding**:
```typescript
// For each matched quad, bind variables:
// If pattern is: ?s ex:name ?name
// And quad is: <alice> ex:name "Alice"
// Then binding is: { s: <alice>, name: "Alice" }
```

**4. Pattern Joining**:
```typescript
// Multiple patterns join on shared variables
// Pattern 1: ?s rdf:type ex:Person
// Pattern 2: ?s ex:name ?name
// Join on ?s: only keep solutions where ?s has both patterns
```

### FilterEvaluator

**Supported FILTER Operations (Phase 2)**:
- Equality: `FILTER(?x = "value")`, `FILTER(?x = <uri>)`
- Inequality: `FILTER(?x != "value")`
- Comparison: `FILTER(?x > 10)`, `FILTER(?x < ?y)`
- Regex: `FILTER(regex(?name, "pattern"))`
- Bound: `FILTER(bound(?x))`, `FILTER(!bound(?x))`
- Logical: `FILTER(?a && ?b)`, `FILTER(?a || ?b)`, `FILTER(!?a)`

**Unsupported (Phase 2)**:
- Aggregates in FILTER
- EXISTS/NOT EXISTS subqueries
- Custom functions

### Error Handling

```typescript
// SparqlExecutionError for runtime failures
export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>(...)(
  "SparqlExecutionError",
  {
    query: S.String,
    message: S.String,
    cause: S.optional(S.String),
  }
) {}

// Usage:
const executePattern = (pattern: TriplePattern) =>
  Effect.gen(function* () {
    // ... execution logic
  }).pipe(
    Effect.catchAll((e) =>
      Effect.fail(new SparqlExecutionError({
        query: queryString,
        message: `Pattern execution failed: ${e}`,
        cause: String(e),
      }))
    )
  );
```

---

## Test Requirements

### Service Unit Tests

```typescript
import { SparqlService } from "@beep/knowledge-server/Sparql";
import { RdfStore } from "@beep/knowledge-server/Rdf";
import { describe, effect, strictEqual, assertTrue } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Test layer with both services
const TestLayer = SparqlService.Default;

describe("SparqlService", () => {
  describe("SELECT queries", () => {
    effect("should execute basic SELECT", () =>
      Effect.gen(function* () {
        const store = yield* RdfStore;
        const sparql = yield* SparqlService;

        // Setup: Add test data
        yield* store.addQuad(new Quad({
          subject: makeIRI("http://example.org/alice"),
          predicate: makeIRI("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          object: makeIRI("http://example.org/Person"),
        }));

        // Execute query
        const result = yield* sparql.query(`
          SELECT ?s WHERE { ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> }
        `);

        // Assert
        assertTrue(Array.isArray(result.rows));
        strictEqual(result.rows.length, 1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle FILTER equality", () =>
      Effect.gen(function* () {
        // ... test FILTER execution
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("CONSTRUCT queries", () => {
    effect("should return quads from CONSTRUCT", () =>
      Effect.gen(function* () {
        // ... test CONSTRUCT execution
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("ASK queries", () => {
    effect("should return true when pattern exists", () =>
      Effect.gen(function* () {
        // ... test ASK execution
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return false when pattern does not exist", () =>
      Effect.gen(function* () {
        // ... test ASK execution
      }).pipe(Effect.provide(TestLayer))
    );
  });
});
```

---

## Verification Checklist

Before creating HANDOFF_P3.md, verify:

- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] SparqlService executes SELECT queries with variable projection
- [ ] SparqlService executes CONSTRUCT queries returning quads
- [ ] SparqlService executes ASK queries returning boolean
- [ ] FilterEvaluator handles equality, comparison, regex
- [ ] Performance: < 100ms for simple queries on 10K triple store
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] Imports use namespace convention
- [ ] No native JavaScript methods used
- [ ] Tests use @beep/testkit

---

## Agent Recommendations

**Phase 2 Agents**:
1. **effect-code-writer**: Create SparqlService, QueryExecutor, FilterEvaluator
2. **codebase-researcher**: RdfStore integration, sparqljs AST traversal
3. **test-writer**: Comprehensive service and executor tests

**Workflow**:
1. effect-code-writer creates service skeleton with Layer dependencies
2. codebase-researcher implements QueryExecutor pattern matching
3. effect-code-writer implements FilterEvaluator
4. test-writer creates comprehensive test suite
5. Verify performance benchmarks

---

## Open Questions for Phase 2

1. **Join Algorithm**: Nested loop join is O(n²) - acceptable for Phase 2?
   - Proposal: Yes, optimize in Phase 3 with Oxigraph

2. **SELECT * Expansion**: How to expand wildcard to all variables?
   - Proposal: Collect all variables from WHERE patterns

3. **Blank Node Handling**: How to handle blank nodes in results?
   - Proposal: Generate stable identifiers per query execution

---

## References

- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- `packages/knowledge/server/src/Rdf/RdfStoreService.ts` - RdfStore API
- `packages/knowledge/server/src/Sparql/SparqlParser.ts` - Phase 1 parser
- `specs/knowledge-sparql-integration/REFLECTION_LOG.md` - Phase 1 learnings

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-04 | Claude Code | Initial Phase 2 handoff |

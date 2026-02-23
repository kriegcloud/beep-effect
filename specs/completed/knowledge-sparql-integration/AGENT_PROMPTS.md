# Agent Prompts: Knowledge SPARQL Integration

> Ready-to-use prompts for specialized agents working on SPARQL query capability.
>
> **IMPORTANT**: Updated based on lessons learned from RDF foundation implementation.
> - SparqlBindings ALREADY EXISTS - do not recreate
> - Use Effect.Service with `accessors: true` - NOT Context.Tag
> - Errors go in domain layer (`@beep/knowledge-domain/errors/`)
> - RdfStore API is `match(QuadPattern)` NOT `query(s, p, o)`
> - Use `Effect.clockWith` NOT `Date.now()` for benchmarks

---

## Agent Selection Matrix

| Phase | Primary Agent | Secondary Agent | Research Agent |
|-------|---------------|-----------------|----------------|
| **P1: Value Objects & Parser** | `effect-code-writer` | `codebase-researcher` | - |
| **P2: SPARQL Service** | `effect-code-writer` | `codebase-researcher` | - |
| **P3: Result Formatting & Testing** | `test-writer` | `effect-code-writer` | - |

### Agent Capabilities Reference

| Agent | Capability | Output |
|-------|------------|--------|
| `codebase-researcher` | read-only | Informs orchestrator |
| `effect-code-writer` | write-files | `.ts` source files |
| `test-writer` | write-files | `*.test.ts` files |
| `code-reviewer` | write-reports | `outputs/review.md` |

---

## Phase 1: Value Objects & Parser

### Primary Agent: effect-code-writer

```markdown
## Task: Create SPARQL Value Objects & Errors

You are implementing Phase 1 of the Knowledge SPARQL Integration spec.

### Mission

Create SparqlQuery value object and SPARQL error classes in the domain layer.

> **IMPORTANT**: SparqlBindings ALREADY EXISTS at `packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts`
> Do NOT recreate it. Only create SparqlQuery and error classes.

### Files to Create

1. `packages/knowledge/domain/src/value-objects/sparql/SparqlQuery.ts`
   - Schema.Class for SPARQL query representation
   - Fields: queryString, parsedAst, queryType, prefixes, variables
   - Use S.Literal for queryType enum

2. `packages/knowledge/domain/src/value-objects/sparql/index.ts`
   - Barrel export for sparql value objects
   - Re-export SparqlBindings from ../rdf/ for convenience

3. `packages/knowledge/domain/src/errors/sparql.errors.ts`
   - SparqlParseError, SparqlUnsupportedFeatureError, SparqlExecutionError
   - Use S.TaggedError pattern

4. Update `packages/knowledge/domain/src/errors/index.ts`
   - Export sparql errors

### Critical Patterns

#### Schema.Class Pattern (REQUIRED)

```typescript
import * as S from "effect/Schema";

export class SparqlQuery extends S.Class<SparqlQuery>("SparqlQuery")({
  queryString: S.String,
  parsedAst: S.Unknown,  // sparqljs AST (opaque)
  queryType: S.Literal("SELECT", "CONSTRUCT", "ASK"),
  prefixes: S.Record({ key: S.String, value: S.String }),
  variables: S.Array(S.String),
}) {}
```

#### W3C SPARQL JSON Format

```typescript
export class SparqlBindings extends S.Class<SparqlBindings>("SparqlBindings")({
  head: S.Struct({
    vars: S.Array(S.String),
  }),
  results: S.Struct({
    bindings: S.Array(
      S.Record({
        key: S.String,
        value: S.Struct({
          type: S.Literal("uri", "literal", "bnode"),
          value: S.String,
          datatype: S.optional(S.String),
          "xml:lang": S.optional(S.String),
        }),
      })
    ),
  }),
}) {}
```

### FORBIDDEN Patterns

- NO plain interfaces (must use Schema.Class)
- NO lowercase constructors (use S.String, S.Literal, S.Struct)
- NO native JavaScript methods
- NO type casting with `as`

### Verification

```bash
bun run check --filter @beep/knowledge-domain
```

### Success Criteria

- [ ] SparqlQuery value object created
- [ ] SparqlBindings value object created
- [ ] Barrel export created
- [ ] Type check passes
```

---

### Secondary Agent: effect-code-writer

```markdown
## Task: Implement SparqlParser Service

You are implementing Phase 1 of the Knowledge SPARQL Integration spec.

### Mission

Wrap the sparqljs library in an Effect-native SparqlParser service using Effect.Service pattern.

> **IMPORTANT**:
> - Use Effect.Service with `accessors: true` (NOT Context.Tag)
> - Errors are in domain layer (NOT server layer)
> - Create library type conversion layer (sparqljs AST ↔ domain types)

### Files to Create

1. `packages/knowledge/server/src/Sparql/SparqlParser.ts`
   - SparqlParser using Effect.Service with `accessors: true`
   - Wraps sparqljs Parser with Effect.try
   - Validates supported features
   - Type conversion layer: sparqljsAstToSparqlQuery()

2. `packages/knowledge/server/src/Sparql/index.ts`
   - Barrel export for Sparql services

### Research Tasks

Before implementation:

1. **sparqljs API**
   - Read sparqljs documentation
   - Understand Parser class API
   - Identify error handling patterns
   - Note AST structure

2. **Unsupported Features**
   - Identify SPARQL 1.1 features to defer:
     - DESCRIBE queries
     - Property paths
     - Aggregates
     - Subqueries
     - BIND clause
     - VALUES clause

### Critical Patterns

#### Effect.Service Pattern (REQUIRED)

> **CRITICAL**: Use Effect.Service with `accessors: true`, NOT Context.Tag.
> This enables `yield* SparqlParser.parse(query)` instead of service lookup.

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { Parser } from "sparqljs";
import { SparqlQuery } from "@beep/knowledge-domain";
import { SparqlParseError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";

// Type conversion layer (isolates library types from domain)
const sparqljsAstToSparqlQuery = (
  ast: sparqljs.SparqlQuery,
  queryString: string
): SparqlQuery => {
  const queryType = ast.queryType as "SELECT" | "CONSTRUCT" | "ASK";
  const prefixes = ast.prefixes || {};
  const variables = queryType === "SELECT" && ast.variables
    ? A.map(ast.variables, (v) =>
        typeof v === "object" && "variable" in v ? v.variable.value : String(v)
      )
    : [];

  return new SparqlQuery({
    queryString,
    parsedAst: ast,
    queryType,
    prefixes,
    variables,
  });
};

export class SparqlParser extends Effect.Service<SparqlParser>()(
  "@beep/knowledge-server/SparqlParser",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sparqljsParser = new Parser();

      return {
        parse: (queryString: string) =>
          Effect.gen(function* () {
            // Use Effect.try for synchronous library call
            const ast = yield* Effect.try({
              try: () => sparqljsParser.parse(queryString),
              catch: (error) =>
                new SparqlParseError({
                  message: String(error),
                  queryString,
                  location: undefined,
                }),
            });

            // Validate supported features
            if (ast.queryType === "DESCRIBE") {
              return yield* Effect.fail(
                new SparqlUnsupportedFeatureError({
                  feature: "DESCRIBE queries",
                  queryString,
                  message: "DESCRIBE queries not supported in Phase 1",
                })
              );
            }

            return sparqljsAstToSparqlQuery(ast, queryString);
          }).pipe(Effect.withSpan("SparqlParser.parse")),
      };
    }),
  }
) {}

// Usage: SparqlParser.Default (auto-provided layer)
// In tests: Effect.provide(SparqlParser.Default)
```

#### Tagged Error Pattern (Domain Layer)

> **IMPORTANT**: Errors go in `@beep/knowledge-domain/errors/sparql.errors.ts`

```typescript
// File: packages/knowledge/domain/src/errors/sparql.errors.ts
import * as S from "effect/Schema";

export class SparqlParseError extends S.TaggedError<SparqlParseError>()(
  "SparqlParseError",
  {
    message: S.String,
    queryString: S.String,
    location: S.optional(
      S.Struct({
        line: S.Number,
        column: S.Number,
      })
    ),
  }
) {}

export class SparqlUnsupportedFeatureError extends S.TaggedError<SparqlUnsupportedFeatureError>()(
  "SparqlUnsupportedFeatureError",
  {
    feature: S.String,
    queryString: S.String,
    message: S.String,
  }
) {}

export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>()(
  "SparqlExecutionError",
  {
    message: S.String,
    queryString: S.String,
  }
) {}
```

### Installation

```bash
bun add sparqljs @types/sparqljs -w
```

### Test Queries

Valid queries that must parse:

```sparql
-- Basic SELECT
SELECT ?s ?p ?o WHERE { ?s ?p ?o }

-- SELECT with FILTER
SELECT ?name WHERE {
  ?person ex:name ?name .
  FILTER(?name = "John")
}

-- CONSTRUCT
CONSTRUCT { ?s ex:mapped ?o }
WHERE { ?s ex:original ?o }

-- ASK
ASK { ?s rdf:type ex:Person }

-- PREFIX
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?person WHERE { ?person foaf:name "Alice" }
```

Invalid queries that must fail:

```sparql
-- Syntax error
SELECT ?s WHERE { ?s ?p

-- Unsupported feature
SELECT ?s WHERE { ?s ex:path+ ?o }
```

### Verification

```bash
bun run check --filter @beep/knowledge-server
```

### Success Criteria

- [ ] ParseError and UnsupportedFeatureError created
- [ ] SparqlParser service tag created
- [ ] SparqlParserLive layer created
- [ ] Parser handles SELECT, CONSTRUCT, ASK
- [ ] Parser handles PREFIX declarations
- [ ] Parser rejects unsupported features
- [ ] Type check passes
```

---

### Test Agent: test-writer

```markdown
## Task: Create Parser Unit Tests

You are implementing Phase 1 of the Knowledge SPARQL Integration spec.

### Mission

Create comprehensive unit tests for the SparqlParser service.

### Files to Create

1. `packages/knowledge/server/test/Sparql/SparqlParser.test.ts`
   - Test valid queries (SELECT, CONSTRUCT, ASK)
   - Test PREFIX declarations
   - Test invalid queries (syntax errors)
   - Test unsupported features (DESCRIBE)

### Critical Patterns

#### Effect Test Pattern (REQUIRED)

> Use SparqlParser.Default layer (from Effect.Service pattern).
> Use accessors: `yield* SparqlParser.parse(query)`

```typescript
import { describe, effect, strictEqual, assertTrue } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { SparqlParser } from "../../src/Sparql/SparqlParser.js";

const TestLayer = SparqlParser.Default;

describe("SparqlParser", () => {
  effect("parses basic SELECT query", () =>
    Effect.gen(function* () {
      const query = yield* SparqlParser.parse("SELECT ?s WHERE { ?s ?p ?o }");

      strictEqual(query.queryType, "SELECT");
      strictEqual(A.length(query.variables), 1);
      strictEqual(query.variables[0], "s");
    }).pipe(Effect.provide(TestLayer))
  );
});
```

#### Testing Errors

```typescript
effect("fails on malformed query with SparqlParseError", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(
      SparqlParser.parse("SELECT ?s WHERE { ?s")
    );

    strictEqual(result._tag, "Left");
    if (result._tag === "Left") {
      strictEqual(result.left._tag, "SparqlParseError");
    }
  }).pipe(Effect.provide(TestLayer))
);

effect("rejects DESCRIBE with SparqlUnsupportedFeatureError", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(
      SparqlParser.parse("DESCRIBE <http://example.org/resource>")
    );

    strictEqual(result._tag, "Left");
    if (result._tag === "Left") {
      strictEqual(result.left._tag, "SparqlUnsupportedFeatureError");
    }
  }).pipe(Effect.provide(TestLayer))
);
```

### Test Cases

#### Valid Queries

1. Basic SELECT: `SELECT ?s WHERE { ?s ?p ?o }`
2. SELECT with FILTER: `SELECT ?name WHERE { ?person ex:name ?name . FILTER(?name = "John") }`
3. CONSTRUCT: `CONSTRUCT { ?s ex:mapped ?o } WHERE { ?s ex:original ?o }`
4. ASK: `ASK { ?s rdf:type ex:Person }`
5. PREFIX: `PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT ?person WHERE { ?person foaf:name "Alice" }`

#### Invalid Queries

1. Syntax error: `SELECT ?s WHERE { ?s ?p`
2. Unsupported DESCRIBE: `DESCRIBE ?s`
3. Unsupported property path: `SELECT ?s WHERE { ?s ex:path+ ?o }`

### FORBIDDEN Patterns

- NO bun:test with Effect.runPromise (use @beep/testkit)
- NO async/await in Effect.gen
- NO Effect.runSync

### Verification

```bash
bun run test --filter @beep/knowledge-server -- SparqlParser.test.ts
```

### Success Criteria

- [ ] All valid query tests pass
- [ ] All invalid query tests pass
- [ ] PREFIX handling tested
- [ ] Error types verified
- [ ] Uses @beep/testkit (not raw bun:test)
```

---

## Phase 2: SPARQL Service

### Primary Agent: effect-code-writer

```markdown
## Task: Implement SparqlService

You are implementing Phase 2 of the Knowledge SPARQL Integration spec.

### Mission

Create the SparqlService that executes parsed SPARQL queries against RdfStore.

### Files to Create

1. `packages/knowledge/server/src/Sparql/SparqlService.ts`
   - SparqlService tag with executeSelect, executeConstruct, executeAsk
   - SparqlServiceLive layer
   - Depends on RdfStore

2. `packages/knowledge/server/src/Sparql/QueryExecutor.ts`
   - executeBasicGraphPattern function
   - Variable binding logic
   - Pattern joining

3. `packages/knowledge/server/src/Sparql/FilterEvaluator.ts`
   - FILTER expression evaluation
   - Support equality, comparison, regex

### Critical Patterns

#### Effect.Service Pattern (REQUIRED)

> **CRITICAL**: Use Effect.Service with `accessors: true`, NOT Context.Tag.

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { SparqlQuery, SparqlBindings, Quad } from "@beep/knowledge-domain";
import { SparqlExecutionError } from "@beep/knowledge-domain/errors";
import { RdfStore } from "../Rdf/index.js";
import { executeBasicGraphPattern } from "./QueryExecutor.js";
import { ResultFormatter } from "./ResultFormatter.js";

export class SparqlService extends Effect.Service<SparqlService>()(
  "@beep/knowledge-server/SparqlService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const store = yield* RdfStore;

      return {
        executeSelect: (query: SparqlQuery) =>
          Effect.gen(function* () {
            const bindings = yield* executeBasicGraphPattern(
              query.parsedAst.where,
              store
            );
            return yield* ResultFormatter.formatSelectResults(
              bindings,
              query.variables
            );
          }).pipe(Effect.withSpan("SparqlService.executeSelect")),

        executeConstruct: (query: SparqlQuery) =>
          Effect.gen(function* () {
            const bindings = yield* executeBasicGraphPattern(
              query.parsedAst.where,
              store
            );
            // Apply CONSTRUCT template to bindings
            return applyConstructTemplate(query.parsedAst.template, bindings);
          }).pipe(Effect.withSpan("SparqlService.executeConstruct")),

        executeAsk: (query: SparqlQuery) =>
          Effect.gen(function* () {
            const bindings = yield* executeBasicGraphPattern(
              query.parsedAst.where,
              store
            );
            return A.isNonEmptyReadonlyArray(bindings);
          }).pipe(Effect.withSpan("SparqlService.executeAsk")),
      };
    }),
  }
) {}

// Layer composition: SparqlService.Default automatically includes dependencies
// In tests: Layer.provideMerge(SparqlService.Default, RdfStore.Default)
```

#### RdfStore Integration (CORRECTED)

> **IMPORTANT**: RdfStore API is `match(QuadPattern)` NOT `query(s, p, o)`.

```typescript
import * as O from "effect/Option";
import { QuadPattern, IRI, Quad } from "@beep/knowledge-domain";
import { RdfStore } from "../Rdf/index.js";

// Translation: SPARQL triple pattern → QuadPattern
// { ?s ex:name ?o } →
const pattern = new QuadPattern({
  subject: O.none(),  // wildcard for variable ?s
  predicate: O.some(IRI.make("http://example.org/name")),
  object: O.none(),   // wildcard for variable ?o
  graph: O.none(),    // default graph
});

const quads = yield* RdfStore.match(pattern);  // Returns ReadonlyArray<Quad>
```

### FORBIDDEN Patterns

- NO native array methods (use A.map, A.filter)
- NO async/await in Effect.gen
- NO throwing errors (use Effect.fail)

### Verification

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server -- SparqlService.test.ts
```

### Success Criteria

- [ ] SparqlService interface created
- [ ] executeSelect returns SparqlBindings
- [ ] executeConstruct returns triples
- [ ] executeAsk returns boolean
- [ ] RdfStore integration working
- [ ] Basic FILTER evaluation working
```

---

### Secondary Agent: codebase-researcher

```markdown
## Task: Research RdfStore Integration

You are implementing Phase 2 of the Knowledge SPARQL Integration spec.

### Mission

Understand the RdfStore API from knowledge-rdf-foundation spec and design integration patterns.

### Research Questions

1. **RdfStore API**
   - What methods does RdfStore expose?
   - How are triples queried?
   - What are the input/output types?
   - How are errors handled?

2. **Triple Pattern Matching**
   - How to translate SPARQL triple patterns to RdfStore queries?
   - How to handle variables in subject/predicate/object positions?
   - How to join results across multiple patterns?

3. **Variable Binding**
   - How to build binding sets from query results?
   - How to join bindings across patterns?
   - How to handle FILTER expressions on bindings?

### Files to Examine

- `specs/knowledge-rdf-foundation/README.md`
- `packages/knowledge/server/src/RdfStore/RdfStore.ts`
- `packages/knowledge/domain/src/models/Triple.ts`

### Output Format

Document the integration approach:

```typescript
// RdfStore API
interface RdfStore {
  query: (subject, predicate, object) => Effect<Triple[], StoreError>;
}

// Translation Pattern
// SPARQL: { ?s ex:name ?o }
// RdfStore: query(null, "ex:name", null)

// Variable Binding
// Input: Triple[] from RdfStore
// Output: VariableBindings = { "s": "ex:entity1", "o": "John" }
```
```

---

## Phase 3: Result Formatting & Testing

### Primary Agent: test-writer

```markdown
## Task: Create Integration Tests

You are implementing Phase 3 of the Knowledge SPARQL Integration spec.

### Mission

Create comprehensive integration tests for E2E SPARQL query flows.

### Files to Create

1. `packages/knowledge/server/test/Sparql/integration.test.ts`
   - E2E query tests
   - RdfStore → SPARQL → Results
   - Tests all query types

2. `packages/knowledge/server/test/Sparql/performance.test.ts`
   - Performance benchmarks
   - Simple queries < 100ms
   - Complex queries < 200ms

### Critical Patterns

#### Layer Integration Test (CORRECTED)

> Use Layer.provideMerge for shared dependencies.
> Use Effect.Service accessors pattern.

```typescript
import { describe, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import { RdfStore } from "../../src/Rdf/index.js";
import { SparqlService, SparqlParser } from "../../src/Sparql/index.js";
import { makeIRI, makeLiteral, Quad } from "@beep/knowledge-domain";

// Layer composition with shared RdfStore
const TestLayer = SparqlService.Default.pipe(
  Layer.provideMerge(SparqlParser.Default),
  Layer.provideMerge(RdfStore.Default)
);

describe("SPARQL Integration", () => {
  layer(TestLayer, { timeout: Duration.seconds(30) })("E2E", (it) => {
    it.effect("queries entities from store", () =>
      Effect.gen(function* () {
        // Populate store using accessors
        const typeIRI = makeIRI("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
        const personClass = makeIRI("http://example.org/Person");
        const nameProperty = makeIRI("http://example.org/name");
        const entity1 = makeIRI("http://example.org/entity1");

        yield* RdfStore.addQuad(
          new Quad({ subject: entity1, predicate: typeIRI, object: personClass })
        );
        yield* RdfStore.addQuad(
          new Quad({ subject: entity1, predicate: nameProperty, object: makeLiteral("John Doe") })
        );

        // Parse and execute using accessors
        const query = yield* SparqlParser.parse(
          "PREFIX ex: <http://example.org/> SELECT ?name WHERE { ?s ex:name ?name }"
        );
        const result = yield* SparqlService.executeSelect(query);

        // Verify results
        strictEqual(A.length(result.results.bindings), 1);
        strictEqual(result.results.bindings[0].name.value, "John Doe");
      })
    );
  });
});
```

#### Performance Test (CORRECTED)

> Use `live()` helper and `Effect.clockWith` - NOT `Date.now()`.

```typescript
import { live, assertTrue } from "@beep/testkit";
import * as Effect from "effect/Effect";

live("simple query completes in < 100ms", () =>
  Effect.gen(function* () {
    // Use Effect clock, not Date.now()
    const start = yield* Effect.clockWith((c) => c.currentTimeMillis);

    yield* SparqlService.executeSelect(simpleQuery);

    const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const elapsed = end - start;

    console.log(`Query completed in ${elapsed}ms`);
    assertTrue(elapsed < 100, `Query took ${elapsed}ms, expected < 100ms`);
  }).pipe(Effect.provide(TestLayer))
);
```

### Test Cases

1. **Basic SELECT**: Query entities by type
2. **SELECT with FILTER**: Filter by attribute value
3. **CONSTRUCT**: Transform graph patterns
4. **ASK**: Check pattern existence
5. **PREFIX**: Use prefixed IRIs
6. **Multi-pattern**: Join across patterns
7. **Performance**: Benchmark query execution

### Verification

```bash
bun run test --filter @beep/knowledge-server -- integration.test.ts
bun run test --filter @beep/knowledge-server -- performance.test.ts
```

### Success Criteria

- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] All query types tested
- [ ] FILTER expressions tested
- [ ] PREFIX declarations tested
```

---

### Secondary Agent: effect-code-writer

```markdown
## Task: Implement ResultFormatter

You are implementing Phase 3 of the Knowledge SPARQL Integration spec.

### Mission

Create utilities to format query results into W3C SPARQL JSON format and RDF graphs.

### Files to Create

1. `packages/knowledge/server/src/Sparql/ResultFormatter.ts`
   - formatSelectResults (W3C SPARQL JSON)
   - formatConstructResults (RDF triples)
   - formatAskResult (boolean)

### Critical Patterns

#### W3C SPARQL JSON Format

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { SparqlBindings } from "@beep/knowledge-domain";

export class ResultFormatter {
  static formatSelectResults(
    bindings: ReadonlyArray<VariableBindings>,
    variables: ReadonlyArray<string>
  ): Effect.Effect<SparqlBindings, never> {
    return Effect.gen(function* () {
      return new SparqlBindings({
        head: { vars: variables },
        results: {
          bindings: A.map(bindings, (binding) => {
            const formatted: Record<string, BindingValue> = {};
            for (const varName of variables) {
              const value = binding[varName];
              if (value) {
                formatted[varName] = {
                  type: isIri(value) ? "uri" : "literal",
                  value: String(value),
                  datatype: undefined,
                  "xml:lang": undefined,
                };
              }
            }
            return formatted;
          }),
        },
      });
    });
  }

  static formatConstructResults(
    triples: ReadonlyArray<Triple>
  ): Effect.Effect<string, never> {
    return Effect.gen(function* () {
      // Format as Turtle or N-Triples
      return A.map(triples, (t) => `${t.subject} ${t.predicate} ${t.object} .`)
        .join("\n");
    });
  }

  static formatAskResult(
    result: boolean
  ): Effect.Effect<{ boolean: boolean }, never> {
    return Effect.succeed({ boolean: result });
  }
}
```

### FORBIDDEN Patterns

- NO native string methods (use Str.split, Str.join)
- NO manual JSON construction (use Schema.Class)

### Verification

```bash
bun run check --filter @beep/knowledge-server
```

### Success Criteria

- [ ] formatSelectResults outputs W3C SPARQL JSON
- [ ] formatConstructResults outputs RDF
- [ ] formatAskResult outputs boolean
- [ ] Type check passes
```

---

## Cross-Phase Agents

### reflector: Phase Synthesis

```markdown
## Task: Analyze Phase Learnings

Synthesize learnings from the completed phase.

### Input

- Current REFLECTION_LOG.md entries
- Phase implementation artifacts
- Any issues encountered

### Analysis Areas

1. **What Worked Well**
   - sparqljs integration
   - RdfStore query patterns
   - Effect error handling

2. **What Was Challenging**
   - Variable binding algorithm
   - FILTER expression evaluation
   - Performance optimization

3. **Pattern Candidates**
   - SPARQL parser wrapping pattern
   - Query executor design
   - Result formatting utilities

4. **Next Phase Improvements**
   - Oxigraph migration path
   - Advanced SPARQL features
   - Query optimization

### Output Format

Update `REFLECTION_LOG.md` with findings.
```

---

## Usage Notes

### Launching Agents

Use the Task tool with appropriate subagent_type:

```
Task tool:
  subagent_type: "effect-code-writer"
  prompt: [paste prompt from above]
```

### Agent Output Handling

| Agent Type | Handle Output |
|------------|---------------|
| `codebase-researcher` | Review findings, inform implementation |
| `effect-code-writer` | Verify files created, run type check |
| `test-writer` | Run tests, verify coverage |

### Parallel Execution Rules

**Safe to parallelize:**
- `effect-code-writer` (different files)
- Multiple `test-writer` tasks (different test files)

**Must be sequential:**
- `effect-code-writer` BEFORE `test-writer`
- Parser implementation BEFORE service implementation

### sparqljs Documentation

- GitHub: https://github.com/RubenVerborgh/SPARQL.js
- API: `new Parser().parse(queryString)`
- AST structure: `{ queryType, where, variables, prefixes }`

### RdfStore API Reference

> **UPDATED**: Actual API from RDF foundation implementation (179 tests passing).

```typescript
// RdfStore uses Effect.Service with accessors: true
export class RdfStore extends Effect.Service<RdfStore>()(
  "@beep/knowledge-server/RdfStore",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      // ... implementation
      return {
        // Pattern matching (wildcards via Option.none())
        match: (pattern: QuadPattern) =>
          Effect.Effect<ReadonlyArray<Quad>, never>,

        // Count matches
        countMatches: (pattern: QuadPattern) =>
          Effect.Effect<number, never>,

        // Check existence
        hasQuad: (quad: Quad) =>
          Effect.Effect<boolean, never>,

        // Add quad
        addQuad: (quad: Quad) =>
          Effect.Effect<void, never>,
      };
    }),
  }
) {}
```

**Usage**:
```typescript
import * as O from "effect/Option";
import { QuadPattern, IRI } from "@beep/knowledge-domain";

// Match all quads with specific predicate
const pattern = new QuadPattern({
  subject: O.none(),  // wildcard
  predicate: O.some(IRI.make("http://example.org/name")),
  object: O.none(),   // wildcard
  graph: O.none(),    // wildcard (default graph)
});

const quads = yield* RdfStore.match(pattern);
```

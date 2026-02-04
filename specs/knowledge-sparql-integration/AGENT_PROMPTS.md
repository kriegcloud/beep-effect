# Agent Prompts: Knowledge SPARQL Integration

> Ready-to-use prompts for specialized agents working on SPARQL query capability.

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
## Task: Create SPARQL Value Objects

You are implementing Phase 1 of the Knowledge SPARQL Integration spec.

### Mission

Create domain value objects for SPARQL queries and result bindings in the knowledge domain layer.

### Files to Create

1. `packages/knowledge/domain/src/value-objects/sparql/SparqlQuery.ts`
   - Schema.Class for SPARQL query representation
   - Fields: queryString, parsedAst, queryType, prefixes, variables
   - Use S.Literal for queryType enum

2. `packages/knowledge/domain/src/value-objects/sparql/SparqlBindings.ts`
   - Schema.Class for W3C SPARQL JSON format
   - Fields: head (vars), results (bindings)
   - Nested structures for binding values

3. `packages/knowledge/domain/src/value-objects/sparql/index.ts`
   - Barrel export for sparql value objects

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

### Secondary Agent: codebase-researcher

```markdown
## Task: Integrate sparqljs Parser

You are implementing Phase 1 of the Knowledge SPARQL Integration spec.

### Mission

Wrap the sparqljs library in an Effect-native SparqlParser service and create tagged errors for parse failures.

### Files to Create

1. `packages/knowledge/server/src/Sparql/errors.ts`
   - ParseError tagged error
   - UnsupportedFeatureError tagged error
   - Use S.TaggedError pattern

2. `packages/knowledge/server/src/Sparql/SparqlParser.ts`
   - SparqlParser service tag
   - SparqlParserLive layer
   - Wraps sparqljs Parser
   - Validates supported features

3. `packages/knowledge/server/src/Sparql/index.ts`
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

#### Service Tag Pattern

```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import { SparqlQuery } from "@beep/knowledge-domain";
import { ParseError, UnsupportedFeatureError } from "./errors.js";

export class SparqlParser extends Context.Tag("SparqlParser")<
  SparqlParser,
  {
    readonly parse: (queryString: string) => Effect.Effect<
      SparqlQuery,
      ParseError | UnsupportedFeatureError
    >;
  }
>() {}
```

#### Layer Implementation

```typescript
import * as Layer from "effect/Layer";
import { Parser } from "sparqljs";

export const SparqlParserLive = Layer.succeed(
  SparqlParser,
  SparqlParser.of({
    parse: (queryString) =>
      Effect.gen(function* () {
        const parser = new Parser();

        try {
          const ast = parser.parse(queryString);

          // Validate supported features
          if (ast.queryType === "DESCRIBE") {
            return yield* Effect.fail(
              new UnsupportedFeatureError({
                feature: "DESCRIBE queries",
                queryString,
                message: "DESCRIBE queries not supported in Phase 1",
              })
            );
          }

          // Extract query metadata
          const queryType = ast.queryType as "SELECT" | "CONSTRUCT" | "ASK";
          const prefixes = ast.prefixes || {};
          const variables = queryType === "SELECT"
            ? ast.variables.map((v) => v.variable.value)
            : [];

          return new SparqlQuery({
            queryString,
            parsedAst: ast,
            queryType,
            prefixes,
            variables,
          });
        } catch (error) {
          return yield* Effect.fail(
            new ParseError({
              message: String(error),
              queryString,
              location: undefined,
            })
          );
        }
      }),
  })
);
```

#### Tagged Error Pattern

```typescript
import * as S from "effect/Schema";

export class ParseError extends S.TaggedError<ParseError>()(
  "ParseError",
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
   - Test unsupported features

### Critical Patterns

#### Effect Test Pattern (REQUIRED)

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { SparqlParser, SparqlParserLive } from "../../src/Sparql/SparqlParser.js";

effect("parses basic SELECT query", () =>
  Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const query = yield* parser.parse("SELECT ?s WHERE { ?s ?p ?o }");

    strictEqual(query.queryType, "SELECT");
    strictEqual(query.variables.length, 1);
    strictEqual(query.variables[0], "s");
  }).pipe(Effect.provide(SparqlParserLive))
);
```

#### Testing Errors

```typescript
effect("fails on malformed query", () =>
  Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const result = yield* Effect.either(parser.parse("SELECT ?s WHERE { ?s"));

    strictEqual(result._tag, "Left");
    if (result._tag === "Left") {
      strictEqual(result.left._tag, "ParseError");
    }
  }).pipe(Effect.provide(SparqlParserLive))
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

#### Service Interface

```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import { SparqlQuery, SparqlBindings } from "@beep/knowledge-domain";
import { Triple } from "@beep/knowledge-server/RdfStore";

export class SparqlService extends Context.Tag("SparqlService")<
  SparqlService,
  {
    readonly executeSelect: (
      query: SparqlQuery
    ) => Effect.Effect<SparqlBindings, ExecutionError>;

    readonly executeConstruct: (
      query: SparqlQuery
    ) => Effect.Effect<ReadonlyArray<Triple>, ExecutionError>;

    readonly executeAsk: (
      query: SparqlQuery
    ) => Effect.Effect<boolean, ExecutionError>;
  }
>() {}
```

#### Layer with Dependencies

```typescript
import * as Layer from "effect/Layer";
import { RdfStore } from "@beep/knowledge-server/RdfStore";

export const SparqlServiceLive = Layer.effect(
  SparqlService,
  Effect.gen(function* () {
    const store = yield* RdfStore;

    return SparqlService.of({
      executeSelect: (query) =>
        Effect.gen(function* () {
          const bindings = yield* QueryExecutor.executeBasicGraphPattern(
            query.parsedAst.where,
            store
          );
          return formatAsJson(bindings, query.variables);
        }),

      executeConstruct: (query) =>
        Effect.gen(function* () {
          const bindings = yield* QueryExecutor.executeBasicGraphPattern(
            query.parsedAst.where,
            store
          );
          return applyConstructTemplate(query.parsedAst.template, bindings);
        }),

      executeAsk: (query) =>
        Effect.gen(function* () {
          const bindings = yield* QueryExecutor.executeBasicGraphPattern(
            query.parsedAst.where,
            store
          );
          return A.isNonEmptyReadonlyArray(bindings);
        }),
    });
  })
);
```

#### RdfStore Integration

```typescript
// RdfStore API from Phase 0
interface RdfStore {
  readonly query: (
    subject: string | null,
    predicate: string | null,
    object: string | null
  ) => Effect.Effect<ReadonlyArray<Triple>, StoreError>;
}

// Translation: SPARQL triple pattern → RdfStore query
// { ?s ex:name ?o } → store.query(null, "ex:name", null)
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

#### Layer Integration Test

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { RdfStore, RdfStoreLive } from "../../src/RdfStore/index.js";
import { SparqlService, SparqlServiceLive } from "../../src/Sparql/index.js";
import { SparqlParser, SparqlParserLive } from "../../src/Sparql/SparqlParser.js";

const TestLayer = Layer.mergeAll(
  RdfStoreLive,
  SparqlParserLive,
  SparqlServiceLive
);

layer(TestLayer)("SPARQL Integration", (it) => {
  it.effect("queries entities from store", () =>
    Effect.gen(function* () {
      const store = yield* RdfStore;
      const parser = yield* SparqlParser;
      const service = yield* SparqlService;

      // Populate store
      yield* store.addTriple({
        subject: "ex:entity1",
        predicate: "rdf:type",
        object: "ex:Person",
      });
      yield* store.addTriple({
        subject: "ex:entity1",
        predicate: "ex:name",
        object: "John Doe",
      });

      // Parse query
      const query = yield* parser.parse("SELECT ?name WHERE { ?s ex:name ?name }");

      // Execute query
      const result = yield* service.executeSelect(query);

      // Verify results
      strictEqual(result.results.bindings.length, 1);
      strictEqual(result.results.bindings[0].name.value, "John Doe");
    })
  );
});
```

#### Performance Test

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";

effect("simple query completes in < 100ms", () =>
  Effect.gen(function* () {
    const start = Date.now();

    yield* service.executeSelect(simpleQuery);

    const elapsed = Date.now() - start;
    strictEqual(elapsed < 100, true);
  })
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

From `knowledge-rdf-foundation` spec:

```typescript
interface RdfStore {
  readonly query: (
    subject: string | null,
    predicate: string | null,
    object: string | null
  ) => Effect.Effect<ReadonlyArray<Triple>, StoreError>;
}
```

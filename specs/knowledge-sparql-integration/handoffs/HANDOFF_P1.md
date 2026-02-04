# Phase 1 Handoff - Value Objects & Parser

**Phase**: 1.1 - SPARQL Value Objects & Parser
**Status**: COMPLETE ✅
**Completed**: 2026-02-04
**Estimated Duration**: 3.5 days
**Dependencies**: `specs/knowledge-rdf-foundation/` (RdfStore, Serializer, RdfBuilder - COMPLETE)

> **PHASE COMPLETION REQUIREMENT**: A phase is NOT complete until:
> 1. All deliverables pass type checking and tests
> 2. REFLECTION_LOG.md is updated with learnings
> 3. Next phase handoff documents (HANDOFF_P{N+1}.md, P{N+1}_ORCHESTRATOR_PROMPT.md) are created

> **IMPORTANT**: This handoff has been updated based on lessons learned from implementing the RDF foundation spec. Key changes:
> - SparqlBindings already exists in domain layer (only need SparqlQuery)
> - Use Effect.Service pattern with `accessors: true` (not Context.Tag)
> - RdfStore uses `match(QuadPattern)` not `query(s, p, o)`
> - Errors go in domain layer, not server layer
> - Use Layer.provideMerge for test Layer composition

---

## 4-Tier Memory Structure

### Tier 1: Immediate Context (Session Working Memory)

**Current Task**: Implement SPARQL value objects and parser wrapper

**Active Files**:
```
packages/knowledge/domain/src/value-objects/sparql/
  index.ts              # NEW - barrel export
  SparqlQuery.ts        # NEW - query value object

packages/knowledge/domain/src/errors/
  sparql.errors.ts      # NEW - SPARQL error classes
  index.ts              # UPDATE - add sparql exports

packages/knowledge/server/src/Sparql/
  index.ts              # NEW - barrel export
  SparqlParser.ts       # NEW - parser service

packages/knowledge/server/test/Sparql/
  SparqlParser.test.ts  # NEW - parser tests
```

**EXISTING (do not recreate)**:
```
packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts  # ALREADY EXISTS
packages/knowledge/server/src/Rdf/                                  # Reference implementation
```

**Immediate TODOs**:
- [ ] Install sparqljs dependency: `bun add sparqljs @types/sparqljs -w`
- [ ] Define SparqlQuery value object with Schema.Class
- [ ] Define SparqlBindings value object (W3C SPARQL JSON format)
- [ ] Wrap sparqljs parser in SparqlParser service
- [ ] Create tagged errors for parse failures
- [ ] Write parser unit tests (valid/invalid queries)

**Next Steps After Completion**:
1. Verify parser handles SELECT, CONSTRUCT, ASK queries
2. Test PREFIX declaration handling
3. Document parser limitations (unsupported SPARQL 1.1 features)
4. Create HANDOFF_P2.md for SparqlService implementation

---

### Tier 2: Phase Context (Multi-Session Memory)

**Phase Goal**: Parse and validate SPARQL queries before execution

**Key Decisions**:
- sparqljs parser (mature SPARQL 1.1 library)
- Schema.Class value objects (immutable, typed)
- Tagged errors with location info
- Scope: SELECT, CONSTRUCT, ASK (no UPDATE)

**Integration Points**: RdfStore (Phase 0), SparqlService (Phase 2), Client layer (results)

---

### Tier 3: Specification Context (Cross-Phase Memory)

**Goal**: Enable SPARQL queries over RDF knowledge graph

**Phase Flow**: Phase 0 (RdfStore) → Phase 1 (Parser) → Phase 2 (Service) → Phase 3 (Formatting)

**Constraints**: Graphs < 100K triples, < 100ms simple queries, < 200ms complex, W3C JSON format

**Stack**: sparqljs, Effect Schema, @beep/testkit, RdfStore

See README.md for full specification details.

---

### Tier 4: Project Context (Strategic Memory)

**Architecture**: Vertical slice monorepo with Effect-TS
**Layers**: Domain (value objects) → Server (parser, service) → Client (future)

**Critical Rules** (see `.claude/rules/effect-patterns.md`):
- Namespace imports: `import * as Effect from "effect/Effect"`
- Effect utilities: `A.map`, `A.filter` (NEVER native methods)
- Branded EntityIds (NEVER plain strings)
- @beep/testkit (NEVER raw bun:test)

**Success**: Parse queries, execute against RdfStore, W3C JSON format, < 200ms performance

---

## Phase 1 Specific Context

### Parser Scope

**Supported Query Types**:
- SELECT (projection queries)
- CONSTRUCT (graph construction)
- ASK (boolean pattern matching)

**Supported Clauses**:
- WHERE (basic graph patterns)
- FILTER (equality, comparison, regex)
- PREFIX (namespace declarations)
- LIMIT/OFFSET (result pagination)

**Unsupported (Phase 1)**:
- UPDATE operations (INSERT/DELETE DATA)
- DESCRIBE queries
- Property paths (`ex:parent+`, `ex:child*`)
- Aggregates (COUNT, SUM, AVG, etc.)
- Subqueries
- BIND clause
- VALUES clause

### Value Object Contracts

> **NOTE**: SparqlBindings ALREADY EXISTS at `packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts`.
> It uses domain `Term` types (IRI, BlankNode, Literal) not W3C JSON format.
> Only SparqlQuery needs to be created.

**SparqlQuery** (domain layer - NEW):
```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/sparql/SparqlQuery");

// Query type discriminator
export const SparqlQueryType = S.Literal("SELECT", "CONSTRUCT", "ASK", "DESCRIBE");
export type SparqlQueryType = typeof SparqlQueryType.Type;

// Prefix mapping (prefix → IRI expansion)
export const PrefixMap = S.Record({ key: S.String, value: S.String });
export type PrefixMap = typeof PrefixMap.Type;

export class SparqlQuery extends S.Class<SparqlQuery>($I`SparqlQuery`)({
  queryString: S.String.annotations({
    description: "Original SPARQL query text",
  }),
  queryType: SparqlQueryType.annotations({
    description: "Type of SPARQL query",
  }),
  prefixes: PrefixMap.annotations({
    description: "PREFIX declarations (prefix → IRI)",
  }),
  variables: S.Array(S.String).annotations({
    description: "Projected variables (SELECT only, without ? prefix)",
  }),
  // Note: parsedAst is NOT stored in the value object.
  // The parser service returns both the SparqlQuery and the AST separately.
  // This keeps the domain layer free from sparqljs library types.
}) {}
```

**SparqlBindings** (domain layer - ALREADY EXISTS):
```typescript
// Location: packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts
// Uses domain Term types (IRI, BlankNode, Literal), NOT W3C JSON format
import { SparqlBindings, SparqlBinding, SparqlRow } from "@beep/knowledge-domain/value-objects";
```

### Parser Service Contract

> **NOTE**: Use Effect.Service with `accessors: true` (not Context.Tag).
> This pattern matches RdfStore, Serializer, and RdfBuilder from RDF foundation.

**SparqlParser** (server layer):
```typescript
import * as Effect from "effect/Effect";
import { SparqlParseError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { SparqlQuery } from "@beep/knowledge-domain/value-objects";
import * as sparqljs from "sparqljs";

/**
 * Result of parsing a SPARQL query.
 * Separates domain value object from library-specific AST.
 */
export interface ParseResult {
  readonly query: SparqlQuery;
  readonly ast: sparqljs.SparqlQuery;  // Library type for Phase 2 executor
}

/**
 * SparqlParser Effect.Service
 *
 * Wraps sparqljs library for parsing SPARQL queries.
 *
 * @since 0.1.0
 * @category services
 */
export class SparqlParser extends Effect.Service<SparqlParser>()(
  "@beep/knowledge-server/SparqlParser",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const parser = new sparqljs.Parser();

      return {
        /**
         * Parse a SPARQL query string into domain value object and AST.
         *
         * @param queryString - SPARQL query text
         * @returns Effect yielding ParseResult with query and AST
         */
        parse: (queryString: string): Effect.Effect<
          ParseResult,
          SparqlParseError | SparqlUnsupportedFeatureError
        > =>
          Effect.try({
            try: () => {
              const ast = parser.parse(queryString);
              // Convert AST to domain SparqlQuery...
              return { query: /* ... */, ast };
            },
            catch: (error) => new SparqlParseError({
              message: String(error),
              queryString,
              location: /* extract from error if available */,
            }),
          }).pipe(Effect.withSpan("SparqlParser.parse")),
      };
    }),
  }
) {}
```

### Error Contracts

> **NOTE**: Errors go in DOMAIN layer at `packages/knowledge/domain/src/errors/sparql.errors.ts`.
> This follows the pattern from RDF foundation (RdfTermConversionError, SerializerError are in domain).

**SparqlParseError** (domain layer):
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
```

**SparqlUnsupportedFeatureError** (domain layer):
```typescript
export class SparqlUnsupportedFeatureError extends S.TaggedError<SparqlUnsupportedFeatureError>()(
  "SparqlUnsupportedFeatureError",
  {
    feature: S.String,
    queryString: S.String,
    message: S.String,
  }
) {}
```

**SparqlExecutionError** (domain layer - for Phase 2):
```typescript
export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>()(
  "SparqlExecutionError",
  {
    message: S.String,
    queryString: S.String,
    cause: S.optional(S.String),
  }
) {}
```

---

## Test Requirements

### Parser Unit Tests

**Valid Query Tests** (must pass):
```sparql
-- Basic SELECT
SELECT ?s ?p ?o WHERE { ?s ?p ?o }

-- SELECT with FILTER
SELECT ?entity ?name
WHERE {
  ?entity rdf:type ex:Person .
  ?entity ex:name ?name .
  FILTER(?name = "John Doe")
}

-- CONSTRUCT
CONSTRUCT { ?s ex:mapped ?o }
WHERE { ?s ex:original ?o }

-- ASK
ASK { ?s rdf:type ex:Organization }

-- PREFIX declarations
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?person WHERE { ?person foaf:name "Alice" }
```

**Invalid Query Tests** (must fail gracefully):
```sparql
-- Syntax error
SELECT ?s WHERE { ?s ?p  -- Missing closing brace

-- Unsupported feature (property path)
SELECT ?ancestor WHERE { ?person ex:parent+ ?ancestor }

-- Malformed PREFIX
PREFIX foaf http://xmlns.com/foaf/0.1/  -- Missing colon
```

### Test Runner

> **NOTE**: Use patterns from RDF foundation tests. Key learnings:
> - Use `effect()` helper from @beep/testkit
> - Use `Effect.flip()` for testing error cases
> - Use `assertTrue()` for type checks (instanceof)
> - Provide Layer with `.pipe(Effect.provide(TestLayer))`

```typescript
import { SparqlParseError } from "@beep/knowledge-domain/errors";
import { SparqlParser } from "@beep/knowledge-server/Sparql";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

// Parser only needs its own layer (no RdfStore dependency in Phase 1)
const TestLayer = SparqlParser.Default;

describe("SparqlParser", () => {
  describe("parse", () => {
    effect("should parse basic SELECT query", () =>
      Effect.gen(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse("SELECT ?s WHERE { ?s ?p ?o }");

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 1);
        strictEqual(A.unsafeGet(query.variables, 0), "s");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return SparqlParseError for malformed query", () =>
      Effect.gen(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(
          parser.parse("SELECT ?s WHERE { ?s")
        );

        assertTrue(error instanceof SparqlParseError);
        strictEqual(error._tag, "SparqlParseError");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should extract PREFIX declarations", () =>
      Effect.gen(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          SELECT ?name WHERE { ?person foaf:name ?name }
        `);

        strictEqual(query.prefixes["foaf"], "http://xmlns.com/foaf/0.1/");
      }).pipe(Effect.provide(TestLayer))
    );
  });
});
```

---

## Verification Checklist

Before creating HANDOFF_P2.md, verify:

- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] Parser handles all supported query types (SELECT, CONSTRUCT, ASK)
- [ ] Parser rejects unsupported features with clear error messages
- [ ] Value objects use Schema.Class (not plain interfaces)
- [ ] Imports use namespace convention (`import * as Effect from "effect/Effect"`)
- [ ] No native JavaScript methods used
- [ ] Tests use @beep/testkit (not raw bun:test)

---

## Integration with RDF Foundation (COMPLETE)

> **NOTE**: RDF foundation is COMPLETE. RdfStore, Serializer, and RdfBuilder are all implemented and tested.

**RdfStore API** (actual implementation):
```typescript
// File: packages/knowledge/server/src/Rdf/RdfStoreService.ts
export class RdfStore extends Effect.Service<RdfStore>()(
  "@beep/knowledge-server/RdfStore",
  { accessors: true, ... }
) {}

// Key operations:
interface RdfStoreApi {
  addQuad: (quad: Quad) => Effect.Effect<void>;
  addQuads: (quads: ReadonlyArray<Quad>) => Effect.Effect<void>;
  match: (pattern: QuadPattern) => Effect.Effect<ReadonlyArray<Quad>>;
  countMatches: (pattern: QuadPattern) => Effect.Effect<number>;
  hasQuad: (quad: Quad) => Effect.Effect<boolean>;
  getSubjects: () => Effect.Effect<ReadonlyArray<Quad["subject"]>>;
  getPredicates: () => Effect.Effect<ReadonlyArray<Quad["predicate"]>>;
  getObjects: () => Effect.Effect<ReadonlyArray<Term>>;
  clear: () => Effect.Effect<void>;
  size: Effect.Effect<number>;
}
```

**Phase 2 Integration**: SparqlService will translate SPARQL patterns to `RdfStore.match()` calls.

**Example Translation**:
```sparql
SELECT ?name WHERE { ?person ex:name ?name }
```

Becomes:
```typescript
import { makeIRI, QuadPattern } from "@beep/knowledge-domain/value-objects";

const pattern = new QuadPattern({
  predicate: makeIRI("http://example.org/name"),
  // subject and object undefined = wildcards
});

const matches = yield* rdfStore.match(pattern);
// Returns Quad[], extract object values as ?name bindings
```

**Layer Composition Pattern** (from RDF foundation):
```typescript
// For tests requiring multiple services
const TestLayer = Layer.mergeAll(
  SparqlParser.Default,
  Serializer.Default,
).pipe(Layer.provideMerge(RdfStore.Default));
```

---

## Agent Recommendations

**Phase 1 Agents**:
1. **effect-code-writer**: Create domain value objects (SparqlQuery, SparqlBindings)
2. **codebase-researcher**: Integrate sparqljs, create parser wrapper, error handling
3. **test-writer**: Unit tests for parser (valid/invalid queries)

**Workflow**:
1. effect-code-writer creates value object skeletons
2. codebase-researcher implements parser wrapper + sparqljs integration
3. test-writer validates parser behavior
4. codebase-researcher documents unsupported features

---

## Open Questions for Phase 1

1. **Blank Node Representation**: How to serialize blank nodes in SparqlQuery? (Proposal: Preserve sparqljs AST structure)
2. **AST Validation**: Should parser validate AST structure beyond sparqljs? (Proposal: Minimal validation, defer to executor)
3. **Error Location**: sparqljs provides line/column for syntax errors. Should we enhance for semantic errors? (Proposal: Phase 2)

---

## Lessons from RDF Foundation Implementation

> These patterns were validated during RDF foundation implementation (179 tests, all passing).

### 1. Effect.Service Pattern
```typescript
// CORRECT - Use Effect.Service with accessors
export class SparqlParser extends Effect.Service<SparqlParser>()(
  "@beep/knowledge-server/SparqlParser",
  { accessors: true, effect: Effect.gen(...) }
) {}

// WRONG - Don't use Context.Tag
export class SparqlParser extends Context.Tag("SparqlParser")<...>() {}
```

### 2. Library Type Conversion Layer
Create explicit conversion functions between domain types and library types:
```typescript
// In SparqlParser.ts, create functions like:
const sparqljsAstToSparqlQuery = (ast: sparqljs.SparqlQuery): SparqlQuery => {...}
const extractVariables = (ast: sparqljs.SelectQuery): ReadonlyArray<string> => {...}
const extractPrefixes = (ast: sparqljs.SparqlQuery): PrefixMap => {...}
```

### 3. Error Types in Domain Layer
Errors go in domain, not server:
```
packages/knowledge/domain/src/errors/
  sparql.errors.ts   # SparqlParseError, SparqlUnsupportedFeatureError
  index.ts           # Export all errors
```

### 4. Test Layer Composition
Use Layer.provideMerge when services share dependencies:
```typescript
// When SparqlService needs both Parser and RdfStore
const TestLayer = Layer.mergeAll(
  SparqlParser.Default,
  Serializer.Default,
).pipe(Layer.provideMerge(RdfStore.Default));
```

### 5. Effect.try for Synchronous Library Calls
```typescript
parse: (queryString) => Effect.try({
  try: () => parser.parse(queryString),
  catch: (error) => new SparqlParseError({ message: String(error), ... }),
}).pipe(Effect.withSpan("SparqlParser.parse")),
```

### 6. Observability Spans
Add spans to all service methods:
```typescript
.pipe(Effect.withSpan("SparqlParser.parse", {
  attributes: { queryLength: queryString.length },
}))
```

---

## References

- [sparqljs API Documentation](https://github.com/RubenVerborgh/SPARQL.js#api)
- [W3C SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- `.claude/rules/effect-patterns.md` - Import conventions
- `specs/knowledge-rdf-foundation/REFLECTION_LOG.md` - Implementation learnings
- `packages/knowledge/server/src/Rdf/` - Reference implementations

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-03 | Claude Code | Initial Phase 1 handoff |

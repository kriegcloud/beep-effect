# Phase 1 Handoff - Value Objects & Parser

**Phase**: 1.1 - SPARQL Value Objects & Parser
**Status**: NOT_STARTED
**Estimated Duration**: 3.5 days
**Dependencies**: `specs/knowledge-rdf-foundation/` (RdfStore API)

---

## 4-Tier Memory Structure

### Tier 1: Immediate Context (Session Working Memory)

**Current Task**: Implement SPARQL value objects and parser wrapper

**Active Files**:
```
packages/knowledge/domain/src/value-objects/sparql/
  index.ts
  SparqlQuery.ts
  SparqlBindings.ts

packages/knowledge/server/src/Sparql/
  index.ts
  SparqlParser.ts
  errors.ts

packages/knowledge/server/test/Sparql/
  SparqlParser.test.ts
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

**SparqlQuery** (domain layer):
```typescript
import * as S from "effect/Schema";

export class SparqlQuery extends S.Class<SparqlQuery>("SparqlQuery")({
  queryString: S.String,      // Original SPARQL text
  parsedAst: S.Unknown,       // sparqljs AST (opaque)
  queryType: S.Literal("SELECT", "CONSTRUCT", "ASK"),
  prefixes: S.Record({ key: S.String, value: S.String }),
  variables: S.Array(S.String), // Projection variables (SELECT only)
}) {}
```

**SparqlBindings** (domain layer):
```typescript
// W3C SPARQL Query Results JSON Format
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

### Parser Service Contract

**SparqlParser** (server layer):
```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";

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

### Error Contracts

**ParseError**:
```typescript
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

**UnsupportedFeatureError**:
```typescript
export class UnsupportedFeatureError extends S.TaggedError<UnsupportedFeatureError>()(
  "UnsupportedFeatureError",
  {
    feature: S.String,
    queryString: S.String,
    message: S.String,
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

```typescript
import { effect, strictEqual, throws } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("parses basic SELECT query", () =>
  Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const query = yield* parser.parse("SELECT ?s WHERE { ?s ?p ?o }");

    strictEqual(query.queryType, "SELECT");
    strictEqual(query.variables.length, 1);
    strictEqual(query.variables[0], "s");
  })
);

effect("fails on malformed query", () =>
  Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const result = yield* Effect.either(parser.parse("SELECT ?s WHERE { ?s"));

    throws(result, (error) => error._tag === "ParseError");
  })
);
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

## Integration with Phase 0 (RdfStore)

**Dependency**: Parser output (SparqlQuery) will be consumed by SparqlService in Phase 2.

**RdfStore API** (from `specs/knowledge-rdf-foundation/`):
```typescript
export interface RdfStore {
  readonly query: (
    subject: string | null,
    predicate: string | null,
    object: string | null
  ) => Effect.Effect<Array<Triple>, StoreError>;
}
```

**Phase 2 Integration**: SparqlService will translate SparqlQuery.parsedAst into RdfStore.query() calls.

**Example Translation**:
```sparql
SELECT ?name WHERE { ?person ex:name ?name }
```

Becomes:
```typescript
rdfStore.query(null, "http://example.org/name", null)
// Returns triples, extract object values as ?name bindings
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

## References

- [sparqljs API Documentation](https://github.com/RubenVerborgh/SPARQL.js#api)
- [W3C SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- `.claude/rules/effect-patterns.md` - Import conventions
- `specs/knowledge-rdf-foundation/README.md` - RdfStore API

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-03 | Claude Code | Initial Phase 1 handoff |

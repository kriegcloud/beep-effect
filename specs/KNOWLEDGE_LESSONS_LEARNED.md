# Knowledge Specs: Lessons Learned

> **Purpose**: Extract actionable insights from completed knowledge specs to inform upcoming implementations.

**Analyzed Specs**:
- `knowledge-rdf-foundation` (Complete - 3 phases, 179 tests)
- `knowledge-sparql-integration` (Complete - 2 phases, 73 tests)
- `knowledge-reasoning-engine` (Scaffolding complete)
- `knowledge-graphrag-plus` (Phase 1-2 complete)
- `knowledge-ontology-comparison` (Complete - research spec)

**Target Specs**:
- `knowledge-workflow-durability` (Planned - Phase 3, XL complexity, 51 points)
- `knowledge-entity-resolution-v2` (Planned - Phase 2, M complexity, 36 points)

---

## Critical Insights

### 1. Library Type Conversion Layer is Non-Negotiable

**Pattern Discovered**: `library-type-conversion-layer` (confidence: 5/5)

**Context**: RDF foundation and SPARQL integration both wrapped external libraries (N3.js, sparqljs) with explicit conversion functions.

**Implementation**:
```typescript
// Isolate library types from domain types with explicit converters
const toN3Quad = (quad: DomainQuad): N3.Quad => { /* conversion */ }
const fromN3Quad = (n3Quad: N3.Quad): DomainQuad => { /* conversion */ }

// Similarly for sparqljs
const toSparqlJs = (query: SparqlQuery): sparqljs.Query => { /* conversion */ }
const fromSparqlJs = (ast: sparqljs.Query): SparqlQuery => { /* conversion */ }
```

**Why It Matters**:
- Domain types remain clean and library-agnostic
- Migration to alternative libraries (N3 → Oxigraph) preserves service interface
- Type mismatches handled at clear boundaries, not scattered throughout codebase

**Evidence**:
- RDF foundation: ~200 lines of conversion functions in `RdfStoreService.ts`
- SPARQL integration: Type guards for sparqljs union types enabled safe traversal
- Zero leakage of library types into domain layer

**Application to Upcoming Specs**:
- **Workflow Durability**: Create conversion layer for @effect/workflow persistence types → domain entities
- **Entity Resolution v2**: If using bloom filter library, wrap with domain-specific filter interface

---

### 2. Effect.Service Pattern with Accessors Always Wins

**Pattern**: Use `Effect.Service<T>()("name", { accessors: true })` - NOT `Context.Tag`

**Context**: All completed specs standardized on Effect.Service pattern after initial confusion.

**Correct Pattern**:
```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  accessors: true,
  effect: Effect.gen(function* () {
    const dependency = yield* DependencyService;
    return {
      operation: (input: Input) =>
        Effect.gen(function* () {
          // implementation
        }).pipe(Effect.withSpan("MyService.operation"))
    };
  }),
}) {}
```

**Benefits**:
- Enables `yield* ServiceName` instead of `yield* ServiceName.pipe()`
- Clean composition with `Layer.provideMerge`
- Self-documenting service dependencies via `effect:` parameter

**Common Mistakes**:
```typescript
// WRONG - Plain interface without Effect.gen
export class MyService extends Effect.Service<MyService>()("MyService", {
  accessors: true,
}) {}

// WRONG - Context.Tag pattern (outdated)
export class MyService extends Context.Tag<MyService>("MyService") {}
```

**Evidence**:
- RDF foundation: 3 services (RdfStore, Serializer, RdfBuilder) all use this pattern
- SPARQL: SparqlParser and SparqlService use this pattern
- GraphRAG: CitationValidator, ConfidenceScorer, all services use this pattern
- Zero instances of Context.Tag in new code

**Application to Upcoming Specs**:
- **Workflow Durability**: ExtractionWorkflow activities as Effect.Services
- **Entity Resolution v2**: EntityRegistry, MergeHistory, IncrementalClusterer as Effect.Services

---

### 3. Layer.provideMerge for Shared Dependencies is Critical

**Pattern**: Test layers sharing mutable dependencies MUST use `Layer.provideMerge`

**Context**: Multiple specs discovered this pattern through test failures when services needed shared state.

**Correct Pattern**:
```typescript
// Service A depends on SharedService
const ServiceALayer = Layer.effect(ServiceA, Effect.gen(function* () {
  const shared = yield* SharedService;
  return { /* implementation */ };
}));

// Service B also depends on SharedService
const ServiceBLayer = Layer.effect(ServiceB, Effect.gen(function* () {
  const shared = yield* SharedService;
  return { /* implementation */ };
}));

// Test layer: ServiceA and ServiceB share SAME SharedService instance
const TestLayer = Layer.provideMerge(
  Layer.merge(ServiceALayer, ServiceBLayer),
  SharedService.Default
);
```

**Why This Matters**:
- Without `provideMerge`, each service gets separate instance of dependency
- For mutable stores (RdfStore, database repos), separate instances break tests
- Tests need to populate shared store, then query via service

**Evidence**:
- RDF foundation: Serializer and RdfBuilder tests both need shared RdfStore instance
- SPARQL: SparqlService tests need shared RdfStore for setup data
- GraphRAG: CitationValidator needs shared SPARQL client

**Common Failure Mode**:
```typescript
// WRONG - Creates two separate RdfStore instances
const TestLayer = Layer.merge(
  ServiceA.Default,
  ServiceB.Default,
  RdfStore.Default
);

// Test adds data via RdfStore, but ServiceA queries different instance
// Result: test fails with "no data found"
```

**Application to Upcoming Specs**:
- **Workflow Durability**: Activity tests will share workflow persistence layer
- **Entity Resolution v2**: EntityRegistry and IncrementalClusterer share entity store

---

### 4. Helper Modules vs Services: Clear Decision Criteria

**Pattern Discovered**: NOT everything needs to be an Effect.Service

**Decision Framework**:

| Use Effect.Service When | Use Helper Module When |
|-------------------------|------------------------|
| Stateful (holds mutable data) | Pure functions |
| Lifecycle management (acquire/release) | Algorithmic transformations |
| External I/O (database, LLM, HTTP) | Internal computations |
| Needs testability via Layer swapping | Already testable via pure functions |

**Evidence**:

**Services** (from completed specs):
- `RdfStore` - Mutable triple store
- `SparqlService` - Stateful query execution
- `ReasonerService` - Inference state management
- `CitationValidator` - External SPARQL queries

**Helper Modules** (from completed specs):
- `FilterEvaluator` - Pure SPARQL filter evaluation
- `QueryExecutor` - Pure query execution logic
- `PromptTemplates` - String formatting utilities
- Citation parsers - Regex-based extraction

**Benefits**:
- Services provide observability (Effect.withSpan)
- Helper modules avoid service boilerplate for simple logic
- Clear separation: stateful (service) vs stateless (helper)

**Common Over-Engineering**:
```typescript
// WRONG - Making pure function into service
export class StringNormalizer extends Effect.Service<StringNormalizer>()(
  "StringNormalizer",
  {
    accessors: true,
    effect: Effect.succeed({
      normalize: (s: string) => s.toLowerCase().trim()
    })
  }
) {}

// RIGHT - Just export the function
export const normalize = (s: string): string => s.toLowerCase().trim();
```

**Application to Upcoming Specs**:
- **Workflow Durability**: Activity implementations are services, state transitions are helper functions
- **Entity Resolution v2**: MergeHistory is service, confidence calculation is helper

---

### 5. Effect.async Pattern for Callback-Based Libraries

**Pattern Discovered**: `effect-async-callback-bridge` (confidence: 5/5)

**Context**: N3.js Parser and Writer use callback patterns. Clean wrapping pattern emerged.

**Correct Pattern**:
```typescript
const parseWithCallback = (input: string): Effect.Effect<Result, ParseError> =>
  Effect.async<Result, ParseError>((resume) => {
    const parser = new N3.Parser();
    let hasError = false;

    parser.parse(input, (error, quad, prefixes) => {
      if (hasError) return; // Prevent multiple resume calls

      if (error) {
        hasError = true;
        resume(Effect.fail(new ParseError({ message: error.message })));
        return;
      }

      if (!quad) {
        // End of stream
        resume(Effect.succeed(result));
        return;
      }

      // Accumulate quads...
    });
  });
```

**Critical Details**:
1. **One resume call**: Use `hasError` flag to prevent multiple resume attempts
2. **Error first**: Check error parameter before processing data
3. **End detection**: Callback with `null` quad signals completion
4. **Accumulation**: Build result across multiple callback invocations

**Evidence**:
- RDF Serializer: N3.Parser wrapping (~40 lines, works correctly)
- RDF Serializer: N3.Writer wrapping (~35 lines, works correctly)
- 38 tests covering edge cases (malformed input, empty data, named graphs)

**Common Pitfalls**:
```typescript
// WRONG - Multiple resume calls possible
Effect.async((resume) => {
  parser.parse(input, (error, quad) => {
    if (error) resume(Effect.fail(error)); // Called once
    if (quad) accumulate(quad);
    else resume(Effect.succeed(result));   // Called again! Error!
  });
});
```

**Application to Upcoming Specs**:
- **Workflow Durability**: @effect/workflow may expose callback-based persistence APIs
- **Entity Resolution v2**: Bloom filter libraries may use callbacks for bulk operations

---

### 6. Performance Benchmarking with live() Helper

**Pattern**: Use `@beep/testkit`'s `live()` for real clock access in benchmarks

**Context**: RDF foundation needed performance validation without TestClock interference.

**Correct Pattern**:
```typescript
import { live } from "@beep/testkit";

live()("batch add 1000 quads", () =>
  Effect.gen(function* () {
    const start = yield* Effect.clockWith((c) => c.currentTimeMillis);

    // Perform operation
    yield* rdfBuilder.batch(quads);

    const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const elapsed = end - start;

    // Assert performance threshold
    assert(elapsed < 100, `Expected <100ms, got ${elapsed}ms`);
  }).pipe(Effect.provide(TestLayer))
);
```

**Why NOT TestClock**:
- TestClock makes time controllable but defeats benchmarking purpose
- `live()` provides real Clock service for accurate timing
- Still benefits from @beep/testkit's Effect runner

**Evidence**:
- RDF foundation: 10 performance tests using `live()`
- Results exceeded targets: 1000 quads in 13ms (target: 100ms)
- Baseline documented for regression detection

**Common Mistake**:
```typescript
// WRONG - Using TestClock for benchmarks
effect("benchmark", () =>
  Effect.gen(function* () {
    const start = yield* TestClock.currentTimeMillis;
    yield* operation;
    const end = yield* TestClock.currentTimeMillis;
    // Time is fake! Not a real benchmark!
  })
);
```

**Application to Upcoming Specs**:
- **Workflow Durability**: Benchmark activity checkpoint overhead (<10% of operation time)
- **Entity Resolution v2**: Benchmark candidate search (<100ms), incremental clustering (<5s)

---

### 7. Fluent Builder Pattern with Closure Context

**Pattern Discovered**: `fluent-builder-with-closure-context` (confidence: 5/5)

**Context**: RdfBuilder needed type-safe chaining without class boilerplate.

**Implementation**:
```typescript
// Context interfaces document available operations at each stage
interface SubjectContext {
  subject: IRI;
  predicate: (p: IRI) => PredicateContext;
}

interface PredicateContext {
  subject: IRI;
  predicate: IRI;
  literal: (value: string) => QuadContext;
  object: (obj: IRI) => QuadContext;
}

interface QuadContext {
  quad: Quad;
  add: () => Effect.Effect<void, RdfStoreError>;
  build: () => Quad;
  predicate: (p: IRI) => PredicateContext; // Chain another quad
}

// Builder returns closures over accumulated context
export const subject = (s: IRI): SubjectContext => ({
  subject: s,
  predicate: (p: IRI) => {
    // Closure captures s
    return {
      subject: s,
      predicate: p,
      literal: (value: string) => {
        // Closure captures s, p
        const quad = { subject: s, predicate: p, object: Literal(value) };
        return {
          quad,
          add: () => store.add(quad),
          build: () => quad,
          predicate: (nextP: IRI) => /* chain */
        };
      }
    };
  }
});
```

**Benefits**:
- Type-safe chaining: compiler enforces correct order
- No class inheritance complexity
- Clear intermediate types for documentation
- Closure-based state avoids mutable fields

**Evidence**:
- RdfBuilder: 16 unit tests, all passing
- Used in integration tests for graph construction
- Clean, readable test code: `yield* builder.subject(s).predicate(p).literal(v).add()`

**Application to Upcoming Specs**:
- **Workflow Durability**: Activity builder for workflow definitions
- **Entity Resolution v2**: Query builder for entity search criteria (if needed)

---

## Pattern Library: Successful Patterns to Reuse

### Pattern 1: Test Layer with Shared Mutable Dependency

**Name**: `test-layer-shared-dependency-pattern`

**Use Case**: Multiple services depend on same mutable store (RdfStore, database)

**Implementation**:
```typescript
// Create service layers that share dependency
const ServiceALayer = Layer.effect(ServiceA, Effect.gen(function* () {
  const store = yield* RdfStore;
  return { /* A implementation using store */ };
}));

const ServiceBLayer = Layer.effect(ServiceB, Effect.gen(function* () {
  const store = yield* RdfStore;
  return { /* B implementation using store */ };
}));

// Merge services, then provide shared dependency
const TestLayer = Layer.provideMerge(
  Layer.merge(ServiceALayer, ServiceBLayer),
  RdfStore.Default
);

// Test can now populate store and query via services
layer(TestLayer)("suite", (it) => {
  it.effect("test", () =>
    Effect.gen(function* () {
      const store = yield* RdfStore;
      const serviceA = yield* ServiceA;

      yield* store.add(testData);
      const result = yield* serviceA.query();
      // Assertions...
    })
  );
});
```

**Applicability**: Workflow persistence tests, entity registry tests

---

### Pattern 2: Domain Type Conversion at Service Boundary

**Name**: `library-type-conversion-layer`

**Use Case**: Wrapping external library with domain-specific types

**Implementation**:
```typescript
// 1. Define domain types (library-agnostic)
export type DomainQuad = { subject: IRI, predicate: IRI, object: Term };

// 2. Create conversion functions at service boundary
const toN3Quad = (domainQuad: DomainQuad): N3.Quad => {
  return N3.DataFactory.quad(
    toN3Term(domainQuad.subject),
    toN3Term(domainQuad.predicate),
    toN3Term(domainQuad.object)
  );
};

const fromN3Quad = (n3Quad: N3.Quad): DomainQuad => {
  return {
    subject: fromN3Term(n3Quad.subject),
    predicate: fromN3Term(n3Quad.predicate),
    object: fromN3Term(n3Quad.object)
  };
};

// 3. Service uses conversions at boundaries
export class RdfStoreService extends Effect.Service<RdfStoreService>()(
  "RdfStoreService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const store = new N3.Store();
      return {
        add: (quad: DomainQuad) =>
          Effect.sync(() => {
            store.add(toN3Quad(quad));
          }),
        match: (pattern: QuadPattern) =>
          Effect.sync(() => {
            const n3Quads = store.getQuads(/* converted pattern */);
            return A.map(n3Quads, fromN3Quad);
          })
      };
    })
  }
) {}
```

**Benefits**:
- Library types never leak into domain layer
- Future library migration changes only conversion functions
- Clear API surface for consumers

**Applicability**: All external library integrations

---

### Pattern 3: Nested Loop Join with Effect.reduce

**Name**: `nested-loop-join-pattern`

**Use Case**: Joining solution sets across multiple patterns (SPARQL, graph queries)

**Implementation**:
```typescript
// Join solutions across triple patterns
const joinPatterns = (
  triples: ReadonlyArray<TriplePattern>,
  store: RdfStore
): Effect.Effect<ReadonlyArray<Solution>> =>
  Effect.reduce(
    triples,
    [{}] as ReadonlyArray<Solution>, // Start with empty solution
    (solutions, triple) =>
      Effect.flatMap(
        Effect.forEach(solutions, (solution) =>
          joinSolutionWithTriple(solution, triple, store)
        ),
        (nestedSolutions) => Effect.succeed(A.flatten(nestedSolutions))
      )
  );

const joinSolutionWithTriple = (
  solution: Solution,
  triple: TriplePattern,
  store: RdfStore
): Effect.Effect<ReadonlyArray<Solution>> =>
  Effect.gen(function* () {
    // Convert variables in triple using current bindings
    const pattern = substituteVariables(triple, solution);

    // Match against store
    const quads = yield* store.match(pattern);

    // Extend solution with new bindings
    return A.map(quads, (quad) => extendSolution(solution, triple, quad));
  });
```

**Complexity**: O(n²) acceptable for <100K triples, documented for future optimization

**Evidence**: SPARQL service uses this for BGP execution

**Applicability**: Entity resolution candidate matching, workflow dependency resolution

---

### Pattern 4: Type Guards for Union Type Safety

**Name**: `sparqljs-type-guard-pattern`

**Use Case**: Safely handling library types with union types (TypeScript discriminated unions)

**Implementation**:
```typescript
// Library returns union: Variable[] | [Wildcard]
const extractVariables = (query: SelectQuery): ReadonlyArray<string> => {
  if (isWildcard(query.variables)) {
    return []; // Wildcard expansion deferred
  }

  return A.filterMap(query.variables, (v) => {
    if (isVariableTerm(v)) return O.some(v.value);
    if (isVariableExpression(v) && v.variable) return O.some(v.variable.value);
    return O.none();
  });
};

// Type guards for safe narrowing
const isWildcard = (vars: Variable[] | [Wildcard]): vars is [Wildcard] =>
  A.length(vars) === 1 && vars[0] === "*";

const isVariableTerm = (v: unknown): v is { termType: "Variable", value: string } =>
  typeof v === "object" && v !== null && "termType" in v && v.termType === "Variable";
```

**Benefits**:
- Compile-time type safety
- No runtime type assertions
- Clear failure modes for unexpected types

**Applicability**: Any library with complex union types

---

### Pattern 5: Handoff Document Structure (4-Tier Memory)

**Name**: `mandatory-handoff-gate`

**Use Case**: Multi-session specs requiring context preservation

**Structure**:
```markdown
# HANDOFF_P2.md

## Tier 1: Critical Context (Working Memory)
- Current phase goal
- Blocking issues
- Immediate next steps (ready to execute)

## Tier 2: Execution Checklist (Episodic Memory)
- [ ] Task 1 with verification command
- [ ] Task 2 with acceptance criteria
- [ ] Handoff creation (REQUIRED gate)

## Tier 3: Technical Details (Semantic Memory)
- File locations and API signatures
- Error handling patterns
- Service composition examples

## Tier 4: Historical Context (Long-term Memory)
- Phase 1 learnings
- Pattern decisions and rationale
- Deferred items
```

**Benefits**:
- Prevents context loss between sessions
- Provides copy-paste starting points
- Documents decisions for future reference

**Evidence**:
- RDF foundation: 3 handoff documents (P1, P2, P3) enabled clean phase transitions
- SPARQL: Handoff documents preserved pre-implementation corrections
- GraphRAG: 4-tier structure prevented information loss during legal review

**Requirement**: Every phase completion MUST create handoff for next phase

**Applicability**: All multi-phase specs (High/XL complexity)

---

## Anti-Patterns: Approaches to Avoid

### Anti-Pattern 1: Using Native Array/String Methods

**Problem**: Codebase convention requires Effect utilities, not native methods

**Wrong**:
```typescript
const names = entities.map(e => e.name);
const sorted = names.sort();
const filtered = sorted.filter(n => n.length > 0);
```

**Correct**:
```typescript
import * as A from "effect/Array";
import * as Str from "effect/String";

const names = A.map(entities, e => e.name);
const sorted = A.sort(names, Order.string);
const filtered = A.filter(sorted, n => Str.length(n) > 0);
```

**Evidence**: All completed specs follow this pattern consistently

**Enforcement**: Lint rules catch native methods, remediation required

---

### Anti-Pattern 2: Plain String for Entity IDs

**Problem**: Loses type safety, allows invalid ID mixing

**Wrong**:
```typescript
export class Entity extends M.Class<Entity>("Entity")({
  id: S.String,  // Missing branded EntityId!
  userId: S.String,
}) {}
```

**Correct**:
```typescript
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Entity extends M.Class<Entity>("Entity")({
  id: KnowledgeEntityIds.EntityId,
  userId: SharedEntityIds.UserId,
}) {}

// Table columns also need .$type<>() annotation
export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),
});
```

**Evidence**: GraphRAG spec identified EntityId alignment issues during legal review

**Impact**: Without `.$type<>()`, type-unsafe joins compile but fail at runtime

---

### Anti-Pattern 3: Effect.fail() with Yieldable Errors

**Problem**: Redundant wrapping, triggers linter warnings

**Wrong**:
```typescript
if (invalid) {
  return yield* Effect.fail(new ValidationError({ message: "Bad input" }));
}
```

**Correct**:
```typescript
if (invalid) {
  return yield* new ValidationError({ message: "Bad input" });
}
```

**Rationale**: `S.TaggedError` instances are yieldable - direct `yield*` is cleaner

**Evidence**: SPARQL implementation initially used Effect.fail, corrected during review

---

### Anti-Pattern 4: bun:test with Manual Effect.runPromise

**Problem**: Bypasses @beep/testkit infrastructure, loses test services

**Wrong**:
```typescript
import { test } from "bun:test";

test("extracts entities", async () => {
  await Effect.gen(function* () {
    const result = yield* extractor.extract(input);
  }).pipe(Effect.provide(TestLayer), Effect.runPromise);
});
```

**Correct**:
```typescript
import { effect } from "@beep/testkit";

effect("extracts entities", () =>
  Effect.gen(function* () {
    const result = yield* extractor.extract(input);
  }).pipe(Effect.provide(TestLayer))
);
```

**Benefits**:
- Automatic TestClock/TestRandom availability
- Consistent error reporting
- Support for `layer()` runner for shared expensive resources

**Evidence**: All completed specs use @beep/testkit exclusively

---

### Anti-Pattern 5: Premature Service Creation

**Problem**: Making pure functions into services adds unnecessary complexity

**Wrong**:
```typescript
export class StringNormalizer extends Effect.Service<StringNormalizer>()(
  "StringNormalizer",
  {
    accessors: true,
    effect: Effect.succeed({
      normalize: (s: string) => s.toLowerCase().trim()
    })
  }
) {}
```

**Correct**:
```typescript
// Just export the pure function
export const normalize = (s: string): string =>
  Str.toLowerCase(Str.trim(s));
```

**Decision Criteria**: Use services for stateful/I/O operations, helpers for pure logic

**Evidence**: SPARQL uses FilterEvaluator (helper) not FilterService

---

### Anti-Pattern 6: Conditional Property with exactOptionalPropertyTypes

**Problem**: TypeScript's `exactOptionalPropertyTypes` flag rejects `undefined` in optional properties

**Wrong**:
```typescript
const entity: EntityType = {
  id: entityId,
  name: entityName,
  attributes: maybeAttributes // Type error if undefined!
};
```

**Correct**:
```typescript
const entity: EntityType = { id: entityId, name: entityName };
if (maybeAttributes !== undefined) {
  return { ...entity, attributes: maybeAttributes };
}
return entity;
```

**Evidence**: GraphRAG Phase 2 encountered this during context formatting

**Applicability**: All schema/domain type construction

---

## Testing Strategies

### Strategy 1: Test Runner Selection Matrix

| Use Case | Runner | Example |
|----------|--------|---------|
| Standard unit tests | `effect()` | Service method tests |
| Shared expensive resources | `layer()` | Database integration tests |
| Tests needing real time | `live()` | Performance benchmarks |
| Resource cleanup tests | `scoped()` | File handle tests |

**Evidence**: RDF foundation used all 4 runners appropriately

---

### Strategy 2: Mock LanguageModel Pattern

**Context**: @effect/ai services need mocking for deterministic tests

**Pattern**:
```typescript
import { withLanguageModel } from "../_shared/TestLayers";

effect("extracts mentions", () =>
  Effect.gen(function* () {
    const extractor = yield* MentionExtractor;
    const result = yield* extractor.extract(chunk);
    strictEqual(result.length, 2);
  }).pipe(
    Effect.provide(MentionExtractor.Default),
    withLanguageModel({
      generateObject: (objectName) => {
        if (objectName === "MentionOutput") {
          return { mentions: [/* test data */] };
        }
        return {};
      }
    })
  )
);
```

**Evidence**: GraphRAG uses custom `withTextLanguageModel` for text generation

**Applicability**: All LLM-dependent services

---

### Strategy 3: Integration Test Organization

**Best Practice**: Separate unit tests from integration tests

**Structure**:
```
test/
  ServiceA.test.ts           # Unit tests (mocked dependencies)
  ServiceB.test.ts           # Unit tests
  integration.test.ts        # Integration tests (real dependencies)
  benchmark.test.ts          # Performance tests
  _shared/
    TestLayers.ts            # Reusable test utilities
```

**Evidence**: RDF foundation has clear separation: unit (RdfStore, Serializer, Builder) vs integration

---

## Error Handling Lessons

### Lesson 1: Errors Belong in Domain Layer

**Correction from Pre-Implementation Review**:
- **WRONG**: `packages/knowledge/server/src/errors/sparql.errors.ts`
- **CORRECT**: `packages/knowledge/domain/src/errors/sparql.errors.ts`

**Rationale**: Server is implementation, domain is contracts. Errors are part of contract.

**Evidence**: SPARQL spec pre-implementation review corrected this

---

### Lesson 2: Tagged Errors for Library Defects

**Pattern**: Use `S.TaggedError` for unexpected library behavior

```typescript
export class RdfTermConversionError extends S.TaggedError<RdfTermConversionError>()(
  "RdfTermConversionError",
  {
    termType: S.String,
    message: S.String,
  }
) {}

// Usage: library returned unexpected term type
if (term.termType === "Unknown") {
  return yield* new RdfTermConversionError({
    termType: term.termType,
    message: "Unexpected term type from N3.js"
  });
}
```

**Evidence**: RDF foundation uses this for N3 library defects

---

### Lesson 3: Specific Error Types Over Generic

**Pattern**: Create specific error types for different failure modes

**Wrong**:
```typescript
export class SparqlError extends S.TaggedError<SparqlError>()(
  "SparqlError",
  { message: S.String }
) {}
```

**Correct**:
```typescript
export class SparqlParseError extends S.TaggedError<SparqlParseError>()(
  "SparqlParseError",
  { query: S.String, line: S.Number, column: S.Number }
) {}

export class SparqlUnsupportedFeatureError extends S.TaggedError<SparqlUnsupportedFeatureError>()(
  "SparqlUnsupportedFeatureError",
  { feature: S.String, suggestion: S.String }
) {}
```

**Benefits**: Specific errors enable targeted catchTag handling

**Evidence**: SPARQL has 3 distinct error types, each with specific fields

---

## Architecture Decisions That Worked

### Decision 1: Forward-Only Migration (No Backfill)

**Context**: Entity Resolution v2 adds MentionRecord table with provenance fields

**Decision**: Do NOT backfill existing Mention data

**Rationale**:
- Existing data lacks provenance (extractionId, llmResponseHash)
- Synthetic provenance violates data integrity
- Forward-only preserves new extraction audit trails

**Evidence**: Ontology comparison roadmap documented this explicitly

**Applicability**: All additive schema changes

---

### Decision 2: Re-SHACL Validation Pattern

**Context**: SHACL validation traditionally materializes all inferences before checking

**Decision**: Validate shapes directly against source + targeted inference

**Pattern**:
```
Traditional: Source → Full Materialization → Validate → Report
Re-SHACL:   Source → Parse Shapes → Targeted Inference → Validate → Report
```

**Benefits**:
- Memory: O(shapes × focus_nodes) vs O(all_inferences)
- Performance: Only derive facts needed for validation
- Correctness: Same validation outcome as full materialization

**Evidence**: Reasoning Engine spec adopted this from effect-ontology

**Applicability**: Workflow Durability validation checks

---

### Decision 3: Parallel Track Strategy

**Context**: Multiple specs depend on Phase -1 but not each other

**Decision**: Execute Phases 0, 1, 2, 3 in parallel after Phase -1 completes

```
Phase -1 (Foundation)
    |
    +----+----+----+
    |    |    |    |
 Phase 0 |    |    |
 (RDF)   |    |    |
    |    |    |    |
 Phase 1 |    |    |
 (SPARQL)|    |    |
    |    |    |    |
    +--- Phase 2 ---+
    |  (Resolution) |
    |               |
    +--- Phase 3 ---+
      (Workflow)
```

**Benefits**: 3-4 weeks saved through parallelization

**Evidence**: Implementation roadmap documents parallel execution strategy

---

### Decision 4: Custom Executor Over Oxigraph (Phase 1)

**Context**: SPARQL integration could use Oxigraph WASM or custom executor

**Decision**: Phase 1 uses custom executor, Phase 3 migrates to Oxigraph

**Rationale**:
- Learn query optimization patterns before production scale
- Avoid heavyweight dependency early
- Clear migration path via service abstraction

**Evidence**: SPARQL implementation completed with custom executor successfully

**Applicability**: Workflow Durability may start with in-memory persistence, migrate to PostgreSQL

---

## Specific Recommendations for knowledge-workflow-durability

### Recommendation 1: Study effect-ontology Workflow Patterns FIRST

**Action**: Before Phase 1, deep dive into:
- `effect-ontology: Service/WorkflowOrchestrator.ts` - Workflow definition patterns
- `effect-ontology: Runtime/Persistence/PostgresLayer.ts` - Persistence adapter
- `effect-ontology: Domain/Workflow/ExtractionWorkflow.ts` - Activity boundaries

**Rationale**: Completed specs benefited from pre-implementation reference analysis

**Effort**: 1 day research before Phase 1 implementation starts

---

### Recommendation 2: Create Activity Boundary Decision Matrix

**Action**: Before converting ExtractionPipeline, document:

| Current Pipeline Stage | Activity? | Rationale |
|------------------------|-----------|-----------|
| ChunkText | Yes | Expensive, checkpoint after all chunks created |
| ExtractMentions (per-chunk) | Yes | LLM call, checkpoint per chunk for recovery |
| ClassifyEntities (batch) | Yes | LLM call, checkpoint per batch |
| ExtractRelations (per-chunk) | Yes | LLM call, checkpoint per chunk |
| AssembleGraph | Yes | Final stage, checkpoint before completion |

**Rationale**: RDF/SPARQL specs documented architectural decisions early, prevented rework

---

### Recommendation 3: Use Existing ExtractionPipeline.ts as Reference

**File**: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`

**Action**: Extract pure logic into helper functions, wrap in workflow activities

**Pattern**:
```typescript
// Before (monolithic pipeline)
export class ExtractionPipeline {
  execute: (input) => Effect.gen(function* () {
    const chunks = yield* chunkText(input);
    const mentions = yield* extractMentions(chunks);
    const entities = yield* classifyEntities(mentions);
    const relations = yield* extractRelations(chunks);
    return yield* assembleGraph(entities, relations);
  })
}

// After (durable workflow)
export const ExtractionWorkflow = Workflow.make(
  "extraction-workflow",
  (input: ExtractionInput) =>
    Workflow.gen(function* () {
      const chunks = yield* Activity.invoke(ChunkTextActivity, input);
      const mentions = yield* Activity.parallel(
        A.map(chunks, chunk => Activity.invoke(ExtractMentionsActivity, chunk))
      );
      const entities = yield* Activity.invoke(ClassifyEntitiesActivity, mentions);
      const relations = yield* Activity.parallel(
        A.map(chunks, chunk => Activity.invoke(ExtractRelationsActivity, chunk))
      );
      return yield* Activity.invoke(AssembleGraphActivity, { entities, relations });
    })
);
```

**Evidence**: Ontology comparison roadmap explicitly calls out ExtractionPipeline conversion

---

### Recommendation 4: Create Migration Feature Flag

**Action**: Add `useWorkflowExecution` flag to gradually migrate

**Implementation**:
```typescript
export const extract = (input: ExtractionInput) =>
  Effect.gen(function* () {
    const config = yield* ExtractionConfig;

    if (config.useWorkflowExecution) {
      // New path: durable workflow
      return yield* WorkflowClient.start(ExtractionWorkflow, input);
    } else {
      // Old path: transient pipeline
      return yield* ExtractionPipeline.execute(input);
    }
  });
```

**Benefits**:
- Gradual rollout
- A/B testing in production
- Easy rollback if issues discovered

**Evidence**: Ontology comparison roadmap emphasizes backward compatibility

---

### Recommendation 5: SSE Progress Schema Early

**Action**: Define progress event schema in Phase 1, not Phase 3

**Schema**:
```typescript
export class ExtractionProgress extends S.Class<ExtractionProgress>()(
  "ExtractionProgress",
  {
    workflowId: S.String,
    stage: S.Literal(
      "chunking",
      "extracting_mentions",
      "classifying_entities",
      "extracting_relations",
      "assembling_graph",
      "completed",
      "failed"
    ),
    progress: S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)),
    currentItem: S.optional(S.String),
    totalItems: S.optional(S.Number),
    error: S.optional(S.String),
  }
) {}
```

**Rationale**: Early schema definition prevents Phase 3 rework

**Evidence**: GraphRAG defined schemas in Phase 1, avoided Phase 3 refactoring

---

### Recommendation 6: Batch State Machine as Helper Module

**Decision**: State transitions are pure functions, not Effect.Service

**Pattern**:
```typescript
// Helper module (NOT service)
export const transitionBatchState = (
  current: BatchState,
  event: BatchEvent
): BatchState => {
  return Match.value(current).pipe(
    Match.when("queued", () =>
      Match.value(event).pipe(
        Match.when("start", () => "processing" as const),
        Match.orElse(() => current)
      )
    ),
    Match.when("processing", () =>
      Match.value(event).pipe(
        Match.when("complete", () => "completed" as const),
        Match.when("fail", () => "failed" as const),
        Match.orElse(() => current)
      )
    ),
    // ... other states
  );
};
```

**Rationale**: State machine logic is pure, testable without Layer composition

**Evidence**: SPARQL FilterEvaluator is helper module, not service

---

### Recommendation 7: Performance Baseline Early

**Action**: In Phase 1, benchmark workflow overhead before implementing all activities

**Test**:
```typescript
live()("workflow overhead", () =>
  Effect.gen(function* () {
    // Measure direct pipeline
    const startDirect = yield* Effect.clockWith(c => c.currentTimeMillis);
    yield* ExtractionPipeline.execute(testInput);
    const directTime = yield* Effect.clockWith(c => c.currentTimeMillis - startDirect);

    // Measure workflow
    const startWorkflow = yield* Effect.clockWith(c => c.currentTimeMillis);
    yield* WorkflowClient.execute(ExtractionWorkflow, testInput);
    const workflowTime = yield* Effect.clockWith(c => c.currentTimeMillis - startWorkflow);

    const overhead = (workflowTime - directTime) / directTime;
    assert(overhead < 0.1, `Overhead ${overhead * 100}% exceeds 10% target`);
  })
);
```

**Target**: <10% overhead for workflow durability

**Evidence**: RDF foundation established performance baselines early

---

## Specific Recommendations for knowledge-entity-resolution-v2

### Recommendation 1: Two-Tier Architecture is Non-Negotiable

**Pattern**: MentionRecord (immutable) → Entity (mutable cluster)

**Benefit**: Enables re-resolution, audit trail, temporal tracking

**Evidence**: Ontology comparison identified this as P1 gap

**Schema Reminder**:
```typescript
export class MentionRecord extends M.Class<MentionRecord>("MentionRecord")({
  // IMMUTABLE FIELDS (never modified after creation)
  id: KnowledgeEntityIds.MentionRecordId,
  extractionId: KnowledgeEntityIds.ExtractionId,
  rawText: S.String,
  startChar: S.NonNegativeInt,
  endChar: S.NonNegativeInt,
  extractorConfidence: Confidence,
  llmResponseHash: S.String,

  // MUTABLE FIELD (updated by resolution)
  resolvedEntityId: BS.FieldOptionOmittable(KnowledgeEntityIds.EntityId),
}) {}
```

**Critical**: Only `resolvedEntityId` is mutable. Everything else is immutable evidence.

---

### Recommendation 2: EntityRegistry Candidate Search Strategy

**Decision**: Use normalized text + bloom filter + embedding similarity

**Flow**:
```
New MentionRecord
  |
  v
Normalize text (lowercase, trim, remove punctuation)
  |
  v
Check bloom filter (quick negative test)
  |
  +-- Not in filter -> Create new entity
  |
  +-- In filter -> Fetch candidates (text match)
                     |
                     v
                   Rank by embedding similarity
                     |
                     v
                   Threshold check (>0.85 similarity)
                     |
                     +-- Above threshold -> Merge
                     |
                     +-- Below threshold -> Create new entity
```

**Performance Target**: <100ms for <10K entities

**Evidence**: Ontology comparison documented this as proven pattern

---

### Recommendation 3: MergeHistory Service NOT Helper Module

**Decision**: MergeHistory is Effect.Service (needs database I/O)

**Rationale**:
- Writes to `entity_merge_history` table
- Needs transaction context
- Benefits from observability (Effect.withSpan)

**Pattern**:
```typescript
export class MergeHistory extends Effect.Service<MergeHistory>()(
  "MergeHistory",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* Sql.Sql;
      return {
        recordMerge: (params: MergeParams) =>
          Effect.gen(function* () {
            yield* sql`INSERT INTO entity_merge_history ${sql.insert(params)}`;
          }).pipe(Effect.withSpan("MergeHistory.recordMerge")),

        getMergeHistory: (entityId: EntityId) =>
          Effect.gen(function* () {
            return yield* sql`SELECT * FROM entity_merge_history WHERE target_entity_id = ${entityId}`;
          }).pipe(Effect.withSpan("MergeHistory.getMergeHistory"))
      };
    })
  }
) {}
```

**Evidence**: All database-dependent services in completed specs use Effect.Service

---

### Recommendation 4: Forward-Only Migration (No Backfill)

**Decision**: Do NOT backfill existing Mention data to MentionRecord

**Rationale**:
- Existing Mention records lack provenance fields (extractionId, llmResponseHash)
- Synthetic provenance violates data integrity principles
- Forward-only approach preserves audit trail for new extractions

**Migration Strategy**:
```typescript
// New extractions: Create MentionRecord
if (isNewExtraction) {
  yield* MentionRecordRepo.create({
    rawText: mention.text,
    extractionId: extraction.id,
    llmResponseHash: hashResponse(llmOutput),
    // ... other fields
  });
}

// Legacy extractions: Continue using Mention
else {
  yield* MentionRepo.create(mention);
}
```

**Evidence**: Architecture Foundation explicitly documented forward-only approach

---

### Recommendation 5: IncrementalClusterer Performance Critical

**Target**: <5s for 100 new mentions against 10K entity corpus

**Optimization Strategy**:
1. **Bloom filter**: Prune 90% of candidates
2. **Text normalization**: Fast string comparison before embeddings
3. **Batch embedding lookup**: Single database query for all candidates
4. **Parallel processing**: Use `Effect.forEach` with concurrency

**Test Pattern**:
```typescript
live()("incremental clustering", () =>
  Effect.gen(function* () {
    // Setup: 10K existing entities
    yield* EntityRepo.bulkCreate(generateTestEntities(10000));

    const start = yield* Effect.clockWith(c => c.currentTimeMillis);
    const newMentions = generateTestMentions(100);
    yield* IncrementalClusterer.cluster(newMentions);
    const elapsed = yield* Effect.clockWith(c => c.currentTimeMillis - start);

    assert(elapsed < 5000, `Clustering took ${elapsed}ms, target <5000ms`);
  }).pipe(Effect.provide(TestLayer))
);
```

**Evidence**: RDF foundation established performance baselines early, caught regressions

---

### Recommendation 6: Split/Unmerge Service as Separate Phase

**Rationale**: Split/unmerge is P2 (nice-to-have), not P1 (critical)

**Phase Allocation**:
- Phase 1: MentionRecord, EntityRegistry, MergeHistory (P1)
- Phase 2: IncrementalClusterer (P2)
- Phase 3: Split/Unmerge service (P2)

**Benefits**:
- Early value delivery (Phase 1 enables cross-batch resolution)
- Incremental complexity (Phase 2 adds clustering)
- Polish feature (Phase 3 adds conflict resolution)

**Evidence**: Ontology comparison roadmap separates P0/P1 from P2/P3

---

### Recommendation 7: EntityId Branding Verification Command

**Action**: Add verification step to check all EntityIds are branded

**Command**:
```bash
# Check domain models for plain S.String
grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"

# Check table columns for missing .$type<>()
grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
```

**Evidence**: GraphRAG legal review caught EntityId branding issues

**Integration**: Add to Phase 1 completion checklist

---

## Cross-Cutting Recommendations

### Recommendation 1: Pre-Implementation Legal Review Checklist

**Action**: Run pattern validation BEFORE implementation begins

**Checklist**:
- [ ] All services use `Effect.Service` with `accessors: true`
- [ ] All errors in domain layer, not server layer
- [ ] All entity IDs use branded types (no plain `S.String`)
- [ ] All table columns with `_id` suffix have `.$type<>()` annotation
- [ ] RPC definitions include `.prefix()` for namespace isolation
- [ ] All RPC handlers use `.middleware().of({ handlers }).toLayer()` pattern

**Evidence**: Ontology comparison required full remediation after gap analysis

**Benefit**: Catch issues early, avoid rework

---

### Recommendation 2: Handoff Documents as Completion Gate

**Requirement**: Phase N is NOT complete until handoff documents exist:
- `handoffs/HANDOFF_P[N+1].md` - Full context document
- `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` - Copy-paste starting prompt

**Structure**: 4-tier memory model
1. Critical Context (working memory)
2. Execution Checklist (episodic memory)
3. Technical Details (semantic memory)
4. Historical Context (long-term memory)

**Evidence**: All completed multi-phase specs have handoff documents

**Benefit**: Enables clean session transitions, prevents context loss

---

### Recommendation 3: Reflection Log Update Protocol

**Requirement**: Update `REFLECTION_LOG.md` after EVERY phase completion

**Template**:
```markdown
## Phase N: [Name] - [Date]

**What Worked**:
- [Patterns that succeeded]

**What Didn't Work**:
- [Failed approaches]

**Key Learnings**:
1. [Technical insight]
2. [Architectural decision]

**Pattern Candidates**:
- [Reusable patterns discovered]

**Decisions & Rationale**:
1. **Decision Name**: [What was decided]
   - Rationale: [Why]
   - Alternatives considered: [Other options]

**Handoff Notes**:
- [Context for next phase]
```

**Evidence**: All completed specs have detailed reflection logs

**Benefit**: Captures learnings while context is fresh

---

### Recommendation 4: Complexity Calculation Early

**Action**: Run complexity formula BEFORE declaring spec size

**Formula**:
```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) +
             (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
```

**Classification**:
- Low: 1-20 (single-phase, isolated)
- Medium: 21-40 (multi-phase or cross-package)
- High: 41-60 (multi-phase AND cross-package)
- XL: 61+ (architectural changes)

**Evidence**: Multiple specs corrected initial classifications after calculation

**Benefit**: Right-sizes spec structure (High/XL need full scaffolding)

---

### Recommendation 5: Test First, Implement Second

**Pattern**: Write test skeletons before implementation

**Example**:
```typescript
effect.skip("adds quad to store", () =>
  Effect.gen(function* () {
    const store = yield* RdfStore;
    const quad = createTestQuad();

    yield* store.add(quad);
    const result = yield* store.match(patternFor(quad));

    strictEqual(A.length(result), 1);
  }).pipe(Effect.provide(RdfStore.Default))
);

// Implement RdfStore to make test pass
// Remove .skip once implementation works
```

**Benefits**:
- Clear acceptance criteria
- Test coverage from day one
- Prevents over-engineering

**Evidence**: RDF foundation wrote 38 tests before implementing RdfStore

---

## Success Metrics from Completed Specs

### RDF Foundation (3 phases)
- **Tests**: 179 total (38 RdfStore, 38 Serializer, 16 Builder, 87 others)
- **Performance**: Exceeded targets (13ms vs 100ms target for 1000 quads)
- **Integration**: Clean service composition with Layer.provideMerge
- **Duration**: 3 days (estimated 2-3 weeks, completed faster due to clear spec)

### SPARQL Integration (2 phases)
- **Tests**: 73 total (45 parser, 28 service)
- **Feature Coverage**: SELECT, CONSTRUCT, ASK, FILTER, OPTIONAL, UNION
- **Error Handling**: 3 distinct error types with specific fields
- **Type Safety**: Type guards for union types prevented runtime errors

### GraphRAG Plus (2 phases)
- **Schema Reuse**: Leveraged existing `Confidence` schema
- **Citation Validation**: Real SPARQL integration (not mocked)
- **LLM Mocking**: Custom test helpers for text vs object generation
- **Legal Review**: 24 violations remediated (12 MAJOR, 12 MINOR)

### Ontology Comparison (Research)
- **Deliverables**: 4 documents (Matrix, Gap Analysis, Roadmap, Context)
- **Gaps Identified**: 40 capability gaps → 23 actionable work items
- **Priority Distribution**: 6 P0, 9 P1, 5 P2, 3 P3
- **Effort Estimate**: 18-24 weeks total implementation

---

## Conclusion

The completed knowledge specs demonstrate:

1. **Pattern Maturity**: Library conversion layers, Effect.Service composition, Layer.provideMerge for shared dependencies are proven patterns

2. **Testing Rigor**: 250+ tests across specs, performance baselines established, integration tests separate from unit tests

3. **Documentation Discipline**: Handoff documents, reflection logs, and decision rationale preserved for future reference

4. **Type Safety**: EntityId branding, tagged errors, type guards for union types prevent runtime failures

5. **Architectural Clarity**: Service vs helper decision criteria, domain-first error placement, parallel execution strategies

**Recommended Reading Order** for upcoming specs:
1. This document (KNOWLEDGE_LESSONS_LEARNED.md)
2. Target spec README.md
3. Relevant REFLECTION_LOG.md from completed specs
4. Implementation ROADMAP from ontology comparison

**Next Steps**:
- **Workflow Durability**: Apply Activity boundary decisions, SSE schema early, performance baseline
- **Entity Resolution v2**: Two-tier architecture, bloom filter strategy, forward-only migration

The foundation is solid. Execute with discipline, leverage proven patterns, and document learnings.

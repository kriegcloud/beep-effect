# Agent Prompts: Knowledge Reasoning Engine

> Ready-to-use prompts for specialized agents working on RDFS reasoning and SHACL validation services.

---

## Agent Selection Matrix

| Phase | Primary Agent | Secondary Agent | Research Agent |
|-------|---------------|-----------------|----------------|
| **P1: RDFS Reasoner** | Manual (orchestrator) | `test-writer` | `codebase-researcher` |
| **P2: SHACL Validation** | Manual (orchestrator) | `test-writer` | `mcp-researcher` |
| **P3: Optimization** | Manual (orchestrator) | `test-writer` | `architecture-pattern-enforcer` |

### Agent Capabilities Reference

| Agent | Capability | Output |
|-------|------------|--------|
| `codebase-researcher` | read-only | Informs orchestrator, no persistent artifacts |
| `mcp-researcher` | read-only | Effect documentation lookup |
| `test-writer` | write-files | `*.test.ts` files |
| `architecture-pattern-enforcer` | write-reports | `outputs/architecture-review.md` |

---

## Phase 1: RDFS Forward-Chaining Reasoner

### Agent: codebase-researcher (Pre-Phase 1 Research)

```markdown
## Task: Research Knowledge Package Structure for Reasoning Implementation

You are preparing for Phase 1 of the Knowledge Reasoning Engine spec, which implements RDFS forward-chaining inference.

### Mission

Systematically explore the knowledge packages to understand:
1. How RdfStore service is used for triple storage and retrieval
2. Where domain models should be placed (value-objects pattern)
3. Existing service patterns (Context.Tag usage, Layer composition)
4. Test patterns used in @beep/knowledge-server

### Files to Explore

1. `packages/knowledge/server/src/Rdf/RdfStore.ts` (if exists)
   - Interface definition
   - Triple matching methods
   - Layer composition

2. `packages/knowledge/domain/src/value-objects/`
   - Existing value object patterns
   - Schema.Class usage examples
   - Naming conventions

3. `packages/knowledge/server/src/*/` (existing services)
   - Context.Tag service definitions
   - Layer.effect patterns
   - Error handling with TaggedError

4. `packages/knowledge/server/test/` (existing tests)
   - @beep/testkit usage (effect, layer, scoped)
   - Test Layer composition
   - Assertion patterns

### Output Format

Create: `specs/knowledge-reasoning-engine/outputs/codebase-context-reasoning.md`

Structure:
```markdown
# Knowledge Package Structure for Reasoning

## RdfStore Service

[Code snippets showing triple storage/retrieval]

## Domain Model Patterns

[Examples of Schema.Class value objects]

## Service Patterns

[Context.Tag and Layer.effect examples]

## Test Patterns

[testkit usage examples]

## Recommendations

[Specific patterns to follow for reasoning implementation]
```

### Critical Patterns to Document

- Triple matching: `rdfStore.match(subject?, predicate?, object?)`
- Schema.Class with withConstructorDefault
- Layer.effect with yield* dependencies
- effect() and layer() test runners from testkit

### Verification

Output file should answer:
- How to query triples from RdfStore?
- Where to place ReasoningConfig domain model?
- How to create ReasonerService Context.Tag?
- How to compose test Layers?
```

---

### Agent: test-writer (Phase 1 Testing)

```markdown
## Task: Write Unit Tests for RDFS Reasoner

You are implementing tests for Phase 1 of the Knowledge Reasoning Engine spec.

### Mission

Create comprehensive unit tests for RDFS forward-chaining reasoning using @beep/testkit patterns.

### Files to Create

#### 1. packages/knowledge/server/test/Reasoning/RdfsRules.test.ts

Test each RDFS rule individually with known input/output triples.

**Test Cases**:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { rdfs2, rdfs3, rdfs5, rdfs7, rdfs9, rdfs11 } from "../src/Reasoning/RdfsRules.js";

// Test rdfs2: Domain constraint
effect("rdfs2 infers domain type from triple and schema", () =>
  Effect.gen(function* () {
    const triples = [
      { subject: "ex:enrolledIn", predicate: "rdfs:domain", object: "ex:Student" },
      { subject: "ex:alice", predicate: "ex:enrolledIn", object: "ex:CS101" },
    ];

    const result = yield* rdfs2.apply(triples);

    strictEqual(result.length, 1);
    strictEqual(result[0].triple.subject, "ex:alice");
    strictEqual(result[0].triple.predicate, "rdf:type");
    strictEqual(result[0].triple.object, "ex:Student");
    strictEqual(result[0].sources.length, 2);
  })
);

// Test rdfs3: Range constraint
effect("rdfs3 infers range type from triple and schema", () =>
  Effect.gen(function* () {
    const triples = [
      { subject: "ex:enrolledIn", predicate: "rdfs:range", object: "ex:Course" },
      { subject: "ex:alice", predicate: "ex:enrolledIn", object: "ex:CS101" },
    ];

    const result = yield* rdfs3.apply(triples);

    strictEqual(result.length, 1);
    strictEqual(result[0].triple.subject, "ex:CS101");
    strictEqual(result[0].triple.predicate, "rdf:type");
    strictEqual(result[0].triple.object, "ex:Course");
  })
);

// Test rdfs9: Subclass entailment
effect("rdfs9 propagates type through subclass hierarchy", () =>
  Effect.gen(function* () {
    const triples = [
      { subject: "ex:alice", predicate: "rdf:type", object: "ex:Student" },
      { subject: "ex:Student", predicate: "rdfs:subClassOf", object: "ex:Person" },
    ];

    const result = yield* rdfs9.apply(triples);

    strictEqual(result.length, 1);
    strictEqual(result[0].triple.subject, "ex:alice");
    strictEqual(result[0].triple.predicate, "rdf:type");
    strictEqual(result[0].triple.object, "ex:Person");
  })
);

// Similar tests for rdfs5, rdfs7, rdfs11
```

#### 2. packages/knowledge/server/test/Reasoning/ForwardChainer.test.ts

Test forward-chaining algorithm behavior.

**Test Cases**:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { forwardChain } from "../src/Reasoning/ForwardChainer.js";
import { ReasoningConfig } from "@beep/knowledge-domain/value-objects/reasoning";
import { MaxDepthExceededError, MaxInferencesExceededError } from "../src/Reasoning/errors.js";

// Test fixed-point convergence
effect("forward chaining converges to fixed-point", () =>
  Effect.gen(function* () {
    const initialTriples = [
      { subject: "ex:Student", predicate: "rdfs:subClassOf", object: "ex:Person" },
      { subject: "ex:Person", predicate: "rdfs:subClassOf", object: "ex:Agent" },
      { subject: "ex:alice", predicate: "rdf:type", object: "ex:Student" },
    ];

    const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 100 });
    const result = yield* forwardChain(initialTriples, config);

    // Should infer: alice rdf:type Person, alice rdf:type Agent
    strictEqual(A.contains(result.derivedTriples, { subject: "ex:alice", predicate: "rdf:type", object: "ex:Person" }), true);
    strictEqual(A.contains(result.derivedTriples, { subject: "ex:alice", predicate: "rdf:type", object: "ex:Agent" }), true);
    strictEqual(result.stats.iterations < 10, true); // Should converge before max depth
  })
);

// Test depth limit enforcement
effect("forward chaining fails with MaxDepthExceededError when depth limit hit", () =>
  Effect.gen(function* () {
    // Construct pathological graph that won't converge
    const cyclicTriples = [
      { subject: "ex:A", predicate: "rdfs:subClassOf", object: "ex:B" },
      { subject: "ex:B", predicate: "rdfs:subClassOf", object: "ex:A" }, // Cycle!
      { subject: "ex:x", predicate: "rdf:type", object: "ex:A" },
    ];

    const config = new ReasoningConfig({ maxDepth: 5, maxInferences: 1000 });

    const result = yield* forwardChain(cyclicTriples, config).pipe(
      Effect.catchTag("MaxDepthExceededError", (error) =>
        Effect.succeed({ error: error.message })
      )
    );

    strictEqual(result.error.includes("Exceeded max depth: 5"), true);
  })
);

// Test max inferences limit
effect("forward chaining fails with MaxInferencesExceededError when inference limit hit", () =>
  Effect.gen(function* () {
    // Large initial set to trigger inference limit
    const manyTriples = Array.from({ length: 50 }, (_, i) => ({
      subject: `ex:entity${i}`,
      predicate: "rdf:type",
      object: "ex:Class",
    }));

    const config = new ReasoningConfig({ maxDepth: 10, maxInferences: 10 });

    const result = yield* forwardChain(manyTriples, config).pipe(
      Effect.catchTag("MaxInferencesExceededError", (error) =>
        Effect.succeed({ error: error.message })
      )
    );

    strictEqual(result.error.includes("Exceeded max inferences: 10"), true);
  })
);

// Test provenance tracking
effect("forward chaining tracks provenance for inferred triples", () =>
  Effect.gen(function* () {
    const triples = [
      { id: "t1", subject: "ex:alice", predicate: "rdf:type", object: "ex:Student" },
      { id: "t2", subject: "ex:Student", predicate: "rdfs:subClassOf", object: "ex:Person" },
    ];

    const config = new ReasoningConfig();
    const result = yield* forwardChain(triples, config);

    const inferredId = "ex:alice|rdf:type|ex:Person";
    strictEqual(result.provenance[inferredId].ruleId, "rdfs9");
    strictEqual(A.contains(result.provenance[inferredId].sourceTriples, "t1"), true);
    strictEqual(A.contains(result.provenance[inferredId].sourceTriples, "t2"), true);
  })
);
```

#### 3. packages/knowledge/server/test/Reasoning/ReasonerService.test.ts

Integration test with Layer composition.

**Test Cases**:

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ReasonerService, ReasonerServiceLive } from "../src/Reasoning/index.js";
import { RdfStore, RdfStoreLive } from "../src/Rdf/index.js";
import { ReasoningConfig } from "@beep/knowledge-domain/value-objects/reasoning";

const TestLayer = Layer.mergeAll(
  RdfStoreLive, // Assuming RdfStore test implementation exists
  ReasonerServiceLive
);

layer(TestLayer)("ReasonerService integration", (it) => {
  it.effect("infers from triples in RdfStore", () =>
    Effect.gen(function* () {
      const rdfStore = yield* RdfStore;
      const reasoner = yield* ReasonerService;

      // Add sample triples to store
      yield* rdfStore.add([
        { subject: "ex:Student", predicate: "rdfs:subClassOf", object: "ex:Person" },
        { subject: "ex:alice", predicate: "rdf:type", object: "ex:Student" },
      ]);

      // Run inference
      const config = new ReasoningConfig();
      const result = yield* reasoner.infer(config);

      // Should infer: alice rdf:type Person
      strictEqual(result.derivedTriples.length, 1);
      strictEqual(result.derivedTriples[0].subject, "ex:alice");
      strictEqual(result.derivedTriples[0].predicate, "rdf:type");
      strictEqual(result.derivedTriples[0].object, "ex:Person");
    })
  );
});
```

### Critical Patterns

**MANDATORY**:
- Use `effect()` for unit tests
- Use `layer()` for integration tests with TestLayer
- Use `strictEqual()` for assertions (NOT native ===)
- Use `Effect.gen` + `yield*` (NO async/await)
- Use namespace imports: `import * as Effect from "effect/Effect"`
- Use Effect Array helpers: `A.contains`, `A.filter`, `A.map`

**FORBIDDEN**:
- `async/await` in Effect code
- `bun:test` with manual Effect.runPromise
- Native array methods (.map, .filter, .includes)
- Plain Error objects (use TaggedError)

### Verification

After implementation:
```bash
bun run test --filter @beep/knowledge-server
bun run test --coverage --filter @beep/knowledge-server
```

### Success Criteria

- [ ] All tests pass
- [ ] Test coverage ≥80%
- [ ] No async/await in test code
- [ ] All assertions use testkit helpers
```

---

## Phase 2: SHACL Validation Service

### Agent: mcp-researcher (Pre-Phase 2 Research)

```markdown
## Task: Research SHACL Validation Patterns in Effect

You are preparing for Phase 2 of the Knowledge Reasoning Engine spec, which implements SHACL validation with Re-SHACL pattern.

### Mission

Search Effect documentation and patterns for:
1. Parser implementation patterns (ParseResult, Schema.transformOrFail)
2. Validation result structures (how to model violations)
3. Selective computation patterns (compute only what's needed)
4. Error accumulation patterns (collect multiple validation violations)

### Search Topics

#### Topic 1: Effect Parser Patterns

Search for:
- "ParseResult"
- "Schema.transformOrFail"
- "Schema.compose"
- Parser combinator patterns

Expected: Examples of parsing structured formats with Effect Schema

#### Topic 2: Validation Patterns

Search for:
- "validation"
- "Schema.filter"
- "Schema.refine"
- Accumulating errors vs fail-fast

Expected: Patterns for collecting validation violations

#### Topic 3: Selective Computation

Search for:
- "Effect.filterMap"
- "Effect.partition"
- Conditional effect execution

Expected: Patterns for running only necessary computations

#### Topic 4: Error Accumulation

Search for:
- "Effect.validateAll"
- "Effect.all with mode: 'either'"
- Collecting multiple errors

Expected: Patterns for accumulating validation violations without short-circuiting

### Output Format

Create: `specs/knowledge-reasoning-engine/outputs/shacl-research.md`

Structure:
```markdown
# SHACL Validation Patterns in Effect

## Parser Patterns

[Code examples from Effect docs]

## Validation Result Modeling

[Schema structures for ValidationReport]

## Selective Computation

[Patterns for conditional inference]

## Error Accumulation

[Examples of collecting multiple violations]

## Recommendations

[Specific Effect patterns to use for SHACL implementation]
```

### Critical Questions to Answer

1. How to parse SHACL shapes from Turtle format?
2. How to model ValidationReport with multiple violations?
3. How to run targeted inference (only needed rules)?
4. How to accumulate violations without failing on first error?

### Verification

Output file should provide:
- Effect Schema parser example
- ValidationReport schema structure
- Selective computation pattern
- Error accumulation pattern
```

---

### Agent: test-writer (Phase 2 Testing)

```markdown
## Task: Write Tests for SHACL Validation Service

You are implementing tests for Phase 2 of the Knowledge Reasoning Engine spec.

### Mission

Create validation tests for SHACL parser and Re-SHACL validator using @beep/testkit.

### Files to Create

#### 1. packages/knowledge/server/test/Validation/ShaclParser.test.ts

Test parsing SHACL shapes from Turtle format.

**Test Cases**:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { parseShaclShapes } from "../src/Validation/ShaclParser.js";

effect("parses NodeShape with target class", () =>
  Effect.gen(function* () {
    const turtle = `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix ex: <http://example.org/> .

      ex:PersonShape a sh:NodeShape ;
        sh:targetClass ex:Person ;
        sh:property [
          sh:path ex:age ;
          sh:datatype xsd:integer ;
        ] .
    `;

    const shapes = yield* parseShaclShapes(turtle);

    strictEqual(shapes.length, 1);
    strictEqual(shapes[0].targetClass, "ex:Person");
    strictEqual(shapes[0].properties.length, 1);
    strictEqual(shapes[0].properties[0].path, "ex:age");
    strictEqual(shapes[0].properties[0].datatype, "xsd:integer");
  })
);

effect("parses PropertyShape with cardinality constraints", () =>
  Effect.gen(function* () {
    const turtle = `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix ex: <http://example.org/> .

      ex:PersonShape a sh:NodeShape ;
        sh:targetClass ex:Person ;
        sh:property [
          sh:path ex:name ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
        ] .
    `;

    const shapes = yield* parseShaclShapes(turtle);

    strictEqual(shapes[0].properties[0].minCount, 1);
    strictEqual(shapes[0].properties[0].maxCount, 1);
  })
);
```

#### 2. packages/knowledge/server/test/Validation/ReShaclValidator.test.ts

Test Re-SHACL validation logic.

**Test Cases**:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { validateWithReShacl } from "../src/Validation/ReShaclValidator.js";

effect("validates graph conforming to shape", () =>
  Effect.gen(function* () {
    const dataTriples = [
      { subject: "ex:alice", predicate: "rdf:type", object: "ex:Person" },
      { subject: "ex:alice", predicate: "ex:age", object: "30" },
    ];

    const shapes = [
      {
        targetClass: "ex:Person",
        properties: [
          { path: "ex:age", datatype: "xsd:integer" },
        ],
      },
    ];

    const report = yield* validateWithReShacl(dataTriples, shapes);

    strictEqual(report.conforms, true);
    strictEqual(report.violations.length, 0);
  })
);

effect("detects cardinality violation", () =>
  Effect.gen(function* () {
    const dataTriples = [
      { subject: "ex:alice", predicate: "rdf:type", object: "ex:Person" },
      // Missing required ex:name property
    ];

    const shapes = [
      {
        targetClass: "ex:Person",
        properties: [
          { path: "ex:name", minCount: 1 },
        ],
      },
    ];

    const report = yield* validateWithReShacl(dataTriples, shapes);

    strictEqual(report.conforms, false);
    strictEqual(report.violations.length, 1);
    strictEqual(report.violations[0].focusNode, "ex:alice");
    strictEqual(report.violations[0].sourceConstraint, "sh:minCount");
    strictEqual(report.violations[0].message.includes("minCount"), true);
  })
);

effect("detects datatype violation", () =>
  Effect.gen(function* () {
    const dataTriples = [
      { subject: "ex:alice", predicate: "rdf:type", object: "ex:Person" },
      { subject: "ex:alice", predicate: "ex:age", object: "thirty" }, // String, not integer
    ];

    const shapes = [
      {
        targetClass: "ex:Person",
        properties: [
          { path: "ex:age", datatype: "xsd:integer" },
        ],
      },
    ];

    const report = yield* validateWithReShacl(dataTriples, shapes);

    strictEqual(report.conforms, false);
    strictEqual(report.violations[0].sourceConstraint, "sh:datatype");
  })
);
```

#### 3. packages/knowledge/server/test/Validation/ShaclService.test.ts

Integration test with ReasonerService.

**Test Cases**:

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ShaclService, ShaclServiceLive } from "../src/Validation/index.js";
import { ReasonerService, ReasonerServiceLive } from "../src/Reasoning/index.js";
import { RdfStore, RdfStoreLive } from "../src/Rdf/index.js";

const TestLayer = Layer.mergeAll(
  RdfStoreLive,
  ReasonerServiceLive,
  ShaclServiceLive
);

layer(TestLayer)("ShaclService integration", (it) => {
  it.effect("validates data against shapes with inference", () =>
    Effect.gen(function* () {
      const rdfStore = yield* RdfStore;
      const shaclService = yield* ShaclService;

      // Add ontology and data
      yield* rdfStore.add([
        { subject: "ex:Student", predicate: "rdfs:subClassOf", object: "ex:Person" },
        { subject: "ex:alice", predicate: "rdf:type", object: "ex:Student" },
        { subject: "ex:alice", predicate: "ex:age", object: "20" },
      ]);

      // Shape targets ex:Person (alice is a Student, which is a Person)
      const shapeTurtle = `
        @prefix sh: <http://www.w3.org/ns/shacl#> .
        @prefix ex: <http://example.org/> .

        ex:PersonShape a sh:NodeShape ;
          sh:targetClass ex:Person ;
          sh:property [
            sh:path ex:age ;
            sh:datatype xsd:integer ;
          ] .
      `;

      const report = yield* shaclService.validate(shapeTurtle);

      // Should validate alice as Person (via inference) and check age constraint
      strictEqual(report.conforms, true);
    })
  );
});
```

### Critical Patterns

**MANDATORY**:
- Use `effect()` and `layer()` from testkit
- Use `Effect.gen` + `yield*`
- Use namespace imports
- Test both conforming and non-conforming cases
- Test cardinality, datatype, and class constraints

**FORBIDDEN**:
- async/await
- Native array/string methods
- Plain Error objects

### Verification

```bash
bun run test --filter @beep/knowledge-server
bun run test --coverage --filter @beep/knowledge-server
```

### Success Criteria

- [ ] SHACL parser tests pass
- [ ] Re-SHACL validator tests pass
- [ ] Integration tests pass
- [ ] Coverage ≥80%
```

---

## Phase 3: Optimization

### Agent: architecture-pattern-enforcer (Post-Phase 3 Review)

```markdown
## Task: Review Reasoning Engine Architecture

You are reviewing the completed Knowledge Reasoning Engine implementation (Phases 1-3).

### Mission

Validate the reasoning engine against architecture standards:
1. Layer dependency order (domain → server)
2. Service composition patterns (Context.Tag usage)
3. Error handling patterns (TaggedError usage)
4. Test organization (test/ directory mirrors src/)
5. Cross-package imports (only through @beep/* aliases)

### Files to Review

#### Domain Package

- `packages/knowledge/domain/src/value-objects/reasoning/`
  - ReasoningConfig.ts
  - InferenceResult.ts
  - ReasoningProfile.ts

Check:
- [ ] All use Schema.Class
- [ ] No dependencies on server package
- [ ] Proper barrel exports in index.ts

#### Server Package

- `packages/knowledge/server/src/Reasoning/`
  - ReasonerService.ts (Context.Tag)
  - ReasonerServiceLive.ts (Layer)
  - RdfsRules.ts
  - ForwardChainer.ts
  - errors.ts (TaggedErrors)

Check:
- [ ] ReasonerService extends Context.Tag
- [ ] ReasonerServiceLive uses Layer.effect
- [ ] All errors extend Schema.TaggedError
- [ ] No circular dependencies

- `packages/knowledge/server/src/Validation/`
  - ShaclService.ts
  - ShaclServiceLive.ts
  - ShaclParser.ts
  - ReShaclValidator.ts
  - errors.ts

Check:
- [ ] ShaclService depends on ReasonerService via Context.Tag
- [ ] Layer composition follows Effect patterns
- [ ] Validation errors use TaggedError

#### Test Organization

- `packages/knowledge/server/test/Reasoning/`
- `packages/knowledge/server/test/Validation/`

Check:
- [ ] Test structure mirrors src/ structure
- [ ] All tests use @beep/testkit (effect, layer, scoped)
- [ ] No Effect.runPromise with bun:test

### Output Format

Create: `specs/knowledge-reasoning-engine/outputs/architecture-review.md`

Structure:
```markdown
# Architecture Review: Knowledge Reasoning Engine

## Domain Layer

**Status**: PASS/FAIL

[Findings...]

## Service Layer

**Status**: PASS/FAIL

[Findings...]

## Test Organization

**Status**: PASS/FAIL

[Findings...]

## Cross-Package Imports

**Status**: PASS/FAIL

[Findings...]

## Effect Patterns Compliance

**Status**: PASS/FAIL

[Findings...]

## Issues Found

1. [Issue description and location]
2. [Issue description and location]

## Remediation Required

- [ ] [Action item]
- [ ] [Action item]

## Overall Assessment

**Grade**: A/B/C/D/F

[Summary...]
```

### Scoring Rubric

| Criterion | Pass | Fail |
|-----------|------|------|
| Domain models pure (no server deps) | ✓ No server imports | ✗ Server imports found |
| Services use Context.Tag | ✓ All services extend Context.Tag | ✗ Manual dependency passing |
| Layers use Layer.effect | ✓ All Layers follow pattern | ✗ Manual wiring |
| Errors use TaggedError | ✓ All errors extend S.TaggedError | ✗ Plain Error used |
| Tests use testkit | ✓ effect/layer/scoped | ✗ bun:test + runPromise |
| No cross-slice imports | ✓ Only @beep/* aliases | ✗ Relative cross-slice |

### Verification

Output should identify:
- Any architecture violations
- Effect pattern violations
- Test pattern violations
- Remediation steps
```

---

## Common Patterns Across All Agents

### Effect Patterns (MANDATORY)

**Namespace Imports**:
```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
```

**Effect.gen Usage**:
```typescript
const program = Effect.gen(function* () {
  const value = yield* someEffect;
  return value;
});
```

**Layer Composition**:
```typescript
export const ServiceLive = Layer.effect(
  Service,
  Effect.gen(function* () {
    const dependency = yield* Dependency;
    return Service.of({ method: implementation });
  })
);
```

**Tagged Errors**:
```typescript
export class CustomError extends S.TaggedError<CustomError>()(
  "CustomError",
  {
    message: S.String,
    context: S.optional(S.Unknown),
  }
) {}
```

### FORBIDDEN Patterns

- `async/await` in Effect code
- `import { Effect } from "effect"` (default imports)
- `array.map()`, `array.filter()` (native methods)
- `new Error()` (plain errors)
- `Effect.runPromise` in tests (use testkit)

---

## Related Documentation

- [Effect Patterns](../../.claude/rules/effect-patterns.md)
- [Testing Patterns](../../.claude/commands/patterns/effect-testing-patterns.md)
- [Spec Creation Guide](../_guide/README.md)
- [README.md](./README.md) - Full spec
- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Complete workflow

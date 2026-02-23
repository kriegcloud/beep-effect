# Handoff P1: RDFS Forward-Chaining Reasoner

> **Quick Start:** [README.md](../README.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,600 | OK |
| Episodic Memory | 1,000 tokens | ~800 | OK |
| Semantic Memory | 500 tokens | ~400 | OK |
| Procedural Memory | 500 tokens | ~200 | OK |
| **Total** | **4,000 tokens** | **~3,000** | **OK** |

---

## Working Memory (Current Phase)

### Phase 1 Goal

Implement RDFS forward-chaining reasoner to derive implicit facts from explicit triples using RDFS semantics (rdfs:subClassOf, rdfs:subPropertyOf, rdfs:domain, rdfs:range).

### Deliverables

1. **RDFS Rule Definitions** (`@beep/knowledge-server/Reasoning/RdfsRules.ts`):
   - Subclass transitivity (rdfs9, rdfs11)
   - Subproperty transitivity (rdfs5, rdfs7)
   - Domain constraint propagation (rdfs2)
   - Range constraint propagation (rdfs3)

2. **Forward-Chaining Engine** (`@beep/knowledge-server/Reasoning/ForwardChainer.ts`):
   - Rule application loop with fixed-point detection
   - Depth limiting to prevent infinite loops
   - Inference result tracking with provenance

3. **ReasonerService** (`@beep/knowledge-server/Reasoning/ReasonerService.ts`):
   - Context.Tag interface with `infer` method
   - ReasonerServiceLive Layer implementation
   - Integration with RdfStore for triple retrieval

4. **Domain Models** (`@beep/knowledge-domain/value-objects/reasoning/`):
   - `InferenceResult` (derived triples + provenance)
   - `ReasoningProfile` (RDFS | OWL_RL | CUSTOM)
   - `ReasoningConfig` (maxDepth, maxInferences)

### Success Criteria

- [ ] Forward-chaining derives correct RDFS inferences
- [ ] Depth limits prevent infinite loops on cyclic hierarchies
- [ ] Inference provenance tracked (which rule produced which triple)
- [ ] Test coverage ≥80% for reasoning module
- [ ] `bun run check --filter @beep/knowledge-*` passes with 0 errors
- [ ] `bun run test --filter @beep/knowledge-server` passes all tests

### Blocking Issues

None identified. Phase 1 can proceed once RDF foundation (Phase 0) is complete.

### Key Constraints

1. **Depth Limits Required**:
   - Maximum reasoning depth (default: 10 iterations)
   - Maximum inferences (default: 10,000 triples)
   - Fail-fast on limit exceeded with descriptive error

2. **RDFS-Only Semantics**:
   - Phase 1 implements RDFS rules only (no OWL)
   - OWL-RL subset deferred to future phase
   - Keep rule definitions modular for future extension

3. **Provenance Tracking**:
   - Each inferred triple records: (rule ID, source triples)
   - Enables debugging and explanation features
   - Lightweight representation (no full derivation tree)

4. **Effect Patterns**:
   - ALWAYS use namespace imports (`import * as Effect from "effect/Effect"`)
   - Use Context.Tag for ReasonerService interface
   - Use Effect.gen for all async logic
   - Use Schema.TaggedError for domain errors

### Implementation Order

1. Create domain models in `@beep/knowledge-domain/value-objects/reasoning/`
2. Define RDFS rules in `@beep/knowledge-server/Reasoning/RdfsRules.ts`
3. Implement forward-chaining engine with depth limits
4. Create ReasonerService interface and Layer
5. Write unit tests for each RDFS rule
6. Write integration tests with sample ontology
7. Verify with full test suite

---

## Episodic Memory (Previous Context)

### Phase 0 Summary (Dependency)

**Status:** PLANNED (not yet complete)

**Expected Outputs:**
- `RdfStore` service in `@beep/knowledge-server` (triple storage/retrieval)
- N3.js integration for RDF parsing
- Graph traversal utilities
- Triple model (`Triple`, `Quad` schemas)

**Architectural Decisions:**
- RdfStore uses N3.Store internally for in-memory triple storage
- RdfStore.match(subject, predicate, object) returns Effect<Array<Triple>>
- All RDF operations wrapped in Effect for composability

**Known Issues:**
None at this stage. Assuming RdfStore provides necessary triple access methods.

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| Domain models | `packages/knowledge/domain/src/value-objects/reasoning/` |
| RDFS rules | `packages/knowledge/server/src/Reasoning/RdfsRules.ts` |
| Forward-chainer | `packages/knowledge/server/src/Reasoning/ForwardChainer.ts` |
| ReasonerService | `packages/knowledge/server/src/Reasoning/ReasonerService.ts` |
| ReasonerServiceLive | `packages/knowledge/server/src/Reasoning/ReasonerServiceLive.ts` |
| Tests | `packages/knowledge/server/test/Reasoning/` |

### RDFS Rule Reference

| Rule ID | RDFS Semantics | Implementation |
|---------|----------------|----------------|
| rdfs2 | `(?x ?p ?y), (?p rdfs:domain ?c) => (?x rdf:type ?c)` | Domain constraint |
| rdfs3 | `(?x ?p ?y), (?p rdfs:range ?c) => (?y rdf:type ?c)` | Range constraint |
| rdfs5 | `(?p rdfs:subPropertyOf ?q), (?q rdfs:subPropertyOf ?r) => (?p rdfs:subPropertyOf ?r)` | Subproperty transitivity |
| rdfs7 | `(?x ?p ?y), (?p rdfs:subPropertyOf ?q) => (?x ?q ?y)` | Subproperty entailment |
| rdfs9 | `(?x rdf:type ?c), (?c rdfs:subClassOf ?d) => (?x rdf:type ?d)` | Subclass entailment |
| rdfs11 | `(?c rdfs:subClassOf ?d), (?d rdfs:subClassOf ?e) => (?c rdfs:subClassOf ?e)` | Subclass transitivity |

### ReasoningConfig Schema

```typescript
// packages/knowledge/domain/src/value-objects/reasoning/ReasoningConfig.ts
import * as S from "effect/Schema";

export class ReasoningConfig extends S.Class<ReasoningConfig>("ReasoningConfig")(
  {
    maxDepth: S.Number.pipe(S.positive(), S.int()).pipe(
      S.propertySignature,
      S.withConstructorDefault(() => 10)
    ),
    maxInferences: S.Number.pipe(S.positive(), S.int()).pipe(
      S.propertySignature,
      S.withConstructorDefault(() => 10_000)
    ),
    profile: S.Literal("RDFS", "OWL_RL", "CUSTOM").pipe(
      S.propertySignature,
      S.withConstructorDefault(() => "RDFS" as const)
    ),
  }
) {}
```

### InferenceResult Schema

```typescript
// packages/knowledge/domain/src/value-objects/reasoning/InferenceResult.ts
import * as S from "effect/Schema";

export class InferenceResult extends S.Class<InferenceResult>("InferenceResult")(
  {
    derivedTriples: S.Array(Triple),
    provenance: S.Record({
      key: S.String,  // Triple ID
      value: S.Struct({
        ruleId: S.String,
        sourceTriples: S.Array(S.String),  // Source triple IDs
      }),
    }),
    stats: S.Struct({
      iterations: S.Number,
      triplesInferred: S.Number,
      durationMs: S.Number,
    }),
  }
) {}
```

### ReasonerService Interface

```typescript
// packages/knowledge/server/src/Reasoning/ReasonerService.ts
import type { InferenceResult, ReasoningConfig } from "@beep/knowledge-domain";
import type { RdfStore } from "@beep/knowledge-server";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export class ReasonerService extends Context.Tag("ReasonerService")<
  ReasonerService,
  {
    readonly infer: (
      config?: ReasoningConfig
    ) => Effect.Effect<
      InferenceResult,
      ReasoningError | MaxDepthExceededError,
      RdfStore
    >;
  }
>() {}
```

---

## Procedural Memory (Reference Links)

### Effect Patterns (MANDATORY)

- `.claude/rules/effect-patterns.md` - Effect patterns, import conventions, NEVER patterns
- `documentation/patterns/effect-collections.md` - Effect collections migration guide

### RDFS Semantics

- [W3C RDFS Specification](https://www.w3.org/TR/rdf-schema/) - Official RDFS semantics
- [RDFS Entailment Rules](https://www.w3.org/TR/rdf11-mt/#rdfs-entailment) - Complete rule set

### N3.js Integration

- N3.js documentation for Store.match() API
- Existing RdfStore patterns from Phase 0 (once available)

### Testing Patterns

- `tooling/testkit/README.md` - Effect testing with @beep/testkit
- `.claude/commands/patterns/effect-testing-patterns.md` - Comprehensive test patterns

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check domain | `bun run check --filter @beep/knowledge-domain` | No errors |
| Type check server | `bun run check --filter @beep/knowledge-server` | No errors |
| Lint | `bun run lint --filter @beep/knowledge-*` | No errors |
| Tests | `bun run test --filter @beep/knowledge-server` | All pass |
| Coverage | `bun run test --coverage --filter @beep/knowledge-server` | ≥80% |

### RDFS Correctness Verification

| Test Scenario | Input | Expected Output | Pass/Fail |
|---------------|-------|-----------------|-----------|
| Subclass transitivity | `A subClassOf B, B subClassOf C` | `A subClassOf C` | ✓ |
| Subproperty transitivity | `p subPropertyOf q, q subPropertyOf r` | `p subPropertyOf r` | ✓ |
| Domain constraint | `x p y, p domain C` | `x rdf:type C` | ✓ |
| Range constraint | `x p y, p range C` | `y rdf:type C` | ✓ |
| Depth limit | Cyclic hierarchy with maxDepth=3 | MaxDepthExceededError | ✓ |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| RDFS rules correct | Unit tests for each rule (rdfs2, rdfs3, rdfs5, rdfs7, rdfs9, rdfs11) |
| Forward-chaining converges | Fixed-point detection stops when no new inferences |
| Provenance tracked | Each inferred triple has (ruleId, sourceTriples) |
| Depth limit enforced | Test with cyclic hierarchy exceeds maxDepth |
| Performance acceptable | Inference <1s for 10K triples |

---

## Sample Test Data

### Ontology (Turtle)

```turtle
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ex: <http://example.org/> .

ex:Student rdfs:subClassOf ex:Person .
ex:Person rdfs:subClassOf ex:Agent .

ex:enrolledIn rdfs:domain ex:Student .
ex:enrolledIn rdfs:range ex:Course .

ex:teaches rdfs:domain ex:Professor .
ex:teaches rdfs:range ex:Course .

ex:Professor rdfs:subClassOf ex:Person .
```

### Data (Turtle)

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix ex: <http://example.org/> .

ex:alice rdf:type ex:Student .
ex:alice ex:enrolledIn ex:CS101 .

ex:bob ex:teaches ex:CS101 .
```

### Expected Inferences

```turtle
# From alice rdf:type Student + Student subClassOf Person
ex:alice rdf:type ex:Person .

# From alice rdf:type Person + Person subClassOf Agent
ex:alice rdf:type ex:Agent .

# From alice enrolledIn CS101 + enrolledIn range Course
ex:CS101 rdf:type ex:Course .

# From bob teaches CS101 + teaches domain Professor
ex:bob rdf:type ex:Professor .

# From bob rdf:type Professor + Professor subClassOf Person
ex:bob rdf:type ex:Person .

# From bob rdf:type Person + Person subClassOf Agent
ex:bob rdf:type ex:Agent .
```

---

## Handoff to Phase 2

After completing Phase 1:

1. **Update REFLECTION_LOG.md**:
   - Document what worked (rule abstraction, depth limits, etc.)
   - Note any challenges with N3.js integration
   - Capture learnings about forward-chaining performance

2. **Create outputs/phase1-reasoning.md**:
   - Document final reasoning module structure
   - List all RDFS rules implemented
   - Include performance benchmark results

3. **Proceed to Phase 2: SHACL Validation**:
   - Implement SHACL parser for shape constraints
   - Implement Re-SHACL validator (selective materialization)
   - Create ValidationReport model

4. **Blocking Check**:
   - Phase 2 requires Phase 1 ReasonerService to be functional
   - All verification commands MUST pass before proceeding
   - Test coverage MUST be ≥80%

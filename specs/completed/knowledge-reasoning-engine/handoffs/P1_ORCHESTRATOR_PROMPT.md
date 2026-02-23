# Phase 1 Orchestrator: RDFS Forward-Chaining Reasoner

> **Copy-paste this into a fresh Claude session to execute Phase 1**

---

## Context

You are working in the `beep-effect` monorepo, implementing the knowledge graph reasoning engine. This phase implements RDFS forward-chaining inference to derive implicit facts from explicit triples using RDFS semantics.

**Current State**: The RDF foundation (Phase 0) provides `RdfStore` service for triple storage and retrieval.

**Phase 1 Goal**: Implement RDFS reasoner with forward-chaining algorithm, depth limits, and provenance tracking.

---

## Objective

Implement RDFS forward-chaining reasoner in `@beep/knowledge-server` with domain models in `@beep/knowledge-domain`.

### Package Structure

```
packages/knowledge/
├── domain/src/value-objects/reasoning/
│   ├── index.ts
│   ├── InferenceResult.ts
│   ├── ReasoningConfig.ts
│   └── ReasoningProfile.ts
└── server/src/Reasoning/
    ├── index.ts
    ├── ReasonerService.ts
    ├── ReasonerServiceLive.ts
    ├── ForwardChainer.ts
    ├── RdfsRules.ts
    └── errors.ts
```

---

## Key Code Patterns

### 1. RDFS Rule Definitions

```typescript
// packages/knowledge/server/src/Reasoning/RdfsRules.ts
import type { Triple } from "@beep/knowledge-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export interface RdfsRule {
  readonly id: string;
  readonly description: string;
  readonly apply: (
    triples: ReadonlyArray<Triple>
  ) => Effect.Effect<ReadonlyArray<{ triple: Triple; sources: ReadonlyArray<string> }>>;
}

// RDFS2: Domain constraint
// (?x ?p ?y), (?p rdfs:domain ?c) => (?x rdf:type ?c)
export const rdfs2: RdfsRule = {
  id: "rdfs2",
  description: "Domain constraint propagation",
  apply: (triples) =>
    Effect.gen(function* () {
      const domainTriples = F.pipe(
        triples,
        A.filter((t) => t.predicate === "rdfs:domain")
      );
      const dataTriples = F.pipe(
        triples,
        A.filter((t) => t.predicate !== "rdfs:domain" && t.predicate !== "rdfs:range")
      );

      const inferences: Array<{ triple: Triple; sources: ReadonlyArray<string> }> = [];

      for (const domainTriple of domainTriples) {
        const predicate = domainTriple.subject;
        const domainClass = domainTriple.object;

        for (const dataTriple of dataTriples) {
          if (dataTriple.predicate === predicate) {
            inferences.push({
              triple: {
                subject: dataTriple.subject,
                predicate: "rdf:type",
                object: domainClass,
              },
              sources: [dataTriple.id, domainTriple.id],
            });
          }
        }
      }

      return inferences;
    }),
};

// RDFS3: Range constraint
// (?x ?p ?y), (?p rdfs:range ?c) => (?y rdf:type ?c)
export const rdfs3: RdfsRule = {
  id: "rdfs3",
  description: "Range constraint propagation",
  apply: (triples) =>
    Effect.gen(function* () {
      const rangeTriples = F.pipe(
        triples,
        A.filter((t) => t.predicate === "rdfs:range")
      );
      const dataTriples = F.pipe(
        triples,
        A.filter((t) => t.predicate !== "rdfs:domain" && t.predicate !== "rdfs:range")
      );

      const inferences: Array<{ triple: Triple; sources: ReadonlyArray<string> }> = [];

      for (const rangeTriple of rangeTriples) {
        const predicate = rangeTriple.subject;
        const rangeClass = rangeTriple.object;

        for (const dataTriple of dataTriples) {
          if (dataTriple.predicate === predicate) {
            inferences.push({
              triple: {
                subject: dataTriple.object,
                predicate: "rdf:type",
                object: rangeClass,
              },
              sources: [dataTriple.id, rangeTriple.id],
            });
          }
        }
      }

      return inferences;
    }),
};

// Export all RDFS rules
export const rdfsRules: ReadonlyArray<RdfsRule> = [
  rdfs2,
  rdfs3,
  // rdfs5, rdfs7, rdfs9, rdfs11 to be implemented
];
```

### 2. Forward-Chaining Engine

```typescript
// packages/knowledge/server/src/Reasoning/ForwardChainer.ts
import type { InferenceResult, ReasoningConfig, Triple } from "@beep/knowledge-domain";
import { MaxDepthExceededError, MaxInferencesExceededError } from "./errors.js";
import { rdfsRules } from "./RdfsRules.js";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
import * as DateTime from "effect/DateTime";

export const forwardChain = (
  initialTriples: ReadonlyArray<Triple>,
  config: ReasoningConfig
): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
  Effect.gen(function* () {
    const startTime = yield* DateTime.now;
    const knownTriples = MutableHashSet.fromIterable(initialTriples);
    const provenance = new Map<string, { ruleId: string; sourceTriples: ReadonlyArray<string> }>();
    let iterations = 0;

    while (iterations < config.maxDepth) {
      iterations++;
      const currentSize = MutableHashSet.size(knownTriples);

      // Apply all RDFS rules
      for (const rule of rdfsRules) {
        const inferences = yield* rule.apply(A.fromIterable(knownTriples));

        for (const { triple, sources } of inferences) {
          const tripleId = `${triple.subject}|${triple.predicate}|${triple.object}`;

          if (!MutableHashSet.has(knownTriples, triple)) {
            if (MutableHashSet.size(knownTriples) >= config.maxInferences) {
              return yield* Effect.fail(
                new MaxInferencesExceededError({
                  message: `Exceeded max inferences: ${config.maxInferences}`,
                  limit: config.maxInferences,
                })
              );
            }

            MutableHashSet.add(knownTriples, triple);
            provenance.set(tripleId, { ruleId: rule.id, sourceTriples: sources });
          }
        }
      }

      // Fixed-point detection: no new triples added
      if (MutableHashSet.size(knownTriples) === currentSize) {
        break;
      }
    }

    if (iterations >= config.maxDepth) {
      return yield* Effect.fail(
        new MaxDepthExceededError({
          message: `Exceeded max depth: ${config.maxDepth}`,
          limit: config.maxDepth,
        })
      );
    }

    const endTime = yield* DateTime.now;
    const durationMs = DateTime.toMillis(endTime) - DateTime.toMillis(startTime);

    const derivedTriples = F.pipe(
      A.fromIterable(knownTriples),
      A.filter((t) => !A.contains(initialTriples, t))
    );

    return {
      derivedTriples,
      provenance: Object.fromEntries(provenance),
      stats: {
        iterations,
        triplesInferred: A.length(derivedTriples),
        durationMs,
      },
    };
  });
```

### 3. ReasonerService Interface

```typescript
// packages/knowledge/server/src/Reasoning/ReasonerService.ts
import type { InferenceResult, ReasoningConfig } from "@beep/knowledge-domain";
import type { MaxDepthExceededError, MaxInferencesExceededError } from "./errors.js";
import type { RdfStore } from "../Rdf/RdfStore.js";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export class ReasonerService extends Context.Tag("ReasonerService")<
  ReasonerService,
  {
    readonly infer: (
      config?: ReasoningConfig
    ) => Effect.Effect<
      InferenceResult,
      MaxDepthExceededError | MaxInferencesExceededError,
      RdfStore
    >;
  }
>() {}
```

### 4. ReasonerService Layer

```typescript
// packages/knowledge/server/src/Reasoning/ReasonerServiceLive.ts
import { ReasoningConfig } from "@beep/knowledge-domain";
import { RdfStore } from "../Rdf/RdfStore.js";
import { forwardChain } from "./ForwardChainer.js";
import { ReasonerService } from "./ReasonerService.js";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const ReasonerServiceLive = Layer.effect(
  ReasonerService,
  Effect.gen(function* () {
    const rdfStore = yield* RdfStore;

    return ReasonerService.of({
      infer: (config = new ReasoningConfig()) =>
        Effect.gen(function* () {
          // Get all triples from RdfStore
          const triples = yield* rdfStore.match(undefined, undefined, undefined);

          // Run forward-chaining inference
          const result = yield* forwardChain(triples, config);

          return result;
        }),
    });
  })
);
```

### 5. Domain Models

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

```typescript
// packages/knowledge/domain/src/value-objects/reasoning/InferenceResult.ts
import { Triple } from "../Triple.js";
import * as S from "effect/Schema";

export class InferenceResult extends S.Class<InferenceResult>("InferenceResult")(
  {
    derivedTriples: S.Array(Triple),
    provenance: S.Record({
      key: S.String,
      value: S.Struct({
        ruleId: S.String,
        sourceTriples: S.Array(S.String),
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

### 6. Tagged Errors

```typescript
// packages/knowledge/server/src/Reasoning/errors.ts
import * as S from "effect/Schema";

export class MaxDepthExceededError extends S.TaggedError<MaxDepthExceededError>()(
  "MaxDepthExceededError",
  {
    message: S.String,
    limit: S.Number,
  }
) {}

export class MaxInferencesExceededError extends S.TaggedError<MaxInferencesExceededError>()(
  "MaxInferencesExceededError",
  {
    message: S.String,
    limit: S.Number,
  }
) {}
```

---

## Step-by-Step Execution Plan

### Step 1: Create Domain Models
1. Create `packages/knowledge/domain/src/value-objects/reasoning/` directory
2. Write `ReasoningConfig.ts` with schema
3. Write `InferenceResult.ts` with schema
4. Create `index.ts` barrel export
5. Verify: `bun run check --filter @beep/knowledge-domain`

### Step 2: Create RDFS Rules
1. Create `packages/knowledge/server/src/Reasoning/` directory
2. Write `RdfsRules.ts` with rdfs2, rdfs3 rules
3. Implement rdfs5 (subproperty transitivity)
4. Implement rdfs7 (subproperty entailment)
5. Implement rdfs9 (subclass entailment)
6. Implement rdfs11 (subclass transitivity)
7. Verify: `bun run check --filter @beep/knowledge-server`

### Step 3: Implement Forward-Chaining Engine
1. Write `ForwardChainer.ts` with fixed-point detection
2. Add depth limit enforcement
3. Add max inferences limit
4. Add provenance tracking
5. Verify: `bun run check --filter @beep/knowledge-server`

### Step 4: Create ReasonerService
1. Write `ReasonerService.ts` Context.Tag interface
2. Write `ReasonerServiceLive.ts` Layer implementation
3. Write `errors.ts` with tagged errors
4. Create `index.ts` barrel export
5. Verify: `bun run check --filter @beep/knowledge-server`

### Step 5: Write Unit Tests
1. Create `packages/knowledge/server/test/Reasoning/` directory
2. Write `RdfsRules.test.ts` for each rule
3. Write `ForwardChainer.test.ts` for depth/inference limits
4. Write `ReasonerService.test.ts` for integration tests
5. Verify: `bun run test --filter @beep/knowledge-server`

### Step 6: Performance Benchmarks
1. Create benchmark with 10K triples
2. Measure inference time (<1s target)
3. Document results in `outputs/phase1-reasoning.md`

### Step 7: Final Verification
```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run test --coverage --filter @beep/knowledge-server
```

---

## Success Criteria

- [ ] All RDFS rules (rdfs2, rdfs3, rdfs5, rdfs7, rdfs9, rdfs11) implemented
- [ ] Forward-chaining converges to fixed-point
- [ ] Depth limit prevents infinite loops
- [ ] Max inferences limit enforced
- [ ] Provenance tracked for each inferred triple
- [ ] Test coverage ≥80%
- [ ] All verification commands pass
- [ ] Performance: <1s for 10K triples

---

## Sample Test Data

### Ontology

```turtle
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ex: <http://example.org/> .

ex:Student rdfs:subClassOf ex:Person .
ex:Person rdfs:subClassOf ex:Agent .

ex:enrolledIn rdfs:domain ex:Student .
ex:enrolledIn rdfs:range ex:Course .
```

### Data

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix ex: <http://example.org/> .

ex:alice rdf:type ex:Student .
ex:alice ex:enrolledIn ex:CS101 .
```

### Expected Inferences

```typescript
const expectedInferences = [
  { subject: "ex:alice", predicate: "rdf:type", object: "ex:Person" },  // rdfs9
  { subject: "ex:alice", predicate: "rdf:type", object: "ex:Agent" },   // rdfs9 transitivity
  { subject: "ex:CS101", predicate: "rdf:type", object: "ex:Course" },  // rdfs3
];
```

---

## Critical Rules (from CLAUDE.md)

### Effect Patterns (MANDATORY)
- ALWAYS use namespace imports: `import * as Effect from "effect/Effect"`
- ALWAYS use PascalCase Schema constructors: `S.String`, `S.Struct`, `S.Array`
- ALWAYS use Effect utilities instead of native methods:
  - `A.map(array, fn)` NOT `array.map(fn)`
  - `A.filter(array, pred)` NOT `array.filter(pred)`

### Error Handling
- ALWAYS use `S.TaggedError` for domain errors
- NEVER use `new Error()` or `throw` statements

### Testing
- ALWAYS use `@beep/testkit` (`effect`, `layer`, `strictEqual`)
- NEVER use raw `bun:test` with `Effect.runPromise`

---

## Reference Files

- `.claude/rules/effect-patterns.md` - Effect patterns (MANDATORY)
- `tooling/testkit/README.md` - Effect testing patterns
- `.claude/commands/patterns/effect-testing-patterns.md` - Comprehensive test patterns
- [W3C RDFS Specification](https://www.w3.org/TR/rdf-schema/) - RDFS semantics

---

## Next Phase Preview

**Phase 2** will:
- Implement SHACL parser for shape constraints
- Implement Re-SHACL validator (selective materialization)
- Create ValidationReport model
- Integrate with ReasonerService

---

## Execution

You are now ready to execute Phase 1. Follow the step-by-step plan above, verifying at each checkpoint.

When complete:
1. Update `specs/knowledge-reasoning-engine/REFLECTION_LOG.md` with learnings
2. Create `specs/knowledge-reasoning-engine/outputs/phase1-reasoning.md` with results
3. Create `specs/knowledge-reasoning-engine/handoffs/HANDOFF_P2.md` for next phase
4. Create `specs/knowledge-reasoning-engine/handoffs/P2_ORCHESTRATOR_PROMPT.md`

**Good luck!**

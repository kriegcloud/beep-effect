# Quick Start: Knowledge Reasoning Engine

> 5-minute triage guide for implementing RDFS reasoning and SHACL validation services.

---

## 5-Minute Triage

### Current State

The reasoning engine is **PLANNED**. This spec implements semantic inference capabilities for the knowledge graph system.

### What Exists

- RDF foundation: `RdfStore` service for triple storage (from Phase 0)
- N3.js integration: Triple parsing and graph traversal
- Ontology service: OWL/RDFS schema retrieval
- Knowledge domain models: Entity, Relation, Ontology, Triple

### What Needs Building

- RDFS forward-chaining reasoner in `@beep/knowledge-server/src/Reasoning/`
- SHACL validation service in `@beep/knowledge-server/src/Validation/`
- Domain models for reasoning in `@beep/knowledge-domain/src/value-objects/reasoning/`
- Inference result caching layer

---

## Critical Context

| Attribute | Value |
|-----------|-------|
| **Complexity** | High (46 points) |
| **Phases** | 3 phases |
| **Sessions** | 6-9 estimated |
| **Success Metric** | RDFS inference completes in <1s for 10K triples |
| **Pattern** | Re-SHACL (selective materialization without full graph expansion) |
| **Cross-Package** | Knowledge only |

---

## Why This Spec

Enable semantic inference over knowledge graphs without expensive full materialization:

- **RDFS Reasoning**: Derive implicit facts (subclass/subproperty entailment, domain/range constraints)
- **SHACL Validation**: Validate graph structure against shape constraints
- **Performance**: Re-SHACL pattern avoids materializing entire inference closure
- **Provenance**: Track which rules derived which triples

---

## Where to Start

### Entry Points

| File | Purpose |
|------|---------|
| `packages/knowledge/domain/src/value-objects/reasoning/` | Domain models (ReasoningConfig, InferenceResult) |
| `packages/knowledge/server/src/Reasoning/` | RDFS reasoner implementation |
| `packages/knowledge/server/src/Validation/` | SHACL validator (Phase 2) |

### Phase Overview

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| **P1** | RDFS Reasoner | Forward-chaining inference with depth limits | Pending |
| **P2** | SHACL Validation | Re-SHACL validator with selective materialization | Pending |
| **P3** | Optimization | Inference caching and N3 rules engine (optional) | Pending |

---

## Quick Decision Tree

```
START
  |
  +-- Does packages/knowledge/server/src/Reasoning/ exist?
  |     +-- NO -> Start Phase 1 (RDFS Reasoner)
  |     +-- YES -> Do RDFS rules work on sample ontology?
  |           +-- NO -> Continue Phase 1
  |           +-- YES -> Does SHACL validation work?
  |                 +-- NO -> Start Phase 2 (SHACL Validation)
  |                 +-- YES -> Check handoffs/HANDOFF_P[N].md
```

---

## Quick Commands

```bash
# Type check knowledge packages
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Run with coverage
bun run test --coverage --filter @beep/knowledge-server

# Lint and fix
bun run lint:fix
```

---

## Key Gotchas

| Gotcha | Impact | Solution |
|--------|--------|----------|
| **Cyclic class hierarchies** | Infinite loop in transitive closure | Enforce `maxDepth` limit (default 10) |
| **Inference explosion** | Memory exhaustion with large graphs | Enforce `maxInferences` limit (default 10,000) |
| **Forward vs backward chaining** | Performance characteristics differ | Use forward-chaining for knowledge graphs (pre-compute all inferences) |
| **N3.js Store interface** | Triple matching patterns vary | Use `store.match(subj?, pred?, obj?)` with null for wildcards |
| **Provenance tracking** | Memory overhead grows with inferences | Store provenance map separately from triple set |

---

## Critical Patterns

### Forward-Chaining Loop

```typescript
import * as Effect from "effect/Effect";
import * as MutableHashSet from "effect/MutableHashSet";
import * as A from "effect/Array";

const forwardChain = (
  initialTriples: ReadonlyArray<Triple>,
  config: ReasoningConfig
): Effect.Effect<InferenceResult> =>
  Effect.gen(function* () {
    const knownTriples = MutableHashSet.fromIterable(initialTriples);
    let iterations = 0;

    while (iterations < config.maxDepth) {
      iterations++;
      const currentSize = MutableHashSet.size(knownTriples);

      // Apply RDFS rules
      for (const rule of rdfsRules) {
        const inferences = yield* rule.apply(A.fromIterable(knownTriples));
        // Add new triples to set
        for (const { triple } of inferences) {
          MutableHashSet.add(knownTriples, triple);
        }
      }

      // Fixed-point: no new triples added
      if (MutableHashSet.size(knownTriples) === currentSize) {
        break;
      }
    }

    return { derivedTriples: A.fromIterable(knownTriples), iterations };
  });
```

### RDFS Rule Pattern

```typescript
import * as F from "effect/Function";
import * as A from "effect/Array";

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
```

---

## Context Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Full spec with architectural decisions |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 context (create after Phase 0) |
| [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | Phase 1 launch prompt |

---

## Starting Phase 1

1. Read the orchestrator prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P1.md`
3. Create domain models: `packages/knowledge/domain/src/value-objects/reasoning/`
4. Implement RDFS rules: `packages/knowledge/server/src/Reasoning/RdfsRules.ts`
5. Build forward-chaining engine: `packages/knowledge/server/src/Reasoning/ForwardChainer.ts`
6. Create ReasonerService Layer: `packages/knowledge/server/src/Reasoning/ReasonerServiceLive.ts`
7. Write unit tests: `packages/knowledge/server/test/Reasoning/`
8. Verify: `bun run check --filter @beep/knowledge-*`
9. Update `REFLECTION_LOG.md`
10. Create handoffs for P2

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Forgetting Effect patterns | Use `Effect.gen` + `yield*`, never async/await |
| Native JS methods | Use `A.map`, `A.filter` from `effect/Array` |
| Plain Error objects | Use `S.TaggedError` for all domain errors |
| Missing depth limits | Always enforce `maxDepth` to prevent infinite loops |
| Skipping provenance | Track rule ID and source triples for each inference |
| Skipping handoffs | Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` |

---

## Need Help?

- Full spec: [README.md](./README.md)
- RDFS semantics: [W3C RDFS Specification](https://www.w3.org/TR/rdf-schema/)
- SHACL specification: [W3C SHACL](https://www.w3.org/TR/shacl/)
- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`

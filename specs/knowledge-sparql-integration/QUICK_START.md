# Quick Start: Knowledge SPARQL Integration

> 5-minute triage guide for implementing SPARQL query capability over the RDF knowledge graph.

---

## 5-Minute Triage

### Current State

The SPARQL integration is **NOT STARTED**. This spec adds semantic query capability to the knowledge graph via SPARQL 1.1 queries.

### What Exists

- RdfStore service (from knowledge-rdf-foundation spec)
- In-memory triple storage with subject-predicate-object indexing
- Entity and Relation domain models
- Knowledge graph extraction pipeline

### What Needs Building

- SPARQL query value objects (SparqlQuery - **SparqlBindings already exists**)
- SPARQL error classes in domain layer
- SPARQL parser wrapping sparqljs library (using Effect.Service pattern)
- SparqlService executing queries against RdfStore
- Result formatting utilities (JSON bindings, RDF graphs)
- Integration tests for E2E query flows

> **NOTE**: RDF foundation is COMPLETE (179 tests). RdfStore API is `match(QuadPattern)` returning `ReadonlyArray<Quad>`.

---

## Critical Context

| Attribute | Value |
|-----------|-------|
| **Complexity** | High (44 points) |
| **Phases** | 3 |
| **Sessions** | 5-6 estimated |
| **Success Metric** | Query knowledge graph using SPARQL patterns |
| **Key Dependency** | RdfStore from knowledge-rdf-foundation |
| **Cross-Package** | Knowledge domain + server |

---

## Phase Overview

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| **P1** | Value Objects & Parser | SPARQL domain models, sparqljs wrapper | Pending |
| **P2** | SPARQL Service | Query executor, variable binding, FILTER evaluation | Pending |
| **P3** | Result Formatting & Testing | JSON bindings, RDF graphs, integration tests | Pending |

---

## Quick Decision Tree

```
START
  |
  +-- Does SparqlQuery value object exist?
  |     +-- NO -> Start Phase 1 (Parser)
  |     +-- YES -> Does SparqlService execute SELECT queries?
  |           +-- NO -> Start Phase 2 (Service)
  |           +-- YES -> Does ResultFormatter output JSON bindings?
  |                 +-- NO -> Start Phase 3 (Formatting)
  |                 +-- YES -> Complete
```

---

## Quick Commands

```bash
# Type check knowledge packages
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint and fix
bun run lint:fix
```

---

## Key Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **SPARQL Parser** | sparqljs | Mature SPARQL 1.1 parser, active maintenance |
| **Query Executor** | Custom over RdfStore | Incremental feature addition, learning opportunity |
| **Result Format** | W3C SPARQL JSON | Standard interchange format, tool compatibility |
| **Phase 3 Migration** | Oxigraph native SPARQL | Production scale, full feature parity |

---

## Sample Queries

```sparql
-- Basic SELECT
SELECT ?entity WHERE { ?entity rdf:type ex:Person }

-- SELECT with FILTER
SELECT ?name WHERE {
  ?person ex:name ?name .
  FILTER(?name = "John Doe")
}

-- CONSTRUCT
CONSTRUCT { ?s ex:mapped ?o }
WHERE { ?s ex:original ?o }

-- ASK
ASK { ?s rdf:type ex:Organization }
```

---

## Critical Patterns

### Effect Service Usage

> **IMPORTANT**: Use Effect.Service with `accessors: true`, NOT Context.Tag.

```typescript
import * as Effect from "effect/Effect";
import { SparqlService } from "@beep/knowledge-server/Sparql";

const program = Effect.gen(function* () {
  // Direct yield* with accessors: true
  const result = yield* SparqlService.executeSelect(parsedQuery);
  return result;
});
```

### Parser Integration

```typescript
import * as Effect from "effect/Effect";
import { SparqlParser } from "@beep/knowledge-server/Sparql";

const program = Effect.gen(function* () {
  // Direct yield* with accessors: true
  const parsedQuery = yield* SparqlParser.parse("SELECT ?s WHERE { ?s ?p ?o }");
  return parsedQuery;
});
```

---

## Success Metrics

### Functional Requirements
- Parse SELECT, CONSTRUCT, ASK queries
- Execute basic graph pattern matching
- Support PREFIX declarations
- Evaluate FILTER expressions (equality, comparison, regex)
- Format results in W3C SPARQL JSON format

### Performance Requirements
- Simple queries (< 10K triples): < 100ms
- Complex queries (< 100K triples): < 200ms

---

## Context Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Full spec with detailed phase breakdown |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Complete workflow and agent delegation |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | Ready-to-use agent prompts |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 context |

---

## Starting Phase 1

1. Read the orchestrator prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P1.md`
3. Install sparqljs: `bun add sparqljs @types/sparqljs -w`
4. Create SparqlQuery value object in `@beep/knowledge-domain`
5. Create SparqlParser wrapper in `@beep/knowledge-server`
6. Write parser unit tests
7. Verify with `bun run check --filter @beep/knowledge-server`
8. Update `REFLECTION_LOG.md`
9. Create handoffs for P2

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Recreating SparqlBindings | **Already exists** in `@beep/knowledge-domain/value-objects/rdf/` |
| Using Context.Tag | Use `Effect.Service` with `accessors: true` |
| Putting errors in server | Errors belong in domain layer (`@beep/knowledge-domain/errors/`) |
| Wrong RdfStore API | Use `store.match(QuadPattern)` NOT `store.query()` |
| Native Date.now() | Use `Effect.clockWith(c => c.currentTimeMillis)` with `live()` |
| Forgetting Effect patterns | Use `Effect.gen` + `yield*`, never async/await |
| Native JS methods | Use `A.map`, `A.filter` from `effect/Array` |
| Plain string IDs | Use branded EntityIds from `@beep/shared-domain` |
| Skipping handoffs | Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` |
| Parser completeness | Accept incremental SPARQL features, defer advanced to Phase 3 |
| Query performance | Benchmark early, design Oxigraph migration path |
| Missing Layer.provideMerge | Share RdfStore between services with `Layer.provideMerge` |

---

## Related Specs

| Spec | Relationship |
|------|-------------|
| `knowledge-rdf-foundation` | **Predecessor** - RdfStore dependency |
| `knowledge-architecture-foundation` | Package allocation patterns |
| `knowledge-reasoning-engine` | Parallel track (both depend on RdfStore) |
| `knowledge-graphrag-plus` | **Successor** - Citation validation needs SPARQL |

---

## Need Help?

- Full spec: [README.md](./README.md)
- RDF foundation spec: `../knowledge-rdf-foundation/`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
- SPARQL 1.1 spec: https://www.w3.org/TR/sparql11-query/

# Phase 1 Handoff: Value Objects and Errors

**Date**: 2026-02-03
**From**: Phase 0 (Spec Scaffolding)
**To**: Phase 1 (Value Objects and Errors Implementation)
**Status**: Ready for implementation
**Estimated tokens**: ~2,500 (under 4K budget)

---

## Phase 0 Summary

Spec structure established with:
- README.md defining goals, non-goals, and 4 implementation phases
- ARCHITECTURE_DECISIONS.md with 6 ADRs
- PACKAGE_ALLOCATION.md with complete component inventory
- IMPLEMENTATION_INSTRUCTIONS.md with detailed step-by-step guide

### Key Learnings Applied

- RPC pattern follows documents slice (`@effect/rpc` with slice-specific contracts)
- Middleware applies BEFORE `.toLayer()` (from ADR-006)
- Handler keys include prefix (e.g., `entity_get`)

---

## Context for Phase 1

### Working Context (current task focus)

**Objective**: Create RDF value objects and tagged error schemas in `@beep/knowledge-domain`

**Success Criteria**:
- [ ] `src/value-objects/rdf/` directory with Quad, QuadPattern, SparqlBindings
- [ ] `src/errors/sparql.errors.ts` with SparqlSyntaxError, SparqlTimeoutError, SparqlExecutionError
- [ ] `src/errors/graphrag.errors.ts` with EmbeddingGenerationError, VectorSearchError, GraphTraversalError
- [ ] `bun run check --filter @beep/knowledge-domain` passes

**Files to Create**:
1. `packages/knowledge/domain/src/value-objects/rdf/Quad.ts`
2. `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts`
3. `packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts`
4. `packages/knowledge/domain/src/value-objects/rdf/index.ts`
5. `packages/knowledge/domain/src/errors/sparql.errors.ts`
6. `packages/knowledge/domain/src/errors/graphrag.errors.ts`

### Episodic Context (prior decisions)

From ARCHITECTURE_DECISIONS.md:
- **ADR-001**: Use `@effect/rpc` with slice-specific contracts
- **ADR-002**: Value objects in domain layer, implementations in server
- **ADR-003**: Strict unidirectional dependency flow (domain -> tables -> server)

### Semantic Context (constants)

**Tech Stack**:
- Effect 3, Effect Schema
- `@beep/schema` (BS) helpers
- `@beep/identity/packages` for $I annotation IDs

**Naming Conventions**:
- Value objects: `*.value.ts` or in subdirectory
- Errors: `*.errors.ts`
- Use `S.Class` for value objects with identity
- Use `S.TaggedError` for typed errors

### Procedural Context (patterns to follow)

- Schema patterns: `.claude/rules/effect-patterns.md`
- Existing value objects: `packages/knowledge/domain/src/value-objects/evidence-span.value.ts`
- Existing errors: `packages/knowledge/domain/src/errors/ontology.errors.ts`

---

## Implementation Order

1. **Quad.ts** - Foundation RDF types (IRI, Literal, Term, Quad)
2. **QuadPattern.ts** - Query pattern with optional wildcards
3. **SparqlBindings.ts** - SPARQL query results
4. **rdf/index.ts** - Barrel exports
5. **sparql.errors.ts** - SPARQL operation errors
6. **graphrag.errors.ts** - GraphRAG retrieval errors
7. **Update value-objects/index.ts** - Export rdf module
8. **Update errors/index.ts** - Export new error files

---

## Critical Patterns

### Value Object Schema Pattern

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/Quad");

export const IRI = S.String.pipe(S.brand("IRI")).annotations(
  $I.annotations("IRI", { description: "IRI identifier" })
);

export class Quad extends S.Class<Quad>($I`Quad`)({
  subject: IRI,
  predicate: IRI,
  object: Term,
  graph: S.optional(IRI),
}) {}
```

### Tagged Error Pattern

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/sparql");

export class SparqlSyntaxError extends S.TaggedError<SparqlSyntaxError>(
  $I`SparqlSyntaxError`
)(
  "SparqlSyntaxError",
  {
    query: S.String,
    message: S.String,
    line: S.optional(S.Number),
    column: S.optional(S.Number),
  },
  $I.annotations("SparqlSyntaxError", {
    description: "SPARQL query has invalid syntax",
  })
) {}
```

---

## Verification Steps

After each file:

```bash
bun run check --filter @beep/knowledge-domain
```

After all files:

```bash
bun run lint --filter @beep/knowledge-domain
```

---

## Known Issues & Gotchas

1. **Import paths**: Use `@beep/identity/packages` for `$KnowledgeDomainId`
2. **BS helpers**: Use `BS.FieldOptionOmittable` for optional fields that should be omitted when undefined
3. **Schema naming**: The first argument to `S.TaggedError` should match the class name

---

## Success Criteria

Phase 1 is complete when:
- [ ] All 6 files created with correct patterns
- [ ] No TypeScript errors in knowledge-domain
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] HANDOFF_P2.md created for next phase
- [ ] P2_ORCHESTRATOR_PROMPT.md created for next phase

---

## Next Phase Preview

Phase 2 will implement RPC contracts for Entity and Relation operations in `@beep/knowledge-domain`.

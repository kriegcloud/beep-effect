# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the knowledge-architecture-foundation spec.

### Context

Phase 0 (spec scaffolding) is complete. ARCHITECTURE_DECISIONS.md and PACKAGE_ALLOCATION.md define the architectural foundations. This phase creates the value objects and error schemas needed for subsequent RPC contract definitions.

Key architectural decisions already made:
- RPC pattern: `@effect/rpc` with slice-specific contracts (ADR-001)
- Value objects belong in `@beep/knowledge-domain` (ADR-002)
- All errors use `S.TaggedError` pattern

### Your Mission

Create RDF value objects and tagged error schemas in `@beep/knowledge-domain`.

**Files to Create**:
1. `packages/knowledge/domain/src/value-objects/rdf/Quad.ts` - IRI, Literal, Term, Quad schemas
2. `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts` - Query pattern with optional wildcards
3. `packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts` - SPARQL query results
4. `packages/knowledge/domain/src/value-objects/rdf/index.ts` - Barrel exports
5. `packages/knowledge/domain/src/errors/sparql.errors.ts` - SparqlSyntaxError, SparqlTimeoutError, SparqlExecutionError
6. `packages/knowledge/domain/src/errors/graphrag.errors.ts` - EmbeddingGenerationError, VectorSearchError, GraphTraversalError

**Files to Update**:
7. `packages/knowledge/domain/src/value-objects/index.ts` - Add `export * from "./rdf"`
8. `packages/knowledge/domain/src/errors/index.ts` - Add new error exports

### Critical Patterns

**Value Object with Brand**:
```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/Quad");

export const IRI = S.String.pipe(S.brand("IRI")).annotations(
  $I.annotations("IRI", { description: "IRI identifier" })
);
```

**Class Schema**:
```typescript
export class Quad extends S.Class<Quad>($I`Quad`)({
  subject: IRI,
  predicate: IRI,
  object: Term,
  graph: S.optional(IRI),
}) {}
```

**Tagged Error**:
```typescript
export class SparqlSyntaxError extends S.TaggedError<SparqlSyntaxError>(
  $I`SparqlSyntaxError`
)(
  "SparqlSyntaxError",
  { query: S.String, message: S.String },
  $I.annotations("SparqlSyntaxError", { description: "SPARQL syntax error" })
) {}
```

### Reference Files

- Pattern: `packages/knowledge/domain/src/value-objects/evidence-span.value.ts` - Value object example
- Pattern: `packages/knowledge/domain/src/errors/ontology.errors.ts` - Tagged error example
- Guide: `specs/knowledge-architecture-foundation/outputs/IMPLEMENTATION_INSTRUCTIONS.md` - Full implementation details

### Verification

After each file:
```bash
bun run check --filter @beep/knowledge-domain
```

After all files:
```bash
bun run lint --filter @beep/knowledge-domain
```

### Success Criteria

- [ ] All 6 new files created
- [ ] Both index files updated
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run lint --filter @beep/knowledge-domain` passes

### Handoff Document

Read full context in: `specs/knowledge-architecture-foundation/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P2.md` (RPC contracts context)
3. Create `P2_ORCHESTRATOR_PROMPT.md` (copy-paste prompt for Phase 2)

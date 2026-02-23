# Phase 2 Handoff: RPC Contracts

**Date**: 2026-02-03
**From**: Phase 1 (Value Objects and Errors)
**To**: Phase 2 (RPC Contract Definitions)
**Status**: Ready for implementation
**Estimated tokens**: ~3,000 (under 4K budget)

---

## Phase 1 Summary

Created RDF value objects and error schemas:
- `value-objects/rdf/Quad.ts` - IRI, Literal, Term, Quad
- `value-objects/rdf/QuadPattern.ts` - Query patterns
- `value-objects/rdf/SparqlBindings.ts` - SPARQL results
- `errors/sparql.errors.ts` - SPARQL operation errors
- `errors/graphrag.errors.ts` - GraphRAG retrieval errors

### Key Learnings Applied

- Use `$I.annotations()` for all schema annotations
- Tagged errors require 3 arguments: tag function, tag name string, fields object
- Use `S.optional()` for optional fields in value objects

---

## Context for Phase 2

### Working Context (current task focus)

**Objective**: Create RPC contracts for Entity, Relation, GraphRAG, and Extraction operations

**Success Criteria**:
- [ ] Entity RPC contract with get, list, search, create, update, delete, count
- [ ] Relation RPC contract with get, listByEntity, listByPredicate, create, delete, count
- [ ] GraphRAG RPC contract with query, queryFromSeeds
- [ ] Extraction RPC contract with extract, getStatus
- [ ] Ontology RPC contract with get, list, create, update, delete, getClasses, getProperties
- [ ] All contracts compile without implementation
- [ ] Domain index exports `Rpc` namespace

**Files to Create**:
1. `packages/knowledge/domain/src/entities/entity/entity.rpc.ts`
2. `packages/knowledge/domain/src/entities/relation/relation.rpc.ts`
3. `packages/knowledge/domain/src/rpc/graphrag.rpc.ts`
4. `packages/knowledge/domain/src/rpc/extraction.rpc.ts`
5. `packages/knowledge/domain/src/rpc/ontology.rpc.ts`
6. `packages/knowledge/domain/src/rpc/index.ts`

**Files to Update**:
7. `packages/knowledge/domain/src/entities/entity/index.ts` - Export Rpc
8. `packages/knowledge/domain/src/entities/relation/index.ts` - Export Rpc
9. `packages/knowledge/domain/src/index.ts` - Export Rpc namespace

### Episodic Context (prior decisions)

From ARCHITECTURE_DECISIONS.md:
- **ADR-001**: Use `@effect/rpc` with slice-specific contracts
- **ADR-004**: Expose Entity, Relation, GraphRAG, SPARQL, Extraction, Resolution RPCs
- **ADR-005**: Entity handlers at `handlers/{Entity}.handlers.ts`, features at `rpc/v1/{feature}/`
- **ADR-006**: All RPCs use `Policy.AuthContextRpcMiddleware`

From Phase 1:
- Value objects available: Quad, QuadPattern, SparqlBindings
- Errors available: SparqlError, GraphRAGError

### Semantic Context (constants)

**RPC Prefix Convention**:
- Entity: `entity_`
- Relation: `relation_`
- GraphRAG: `graphrag_`
- Extraction: `extraction_`
- Ontology: `ontology_`

**EntityId Types**:
- `KnowledgeEntityIds.KnowledgeEntityId` - For entities
- `KnowledgeEntityIds.RelationId` - For relations
- `KnowledgeEntityIds.OntologyId` - For ontologies
- `KnowledgeEntityIds.ExtractionId` - For extractions
- `SharedEntityIds.OrganizationId` - For org scoping

### Procedural Context (patterns to follow)

- RPC patterns: `specs/knowledge-architecture-foundation/outputs/IMPLEMENTATION_INSTRUCTIONS.md` Step 3
- Reference: `packages/documents/domain/src/entities/document/document.rpc.ts`

---

## Critical Patterns

### RPC Contract Pattern

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Model } from "./entity.model";

const $I = $KnowledgeDomainId.create("entities/entity/entity.rpc");

export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>(
  $I`EntityNotFoundError`
)("EntityNotFoundError", {
  id: KnowledgeEntityIds.KnowledgeEntityId,
  message: S.String,
}) {}

export class Rpcs extends RpcGroup.make(
  Rpc.make("get", {
    payload: {
      id: KnowledgeEntityIds.KnowledgeEntityId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: EntityNotFoundError,
  }),
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,  // For streaming results
  }),
).prefix("entity_") {}
```

### Streaming RPC

For list operations returning potentially large result sets, use `stream: true`:

```typescript
Rpc.make("list", {
  payload: { /* ... */ },
  success: Model.json,  // Single item type
  error: S.Never,
  stream: true,  // Returns Stream of success type
})
```

---

## Implementation Order

1. **entity.rpc.ts** - Core entity operations
2. **relation.rpc.ts** - Relation operations
3. **graphrag.rpc.ts** - GraphRAG queries
4. **extraction.rpc.ts** - Extraction management
5. **ontology.rpc.ts** - Ontology operations
6. **rpc/index.ts** - Barrel exports
7. **Update entity/index.ts** - Export Rpc
8. **Update relation/index.ts** - Export Rpc
9. **Update domain index.ts** - Export Rpc namespace

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

1. **Model.json vs Model**: Use `Model.json` for RPC success schemas (serialization-safe)
2. **S.Never for no errors**: Use `S.Never` when operation cannot fail at RPC level
3. **Prefix naming**: RpcGroup prefix adds to all operation names (e.g., `entity_` + `get` = `entity_get`)
4. **Streaming operations**: Cannot use `error` with `stream: true` - errors flow through stream

---

## Success Criteria

Phase 2 is complete when:
- [ ] All RPC contracts created and compile
- [ ] Entity and Relation index files export Rpc
- [ ] Domain index exports Rpc namespace
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] HANDOFF_P3.md created for next phase
- [ ] P3_ORCHESTRATOR_PROMPT.md created for next phase

---

## Next Phase Preview

Phase 3 will implement server-side RPC handlers in `@beep/knowledge-server`.

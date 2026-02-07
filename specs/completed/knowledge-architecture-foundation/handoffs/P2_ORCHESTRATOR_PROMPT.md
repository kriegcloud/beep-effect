# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the knowledge-architecture-foundation spec.

### Context

Phase 1 created RDF value objects (Quad, QuadPattern, SparqlBindings) and error schemas (SparqlError, GraphRAGError) in `@beep/knowledge-domain`. This phase defines RPC contracts for all knowledge slice operations.

Key decisions from ADRs:
- Use `@effect/rpc` with slice-specific contracts (ADR-001)
- Entity RPCs in `entities/entity/entity.rpc.ts`, feature RPCs in `rpc/` directory (ADR-005)
- All RPCs will use `Policy.AuthContextRpcMiddleware` in Phase 3 (ADR-006)

### Your Mission

Create RPC contracts for Entity, Relation, GraphRAG, Extraction, and Ontology operations.

**Files to Create**:
1. `packages/knowledge/domain/src/entities/entity/entity.rpc.ts` - Entity CRUD + search
2. `packages/knowledge/domain/src/entities/relation/relation.rpc.ts` - Relation CRUD + queries
3. `packages/knowledge/domain/src/rpc/graphrag.rpc.ts` - GraphRAG queries
4. `packages/knowledge/domain/src/rpc/extraction.rpc.ts` - Extraction operations
5. `packages/knowledge/domain/src/rpc/ontology.rpc.ts` - Ontology CRUD
6. `packages/knowledge/domain/src/rpc/index.ts` - Barrel exports

**Files to Update**:
7. `packages/knowledge/domain/src/entities/entity/index.ts` - Add `export * as Rpc from "./entity.rpc"`
8. `packages/knowledge/domain/src/entities/relation/index.ts` - Add `export * as Rpc from "./relation.rpc"`
9. `packages/knowledge/domain/src/index.ts` - Add `export * as Rpc from "./rpc"`

### Critical Patterns

**RPC Contract**:
```typescript
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";

export class Rpcs extends RpcGroup.make(
  Rpc.make("get", {
    payload: { id: KnowledgeEntityIds.KnowledgeEntityId },
    success: Model.json,
    error: EntityNotFoundError,
  }),
  Rpc.make("list", {
    payload: { organizationId: SharedEntityIds.OrganizationId },
    success: Model.json,
    error: S.Never,
    stream: true,  // For streaming operations
  }),
).prefix("entity_") {}
```

**NotFound Error**:
```typescript
export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>(
  $I`EntityNotFoundError`
)("EntityNotFoundError", {
  id: KnowledgeEntityIds.KnowledgeEntityId,
  message: S.String,
}) {}
```

### Reference Files

- Pattern: `packages/documents/domain/src/entities/document/document.rpc.ts` - RPC contract example
- Guide: `specs/knowledge-architecture-foundation/outputs/IMPLEMENTATION_INSTRUCTIONS.md` - Step 3 details
- Models: `packages/knowledge/domain/src/entities/entity/entity.model.ts` - Entity model

### Operations per RPC Group

**Entity.Rpcs**: get, list, search, create, update, delete, count
**Relation.Rpcs**: get, listByEntity, listByPredicate, create, delete, count
**GraphRAG.Rpcs**: query, queryFromSeeds
**Extraction.Rpcs**: extract, getStatus
**Ontology.Rpcs**: get, list, create, update, delete, getClasses, getProperties

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
- [ ] 3 index files updated
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run lint --filter @beep/knowledge-domain` passes

### Handoff Document

Read full context in: `specs/knowledge-architecture-foundation/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P3.md` (server handlers context)
3. Create `P3_ORCHESTRATOR_PROMPT.md` (copy-paste prompt for Phase 3)

# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the knowledge-architecture-foundation spec.

### Context

Phase 2 created RPC contracts for Entity, Relation, GraphRAG, Extraction, and Ontology operations in `@beep/knowledge-domain`. This phase implements server-side handlers that connect contracts to existing services.

Key decisions:
- Middleware applies BEFORE `.toLayer()` (ADR-006)
- Handler keys must match prefixed names (e.g., `entity_get`)
- Auth context provides `session.activeOrganizationId` for RLS

### Your Mission

Implement RPC handlers in `@beep/knowledge-server` connecting contracts to existing services.

**Directory Structure to Create**:
```
packages/knowledge/server/src/rpc/v1/
  entity/get.ts, list.ts, count.ts, _rpcs.ts, index.ts
  relation/_rpcs.ts, index.ts
  graphrag/query.ts, _rpcs.ts, index.ts
  _rpcs.ts
  index.ts
packages/knowledge/server/src/rpc/index.ts
```

**Priority Handlers**:
1. Entity: get, list, count (full implementation)
2. GraphRAG: query (full implementation)
3. Relation: stub implementations

### Critical Patterns

**Layer Composition** (in `_rpcs.ts`):
```typescript
const EntityRpcsWithMiddleware = Entities.Entity.Rpc.Rpcs.middleware(
  Policy.AuthContextRpcMiddleware
);

const implementation = EntityRpcsWithMiddleware.of({
  entity_get: Get.Handler,
  entity_list: List.Handler,
  entity_count: Count.Handler,
  entity_search: () => { throw new Error("Not implemented"); },
  // ...
});

export const layer = EntityRpcsWithMiddleware.toLayer(implementation);
```

**Effect Handler**:
```typescript
export const Handler = Effect.fn("entity_get")(function* (payload) {
  const { session } = yield* Policy.AuthContext;
  const repo = yield* EntityRepo;
  // Verify org access, then execute
}).pipe(Effect.withSpan("entity_get"));
```

**Streaming Handler**:
```typescript
export const Handler = (payload) =>
  Stream.unwrap(
    Effect.gen(function* () {
      const entities = yield* repo.findAll(payload.organizationId);
      return Stream.fromIterable(entities);
    })
  );
```

### Reference Files

- Pattern: `packages/shared/server/src/rpc/v1/files/_rpcs.ts` - Handler layer example
- Services: `packages/knowledge/server/src/db/repos/Entity.repo.ts` - EntityRepo
- Services: `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts` - GraphRAGService
- Guide: `specs/knowledge-architecture-foundation/outputs/IMPLEMENTATION_INSTRUCTIONS.md` - Step 4-5

### Verification

After handlers:
```bash
bun run check --filter @beep/knowledge-server
```

After tests:
```bash
bun run test --filter @beep/knowledge-server
```

### Success Criteria

- [ ] Entity handlers: get, list, count implemented
- [ ] GraphRAG query handler implemented
- [ ] Relation handlers stubbed
- [ ] Aggregate layer at `rpc/v1/_rpcs.ts`
- [ ] Server index exports Rpc namespace
- [ ] `bun run check --filter @beep/knowledge-server` passes

### Handoff Document

Read full context in: `specs/knowledge-architecture-foundation/handoffs/HANDOFF_P3.md`

### Next Phase

After completing Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P4.md` (ADR creation context)
3. Create `P4_ORCHESTRATOR_PROMPT.md` (copy-paste prompt for Phase 4)

# Phase 3 Handoff: Server RPC Handlers

**Date**: 2026-02-03
**From**: Phase 2 (RPC Contracts)
**To**: Phase 3 (Server Handler Implementation)
**Status**: Ready for implementation
**Estimated tokens**: ~3,500 (under 4K budget)

---

## Phase 2 Summary

Created RPC contracts for all knowledge slice operations:
- Entity.Rpcs: get, list, search, create, update, delete, count
- Relation.Rpcs: get, listByEntity, listByPredicate, create, delete, count
- GraphRAG.Rpcs: query, queryFromSeeds
- Extraction.Rpcs: extract, getStatus
- Ontology.Rpcs: get, list, create, update, delete, getClasses, getProperties

### Key Learnings Applied

- Use `Model.json` for RPC success schemas (serialization-safe)
- Streaming RPCs use `stream: true` with single item success type
- RpcGroup prefix concatenates with operation name (e.g., `entity_get`)

---

## Context for Phase 3

### Working Context (current task focus)

**Objective**: Implement server-side RPC handlers in `@beep/knowledge-server`

**Success Criteria**:
- [ ] Entity handlers with auth middleware
- [ ] Relation handlers (stub implementations acceptable)
- [ ] GraphRAG query handler connected to GraphRAGService
- [ ] Aggregated handler layer in `rpc/v1/_rpcs.ts`
- [ ] `bun run check --filter @beep/knowledge-server` passes

**Files to Create**:
```
packages/knowledge/server/src/rpc/v1/
  entity/
    get.ts
    list.ts
    count.ts
    _rpcs.ts
    index.ts
  relation/
    _rpcs.ts
    index.ts
  graphrag/
    query.ts
    _rpcs.ts
    index.ts
  _rpcs.ts
  index.ts
```

**File to Update**:
- `packages/knowledge/server/src/index.ts` - Add `export * as Rpc from "./rpc"`

### Episodic Context (prior decisions)

From ADRs:
- **ADR-005**: Entity handlers at `handlers/{Entity}.handlers.ts` OR `rpc/v1/{entity}/`
- **ADR-006**: All RPCs use `Policy.AuthContextRpcMiddleware`

From Phase 2:
- RPC contracts available: Entity.Rpcs, Relation.Rpcs, GraphRAG.Rpcs, Extraction.Rpcs, Ontology.Rpcs
- Handler keys include prefix (e.g., `entity_get`)

### Semantic Context (constants)

**Layer Composition Order**:
1. Apply middleware to RpcGroup
2. Create implementation with `.of()`
3. Convert to Layer with `.toLayer()`

**Available Services**:
- `EntityRepo` from `@beep/knowledge-server/db`
- `RelationRepo` from `@beep/knowledge-server/db`
- `GraphRAGService` from `@beep/knowledge-server/GraphRAG`
- `Policy.AuthContext` from `@beep/shared-domain`

### Procedural Context (patterns to follow)

- Handler patterns: `specs/knowledge-architecture-foundation/outputs/IMPLEMENTATION_INSTRUCTIONS.md` Step 4
- Reference: `packages/shared/server/src/rpc/v1/files/_rpcs.ts`

---

## Critical Patterns

### Handler Layer Pattern

```typescript
import { Entities } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Get from "./get";
import * as List from "./list";
import * as Count from "./count";

// 1. Apply middleware FIRST
const EntityRpcsWithMiddleware = Entities.Entity.Rpc.Rpcs.middleware(
  Policy.AuthContextRpcMiddleware
);

// 2. Create implementation with .of()
const implementation = EntityRpcsWithMiddleware.of({
  entity_get: Get.Handler,
  entity_list: List.Handler,
  entity_count: Count.Handler,
  // Stub unimplemented handlers
  entity_search: () => { throw new Error("Not implemented"); },
  entity_create: () => { throw new Error("Not implemented"); },
  entity_update: () => { throw new Error("Not implemented"); },
  entity_delete: () => { throw new Error("Not implemented"); },
});

// 3. Convert to Layer
export const layer = EntityRpcsWithMiddleware.toLayer(implementation);
```

### Handler Implementation Pattern

```typescript
import { Entities } from "@beep/knowledge-domain";
import { EntityRepo } from "@beep/knowledge-server/db";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

type Payload = Entities.Entity.Rpc.Rpcs.Type["entity_get"]["payload"];

export const Handler = Effect.fn("entity_get")(function* (payload: Payload) {
  const { session } = yield* Policy.AuthContext;
  const repo = yield* EntityRepo;

  // Verify organization access
  if (session.activeOrganizationId !== payload.organizationId) {
    return yield* Effect.fail(
      new Entities.Entity.Rpc.EntityNotFoundError({
        id: payload.id,
        message: "Entity not found or access denied",
      })
    );
  }

  const entities = yield* repo.findByIds([payload.id], payload.organizationId);
  return yield* O.fromNullable(entities[0]).pipe(
    O.match({
      onNone: () => Effect.fail(new Entities.Entity.Rpc.EntityNotFoundError({
        id: payload.id,
        message: "Entity not found",
      })),
      onSome: Effect.succeed,
    })
  );
}).pipe(Effect.withSpan("entity_get"));
```

### Streaming Handler Pattern

```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export const Handler = (payload: Payload) =>
  Stream.unwrap(
    Effect.gen(function* () {
      const { session } = yield* Policy.AuthContext;
      const repo = yield* EntityRepo;

      if (session.activeOrganizationId !== payload.organizationId) {
        return Stream.empty;
      }

      const entities = yield* repo.findAll(payload.organizationId);
      return Stream.fromIterable(entities);
    }).pipe(Effect.withSpan("entity_list"))
  );
```

---

## Implementation Order

1. **entity/get.ts** - Entity get handler
2. **entity/list.ts** - Entity list handler (streaming)
3. **entity/count.ts** - Entity count handler
4. **entity/_rpcs.ts** - Entity layer composition
5. **entity/index.ts** - Barrel export
6. **relation/_rpcs.ts** - Relation handlers (stubs)
7. **relation/index.ts** - Barrel export
8. **graphrag/query.ts** - GraphRAG query handler
9. **graphrag/_rpcs.ts** - GraphRAG layer composition
10. **graphrag/index.ts** - Barrel export
11. **v1/_rpcs.ts** - Aggregate all handler layers
12. **v1/index.ts** - Barrel export
13. **rpc/index.ts** - Export V1 namespace

---

## Verification Steps

After each handler:
```bash
bun run check --filter @beep/knowledge-server
```

After all handlers:
```bash
bun run test --filter @beep/knowledge-server
```

---

## Known Issues & Gotchas

1. **Middleware order**: Apply middleware BEFORE `.toLayer()`, not after
2. **Handler keys**: Must match prefixed names exactly (e.g., `entity_get` not `get`)
3. **Auth verification**: Always check `session.activeOrganizationId` matches payload
4. **Error handling**: Use `catchTag` for specific error recovery

---

## Success Criteria

Phase 3 is complete when:
- [ ] All handler directories created
- [ ] Entity handlers implemented (get, list, count)
- [ ] Relation handlers stubbed
- [ ] GraphRAG query handler implemented
- [ ] Aggregate layer composes all handlers
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] HANDOFF_P4.md created for next phase
- [ ] P4_ORCHESTRATOR_PROMPT.md created for next phase

---

## Next Phase Preview

Phase 4 (ADR creation) will document all architectural decisions and create the final architecture decision record.

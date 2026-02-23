# Architecture Decision Records - Knowledge Slice Foundation

This document captures the key architectural decisions for the knowledge slice RPC infrastructure, value objects, and integration patterns.

---

## ADR-001: RPC Pattern Selection

**Status**: Accepted
**Date**: 2026-02-03

### Context

The knowledge slice requires a communication layer between client applications and server-side services. Three approaches were evaluated:

1. **HttpApi pattern** (`@effect/platform/HttpApi`) - REST-style endpoints with OpenAPI generation
2. **Shared kernel RPC only** - Extend `@beep/shared-domain/rpc` with knowledge operations
3. **Slice-specific RPC** (`@effect/rpc`) - Dedicated RPC groups in `@beep/knowledge-domain`

The documents slice successfully uses approach #3 with entity-scoped RPC definitions in domain layer (`packages/documents/domain/src/entities/{entity}/{entity}.rpc.ts`).

### Decision

Use `@effect/rpc` with slice-specific RPCs defined in `@beep/knowledge-domain`.

RPC contracts will be defined at:
- `packages/knowledge/domain/src/entities/{entity}/{entity}.rpc.ts` for entity-scoped operations
- `packages/knowledge/domain/src/rpc/v1/{feature}/_rpcs.ts` for cross-entity features (GraphRAG, SPARQL)

### Consequences

**Positive:**
- Type-safe RPC contracts with automatic codec generation
- Streaming support for large result sets (entity queries, extraction results)
- Consistent with documents slice architecture
- Clear ownership: domain owns contracts, server owns implementations
- Entity-scoped RPCs enable fine-grained versioning

**Negative:**
- Requires maintaining parallel RPC and handler implementations
- Additional compilation overhead vs HttpApi
- Learning curve for teams unfamiliar with Effect RPC

**Risks Mitigated:**
- Version drift: RPC schemas live in domain layer, shared by client and server
- Type mismatches: Effect Schema validation at both ends

---

## ADR-002: Package Allocation Strategy

**Status**: Accepted
**Date**: 2026-02-03

### Context

The knowledge slice already has 5 packages following vertical slice architecture:
- `@beep/knowledge-domain` - Entity models, errors, value objects
- `@beep/knowledge-tables` - Drizzle table definitions
- `@beep/knowledge-server` - Services, repositories, handlers
- `@beep/knowledge-client` - RPC client bindings (minimal)
- `@beep/knowledge-ui` - React components (minimal)

New artifacts to place:
- RPC contracts and schemas
- RDF/SPARQL value objects
- Handler implementations

### Decision

Follow the existing vertical slice pattern with these specific allocations:

**Domain Layer (`@beep/knowledge-domain`)**
- Value objects: RDF primitives (IRI, Literal, BlankNode, Triple, Quad)
- Value objects: SPARQL types (SparqlResult, Binding, BindingValue)
- Entity RPC contracts: `entities/{entity}/{entity}.rpc.ts`
- Feature RPC contracts: `rpc/v1/{feature}/_rpcs.ts`
- Tagged errors for RPC operations

**Tables Layer (`@beep/knowledge-tables`)**
- Drizzle definitions only
- No business logic
- No RPC awareness

**Server Layer (`@beep/knowledge-server`)**
- RPC handlers: `handlers/{Entity}.handlers.ts` OR `rpc/v1/{entity}/_rpcs.ts`
- Services: Business logic (GraphRAGService, ExtractionPipeline, etc.)
- Repositories: Database access (existing pattern)

### Consequences

**Positive:**
- Clear dependency direction enforced by TypeScript project references
- Domain layer portable to non-server contexts (SSR, workers)
- Server implementation details hidden from clients
- Existing infrastructure (repos, services) reused

**Negative:**
- RPC contracts in domain means domain package grows larger
- Must carefully manage exports to avoid client bundle bloat

---

## ADR-003: Layer Boundary Enforcement

**Status**: Accepted
**Date**: 2026-02-03

### Context

Effect's Layer system enables dependency injection but does not prevent circular dependencies at the module level. The codebase uses TypeScript project references to enforce boundaries.

Observed violations in other slices:
- Server code importing from tables directly (bypassing domain)
- Domain code accidentally importing server utilities

### Decision

Enforce strict unidirectional dependency flow:

```
domain (no deps) -> tables (domain) -> server (domain, tables)
                                           |
                                           v
                                    client (domain)
                                           |
                                           v
                                      ui (domain, client)
```

**FORBIDDEN patterns:**
- `@beep/knowledge-tables` importing from `@beep/knowledge-server`
- `@beep/knowledge-domain` importing from `@beep/knowledge-tables`
- `@beep/knowledge-server` importing from `@beep/knowledge-client`
- Any package importing from `@beep/knowledge-ui`

**PERMITTED cross-slice imports:**
- Only through `@beep/shared-domain` or `@beep/common/*`
- Knowledge may import from `@beep/documents-domain` for document entity references
- All cross-slice imports must be value objects or schemas, never services

### Consequences

**Positive:**
- Independent testing per layer
- Clear upgrade/migration paths
- Build parallelization via Turborepo

**Negative:**
- Some duplication of types at boundaries
- Cannot share utility functions between layers without common package

**Enforcement:**
- TypeScript project references (`tsconfig.json` `references` array)
- ESLint import rules (no-restricted-imports)
- Turborepo dependency graph validation

---

## ADR-004: RPC Exposure Strategy

**Status**: Accepted
**Date**: 2026-02-03

### Context

The knowledge slice has multiple services, some appropriate for client access and others purely internal:

**Potentially External:**
- Entity CRUD operations
- Relation queries
- GraphRAG query interface
- SPARQL query execution
- Extraction job management
- Entity resolution operations

**Internal Only:**
- RdfStore (direct triplestore access)
- OntologyCache (internal caching)
- EmbeddingProvider (infrastructure)
- NlpService (text processing)
- Reasoner (inference engine)

### Decision

Expose these capabilities via RPC:

| RPC Group | Operations | Rationale |
|-----------|------------|-----------|
| `Entity.Rpcs` | get, list, create, update, delete, search | Core entity management |
| `Relation.Rpcs` | get, list, create, delete, query | Relationship navigation |
| `GraphRAG.Rpcs` | query, contextualQuery, similarEntities | Product-facing RAG feature |
| `Sparql.Rpcs` | execute, explain, validate | Advanced query interface |
| `Extraction.Rpcs` | start, status, cancel, listJobs | Pipeline management |
| `Resolution.Rpcs` | merge, split, suggest, history | Entity deduplication |

Keep internal (no RPC exposure):
- `RdfStore` - Implementation detail, may swap backends
- `OntologyParser` - Build-time only
- `OntologyCache` - Server-side optimization
- `EmbeddingProvider` - Infrastructure concern
- `TextChunk` - Internal NLP utility
- `Reasoner` - Future enhancement, API unstable

### Consequences

**Positive:**
- Clients have clear, stable interface
- Internal services can evolve without API changes
- Security surface minimized

**Negative:**
- Some advanced use cases require multiple RPC calls
- Cannot expose "power user" direct store access

---

## ADR-005: Handler File Organization

**Status**: Accepted
**Date**: 2026-02-03

### Context

Two patterns observed in codebase for organizing RPC handlers:

**Pattern A: Entity-scoped handlers** (documents slice)
```
packages/documents/server/src/handlers/Document.handlers.ts
packages/documents/server/src/handlers/Discussion.handlers.ts
packages/documents/server/src/handlers/Comment.handlers.ts
```

**Pattern B: RPC directory structure** (shared domain)
```
packages/shared/domain/src/rpc/v1/files/_rpcs.ts
packages/shared/domain/src/rpc/v1/health.ts
```

### Decision

Use **hybrid approach** based on RPC scope:

**Entity-scoped operations** (CRUD, entity-specific queries):
```
packages/knowledge/server/src/handlers/Entity.handlers.ts
packages/knowledge/server/src/handlers/Relation.handlers.ts
packages/knowledge/server/src/handlers/Ontology.handlers.ts
```

**Cross-entity features** (GraphRAG, SPARQL, Extraction):
```
packages/knowledge/server/src/rpc/v1/graphrag/_rpcs.ts
packages/knowledge/server/src/rpc/v1/sparql/_rpcs.ts
packages/knowledge/server/src/rpc/v1/extraction/_rpcs.ts
```

Handler file naming convention:
- Entity handlers: `{Entity}.handlers.ts` with `{Entity}HandlersLive` export
- Feature handlers: `_rpcs.ts` with `{Feature}Rpcs` class and `{Feature}HandlersLive` layer

### Consequences

**Positive:**
- Entity handlers co-located for easy navigation
- Feature handlers grouped with related contracts
- Consistent with both existing patterns

**Negative:**
- Two slightly different structures to learn
- Index files need careful management

**Implementation:**
```typescript
// Entity handler pattern
export const EntityHandlersLive = Entity.Rpcs.toLayer(
  Effect.gen(function* () {
    const repo = yield* EntityRepo;
    return {
      get: (payload) => repo.findByIdOrFail(payload.id),
      // ...
    };
  })
);

// Feature handler pattern
export const GraphRAGHandlersLive = GraphRAG.Rpcs.toLayer(
  Effect.gen(function* () {
    const service = yield* GraphRAGService;
    return {
      query: (payload) => service.query(payload),
      // ...
    };
  })
);
```

---

## ADR-006: Authentication Middleware Application

**Status**: Accepted
**Date**: 2026-02-03

### Context

RPC authentication is handled via middleware in the Effect RPC system. The shared domain provides `Policy.AuthContextRpcMiddleware` which:
1. Validates session token
2. Loads user context
3. Provides `AuthContext` tag to handlers

Observed pattern in shared domain:
```typescript
export const Rpcs = Health.Rpcs
  .merge(Files.Rpcs)
  .merge(EventStream.Rpcs)
  .middleware(Policy.AuthContextRpcMiddleware);
```

### Decision

All knowledge slice RPCs MUST use `Policy.AuthContextRpcMiddleware`.

**Implementation pattern:**
```typescript
// In @beep/knowledge-domain
export class EntityRpcs extends RpcGroup.make(
  Rpc.make("get", { /* ... */ }),
  Rpc.make("list", { /* ... */ }),
).prefix("knowledge_entity_") {}

// In RPC aggregation (domain or server)
export const KnowledgeRpcs = EntityRpcs
  .merge(RelationRpcs)
  .merge(GraphRAGRpcs)
  .middleware(Policy.AuthContextRpcMiddleware);
```

**No public RPCs**: All knowledge operations require authenticated context for:
- Organization scoping (RLS enforcement)
- Audit logging
- Rate limiting
- Feature flags

### Consequences

**Positive:**
- Consistent auth across all knowledge operations
- AuthContext available in all handlers via `yield* AuthContext`
- Centralized session management

**Negative:**
- Cannot expose anonymous read operations (if needed later)
- Middleware adds latency to every RPC call

**Security:**
- Handlers MUST NOT bypass RLS by using raw SQL
- Organization ID MUST be derived from AuthContext, not payload (for writes)
- Audit events MUST include user context from AuthContext

---

## Summary

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| 001 | `@effect/rpc` with slice-specific contracts | Type safety, streaming, consistency with documents |
| 002 | Vertical slice allocation | Clear ownership, portable domain |
| 003 | Strict dependency direction | Build isolation, testability |
| 004 | Expose product features only | Security, API stability |
| 005 | Hybrid handler organization | Entity handlers + feature directories |
| 006 | Universal auth middleware | Consistent security, RLS enforcement |

---

## Implementation Notes

Key learnings from Phase 3 handler implementation:

### 1. Middleware Composition Order

AuthContextRpcMiddleware MUST be applied via `.middleware()` BEFORE `.toLayer()`:

```typescript
// CORRECT - Middleware first
const RpcsWithMiddleware = Entity.Rpc.Rpcs.middleware(
  Policy.AuthContextRpcMiddleware
);
const implementation = RpcsWithMiddleware.of({ handlers });
export const layer = RpcsWithMiddleware.toLayer(implementation);

// WRONG - Middleware after .toLayer() fails
const layer = Entity.Rpc.Rpcs.of({ handlers })
  .toLayer()
  .middleware(Policy.AuthContextRpcMiddleware);  // Too late!
```

**Rationale**: The middleware pattern `.middleware()` returns a new RpcGroup that has the middleware baked into its Layer construction. Calling `.toLayer()` first creates the Layer without middleware.

### 2. Handler Key Naming

Handler object keys must exactly match prefixed operation names:

```typescript
// CORRECT - Includes prefix from RpcGroup
EntityRpcsWithMiddleware.of({
  entity_get: Get.Handler,      // Prefix + operation name
  entity_list: List.Handler,
  entity_count: Count.Handler,
})

// WRONG - Missing prefix fails at runtime
EntityRpcsWithMiddleware.of({
  get: Get.Handler,             // Missing "entity_" prefix
  list: List.Handler,
})
```

**Rationale**: RpcGroup applies the prefix during registration. The handler lookup uses the full prefixed name.

### 3. Streaming Pattern

Use `Effect.fnUntraced()` with `Stream.unwrap` for streaming handlers:

```typescript
export const Handler: (payload: Payload) => Stream.Stream<
  Item,
  Error,
  Requirements
> = Effect.fnUntraced(function* (payload: Payload) {
  // 1. Yield Effect that produces Stream
  const items = yield* someEffect();
  return Stream.fromIterable(items);
}, Stream.unwrap);  // 2. unwrap converts Effect<Stream> to Stream
```

**Why `Effect.fnUntraced()`**: Prevents telemetry spans from being created for every item in the stream. Without it, streaming 10,000 entities creates 10,000 spans.

### 4. Access Control Pattern

Verify `session.activeOrganizationId === payload.organizationId` in every handler:

```typescript
// Single-item handlers - fail with NotFoundError
const { session } = yield* Policy.AuthContext;
if (session.activeOrganizationId !== payload.organizationId) {
  return yield* Effect.fail(
    new NotFoundError({ id: payload.id })
  );
}

// Streaming handlers - return empty stream
const { session } = yield* Policy.AuthContext;
if (session.activeOrganizationId !== payload.organizationId) {
  return Stream.empty;
}
```

**Rationale**: RLS-style tenant isolation prevents data leakage across organizations.

### 5. S.Schema.Type Pattern

For optional schema types, use `S.Schema.Type<typeof Schema>` not `typeof Schema.Type`:

```typescript
// CORRECT - Works for optional schemas
export const Graph = S.optional(IRI);
export type Graph = S.Schema.Type<typeof Graph>;

// WRONG - Optional schemas don't expose .Type
export type Graph = typeof Graph.Type;  // TypeScript error
```

**Rationale**: `S.optional()` returns a schema wrapper without `.Type` property. Use `S.Schema.Type<>` utility for extracting types from any schema.

---

## Appendix: Implementation Checklist

Based on these decisions, the following artifacts need creation:

### Domain Layer
- [x] RDF value objects (`src/value-objects/rdf/`) - Quad.ts, QuadPattern.ts, SparqlBindings.ts
- [x] Entity RPC contracts (`src/entities/entity/entity.rpc.ts`) - 7 operations
- [x] Relation RPC contracts (`src/entities/relation/relation.rpc.ts`) - 6 operations
- [x] GraphRAG RPC contracts (`src/rpc/graphrag.rpc.ts`) - 2 operations
- [x] Extraction RPC contracts (`src/rpc/extraction.rpc.ts`) - 4 operations
- [x] Ontology RPC contracts (`src/rpc/ontology.rpc.ts`) - 7 operations
- [ ] SPARQL RPC contracts - Deferred to Phase 0 (RDF Foundation)
- [ ] Resolution RPC contracts - Deferred to entity-resolution spec

### Server Layer
- [x] Entity handlers (`src/rpc/v1/entity/`) - get, list, count implemented; search/create/update/delete stubbed
- [x] Relation handlers (`src/rpc/v1/relation/`) - All stubbed for future implementation
- [x] GraphRAG handlers (`src/rpc/v1/graphrag/`) - query implemented; queryFromSeeds stubbed
- [ ] SPARQL handlers - Deferred to Phase 0 (RDF Foundation)
- [ ] Extraction handlers - Deferred to workflow-durability spec
- [ ] Resolution handlers - Deferred to entity-resolution spec
- [x] Combined handlers layer (`src/rpc/v1/_rpcs.ts`) - Merges Entity, Relation, GraphRAG

### Integration
- [x] RPC export from knowledge-server (`export * as Rpc from "./rpc"`)
- [ ] Client bindings - Deferred
- [ ] App router registration - Deferred

---
paths:
  - "packages/*/domain/src/entities/**"
  - "packages/*/domain/src/entities/*/contracts/**"
  - "packages/*/domain/src/entities/*/*.model.ts"
  - "packages/*/domain/src/entities/*/*.errors.ts"
  - "packages/*/domain/src/entities/*/*.repo.ts"
  - "packages/*/domain/src/entities/*/*.rpc.ts"
  - "packages/*/domain/src/entities/*/*.http.ts"
  - "packages/*/domain/src/entities/*/*.tool.ts"
  - "packages/*/domain/src/entities/*/*.entity.ts"
---

# Canonical Domain Entity Pattern

The canonical domain entity pattern defines how every domain entity is structured in the beep-effect monorepo. The Comment entity (`packages/documents/domain/src/entities/Comment/`) is the reference implementation.

## When to Use This Skill

- Creating a new domain entity in any slice
- Migrating an existing entity to the canonical structure
- Adding a new operation (contract) to an existing entity
- Reviewing entity code for pattern compliance
- Understanding the relationship between contracts, RPC, HTTP, AI tools, and cluster entities

## Module Structure

Every domain entity lives in `packages/<slice>/domain/src/entities/<Entity>/` with these files:

```
packages/<slice>/domain/src/entities/<Entity>/
  <Entity>.model.ts           -- SQL model via M.Class with makeFields for audit columns
  <Entity>.errors.ts          -- S.TaggedError classes with HTTP annotations
  <Entity>.repo.ts            -- Repository contract (Context.Tag + DbRepo.DbRepoSuccess)
  <Entity>.rpc.ts             -- RpcGroup.make(...) aggregating contract RPCs
  <Entity>.http.ts            -- HttpApiGroup.make(...) aggregating contract HTTP endpoints
  <Entity>.tool.ts            -- AiToolkit.make(...) aggregating contract AI tools
  <Entity>.entity.ts          -- ClusterEntity.fromRpcGroup(...) for distributed hosting
  contracts/
    <Operation>.contract.ts   -- One file per operation (Get, Create, Update, Delete, List...)
    index.ts                  -- Barrel re-exports with namespace exports
  index.ts                    -- Top-level barrel with flat/namespace exports
```

## Identity Builder

Every module starts with a `$I` identity builder derived from the slice identity package. The argument to `create()` is the module path relative to the slice domain root.

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
const $I = $DocumentsDomainId.create("entities/Comment/Comment.model");
```

The identity builder provides:
- `$I\`Name\`` -- Tagged template for producing unique schema identifiers
- `$I.annotations("Name", { description: "..." })` -- Standard schema annotations
- `$I.annotationsHttp("Name", { status: 404, description: "..." })` -- HTTP-aware annotations

## Model (`<Entity>.model.ts`)

The model uses `M.Class` from `@effect/sql/Model` with `makeFields` from `@beep/shared-domain/common` to include standard audit columns (id, createdAt, updatedAt).

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Comment/Comment.model");

export class Model extends M.Class<Model>($I`CommentModel`)(
  makeFields(DocumentsEntityIds.CommentId, {
    organizationId: SharedEntityIds.OrganizationId,
    discussionId: DocumentsEntityIds.DiscussionId,
    userId: SharedEntityIds.UserId,
    content: S.String,
    contentRich: BS.FieldOptionOmittable(S.Unknown),
    isEdited: BS.BoolWithDefault(false),
  }),
  $I.annotations("CommentModel", {
    description: "Comment model representing individual comments within discussions.",
  })
) {
  static readonly utils = modelKit(Model);
}
```

Key rules:
- First argument to `makeFields` is the entity's branded `EntityId` schema
- `makeFields` adds `id`, `createdAt`, `updatedAt` automatically
- Use `BS.FieldOptionOmittable(...)` for optional fields omitted when undefined
- Use `BS.BoolWithDefault(value)` for boolean fields with defaults
- `modelKit(Model)` provides derived utilities (`Model.json`, `Model.insert`, `Model.update`, etc.)

## Errors (`<Entity>.errors.ts`)

Each error is an `S.TaggedError` with HTTP annotations via `$I.annotationsHttp`.

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Comment/Comment.errors");

export class CommentNotFoundError extends S.TaggedError<CommentNotFoundError>()(
  $I`CommentNotFoundError`,
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotationsHttp("CommentNotFoundError", {
    status: 404,
    description: "Error when a comment with the specified ID cannot be found.",
  })
) {}

export class CommentPermissionDeniedError extends S.TaggedError<CommentPermissionDeniedError>()(
  $I`CommentPermissionDeniedError`,
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotationsHttp("CommentPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the comment.",
  })
) {}

export class CommentTooLongError extends S.TaggedError<CommentTooLongError>()(
  $I`CommentTooLongError`,
  {
    length: S.Int,
    maxLength: S.Int,
  },
  $I.annotationsHttp("CommentTooLongError", {
    status: 400,
    description: "Error when comment content exceeds maximum length.",
  })
) {}

// Aggregate union at bottom of file
export const Errors = S.Union(CommentNotFoundError, CommentPermissionDeniedError, CommentTooLongError);
export type Errors = typeof Errors.Type;
```

Key rules:
- NO `cause` field -- errors are self-contained boundary-safe values
- HTTP status via `$I.annotationsHttp` with `status` number
- Error fields use branded EntityIds where applicable
- Aggregate `Errors` union + matching `type` alias at the bottom of the file

## Contract Pattern (`contracts/<Operation>.contract.ts`)

Each contract exports exactly four things: `Payload`, `Success`, `Failure`, `Contract`.

### Standard Imports

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as CommentErrors from "../Comment.errors";
import * as Comment from "../Comment.model";
```

Import `BS` only when using `BS.FieldOptionOmittable` or similar helpers. Import `SharedEntityIds` only when the payload references cross-slice IDs.

### Payload

`S.Class` with the `$I` identity builder:

```typescript
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Comment Contract.",
  })
) {}
```

### Success -- Three Patterns

**Data response** (GET, CREATE, UPDATE):
```typescript
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Comment.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Comment Contract.",
  })
) {}
```

**List response** (paginated listing):
```typescript
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Comment.Model.json),
    nextCursor: BS.FieldOptionOmittable(S.String),
    hasMore: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Paginated list of comments for a discussion.",
  })
) {}
```

**Void response** (DELETE):
```typescript
export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Comment contract.",
  })
) {}
```

### Failure -- Three Cardinalities

ALWAYS export both `const` and `type`:

```typescript
// Zero errors (infallible)
export const Failure = S.Never;
export type Failure = typeof Failure.Type;

// Single error
export const Failure = CommentErrors.CommentNotFoundError;
export type Failure = typeof Failure.Type;

// Multiple errors
export const Failure = S.Union(
  CommentErrors.CommentNotFoundError,
  CommentErrors.CommentPermissionDeniedError,
);
export type Failure = typeof Failure.Type;
```

### Contract

`S.TaggedRequest` with three static derivations:

```typescript
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Comment Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(CommentErrors.CommentNotFoundError)
    .addSuccess(Success);
}
```

### HTTP Method Mapping

| Operation | HTTP Method | Path | Success Status |
|-----------|-------------|------|----------------|
| GET | `HttpApiEndpoint.get("Get", "/:id")` | `/:id` | 200 (default) |
| CREATE | `HttpApiEndpoint.post("Create", "/")` | `/` | 201 |
| UPDATE | `HttpApiEndpoint.patch("Update", "/:id")` | `/:id` | 200 (default) |
| DELETE | `HttpApiEndpoint.del("Delete", "/:id")` | `/:id` | 204 |
| LIST | `HttpApiEndpoint.get("ListBy...", "/")` | `/` | 200 (default) |
| State transitions | `HttpApiEndpoint.patch("Action", "/:id/action")` | varies | 200 (default) |

### HTTP Error Chaining Rule

Chain `.addError(ErrorClass)` individually per error class. NEVER pass a union schema to `.addError()`.

```typescript
// CORRECT
static readonly Http = HttpApiEndpoint.patch("Update", "/:id")
  .setPayload(Payload)
  .addError(CommentErrors.CommentNotFoundError)
  .addError(CommentErrors.CommentPermissionDeniedError)
  .addSuccess(Success);

// WRONG -- union schema
static readonly Http = HttpApiEndpoint.patch("Update", "/:id")
  .setPayload(Payload)
  .addError(Failure)  // DO NOT pass union to addError
  .addSuccess(Success);
```

### HTTP Success Status for Non-Default Codes

```typescript
// 201 for CREATE
.addSuccess(Success, { status: 201 })

// 204 for DELETE
.addSuccess(Success, { status: 204 })
```

For infallible list operations (Failure = S.Never), omit `.addError()` entirely:

```typescript
static readonly Http = HttpApiEndpoint.get("ListByDiscussion", "/")
  .setPayload(Payload)
  .addSuccess(Success);
```

## Cursor Pagination Pattern

For list operations, use opaque cursor-based pagination:

```typescript
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    discussionId: DocumentsEntityIds.DiscussionId,
    cursor: S.optional(S.String),
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 100)), { default: () => 20 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the ListByDiscussion Comment contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Comment.Model.json),
    nextCursor: BS.FieldOptionOmittable(S.String),
    hasMore: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Paginated list of comments for a discussion.",
  })
) {}
```

- `cursor` is `S.optional(S.String)` -- omitted on first request
- `limit` uses `S.optionalWith` with a default of 20, constrained between 1 and 100
- `nextCursor` is `BS.FieldOptionOmittable(S.String)` -- omitted when no more pages
- `hasMore` is a simple `S.Boolean`

## Repository Contract (`<Entity>.repo.ts`)

The repository contract lives in the domain package so both domain and server code can reference the shape without importing server layers.

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type * as Comment from "./Comment.model";
import type { Delete, ListByDiscussion, Update } from "./contracts";

const $I = $DocumentsDomainId.create("entities/Comment/Comment.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Comment.Model,
  {
    readonly listByDiscussion: DbRepo.Method<{
      payload: typeof ListByDiscussion.Payload;
      success: typeof ListByDiscussion.Success;
    }>;
    readonly updateContent: DbRepo.Method<{
      payload: typeof Update.Payload;
      success: typeof Update.Success;
      failure: typeof Update.Failure;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
```

Key rules:
- `DbRepo.DbRepoSuccess<typeof Model, Extensions>` provides base CRUD (findAll, findById, insert, etc.)
- Extensions define custom query methods beyond base CRUD
- `DbRepo.Method<{ payload, success, failure? }>` -- `failure` is optional (omit for infallible operations)
- Use `type` imports for contract types and model -- the repo is a contract, not an implementation
- The `Repo` class extends `Context.Tag` to serve as a service tag for dependency injection

## Infrastructure Files

### RPC (`<Entity>.rpc.ts`)

Aggregates all contract RPCs into a single group:

```typescript
import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Create, Delete, Get, ListByDiscussion, Update } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  ListByDiscussion.Contract.Rpc,
  Create.Contract.Rpc,
  Update.Contract.Rpc,
  Delete.Contract.Rpc
) {}
```

### HTTP (`<Entity>.http.ts`)

Aggregates all contract HTTP endpoints into a single API group:

```typescript
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Create, Delete, Get, ListByDiscussion, Update } from "./contracts";

export class Http extends HttpApiGroup.make("comments")
  .add(Get.Contract.Http)
  .add(ListByDiscussion.Contract.Http)
  .add(Create.Contract.Http)
  .add(Update.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/comments") {}
```

The string argument to `HttpApiGroup.make()` is the group name (used in OpenAPI docs). The `.prefix()` sets the URL prefix for all endpoints in the group.

### Tool (`<Entity>.tool.ts`)

Aggregates all contract AI tools into a single toolkit:

```typescript
import * as AiToolkit from "@effect/ai/Toolkit";
import { Create, Delete, Get, ListByDiscussion, Update } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  ListByDiscussion.Contract.Tool,
  Create.Contract.Tool,
  Update.Contract.Tool,
  Delete.Contract.Tool
);
```

### Entity (`<Entity>.entity.ts`)

Wires the RPC group into an Effect Cluster entity for distributed hosting:

```typescript
import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./Comment.rpc";

export const Entity = ClusterEntity.fromRpcGroup("Entity", Rpcs)
  .annotateRpcs(ClusterSchema.Persisted, true);
```

The first argument to `fromRpcGroup` is the entity name used in the cluster registry. `.annotateRpcs(ClusterSchema.Persisted, true)` marks all RPCs as persisted for durable execution.

## Barrel Exports

### Entity `index.ts`

```typescript
export * from "./Comment.entity";
export * from "./Comment.http";
export * from "./Comment.model";
export * from "./Comment.repo";
export * from "./Comment.tool";
export * as CommentErrors from "./Comment.errors";
export * as Rpcs from "./Comment.rpc";
export * as Contracts from "./contracts";
```

Rules:
- Flat `export *` for modules with unique exported names (model, repo, http, tool, entity)
- Namespace `export * as X` for collections that would cause name collisions (errors, rpcs, contracts)
- If the entity has value objects: `export * from "./Entity.values";`

### Contracts `contracts/index.ts`

```typescript
export * as Create from "./Create.contract";
export * as Delete from "./Delete.contract";
export * as Get from "./Get.contract";
export * as ListByDiscussion from "./ListByDiscussion.contract";
export * as Update from "./Update.contract";
```

Always use namespace exports for individual contracts so consumers access them as `Contracts.Get.Payload`, `Contracts.Create.Success`, etc.

## Common Anti-Patterns and Mistakes

### 1. Passing union schema to `.addError()`

```typescript
// WRONG
static readonly Http = HttpApiEndpoint.patch("Update", "/:id")
  .addError(Failure)  // Failure is S.Union(...) -- breaks OpenAPI generation
  .addSuccess(Success);

// CORRECT
static readonly Http = HttpApiEndpoint.patch("Update", "/:id")
  .addError(CommentErrors.CommentNotFoundError)
  .addError(CommentErrors.CommentPermissionDeniedError)
  .addSuccess(Success);
```

### 2. Missing `type` keyword on Failure alias

```typescript
// WRONG -- creates a value alias, not a type alias
export type Failure = typeof Failure;

// CORRECT
export type Failure = typeof Failure.Type;
```

### 3. Using plain `S.String` for entity IDs

```typescript
// WRONG
export class Payload extends S.Class<Payload>($I`Payload`)({
  id: S.String,
}) {}

// CORRECT
export class Payload extends S.Class<Payload>($I`Payload`)({
  id: DocumentsEntityIds.CommentId,
}) {}
```

### 4. Importing implementation types instead of `type` imports in repo

```typescript
// WRONG -- creates runtime dependency
import * as Comment from "./Comment.model";
import { ListByDiscussion } from "./contracts";

// CORRECT -- type-only imports
import type * as Comment from "./Comment.model";
import type { ListByDiscussion } from "./contracts";
```

### 5. Forgetting annotations on Payload/Success/Contract

Every `Payload`, `Success`, and `Contract` class must have `$I.annotations(...)` or `$I.annotationsHttp(...)` as the last argument to the class constructor. These drive OpenAPI documentation and schema identification.

### 6. Missing `static readonly` on contract derivations

```typescript
// WRONG -- instance property
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)("Get", { ... }) {
  Rpc = Rpc.fromTaggedRequest(Contract);  // Missing static readonly
}

// CORRECT
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)("Get", { ... }) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(CommentErrors.CommentNotFoundError)
    .addSuccess(Success);
}
```

### 7. Incorrect barrel export style

```typescript
// WRONG -- flat export of errors causes name collisions across entities
export * from "./Comment.errors";

// CORRECT -- namespace export for errors
export * as CommentErrors from "./Comment.errors";
```

### 8. Adding `cause` field to error schemas

```typescript
// WRONG -- errors are boundary-safe, cause does not serialize
export class CommentNotFoundError extends S.TaggedError<CommentNotFoundError>()(
  $I`CommentNotFoundError`,
  {
    id: DocumentsEntityIds.CommentId,
    cause: S.Unknown,  // DO NOT include cause
  },
) {}

// CORRECT
export class CommentNotFoundError extends S.TaggedError<CommentNotFoundError>()(
  $I`CommentNotFoundError`,
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotationsHttp("CommentNotFoundError", {
    status: 404,
    description: "...",
  })
) {}
```

## Migration Checklist

When migrating an existing entity to the canonical pattern:

- [ ] Create `$I` identity builder from slice identity package in each module
- [ ] Migrate each operation to `<Operation>.contract.ts` with `Payload`, `Success`, `Failure`, `Contract`
- [ ] Add static `Rpc`, `Tool`, `Http` to each `Contract` class
- [ ] Create/update `<Entity>.errors.ts` with `S.TaggedError` + HTTP annotations
- [ ] Create/update `<Entity>.repo.ts` with `DbRepo.DbRepoSuccess` + extensions
- [ ] Create `<Entity>.rpc.ts` aggregating `Contract.Rpc` from all contracts
- [ ] Create `<Entity>.http.ts` aggregating `Contract.Http` from all contracts
- [ ] Create `<Entity>.tool.ts` aggregating `Contract.Tool` from all contracts
- [ ] Create `<Entity>.entity.ts` with `ClusterEntity.fromRpcGroup`
- [ ] Update `contracts/index.ts` with namespace exports per contract
- [ ] Update entity `index.ts` barrel with correct flat/namespace exports
- [ ] Run `bun run check --filter @beep/<slice>-domain` to verify types
- [ ] Run `bunx effect generate --cwd packages/<slice>/domain` to regenerate barrel exports

## Complete Contract Example: GET

For reference, this is the complete `Get.contract.ts` from the Comment entity:

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as CommentErrors from "../Comment.errors";
import * as Comment from "../Comment.model";

const $I = $DocumentsDomainId.create("entities/Comment/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Comment Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Comment.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Comment Contract.",
  })
) {}

export const Failure = CommentErrors.CommentNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Comment Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(CommentErrors.CommentNotFoundError)
    .addSuccess(Success);
}
```

## Complete Contract Example: CREATE

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as CommentErrors from "../Comment.errors";
import * as Comment from "../Comment.model";

const $I = $DocumentsDomainId.create("entities/Comment/contracts/Create.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    discussionId: DocumentsEntityIds.DiscussionId,
    content: S.String,
    contentRich: S.optional(S.Unknown),
  },
  $I.annotations("Payload", {
    description: "Payload for the Create Comment contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Comment.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Create Comment contract.",
  })
) {}

export const Failure = S.Union(
  CommentErrors.CommentTooLongError,
  CommentErrors.CommentPermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Create",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Create Comment Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Create", "/")
    .setPayload(Payload)
    .addError(CommentErrors.CommentTooLongError)
    .addError(CommentErrors.CommentPermissionDeniedError)
    .addSuccess(Success, { status: 201 });
}
```

## Complete Contract Example: DELETE

```typescript
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as CommentErrors from "../Comment.errors";

const $I = $DocumentsDomainId.create("entities/Comment/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Comment contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Comment contract.",
  })
) {}

export const Failure = S.Union(
  CommentErrors.CommentNotFoundError,
  CommentErrors.CommentPermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Comment Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(CommentErrors.CommentNotFoundError)
    .addError(CommentErrors.CommentPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
```

## Parallel Migration Coordination

When migrating multiple entities concurrently with a swarm of agents, follow these coordination rules to prevent contention and data loss.

### Barrel File Ownership

**Rule: Only the ORCHESTRATOR updates barrel files. Agents MUST NOT modify `entities/index.ts`.**

Agents create their entity directories and all files within, but leave the barrel file untouched. After all agents complete, the orchestrator updates the barrel in a single pass. This eliminates:
- Race conditions where two agents overwrite each other's barrel changes
- Partial updates where Agent A updates its entries but not Agent B's
- Broken imports when old directories are deleted but the barrel still references them

### Turn Budget Estimates

Plan agent capacity based on entity complexity:

| Entity Type | Tool Calls | Files Created | Recommended max_turns |
|------------|-----------|--------------|----------------------|
| Simple (CRUD-only, no custom methods) | ~20 | ~12 | 80 |
| Custom methods (1-5 methods) | ~40-60 | ~15-20 | 120 |
| Custom methods (6-10 methods) | ~80-100 | ~20-30 | 150 |
| Legacy RPC + >10 methods | ~120-150 | ~25-40 | 200 |

**Rule: Any entity with >8 custom methods gets its own dedicated agent.** Do not batch it with other entities.

### Cleanup Protocol

**Rule: Agents do NOT delete old directories. The orchestrator handles all cleanup.**

Migration agents:
1. Create new PascalCase directories with all canonical files
2. Do NOT delete old kebab-case directories
3. Do NOT modify the parent barrel file
4. Report completion with list of files created

Orchestrator cleanup (after all agents complete):
1. Update barrel files to PascalCase paths
2. Run import sweep: `grep -r 'from "@beep/<pkg>/entities/[a-z]' packages/`
3. Fix any broken downstream imports
4. Delete old kebab-case directories
5. Run type verification on domain + all downstream packages

### Pre-flight Checklist

Before spawning migration agents, the orchestrator verifies:
- [ ] All required EntityIds exist in the relevant EntityIds file
- [ ] Current barrel file state is clean (no uncommitted changes)
- [ ] Reference implementation (Comment entity) is accessible
- [ ] Server repo files are readable for custom method signature extraction

---
path: packages/shared/server
summary: Cross-slice server infrastructure - database, email, uploads, RPC, multi-tenant RLS
tags: [server, effect, database, rpc, email, uploads, s3, postgres, multi-tenant]
---

# @beep/shared-server

Foundational Effect-first infrastructure layer providing database clients, email delivery, S3 uploads, and multi-tenant row-level security. All vertical slices depend on these services for data access and cross-cutting concerns.

## Architecture

```
|------------------|     |------------------|     |------------------|
|    DbClient      | --> |     DbRepo       | --> |  Slice Repos     |
|------------------|     |------------------|     |------------------|
        |
        v
|------------------|     |------------------|
|  TenantContext   | --> |   RLS Policies   |
|------------------|     |------------------|

|------------------|     |------------------|     |------------------|
|  UploadService   | --> |    S3Service     | --> |   AWS S3         |
|------------------|     |------------------|     |------------------|

|------------------|     |------------------|
|  ResendService   | --> |   Resend API     |
|------------------|     |------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `factories/DbClient` | Typed Drizzle client factory with connection pool and transactions |
| `db/DbRepo` | Repository factory with auto-CRUD, telemetry, and error mapping |
| `TenantContext` | PostgreSQL session variables for RLS multi-tenant isolation |
| `Email/ResendService` | Effect wrapper for Resend SDK with tagged errors |
| `services/UploadService` | S3 presigned URL generation and object management |
| `rpc/v1/files` | File management RPC handlers |

## Usage Patterns

### Build Slice Database Layer
```typescript
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { DbClient } from "@beep/shared-server/factories";
import * as mySchema from "./schema";

export class MyDb extends Context.Tag("MyDb")<MyDb, DbClient.Shape<typeof mySchema>>() {
  static readonly Live = Layer.scoped(MyDb, DbClient.make({ schema: mySchema }));
}
```

### Create Repository with Custom Queries
```typescript
import * as Effect from "effect/Effect";
import { DbRepo } from "@beep/shared-server";
import { SharedEntityIds } from "@beep/shared-domain";

export class MyRepo extends Effect.Service<MyRepo>()("MyRepo", {
  effect: Effect.gen(function* () {
    return yield* DbRepo.make(SharedEntityIds.MyId, MyModel);
  }),
}) {}
```

### Multi-tenant Query Scoping
```typescript
import * as Effect from "effect/Effect";
import { TenantContext } from "@beep/shared-server";

const handler = Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;
  yield* ctx.setOrganizationId("org-123");
  // All subsequent queries scoped via RLS
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect Config over process.env | Type-safe config with redacted secrets |
| DbRepo factory pattern | Consistent CRUD + telemetry across slices |
| Session-level SET for RLS | Connection pooling requires session vars |
| Scoped Layers for pools | Graceful shutdown and resource cleanup |

## Dependencies

**Internal**: `@beep/shared-domain`, `@beep/schema`, `@beep/invariant`
**External**: `effect`, `@effect/sql-pg`, `@effect/sql-drizzle`, `drizzle-orm`, `resend`, `@effect-aws/client-s3`

## Related

- **AGENTS.md** - Detailed contributor guidance with recipes and gotchas

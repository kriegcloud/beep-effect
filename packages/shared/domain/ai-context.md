---
path: packages/shared/domain
summary: Shared kernel for all slices - branded EntityIds, Policy, paths, cache, retry, encryption
tags: [domain, effect, schema, entityids, shared, policy, cache]
---

# @beep/shared-domain

Foundation layer providing branded entity IDs, authorization policies, typed route paths, caching primitives, retry strategies, and encryption services. All vertical slices (IAM, Documents, Calendar, Knowledge, Comms, Customization) depend on this package for cross-cutting domain infrastructure.

## Architecture

```
|------------------|     |-------------------|     |------------------|
|   Entity IDs     |     |    Entities       |     |  Value Objects   |
| SharedEntityIds  |     | User, Org, File   |     | paths, Source    |
| IamEntityIds     |     | Session, Team     |     |                  |
| DocumentsEntityIds|    | AuditLog, Folder  |     |                  |
|------------------|     |-------------------|     |------------------|
        |                        |                         |
        v                        v                         v
|----------------------------------------------------------------------|
|                         Core Services                                 |
|  Policy (auth)  |  ManualCache (TTL/LRU)  |  Retry  |  Encryption    |
|----------------------------------------------------------------------|
        |
        v
|----------------------------------------------------------------------|
|                    Downstream Slices (consumers)                      |
|    IAM    |   Documents   |   Calendar   |   Knowledge   |   Comms   |
|----------------------------------------------------------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `entity-ids/*` | Branded ID schemas per slice (SharedEntityIds, IamEntityIds, etc.) |
| `entities/*` | Effect M.Class models (User, Organization, File, Session, Team) |
| `Policy.ts` | Authorization combinators (permission, all, any, withPolicy) |
| `ManualCache.ts` | Scoped TTL+LRU cache with Effect semantics |
| `Retry.ts` | Exponential backoff with jitter |
| `services/EncryptionService/` | AES-GCM encryption with schema validation |
| `value-objects/paths.ts` | Type-safe route builder via PathBuilder.collection |
| `common.ts` | makeFields helper for M.Class with audit columns |

## Usage Patterns

### Define Model with EntityId
```typescript
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain";

export class Document extends M.Class<Document>("Document")(
  makeFields(SharedEntityIds.FileId, {
    title: S.NonEmptyString,
    organizationId: SharedEntityIds.OrganizationId,
  })
) {}
```

### Policy Authorization
```typescript
import * as Effect from "effect/Effect";
import * as Policy from "@beep/shared-domain/Policy";

const canEdit = Policy.permission("document:update");
const isOwner = Policy.policy((user) => Effect.succeed(user.id === ownerId));
const access = Policy.any(canEdit, isOwner);

const guarded = Policy.withPolicy(access)(myEffect);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Branded EntityIds | Type-safe ID mixing prevention across slice boundaries |
| makeFields helper | Consistent audit columns (createdAt, updatedAt, version) |
| PathBuilder.collection | URL validation via BS.URLPath branding |
| Scoped ManualCache | Resource cleanup tied to Effect scope lifecycle |

## Dependencies

**Internal**: @beep/schema, @beep/constants, @beep/errors, @beep/utils
**External**: effect, @effect/sql, @effect/platform

## Related

- **AGENTS.md** - Detailed contributor guidance with gotchas and security notes
- **@beep/schema** - BS helpers and EntityId.make used by this package

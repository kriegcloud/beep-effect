# @beep/shared-domain

Shared domain logic, entities, and infrastructure primitives for the beep-effect monorepo.

## Overview

`@beep/shared-domain` provides the foundational domain layer consumed across IAM, Documents, and Files slices. It defines branded entity IDs, Effect-based models, `@effect/rpc` contracts, authorization policies, caching primitives, retry strategies, encryption services, and typed routing paths that power `apps/web` and `apps/server`.

Built on `@beep/schema` utilities and `@effect/sql/Model`, this package ensures consistent entity definitions, audit tracking, and cross-slice interoperability. RPC contracts enable type-safe client-server communication for file operations and real-time event streaming.

## Features

- **Entity IDs**: Branded type-safe identifiers for all entities (User, Organization, File, Folder, etc.)
- **Effect Models**: `@effect/sql/Model.Class` schemas with audit columns and optimistic locking
- **RPC Contracts**: `@effect/rpc` definitions for Files and EventStream APIs
- **Authorization**: Composable policy system with permission checks, context propagation, and RPC middleware
- **Caching**: Manual cache with TTL and LRU eviction semantics
- **Retry Logic**: Configurable exponential backoff policies
- **Path Building**: Type-safe route construction for auth flows, dashboards, and APIs
- **Encryption**: Schema-validated cryptographic operations service
- **Value Objects**: Reusable domain primitives (EntitySource, paths collection)

## Installation

```bash
bun add @beep/shared-domain
```

### Peer Dependencies

```json
{
  "effect": "catalog:",
  "@effect/sql": "catalog:",
  "@effect/platform": "catalog:",
  "@effect/experimental": "catalog:",
  "@beep/schema": "workspace:^",
  "@beep/utils": "workspace:^",
  "@beep/constants": "workspace:^",
  "@beep/errors": "workspace:^",
  "@beep/invariant": "workspace:^",
  "@beep/identity": "workspace:^",
  "drizzle-orm": "catalog:",
  "mutative": "catalog:"
}
```

## Package Structure

```
src/
├── common.ts                    # Audit columns, makeFields helper
├── DomainApi.ts                 # Top-level RPC API aggregation
├── api/                         # RPC contracts and events
│   ├── files-rpc.ts            # Files RPC operations (list, upload, move, delete)
│   └── event-stream-rpc.ts     # Event streaming RPC (real-time updates)
├── entity-ids/                  # Branded entity ID schemas
│   ├── shared.ts               # SharedEntityIds (User, Organization, File, Folder, etc.)
│   ├── iam.ts                  # IamEntityIds (Account, Member, etc.)
│   ├── documents.ts            # DocumentsEntityIds
│   ├── table-names.ts          # Table name literal kits
│   ├── entity-kind.ts          # EntityKind union type
│   └── any-entity-id.ts        # Aggregate entity ID union
├── entities/                    # Effect Model schemas
│   ├── AuditLog/               # Audit log model
│   ├── File/                   # File entity with upload schemas
│   ├── Folder/                 # Folder entity with file relationships
│   ├── Organization/           # Organization model + enums
│   ├── Session/                # Session model
│   ├── Team/                   # Team model with policies
│   └── User/                   # User model + roles
├── value-objects/
│   ├── paths.ts                # PathBuilder collection of routes
│   └── EntitySource.ts         # Entity source metadata
├── Policy.ts                    # Authorization policies and RPC middleware
├── ManualCache.ts              # Manual cache facade
├── Retry.ts                     # Retry policy factory
├── services/
│   └── EncryptionService/      # Encryption service
├── factories/                   # Error codes, model kits, path builders
└── _internal/                   # Implementation details (do not import)
```

## Core Exports

### Entity IDs

```typescript
import { SharedEntityIds, IamEntityIds, DocumentsEntityIds } from "@beep/shared-domain";

// Create branded entity IDs
const userId = SharedEntityIds.UserId.make("user__abc123");
const orgId = SharedEntityIds.OrganizationId.make("organization__xyz789");
const accountId = IamEntityIds.AccountId.make("account__def456");

// Access table names
console.log(SharedEntityIds.UserId.tableName); // "user"
console.log(SharedEntityIds.OrganizationId.tableName); // "organization"
```

### Entities

```typescript
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import * as Common from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain";

// Define a model with reusable audit columns
export class DocumentModel extends M.Class<DocumentModel>("DocumentModel")(
  Common.makeFields(SharedEntityIds.FileId, {
    title: S.NonEmptyString,
    organizationId: SharedEntityIds.OrganizationId,
  })
) {}

// Includes: id, _rowId, createdAt, updatedAt, deletedAt,
// createdBy, updatedBy, deletedBy, version, source
```

### Policy System

Authorization policies with composable permission checks and context propagation.

```typescript
import * as Effect from "effect/Effect";
import * as Policy from "@beep/shared-domain/Policy";
import { SharedEntityIds } from "@beep/shared-domain";

const targetUserId = SharedEntityIds.UserId.make("user__abc123");

// Define policies
const canManage = Policy.permission("user:manage");
const isSelf = Policy.policy((user) =>
  Effect.succeed(user.userId === targetUserId)
);

// Compose with AND semantics
const strictAccess = Policy.all(canManage, Policy.permission("user:read"));

// Compose with OR semantics
const flexibleAccess = Policy.any(strictAccess, isSelf);

// Apply policy to effect
const guardedEffect = Policy.withPolicy(flexibleAccess)(
  Effect.gen(function* () {
    // Protected operation
    return yield* Effect.succeed("saved");
  })
);
```

**RPC Middleware**: The `Policy` module also exports `AuthContextRpcMiddleware` for use with `@effect/rpc` RPC groups, automatically providing authentication context to RPC handlers.

### Manual Cache

```typescript
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import * as ManualCache from "@beep/shared-domain/ManualCache";

const program = Effect.scoped(
  Effect.gen(function* () {
    const cache = yield* ManualCache.make<string, number>({
      capacity: 100,
      timeToLive: Duration.minutes(5),
    });

    yield* cache.set("key", 42);
    const value = yield* cache.get("key"); // Option<number>
    const exists = yield* cache.contains("key"); // boolean
    const size = yield* cache.size; // number

    yield* cache.invalidate("key");
    yield* cache.invalidateAll;

    return value;
  })
);
```

### Retry Policies

```typescript
import * as Effect from "effect/Effect";
import { Retry } from "@beep/shared-domain";

// Use default exponential backoff
const withDefaultRetry = Effect.retry(
  myEffect,
  Retry.exponentialBackoffPolicy
);

// Custom retry policy
const customPolicy = Retry.makeExponentialBackoffPolicy({
  delay: 500,
  growthFactor: 3,
  jitter: false,
  maxRetries: 5,
});

const withCustomRetry = Effect.retry(myEffect, customPolicy);

// No retry
const noRetry = Effect.retry(myEffect, Retry.noRetryPolicy);

// Retry once
const retryOnce = Effect.retry(myEffect, Retry.oncePolicy);
```

### Path Building

```typescript
import { paths } from "@beep/shared-domain";
import { SharedEntityIds } from "@beep/shared-domain";

// Static paths
paths.root;                      // "/"
paths.auth.signIn;              // "/auth/sign-in"
paths.dashboard.root;           // "/dashboard"

// Dynamic paths
const userId = SharedEntityIds.UserId.make("user__123");
paths.dashboard.user.edit(userId); // "/dashboard/user/user__123/edit"

// Query parameters
paths.auth.routes.signIn.withCallback("https://app.example.com/callback");
// "/auth/sign-in?callbackURL=https%3A%2F%2Fapp.example.com%2Fcallback"

paths.auth.routes.signIn.withCallbackAndMethod(
  "https://app.example.com/callback",
  "email"
);
// "/auth/sign-in?callbackURL=...&method=email"
```

### File Upload Path Schema

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Entities, SharedEntityIds } from "@beep/shared-domain";
import type { EnvValue } from "@beep/constants";

const uploadPath = Effect.gen(function* () {
  const decoded: Entities.File.UploadKeyDecoded.Type = {
    env: "dev" as EnvValue.Type,
    fileId: SharedEntityIds.FileId.make("file__12345678-1234-1234-1234-123456789012"),
    organizationType: "individual",
    organizationId: SharedEntityIds.OrganizationId.make(
      "organization__87654321-4321-4321-4321-210987654321"
    ),
    entityKind: "user",
    entityIdentifier: SharedEntityIds.UserId.make("user__87654321-4321-4321-4321-210987654321"),
    entityAttribute: "avatar",
    extension: "jpg",
  };

  return yield* S.decode(Entities.File.UploadKey)(decoded);
});
```

### Folder Entity

Folders organize files and provide hierarchical structure for file management.

```typescript
import { Entities, SharedEntityIds } from "@beep/shared-domain";

// Folder model includes:
// - id: FolderId
// - organizationId: OrganizationId
// - userId: UserId (folder owner)
// - name: string
// - Standard audit columns (createdAt, updatedAt, etc.)

// WithUploadedFiles schema extends Folder with associated files
const folderWithFiles: Entities.Folder.WithUploadedFiles = {
  id: SharedEntityIds.FolderId.make("folder__123"),
  organizationId: SharedEntityIds.OrganizationId.make("org__456"),
  userId: SharedEntityIds.UserId.make("user__789"),
  name: "My Documents",
  uploadedFiles: [
    // Array of File.Model instances
  ],
  // ... audit fields
};
```

### RPC Contracts

The package provides `@effect/rpc` contracts for real-time file operations and event streaming.

#### Files RPC

```typescript
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Entities } from "@beep/shared-domain";

// Import from api directory (not exported at package level - internal use)
// Server implementations can reference these from @beep/shared-domain/api/files-rpc

// Available RPC operations:
// - ListFilesRpc: List files and folders
// - InitiateUploadRpc: Get presigned URL for file upload
// - CreateFolderRpc: Create a new folder
// - DeleteFilesRpc: Delete files by IDs
// - DeleteFoldersRpc: Delete folders by IDs
// - MoveFilesRpc: Move files to a different folder
// - GetFilesByKeyRpc: Retrieve files by upload keys

// Example payload construction
import type { InitiateUploadPayload } from "@beep/shared-domain/api/files-rpc";

const uploadPayload: InitiateUploadPayload = {
  fileName: "avatar.jpg",
  fileSize: 1024000,
  mimeType: "image/jpeg",
  entityKind: "user",
  entityIdentifier: SharedEntityIds.UserId.make("user__123"),
  entityAttribute: "avatar",
  folderId: null,
  metadata: {},
};
```

#### Event Stream RPC

```typescript
// Event streaming for real-time updates
// Server implementations can use EventStreamRpc for websocket connections

// Supported events:
// - FilesEvent: File upload notifications
// - Ka: Keep-alive heartbeat

// Example event handler pattern (server-side)
import * as Effect from "effect/Effect";
import type { EventStreamEvents } from "@beep/shared-domain/api/event-stream-rpc";

const handleEvent = (event: EventStreamEvents) =>
  Effect.gen(function* () {
    if (event._tag === "Files.Uploaded") {
      console.log("File uploaded:", event.file.id);
    }
  });
```

## Usage Examples

### Authentication Middleware

```typescript
import * as Effect from "effect/Effect";
import { AuthContext, CurrentUser, AuthContextHttpMiddleware } from "@beep/shared-domain/Policy";

// Access current user context
const getCurrentUser = Effect.gen(function* () {
  const auth = yield* AuthContext;
  return auth.user;
});

// Check permissions
const checkPermission = Effect.gen(function* () {
  const current = yield* CurrentUser;
  return current.permissions.has("user:read");
});
```

### Audit Columns

```typescript
import * as Common from "@beep/shared-domain/common";

// Audit columns: createdAt, updatedAt, deletedAt
const audit = Common.auditColumns;

// User tracking: createdBy, updatedBy, deletedBy
const userTracking = Common.userTrackingColumns;

// Global: audit + user tracking + version + source
const global = Common.globalColumns;
```

## Effect Patterns

This package follows strict Effect-first conventions:

### Import Style

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";
```

### No Native Array Methods

```typescript
// ❌ FORBIDDEN
items.map((item) => item.name);
items.filter((item) => item.active);

// ✅ REQUIRED
F.pipe(items, A.map((item) => item.name));
F.pipe(items, A.filter((item) => item.active));
```

### Schema Constructors

Always use PascalCase:

```typescript
// ✅ CORRECT
S.Struct({ name: S.String })
S.Array(S.String)
S.Option(S.Number)

// ❌ WRONG
S.struct({ name: S.string })
S.array(S.string)
```

## Testing

```bash
# Run tests
bun run --filter @beep/shared-domain test

# Run tests with coverage
bun run --filter @beep/shared-domain coverage

# Type check
bun run --filter @beep/shared-domain check

# Lint
bun run --filter @beep/shared-domain lint
```

### Test Suites

- `test/ManualCache.test.ts` - Cache behavior, TTL, LRU eviction
- `test/internal/policy.test.ts` - Policy combinators (all, any, permission)
- `test/entities/File/schemas/UploadKey.test.ts` - Upload path encoding
- `test/services/EncryptionService.test.ts` - Encryption operations

## API Documentation

For detailed API documentation, see [AGENTS.md](./AGENTS.md).

### Key Modules

- **Common** (`src/common.ts`) - Audit columns, makeFields
- **DomainApi** (`src/DomainApi.ts`) - Top-level RPC API aggregation
- **API** (`src/api/*`) - RPC contracts (FilesRpc, EventStreamRpc)
- **Entity IDs** (`src/entity-ids/*`) - Branded ID schemas, table names
- **Entities** (`src/entities/*`) - Effect models for File, Folder, User, Organization, etc.
- **Policy** (`src/Policy.ts`) - Authorization policies, RPC middleware, auth context
- **ManualCache** (`src/ManualCache.ts`) - TTL+LRU cache
- **Retry** (`src/Retry.ts`) - Exponential backoff policies
- **Paths** (`src/value-objects/paths.ts`) - Type-safe route building
- **EncryptionService** (`src/services/EncryptionService/`) - Crypto operations

## Integration Points

### Apps

- `apps/web` - Uses `paths` for routing, `Policy` for auth guards
- `apps/server` - Consumes entity models, policies, and retry strategies

### Packages

- `packages/iam/*` - Uses IamEntityIds, Session/User models
- `packages/documents/*` - Uses DocumentsEntityIds, File models
- `packages/shared/infra` - Builds on entity IDs and models for repos
- `packages/shared/tables` - Drizzle schemas aligned with entity IDs

## Contribution Guidelines

### Adding Entity IDs

1. Add to appropriate kit (`shared.ts`, `iam.ts`, `documents.ts`)
2. Update `EntityKind` in `entity-kind.ts`
3. Update `AnyEntityId` in `any-entity-id.ts`
4. Export from kit in `entity-ids/index.ts`
5. Add corresponding table name to table-names kits

### Adding Entities

1. Create model using `Common.makeFields` helper
2. Place in `src/entities/{EntityName}/`
3. Export from `src/entities/index.ts`
4. Ensure tests cover schema validation
5. Update entity ID references if introducing new IDs

### Extending Permissions

1. Update permission map in `Policy.ts`
2. Add tests in `test/internal/policy.test.ts`
3. Follow `{tableName}:{action}` pattern

### Adding Routes

1. Use `PathBuilder.createRoot` or `.child` in `paths.ts`
2. Add to `PathBuilder.collection`
3. Update documentation

## Known Issues

- `AnyEntityId` currently duplicates `SubscriptionId` (lines 17-18 in `any-entity-id.ts`)
- Resolution pending before using exhaustive unions

## License

MIT

## Related Packages

- [@beep/schema](../common/schema) - Schema utilities, EntityId factories
- [@beep/constants](../common/constants) - Schema-backed enums, path builders
- [@beep/errors](../common/errors) - Error types and logging
- [@beep/shared-infra](../shared/infra) - Database, repos, email services
- [@beep/shared-tables](../shared/tables) - Drizzle table definitions

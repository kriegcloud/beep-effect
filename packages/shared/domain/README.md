# @beep/shared-domain

Shared domain logic, entities, and infrastructure primitives for the beep-effect monorepo.

## Purpose

`@beep/shared-domain` provides the foundational domain layer consumed across IAM, Documents, and Files slices. It defines branded entity IDs, Effect-based models, RPC contracts, authorization policies, caching primitives, retry strategies, encryption services, and typed routing paths that power  and `apps/server`.

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
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-domain": "workspace:*"
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
├── index.ts                     # Main exports aggregation
├── common.ts                    # Audit columns, makeFields helper
├── api/
│   ├── api.ts                  # SharedApi - Top-level HTTP API aggregation
│   └── v1/                     # Version 1 API definitions
│       ├── api.ts              # V1 API aggregation
│       ├── index.ts            # V1 exports
│       └── rpc-reference.ts    # RPC reference documentation endpoint
├── rpc/                        # RPC contracts and events
│   ├── index.ts                # RPC exports aggregation
│   ├── rpc.ts                  # RPC type definitions
│   └── v1/                     # Version 1 RPC definitions
│       ├── index.ts            # V1 RPC exports
│       ├── _rpcs.ts            # RPC group aggregation
│       ├── _events.ts          # Event union types
│       ├── event-stream.ts     # Event streaming RPC (real-time updates)
│       ├── health.ts           # Health check RPC
│       └── files/              # Files RPC operations
│           ├── index.ts        # Files RPC group
│           ├── _rpcs.ts        # Files RPC aggregation
│           ├── list-files.ts   # List files and folders
│           ├── initiate-upload.ts  # Get presigned URL for upload
│           ├── create-folder.ts    # Create folder
│           ├── delete-files.ts     # Delete files
│           ├── delete-folders.ts   # Delete folders
│           ├── move-files.ts       # Move files
│           └── get-files-by-keys.ts # Retrieve files by keys
├── entity-ids/                  # Branded entity ID schemas
│   ├── index.ts                # Entity ID exports
│   ├── shared.ts               # SharedEntityIds (User, Organization, File, Folder, etc.)
│   ├── iam.ts                  # IamEntityIds (Account, Member, etc.)
│   ├── documents.ts            # DocumentsEntityIds
│   ├── table-names.ts          # Table name literal kits
│   ├── entity-kind.ts          # EntityKind union type
│   ├── any-entity-id.ts        # Aggregate entity ID union
│   ├── SharedTableNames/       # Shared table name kits
│   │   ├── index.ts
│   │   └── SharedTableNames.ts
│   ├── IamTableNames/          # IAM table name kits
│   │   ├── index.ts
│   │   └── IamTableNames.ts
│   └── DocumentsTableNames.ts  # Documents table name kits
├── entities/                    # Effect Model schemas
│   ├── index.ts                # Entities exports
│   ├── entities.ts             # Entities aggregation (deprecated)
│   ├── AuditLog/               # Audit log model
│   │   ├── index.ts
│   │   └── AuditLog.model.ts
│   ├── File/                   # File entity with upload schemas
│   │   ├── index.ts
│   │   ├── File.model.ts
│   │   └── schemas/
│   │       ├── index.ts
│   │       └── UploadKey.ts
│   ├── Folder/                 # Folder entity with file relationships
│   │   ├── index.ts
│   │   ├── Folder.model.ts
│   │   └── schemas/
│   │       ├── index.ts
│   │       └── WithUploadedFiles.ts
│   ├── Organization/           # Organization model + enums
│   │   ├── index.ts
│   │   ├── Organization.model.ts
│   │   └── schemas/
│   │       ├── index.ts
│   │       ├── OrganizationType.schema.ts
│   │       ├── SubscriptionStatus.schema.ts
│   │       └── SubscriptionTier.schema.ts
│   ├── Session/                # Session model
│   │   ├── index.ts
│   │   └── Session.model.ts
│   ├── Team/                   # Team model with policies
│   │   ├── index.ts
│   │   ├── Team.model.ts
│   │   └── Team.policy.ts
│   ├── UploadSession/          # Upload session model with metadata
│   │   ├── index.ts
│   │   ├── UploadSession.model.ts
│   │   └── schemas/
│   │       ├── index.ts
│   │       └── UploadSessionMetadata.ts
│   └── User/                   # User model + roles
│       ├── index.ts
│       ├── User.model.ts
│       ├── User.constants.ts
│       ├── User.plans.ts
│       └── schemas/
│           ├── index.ts
│           └── UserRole.ts
├── value-objects/
│   ├── index.ts                # Value objects exports
│   ├── paths.ts                # PathBuilder collection of routes
│   └── EntitySource.ts         # Entity source metadata
├── policy/                      # Policy types and permissions
│   ├── policy-types.ts         # Policy type definitions
│   └── permissions.ts          # Permission literals
├── Policy.ts                    # Authorization policies and RPC middleware
├── ManualCache.ts              # Manual cache facade
├── Retry.ts                     # Retry policy factory
├── errors/                      # Error types and formatting
│   └── db-error/               # PostgreSQL error handling
│       ├── db-error.ts         # DatabaseError class with formatting
│       ├── formatter.ts        # SQL query formatting utilities
│       ├── pg-error-enum.ts    # PostgreSQL error code enums
│       └── index.ts
├── services/
│   ├── index.ts                # Services exports
│   └── EncryptionService/      # Encryption service
│       ├── index.ts
│       ├── EncryptionService.ts
│       ├── schemas.ts
│       └── errors.ts
├── factories/                   # Error codes, model kits, path builders, repo factories
│   ├── index.ts                # Factories exports
│   ├── db-repo.ts              # Database repository factory
│   ├── error-code.ts           # Error code factory
│   ├── model-kit.ts            # Model kit factory
│   └── path-builder/           # PathBuilder implementation
│       ├── index.ts
│       ├── types.ts
│       └── PathBuilder/
│           ├── index.ts
│           └── PathBuilder.ts
├── factories.ts                # Re-export all factories
└── _internal/                   # Implementation details (do not import)
    ├── manual-cache.ts         # ManualCache implementation
    ├── policy.ts               # Policy implementation
    └── policy-builder.ts       # Policy builder
```

## Core Exports

This package supports two import patterns:

1. **Main package exports**: `import { SharedEntityIds } from "@beep/shared-domain"`
2. **Subpath exports**: `import * as Policy from "@beep/shared-domain/Policy"`

Both patterns are valid. Subpath exports are preferred for module-level imports to maintain consistency with Effect conventions.

### Main Exports

| Export | Description |
|--------|-------------|
| `SharedApi` | HTTP API aggregation with OpenAPI metadata |
| `Common` | Audit columns and `makeFields` helper |
| `Entities` | All entity models (File, Folder, User, Organization, etc.) |
| `SharedEntityIds`, `IamEntityIds`, `DocumentsEntityIds`, `CommsEntityIds`, `CustomizationEntityIds` | Branded entity ID kits |
| `EntityKind` | Union type of all entity kinds |
| `Policy` | Authorization policies and middleware |
| `Retry` | Retry policy factory and presets |
| `ManualCache` | Manual cache with TTL and LRU eviction (subpath only) |
| `EncryptionService` | Cryptographic operations service |
| `paths` | Type-safe route building collection |
| `EntitySource` | Entity source metadata schema |
| `DbRepo` | Database repository factory utilities |
| `DatabaseError` | Structured PostgreSQL error handling |

### Entity IDs

```typescript
import { SharedEntityIds, IamEntityIds, DocumentsEntityIds } from "@beep/shared-domain";

// Create branded entity IDs
const userId = SharedEntityIds.UserId.make("shared_user__abc123");
const orgId = SharedEntityIds.OrganizationId.make("shared_organization__xyz789");
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
import * as F from "effect/Function";
import * as Policy from "@beep/shared-domain/Policy";
import { SharedEntityIds } from "@beep/shared-domain";

const targetUserId = SharedEntityIds.UserId.make("shared_user__abc123");

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
const guardedEffect = F.pipe(
  Effect.gen(function* () {
    // Protected operation
    return yield* Effect.succeed("saved");
  }),
  Policy.withPolicy(flexibleAccess)
);
```

**RPC Middleware**: The `Policy` module also exports `AuthContextRpcMiddleware` for use with `@effect/rpc` RPC groups, automatically providing authentication context to RPC handlers.

### Manual Cache

A scoped cache implementation with TTL and LRU eviction semantics.

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

Configurable retry strategies with exponential backoff.

```typescript
import * as Effect from "effect/Effect";
import * as Retry from "@beep/shared-domain/Retry";

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
const userId = SharedEntityIds.UserId.make("shared_user__123");
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
import * as File from "@beep/shared-domain/entities/File";
import { SharedEntityIds } from "@beep/shared-domain";
import type { EnvValue } from "@beep/constants";

const uploadPath = Effect.gen(function* () {
  const decoded: File.UploadKeyDecoded.Type = {
    env: "dev" as EnvValue.Type,
    fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
    organizationType: "individual",
    organizationId: SharedEntityIds.OrganizationId.make(
      "shared_organization__87654321-4321-4321-4321-210987654321"
    ),
    entityKind: "shared_user",
    entityIdentifier: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
    entityAttribute: "avatar",
    extension: "jpg",
  };

  return yield* S.decode(File.UploadKey)(decoded);
});
```

### Folder Entity

Folders organize files and provide hierarchical structure for file management.

```typescript
import * as S from "effect/Schema";
import * as Folder from "@beep/shared-domain/entities/Folder";
import { SharedEntityIds } from "@beep/shared-domain";

// Folder.Model includes:
// - id: FolderId
// - organizationId: OrganizationId
// - userId: UserId (folder owner)
// - name: string
// - Standard audit columns from makeFields (createdAt, updatedAt, version, etc.)

// Folder.WithUploadedFiles schema extends Folder.Model with associated files
const folderWithFilesSchema = S.decodeUnknownSync(Folder.WithUploadedFiles)({
  id: SharedEntityIds.FolderId.make("folder__123"),
  organizationId: SharedEntityIds.OrganizationId.make("org__456"),
  userId: SharedEntityIds.UserId.make("shared_user__789"),
  name: "My Documents",
  uploadedFiles: [], // Array of File.Model instances
  // ... audit fields (createdAt, updatedAt, version, source, etc.)
});
```

### RPC Contracts

The package provides RPC contracts for real-time file operations and event streaming.

#### Files RPC

```typescript
import * as Effect from "effect/Effect";
import { SharedEntityIds } from "@beep/shared-domain";
import type * as Files from "@beep/shared-domain/rpc/v1/files";

// Available RPC operations:
// - ListFiles: List files and folders
// - InitiateUpload: Get presigned URL for file upload
// - CreateFolder: Create a new folder
// - DeleteFiles: Delete files by IDs
// - DeleteFolders: Delete folders by IDs
// - MoveFiles: Move files to a different folder
// - GetFilesByKeys: Retrieve files by upload keys

// Example payload construction
const uploadPayload: Files.InitiateUpload.Payload = {
  fileName: "avatar.jpg",
  fileSize: 1024000,
  mimeType: "image/jpeg",
  entityKind: "shared_user",
  entityIdentifier: SharedEntityIds.UserId.make("shared_user__123"),
  entityAttribute: "avatar",
  folderId: null,
  metadata: {},
};

// Example usage in Effect context
const initiateUpload = Effect.gen(function* () {
  const result = yield* Files.InitiateUpload.handler(uploadPayload);
  return result.uploadUrl;
});
```

#### Event Stream RPC

```typescript
import * as Effect from "effect/Effect";
import type * as Events from "@beep/shared-domain/rpc/v1/_events";

// Event streaming for real-time updates via websocket connections

// Supported events:
// - Files.Uploaded: File upload notifications
// - Ka: Keep-alive heartbeat

// Example event handler pattern
const handleEvent = (event: Events.Events) =>
  Effect.gen(function* () {
    if (event._tag === "Files.Uploaded") {
      console.log("File uploaded:", event.file.id);
    } else if (event._tag === "Ka") {
      console.log("Keep-alive ping received");
    }
  });
```

#### HTTP API

```typescript
import { SharedApi } from "@beep/shared-domain";

// SharedApi is an @effect/platform HttpApi that aggregates all shared domain endpoints
// including RPC reference documentation and health checks

// The API is versioned and includes OpenAPI metadata:
// - Title: "Shared API"
// - Version: "1.0.0"
// - Tag Groups: "v1 / Shared"
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

### Database Error Handling

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { DatabaseError } from "@beep/shared-domain";

// Handle database errors with structured formatting
const queryWithErrorHandling = Effect.gen(function* () {
  return yield* myDatabaseQuery;
}).pipe(
  Effect.catchTag("SqlError", (error) =>
    Effect.gen(function* () {
      const dbError = DatabaseError.$match(error.cause);
      const formatted = DatabaseError.format(error.cause);
      yield* Effect.logError(formatted);
      return Effect.fail(dbError);
    })
  )
);
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

This package includes comprehensive test coverage for:
- Manual cache behavior (TTL, LRU eviction)
- Policy combinators (all, any, permission)
- Upload path encoding/decoding
- Encryption service operations
- PathBuilder functionality

## API Documentation

For detailed API documentation, see [AGENTS.md](./AGENTS.md).

### Key Modules

- **Common** (`src/common.ts`) - Audit columns, makeFields
- **SharedApi** (`src/api/api.ts`) - Top-level HTTP API aggregation with OpenAPI metadata
- **RPC** (`src/rpc/*`) - RPC contracts for files operations, event streaming, and health checks
- **Entity IDs** (`src/entity-ids/*`) - Branded ID schemas, table names
- **Entities** (`src/entities/*`) - Effect models for File, Folder, User, Organization, UploadSession, etc.
- **Policy** (`src/Policy.ts`) - Authorization policies, RPC middleware, auth context
- **ManualCache** (`src/ManualCache.ts`) - TTL+LRU cache
- **Retry** (`src/Retry.ts`) - Exponential backoff policies
- **Paths** (`src/value-objects/paths.ts`) - Type-safe route building
- **EncryptionService** (`src/services/EncryptionService/`) - Crypto operations
- **DatabaseError** (`src/errors/db-error/`) - Structured PostgreSQL error handling with formatting
- **Factories** (`src/factories/`) - DbRepo, error codes, model kits, path builders

## Integration Points

### Apps

-  - Uses `paths` for routing, `Policy` for auth guards
- `apps/server` - Consumes entity models, policies, and retry strategies

### Packages

- `packages/iam/*` - Uses IamEntityIds, Session/User models, auth paths
- `packages/documents/*` - Uses DocumentsEntityIds, File/Folder/UploadSession models, file RPC contracts
- `packages/shared/server` - Builds on entity IDs and models for repos
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
- [@beep/shared-server](../shared/server) - Database, repos, email services
- [@beep/shared-tables](../shared/tables) - Drizzle table definitions

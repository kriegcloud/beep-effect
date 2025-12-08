# @beep/shared-domain

Shared domain logic, entities, and infrastructure primitives for the beep-effect monorepo.

## Overview

`@beep/shared-domain` provides the foundational domain layer consumed across IAM, Documents, and Files slices. It defines branded entity IDs, Effect-based models, authorization policies, caching primitives, retry strategies, encryption services, and typed routing paths that power `apps/web` and `apps/server`.

Built on `@beep/schema` utilities and `@effect/sql/Model`, this package ensures consistent entity definitions, audit tracking, and cross-slice interoperability.

## Features

- **Entity IDs**: Branded type-safe identifiers for all entities (User, Organization, File, etc.)
- **Effect Models**: `@effect/sql/Model.Class` schemas with audit columns and optimistic locking
- **Authorization**: Composable policy system with permission checks and context propagation
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
├── entity-ids/                  # Branded entity ID schemas
│   ├── shared.ts               # SharedEntityIds (User, Organization, etc.)
│   ├── iam.ts                  # IamEntityIds (Account, Member, etc.)
│   ├── documents.ts            # DocumentsEntityIds (File, Upload, etc.)
│   ├── table-names.ts          # Table name literal kits
│   ├── entity-kind.ts          # EntityKind union type
│   └── any-entity-id.ts        # Aggregate entity ID union
├── entities/                    # Effect Model schemas
│   ├── AuditLog/               # Audit log model
│   ├── File/                   # File entity with upload schemas
│   ├── Organization/           # Organization model + enums
│   ├── Session/                # Session model
│   ├── Team/                   # Team model with policies
│   └── User/                   # User model + roles
├── value-objects/
│   ├── paths.ts                # PathBuilder collection of routes
│   └── EntitySource.ts         # Entity source metadata
├── Policy.ts                    # Authorization policies
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
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain";

// Define a model with reusable audit columns
export class DocumentModel extends M.Class<DocumentModel>("DocumentModel")(
  makeFields(SharedEntityIds.FileId, {
    title: S.NonEmptyString,
    organizationId: SharedEntityIds.OrganizationId,
  })
) {}

// Includes: id, _rowId, createdAt, updatedAt, deletedAt,
// createdBy, updatedBy, deletedBy, version, source
```

### Policy System

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

### Upload Path Schema

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { File, SharedEntityIds } from "@beep/shared-domain";
import type { EnvValue } from "@beep/constants";

const uploadPath = Effect.gen(function* () {
  const decoded: File.UploadPathDecoded.Type = {
    env: "dev" as EnvValue.Type,
    fileId: SharedEntityIds.FileId.make("file__12345678-1234-1234-1234-123456789012"),
    organizationType: "individual",
    organizationId: SharedEntityIds.OrganizationId.make(
      "organization__87654321-4321-4321-4321-210987654321"
    ),
    entityKind: "user",
    entityIdentifier: SharedEntityIds.UserId.make("user__87654321-4321-4321-4321-210987654321"),
    entityAttribute: "avatar",
    fileItemExtension: "jpg",
  };

  return yield* S.decode(File.UploadPath)(decoded);
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
import { auditColumns, userTrackingColumns, globalColumns } from "@beep/shared-domain/common";

// Audit columns: createdAt, updatedAt, deletedAt
// User tracking: createdBy, updatedBy, deletedBy
// Global: audit + user tracking + version + source
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
- `test/entities/File/schemas/UploadPath.test.ts` - Upload path encoding
- `test/services/EncryptionService.test.ts` - Encryption operations

## API Documentation

For detailed API documentation, see [AGENTS.md](./AGENTS.md).

### Key Modules

- **Common** (`src/common.ts`) - Audit columns, makeFields
- **Entity IDs** (`src/entity-ids/*`) - Branded ID schemas, table names
- **Entities** (`src/entities/*`) - Effect models for all entities
- **Policy** (`src/Policy.ts`) - Authorization policies and middleware
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

### Adding Entities

1. Create model using `makeFields` helper
2. Place in `src/entities/{EntityName}/`
3. Export from `src/entities/index.ts`
4. Ensure tests cover schema validation

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

# @beep/customization-server

Infrastructure layer for the Customization vertical slice, providing Effect-first database access, repositories, and service implementations for user preferences and theme management.

## Purpose

`@beep/customization-server` implements the infrastructure concerns for the Customization slice. It provides:
- **Database Client**: PostgreSQL client with Drizzle ORM for Customization schema via `@effect/sql-pg`
- **Repository Implementations**: CRUD operations for customization entities using `DbRepo.make`
- **Layer Composition**: Composable Effect Layers for database and repository services
- **Type-Safe Data Access**: Branded identifiers and domain models from `@beep/customization-domain`

This package sits in the infrastructure layer and is consumed by server applications (apps/server). It depends on domain entities from `@beep/customization-domain` and database schemas from `@beep/customization-tables`.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/customization-server": "workspace:*"
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `CustomizationDb` | Namespace | Database client exports for Customization slice |
| `CustomizationDb.Db` | Context.Tag | Database service tag for dependency injection |
| `CustomizationDb.layer` | Layer | Layer providing `Db` service, requires `DbClient.SliceDbRequirements` |
| `CustomizationRepos` | Namespace | Contains all repository services bundled as Effect Layers |
| `CustomizationRepos.layer` | Layer | Merged Layer providing all repository services |
| `UserHotkeyRepo` | Effect.Service | Repository for user hotkey configuration persistence |

## Usage

### Database Client

The `CustomizationDb` namespace provides typed database access with Drizzle ORM:

```typescript
import { CustomizationDb } from "@beep/customization-server";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const db = yield* CustomizationDb.Db;

  // Query using Drizzle query builder
  const result = yield* db.makeQuery((execute) =>
    execute((client) => client.query.userHotkey.findMany())
  );

  return result;
});
```

### Repository Services

Access repositories through the `CustomizationRepos` namespace:

```typescript
import { CustomizationRepos } from "@beep/customization-server";
import * as Effect from "effect/Effect";

const getUserHotkeys = (userId: string) =>
  Effect.gen(function* () {
    const repo = yield* CustomizationRepos.UserHotkeyRepo;
    return yield* repo.findByUserId(userId);
  });
```

### Layer Composition

Compose infrastructure layers for server runtime:

```typescript
import { CustomizationDb, CustomizationRepos } from "@beep/customization-server";
import { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";

// Database layer (requires SliceDbRequirements)
const CustomizationDbLayer = CustomizationDb.layer;

// All repositories (requires Db + SliceDbRequirements)
const CustomizationReposLayer = Layer.provide(
  CustomizationRepos.layer,
  CustomizationDbLayer
);

// Full customization infrastructure
export const CustomizationInfraLayer = Layer.mergeAll(
  CustomizationDbLayer,
  CustomizationReposLayer
);
```

## Effect Patterns

### Import Conventions

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Config from "effect/Config";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
```

## Development

```bash
# Type check
bun run --filter @beep/customization-server check

# Lint
bun run --filter @beep/customization-server lint
bun run --filter @beep/customization-server lint:fix

# Test
bun run --filter @beep/customization-server test

# Circular dependency check
bun run --filter @beep/customization-server lint:circular
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime |
| `@effect/platform` | Platform abstractions for database and file system |
| `@effect/sql` + `@effect/sql-pg` + `@effect/sql-drizzle` | SQL client with PostgreSQL and Drizzle ORM integration |
| `drizzle-orm` | ORM toolkit for type-safe queries |
| `@effect-aws/s3` + `@effect-aws/client-s3` | AWS S3 integration for file storage |
| `@effect/cluster` | Cluster coordination (if using distributed features) |
| `@effect/workflow` | Workflow orchestration for long-running processes |
| `@uswriting/exiftool` | EXIF metadata extraction from images |
| `pdf-lib` | PDF manipulation utilities |
| `@beep/customization-domain` | Domain entities and business logic |
| `@beep/customization-tables` | Drizzle table schemas |
| `@beep/shared-domain` | Shared domain utilities and entity IDs |
| `@beep/shared-server` | Shared infrastructure services (`DbClient`, `DbRepo`) |

## Integration

### Applications

**`apps/server`**: Composes Customization infrastructure layers with other vertical slices in the server runtime. Provides database and repository services to RPC handlers.

### Feature Slices

**Customization Slice** (`packages/customization/*`):
- `@beep/customization-domain` — Provides entity models (`UserHotkey.Model`) for repository construction
- `@beep/customization-tables` — Provides Drizzle schemas for database client instantiation
- `@beep/customization-client` — Consumes repository services through RPC layer
- `@beep/customization-ui` — Displays data retrieved through client services

### Shared Infrastructure

**Shared Server** (`@beep/shared-server`):
- `DbClient.make` — Factory for creating typed database clients
- `DbRepo.make` — Factory for creating repository services
- `DbClient.SliceDbRequirements` — Required Layer dependencies for database access

## Related Packages

| Package | Relationship |
|---------|--------------|
| `@beep/customization-domain` | Consumed (entity models, business logic) |
| `@beep/customization-tables` | Consumed (Drizzle schemas) |
| `@beep/customization-client` | Consumer (through RPC) |
| `@beep/customization-ui` | Indirect consumer (through client) |
| `@beep/shared-server` | Dependency (infrastructure utilities) |
| `@beep/shared-domain` | Dependency (entity IDs, shared types) |

## Notes

### Repository Pattern
- All repositories MUST use `DbRepo.make` from `@beep/shared-server` for consistency
- Repository methods should focus on data access — business logic belongs in domain services
- Use branded entity IDs from `@beep/shared-domain` for type safety

### Layer Composition
- Layer dependency order: `DbClient.SliceDbRequirements` → `CustomizationDb` → `CustomizationRepos`
- The `CustomizationDb.layer` requires `DbClient.SliceDbRequirements` (PostgreSQL connection pool)
- Repository layers automatically compose with database layer

### Effect Patterns
- Use `Effect.gen` for all async operations — avoid bare Promises or async/await
- Route all array/string operations through Effect utilities (`A.*`, `Str.*`)
- Wrap external service calls (S3, email) with Effect adapters and typed error channels

### Testing
- Use `@beep/testkit` for Effect testing utilities
- Integration tests should use Testcontainers for isolated database testing
- Always mock external services (S3, third-party APIs) in unit tests

---
path: packages/customization/server
summary: Server infrastructure for customization slice - Drizzle client, repositories, Effect Layers
tags: [customization, server, repository, effect, drizzle, postgresql, layer]
---

# @beep/customization-server

Server-side infrastructure layer for the customization slice. Provides database client (`CustomizationDb`), repositories, and composable Effect Layers for server runtime integration. All data access flows through typed repository services.

## Architecture

```
|---------------------|     |---------------------|
| SliceDbRequirements | --> |   CustomizationDb   |
|---------------------|     |---------------------|
                                     |
                                     v
|---------------------|     |---------------------|
| Entities.UserHotkey | --> |   UserHotkeyRepo    |
|---------------------|     |---------------------|
                                     |
                                     v
|---------------------|     |---------------------|
| CustomizationRepos  | --> |   Server Runtime    |
|      .layer         |     |   (RPC handlers)    |
|---------------------|     |---------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `CustomizationDb.Db` | Effect Context tag for Drizzle client scoped to customization schema |
| `CustomizationDb.layer` | Layer providing Db service from SliceDbRequirements |
| `UserHotkeyRepo` | Repository service for user hotkey CRUD operations |
| `CustomizationRepos.layer` | Merged Layer providing all repository services |

## Usage Patterns

### Provide Repositories to Server Runtime

```typescript
import * as Layer from "effect/Layer";
import { CustomizationDb, CustomizationRepos } from "@beep/customization-server";

const CustomizationLayer = Layer.provide(
  CustomizationRepos.layer,
  CustomizationDb.layer
);
```

### Query User Hotkeys in RPC Handler

```typescript
import * as Effect from "effect/Effect";
import { UserHotkeyRepo } from "@beep/customization-server";

const getUserHotkeys = (userId: string) =>
  Effect.gen(function* () {
    const repo = yield* UserHotkeyRepo;
    return yield* repo.findByUserId(userId);
  });
```

### Repository with DbRepo Factory

```typescript
import * as Effect from "effect/Effect";
import { DbRepo } from "@beep/shared-domain/factories";
import { CustomizationEntityIds } from "@beep/shared-domain";
import { Entities } from "@beep/customization-domain";
import { CustomizationDb } from "@beep/customization-server/db";

const makeRepo = Effect.gen(function* () {
  yield* CustomizationDb.Db;
  return yield* DbRepo.make(
    CustomizationEntityIds.UserHotkeyId,
    Entities.UserHotkey.Model,
    Effect.succeed({})
  );
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `Effect.Service` for repos | Dependency injection via Layer composition; testable with mock layers |
| `DbRepo.make` factory | Standardized CRUD operations with typed EntityIds and domain models |
| Db -> Repos -> Services | Strict layer ordering prevents circular dependencies |
| Scoped Db layer | Database connection lifecycle managed by Effect runtime |

## Dependencies

**Internal**: `@beep/customization-domain` (Entities), `@beep/customization-tables` (schema), `@beep/shared-server` (DbClient, Repo factories), `@beep/shared-domain` (EntityIds)

**External**: `effect`, `@effect/sql-pg`, `@effect/sql-drizzle`, `drizzle-orm`

## Related

- **AGENTS.md** - Integration testing with Testcontainers, Layer composition patterns
- **@beep/customization-tables** - Schema definitions queried by repositories
- **@beep/customization-domain** - Entity models persisted by repositories

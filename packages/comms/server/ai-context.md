---
path: packages/comms/server
summary: Server infrastructure with database client, repositories, and email template persistence
tags: [comms, server, effect, postgresql, drizzle, repositories]
---

# @beep/comms-server

Server-side infrastructure layer for the communications slice. Provides database client (`CommsDb`), repositories, and composable Layers for integration into the server runtime. Manages email template persistence and communication-specific business logic.

## Architecture

```
|-------------------|     |-------------------|
|      CommsDb      |---->|  EmailTemplateRepo|
|   (Db.layer)      |     |   (DbRepo.make)   |
|-------------------|     |-------------------|
        |                         |
        v                         v
|-------------------|     |-------------------|
|  CommsRepos.layer |---->|   Server Runtime  |
|   (merged repos)  |     |   (RPC handlers)  |
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `Db` | Database client service tag for the comms slice |
| `Db.layer` | Layer providing the database client |
| `CommsRepos` | Namespace containing all comms repositories as Effect Services |
| `CommsRepos.layer` | Merged Layer providing all repository services |
| `EmailTemplateRepo` | Repository for email template entity operations |

## Usage Patterns

### Composing Repository Layer

```typescript
import * as CommsRepos from "@beep/comms-server/db/repositories";
import { Db } from "@beep/comms-server/db";
import * as Layer from "effect/Layer";

const CommsLayer = Layer.provide(
  CommsRepos.layer,
  Db.layer
);
```

### Creating a Repository

```typescript
import * as Effect from "effect/Effect";
import { Entities } from "@beep/comms-domain";
import { CommsDb } from "@beep/comms-server/db";
import { CommsEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import { $CommsServerId } from "@beep/identity/packages";

const $I = $CommsServerId.create("db/repos/email-template.repo");

export class EmailTemplateRepo extends Effect.Service<EmailTemplateRepo>()($I`EmailTemplateRepo`, {
  dependencies: [CommsDb.layer],
  accessors: true,
  effect: Effect.gen(function* () {
    yield* CommsDb.Db;
    return yield* DbRepo.make(
      CommsEntityIds.EmailTemplateId,
      Entities.EmailTemplate.Model,
      Effect.succeed({})
    );
  }),
}) {}
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `DbRepo.make` factories | Typed persistence with domain entity schemas from `@beep/comms-domain` |
| Layer composition order | `Db -> Repos -> Services` ensures dependencies resolve correctly |
| Effect for all async ops | No bare Promises; typed error channels throughout |
| Separate Db.layer | Enables test configuration injection for isolated database testing |

## Dependencies

**Internal**: `@beep/shared-domain` (EntityIds, DbRepo), `@beep/comms-domain`, `@beep/comms-tables`, `@beep/shared-server`

**External**: `effect`, `@effect/platform`, `@effect/sql`, `@effect/sql-drizzle`, `@effect/sql-pg`, `drizzle-orm`

## Related

- **AGENTS.md** - Security guidelines for email validation, rate limiting, PII handling, and WebSocket security

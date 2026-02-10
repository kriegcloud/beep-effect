# @beep/comms-server

Infrastructure layer for the Communications vertical slice, providing Effect-first database access, repositories, and service implementations for messaging and notifications.

## Purpose

`@beep/comms-server` implements the infrastructure concerns for the Communications slice. It provides:
- **Database Client**: PostgreSQL client with Drizzle ORM for Communications schema
- **Repository Implementations**: CRUD operations for messaging entities
- **Service Layer**: Business logic for message delivery and notifications
- **Integration Points**: External communication provider adapters

This package sits in the infrastructure layer and is consumed by applications (`apps/server` and Next.js apps under `apps/*`).

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/comms-server": "workspace:*"
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `CommsDb.Db` | Service Tag | Communications database client service |
| `CommsDb.layer` | Layer | Layer providing CommsDb service |
| `EmailTemplateRepo` | Service | Email template repository with CRUD operations |
| `layer` (from repositories) | Layer | Merged layer providing all repositories |

## Usage

### Database Client

#### Accessing CommsDb

```typescript
import { CommsDb } from "@beep/comms-server/db";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const db = yield* CommsDb.Db;
  const result = yield* db.makeQuery((execute) =>
    execute((client) => client.query.emailTemplate.findMany())
  );
});
```

#### Using Repository Layer

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { CommsDb } from "@beep/comms-server/db";
import { EmailTemplateRepo } from "@beep/comms-server/db/repositories";

const program = Effect.gen(function* () {
  const repo = yield* EmailTemplateRepo;
  const template = yield* repo.findById(templateId);
  return template;
});

const runnable = program.pipe(
  Effect.provide(EmailTemplateRepo.Default),
  Effect.provide(CommsDb.layer)
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
bun run --filter @beep/comms-server check

# Lint
bun run --filter @beep/comms-server lint
bun run --filter @beep/comms-server lint:fix

# Test
bun run --filter @beep/comms-server test

# Circular dependency check
bun run --filter @beep/comms-server lint:circular
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Effect runtime |
| `@effect/platform` | Platform abstractions |
| `@effect/sql` + `@effect/sql-pg` + `@effect/sql-drizzle` | SQL client infrastructure |
| `drizzle-orm` | ORM toolkit |
| `@beep/comms-domain` | Domain entities and business logic |
| `@beep/comms-tables` | Drizzle table schemas |
| `@beep/shared-domain` | Shared domain utilities and entity ID factories |
| `@beep/shared-server` | Database client factory |

## Integration

### Applications

**`apps/server`**: Composes `CommsDb.layer` and repository layers into server runtime for RPC handlers.



### Feature Slices

**Communications** (`packages/comms/*`):
- Uses `DbClient.make` to create `CommsDb` with Communications-specific Drizzle schema
- Leverages `DbRepo.make` from `@beep/shared-server/factories` for email template repositories

## Related Packages

- `@beep/comms-domain` — Entity models and domain logic
- `@beep/comms-tables` — Drizzle table definitions
- `@beep/comms-client` — Client-side services
- `@beep/comms-ui` — UI components
- `@beep/shared-server` — Shared infrastructure services
- `@beep/shared-domain` — Shared entities

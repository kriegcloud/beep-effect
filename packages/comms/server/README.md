# @beep/comms-server

Infrastructure layer for the Communications vertical slice, providing Effect-first database access, repositories, and service implementations for messaging and notifications.

## Purpose

`@beep/comms-server` implements the infrastructure concerns for the Communications slice. It provides:
- **Database Client**: PostgreSQL client with Drizzle ORM for Communications schema
- **Repository Implementations**: CRUD operations for messaging entities
- **Service Layer**: Business logic for message delivery and notifications
- **Integration Points**: External communication provider adapters

This package sits in the infrastructure layer and is consumed by applications (apps/server, apps/web).

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/comms-server": "workspace:*"
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `CommsDb` | Service | Communications database service with messaging schema |

## Usage

### Database

#### Creating the CommsDb Layer

```typescript
import { Db } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as commsSchema from "@beep/comms-tables/schema";

type CommsSchema = typeof commsSchema;
type CommsDb = Db.Shape<CommsSchema>;

export class CommsDb extends Context.Tag("CommsDb")<CommsDb, CommsDb>() {
  static readonly Live: Layer.Layer<CommsDb, never, Db.PgClientServices> = Layer.scoped(
    CommsDb,
    Db.make({ schema: commsSchema })
  );
}
```

#### Using CommsDb

```typescript
import { CommsDb } from "@beep/comms-server";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const db = yield* CommsDb.CommsDb;
  const result = yield* db.makeQuery((execute) =>
    execute((client) => client.query.message.findMany())
  );
});
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

**Peer Dependencies**:
- `effect` — Effect runtime
- `@effect/platform` — Platform abstractions
- `@effect/sql` + `@effect/sql-pg` + `@effect/sql-drizzle` — SQL client
- `drizzle-orm` — ORM toolkit
- Workspace packages: `@beep/schema`, `@beep/shared-domain`, `@beep/shared-server`, `@beep/comms-domain`, `@beep/comms-tables`

## Integration

### Applications

**`apps/server`**: Composes Communications infrastructure layers with other slices in the server runtime.

**`apps/web`**: Uses Communications services for messaging features.

### Feature Slices

**Communications** (`packages/comms/*`):
- Uses `Db.make` to create `CommsDb` with Communications-specific Drizzle schema
- Leverages `Repo.make` for message and channel repositories

## Related Packages

- `@beep/comms-domain` — Entity models and domain logic
- `@beep/comms-tables` — Drizzle table definitions
- `@beep/comms-client` — Client-side services
- `@beep/comms-ui` — UI components
- `@beep/shared-server` — Shared infrastructure services
- `@beep/shared-domain` — Shared entities

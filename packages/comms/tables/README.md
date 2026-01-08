# @beep/comms-tables

Drizzle table definitions for the Communications vertical slice, providing type-safe PostgreSQL schema definitions for messaging, notifications, and communication channels.

## Purpose

Defines multi-tenant Drizzle tables for the Communications slice using factory patterns from `@beep/shared-tables`. Tables integrate with Communications domain entities via Effect SQL Model annotations while maintaining full type safety for database operations.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/comms-tables": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `schema` | Complete Communications schema for Drizzle client |

## Usage

### Import Schema

```typescript
import * as commsSchema from "@beep/comms-tables/schema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Db } from "@beep/shared-server";

// Create CommsDb service with schema
type CommsDb = Db.Shape<typeof commsSchema>;

export class CommsDb extends Context.Tag("CommsDb")<CommsDb, CommsDb>() {
  static readonly Live: Layer.Layer<CommsDb, never, Db.PgClientServices> = Layer.scoped(
    CommsDb,
    Db.make({ schema: commsSchema })
  );
}
```

### Drizzle Queries

```typescript
import * as commsSchema from "@beep/comms-tables/schema";
import * as Effect from "effect/Effect";
import { CommsDb } from "@beep/comms-server";

const findMessages = Effect.gen(function* () {
  const db = yield* CommsDb;
  const result = yield* db.makeQuery((execute) =>
    execute((client) =>
      client.query.message.findMany({
        where: (table, { eq }) => eq(table.channelId, "channel_1"),
      })
    )
  );
  return result;
});
```

## Development

```bash
# Type check
bun run --filter @beep/comms-tables check

# Lint
bun run --filter @beep/comms-tables lint
bun run --filter @beep/comms-tables lint:fix

# Build
bun run --filter @beep/comms-tables build

# Run tests
bun run --filter @beep/comms-tables test

# Check for circular dependencies
bun run --filter @beep/comms-tables lint:circular

# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `drizzle-orm` | ORM toolkit and table definitions |
| `@beep/shared-tables` | Table factory patterns (`Table.make`, `OrgTable.make`) |
| `@beep/shared-domain` | Shared entity models |
| `@beep/comms-domain` | Communications entity models |
| `@beep/schema` | Schema utilities |

## Integration

### Database Migrations

When adding or modifying tables:

1. Update table definitions in `src/`
2. Generate migration: `bun run db:generate`
3. Review migration in `migrations/`
4. Apply migration: `bun run db:migrate`

### Relationship to Other Packages

- `@beep/comms-domain` — Entity models that inform table structure
- `@beep/comms-server` — Consumes schema for database operations
- `@beep/shared-tables` — Provides table factory utilities
- `@beep/db-admin` — Uses schema for migration validation

## Notes

- All tables use multi-tenant patterns via `Table.make` or `OrgTable.make`
- Foreign key relationships follow the domain entity graph
- Use Effect SQL Model annotations for entity mappings

# @beep/customization-tables

Drizzle table definitions for the Customization vertical slice, providing type-safe PostgreSQL schema definitions for user preferences, themes, and customization settings.

## Purpose

Defines multi-tenant Drizzle tables for the Customization slice using factory patterns from `@beep/shared-tables`. Tables integrate with Customization domain entities via Effect SQL Model annotations while maintaining full type safety for database operations.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/customization-tables": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `CustomizationDbSchema` | Namespace containing all tables and relations |
| `userHotkey` | Drizzle table for user keyboard shortcut configurations |
| `userHotkeyRelations` | Drizzle relations for userHotkey table |
| `userRelations` | Extended user relations including hotkeys |
| Re-exports | `organization`, `team`, `user` tables from `@beep/shared-tables` |

## Usage

### Import Schema into Database Client

```typescript
import * as DbSchema from "@beep/customization-tables/schema";
import { DbClient } from "@beep/shared-server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const serviceEffect = DbClient.make({
  schema: DbSchema,
});

export type CustomizationDbShape = DbClient.Shape<typeof DbSchema>;

export class CustomizationDb extends Context.Tag("CustomizationDb")<
  CustomizationDb,
  CustomizationDbShape
>() {}

export const CustomizationDbLive: Layer.Layer<
  CustomizationDb,
  never,
  DbClient.SliceDbRequirements
> = Layer.scoped(CustomizationDb, serviceEffect);
```

### Import Tables Directly

```typescript
import { userHotkey } from "@beep/customization-tables";
import * as Effect from "effect/Effect";

// Access table columns
const columns = {
  id: userHotkey.id,
  userId: userHotkey.userId,
  shortcuts: userHotkey.shortcuts,
  createdAt: userHotkey.createdAt,
  updatedAt: userHotkey.updatedAt,
};
```

### Query with Relations

```typescript
import { CustomizationDb } from "@beep/customization-server/db";
import type { SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const findUserHotkeys = (userId: SharedEntityIds.UserId.Type) =>
  Effect.gen(function* () {
    const db = yield* CustomizationDb.Db;
    const result = yield* db.makeQuery((execute) =>
      execute((client) =>
        client.query.userHotkey.findMany({
          where: (table, { eq }) => eq(table.userId, userId),
          with: {
            user: true,
          },
        })
      )
    );
    return result;
  });
```

## Development

```bash
# Type check
bun run --filter @beep/customization-tables check

# Lint
bun run --filter @beep/customization-tables lint
bun run --filter @beep/customization-tables lint:fix

# Build
bun run --filter @beep/customization-tables build

# Run tests
bun run --filter @beep/customization-tables test

# Check for circular dependencies
bun run --filter @beep/customization-tables lint:circular

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
| `@beep/shared-domain` | Shared entity ID types |
| `@beep/customization-domain` | Customization entity models |

## Integration

### Database Migrations

When adding or modifying tables:

1. Update table definitions in `src/`
2. Generate migration: `bun run db:generate`
3. Review migration in `migrations/`
4. Apply migration: `bun run db:migrate`

### Relationship to Other Packages

- `@beep/customization-domain` — Entity models that inform table structure
- `@beep/customization-server` — Consumes schema for database operations
- `@beep/shared-tables` — Provides table factory utilities
- `@beep/db-admin` — Uses schema for migration validation

## Notes

- All tables use multi-tenant patterns via `Table.make` or `OrgTable.make`
- Foreign key relationships follow the domain entity graph
- Use Effect SQL Model annotations for entity mappings

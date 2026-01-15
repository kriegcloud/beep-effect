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
| `CommsDbSchema` | Namespace re-exporting all Communications table definitions and relations |
| `CommsDbSchema.emailTemplate` | Email template table with support for to/cc/bcc recipients, subject, and body |
| `CommsDbSchema.emailTemplateRelations` | Drizzle relation definitions connecting email templates to users and organizations |

## Schema Overview

### Email Template Table

The `emailTemplate` table stores reusable email templates with support for:
- **Multi-tenant isolation**: Uses `OrgTable.make` for automatic `organizationId` foreign key
- **User ownership**: Foreign key to `SharedDbSchema.user`
- **Recipients**: JSONB columns for `to`, `cc`, `bcc` arrays
- **Content**: Text columns for `subject` and `body`
- **Audit fields**: Automatic `id`, `createdAt`, `updatedAt` via `OrgTable.make` factory

**Indexes**:
- `idx_email_template_user_id` on `userId`
- `idx_org_id` on `organizationId`
- Unique constraint on `(organizationId, userId, name)` to prevent duplicate template names per user

## Usage

### Import Schema

```typescript
import { CommsDbSchema } from "@beep/comms-tables";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import { Db } from "@beep/shared-server";

// Create CommsDb service with schema
type CommsDb = Db.Shape<typeof CommsDbSchema>;

export class CommsDb extends Context.Tag("CommsDb")<CommsDb, CommsDb>() {
  static readonly Live: Layer.Layer<CommsDb, never, Db.PgClientServices> = Layer.scoped(
    CommsDb,
    Db.make({ schema: CommsDbSchema })
  );
}
```

### Drizzle Queries

```typescript
import { CommsDbSchema } from "@beep/comms-tables";
import * as Effect from "effect/Effect";
import { CommsDb } from "@beep/comms-server";

const findEmailTemplates = Effect.gen(function* () {
  const db = yield* CommsDb;
  const result = yield* db.makeQuery((execute) =>
    execute((client) =>
      client.query.emailTemplate.findMany({
        where: (table, { eq }) => eq(table.userId, 123),
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
| `@beep/shared-tables` | Table factory patterns (`Table.make`, `OrgTable.make`) and shared table schemas |
| `@beep/shared-domain` | Shared entity ID types for foreign key references |
| `@beep/comms-domain` | Communications domain entity models (EmailTemplate) |

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

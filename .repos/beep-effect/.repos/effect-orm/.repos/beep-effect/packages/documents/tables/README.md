# @beep/documents-tables

Drizzle schema package for the documents slice. Houses PostgreSQL table definitions and relations that back `@beep/documents-server` repositories and power the document management system.

## Purpose

Provides type-safe Drizzle table schemas for the documents feature slice, bridging domain models from `@beep/documents-domain` to PostgreSQL storage. All tables follow multi-tenant patterns from `@beep/shared-tables` and integrate with Effect-based repositories in `@beep/documents-server`.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/documents-tables": "workspace:*"
```

## Tables

The package currently implements schemas for document management:

| Table | Description |
|-------|-------------|
| `document` | Core document table with rich content, YJS snapshots, and full-text search |
| `documentVersion` | Version history tracking for documents |
| `documentFile` | File attachment metadata linked to documents |
| `discussion` | Discussion threads attached to documents |
| `comment` | Individual comments within discussion threads |

**Note**: Knowledge base tables (`knowledgeSpace`, `knowledgePage`, `knowledgeBlock`, `pageLink`) exist as domain models in `@beep/documents-domain` but are not yet implemented at the schema layer.

## Schema Features

- **Multi-tenant**: All tables use `OrgTable.make` from `@beep/shared-tables` for automatic organization scoping
- **Type-safe IDs**: Branded entity IDs from `@beep/shared-domain` ensure compile-time safety
- **Domain alignment**: Enums generated from `@beep/documents-domain` value objects via `BS.toPgEnum`
- **Relations**: Comprehensive Drizzle relations for type-safe joins and eager loading
- **Indexing**: Strategic indexes for performance (full-text search, foreign keys, status queries)

## Key Exports

| Export | Description |
|--------|-------------|
| `DocumentsDbSchema` | Namespace export containing all tables and relations |
| `document` | Core document table schema |
| `documentVersion` | Document version history table |
| `documentFile` | File attachment table |
| `discussion` | Discussion thread table |
| `comment` | Comment table |
| `documentRelations` | Document table relations |
| `documentVersionRelations` | Version table relations |
| `documentFileRelations` | File table relations |
| `discussionRelations` | Discussion table relations |
| `commentRelations` | Comment table relations |
| `textStylePgEnum` | PostgreSQL enum for text styling options |

## Architecture

### Table Factory Pattern
All tables use shared factories from `@beep/shared-tables`:

```typescript
import { OrgTable, user } from "@beep/shared-tables";
import type { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as pg from "drizzle-orm/pg-core";

export const document = OrgTable.make(DocumentsEntityIds.DocumentId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    title: pg.text("title"),
    content: pg.text("content"),
    // ... additional columns
  },
  (t) => [
    pg.index("document_user_idx").on(t.userId),
    pg.index("document_is_published_idx").on(t.isPublished),
    // ... additional indexes
  ]
);
```

This ensures:
- Automatic `id`, `organizationId`, `createdAt`, `updatedAt` columns
- Consistent naming conventions (snake_case for DB, camelCase for TypeScript)
- Built-in audit trail support
- Type-safe branded IDs via `.$type<>()` assertions

### Domain-Driven Enums

Enums are generated from domain value objects, not hardcoded:

```typescript
import { TextStyle } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";

export const textStylePgEnum = BS.toPgEnum(TextStyle)("text_style_enum");
```

This ensures that database enums stay synchronized with domain models and prevents schema drift.

### Relations Structure

Comprehensive bidirectional relations defined in `src/relations.ts`:
- Document hierarchies (parent/child documents via `parentDocumentId`)
- Document versioning (document → versions)
- Discussion threads (document → discussions → comments)
- File attachments (document → files)
- User ownership and authorship tracking
- Organization/team scoping (all tables reference `organizationId`)

## Usage

### In Infrastructure Layer

```typescript
import * as Effect from "effect/Effect";
import { DocumentsDbSchema } from "@beep/documents-tables";

// Access tables and relations
const { document, documentVersion, discussion } = DocumentsDbSchema;

// Use in repository implementations with Drizzle
const getDocumentById = (id: string) =>
  Effect.gen(function* () {
    const db = yield* DocumentsDb;
    const result = yield* db.query.document.findFirst({
      where: (doc, { eq }) => eq(doc.id, id),
      with: {
        versions: true,
        discussions: {
          with: {
            comments: true,
          },
        },
      },
    });
    return result;
  });
```

### Direct Table Access

```typescript
// You can also import individual tables directly
import { document, documentVersion } from "@beep/documents-tables/schema";
import { drizzle } from "drizzle-orm/postgres-js";

// However, the preferred pattern is to use the namespace export
const db = drizzle(client, { schema: DocumentsDbSchema });
```

### In Migrations

```typescript
// Schema changes generate migrations in packages/_internal/db-admin
import { document, documentRelations } from "@beep/documents-tables";
```

## Development

### Local Commands

```bash
# Type check
bun run --filter @beep/documents-tables check

# Lint
bun run --filter @beep/documents-tables lint

# Auto-fix lint issues
bun run --filter @beep/documents-tables lint:fix

# Run tests
bun run --filter @beep/documents-tables test

# Check for circular dependencies
bun run --filter @beep/documents-tables lint:circular
```

### Schema Workflow

```bash
# 1. Edit table definitions in src/tables/
# 2. Update relations in src/relations.ts
# 3. Update type checks in src/_check.ts

# 4. Generate Drizzle types (from repo root)
bun run db:generate

# 5. Create and apply migrations
bun run db:migrate

# 6. Verify changes
bun run --filter @beep/documents-tables check
```

## Principles

### Schema Design

- Use shared factories (`Table.make`, `OrgTable.make`) for consistency
- Align columns with `@beep/documents-domain` entities and value objects
- Generate enums through domain kits (`BS.toPgEnum`), not raw strings
- Maintain type checks in `_check.ts` to assert Drizzle models match domain schemas
- Keep exports centralized via `src/schema.ts` and `src/index.ts`

### Performance Considerations

- Strategic indexes on foreign keys, status fields, and query patterns
- Full-text search GIN indexes on document content (weighted: title > content)
- Composite indexes for common query patterns (e.g., `userId + templateId`)
- Cascade delete policies for referential integrity

### Type Safety

- All entity IDs use branded types from `@beep/shared-domain`
- `.$type<>()` assertions ensure compile-time type safety
- `_check.ts` file verifies Drizzle inference matches domain models
- No `any` types or unchecked casts

## Dependencies

| Package | Purpose |
|---------|---------|
| `drizzle-orm` | Schema builder and type inference |
| `@beep/shared-tables` | Shared table factories (`OrgTable.make`, `user`, `organization`, `team`) |
| `@beep/shared-domain` | Entity ID definitions (`DocumentsEntityIds`, `SharedEntityIds`) |
| `@beep/documents-domain` | Value objects and domain enums (`TextStyle`) |
| `@beep/schema` | Effect Schema utilities (`BS.toPgEnum`, field helpers) |
| `@beep/utils` | Pure runtime helpers |
| `@beep/invariant` | Assertion contracts |
| `@beep/identity` | Package identity |

## Integration

This package connects with other packages in the monorepo:

- **Consumed by**: `@beep/documents-server` (repositories, database adapters)
- **Depends on**: `@beep/documents-domain` (entity models), `@beep/shared-tables` (table factories)
- **Migration target**: `packages/_internal/db-admin` (Drizzle CLI, migration warehouse)

## Notes

- This package is schema-only (no runtime config or `process.env` access)
- Table changes require coordinated migration work in `packages/_internal/db-admin`
- Consumed by `@beep/documents-server` repositories via the `DocumentsDb` service
- See `AGENTS.md` in this package for detailed authoring guardrails
- Knowledge base tables are roadmapped but not yet implemented at the schema layer

# @beep/documents-tables

Drizzle schema package for the documents slice. Houses PostgreSQL table definitions and relations that back `@beep/documents-infra` repositories and power the knowledge management and document editing system.

## Contents

### Core Tables
- **Document Management**
  - `document` — Core document table with rich content, YJS snapshots, and full-text search support
  - `documentVersion` — Version history tracking for documents
  - `documentFile` — File attachment metadata for documents
  - `discussion` — Discussion threads on documents
  - `comment` — Comments within discussions

### Knowledge Base
- **Knowledge Spaces**
  - `knowledgeSpace` — Organization/team-scoped knowledge base containers with encryption support
  - `knowledgePage` — Pages within knowledge spaces with hierarchical structure
  - `knowledgeBlock` — Content blocks within pages (BlockNote-compatible, encrypted)
  - `pageLink` — Bidirectional page-to-page and block-to-page relationships

### Schema Features
- **Multi-tenant**: All tables use `OrgTable.make` from `@beep/shared-tables` for automatic organization scoping
- **Type-safe IDs**: Branded entity IDs from `@beep/shared-domain` ensure compile-time safety
- **Domain alignment**: Enums generated from `@beep/documents-domain` value objects via `BS.toPgEnum`
- **Relations**: Comprehensive Drizzle relations for type-safe joins and eager loading
- **Indexing**: Strategic indexes for performance (full-text search, foreign keys, status queries)

### Key Exports
- `DocumentsDbSchema` namespace (via `src/index.ts`) — Complete schema for infra layer consumption
- **Tables**: `document`, `documentVersion`, `documentFile`, `discussion`, `comment`, `knowledgeSpace`, `knowledgePage`, `knowledgeBlock`, `pageLink`
- **Relations**: `documentRelations`, `knowledgeSpaceRelations`, `knowledgePageRelations`, `knowledgeBlockRelations`, `pageLinkRelations`, etc.
- **Enums**: `textStylePgEnum`, `blockTypePgEnum` (generated from `@beep/documents-domain/value-objects`)

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
import { TextStyle, BlockType } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";

export const textStylePgEnum = BS.toPgEnum(TextStyle)("text_style_enum");
export const blockTypePgEnum = BS.toPgEnum(BlockType)("block_type_enum");
```

This ensures that database enums stay synchronized with domain models and prevents schema drift.

### Relations Structure
Comprehensive bidirectional relations defined in `src/relations.ts`:
- Document hierarchies (parent/child documents)
- Knowledge space containment (spaces → pages → blocks)
- Page linking (bidirectional page references)
- User ownership and authorship tracking
- Organization/team scoping

## Usage

### In Infrastructure Layer
```typescript
// Import the schema namespace
import { DocumentsDbSchema } from "@beep/documents-tables";

// Access tables and relations
const { document, knowledgePage, knowledgeBlock } = DocumentsDbSchema;

// Use in repository implementations
const repo = makeRepo({
  table: document,
  schema: DocumentsDbSchema
});
```

### Alternative Import (Direct Schema Import)
```typescript
// Import schema directly for Drizzle client initialization
import * as DocumentsDbSchema from "@beep/documents-tables/schema";

// Use in db client construction
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
bun run check --filter @beep/documents-tables   # Type check
bun run lint --filter @beep/documents-tables    # Biome lint
bun run test --filter @beep/documents-tables    # Run tests
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
```

## Principles

### Schema Design
- Use shared factories (`Table.make`, `OrgTable.make`) for consistency
- Align columns with `@beep/documents-domain` entities and value objects
- Generate enums through domain kits, not raw strings
- Maintain type checks in `_check.ts` to assert Drizzle models match domain schemas
- Keep exports centralized via `src/schema.ts` and `src/index.ts`

### Performance Considerations
- Strategic indexes on foreign keys, status fields, and query patterns
- Full-text search GIN indexes on document content (weighted: title > content)
- Composite indexes for common query patterns (e.g., `space_id + slug`)
- Fractional indexing for block ordering (text type for flexibility)

### Security & Privacy
- Encrypted content storage in `knowledgeBlock.encryptedContent`
- Content integrity via SHA256 hashes in `knowledgeBlock.contentHash`
- Encryption key management in `knowledgeSpace.encryptionKeyId`
- Cascade delete policies for data cleanup

## Notes

- This package is schema-only (no runtime config or `process.env` access)
- Table changes require coordinated migration work in `packages/_internal/db-admin`
- Consumed by `@beep/documents-infra` repositories via the `DocumentsDb` service
- See `packages/documents/tables/AGENTS.md` for detailed authoring guardrails

## Dependencies

### Core
- `drizzle-orm` — Schema builder and type inference
- `@beep/shared-tables` — Shared table factories and utilities
- `@beep/shared-domain` — Entity ID definitions
- `@beep/documents-domain` — Value objects and domain enums
- `@beep/schema` — Effect Schema utilities (enum conversion)

## Next Steps

- Maintain `_check.ts` coverage as schemas evolve
- Document any breaking schema changes in migration notes
- Consider partitioning strategies for high-volume tables
- Add table-level comments for complex relationships

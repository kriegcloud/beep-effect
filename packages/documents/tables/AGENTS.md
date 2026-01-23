# AGENTS.md — `@beep/documents-tables`

## Purpose & Fit
- Define Drizzle tables and relations for the documents slice, exposing a schema namespace (`DocumentsDbSchema`) consumed by `@beep/documents-server` and shared runtimes.
- Bridge `@beep/documents-domain` entities to PostgreSQL storage while honoring shared multi-tenant defaults from `@beep/shared-tables`.
- Provide type-safe database schema definitions for the knowledge management and document editing system.

## Surface Map
- **Table Definitions (`src/tables/`)** — Drizzle table schemas for all document entities:
  - `comment.table.ts` — Comment storage schema.
  - `discussion.table.ts` — Discussion thread schema.
  - `document.table.ts` — Core document table with versioning support.
  - `documentFile.table.ts` — File attachment metadata.
  - `documentVersion.table.ts` — Version history tracking.
- **Relations (`src/relations.ts`)** — Drizzle relations defining foreign key relationships between tables.
- **Schema Export (`src/schema.ts`)** — Central export point for all tables and relations.
- **Type Checks (`src/_check.ts`)** — Assertions ensuring Drizzle inferred types match domain models.

## Authoring Guardrails
- Use shared factories (`Table.make`, `OrgTable.make`) from `@beep/shared-tables` instead of ad-hoc definitions; they embed naming, cascade, and auditing conventions.
- Align column types with domain schemas and `@beep/shared-domain` entity IDs (e.g., `DocumentsEntityIds.DocumentId`, `DocumentsEntityIds.CommentId`, `DocumentsEntityIds.DiscussionId`).
- Generate enums through domain kits rather than raw strings.
- Update `_check.ts` file whenever schemas change to assert Drizzle `Infer*Model` shapes match domain models.
- Keep exports centralized via `src/schema.ts` and `src/index.ts` so server layers can import `DocumentsDbSchema` without reaching into `tables/`.
- NEVER use direct `process.env` access or runtime config—this package MUST remain pure schema.
- Observe repository-wide Effect guardrails when adding helper code (namespace imports, no native array/string/object helpers).

## Usage Patterns
- Tables are consumed by `@beep/documents-server` repos via the `DocumentsDb` service.
- Migrations are generated in `packages/_internal/db-admin` from these schema definitions.
- Type checks ensure compatibility between Drizzle models and Effect Schema domain models.

## Verifications
- `bun run check --filter=@beep/documents-tables`
- `bun run lint --filter=@beep/documents-tables`
- `bun run test --filter=@beep/documents-tables` (add coverage as schemas grow).
- Root `bun run db:generate` after schema edits to refresh generated types.
- Root `bun run db:migrate` to apply schema changes to development database.

## Gotchas

### Drizzle ORM Pitfalls
- **JSONB column type inference**: Drizzle infers `jsonb` columns as `unknown`. Use `.$type<T>()` to specify the expected shape, but note this is a compile-time assertion only—runtime validation requires separate schema parsing.
- **Binary data with `bytea`**: The custom `bytea` column from `@beep/shared-tables` returns `Uint8Array`. When serializing for API responses, convert to Base64 using `byteaBase64` or manual encoding.
- **Text search columns**: PostgreSQL `tsvector` columns for full-text search are not natively supported by Drizzle. Use raw SQL in migrations and `sql` template literals in queries.

### Migration Ordering
- **Document versioning tables**: `documentVersion` depends on `document`. Ensure the base table migration runs before version tracking tables are created.
- **Index creation on large tables**: Creating indexes on `document` or `documentVersion` tables with existing data can lock the table. Use `CONCURRENTLY` in manual migrations for production deployments.

### Relation Definition Gotchas
- **Polymorphic relations not supported**: Documents may attach to multiple entity types (projects, tasks). Drizzle does not support polymorphic foreign keys—use separate nullable columns or a discriminator pattern.
- **Cascade delete propagation**: Deleting a `discussion` cascades to its `comment` rows. Ensure domain logic accounts for this chain—repositories should not re-fetch deleted children.
- **Relation loading depth**: Drizzle `with` queries do not limit depth. Deeply nested document structures with multiple relations can cause performance issues. Use explicit `columns` selection to limit fetched data.

### Integration with Domain Entities
- **Version numbering**: `documentVersion.version` should be monotonically increasing per document. The domain layer must enforce this—the table only stores the value without sequence constraints.
- **Content snapshots**: Binary snapshots in `document.content` may be Yjs CRDT data or Lexical JSON. The table schema does not distinguish—domain schemas must handle both formats.
- **Soft delete vs hard delete**: The `deletedAt` column pattern conflicts with `OrgTable` cascade deletes. Decide per-table whether soft delete is needed and document the choice in table comments.

## Contributor Checklist
- [ ] Tables created with shared factories and domain-aligned enums/IDs.
- [ ] Relations documented and exported via `src/schema.ts`.
- [ ] `_check.ts` updated for any schema additions/renames.
- [ ] Downstream migrations prepared in `packages/_internal/db-admin`.
- [ ] Lint/check/test and `db:generate` executed locally.
- [ ] Verified type compatibility between Drizzle models and domain schemas.

# AGENTS.md — `@beep/documents-tables`

## Purpose & Fit
- Define Drizzle tables and relations for the documents slice, exposing a schema namespace (`DocumentsDbSchema`) consumed by `@beep/documents-infra` and shared runtimes.
- Bridge `@beep/documents-domain` entities to PostgreSQL storage while honoring shared multi-tenant defaults from `@beep/shared-tables`.
- Provide type-safe database schema definitions for the knowledge management and document editing system.

## Surface Map
- **Table Definitions (`src/tables/`)** — Drizzle table schemas for all document entities:
  - `comment.table.ts` — Comment storage schema.
  - `discussion.table.ts` — Discussion thread schema.
  - `document.table.ts` — Core document table with versioning support.
  - `documentFile.table.ts` — File attachment metadata.
  - `documentVersion.table.ts` — Version history tracking.
  - `knowledgeBlock.table.ts` — Content blocks within pages.
  - `knowledgePage.table.ts` — Knowledge base pages.
  - `knowledgeSpace.table.ts` — Knowledge space containers.
  - `pageLink.table.ts` — Page-to-page relationships.
- **Relations (`src/relations.ts`)** — Drizzle relations defining foreign key relationships between tables.
- **Schema Export (`src/schema.ts`)** — Central export point for all tables and relations.
- **Type Checks (`src/_check.ts`)** — Assertions ensuring Drizzle inferred types match domain models.

## Authoring Guardrails
- Use shared factories (`Table.make`, `OrgTable.make`, `RelationBuilder`) from `@beep/shared-tables` instead of ad-hoc definitions; they embed naming, cascade, and auditing conventions.
- Align column types with domain schemas and `@beep/shared-domain` entity IDs (e.g., `SharedEntityIds.DocumentId`, `SharedEntityIds.KnowledgePageId`).
- Generate enums through domain kits rather than raw strings.
- Update `_check.ts` file whenever schemas change to assert Drizzle `Infer*Model` shapes match domain models.
- Keep exports centralized via `src/schema.ts` and `src/index.ts` so infra layers can import `DocumentsDbSchema` without reaching into `tables/`.
- Avoid direct `process.env` access or runtime config—this package should remain pure schema.
- Observe repository-wide Effect guardrails when adding helper code (namespace imports, no native array/string/object helpers).

## Usage Patterns
- Tables are consumed by `@beep/documents-infra` repos via the `DocumentsDb` service.
- Migrations are generated in `packages/_internal/db-admin` from these schema definitions.
- Type checks ensure compatibility between Drizzle models and Effect Schema domain models.

## Verifications
- `bun run check --filter=@beep/documents-tables`
- `bun run lint --filter=@beep/documents-tables`
- `bun run test --filter=@beep/documents-tables` (add coverage as schemas grow).
- Root `bun run db:generate` after schema edits to refresh generated types.
- Root `bun run db:migrate` to apply schema changes to development database.

## Contributor Checklist
- [ ] Tables created with shared factories and domain-aligned enums/IDs.
- [ ] Relations documented and exported via `src/schema.ts`.
- [ ] `_check.ts` updated for any schema additions/renames.
- [ ] Downstream migrations prepared in `packages/_internal/db-admin`.
- [ ] Lint/check/test and `db:generate` executed locally.
- [ ] Verified type compatibility between Drizzle models and domain schemas.

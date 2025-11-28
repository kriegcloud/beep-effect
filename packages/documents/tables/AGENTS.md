# AGENTS — `@beep/documents-tables`

## Purpose & Fit
- Define Drizzle tables and relations for the documents slice, exposing a schema namespace (`DocumentsDbSchema`) consumed by `@beep/documents-infra` and shared runtimes.
- Bridge `@beep/documents-domain` entities/value objects to storage while honoring shared multi-tenant defaults from `@beep/shared-tables`.

## Authoring Guardrails
- Use shared factories (`Table.make`, `OrgTable.make`, `RelationBuilder`) from `@beep/shared-tables` instead of ad-hoc definitions; they embed naming, cascade, and auditing conventions.
- Align column types with domain schemas and `@beep/shared-domain` entity IDs (e.g., `FilesEntityIds.FileId`); generate enums through domain kits rather than raw strings.
- Add a `_check.ts` file mirroring IAM/tables patterns to assert Drizzle `Infer*Model` shapes match domain models; update it whenever schemas change.
- Keep exports centralized via `src/schema.ts` and `src/index.ts` so infra layers can import `DocumentsDbSchema` without reaching into `tables/`.
- Avoid direct `process.env` access or runtime config—this package should remain pure schema.
- Observe repository-wide Effect guardrails when adding helper code (namespace imports, no native array/string/object helpers).

## Suggested Structure
- `src/tables/*.table.ts` grouped by resource (files, versions, chunks, storage locations, upload tokens).
- `src/relations.ts` defining relations per resource family.
- `src/_check.ts` ensuring Drizzle models match domain encoders/decoders.

## Verifications
- `bun run check --filter=@beep/documents-tables`
- `bun run lint --filter=@beep/documents-tables`
- `bun run test --filter=@beep/documents-tables` (add coverage as schemas arrive).
- Root `bun run db:generate` after schema edits to refresh generated types.

## Contributor Checklist
- [ ] Tables created with shared factories and domain-aligned enums/IDs.
- [ ] Relations documented and exported via `src/schema.ts`.
- [ ] `_check.ts` updated for any schema additions/renames.
- [ ] Downstream migrations prepared in `packages/_internal/db-admin`.
- [ ] Lint/check/test (and `db:generate`) executed locally.

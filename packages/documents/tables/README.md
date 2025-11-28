# @beep/documents-tables

Drizzle schema package for the documents slice. Houses Postgres table builders and relations that back `@beep/documents-infra` repositories and downstream runtime layers.

## Status
- Currently a placeholder with empty schema files. Use this package to define tables before wiring infra changes.

## Principles
- Build tables with shared factories from `@beep/shared-tables` (e.g., `Table.make`, `OrgTable.make`) to stay consistent with multi-tenant defaults.
- Align columns and enums with `@beep/documents-domain` entities/value objects; add compile-time `_check` coverage when schemas grow.
- Keep exports aggregated via `src/schema.ts` and `src/index.ts` so consumers import the `DocumentsDbSchema` namespace.

## Development
- `bun run check --filter=@beep/documents-tables`
- `bun run lint --filter=@beep/documents-tables`
- `bun run test --filter=@beep/documents-tables`

## Next Steps
- Add initial tables (e.g., `file`, `fileVersion`, `uploadToken`, `storageLocation`) and relations mirroring domain models.
- Coordinate SQL migrations in `packages/_internal/db-admin` when schema work begins.
- Document schema shape and checks in `packages/documents/tables/AGENTS.md`.

# AGENTS — `@beep/shared-tables`

## Purpose & Fit
- Provides cross-slice Drizzle table factories and canonical organization-aware tables consumed by IAM, Files, and runtime adapters.
- Guarantees every table includes audit, user tracking, optimistic lock, and source metadata columns through `globalColumns`.
- Couples with `@beep/shared-domain` entity schemas so Drizzle types align with Effect models (`src/_check.ts` enforces parity).
- Serves as the entry point for shared Postgres enums (e.g., organization subscription tiers) and table re-exports under `SharedDbSchema`.

## Surface Map
- `Table.make` (`src/Table/Table.ts`) — builds a pg table with default id/audit columns using an `EntityIdSchemaInstance`.
- `OrgTable.make` (`src/OrgTable/OrgTable.ts`) — extends `Table.make` with `organizationId` foreign key wiring to `organization.id`.
- `Common` namespace (`src/common.ts`): `globalColumns`, `auditColumns`, `userTrackingColumns`, `utcNow` helper.
- `Columns` types (`src/Columns.ts`) — structural types describing the default column builders.
- Custom columns (`src/columns/index.ts`): `bytea` (Uint8Array), `byteaBase64` (Base64 string interface for binary data).
- `SharedDbSchema` namespace (`src/tables/index.ts`) — re-exports concrete tables: `organization`, `team`, `user`, `file`, `session`.
- `schema.ts` — re-exports all tables for convenience import (`@beep/shared-tables/schema`).
- `_check.ts` — compile-time assertions that Drizzle `Infer*Model` matches domain codecs.
- Package scripts (`package.json`) — build, lint, type, and test orchestration wired to Bun/TS.

## Usage Snapshots
- `packages/shared/tables/src/tables/session.table.ts:10` uses `Table.make(SharedEntityIds.SessionId)` to define session storage with shared audit columns and org/team references.
- `packages/iam/tables/src/tables/member.table.ts:9` calls `OrgTable.make(IamEntityIds.MemberId)` so memberships inherit `organizationId` cascade semantics.
- `packages/iam/tables/src/relations.ts` imports `@beep/shared-tables/schema` to compose Drizzle relations against the shared `organization`, `team`, and `user` tables.
- `packages/shared/tables/src/_check.ts` enforces Drizzle `organization`, `team`, and `session` definitions stay in lock-step with `@beep/shared-domain/entities`.
- `packages/shared/tables/src/tables/file.table.ts:16` demonstrates `OrgTable.make(SharedEntityIds.FileId)` for multi-tenant file metadata with organization relations.
- `packages/documents/tables/src/tables/document.table.ts` imports `bytea` custom column type for storing binary snapshots efficiently.

## Authoring Guardrails
- ALWAYS import Effect modules via namespaces (`import * as F from "effect/Function";`) and NEVER use native array/string/object APIs; rely on `effect/Array`, `effect/String`, `effect/Record`, and friends.
- `Table.make` expects an `EntityId.EntityId.SchemaInstance`; ALWAYS create or update the matching entity id in `@beep/shared-domain` before adding a table.
- `OrgTable.make` hard-wires a cascade foreign key to `organization.id`. If you need different cascade behavior, document it explicitly and adjust downstream relations (`packages/iam/tables/src/relations.ts:1`).
- Keep `globalColumns` in sync with `@beep/shared-domain/src/common.ts`; changes require coordinated updates to domain schema helpers and any ingestion/export logic.
- NEVER bypass `_check.ts`; ALWAYS extend it whenever new shared tables should align with domain codecs to catch drift at build time.
- Guard enums with domain factories (`Organization.makeSubscriptionTierPgEnum`) so Postgres enum names stay canonical.
- Prefer Drizzle index helpers rather than raw SQL, except when expressing computed checks (see session expiry at `packages/iam/tables/src/tables/session.table.ts:22`).

## Quick Recipes

### Define a new shared table
```ts
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables/Table";
import * as pg from "drizzle-orm/pg-core";

export const webhook = Table.make(SharedEntityIds.WebhookId)(
  {
    targetUrl: pg.text("target_url").notNull(),
    isActive: pg.boolean("is_active").notNull().default(true),
  },
  (t) => [
    pg.index("webhook_target_idx").on(t.targetUrl),
  ]
);
```

### Extend OrgTable with tenant indices
```ts
import { SharedEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables/OrgTable";
import * as pg from "drizzle-orm/pg-core";

export const document = OrgTable.make(SharedEntityIds.DocumentId)(
  {
    title: pg.text("title").notNull(),
    ownerUserId: pg.text("owner_user_id").notNull(),
  },
  (t) => [
    pg.uniqueIndex("document_org_title_idx").on(t.organizationId, t.title),
    pg.index("document_owner_idx").on(t.ownerUserId),
  ]
);
```

### Pipe Effect utilities when iterating metadata
```ts
import * as A from "effect/Array";
import * as F from "effect/Function";

type IndexDescriptor = { readonly kind: "index"; readonly name: string };

const indexNames = (descriptors: ReadonlyArray<IndexDescriptor>) =>
  F.pipe(
    descriptors,
    A.filter((descriptor) => descriptor.kind === "index"),
    A.map((descriptor) => descriptor.name)
  );
```

## Verifications
- `bun run lint` (Biome) — ensures formatting and lint rules for shared tables.
- `bun run check` — workspace type build, catches `_check.ts` mismatches.
- `bun run build` — compiles ESM/CJS artifacts used by consumers.
- `bun run test` or `bun run coverage` — Bun test harness (currently placeholder; expand when table behavior gains tests).
- `bun run db:generate` (root) — regenerate Drizzle types when schemas change; confirm migrations remain consistent.

## Gotchas

### Table Factory Pitfalls
- **`Table.make` requires `EntityIdSchemaInstance`**: The factory expects a schema instance from `@beep/shared-domain`, not a raw type. Forgetting to create the entity ID first causes cryptic TypeScript errors about missing properties.
- **`OrgTable.make` cascade behavior**: The automatic `organizationId` foreign key uses `onDelete: 'cascade'` by default. This means deleting an organization removes all related rows—ensure this is intentional for each table.
- **`globalColumns` modification ripple effect**: Changing `globalColumns` in `common.ts` affects every table in the monorepo. Coordinate changes with all slice maintainers and update domain schemas simultaneously.

### Drizzle ORM Pitfalls
- **Column naming conventions**: `Table.make` uses snake_case for database columns but camelCase for TypeScript properties. Custom columns added via the factory must follow this convention—use `pg.text("my_column")`, not `pg.text("myColumn")`.
- **Default value evaluation**: PostgreSQL evaluates defaults at insert time, but Drizzle evaluates JavaScript defaults at query-build time. Use `$defaultFn(() => new Date())` for runtime defaults, not `default: new Date()`.
- **Index name collisions**: Index names must be unique across the entire database, not just per-table. Prefix index names with the table name (e.g., `user_email_idx`) to avoid collisions.

### Migration Ordering
- **Shared tables must migrate first**: Tables in `@beep/shared-tables` (e.g., `organization`, `user`) are referenced by slice tables. Ensure shared table migrations have lower sequence numbers than dependent slice migrations.
- **`_check.ts` does not run in migrations**: Type alignment assertions only run during TypeScript compilation. A migration can succeed while introducing type drift—always run `bun run check` after `db:migrate`.
- **Enum alterations are non-transactional**: Adding values to PostgreSQL enums cannot be rolled back. Test enum migrations in a separate database before applying to production.

### Relation Definition Gotchas
- **Relations are metadata only**: Drizzle `relations()` definitions do not create foreign keys—they inform the query builder for joins. Foreign keys must be explicitly declared in table definitions with `.references()`.
- **Shared table relations in slice packages**: When defining relations for `organization` or `user` in slice packages (e.g., `@beep/iam-tables`), import the table from `@beep/shared-tables/schema` to avoid duplicate table definitions.
- **One-to-one vs one-to-many**: Drizzle's `one()` helper does not enforce uniqueness. For true one-to-one relations, add a unique constraint on the foreign key column.

### Integration with Domain Entities
- **`_check.ts` import order matters**: TypeScript's structural typing may pass checks even when field order differs. Use strict mode and ensure `_check.ts` is included in the build to catch subtle mismatches.
- **`globalColumns` vs domain `BaseModel`**: The columns defined in `globalColumns` must exactly match `BaseModel` from `@beep/shared-domain`. Misalignment causes repository type errors that are hard to trace.
- **Optimistic locking via `version` column**: The `version` column in `globalColumns` enables optimistic locking, but repositories must implement the increment and check logic—Drizzle does not do this automatically.

## Contributor Checklist
- [ ] Updated or added `SharedEntityIds` and matching domain schemas before wiring a new table.
- [ ] Extended `_check.ts` to mirror new tables against domain models.
- [ ] Documented relations in downstream slices (e.g., IAM relations module) when adding foreign keys.
- [ ] Ran `bun run lint`, `bun run check`, and targeted tests / db codegen locally.
- [ ] Coordinated enum or column changes with `@beep/shared-domain` and `@beep/common/schema` so runtime codecs stay aligned.
- [ ] Noted any required migrations or follow-up work inside PR descriptions or slice-specific docs.

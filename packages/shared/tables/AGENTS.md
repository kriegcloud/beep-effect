# AGENTS — `@beep/shared-tables`

## Purpose & Fit
- Provides cross-slice Drizzle table factories and canonical organization-aware tables consumed by IAM, Files, and runtime adapters.
- Guarantees every table includes audit, user tracking, optimistic lock, and source metadata columns through `globalColumns`.
- Couples with `@beep/shared-domain` entity schemas so Drizzle types align with Effect models (`src/_check.ts` enforces parity).
- Serves as the entry point for shared Postgres enums (e.g., organization subscription tiers) and table re-exports under `SharedDbSchema`.

## Surface Map
- `Table.make` (`src/table/Table.ts`) — builds a pg table with default id/audit columns using an `EntityIdSchemaInstance`.
- `OrgTable.make` (`src/org-table/OrgTable.ts`) — extends `Table.make` with `organizationId` foreign key wiring to `organization.id`. Accepts optional `RlsOptions` parameter to control automatic RLS policy generation (see Auto-RLS Behavior section).
- `Common` namespace (`src/common.ts`): `globalColumns`, `auditColumns`, `userTrackingColumns`, `utcNow` helper.
- `DefaultColumns` types (`src/columns.ts`) — structural types describing the default column builders.
- Custom columns (`src/columns/index.ts`): see Custom Column Types table below.
- `SharedDbSchema` namespace (`src/tables/index.ts`) — re-exports concrete tables: `organization`, `team`, `user`, `file`, `folder`, `uploadSession`, `session`.
- `schema.ts` — re-exports all tables for convenience import (`@beep/shared-tables/schema`).
- `_check.ts` — compile-time assertions that Drizzle `Infer*Model` matches domain codecs.
- Package scripts (`package.json`) — build, lint, type, and test orchestration wired to Bun/TS.

### Custom Column Types (`src/columns/`)

| Column Type | TypeScript Type | Postgres Type | Use Case |
|-------------|-----------------|---------------|----------|
| `bytea` | `Uint8Array` | `bytea` | Raw binary data |
| `byteaBase64` | `string` (Base64) | `bytea` | Binary with Base64 interface |
| `datetime` | `DateTime.Utc` | `timestamptz` | Effect DateTime column |
| `vector256` | `ReadonlyArray<number>` | `vector(256)` | 256-dim embeddings (Matryoshka) |
| `vector512` | `ReadonlyArray<number>` | `vector(512)` | 512-dim embeddings (Voyage-3-lite) |
| `vector768` | `ReadonlyArray<number>` | `vector(768)` | 768-dim embeddings (Nomic v1.5) |
| `vector1024` | `ReadonlyArray<number>` | `vector(1024)` | 1024-dim embeddings (Voyage-3) |

## Usage Snapshots
- `packages/shared/tables/src/tables/session.table.ts:11` uses `Table.make(SharedEntityIds.SessionId)` to define session storage with shared audit columns and org/team references.
- `packages/iam/tables/src/tables/member.table.ts:9` calls `OrgTable.make(IamEntityIds.MemberId)` so memberships inherit `organizationId` cascade semantics.
- `packages/iam/tables/src/relations.ts` imports `@beep/shared-tables/schema` to compose Drizzle relations against the shared `organization`, `team`, and `user` tables.
- `packages/shared/tables/src/_check.ts` enforces Drizzle `organization`, `team`, and `session` definitions stay in lock-step with `@beep/shared-domain/entities`.
- `packages/shared/tables/src/tables/file.table.ts` demonstrates `OrgTable.make(SharedEntityIds.FileId)` for multi-tenant file metadata with organization relations.
- `packages/documents/tables/src/tables/document.table.ts` imports `bytea` custom column type for storing binary snapshots efficiently.

## Auto-RLS Behavior

`OrgTable.make` automatically generates PostgreSQL Row-Level Security (RLS) policies for tenant isolation. This ensures that queries are scoped to the current organization without manual policy definitions.

### RlsOptions Parameter

```typescript
export type RlsOptions = {
  readonly rlsPolicy?: "standard" | "nullable" | "none";
};
```

### Policy Options

| `rlsPolicy` Value | Behavior | Use Case |
|-------------------|----------|----------|
| `undefined` (default) | Generates standard policy requiring exact `organizationId` match; calls `.enableRLS()` | Most tenant-scoped tables (95% of cases) |
| `'standard'` | Same as default—explicit opt-in for clarity | When you want to document the policy choice explicitly |
| `'nullable'` | Generates policy allowing `NULL` or matching `organizationId`; calls `.enableRLS()` | Tables with optional organization ownership |
| `'none'` | No auto-policy, no `.enableRLS()` call | Tables requiring custom policies (rare) |

### Generated SQL

**Standard Policy** (for NOT NULL `organizationId`):
```sql
CREATE POLICY tenant_isolation_${tableName} ON ${tableName}
  AS PERMISSIVE FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

**Nullable Policy** (for OPTIONAL `organizationId`):
```sql
CREATE POLICY tenant_isolation_${tableName} ON ${tableName}
  AS PERMISSIVE FOR ALL
  USING (organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

### Tables That Cannot Use OrgTable.make

**`shared_session`**: Uses `active_organization_id` column for RLS instead of `organization_id`. This is intentional—sessions track the user's currently active organization context, not a fixed ownership relationship. RLS policy is defined in custom migration `0001_custom_rls_extensions.sql`.

**Tables using `Table.make` with nullable `organizationId`**: Some tables (e.g., `iam_invitation`, `iam_sso_provider`, `iam_scim_provider`) use `Table.make` because they have nullable `organizationId` columns. These require custom RLS policies in migration files.

## Authoring Guardrails
- ALWAYS import Effect modules via namespaces (`import * as F from "effect/Function";`) and NEVER use native array/string/object APIs; rely on `effect/Array`, `effect/String`, `effect/Record`, and friends.
- `Table.make` expects an `EntityId.EntityId.SchemaInstance`; ALWAYS create or update the matching entity id in `@beep/shared-domain` before adding a table.
- `OrgTable.make` hard-wires a cascade foreign key to `organization.id`. If you need different cascade behavior, document it explicitly and adjust downstream relations. See `relations.ts` for cross-table relations.
- Keep `globalColumns` in sync with `@beep/shared-domain/src/common.ts`; changes require coordinated updates to domain schema helpers and any ingestion/export logic.
- NEVER bypass `_check.ts`; ALWAYS extend it whenever new shared tables should align with domain codecs to catch drift at build time.
- Guard enums with domain factories (`Organization.makeSubscriptionTierPgEnum`) so Postgres enum names stay canonical.
- Prefer Drizzle index helpers rather than raw SQL, except when expressing computed checks (see session expiry check in `packages/shared/tables/src/tables/session.table.ts`).

### RLS Policy Guardrails
- NEVER add manual `pgPolicy()` for standard tenant isolation—`OrgTable.make` generates this automatically with the default `rlsPolicy` setting.
- NEVER call `.enableRLS()` manually on `OrgTable`-based tables—the factory handles this automatically unless `rlsPolicy: 'none'`.
- Use `rlsPolicy: 'none'` ONLY when non-standard policies are required (e.g., admin-only access, cross-tenant visibility). ALWAYS document the reason in a comment.
- NEVER duplicate auto-generated policy names (`tenant_isolation_${tableName}`) in custom policies—this causes Drizzle-kit to crash during `db:generate`.

## Quick Recipes

### Define a new shared table
```ts
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables/table";
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
import { OrgTable } from "@beep/shared-tables/org-table";
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

### Using RLS options with OrgTable.make

```ts
import { SharedEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables/org-table";
import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

// Default: standard tenant isolation (most common - 95% of cases)
// Auto-generates: tenant_isolation_documents_document policy
export const document = OrgTable.make(SharedEntityIds.DocumentId)(
  { title: pg.text("title").notNull() }
);

// Explicit standard: same as default, for documentation clarity
export const report = OrgTable.make(SharedEntityIds.ReportId, {
  rlsPolicy: "standard"
})(
  { name: pg.text("name").notNull() }
);

// Nullable: allows NULL organizationId (for shared/global resources)
// Use when: table has rows that belong to "no organization" (NULL)
export const sharedResource = OrgTable.make(SharedEntityIds.SharedResourceId, {
  rlsPolicy: "nullable"
})(
  { name: pg.text("name").notNull() }
);

// None: custom policy required (rare - document the reason!)
// Use when: non-standard access patterns (admin-only, cross-tenant, etc.)
export const auditLog = OrgTable.make(SharedEntityIds.AuditLogId, {
  rlsPolicy: "none"
})(
  { action: pg.text("action").notNull() },
  (t) => [
    // Custom policy: admin-only read access
    pg.pgPolicy("audit_log_admin_only", {
      for: "select",
      using: sql`current_setting('app.is_admin', TRUE) = 'true'`,
    }),
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
- **`_check.ts` type assertion asymmetry** (CRITICAL): The pattern `{} as InferSelectModel<typeof table>` only validates that Drizzle table types satisfy domain model encoded types (table → domain direction). It does NOT check that the domain model has all fields from the table (domain → table completeness). If a table has 6 fields and the domain only defines 3, `_check.ts` will still pass. **Best Practice**: Always verify domain models are complete BEFORE creating the table, then use `_check.ts` as a drift detector, not a completeness validator.
- **`globalColumns` vs domain `BaseModel`**: The columns defined in `globalColumns` must exactly match `BaseModel` from `@beep/shared-domain`. Misalignment causes repository type errors that are hard to trace.
- **Optimistic locking via `version` column**: The `version` column in `globalColumns` enables optimistic locking, but repositories must implement the increment and check logic—Drizzle does not do this automatically.

### Auto-RLS Migration Conflicts
- **Duplicate policy error**: If a table already has a manual `tenant_isolation_*` policy in an existing migration, enabling auto-RLS in code creates a duplicate. Drizzle-kit crashes with `ReferenceError: Cannot access 'tableKey2' before initialization` during `db:generate`. **Resolution**: Remove the manual policy and `.enableRLS()` call from the table code (keep the migration as-is for databases that already applied it), OR remove the policy from the migration if the database is being recreated.
- **New tables**: Tables created after auto-RLS implementation will have policies generated in their creation migration—no conflict.
- **Custom migration maintenance**: Tables using `Table.make` with `organizationId` (e.g., `iam_invitation`, `iam_sso_provider`) need manual RLS policies in custom migrations (`0001_custom_rls_extensions.sql`). These are NOT covered by `OrgTable.make` auto-RLS.
- **Session table exception**: `shared_session` uses `active_organization_id` (not `organization_id`) and cannot use `OrgTable.make`. Its RLS policy is manually defined in `0001_custom_rls_extensions.sql`.

## Contributor Checklist
- [ ] Updated or added `SharedEntityIds` and matching domain schemas before wiring a new table.
- [ ] Extended `_check.ts` to mirror new tables against domain models.
- [ ] Documented relations in downstream slices (e.g., IAM relations module) when adding foreign keys.
- [ ] Ran `bun run lint`, `bun run check`, and targeted tests / db codegen locally.
- [ ] Coordinated enum or column changes with `@beep/shared-domain` and `@beep/schema` so runtime codecs stay aligned.
- [ ] Noted any required migrations or follow-up work inside PR descriptions or slice-specific docs.

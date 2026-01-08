# AGENTS — `@beep/iam-tables`

## Purpose & Fit
- Supplies IAM-specific Drizzle tables, enums, and relations layered on top of the shared table factories so the authentication slice stays multi-tenant aware.
- Bridges `@beep/iam-domain` entity codecs to persistent storage; `_check.ts` keeps Drizzle `Infer*Model` outputs aligned with Effect models.
- Re-exports shared organization/team/user tables to keep infra consumers on a single schema namespace (`IamDbSchema`) when wiring adapters (e.g. Better Auth).
- Partners with `@beep/shared-server`'s `Db.make` by providing the schema object required to spin up `SqlClient` layers inside IAM infrastructure.

## Surface Map
- `src/index.ts` — exposes the schema namespace as `IamDbSchema`; consumers usually `import { IamDbSchema } from "@beep/iam-tables"`.
- `src/schema.ts` — aggregates everything exported from `tables/` and `relations.ts`, so `IamDbSchema` always includes both column builders and relation metadata.
- `src/relations.ts` — Drizzle `relations` definitions grouped by resource families (memberships, OAuth artifacts, sessions, SSO). These rely on shared tables (`organization`, `team`, `user`) and enforce cascade paths declared in the table files.
- `src/tables/*.table.ts` — concrete IAM tables:
  - Authentication artifacts: `account`, `session`, `passkey`, `twoFactor`, `deviceCode`, `oauthAccessToken`, `oauthApplication`, `oauthConsent`, `jwks`.
  - Access control & membership: `member`, `teamMember`, `organizationRole`, `invitation`, `subscription`, `apiKey`.
  - Aux data: `rateLimit`, `walletAddress`.
  - Every table is built via `Table.make` or `OrgTable.make` and frequently decorates columns with enums generated from `@beep/iam-domain`.
- `src/_check.ts` — compile-time assertions that each table’s `InferSelectModel` / `InferInsertModel` matches the corresponding domain schema (`@beep/iam-domain/entities`). Extend this file whenever a table gains new columns or when new tables are introduced.
- `package.json` — Bun driven scripts (`build`, `check`, `lint`, `test`) and peer dependency contracts ensuring Effect, Drizzle, and shared packages line up.
- `build/` — generated CJS/ESM bundles; never edit manually.

## Usage Snapshots
- IAM infrastructure passes `IamDbSchema` into `Db.make` so IAM's Effect Layer exposes typed Drizzle clients with camel/snake transforms.
- Better Auth service hands `IamDbSchema` to `drizzleAdapter`, then uses `IamDbSchema.organization` / `IamDbSchema.member` in session hooks to seed org context.
- Better Auth plugins import `IamDbSchema` to update membership rows inside plugin hooks, ensuring Better Auth and IAM tables stay in sync.
- Shared tables documentation shows how `OrgTable.make` is consumed, reinforcing the shared multi-tenant defaults that IAM tables extend.

## Authoring Guardrails
- ALWAYS import Effect modules by namespace (`import * as A from "effect/Array";`, `import * as F from "effect/Function";`) and use Effect helpers instead of native array/string/object APIs when writing cookbook examples or schema helpers.
- Choose `OrgTable.make` for tenant-scoped resources (anything with an `organizationId` relationship) and leave `Table.make` for global artifacts (e.g. `rateLimit`, `walletAddress`). `OrgTable` automatically wires `organizationId` with cascade semantics defined in `packages/shared/tables/src/OrgTable.ts`.
- Generate enums via domain kits (e.g. `Member.makeMemberRolePgEnum`) so Postgres enum names align with the domain schema and Better Auth plugin expectations. NEVER handcraft enum builders.
- Keep `_check.ts` synchronized whenever you add or rename columns; failure to extend the file will silently erode type alignment between Drizzle models and `@beep/iam-domain`.
- Shared tables (`organization`, `team`, `user`) are re-exported from `@beep/shared-tables`. Edits belong in the shared package, not here; note cross-package implications before touching them.
- When introducing relations ensure Drizzle relation definitions mirror cascade rules declared in table builders and avoid circular dependencies. Group by resource area (members, OAuth, sessions) to keep the file readable.
- Coordinate schema updates with migrations under `packages/_internal/db-admin`; IAM infra expects both schema and SQL migrations to ship together.

## Quick Recipes

### Define a tenant-scoped table with indexed constraints
```ts
import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const notificationPreference = OrgTable.make(IamEntityIds.NotificationPreferenceId)(
  {
    channel: pg.text("channel").notNull(),
    enabled: pg.boolean("enabled").notNull().default(true),
  },
  (t) => [
    pg.uniqueIndex("notification_pref_org_channel_idx").on(t.organizationId, t.channel),
  ]
);
```

### Extend relations for a new table
```ts
import { notificationPreference } from "@beep/iam-tables/tables/notificationPreference.table";
import { organization } from "@beep/shared-tables/schema";
import * as d from "drizzle-orm";

export const notificationPreferenceRelations = d.relations(notificationPreference, ({ one }) => ({
  organization: one(organization, {
    fields: [notificationPreference.organizationId],
    references: [organization.id],
  }),
}));
```

### Surface typed queries from an Effect Layer
```ts
import { IamDb } from "@beep/iam-server/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export const listActiveMembers = Effect.gen(function* () {
  const { db } = yield* IamDb.IamDb;
  const rows = yield* db
    .select({
      memberId: IamDbSchema.member.id,
      role: IamDbSchema.member.role,
    })
    .from(IamDbSchema.member);

  return F.pipe(
    rows,
    A.map((row) => row.memberId)
  );
});
```

### Add `_check` coverage for a new table
```ts
import type { NotificationPreference } from "@beep/iam-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectNotificationPreference: typeof NotificationPreference.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.notificationPreference>;

export const _checkInsertNotificationPreference: typeof NotificationPreference.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.notificationPreference>;
```

## Verifications
- `bun run lint` — Biome sweep for formatting and Effect import discipline.
- `bun run check` — Type build that executes `_check.ts` assertions.
- `bun run build` — Produces ESM/CJS artifacts consumed by infra packages.
- `bun run test` (or `bun run coverage`) — Executes Bun test suite (currently placeholder; expand alongside meaningful table tests).
- `bun run db:generate` (root) — Regenerate Drizzle types after schema adjustments and confirm migrations stay coherent.

## Security

### Sensitive Column Handling
- NEVER store plaintext passwords in any table column; password hashes belong in `account` table only, managed by Better Auth.
- ALWAYS mark token columns (`accessToken`, `refreshToken`, `idToken`, `hashedSecret`) as sensitive in domain schemas.
- NEVER expose raw API key secrets in select queries; use hashed comparisons for validation.
- ALWAYS use `FieldSensitiveOptionOmittable` from `@beep/schema` for sensitive optional fields.

### Data Isolation
- ALWAYS use `OrgTable.make` for tenant-scoped resources to enforce `organizationId` foreign key constraints.
- NEVER bypass cascade rules defined in table builders—they enforce data isolation on deletion.
- ALWAYS validate that queries include tenant scope predicates when accessing organization-bound tables.

### Credential Storage Patterns
- `session` table: tokens MUST have enforced expiry; NEVER allow indefinite sessions.
- `apiKey` table: store only hashed secrets (`hashedSecret`); NEVER store the plaintext key after initial generation.
- `passkey` table: WebAuthn credential IDs and public keys are sensitive—NEVER log them.
- `twoFactor` table: TOTP secrets MUST be encrypted at rest; NEVER expose in API responses.
- `oauthAccessToken` / `account` tables: tokens are time-bounded; ensure `expiresAt` columns are indexed for cleanup jobs.

### Audit Trail Integrity
- NEVER modify `createdAt`, `createdBy` columns after initial insert.
- ALWAYS populate `updatedAt`, `updatedBy` on every update operation.
- ALWAYS use typed IDs from `IamEntityIds` to maintain referential integrity and traceability.

### Migration Security
- NEVER include secrets or credentials in migration scripts.
- ALWAYS review migrations for accidental exposure of sensitive column defaults.
- ALWAYS coordinate schema changes with `@beep/iam-domain` to maintain type safety.

## Gotchas

### Drizzle ORM Pitfalls
- **Enum value additions require migrations**: PostgreSQL enums cannot have values added via `ALTER TYPE ... ADD VALUE` inside a transaction. Drizzle generates these statements, but they may fail if run within a transaction block. Run `db:migrate` separately from other transactional operations.
- **`InferSelectModel` vs `InferInsertModel` divergence**: Optional columns with defaults (e.g., `createdAt`) appear in `InferSelectModel` but not in `InferInsertModel`. Ensure `_check.ts` covers both model types to catch misalignment with domain schemas.
- **Nullable vs optional confusion**: Drizzle treats `.notNull()` absence as nullable, but TypeScript may infer `undefined`. Use explicit `.$type<T | null>()` to ensure domain schema alignment.

### Migration Ordering
- **Cross-table foreign keys**: When adding tables that reference each other (e.g., `member` -> `organization`), ensure the referenced table migration runs first. Drizzle orders by filename—use numeric prefixes if manual ordering is needed.
- **Enum before table**: PostgreSQL enums must be created before any table uses them. If a migration creates both, ensure enum creation is first in the SQL file.
- **Rollback limitations**: Drizzle Kit does not generate rollback migrations automatically. Document manual rollback steps in PR descriptions for complex schema changes.

### Relation Definition Gotchas
- **Circular relation imports**: Drizzle relations files can hit circular import issues when two tables reference each other. Use type-only imports (`import type`) for table types when defining relations to break cycles.
- **Cascade rule mismatch**: The `onDelete` cascade in table definitions must match the Drizzle `relations()` configuration. Mismatches cause silent failures where deletions do not propagate as expected.
- **Many-to-many requires junction table**: Drizzle does not auto-generate junction tables. Explicitly define the join table with foreign keys to both sides.

### Integration with Domain Entities
- **`_check.ts` silent failures**: If `_check.ts` assertions are not imported by the build, type mismatches go undetected. Ensure `tsconfig.json` includes `_check.ts` in compilation.
- **Better Auth field expectations**: Better Auth plugins expect specific column names (`userId`, `expiresAt`, `token`). Renaming columns requires updating plugin configurations to match.
- **Timestamp precision**: PostgreSQL `timestamp` defaults to microsecond precision, but JavaScript `Date` has millisecond precision. Use `timestamp('col', { precision: 3 })` for consistency with domain `DateTime` schemas.

## Contributor Checklist
- [ ] Registered or updated the matching `IamEntityIds` entry and, when required, shared-domain entity definitions before adding a table.
- [ ] Added enum builders via domain kits (`makeXyzPgEnum`) instead of raw strings.
- [ ] Extended `src/_check.ts` for any schema shape changes.
- [ ] Documented or updated relations in `src/relations.ts` to match new foreign keys.
- [ ] Coordinated SQL migrations in `packages/_internal/db-admin` and verified local database drift.
- [ ] Ran `bun run lint`, `bun run check`, and `bun run build` inside the workspace.
- [ ] Notified dependent docs (e.g. `packages/shared/tables/AGENTS.md`) if shared factories or cascade assumptions changed.

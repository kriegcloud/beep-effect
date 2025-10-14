# AGENTS — `@beep/iam-tables`

## Purpose & Fit
- Supplies IAM-specific Drizzle tables, enums, and relations layered on top of the shared table factories so the authentication slice stays multi-tenant aware.
- Bridges `@beep/iam-domain` entity codecs to persistent storage; `_check.ts` keeps Drizzle `Infer*Model` outputs aligned with Effect models.
- Re-exports shared organization/team/user tables to keep infra consumers on a single schema namespace (`IamDbSchema`) when wiring adapters (e.g. Better Auth).
- Partners with `@beep/core-db`’s `Db.make` by providing the schema object required to spin up `SqlClient` layers inside IAM infrastructure.

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
- `packages/iam/infra/src/db/Db.ts:2` — passes `IamDbSchema` into `Db.make` so IAM’s Effect Layer exposes typed Drizzle clients with camel/snake transforms.
- `packages/iam/infra/src/adapters/better-auth/Auth.service.ts:91` — hands `IamDbSchema` to `drizzleAdapter`, then uses `IamDbSchema.organization` / `IamDbSchema.member` in session hooks to seed org context.
- `packages/iam/infra/src/adapters/better-auth/plugins/organization/organization.plugin.ts:2` — imports `IamDbSchema` to update membership rows inside plugin hooks, ensuring Better Auth and IAM tables stay in sync.
- `packages/shared/tables/AGENTS.md:20` — documents how `OrgTable.make` is consumed here (e.g. `member.table.ts:8`), reinforcing the shared multi-tenant defaults that IAM tables extend.

## Tooling & Docs Shortcuts
- Inspect downstream usages of the schema namespace:
  ```json
  { "projectPath": "/home/elpresidank/YeeBois/projects/beep-effect", "searchText": "IamDbSchema", "maxUsageCount": 100 }
  ```
  (Call `jetbrains__search_in_files_by_text` with this payload.)
- Refresh Effect schema patterns:
  ```json
  { "context7CompatibleLibraryID": "/llmstxt/effect_website_llms-full_txt", "topic": "schema tables" }
  ```
  (Pass to `context7__get-library-docs`.)
- Revisit Effect Array reductions for guardrail reminders:
  ```json
  { "documentId": 4867 }
  ```
  (Invoke `effect_docs__get_effect_doc` to view `effect/Array.reduce`.)
- Pull constructor signatures for `Schema.Struct` when aligning `_check.ts`:
  ```json
  { "documentId": 8888 }
  ```
  (Feed into `effect_docs__get_effect_doc`.)

## Authoring Guardrails
- Always import Effect modules by namespace (`import * as A from "effect/Array";`, `import * as F from "effect/Function";`) and use Effect helpers instead of native array/string/object APIs when writing cookbook examples or schema helpers.
- Choose `OrgTable.make` for tenant-scoped resources (anything with an `organizationId` relationship) and leave `Table.make` for global artifacts (e.g. `rateLimit`, `walletAddress`). `OrgTable` automatically wires `organizationId` with cascade semantics defined in `packages/shared/tables/src/OrgTable.ts`.
- Generate enums via domain kits (e.g. `Member.makeMemberRolePgEnum`) so Postgres enum names align with the domain schema and Better Auth plugin expectations. Never handcraft enum builders.
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
import { IamDb } from "@beep/iam-infra/db/Db";
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

## Contributor Checklist
- [ ] Registered or updated the matching `IamEntityIds` entry and, when required, shared-domain entity definitions before adding a table.
- [ ] Added enum builders via domain kits (`makeXyzPgEnum`) instead of raw strings.
- [ ] Extended `src/_check.ts` for any schema shape changes.
- [ ] Documented or updated relations in `src/relations.ts` to match new foreign keys.
- [ ] Coordinated SQL migrations in `packages/_internal/db-admin` and verified local database drift.
- [ ] Ran `bun run lint`, `bun run check`, and `bun run build` inside the workspace.
- [ ] Notified dependent docs (e.g. `packages/shared/tables/AGENTS.md`) if shared factories or cascade assumptions changed.

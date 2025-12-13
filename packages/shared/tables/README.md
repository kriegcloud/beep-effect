# @beep/shared-tables — Drizzle table factories and cross-slice schemas

Cross-slice Drizzle table factories, audit column defaults, and canonical multi-tenant tables consumed by IAM, Documents, and runtime adapters. Guarantees every table includes audit, user tracking, optimistic locking, and source metadata through `globalColumns`.

## What this package provides

- **Table factories** (`Table.make`, `OrgTable.make`) build Drizzle tables with automatic ID, audit, and metadata columns from `EntityIdSchemaInstance`.
- **Global column defaults** (`src/common.ts`) provide `auditColumns`, `userTrackingColumns`, and optimistic locking via `globalColumns`.
- **Custom column types** (`src/columns/`) for binary data: `bytea` (Uint8Array) and `byteaBase64` (Base64 string interface).
- **Shared database schemas** (`SharedDbSchema` namespace) re-export canonical tables: `organization`, `team`, `user`, `file`, `folder`, `session`.
- **Drizzle relations** (`src/relations.ts`) export pre-configured relations between shared tables for query composition.
- **Type safety contracts** (`src/Columns.ts`) define structural types for default column builders.
- **Compile-time checks** (`src/_check.ts`) enforce Drizzle `Infer*Model` matches domain codecs from `@beep/shared-domain`.
- **TypeScript builds** (`build/**`) produced by `tsc` + Babel transforms; artifacts consumed by slice packages and apps.

## When to reach for it

- Defining new Drizzle tables that need standard audit trails, optimistic locking, and multi-tenant wiring.
- Building organization-scoped tables with automatic `organizationId` foreign key cascade semantics.
- Creating tables that must stay in sync with Effect Schema domain models via compile-time checks.
- Importing shared table definitions (`organization`, `user`, `team`) for Drizzle relations in vertical slices.
- Never use this for domain business logic; keep table definitions pure Drizzle schema with no side effects.

## Key Exports

| Export | Description |
|--------|-------------|
| `Table.make` | Factory for creating Drizzle tables with standard audit columns |
| `OrgTable.make` | Factory for creating organization-scoped tables with cascade semantics |
| `Common.globalColumns` | Audit, user tracking, version, and source columns |
| `Common.auditColumns` | Created/updated/deleted timestamp columns |
| `Common.userTrackingColumns` | Created/updated/deleted user tracking columns |
| `bytea` | Custom column type for Uint8Array binary data |
| `byteaBase64` | Custom column type for Base64-encoded binary data |
| `SharedDbSchema.*` | Namespace containing all shared tables and relations |
| `organization` | Organization table with type/subscription enums |
| `user` | User table with role enum |
| `team` | Team table |
| `file` | File metadata table |
| `folder` | Folder table |
| `session` | Session table |
| `organizationRelations` | Pre-configured Drizzle relations for organization |
| `userRelations` | Pre-configured Drizzle relations for user |
| `teamRelations` | Pre-configured Drizzle relations for team |
| `fileRelations` | Pre-configured Drizzle relations for file |
| `folderRelations` | Pre-configured Drizzle relations for folder |
| `sessionRelations` | Pre-configured Drizzle relations for session |

## Quickstart

### Define a basic table with Table.make

```ts
import { SharedEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables/Table";
import * as pg from "drizzle-orm/pg-core";

export const webhook = Table.make(SharedEntityIds.WebhookId)(
  {
    targetUrl: pg.text("target_url").notNull(),
    isActive: pg.boolean("is_active").notNull().default(true),
    secretKey: pg.text("secret_key").notNull(),
  },
  (t) => [
    pg.index("webhook_target_idx").on(t.targetUrl),
    pg.index("webhook_active_idx").on(t.isActive).where(sql`${t.isActive} = true`),
  ]
);
```

Automatically includes:
- `id` — public EntityId (e.g., `webhook_abc123xyz`)
- `_rowId` — internal UUID v7 for joins
- `createdAt`, `updatedAt`, `deletedAt` — audit timestamps
- `createdBy`, `updatedBy`, `deletedBy` — user tracking
- `version` — optimistic locking counter
- `source` — traceability metadata

### Define an organization-scoped table with OrgTable.make

```ts
import { SharedEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables/OrgTable";
import * as pg from "drizzle-orm/pg-core";

export const document = OrgTable.make(SharedEntityIds.DocumentId)(
  {
    title: pg.text("title").notNull(),
    content: pg.text("content"),
    ownerUserId: pg.text("owner_user_id").notNull(),
  },
  (t) => [
    pg.uniqueIndex("document_org_title_idx").on(t.organizationId, t.title),
    pg.index("document_owner_idx").on(t.ownerUserId),
  ]
);
```

Includes everything from `Table.make` plus:
- `organizationId` — foreign key to `organization.id` with cascade delete/update

### Use custom binary columns

```ts
import { bytea, byteaBase64 } from "@beep/shared-tables/columns";
import { OrgTable } from "@beep/shared-tables/OrgTable";
import { DocumentsEntityIds } from "@beep/documents-domain";
import * as pg from "drizzle-orm/pg-core";

export const snapshot = OrgTable.make(DocumentsEntityIds.SnapshotId)(
  {
    rawData: bytea("raw_data").notNull(),           // Uint8Array interface
    encodedData: byteaBase64("encoded_data"),       // Base64 string interface
    checksum: pg.text("checksum").notNull(),
  }
);

// Insert with Uint8Array
await db.insert(snapshot).values({
  rawData: new Uint8Array([72, 101, 108, 108, 111]),
  organizationId: "org_abc123",
  checksum: "sha256:...",
});

// Insert with Base64 string
await db.insert(snapshot).values({
  encodedData: "SGVsbG8gV29ybGQ=",
  organizationId: "org_abc123",
  checksum: "sha256:...",
});
```

### Import shared tables and relations

```ts
import { relations } from "drizzle-orm";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import { member } from "./member.table";

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(SharedDbSchema.organization, {
    fields: [member.organizationId],
    references: [SharedDbSchema.organization.id],
  }),
  user: one(SharedDbSchema.user, {
    fields: [member.userId],
    references: [SharedDbSchema.user.id],
  }),
}));
```

Or use the pre-configured relations directly:

```ts
import * as SharedDbSchema from "@beep/shared-tables/schema";

// Import pre-configured relations
const { organizationRelations, userRelations, teamRelations } = SharedDbSchema;

// Available relations:
// - organizationRelations (owner, teams, folders, files)
// - userRelations (ownedOrganizations, sessions, folders, files)
// - teamRelations (organization)
// - fileRelations (organization, folder, userId, uploadedByUserId)
// - folderRelations (organization, files, userId)
// - sessionRelations (user)
```

### Extend compile-time checks for new shared tables

When adding a new shared table that should align with domain codecs:

```ts
// src/_check.ts
import type { Simplify } from "effect/Types";
import * as M from "@effect/sql/Model";
import { Webhook } from "@beep/shared-domain/entities";
import { webhook } from "./tables/webhook.table";

type _webhook_insert = Simplify<M.InsertModel<typeof webhook>>;
type _webhook_select = Simplify<M.SelectModel<typeof webhook>>;

// These should not error if Drizzle schema matches domain codec
const _webhook_encode: (a: Webhook.Webhook.Type) => _webhook_insert = Webhook.Webhook.make;
const _webhook_decode: (a: _webhook_select) => Webhook.Webhook.Type = Webhook.Webhook.make;
```

## Package structure

```
packages/shared/tables/
├── src/
│   ├── Table/
│   │   ├── Table.ts         # Table.make factory
│   │   └── index.ts
│   ├── OrgTable/
│   │   ├── OrgTable.ts      # OrgTable.make factory
│   │   └── index.ts
│   ├── columns/
│   │   ├── bytea.ts         # Custom binary column types
│   │   └── index.ts
│   ├── tables/
│   │   ├── organization.table.ts  # Organization schema + enums
│   │   ├── user.table.ts          # User schema + enums
│   │   ├── team.table.ts          # Team schema
│   │   ├── file.table.ts          # File metadata schema
│   │   ├── folder.table.ts        # Folder schema
│   │   ├── session.table.ts       # Session schema
│   │   └── index.ts
│   ├── Columns.ts           # Type definitions for default columns
│   ├── common.ts            # globalColumns, auditColumns, userTrackingColumns
│   ├── relations.ts         # Drizzle relations between shared tables
│   ├── schema.ts            # Re-exports all tables and relations
│   ├── _check.ts            # Compile-time schema/domain parity checks
│   └── index.ts             # Package exports
├── AGENTS.md                # AI agent collaboration guide
├── README.md                # This file
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Effect patterns and guardrails

### Always use Effect utilities over native methods

```ts
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

// Iterate over table metadata
const indexNames = (descriptors: ReadonlyArray<IndexDescriptor>) =>
  F.pipe(
    descriptors,
    A.filter((d) => d.kind === "index"),
    A.map((d) => d.name)
  );

// Process column names
const normalizeColumnName = (name: string) =>
  F.pipe(
    name,
    Str.toLowerCase,
    Str.replace("-", "_")
  );
```

### Namespace imports for Effect modules

```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as S from "effect/Schema";
import * as DateTime from "effect/DateTime";
```

### Keep tables synchronized with domain schemas

- Before creating a table, define the matching `EntityId` in `@beep/shared-domain/entity-ids`.
- Extend `_check.ts` whenever adding shared tables to catch drift at build time.
- Use domain factories for Postgres enums: `Organization.makeSubscriptionTierPgEnum("subscription_tier_enum")`.

### Respect cascade semantics in OrgTable

`OrgTable.make` hard-wires cascade delete/update on `organizationId`. If you need different behavior:
1. Document it explicitly in the table file
2. Coordinate with downstream relations (e.g., IAM relations module)
3. Consider whether the table truly belongs to an organization scope

## Global columns explained

Every table created via `Table.make` or `OrgTable.make` includes:

| Column | Type | Purpose |
|--------|------|---------|
| `createdAt` | `timestamp with timezone` | UTC timestamp, auto-set on insert |
| `updatedAt` | `timestamp with timezone` | UTC timestamp, auto-updated on modification |
| `deletedAt` | `timestamp with timezone` | Soft delete timestamp (null = active) |
| `createdBy` | `text` | User ID who created the record (defaults to "app") |
| `updatedBy` | `text` | User ID who last updated the record (defaults to "app") |
| `deletedBy` | `text` | User ID who soft-deleted the record |
| `version` | `integer` | Optimistic locking counter (increments on update) |
| `source` | `text` | Traceability: 'api', 'import', 'migration', etc. |

Changes to `globalColumns` require coordinated updates to:
- `@beep/shared-domain/src/common.ts` — domain schema helpers
- Migration generation via `bun run db:generate`
- Any ingestion/export logic that depends on these fields

## Shared database schemas

The `SharedDbSchema` namespace re-exports canonical tables and their relations:

```ts
import * as SharedDbSchema from "@beep/shared-tables/schema";

// Available tables:
SharedDbSchema.organization        // Organization table + type/subscription enums
SharedDbSchema.user                // User table + role enum
SharedDbSchema.team                // Team table
SharedDbSchema.file                // File metadata table
SharedDbSchema.folder              // Folder table
SharedDbSchema.session             // Session table

// Available relations:
SharedDbSchema.organizationRelations  // Organization relations
SharedDbSchema.userRelations          // User relations
SharedDbSchema.teamRelations          // Team relations
SharedDbSchema.fileRelations          // File relations
SharedDbSchema.folderRelations        // Folder relations
SharedDbSchema.sessionRelations       // Session relations
```

These are consumed by:
- `packages/iam/tables` for IAM relations
- `packages/documents/tables` for file ownership relations
- `packages/_internal/db-admin` schema barrel for migrations
- Repository layers in `@beep/iam-infra` and `@beep/documents-infra`

## Custom column types

### bytea — Uint8Array interface

Stores binary data efficiently in PostgreSQL's native `bytea` format:

```ts
import { bytea } from "@beep/shared-tables/columns";

export const myTable = pgTable("my_table", {
  binaryData: bytea("binary_data").notNull(),
});

// Usage
await db.insert(myTable).values({
  binaryData: new Uint8Array([1, 2, 3, 4, 5]),
});
```

Benefits:
- ~33% storage savings vs. Base64 in text columns
- No encoding/decoding overhead on reads/writes
- Native binary operations in PostgreSQL

### byteaBase64 — Base64 string interface

Stores binary data as `bytea` but exposes Base64 strings to the application:

```ts
import { byteaBase64 } from "@beep/shared-tables/columns";

export const myTable = pgTable("my_table", {
  snapshot: byteaBase64("snapshot"),
});

// Usage
await db.insert(myTable).values({
  snapshot: "SGVsbG8gV29ybGQ=",  // Base64 encoded
});

const row = await db.select().from(myTable);
console.log(row.snapshot);  // Returns "SGVsbG8gV29ybGQ="
```

Uses Effect's `Encoding` module for Base64 encoding/decoding with proper error handling.

## Scripts and workflows

| Command | Purpose |
|---------|---------|
| `bun run build` | Compile ESM + CJS artifacts via `tsc` and Babel |
| `bun run dev` | Watch mode type checking |
| `bun run check` | TypeScript type check (includes `_check.ts` validation) |
| `bun run lint` | Biome lint check |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run test` | Run Bun test suite |
| `bun run coverage` | Generate test coverage report |
| `bun run lint:circular` | Check for circular dependencies via madge |

After modifying table schemas:
1. Run `bun run check` to verify type safety
2. Run `bun run db:generate` from repo root to regenerate migrations
3. Confirm migrations are correct in `packages/_internal/db-admin/drizzle/`

## Notes and gotchas

- **Never bypass `_check.ts`**: Extend it when adding shared tables to catch schema/domain drift at compile time.
- **Entity IDs first**: Create `EntityIdSchemaInstance` in `@beep/shared-domain` before defining a table.
- **Import conventions**: Use `@beep/*` path aliases, never relative `../../../` paths across packages.
- **No side effects**: Tables are pure Drizzle schema definitions; business logic belongs in domain/infra layers.
- **Postgres enums**: Use domain factories (`Organization.makeOrganizationTypePgEnum`) to keep enum names canonical.
- **Index strategy**: Prefer Drizzle index helpers; use raw SQL only for computed checks (see `session.table.ts` expiry index).
- **Multi-tenant by default**: Use `OrgTable.make` for organization-scoped data; use `Table.make` for global entities.

## Integration examples

### IAM member table with organization relation

```ts
// packages/iam/tables/src/tables/member.table.ts
import { IamEntityIds } from "@beep/iam-domain";
import { OrgTable } from "@beep/shared-tables/OrgTable";
import { organization, user } from "@beep/shared-tables/schema";
import * as pg from "drizzle-orm/pg-core";

export const memberRolePgEnum = pgEnum("member_role_enum", ["owner", "admin", "member"]);

export const member = OrgTable.make(IamEntityIds.MemberId)(
  {
    userId: pg.text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRolePgEnum("role").notNull().default("member"),
    invitedBy: pg.text("invited_by"),
  },
  (t) => [
    pg.uniqueIndex("member_org_user_idx").on(t.organizationId, t.userId),
    pg.index("member_user_idx").on(t.userId),
  ]
);
```

### Documents file table with custom binary column

```ts
// packages/documents/tables/src/tables/file-content.table.ts
import { DocumentsEntityIds } from "@beep/documents-domain";
import { OrgTable } from "@beep/shared-tables/OrgTable";
import { bytea } from "@beep/shared-tables/columns";
import { file } from "@beep/shared-tables/schema";
import * as pg from "drizzle-orm/pg-core";

export const fileContent = OrgTable.make(DocumentsEntityIds.FileContentId)(
  {
    fileId: pg.text("file_id")
      .notNull()
      .references(() => file.id, { onDelete: "cascade" }),
    content: bytea("content").notNull(),
    checksum: pg.text("checksum").notNull(),
    compressionType: pg.text("compression_type"),
  },
  (t) => [
    pg.uniqueIndex("file_content_file_idx").on(t.fileId),
    pg.index("file_content_checksum_idx").on(t.checksum),
  ]
);
```

## Contributor checklist

Before submitting changes:
- [ ] Created or updated `EntityId` in `@beep/shared-domain/entity-ids` for new tables
- [ ] Extended `_check.ts` to mirror new shared tables against domain models
- [ ] Documented relations in downstream slice packages (e.g., IAM relations module)
- [ ] Ran `bun run lint`, `bun run check` locally
- [ ] Generated migrations via `bun run db:generate` from repo root
- [ ] Coordinated enum or column changes with `@beep/shared-domain` and `@beep/schema`
- [ ] Updated AGENTS.md if introducing new patterns or factories
- [ ] Noted required migrations or follow-up work in PR description

## Related packages

- `@beep/shared-domain` — Entity schemas, EntityId factories, domain models
- `@beep/schema` — Effect Schema utilities, JSON Schema normalization
- `@beep/iam-tables` — IAM-specific Drizzle tables (auth, members, invitations)
- `@beep/documents-tables` — Documents-specific tables (files, folders, permissions)
- `@beep/_internal/db-admin` — Migration warehouse, Drizzle CLI, schema barrel
- `@beep/shared-infra` — Db service, repository factories, multi-tenant adapters

## Further reading

- `AGENTS.md` — Detailed agent collaboration guide with usage snapshots and recipes
- `docs/patterns/` (repo root) — Implementation patterns and best practices
- Drizzle ORM docs: https://orm.drizzle.team/
- Effect documentation: https://effect.website/

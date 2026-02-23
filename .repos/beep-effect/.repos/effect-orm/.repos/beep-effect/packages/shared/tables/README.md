# @beep/shared-tables

Cross-slice Drizzle table factories, audit column defaults, and canonical multi-tenant tables consumed by IAM, Documents, and runtime adapters.

## Purpose

This package provides cross-slice Drizzle table factories and canonical multi-tenant table schemas that guarantee consistency across the beep-effect monorepo. It ensures every table includes:
- Standard audit trails (created/updated/deleted timestamps and user tracking)
- Optimistic locking via version counters
- Source metadata for traceability
- Multi-tenant wiring for organization-scoped data

Table factories automatically inject these global columns while maintaining type safety with domain models from `@beep/shared-domain`. The package also exports shared table definitions (organization, user, team, file, folder, session) that are consumed by IAM, Documents, and other vertical slices for establishing Drizzle relations.

This is infrastructure-layer code: pure Drizzle schema definitions with no business logic or side effects.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-tables": "workspace:*"
```

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
| `uploadSession` | Upload session table for HMAC signature verification |
| `organizationRelations` | Pre-configured Drizzle relations for organization |
| `userRelations` | Pre-configured Drizzle relations for user |
| `teamRelations` | Pre-configured Drizzle relations for team |
| `fileRelations` | Pre-configured Drizzle relations for file |
| `folderRelations` | Pre-configured Drizzle relations for folder |
| `sessionRelations` | Pre-configured Drizzle relations for session |
| `uploadSessionRelations` | Pre-configured Drizzle relations for upload session |

## Usage

### Basic Table with Table.make

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

### Organization-Scoped Table with OrgTable.make

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

### Custom Binary Columns

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

### Importing Shared Tables and Relations

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
// - organizationRelations (owner, teams, folders, files, uploadSessions)
// - userRelations (ownedOrganizations, sessions, folders, files)
// - teamRelations (organization)
// - fileRelations (organization, folder, userId, uploadedByUserId)
// - folderRelations (organization, files, userId)
// - sessionRelations (user)
// - uploadSessionRelations (organization)
```

### Compile-Time Checks for Schema Alignment

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

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-domain` | Entity schemas, EntityId factories, domain models |
| `@beep/schema` | Effect Schema utilities, EntityId helpers |
| `@beep/invariant` | Assertion contracts for validation |
| `@beep/utils` | Pure runtime helpers |
| `@beep/identity` | Package identity utilities |
| `drizzle-orm` | PostgreSQL schema builder and query interface |
| `effect` | Effect runtime and utilities |
| `@effect/sql` | SQL integration for Effect |
| `@effect/experimental` | Experimental Effect features |
| `mutative` | Immutable update utilities |

## Integration

This package is consumed by:
- `@beep/iam-tables` — IAM-specific tables reference shared organization/user tables for relations
- `@beep/documents-tables` — Documents tables use OrgTable.make and reference shared tables
- `@beep/shared-server` — Db service and repository factories operate on these table definitions
- `@beep/_internal/db-admin` — Migration warehouse imports schema barrel for Drizzle migrations

## Development

```bash
# Type check
bun run --filter @beep/shared-tables check

# Lint
bun run --filter @beep/shared-tables lint

# Auto-fix linting issues
bun run --filter @beep/shared-tables lint:fix

# Build
bun run --filter @beep/shared-tables build

# Test
bun run --filter @beep/shared-tables test

# Test coverage
bun run --filter @beep/shared-tables coverage

# Check for circular dependencies
bun run --filter @beep/shared-tables lint:circular
```

After modifying table schemas:
1. Run `bun run check` to verify type safety
2. Run `bun run db:generate` from repo root to regenerate migrations
3. Confirm migrations are correct in `packages/_internal/db-admin/drizzle/`

## Notes

### Global Columns
Every table created via `Table.make` or `OrgTable.make` automatically includes:
- `id` — Public EntityId (e.g., `webhook_abc123xyz`)
- `_rowId` — Internal UUID v7 for database joins
- `createdAt`, `updatedAt`, `deletedAt` — Audit timestamps (UTC)
- `createdBy`, `updatedBy`, `deletedBy` — User tracking (defaults to "app")
- `version` — Optimistic locking counter (increments on update)
- `source` — Traceability metadata ('api', 'import', 'migration', etc.)

Changes to `globalColumns` require coordinated updates to:
- `@beep/shared-domain/src/common.ts` for domain schema helpers
- Migration generation via `bun run db:generate`
- Any ingestion/export logic that depends on these fields

### Table Factory Guardrails
- **Entity IDs first**: Create `EntityIdSchemaInstance` in `@beep/shared-domain` before defining a table
- **Compile-time checks**: Extend `_check.ts` when adding shared tables to catch schema/domain drift at build time
- **Cascade semantics**: `OrgTable.make` hard-wires cascade delete/update on `organizationId`. Document explicitly if you need different behavior
- **No side effects**: Tables are pure Drizzle schema definitions; business logic belongs in domain/server layers
- **Import conventions**: Use `@beep/*` path aliases, never relative `../../../` paths across packages

### Postgres Enums
Use domain factories to keep enum names canonical:
```typescript
import { Organization } from "@beep/shared-domain/entities";

const subscriptionTierEnum = Organization.makeSubscriptionTierPgEnum("subscription_tier_enum");
```

### Multi-Tenant Strategy
- Use `OrgTable.make` for organization-scoped data (includes `organizationId` foreign key)
- Use `Table.make` for global entities (users, sessions, system tables)

### Custom Binary Columns
- `bytea` — Stores `Uint8Array` directly, ~33% storage savings vs Base64
- `byteaBase64` — Stores as bytea but exposes Base64 string interface for API compatibility

---
path: packages/iam/tables
summary: IAM Drizzle tables, enums, relations - multi-tenant aware with type-checked domain alignment
tags: [iam, tables, drizzle, postgres, effect, multi-tenant]
---

# @beep/iam-tables

Supplies IAM-specific Drizzle tables, enums, and relations layered on shared table factories. Bridges `@beep/iam-domain` entity codecs to persistent storage with compile-time type alignment via `_check.ts`. Exports `IamDbSchema` namespace for typed database access.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
| @beep/iam-domain  | --> | @beep/iam-tables  | --> | @beep/iam-server  |
| (entity schemas)  |     | (Drizzle tables)  |     | (Db.make Layer)   |
|-------------------|     |-------------------|     |-------------------|
        |                         |
        |                         v
        |                 |-------------------|
        |                 | Better Auth       |
        |                 | (drizzleAdapter)  |
        |                 |-------------------|
        v
|-------------------|
| @beep/shared-     |
| tables (OrgTable) |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/schema.ts` | Aggregates tables + relations into `IamDbSchema` |
| `src/relations.ts` | Drizzle relation definitions by resource family |
| `src/_check.ts` | Compile-time type alignment with domain models |
| `tables/account.table.ts` | OAuth account linkage |
| `tables/session.table.ts` | Session tokens with expiry |
| `tables/member.table.ts` | Organization membership |
| `tables/invitation.table.ts` | Membership invitations |
| `tables/passkey.table.ts` | WebAuthn credentials |
| `tables/apiKey.table.ts` | API key hashes |
| `tables/oauth*.table.ts` | OAuth artifacts (AccessToken, Application, Consent) |
| `tables/ssoProvider.table.ts` | Enterprise SSO config |

## Usage Patterns

### Define Tenant-Scoped Table
```typescript
import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "@beep/shared-tables";
import { IamEntityIds } from "@beep/shared-domain";

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

### Query with Effect Layer
```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { IamDb } from "@beep/iam-server/db/Db";
import { IamDbSchema } from "@beep/iam-tables";

export const listActiveMembers = Effect.gen(function* () {
  const { db } = yield* IamDb.IamDb;
  const rows = yield* db
    .select({ memberId: IamDbSchema.member.id, role: IamDbSchema.member.role })
    .from(IamDbSchema.member);
  return F.pipe(rows, A.map((row) => row.memberId));
});
```

### Add Type Check Coverage
```typescript
import type { NotificationPreference } from "@beep/iam-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelect: typeof NotificationPreference.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.notificationPreference>;
export const _checkInsert: typeof NotificationPreference.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.notificationPreference>;
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `OrgTable.make` for tenant-scoped | Auto-wires `organizationId` FK with cascade semantics |
| `Table.make` for global artifacts | `rateLimit`, `walletAddress` not org-bound |
| Domain kit enum factories | `Member.makeMemberRolePgEnum` keeps PG enums aligned |
| `_check.ts` type assertions | Compile-time catch of Drizzle/domain drift |
| Re-export shared tables | Single `IamDbSchema` namespace for consumers |

## Dependencies

**Internal**: `@beep/iam-domain` (entities), `@beep/shared-domain` (EntityIds), `@beep/shared-tables` (OrgTable, Table factories)

**External**: `drizzle-orm`, `effect`, `@effect/sql`, `@effect/experimental`

## Related

- **AGENTS.md** - Detailed contributor guidance with migration patterns and gotchas
- **@beep/iam-domain** - Source domain models these tables persist
- **@beep/iam-server** - Consumes `IamDbSchema` via `Db.make`
- **packages/_internal/db-admin** - Migration coordination

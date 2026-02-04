---
path: packages/_internal/db-admin
summary: Unified Drizzle schema aggregator and migration host for cross-slice database admin tooling
tags: [database, drizzle, migrations, internal, testcontainers]
---

# @beep/db-admin

Internal package that aggregates all slice Drizzle schemas into a single source of truth for migrations, seeding, and admin tooling. Provides Testcontainers-based Postgres harnesses for integration testing.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|   IAM Tables      | --> |                   | --> |    AdminDb        |
|-------------------|     |                   |     |    (Layer)        |
                          |   schema.ts       |     |-------------------|
|-------------------|     |   (unified)       |            |
|  Documents Tables | --> |                   |            v
|-------------------|     |-------------------|     |-------------------|
                                 |                  |  drizzle-kit      |
|-------------------|            |                  |  (generate/       |
|  Knowledge Tables | ---------->|                  |   migrate/push)   |
|-------------------|            |                  |-------------------|
                                 |
|-------------------|            v
|  Calendar/Comms/  |     |-------------------|
|  Customization    | --> |   relations.ts    |
|-------------------|     |   (merged)        |
                          |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/db/AdminDb.ts` | Context tag and Layer providing unified Drizzle client for tooling |
| `src/schema.ts` | Root barrel re-exporting all tables, relations, and custom columns |
| `src/tables.ts` | Aggregates table exports from all slice `-tables` packages |
| `src/relations.ts` | Unified relations for shared tables (user, organization, team) |
| `src/slice-relations.ts` | Re-exports slice-specific relations from each domain |
| `drizzle/` | Generated SQL migrations and journal consumed by CI/tests |
| `drizzle.config.ts` | Drizzle Kit entrypoint expecting `DB_PG_URL` via dotenvx |
| `test/container.ts` | Testcontainers Layer provisioning Postgres 15 + pg_uuidv7 |

## Usage Patterns

### Merging AdminDb into Tooling Runtime

```typescript
import { AdminDb } from "@beep/db-admin/db";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";

const ToolRuntime = Layer.mergeAll(
  AdminDb.AdminDb.Live
);

const listUsers = Effect.gen(function* () {
  const adminDb = yield* AdminDb.AdminDb;
  const rows = yield* adminDb.db.select().from(adminDb.schema.user);
  return F.pipe(rows, A.head);
});
```

### Integration Testing with Testcontainers

```typescript
import { PgTest } from "@beep/db-admin/test/container";
import { layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

layer(PgTest.Live, { timeout: Duration.seconds(60) })("repo tests", (it) => {
  it.effect("queries work", () =>
    Effect.gen(function* () {
      const adminDb = yield* AdminDb.AdminDb;
      const rows = yield* adminDb.db.select().from(adminDb.schema.user);
      // assertions
    })
  );
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `_internal` designation | Prevents production apps from importing; forces slice-specific Layers |
| Unified relations in `relations.ts` | Shared tables need combined perspectives from all slices for joins |
| Slice relations re-exported separately | Preserves slice ownership while enabling db-admin queries |
| `Layer.scoped` for AdminDb.Live | Enables memoization and proper resource lifecycle in tooling |
| dotenvx for secrets | Consistent environment handling without hardcoded credentials |

## Dependencies

**Internal**: `@beep/shared-server`, `@beep/shared-tables`, `@beep/iam-tables`, `@beep/documents-tables`, `@beep/calendar-tables`, `@beep/comms-tables`, `@beep/customization-tables`, `@beep/knowledge-tables`, `@beep/iam-server`, `@beep/documents-server`

**External**: `drizzle-orm`, `drizzle-kit`, `@effect/sql-pg`, `@effect/sql-drizzle`, `@testcontainers/postgresql`

## Related

- **AGENTS.md** - Detailed contributor guidance including security, gotchas, and migration pitfalls
- `packages/shared/server/AGENTS.md` - Production runtime DB patterns
- `packages/shared/tables/AGENTS.md` - Table definition conventions

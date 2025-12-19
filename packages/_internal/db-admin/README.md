# @beep/db-admin

Internal package for database migrations, schema aggregation, and admin tooling. Consolidates Drizzle schemas from all slices into a single source of truth for migration generation and database administration.

## Purpose

This package aggregates Drizzle schemas across all vertical slices (IAM, documents, shared) to enable:
- Unified migration generation via `drizzle-kit`
- Admin database access for tooling, seeding, and diagnostics
- Cross-slice relationship definitions
- Test database provisioning for integration tests

Lives under `_internal` because it is **not shipped to production apps**. Applications should import schemas through their slice-specific packages (`@beep/iam-tables`, `@beep/documents-tables`, `@beep/shared-tables`) or database layers (`@beep/iam-server/db`, `@beep/documents-server/db`).

## Key Exports

| Export | Description |
|--------|-------------|
| `AdminDb.AdminDb` | Effect Context tag exposing the unified database layer for admin tooling |
| `AdminDb.AdminDb.Live` | Layer providing admin database access with the full schema barrel |
| Schema barrel (`src/schema.ts`) | Re-exports all tables from IAM, documents, and shared slices for drizzle-kit |
| Unified relations (`src/relations.ts`) | Merged Drizzle relations for shared tables (user, organization, team) |
| Migration SQL (`drizzle/*.sql`) | Generated migrations and journal maintained by drizzle-kit |

**Note**: This package does not export a main index file. Import directly from subpaths:
- `@beep/db-admin/Db` for AdminDb service
- Schema and relations are consumed internally by drizzle-kit via `src/schema.ts`

## Architecture Fit

- **Vertical Slice Isolation**: Apps never import from this package; they use their slice-specific layers
- **Single Migration Source**: All slices contribute schemas; this package generates the unified migration SQL
- **Admin Tooling**: Seeds, data scrubbers, reset scripts, and CLI utilities compose `AdminDb.Live`
- **Test Infrastructure**: Integration tests can provision real Postgres instances with full migrations applied

## Package Structure

```
packages/_internal/db-admin/
├── src/
│   ├── Db/
│   │   ├── AdminDb.ts       # Admin database Context tag and Layer
│   │   └── index.ts         # Re-exports AdminDb namespace
│   ├── schema.ts            # Schema barrel for drizzle-kit
│   └── relations.ts         # Unified cross-slice relations
├── drizzle/
│   ├── 0000_*.sql          # Generated migration SQL
│   └── meta/               # Drizzle migration journal
├── drizzle.config.ts       # Drizzle kit configuration
├── test/
│   ├── container.ts        # Testcontainers integration Layer
│   ├── AccountRepo.test.ts # Repository integration test
│   ├── iam/                # IAM slice test fixtures
│   ├── documents/          # Documents slice test fixtures
│   └── shared/             # Shared test fixtures
└── package.json            # Admin tooling scripts
```

## Usage

### Admin Database Layer in Tooling

Compose `AdminDb.Live` when building admin runtimes, seeds, or data utilities:

```typescript
import { AdminDb } from "@beep/db-admin/Db";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";

const ToolRuntime = Layer.mergeAll(
  AdminDb.AdminDb.Live
);

export const listUserEmails = Effect.gen(function* () {
  const adminDb = yield* AdminDb.AdminDb;
  const rows = yield* adminDb.db.select().from(adminDb.schema.user);
  return F.pipe(rows, A.map((row) => row.email));
});
```

Access all tables through `adminDb.schema`:
- Shared tables: `adminDb.schema.user`, `adminDb.schema.organization`, `adminDb.schema.team`
- IAM tables: `adminDb.schema.account`, `adminDb.schema.session`, `adminDb.schema.member`, etc.
- Documents tables: `adminDb.schema.document`, `adminDb.schema.documentFile`, `adminDb.schema.knowledgeSpace`, etc.

### Migration Workflow

From `packages/_internal/db-admin`:

```bash
# 1. Generate migrations from schema changes
bun run db:generate

# 2. Apply migrations to database
bun run db:migrate

# 3. Push schema directly (use sparingly - prefer migrations)
bun run db:push

# 4. Open Drizzle Studio UI
bun run db:studio
```

All commands use `dotenvx` to load `DB_PG_URL` from the repo root `.env` file.

### Schema Barrel Structure

The schema barrel (`src/schema.ts`) re-exports:
1. All tables from `@beep/shared-tables/tables`
2. All tables from `@beep/iam-tables/tables`
3. All tables from `@beep/documents-tables/tables`
4. Unified relations from `./relations.ts`
5. Slice-specific relations that don't conflict

The unified relations (`src/relations.ts`) merge cross-slice relationships for shared tables:
- `userRelations`: Combines IAM relations (accounts, sessions, memberships) with documents relations (documents, files, comments)
- `organizationRelations`: Merges ownership, teams, and slice-specific entities
- `teamRelations`: Combines IAM membership with documents workspace relations

This prevents Drizzle warnings about duplicate relation definitions while maintaining type safety.

## What Belongs Here

- **Schema aggregation**: Re-export tables from all slices for drizzle-kit
- **Unified relations**: Merge cross-slice relationships for shared tables
- **Admin database layer**: Single Context tag for tooling access
- **Migration artifacts**: Generated SQL and journal maintained by drizzle-kit
- **Integration test infrastructure**: Testcontainers layers, repository tests, test fixtures

## What Must NOT Go Here

- **Production app imports**: Apps should never depend on this package
- **Slice-specific logic**: Business rules belong in slice domain/server packages
- **Schema definitions**: Define tables in slice packages, not here (this is a barrel only)
- **General test utilities**: Use `@beep/testkit` for shared test utilities (this package contains integration test infrastructure only)

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `drizzle-orm` | ORM and type generation |
| `drizzle-kit` | Migration CLI and schema introspection |
| `@effect/sql`, `@effect/sql-pg`, `@effect/sql-drizzle` | SQL layer integration |
| `@beep/shared-tables` | Shared table definitions (user, org, team) |
| `@beep/iam-tables` | IAM slice table definitions |
| `@beep/documents-tables` | Documents slice table definitions |
| `@beep/shared-server` | Database factory (`Db.make`) |
| `@testcontainers/postgresql` | Test container provisioning (currently unused) |

## Development

```bash
# Type check
bun run --filter @beep/db-admin check

# Lint
bun run --filter @beep/db-admin lint

# Lint and auto-fix
bun run --filter @beep/db-admin lint:fix

# Run tests
bun run --filter @beep/db-admin test

# Build package
bun run --filter @beep/db-admin build
```

## Guidelines for Maintenance

### When Slices Add/Remove Tables

1. Update `src/schema.ts` to export the new table
2. If the table has relationships to shared tables (user, org, team), update `src/relations.ts`
3. Run `bun run db:generate` to create migration SQL
4. Review the generated migration for unintended changes
5. Commit both `src/schema.ts` and `drizzle/**` files together

### When Adding Cross-Slice Relations

If a new slice needs to reference shared tables:

1. Define slice-specific relations in the slice's `relations.ts`
2. Import needed tables and relation helpers in `src/relations.ts`
3. Merge the new relations into `userRelations`, `organizationRelations`, or `teamRelations`
4. Export slice-specific non-conflicting relations in `src/schema.ts`

### Configuration Notes

- `drizzle.config.ts` points to `src/schema.ts` as the schema source
- `DB_PG_URL` environment variable is loaded from root `.env` via `dotenvx`
- `casing: "camelCase"` ensures Drizzle uses camelCase column names
- Migration output directory: `./drizzle`
- Drizzle dialect: `postgresql`

### Known Issues

- **Missing db:reset script**: `package.json` references `src/scripts/ResetDatabase.ts` which does not exist. Either implement the script or remove the package.json entry.
- **Incorrect Context tag**: `AdminDb.ts` uses tag `"@beep/documents-server/AdminDb"` but should be `"@beep/db-admin/AdminDb"`
- **No main index**: Package lacks `src/index.ts`, requiring direct subpath imports

### Effect Patterns Required

All tooling scripts and tests must follow Effect-first conventions:

```typescript
// ✅ Required Effect patterns
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

// Use Effect collections
F.pipe(users, A.map((u) => u.email));
F.pipe(users, A.filter((u) => u.active));
F.pipe(email, Str.toLowerCase);

// ❌ Forbidden - no native methods
users.map((u) => u.email);
users.filter((u) => u.active);
email.toLowerCase();
```

**Key requirements**:
- Use Effect namespace imports (`Effect`, `Layer`, `F`, `A`, `Str`, etc.)
- Use `F.pipe` for composition, never method chaining
- Use Effect collections (`A.map`, `A.filter`) instead of native array methods
- Use Effect string utilities (`Str.split`, `Str.trim`) instead of native methods

## Integration Points

| Package | Relationship |
|---------|--------------|
| `@beep/shared-tables` | Imports shared table definitions (user, organization, team) |
| `@beep/iam-tables` | Imports IAM slice Drizzle schemas and relations |
| `@beep/documents-tables` | Imports Documents slice Drizzle schemas and relations |
| `@beep/shared-server` | Uses `Db.make` factory to create AdminDb service |
| `@beep/iam-server` | Test layer composes IamDb and IamRepos |
| `@beep/documents-server` | Test layer composes DocumentsDb and DocumentsRepos |
| `@beep/testkit` | Provides Effect testing utilities for integration tests |
| `@testcontainers/postgresql` | Provisions ephemeral Postgres for integration tests |

## Further Reading

- See `AGENTS.md` for agent-specific guidance, surface maps, and implementation patterns
- See `packages/shared/tables/AGENTS.md` for table factory patterns
- See `packages/shared/server/AGENTS.md` for database layer conventions

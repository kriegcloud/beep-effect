# Handoff P1.5: Drizzle Migrations for Neon PostgreSQL

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,200 | OK |
| Episodic | 1,000 | ~300 | OK |
| Semantic | 500 | ~250 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 1.5 Goal
Ensure the better-auth tables exist in Neon PostgreSQL and establish a reliable, automated Drizzle migration pipeline. P0 defined the schema code (`schema.ts`, `drizzle.config.ts`) and documented manual `drizzle-kit push` commands, but **table creation was never automated or verified** — the P0 success criterion "Drizzle schema generated and migrations applied" remains unchecked. This phase takes ownership of actually creating the tables and setting up the migration infrastructure so future schema changes are safe, tracked, and automated.

### Problem Statement
P0 created the Drizzle schema code but left table creation as a manual step that may or may not have been executed:
- **Tables may not exist** — P0 documents `drizzle-kit push` as a manual command; no verification that it was run against the Neon database. If the Neon project was reprovisioned via SST, or the P0 agent hit a credential issue, or the step was simply skipped, the auth tables (user, session, account, verification) don't exist.
- **No migration history** — `apps/web/drizzle/` is empty (no SQL migration files were ever generated)
- **No CI/CD automation** — `.github/workflows/check.yml` and `release.yml` have zero migration steps
- **No Vercel build integration** — `next build` does not run migrations
- **No safety net** — schema changes are applied manually with no record, no rollback path
- **`drizzle-kit push` is destructive** — it can drop columns/tables without warning in production

**This phase is the single source of truth for "the Neon database schema matches the code."**

### Deliverables
1. `apps/web/drizzle/` — Initial migration files generated from current schema (baseline)
2. `apps/web/src/lib/db/migrate.ts` — Migration runner script using `drizzle-orm/neon-http/migrator`
3. `apps/web/package.json` — New scripts: `db:migrate`, `db:migrate:check`
4. `.github/workflows/check.yml` — Migration drift check (generate + diff, fail if uncommitted)
5. Vercel build integration — migrations run automatically before `next build`
6. `apps/web/drizzle.config.ts` — Updated if needed for migration output directory
7. `outputs/p1.5-migrations/setup-log.md` — Documentation of migration setup

### Success Criteria
- [ ] `apps/web/drizzle/` contains baseline migration SQL files committed to git
- [ ] `bun run db:migrate` applies pending migrations to Neon via `DATABASE_URL_UNPOOLED`
- [ ] `bun run db:migrate:check` exits non-zero if schema.ts has changes not captured in migration files
- [ ] CI (`check.yml`) runs migration drift check — PRs with unapplied schema changes fail
- [ ] Vercel build runs migrations before `next build` (via build command override or custom script)
- [ ] Existing auth tables (user, session, account, verification) are unaffected (baseline migration is additive only)
- [ ] `drizzle-kit push` is removed or demoted to local-dev-only convenience

### Implementation Notes

**Strategy: `drizzle-kit migrate` (file-based migrations)**

Drizzle Kit supports two workflows:
- `push` — Direct schema sync (no files, no history, dangerous in production)
- `generate` + `migrate` — SQL migration files in `drizzle/`, applied in order (safe, auditable)

We switch to the latter. The `drizzle-orm/neon-http/migrator` runs migrations via the Neon HTTP driver (no TCP connection needed, works in serverless/CI).

**1. Generate baseline migration**
```bash
cd apps/web
DATABASE_URL_UNPOOLED="<neon-direct-url>" npx drizzle-kit generate
```
This creates `drizzle/0000_<name>.sql` with the current schema. Since tables already exist in Neon, the first run of `migrate` will record them as applied without re-executing (Drizzle tracks applied migrations in a `__drizzle_migrations` journal table).

> **Important:** If the existing Neon database was created via `push` (no journal table), you need to handle the baseline carefully. Option A: Use `drizzle-kit generate` to create the SQL, then mark it as already applied. Option B: Drop and recreate (only safe if auth tables are empty or expendable in dev). See "Baseline Strategy" section below.

**2. Migration runner (`apps/web/src/lib/db/migrate.ts`)**
```ts
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"

const sql = neon(process.env.DATABASE_URL_UNPOOLED!)
const db = drizzle({ client: sql })

async function main() {
  console.log("Running migrations...")
  await migrate(db, { migrationsFolder: "./drizzle" })
  console.log("Migrations complete.")
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
```

**3. Package.json scripts**
```jsonc
{
  "scripts": {
    // existing
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",  // keep for local convenience only
    "db:studio": "drizzle-kit studio",
    // new
    "db:migrate": "tsx src/lib/db/migrate.ts",
    "db:migrate:check": "drizzle-kit check"
  }
}
```

> **Note on runner:** `tsx` is needed to execute TypeScript directly. Alternatively, use `bun run src/lib/db/migrate.ts` if the Vercel build environment has bun, or compile to JS first. Evaluate what's available in the Vercel build step — `npx tsx` is the safest portable option.

**4. Vercel build command override**

In `apps/web/package.json` or `vercel.json`, override the build command to run migrations first:

Option A — package.json build script (preferred):
```jsonc
{
  "scripts": {
    "build": "npx tsx src/lib/db/migrate.ts && next build --turbopack"
  }
}
```

Option B — vercel.json:
```jsonc
{
  "buildCommand": "cd apps/web && npx tsx src/lib/db/migrate.ts && next build --turbopack"
}
```

> **Why at build time?** Vercel builds have access to env vars (including `DATABASE_URL_UNPOOLED`). Running migrations in the build step ensures the database schema is current before the app deploys. This is the standard pattern for Neon + Drizzle on Vercel. Vercel's build step runs once per deployment, not per function invocation.

> **SST consideration:** `DATABASE_URL_UNPOOLED` is already set as a Vercel env var by `infra/web.ts`. No SST changes needed — the build command just uses it.

**5. CI migration drift check (`.github/workflows/check.yml`)**

Add a step to the existing `quality` job:

```yaml
- name: Check migration drift
  working-directory: apps/web
  run: npx drizzle-kit check
```

`drizzle-kit check` compares `schema.ts` against the latest migration files in `drizzle/`. If someone modifies the schema without generating a new migration, the check fails. This prevents deploying code that expects schema changes that haven't been migrated.

> **No database connection needed** — `drizzle-kit check` is purely local (compares files). No secrets required in CI.

**6. Baseline strategy for existing database**

The Neon dev database was created via `drizzle-kit push` (no `__drizzle_migrations` table). When `migrate()` runs the baseline migration, it will try to CREATE tables that already exist and fail.

**Recommended approach:**
1. Generate the baseline: `npx drizzle-kit generate` (creates `drizzle/0000_*.sql`)
2. Run `migrate()` against the existing database — it will create the `__drizzle_migrations` journal table and attempt the baseline SQL
3. If tables already exist, two options:
   - **Option A (clean slate):** Drop all auth tables first (`DROP TABLE IF EXISTS verification, account, session, "user" CASCADE;`), then run migrate. Only safe if no real user data exists yet.
   - **Option B (mark as applied):** Manually insert the baseline migration hash into the `__drizzle_migrations` journal table so Drizzle thinks it's already been applied. Then future migrations run normally.
   - **Option C (use `drizzle-kit push` one last time):** Run `push` to ensure schema matches, then `generate` to create the baseline, then manually seed the journal. This is the safest for existing data.

Since this is a dev environment with likely no real users yet, **Option A is simplest**. For production, use Option B or C.

### Dependencies to Install
- `tsx` (dev) — for running TypeScript migration script directly (if not using bun in Vercel build)

> Alternatively, if the project already has bun available in Vercel's build step, the migrate script can run via `bun run src/lib/db/migrate.ts` with no additional dependency.

### Required Environment Variables
No new env vars. Uses existing:
- `DATABASE_URL_UNPOOLED` — Neon direct connection string (already provisioned by SST IaC)

### File Inventory

| File | Action | Description |
|------|--------|-------------|
| `apps/web/drizzle/*.sql` | Create | Baseline + future migration SQL files (committed to git) |
| `apps/web/drizzle/meta/*.json` | Create | Migration journal metadata (committed to git) |
| `apps/web/src/lib/db/migrate.ts` | Create | Migration runner script |
| `apps/web/package.json` | Edit | Add `db:migrate`, `db:migrate:check` scripts; update `build` |
| `apps/web/drizzle.config.ts` | Verify | Confirm `out: "./drizzle"` is correct (already set) |
| `.github/workflows/check.yml` | Edit | Add migration drift check step to `quality` job |
| `outputs/p1.5-migrations/setup-log.md` | Create | Setup documentation |

### Sequencing

This phase should run **after P1** (FalkorDB data migration) and **before P2** (which may add new tables/columns for the knowledge graph features). The migration pipeline must be in place before any schema evolution happens.

```
P0 (auth+db setup) -> P1 (FalkorDB data) -> P1.5 (migration pipeline) -> P2 (toolkit+service)
```

## Episodic Memory

### From P0
- Database bootstrapped via `drizzle-kit push` (no migration files)
- `apps/web/drizzle/` directory is empty
- 4 auth tables exist in Neon: user, session, account, verification
- `drizzle.config.ts` already configured with `out: "./drizzle"` and `DATABASE_URL_UNPOOLED`
- `db:generate`, `db:push`, `db:studio` scripts exist in package.json

## Semantic Memory

### Drizzle Migration Patterns (Neon)
- `drizzle-orm/neon-http/migrator` — HTTP-based migrator (no TCP, works in serverless/CI)
- `drizzle-kit generate` — creates SQL files from schema diff (local, no DB connection)
- `drizzle-kit check` — verifies schema.ts matches latest migration files (local, no DB)
- `drizzle-kit migrate` — applies pending migrations (needs DB connection)
- Migration files: `drizzle/XXXX_<name>.sql` + `drizzle/meta/_journal.json`
- Journal table: `__drizzle_migrations` in the target database
- Always use `DATABASE_URL_UNPOOLED` (direct connection) for migrations, NOT pooled

### Vercel Build + Migrations
- Vercel builds have access to env vars (set by SST IaC)
- Migrations run once per deployment in the build step (before `next build`)
- Safe: if migration fails, build fails, deployment is rolled back automatically
- No cold-start penalty — migrations don't run at function invocation time

## Procedural Memory

### References
- Drizzle migrations docs: https://orm.drizzle.team/docs/migrations
- Drizzle + Neon guide: https://orm.drizzle.team/docs/get-started/neon-new
- Neon serverless driver: https://neon.tech/docs/serverless/serverless-driver
- Vercel build step docs: https://vercel.com/docs/deployments/builds
- Existing drizzle config: `apps/web/drizzle.config.ts`
- Existing schema: `apps/web/src/lib/db/schema.ts`
- SST web infra (sets env vars): `infra/web.ts`

/**
 * Post-generate script that injects required PostgreSQL extensions,
 * admin roles, and RLS policies into generated migration files.
 *
 * This script runs after drizzle-kit generate and prepends
 * SQL statements to the first migration file.
 *
 * @module db-admin/scripts/inject-extensions
 */
import { FileSystem } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";

// Prepended at beginning (before tables)
const EXTENSIONS_HEADER = `-- Auto-injected by inject-extensions.ts

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

-- Admin bypass role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_bypass_admin') THEN
    CREATE ROLE rls_bypass_admin WITH BYPASSRLS NOLOGIN;
    COMMENT ON ROLE rls_bypass_admin IS 'Role that bypasses RLS for administrative operations';
  END IF;
END
$$;--> statement-breakpoint

`;

// Appended at end (after tables are created)
const SESSION_RLS_FOOTER = `
-- Session table RLS (uses active_organization_id) - injected by inject-extensions.ts
ALTER TABLE shared_session ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY tenant_isolation_shared_session ON shared_session
  FOR ALL
  USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
`;

const DRIZZLE_DIR = new URL("../../drizzle", import.meta.url).pathname;

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  // Find all SQL migration files
  const files = yield* fs.readDirectory(DRIZZLE_DIR);
  const sqlFiles = F.pipe(
    files,
    A.filter((f) => Str.endsWith(".sql")(f)),
    A.sort(Order.string)
  );

  if (A.isEmptyArray(sqlFiles)) {
    yield* Effect.log("No migration files found, skipping extension injection");
    return;
  }

  // Get the first migration file (0000_*.sql)
  const firstMigration = F.pipe(sqlFiles, A.head, O.getOrThrow);
  const filePath = `${DRIZZLE_DIR}/${firstMigration}`;

  yield* Effect.log(`Checking ${firstMigration} for injected content...`);

  const content = yield* fs.readFileString(filePath);

  // Check if injected content is already present using the marker comment
  const hasInjectedContent = F.pipe(content, Str.includes("Auto-injected by inject-extensions.ts"));

  if (hasInjectedContent) {
    yield* Effect.log("Injected content already present, skipping");
    return;
  }

  // Prepend extensions header and append session RLS footer
  const newContent = EXTENSIONS_HEADER + content + SESSION_RLS_FOOTER;
  yield* fs.writeFileString(filePath, newContent);

  yield* Effect.log(`Injected extensions, admin role, and session RLS into ${firstMigration}`);
});

BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));

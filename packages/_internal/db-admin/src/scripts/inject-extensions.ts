/**
 * Post-generate script that injects required PostgreSQL extensions
 * into generated migration files.
 *
 * This script runs after drizzle-kit generate and prepends
 * CREATE EXTENSION statements to the first migration file.
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

const EXTENSIONS_HEADER = `CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
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

  yield* Effect.log(`Checking ${firstMigration} for extension declarations...`);

  const content = yield* fs.readFileString(filePath);

  // Check if extensions are already present
  if (Str.includes("CREATE EXTENSION")(content)) {
    yield* Effect.log("Extensions already present, skipping injection");
    return;
  }

  // Prepend extensions header
  const newContent = EXTENSIONS_HEADER + content;
  yield* fs.writeFileString(filePath, newContent);

  yield* Effect.log(`Injected pgvector extension into ${firstMigration}`);
});

BunRuntime.runMain(
  program.pipe(Effect.provide(BunContext.layer))
);

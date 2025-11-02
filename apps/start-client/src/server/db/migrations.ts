import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SqliteMigrator } from "@effect/sql-sqlite-bun";
import { PlatformLive } from "@server/plaform.js";
import { Layer } from "effect";
import { DbLayer } from "./client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Migration system for database schema evolution.
 *
 * Migrations are stored in ./migrations/ as TypeScript Effect programs.
 * They run automatically on application startup in order.
 */
export const MigrationsLayer = SqliteMigrator.layer({
  loader: SqliteMigrator.fromFileSystem(join(__dirname, "migrations")),
  table: "effect_sql_migrations",
});

export const MigrationsLive = MigrationsLayer.pipe(Layer.provide([DbLayer, PlatformLive]));

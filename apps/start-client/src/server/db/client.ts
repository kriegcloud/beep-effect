import { SqliteClient } from "@effect/sql-sqlite-bun";
import { Config, Effect, Layer } from "effect";
// biome-ignore lint/suspicious/noShadowRestrictedNames: Effect String module
import * as String from "effect/String";

/**
 * SQLite database client layer for Bun runtime.
 *
 * Features:
 * - Configurable database path via DATABASE_PATH env var (defaults to todos.db)
 * - Automatic case conversion (camelCase ↔ snake_case)
 * - WAL mode for better concurrency
 */
export const DbLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const filename = yield* Config.string("DATABASE_PATH").pipe(Config.withDefault("todos.db"));

    return SqliteClient.layer({
      filename,
      transformQueryNames: String.camelToSnake,
      transformResultNames: String.snakeToCamel,
    });
  })
);

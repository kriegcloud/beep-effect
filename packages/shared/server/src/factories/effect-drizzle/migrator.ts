/**
 * Effect-first migration entrypoint for the Bun SQLite Drizzle adapter.
 *
 * @since 0.0.0
 * @module
 */

import { migrate as migrateBun } from "drizzle-orm/bun-sqlite/migrator";
import type {
  MigrationConfig,
  MigrationFromJournalConfig,
  MigrationsJournal,
  MigratorInitFailResponse,
} from "drizzle-orm/migrator";
import type { AnyRelations, EmptyRelations } from "drizzle-orm/relations";
import { Effect } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import type { EffectDrizzleDatabase } from "./driver.js";
import { effectDrizzleErrorFromUnknown, migratorInitErrorFromExitCode } from "./Errors.js";

const isMigratorInitFailResponse = (input: unknown): input is MigratorInitFailResponse =>
  P.isObject(input) &&
  P.hasProperty("exitCode")(input) &&
  (input.exitCode === "databaseMigrations" || input.exitCode === "localMigrations");

/**
 * Run Drizzle migrations inside an `Effect`.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const migrate = Effect.fn("EffectDrizzle.migrate")(function* <
  TSchema extends Record<string, unknown>,
  TRelations extends AnyRelations = EmptyRelations,
>(
  db: EffectDrizzleDatabase<TSchema, TRelations>,
  config: MigrationConfig | MigrationFromJournalConfig | MigrationsJournal
) {
  const result = yield* Effect.try({
    try: () => {
      if (A.isArray(config)) {
        return migrateBun(db, config);
      }

      if ("migrationsJournal" in config) {
        return migrateBun(db, config);
      }

      return migrateBun(db, config);
    },
    catch: effectDrizzleErrorFromUnknown("Failed to execute Drizzle migrations."),
  });

  if (isMigratorInitFailResponse(result)) {
    return yield* migratorInitErrorFromExitCode(result.exitCode);
  }
});

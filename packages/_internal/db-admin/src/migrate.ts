/**
 * db-admin migration application against a live Postgres-backed Drizzle database.
 *
 * Owns the location of the repo's drizzle-kit migrations so consumers (the
 * desktop chat sidecar, integration harnesses) apply them through a single
 * exported entry point instead of reaching into `db-admin/drizzle` with fragile
 * relative paths.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.0.0
 */

import { fileURLToPath } from "node:url";
import { migrate, PostgresDrizzle } from "@beep/postgres";
import { Effect } from "effect";
import type { PostgresError } from "@beep/postgres";

/**
 * Absolute path to the db-admin drizzle-kit migrations folder, resolved from
 * this package so callers never hand-roll a relative path.
 *
 * @example
 * ```ts
 * import { migrationsFolder } from "@beep/db-admin"
 *
 * console.log(migrationsFolder)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const migrationsFolder: string = fileURLToPath(new URL("../drizzle", import.meta.url));

/**
 * Default schema the db-admin drizzle migration journal is applied into.
 *
 * @example
 * ```ts
 * import { migrationsSchema } from "@beep/db-admin"
 *
 * console.log(migrationsSchema)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const migrationsSchema = "drizzle" as const;

/**
 * Apply the db-admin drizzle migrations against the ambient
 * {@link PostgresDrizzle} database. Idempotent: the drizzle journal skips
 * already-applied migrations on subsequent runs.
 *
 * @example
 * ```ts
 * import { migrateOnBoot } from "@beep/db-admin"
 *
 * console.log(migrateOnBoot)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const migrateOnBoot: Effect.Effect<undefined, PostgresError, PostgresDrizzle> = Effect.gen(function* () {
  const db = yield* PostgresDrizzle;
  yield* migrate(db, { migrationsFolder, migrationsSchema });
  yield* Effect.logInfo("db-admin migrations applied").pipe(
    Effect.annotateLogs({
      component: "db-admin",
      migrationsSchema,
    })
  );
  return undefined;
});

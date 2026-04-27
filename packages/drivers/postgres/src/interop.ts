/**
 * Native Drizzle and Effect Postgres interop helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { EffectDrizzleQueryError, MigratorInitError } from "drizzle-orm/effect-core/errors";
import { Effect } from "effect";
import type { SqlError } from "effect/unstable/sql/SqlError";
import { PostgresError } from "./Postgres.errors.ts";

/**
 * Error union emitted by native Drizzle Effect Postgres migrations.
 *
 * @example
 * ```ts
 * import type { NativeMigrationError } from "@beep/postgres/interop"
 *
 * declare const error: NativeMigrationError
 * void error
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export type NativeMigrationError = EffectDrizzleQueryError | MigratorInitError | SqlError;

/**
 * Native Drizzle Effect Postgres module type.
 *
 * @example
 * ```ts
 * import type { NativePgDrizzleModule } from "@beep/postgres/interop"
 *
 * declare const module: NativePgDrizzleModule
 * void module.makeWithDefaults
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type NativePgDrizzleModule = typeof import("drizzle-orm/effect-postgres");

/**
 * Native Drizzle Effect Postgres migrator module type.
 *
 * @example
 * ```ts
 * import type { NativePgDrizzleMigratorModule } from "@beep/postgres/interop"
 *
 * declare const module: NativePgDrizzleMigratorModule
 * void module.migrate
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type NativePgDrizzleMigratorModule = typeof import("drizzle-orm/effect-postgres/migrator");

/**
 * Lazily load Drizzle's native Effect Postgres module.
 *
 * @example
 * ```ts
 * import { loadNativePgDrizzle } from "@beep/postgres/interop"
 *
 * void loadNativePgDrizzle
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const loadNativePgDrizzle: Effect.Effect<NativePgDrizzleModule, PostgresError> = Effect.tryPromise({
  try: () => import("drizzle-orm/effect-postgres"),
  catch: (cause) => PostgresError.fromUnknown("makeDrizzle", cause),
});

/**
 * Lazily load Drizzle's native Effect Postgres migrator module.
 *
 * @example
 * ```ts
 * import { loadNativePgDrizzleMigrator } from "@beep/postgres/interop"
 *
 * void loadNativePgDrizzleMigrator
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const loadNativePgDrizzleMigrator: Effect.Effect<NativePgDrizzleMigratorModule, PostgresError> =
  Effect.tryPromise({
    try: () => import("drizzle-orm/effect-postgres/migrator"),
    catch: (cause) => PostgresError.fromUnknown("migrate", cause),
  });

/**
 * Native Effect Postgres client namespace.
 *
 * @since 0.0.0
 * @category exports
 */
export * as NativePgClient from "@effect/sql-pg/PgClient";

/**
 * Native Drizzle Effect Postgres database types.
 *
 * @since 0.0.0
 * @category exports
 */
export type { EffectDrizzleConfig, EffectLogger, EffectPgDatabase } from "drizzle-orm/effect-postgres";

/**
 * Postgres-backed Drizzle Effect composition.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PostgresId } from "@beep/identity";
import type * as Pg from "@effect/sql-pg/PgClient";
import type { EffectDrizzleQueryError, MigratorInitError } from "drizzle-orm/effect-core/errors";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { migrate as nativeMigrate } from "drizzle-orm/effect-postgres/migrator";
import type { MigrationConfig } from "drizzle-orm/migrator";
import { Context, Effect, Layer } from "effect";
import type { SqlError } from "effect/unstable/sql/SqlError";
import { PostgresError } from "./Postgres.errors.ts";

const $I = $PostgresId.create("Postgres.drizzle");

type NativeMigrationError = EffectDrizzleQueryError | MigratorInitError | SqlError;

const runNativeMigrate = nativeMigrate as <
  TSchema extends Record<string, unknown>,
  TRelations extends PgDrizzle.EffectDrizzleConfig<TSchema>["relations"],
>(
  db: PostgresDrizzleDatabase<TSchema, TRelations>,
  config: MigrationConfig
) => Effect.Effect<undefined, NativeMigrationError>;

/**
 * Native Drizzle Effect Postgres database value.
 *
 * @example
 * ```ts
 * import type { PostgresDrizzleDatabase } from "@beep/postgres"
 *
 * declare const db: PostgresDrizzleDatabase
 * void db.$client
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PostgresDrizzleDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends
    PgDrizzle.EffectDrizzleConfig<TSchema>["relations"] = PgDrizzle.EffectDrizzleConfig<TSchema>["relations"],
> = PgDrizzle.EffectPgDatabase<TSchema, NonNullable<TRelations>> & {
  readonly $client: Pg.PgClient;
};

/**
 * Configuration accepted by {@link makeDrizzle}.
 *
 * @example
 * ```ts
 * import type { PostgresDrizzleConfig } from "@beep/postgres"
 *
 * const config: PostgresDrizzleConfig = {}
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PostgresDrizzleConfig<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends
    PgDrizzle.EffectDrizzleConfig<TSchema>["relations"] = PgDrizzle.EffectDrizzleConfig<TSchema>["relations"],
> = PgDrizzle.EffectDrizzleConfig<TSchema, NonNullable<TRelations>>;

/**
 * Service key for a default-typed Postgres-backed Drizzle database.
 *
 * @example
 * ```ts
 * import { PostgresDrizzle } from "@beep/postgres"
 *
 * const service = PostgresDrizzle
 * void service
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class PostgresDrizzle extends Context.Service<PostgresDrizzle, PostgresDrizzleDatabase>()($I`PostgresDrizzle`) {}

/**
 * Create a Postgres-backed Drizzle Effect database from a provided PgClient.
 *
 * @example
 * ```ts
 * import { makeDrizzle } from "@beep/postgres"
 *
 * const effect = makeDrizzle()
 * void effect
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeDrizzle = <
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends
    PgDrizzle.EffectDrizzleConfig<TSchema>["relations"] = PgDrizzle.EffectDrizzleConfig<TSchema>["relations"],
>(
  config: PostgresDrizzleConfig<TSchema, TRelations> = {} as PostgresDrizzleConfig<TSchema, TRelations>
) =>
  PgDrizzle.makeWithDefaults<TSchema, NonNullable<TRelations>>(config).pipe(
    Effect.mapError((cause) => PostgresError.fromUnknown("makeDrizzle", cause))
  );

/**
 * Build a Layer for a default-typed Postgres-backed Drizzle database.
 *
 * @example
 * ```ts
 * import { makeDrizzleLayer } from "@beep/postgres"
 *
 * const layer = makeDrizzleLayer()
 * void layer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeDrizzleLayer = (
  config: PostgresDrizzleConfig = {}
): Layer.Layer<PostgresDrizzle, PostgresError, Pg.PgClient> => Layer.effect(PostgresDrizzle, makeDrizzle(config));

/**
 * Run Drizzle Effect Postgres migrations and normalize failures.
 *
 * @example
 * ```ts
 * import { migrate } from "@beep/postgres"
 * import type { PostgresDrizzleDatabase } from "@beep/postgres"
 *
 * declare const db: PostgresDrizzleDatabase
 * const effect = migrate(db, { migrationsFolder: "./drizzle" })
 * void effect
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const migrate = <
  TSchema extends Record<string, unknown>,
  TRelations extends PgDrizzle.EffectDrizzleConfig<TSchema>["relations"],
>(
  db: PostgresDrizzleDatabase<TSchema, TRelations>,
  config: MigrationConfig
): Effect.Effect<undefined, PostgresError> =>
  runNativeMigrate(db, config).pipe(Effect.mapError((cause) => PostgresError.fromUnknown("migrate", cause)));

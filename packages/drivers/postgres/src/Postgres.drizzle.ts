/**
 * Postgres-backed Drizzle Effect composition.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PostgresId } from "@beep/identity";
import type * as Pg from "@effect/sql-pg/PgClient";
import type * as PgDrizzle from "drizzle-orm/effect-postgres";
import type { MigrationConfig } from "drizzle-orm/migrator";
import type { AnyRelations, EmptyRelations } from "drizzle-orm/relations";
import { Context, Effect, Layer } from "effect";
import { dual } from "effect/Function";
import { loadNativePgDrizzle, loadNativePgDrizzleMigrator, type NativeMigrationError } from "./interop.ts";
import { PostgresError } from "./Postgres.errors.ts";

const $I = $PostgresId.create("Postgres.drizzle");

declare const PostgresDrizzleSchema: unique symbol;

type PostgresDrizzleSchemaPhantom<TSchema> = {
  readonly [PostgresDrizzleSchema]?: TSchema;
};

/**
 * Native Drizzle Effect Postgres database value.
 *
 * @example
 * ```ts
 * import type { PostgresDrizzleDatabase } from "@beep/postgres"
 *
 * const readClient = (db: PostgresDrizzleDatabase) => db.$client
 * void readClient
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PostgresDrizzleDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
> = PgDrizzle.EffectPgDatabase<NonNullable<TRelations>> &
  PostgresDrizzleSchemaPhantom<TSchema> & {
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
  TRelations extends AnyRelations = EmptyRelations,
> = PgDrizzle.EffectDrizzlePgConfig<NonNullable<TRelations>> & PostgresDrizzleSchemaPhantom<TSchema>;

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
  TRelations extends AnyRelations = EmptyRelations,
>(
  config: PostgresDrizzleConfig<TSchema, TRelations> = {} as PostgresDrizzleConfig<TSchema, TRelations>
): Effect.Effect<PostgresDrizzleDatabase<TSchema, TRelations>, PostgresError, Pg.PgClient> =>
  loadNativePgDrizzle.pipe(
    Effect.flatMap((pgDrizzle) =>
      pgDrizzle.makeWithDefaults<NonNullable<TRelations>>(config).pipe(
        Effect.map((database) => database as PostgresDrizzleDatabase<TSchema, TRelations>),
        Effect.mapError((cause) => PostgresError.fromUnknown("makeDrizzle", cause))
      )
    )
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
 * const runMigration = (db: PostgresDrizzleDatabase) => {
 *   const effect = migrate(db, { migrationsFolder: "./drizzle" })
 *   const deferred = migrate({ migrationsFolder: "./drizzle" })(db)
 *   return { deferred, effect }
 * }
 * void runMigration
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const migrate: {
  <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(
    db: PostgresDrizzleDatabase<TSchema, TRelations>,
    config: MigrationConfig
  ): Effect.Effect<undefined, PostgresError>;
  (
    config: MigrationConfig
  ): <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(
    db: PostgresDrizzleDatabase<TSchema, TRelations>
  ) => Effect.Effect<undefined, PostgresError>;
} = dual(
  2,
  <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(
    db: PostgresDrizzleDatabase<TSchema, TRelations>,
    config: MigrationConfig
  ): Effect.Effect<undefined, PostgresError> =>
    loadNativePgDrizzleMigrator.pipe(
      Effect.flatMap((migrator) =>
        (
          migrator.migrate as <Schema extends Record<string, unknown>, Relations extends AnyRelations>(
            database: PostgresDrizzleDatabase<Schema, Relations>,
            migrationConfig: MigrationConfig
          ) => Effect.Effect<undefined, NativeMigrationError>
        )(db, config).pipe(Effect.mapError((cause) => PostgresError.fromUnknown("migrate", cause)))
      )
    )
);

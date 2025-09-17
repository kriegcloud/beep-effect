import { serverEnv } from "@beep/core-env/server";
import type * as SqlClient from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as PgClient from "@effect/sql-pg/PgClient";
import { drizzle as _drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Effect } from "effect";
import * as Config from "effect/Config";
import type { ConfigError } from "effect/ConfigError";
import * as Duration from "effect/Duration";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Str from "effect/String";
import type postgres from "postgres";

type DrizzleDb<TFullSchema extends Record<string, unknown> = Record<string, never>> =
  PostgresJsDatabase<TFullSchema> & {
    $client: postgres.Sql<{}>;
  };

import type { ConnectionOptions } from "./types";
export namespace Db {
  export const config = {
    transformQueryNames: Str.camelToSnake,
    transformResultNames: Str.snakeToCamel,
    // - 114: JSON (return as string instead of parsed object)
    // - 1082: DATE
    // - 1114: TIMESTAMP WITHOUT TIME ZONE
    // - 1184: TIMESTAMP WITH TIME ZONE
    // - 3802: JSONB (return as string instead of parsed object)
    types: {
      114: {
        to: 25,
        from: [114],
        parse: F.identity,
        serialize: F.identity,
      },
      1082: {
        to: 25,
        from: [1082],
        parse: F.identity,
        serialize: F.identity,
      },
      1114: {
        to: 25,
        from: [1114],
        parse: F.identity,
        serialize: F.identity,
      },
      1184: {
        to: 25,
        from: [1184],
        parse: F.identity,
        serialize: F.identity,
      },
      3802: {
        to: 25,
        from: [3802],
        parse: F.identity,
        serialize: F.identity,
      },
    },
  };

  export const layer = (config: ConnectionOptions) =>
    PgClient.layer({
      url: config.url,
      ssl: config.ssl,
      transformQueryNames: Str.camelToSnake,
      transformResultNames: Str.snakeToCamel,
    });

  export const Live = Layer.unwrapEffect(
    Effect.gen(function* () {
      return PgClient.layer({
        url: yield* Config.redacted("DB_PG_URL"),
        ssl: yield* Config.boolean("DB_PG_SSL"),
        ...config,
      });
    })
  ).pipe((self) =>
    Layer.retry(
      self,
      Schedule.identity<Layer.Layer.Error<typeof self>>().pipe(
        Schedule.check((input) => input._tag === "SqlError"),
        Schedule.intersect(Schedule.exponential("1 second")),
        Schedule.intersect(Schedule.recurs(2)),
        Schedule.onDecision(([[_error, duration], attempt], decision) =>
          decision._tag === "Continue"
            ? Effect.logInfo(`Retrying database connection in ${Duration.format(duration)} (attempt #${++attempt})`)
            : Effect.void
        )
      )
    )
  );

  export type Db<TFullSchema extends Record<string, unknown> = Record<string, never>> = {
    readonly db: Effect.Effect.Success<ReturnType<typeof PgDrizzle.make<TFullSchema>>>;
    readonly drizzle: DrizzleDb<TFullSchema>;
  };

  type ServiceEffect<TFullSchema extends Record<string, unknown> = Record<string, never>> = Effect.Effect<
    Db<TFullSchema>,
    SqlError | ConfigError,
    SqlClient.SqlClient
  >;
  export const make = <const TFullSchema extends Record<string, unknown> = Record<string, never>>(
    schema: TFullSchema
  ): { readonly serviceEffect: ServiceEffect<TFullSchema> } => {
    const serviceEffect: ServiceEffect<TFullSchema> = Effect.gen(function* () {
      const db = yield* PgDrizzle.make<TFullSchema>({
        schema,
      });
      const drizzle = _drizzle(Redacted.value(serverEnv.db.pg.url), {
        schema,
      });

      return {
        db,
        drizzle,
      };
    });

    return {
      serviceEffect,
    };
  };
}

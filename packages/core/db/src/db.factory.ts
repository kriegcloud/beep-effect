import type * as SqlClient from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as PgClient from "@effect/sql-pg/PgClient";
import { Effect } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type * as Layer from "effect/Layer";
import * as Str from "effect/String";
import type { ConnectionOptions } from "./types";

export namespace Db {
  export type PgLayer = Layer.Layer<PgClient.PgClient | SqlClient.SqlClient, ConfigError | SqlError, never>;
  export const layer = (config: ConnectionOptions) =>
    PgClient.layer({
      url: config.url,
      ssl: config.ssl,
      transformResultNames: Str.snakeToCamel,
    });

  export type Db<TFullSchema extends Record<string, unknown> = Record<string, never>> = {
    readonly db: Effect.Effect.Success<ReturnType<typeof PgDrizzle.make<TFullSchema>>>;
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

      return {
        db,
      };
    });

    return {
      serviceEffect,
    };
  };
}

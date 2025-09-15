import * as DbErrors from "@beep/core-db/errors";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import type * as Scope from "effect/Scope";
import * as pg from "pg";
import type { ConnectionOptions } from "./types";

export const makePool: (config: ConnectionOptions) => Effect.Effect<
  {
    pool: pg.Pool;
    setupConnectionListeners: Effect.Effect<void, DbErrors.DbConnectionLostError, never>;
  },
  never,
  Scope.Scope
> = (config: ConnectionOptions) =>
  Effect.flatMap(
    Effect.acquireRelease(
      Effect.sync(
        () =>
          new pg.Pool({
            connectionString: Redacted.value(config.url),
            ssl: config.ssl,
          })
      ),
      (pool) => Effect.promise(() => pool.end())
    ),
    (pool) =>
      Effect.gen(function* () {
        const setupConnectionListeners = Effect.zipRight(
          Effect.async<void, DbErrors.DbConnectionLostError>((resume) => {
            const onError = (error: unknown) => {
              resume(
                Effect.fail(
                  new DbErrors.DbConnectionLostError({
                    cause: error,
                    message: error instanceof Error ? error.message : "Unknown error",
                  })
                )
              );
            };

            pool.on("error", onError);

            return Effect.sync(() => {
              pool.removeListener("error", onError);
            });
          }),
          Effect.logInfo("[Database client]: Connection error listeners initialized.")
        );

        return {
          pool,
          setupConnectionListeners,
        };
      })
  );

export type DbPoolShape = Effect.Effect.Success<ReturnType<typeof makePool>>;

export class DbPool extends Effect.Tag("DbPool")<DbPool, DbPoolShape>() {
  static readonly Live: (config: ConnectionOptions) => Layer.Layer<DbPool, never, never> = (
    config: ConnectionOptions
  ) => Layer.effect(this, Effect.scoped(makePool(config)));
}

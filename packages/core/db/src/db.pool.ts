import * as DbErrors from "@beep/core-db/errors";
import { serverEnv } from "@beep/core-env/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as pg from "pg";

export const makePool = Effect.flatMap(
  Effect.acquireRelease(
    Effect.sync(
      () =>
        new pg.Pool({
          connectionString: Redacted.value(serverEnv.db.pg.url),
          ssl: serverEnv.db.pg.ssl,
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

export type DbPoolShape = Effect.Effect.Success<typeof makePool>;

export class DbPool extends Effect.Tag("DbPool")<DbPool, DbPoolShape>() {
  static readonly Live = Layer.effect(this, Effect.scoped(makePool));
}

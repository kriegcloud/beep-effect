import * as DbErrors from "@beep/db-scope/errors";
import { serverEnv } from "@beep/env/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as pg from "pg";
export const makePool = Effect.gen(function* () {
  const pool = yield* Effect.acquireRelease(
    Effect.sync(
      () =>
        new pg.Pool({
          connectionString: Redacted.value(serverEnv.db.pg.url),
          ssl: serverEnv.db.pg.ssl,
        })
    ),
    (pool) => Effect.promise(() => pool.end())
  );

  yield* Effect.tryPromise(() => pool.query("SELECT 1")).pipe(
    Effect.timeoutFail({
      duration: "10 seconds",
      onTimeout: () =>
        new DbErrors.DbConnectionLostError({
          cause: new Error("[Database] Failed to connect: timeout"),
          message: "[Database] Failed to connect: timeout",
        }),
    }),
    Effect.catchTag(
      "UnknownException",
      (error) =>
        new DbErrors.DbConnectionLostError({
          cause: error.cause,
          message: "[Database] Failed to connect",
        })
    ),
    Effect.tap(() => Effect.logInfo("[Database client]: Connection to the database established."))
  );

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
});

export type DbPoolShape = Effect.Effect.Success<typeof makePool>;
export class DbPool extends Effect.Tag("DbPool")<DbPool, DbPoolShape>() {
  static readonly Live = Layer.effect(this, Effect.scoped(makePool));
}

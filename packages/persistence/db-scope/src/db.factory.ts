import * as DbErrors from "@beep/db-scope/errors";
import { serverEnv } from "@beep/env/server";
import type { UnsafeTypes } from "@beep/types";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as PgClient from "@effect/sql-pg/PgClient";
import { drizzle } from "drizzle-orm/node-postgres";
import { Cause, Effect, Exit, Option, Runtime } from "effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import * as pg from "pg";
import type { ConnectionOptions, DbClient, ExecuteFn, TransactionClient, TransactionContextShape } from "./types";

export const makeScopedDb = <const TFullSchema extends Record<string, unknown> = Record<string, never>>(
  schema: TFullSchema
) => {
  const makeService = (connectionOpts: ConnectionOptions) =>
    Effect.gen(function* () {
      const TransactionContext = Context.GenericTag<TransactionContextShape<TFullSchema>>("DbScope/TransactionContext");

      const pool = yield* Effect.acquireRelease(
        Effect.sync(
          () =>
            new pg.Pool({
              connectionString: Redacted.value(connectionOpts.url),
              ssl: connectionOpts.ssl,
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

      const db = drizzle(pool, { schema });

      const execute = Effect.fn(<T>(fn: (client: DbClient<TFullSchema>) => Promise<T>) =>
        Effect.tryPromise({
          try: () => fn(db),
          catch: (cause) => {
            const error = DbErrors.DbError.match(cause);
            if (error !== null) {
              return error;
            }
            throw cause;
          },
        })
      );

      const transaction = Effect.fn("Database.transaction")(
        <T, E, R>(txExecute: (tx: TransactionContextShape<TFullSchema>) => Effect.Effect<T, E, R>) =>
          Effect.runtime<R>().pipe(
            Effect.map((runtime) => Runtime.runPromiseExit(runtime)),
            Effect.flatMap((runPromiseExit) =>
              Effect.async<T, DbErrors.DbError | E, R>((resume) => {
                db.transaction(async (tx: TransactionClient<TFullSchema>) => {
                  const txWrapper = (fn: (client: TransactionClient<TFullSchema>) => Promise<UnsafeTypes.UnsafeAny>) =>
                    Effect.tryPromise({
                      try: () => fn(tx),
                      catch: (cause) => {
                        const error = DbErrors.DbError.match(cause);
                        if (error !== null) {
                          return error;
                        }
                        throw cause;
                      },
                    });

                  const provided = Effect.provideService(TransactionContext, txWrapper)(txExecute(txWrapper));

                  const result = await runPromiseExit(provided);
                  Exit.match(result, {
                    onSuccess: (value) => {
                      resume(Effect.succeed(value));
                    },
                    onFailure: (cause) => {
                      if (Cause.isFailure(cause)) {
                        resume(Effect.fail(Cause.originalError(cause) as E));
                      } else {
                        resume(Effect.die(cause));
                      }
                    },
                  });
                }).catch((cause) => {
                  const error = DbErrors.DbError.match(cause);
                  resume(error !== null ? Effect.fail(error) : Effect.die(cause));
                });
              })
            )
          )
      );

      const makeQuery =
        <A, E, R, Input = never>(queryFn: (execute: ExecuteFn<TFullSchema>, input: Input) => Effect.Effect<A, E, R>) =>
        (...args: [Input] extends [never] ? [] : [input: Input]): Effect.Effect<A, E | DbErrors.DbError, R> => {
          const input = args[0] as Input;
          // unsure what to do here. How do we create the transaction context?
          return Effect.serviceOption(TransactionContext).pipe(
            Effect.map(Option.getOrNull),
            Effect.flatMap((txOrNull) => queryFn(txOrNull ?? execute, input))
          );
        };

      return {
        execute,
        transaction,
        setupConnectionListeners,
        makeQuery,
        db,
        pool,
      } as const;
    });

  const makeSql = () => {
    const DrizzlePgClient = PgClient.layer({
      port: serverEnv.db.pg.port,
      host: serverEnv.db.pg.host,
      username: serverEnv.db.pg.user,
      password: serverEnv.db.pg.password,
      ssl: serverEnv.db.pg.ssl,
      transformResultNames: Str.snakeToCamel,
    });

    return PgDrizzle.layer.pipe(Layer.provideMerge(DrizzlePgClient));
  };
  return {
    makeService,
    makeSql,
  };
};

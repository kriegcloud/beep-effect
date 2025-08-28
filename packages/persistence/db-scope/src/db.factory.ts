import type { DbError } from "@beep/db-scope/errors";
import * as DbErrors from "@beep/db-scope/errors";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { Cause, Effect, Exit, Option, Runtime } from "effect";
import * as Context from "effect/Context";
import * as Redacted from "effect/Redacted";
import * as pg from "pg";

export type Config = {
  url: Redacted.Redacted;
  ssl: boolean;
};
export type TransactionClient<TFullSchema extends Record<string, unknown> = Record<string, never>> = PgTransaction<
  NodePgQueryResultHKT,
  TFullSchema,
  ExtractTablesWithRelations<TFullSchema>
>;

export type DbClient<TFullSchema extends Record<string, unknown> = Record<string, never>> =
  NodePgDatabase<TFullSchema> & {
    $client: pg.Pool;
  };

export type TransactionContextShape<TFullSchema extends Record<string, unknown>> = <U>(
  fn: (client: TransactionClient<TFullSchema>) => Promise<U>
) => Effect.Effect<U, DbError>;

export const makeScopedDb = <TFullSchema extends Record<string, unknown> = Record<string, never>>(
  schema: TFullSchema
) => {
  const makeService = (config: Config) =>
    Effect.gen(function* () {
      const TransactionContext = Context.GenericTag<TransactionContextShape<TFullSchema>>("DbScope/TransactionContext");

      const pool = yield* Effect.acquireRelease(
        Effect.sync(
          () =>
            new pg.Pool({
              connectionString: Redacted.value(config.url),
              ssl: config.ssl,
              idleTimeoutMillis: 0,
              connectionTimeoutMillis: 0,
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
                  const txWrapper = (fn: (client: TransactionClient<TFullSchema>) => Promise<any>) =>
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

      type ExecuteFn = <T>(
        fn: (client: DbClient<TFullSchema> | TransactionClient<TFullSchema>) => Promise<T>
      ) => Effect.Effect<T, DbErrors.DbError>;
      const makeQuery =
        <A, E, R, Input = never>(queryFn: (execute: ExecuteFn, input: Input) => Effect.Effect<A, E, R>) =>
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

  return {
    makeService,
  };
};

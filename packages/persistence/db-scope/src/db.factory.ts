import { DbPool } from "@beep/db-scope/db.pool";
import * as DbErrors from "@beep/db-scope/errors";
import type { UnsafeTypes } from "@beep/types";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { Cause, Effect, Exit, Option, Runtime } from "effect";
import * as Context from "effect/Context";
import type { DbClient, ExecuteFn, TransactionClient, TransactionContextShape } from "./types";

export const makeScopedDb = <const TFullSchema extends Record<string, unknown> = Record<string, never>>(
  schema: TFullSchema
) => {
  const makeService = () =>
    Effect.gen(function* () {
      const TransactionContext = Context.GenericTag<TransactionContextShape<TFullSchema>>("DbScope/TransactionContext");

      const { pool, setupConnectionListeners } = yield* DbPool;

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

      const pgDrizzle = yield* PgDrizzle.make<typeof schema>({
        schema: schema,
      });

      return {
        pgDrizzle,
        execute,
        transaction,
        setupConnectionListeners,
        makeQuery,
        db,
        pool,
      } as const;
    })

  return {
    makeService,
  };
};

import { serverEnv } from "@beep/core-env/server";
import type { UnsafeTypes } from "@beep/types";
import type * as SqlClient from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as PgClient from "@effect/sql-pg/PgClient";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as _drizzle } from "drizzle-orm/postgres-js";
import { Cause, Effect, Exit, Option, Runtime } from "effect";
import * as Config from "effect/Config";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Str from "effect/String";
import * as DbErrors from "../errors";
import type {
  ConnectionOptions,
  DbClient,
  ExecuteFn,
  MakeQuery,
  Transaction,
  TransactionClient,
  TransactionContextShape,
} from "../types";

type DrizzleDb<TFullSchema extends Record<string, unknown> = Record<string, never>> = PostgresJsDatabase<TFullSchema>;

export const config = {
  transformQueryNames: Str.camelToSnake,
  transformResultNames: Str.snakeToCamel,
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

export type Db<TFullSchema extends Record<string, unknown>> = {
  readonly db: Effect.Effect.Success<ReturnType<typeof PgDrizzle.make<TFullSchema>>>;
  readonly drizzle: DrizzleDb<TFullSchema>;
  readonly execute: ExecuteFn<TFullSchema>;
  readonly transaction: Transaction<TFullSchema>;
  readonly makeQuery: MakeQuery<TFullSchema>;
};

type ServiceEffect<TFullSchema extends Record<string, unknown>> = Effect.Effect<
  Db<TFullSchema>,
  SqlError | ConfigError,
  SqlClient.SqlClient
>;
export const make = <const TFullSchema extends Record<string, unknown>>(
  schema: TFullSchema
): {
  readonly serviceEffect: ServiceEffect<TFullSchema>;
  readonly TransactionContext: Context.Tag<TransactionContextShape<TFullSchema>, TransactionContextShape<TFullSchema>>;
} => {
  const TransactionContext = Context.GenericTag<TransactionContextShape<TFullSchema>>("DbScope/TransactionContext");
  const serviceEffect: ServiceEffect<TFullSchema> = Effect.gen(function* () {
    const db = yield* PgDrizzle.make<TFullSchema>({
      schema,
    });
    const drizzle = _drizzle(Redacted.value(serverEnv.db.pg.url), {
      schema,
    });

    const execute: ExecuteFn<TFullSchema> = Effect.fn(<T>(fn: (client: DbClient<TFullSchema>) => Promise<T>) =>
      Effect.tryPromise({
        try: () => fn(drizzle),
        catch: (cause) => {
          const error = DbErrors.DbError.match(cause);
          if (error !== null) {
            return error;
          }
          throw cause;
        },
      })
    );

    // const handleDbError = (error: unknown) => {
    //
    // }

    const transaction: Transaction<TFullSchema> = Effect.fn("Database.transaction")(
      <T, E, R>(txExecute: (tx: TransactionContextShape<TFullSchema>) => Effect.Effect<T, E, R>) =>
        Effect.runtime<R>().pipe(
          Effect.map((runtime) => Runtime.runPromiseExit(runtime)),
          Effect.flatMap((runPromiseExit) =>
            Effect.async<T, DbErrors.DbError | E, R>((resume) => {
              drizzle
                .transaction(async (tx: TransactionClient<TFullSchema>) => {
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
                })
                .catch((cause) => {
                  const error = DbErrors.DbError.match(cause);
                  resume(error !== null ? Effect.fail(error) : Effect.die(cause));
                });
            })
          )
        )
    );
    const makeQuery: MakeQuery<TFullSchema> =
      <A, E, R, Input = never>(queryFn: (execute: ExecuteFn<TFullSchema>, input: Input) => Effect.Effect<A, E, R>) =>
      (...args: [Input] extends [never] ? [] : [input: Input]): Effect.Effect<A, E, R> => {
        const input = args[0] as Input;
        return Effect.serviceOption(TransactionContext).pipe(
          Effect.map(Option.getOrNull),
          Effect.flatMap((txOrNull) => queryFn(txOrNull ?? execute, input))
        );
      };

    return {
      db,
      drizzle,
      execute,
      transaction,
      makeQuery,
    };
  });

  return {
    serviceEffect,
    TransactionContext,
  };
};

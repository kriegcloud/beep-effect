import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Runtime from "effect/Runtime";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import {drizzle} from "drizzle-orm/node-postgres";
import * as pg from "pg";
import * as Match from "effect/Match";
import type {NodePgQueryResultHKT} from "drizzle-orm/node-postgres";
import type {
  PgTransaction,
} from "drizzle-orm/pg-core";
import {$SharedInfraId} from "@beep/identity/packages";
import * as A from "effect/Array";
import {pipe} from "effect/Function";
import {thunk, thunkNull} from "@beep/utils/thunk";
import * as Str from "effect/String";
import * as S from "effect/Schema";
import * as Redacted from "effect/Redacted";
import type {ConnectionOptions} from "./types";
import type {NodePgDatabase} from "drizzle-orm/node-postgres";
import {PgErrorCodeFromKey} from "./pg-error-enum";
import type {ExtractTablesWithRelations, Logger as DrizzleLogger,} from "drizzle-orm";
import {format} from "sql-formatter";

const $I = $SharedInfraId.create("Db");

export class StringifySqlParamError extends Data.TaggedError("StringifySqlParamError")<{
  readonly param: unknown;
  readonly cause: unknown;
}> {
}

export class ConnectionContext extends Context.Tag($I`ConnectionContext`)<
  ConnectionContext,
  ConnectionOptions
>() {
  static readonly Live = (connection: ConnectionOptions) => Layer.sync(this)(thunk(connection));
}

const connectionContextLayer = Layer.effect(ConnectionContext, Effect.gen(function* () {
  const connectionString = yield* Config.redacted("DB_PG_URL");
  const ssl = yield* Config.boolean("DB_PG_SSL");

  return {
    connectionString,
    ssl
  };
}));

export class Logger extends Effect.Service<Logger>()(
  $I`Logger`,
  {
    effect: pipe(
      Effect.Do,
      Effect.bind("logQuery", thunk(Effect.gen(function* () {
          const runtime = yield* Effect.runtime();

          const logQuery: DrizzleLogger["logQuery"] = (query, params) => Effect.gen(function* () {
            const stringifiedParams = A.map(params, (p) => {
              try {
                return JSON.stringify(p);
              } catch {
                return String(p);
              }
            });

            const paramsStr = stringifiedParams.length
              ? ` -- params: [${pipe(stringifiedParams, A.join(", "))}]`
              : Str.empty;

            yield* Effect.logInfo(`[Database]: Query: ${format(query)}${paramsStr}`);
          }).pipe(Runtime.runSync(runtime));

          return logQuery;
        }))
      ))
  }
) {
}

export class PoolError extends S.TaggedError<PoolError>($I`PoolError`)("PoolError", {
  cause: S.Defect,
}) {
}

export class ConnectionTimeoutError extends S.TaggedError<ConnectionTimeoutError>($I`ConnectionTimeoutError`)("ConnectionTimeoutError", {}) {
}
export class DatabaseConnectionLostError extends Data.TaggedError("DatabaseConnectionLostError")<{
  cause: unknown;
  message: string;
}> {}
export const makePoolService = Effect.fn("makePoolService")(function* (
  {ssl, connectionString}: ConnectionOptions
) {
  const pool = yield* Effect.acquireRelease(
      Effect.sync(
        () =>
          new pg.Pool({
            connectionString: Redacted.value(connectionString),
            ssl,
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 0,
          }),
      ),
      (pool) => Effect.promise(() => pool.end()),
    );

    yield* Effect.tryPromise(() => pool.query("SELECT 1")).pipe(
      Effect.timeoutFail({
        duration: "10 seconds",
        onTimeout: () =>
          new DatabaseConnectionLostError({
            cause: new Error("[Database] Failed to connect: timeout"),
            message: "[Database] Failed to connect: timeout",
          }),
      }),
      Effect.catchTag(
        "UnknownException",
        (error) =>
          new DatabaseConnectionLostError({
            cause: error.cause,
            message: "[Database] Failed to connect",
          }),
      ),
      Effect.tap(() =>
        Effect.logInfo("[Database client]: Connection to the database established."),
      ),
    );

    const setupConnectionListeners = Effect.zipRight(
      Effect.async<void, DatabaseConnectionLostError>((resume) => {
        pool.on("error", (error) => {
          resume(
            Effect.fail(
              new DatabaseConnectionLostError({
                cause: error,
                message: error.message,
              }),
            ),
          );
        });

        return Effect.sync(() => {
          pool.removeAllListeners("error");
        });
      }),
      Effect.logInfo("[Database client]: Connection error listeners initialized."),
      {
        concurrent: true,
      },
    );
  return {
    pool,
    setupConnectionListeners,
  };
});

export class PoolService extends Effect.Service<PoolService>()(
  $I`PoolService`,
  {
    accessors: true,
    dependencies: [connectionContextLayer],
    scoped: ConnectionContext.pipe(
      Effect.flatMap(makePoolService)
    )
  }
) {
  static readonly Live = (connection: ConnectionOptions) => Layer.effectDiscard(
    PoolService.setupConnectionListeners
  ).pipe(Layer.provideMerge(PoolService.Default.pipe(
    Layer.provide(
      Layer.mergeAll(ConnectionContext.Live(connection), Logger.Default))
  )));
}

type DbSchema = Record<string, unknown>

type MakeDbServiceOptions<TFullSchema extends DbSchema = DbSchema> = {
  schema: TFullSchema,
}

type TransactionClient<TFullSchema extends DbSchema = DbSchema> = PgTransaction<
  NodePgQueryResultHKT,
  TFullSchema,
  ExtractTablesWithRelations<TFullSchema>
>;

type Client<TFullSchema extends DbSchema = DbSchema> = NodePgDatabase<TFullSchema> & {
  $client: pg.Pool;
}

export class RawPgError extends S.declare(
  (error: unknown): error is pg.DatabaseError => error instanceof pg.DatabaseError
) {
  static readonly is = S.is(RawPgError);
}

export class DatabaseError extends S.TaggedError<DatabaseError>($I`DatabaseError`)("DatabaseError", {
  type: PgErrorCodeFromKey.From,
  pgError: RawPgError,
  cause: S.Defect
}) {
  static readonly $match = (error: unknown) => {
    if (RawPgError.is(error)) {
      return Match.value(error).pipe(
        Match.when({code: PgErrorCodeFromKey.Enum.UNIQUE_VIOLATION}, (error) => new DatabaseError({
          type: PgErrorCodeFromKey.EnumReverse[error.code],
          pgError: error,
          cause: error
        })),
        Match.when({code: PgErrorCodeFromKey.Enum.FOREIGN_KEY_VIOLATION}, (error) => new DatabaseError({
          type: PgErrorCodeFromKey.EnumReverse[error.code],
          pgError: error,
          cause: error
        })),
        Match.when({code: PgErrorCodeFromKey.Enum.CONNECTION_EXCEPTION}, (error) => new DatabaseError({
          type: PgErrorCodeFromKey.EnumReverse[error.code],
          pgError: error,
          cause: error
        })),
        Match.orElse(thunkNull)
      );
    }
    return null;
  };
}

type TransactionContextShape = <U>(
  fn: <TFullSchema extends DbSchema = DbSchema>(client: TransactionClient<TFullSchema>) => Promise<U>
) => Effect.Effect<U, DatabaseError>

export class TransactionContext extends Context.Tag("TransactionContext")<
  TransactionContext,
  TransactionContextShape
>() {
  public static readonly provide = (
    transaction: TransactionContextShape,
  ): (<A, E, R>(
    self: Effect.Effect<A, E, R>,
  ) => Effect.Effect<A, E, Exclude<R, TransactionContext>>) =>
    Effect.provideService(this, transaction);
}

export interface AfterEffect {
  readonly onSuccessOnly: boolean;
  readonly effect: Effect.Effect<void, never, never>;
}

export type ExecuteFn<TFullSchema extends DbSchema = DbSchema> = <T>(
  fn: (client: Client<TFullSchema> | TransactionClient<TFullSchema>) => Promise<T>
) => Effect.Effect<T, DatabaseError>;

export type Transaction = <T, E, R>(
  txExecute: (tx: TransactionContextShape) => Effect.Effect<T, E, R>
) => Effect.Effect<T, DatabaseError | E, R>;

export type MakeQuery<TFullSchema extends DbSchema = DbSchema> = <A, E, R, Input>(
  queryFn: (execute: ExecuteFn<TFullSchema>, input: Input) => Effect.Effect<A, E, R>,
) => (...args: [Input] extends [never] ? [] : [input: Input]) => Effect.Effect<A, E, R>

export type MakeQueryWithSchemaOptions<
  TFullSchema extends DbSchema,
  InputSchema extends S.Schema.AnyNoContext,
  OutputSchema extends S.Schema.AnyNoContext,
  A,
  E,
> = {
  readonly inputSchema: InputSchema;
  readonly outputSchema: OutputSchema;
  readonly queryFn: (
    execute: ExecuteFn<TFullSchema>,
    encodedInput: S.Schema.Encoded<InputSchema>,
    options?: undefined | { spanPrefix?: undefined | string },
  ) => Effect.Effect<A, E, never>;
};

export type MakeQueryWithSchema<TFullSchema extends DbSchema = DbSchema> = <
  InputSchema extends S.Schema.AnyNoContext,
  OutputSchema extends S.Schema.AnyNoContext,
  A,
  E,
>(
  options: MakeQueryWithSchemaOptions<TFullSchema, InputSchema, OutputSchema, A, E>,
) => (
  rawData: unknown,
) => Effect.Effect<S.Schema.Type<OutputSchema>, E | DatabaseError, never>

export interface DatabaseService<TFullSchema extends DbSchema = DbSchema> {
  readonly client: Client<TFullSchema>;
  readonly execute: ExecuteFn<TFullSchema>;
  readonly transaction: Transaction;
  readonly makeQuery: MakeQuery<TFullSchema>;
  readonly makeQueryWithSchema: MakeQueryWithSchema<TFullSchema>;
}

export const make = <const TFullSchema extends DbSchema = DbSchema>(
  {schema}: MakeDbServiceOptions<TFullSchema>
): Effect.Effect<DatabaseService<TFullSchema>, never, PoolService | Logger> => Effect.gen(function* () {
  const {pool} = yield* PoolService;



  const client = drizzle(pool, {casing: "snake_case", schema});

  const execute: ExecuteFn<TFullSchema> = Effect.fn(<T>(fn: (client: Client<TFullSchema>) => Promise<T>) =>
    Effect.tryPromise({
      try: () => fn(client),
      catch: (cause) => {
        const error = DatabaseError.$match(cause);
        if (error !== null) {
          return error;
        }
        throw cause;
      },
    })
  );

  const transaction: Transaction = Effect.fn("Database.transaction")(
    <T, E, R>(txExecute: (tx: TransactionContextShape) => Effect.Effect<T, E, R>) =>
      Effect.runtime<R>().pipe(
        Effect.map((runtime) => Runtime.runPromiseExit(runtime)),
        Effect.flatMap((runPromiseExit) =>
          Effect.async<T, DatabaseError | E, R>((resume) => {
            client.transaction(async (tx: TransactionClient<TFullSchema>) => {
              const txWrapper = (fn: (client: TransactionClient<TFullSchema>) => Promise<any>) =>
                Effect.tryPromise({
                  try: () => fn(tx),
                  catch: (cause) => {
                    const error = DatabaseError.$match(cause);
                    if (error !== null) {
                      return error;
                    }
                    throw cause;
                  },
                });

              const result = await runPromiseExit(txExecute(txWrapper));
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
              const error = DatabaseError.$match(cause);
              resume(error !== null ? Effect.fail(error) : Effect.die(cause));
            });
          }),
        ),
      ),
  );

  const makeQuery: MakeQuery<TFullSchema> =
    <A, E, R, Input = never>(
      queryFn: (execute: ExecuteFn<TFullSchema>, input: Input) => Effect.Effect<A, E, R>,
    ) =>
      (...args: [Input] extends [never] ? [] : [input: Input]): Effect.Effect<A, E, R> => {
        const input = args[0] as Input;
        return Effect.serviceOption(TransactionContext).pipe(
          Effect.map(Option.getOrNull),
          Effect.flatMap((txOrNull) => queryFn((txOrNull ?? execute) as ExecuteFn<TFullSchema>, input)),
        );
      };

  const makeQueryWithSchema: MakeQueryWithSchema<TFullSchema> =
    <
      InputSchema extends S.Schema.AnyNoContext,
      OutputSchema extends S.Schema.AnyNoContext,
      A,
      E,
    >(
      {
        inputSchema,
        outputSchema,
        queryFn,
      }: MakeQueryWithSchemaOptions<TFullSchema, InputSchema, OutputSchema, A, E>
    ) => {
      return (
        rawData: unknown,
      ): Effect.Effect<S.Schema.Type<OutputSchema>, E | DatabaseError, never> =>
        Effect.serviceOption(TransactionContext).pipe(
          Effect.map(Option.getOrNull),
          Effect.flatMap((txOrNull) => {
            const executor = (txOrNull ?? execute) as ExecuteFn<TFullSchema>;

            return Effect.gen(function* () {
              const encodedInput = yield* S.encodeUnknown(inputSchema)(rawData);

              const result = yield* queryFn(executor, encodedInput);

              return yield* S.decodeUnknown(outputSchema)(result);
            }).pipe(Effect.catchTag("ParseError", Effect.die));
          }),
        );
    };

  return {
    client,
    execute,
    transaction,
    makeQuery,
    makeQueryWithSchema,
  };
});


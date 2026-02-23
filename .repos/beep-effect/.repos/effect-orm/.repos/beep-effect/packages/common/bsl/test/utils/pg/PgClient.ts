/**
 * @since 1.0.0
 */
import * as Reactivity from "@effect/experimental/Reactivity";
import * as SqlClient from "@effect/sql/SqlClient";
import type { Connection } from "@effect/sql/SqlConnection";
import { SqlError } from "@effect/sql/SqlError";
import type { Custom, Fragment } from "@effect/sql/Statement";
import * as Statement from "@effect/sql/Statement";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as Arr from "effect/Array";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as RcRef from "effect/RcRef";
import * as Redacted from "effect/Redacted";
import * as Runtime from "effect/Runtime";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as Pg from "pg";
import * as PgConnString from "pg-connection-string";
import Cursor from "pg-cursor";
import { DatabaseError } from "./errors";
import { type ConnectionConfig, ConnectionPool, QueryLogger } from "./services";

import type {
  Client,
  DbSchema,
  ExecuteFn,
  MakeDbServiceOptions,
  MakeQuery,
  MakeQueryWithSchema,
  MakeQueryWithSchemaOptions,
  Transaction,
  TransactionClient,
  TransactionContextShape,
} from "./types";

const ATTR_DB_SYSTEM_NAME = "db.system.name";
const ATTR_DB_NAMESPACE = "db.namespace";
const ATTR_SERVER_ADDRESS = "server.address";
const ATTR_SERVER_PORT = "server.port";
/**
 * @category type ids
 * @since 1.0.0
 */
export const TypeId: TypeId = "~@beep/shared-server/Db/sql-pg/PgClient";

/**
 * @category type ids
 * @since 1.0.0
 */
export type TypeId = "~@beep/shared-server/Db/sql-pg/PgClient";

/**
 * @category models
 * @since 1.0.0
 */
export interface PgClient extends SqlClient.SqlClient {
  readonly [TypeId]: TypeId;
  readonly config: ConnectionConfig.PgClientConfig;
  readonly json: (_: unknown) => Fragment;
  readonly listen: (channel: string) => Stream.Stream<string, SqlError>;
  readonly notify: (channel: string, payload: string) => Effect.Effect<void, SqlError>;
  readonly pool: Pg.Pool;
}

/**
 * @category tags
 * @since 1.0.0
 */
export const PgClient = Context.GenericTag<PgClient>("@effect/sql-pg/PgClient");

/**
 * @category constructors
 * @since 1.0.0
 */
type MakePgClientEffect = Effect.Effect<
  PgClient,
  SqlError,
  Scope.Scope | Reactivity.Reactivity | ConnectionPool.ConnectionPool
>;
export const makePgClient: MakePgClientEffect = Effect.gen(function* () {
  const { options, pool } = yield* ConnectionPool.ConnectionPool;

  const compiler = makeCompiler(options.transformQueryNames, options.transformJson);
  const transformRows = options.transformResultNames
    ? Statement.defaultTransforms(options.transformResultNames, options.transformJson).array
    : undefined;

  class ConnectionImpl implements Connection {
    readonly pg: Pg.PoolClient | undefined;

    constructor(pg?: Pg.PoolClient) {
      this.pg = pg;
    }

    private runWithClient<A>(f: (client: Pg.PoolClient, resume: (_: Effect.Effect<A, SqlError>) => void) => void) {
      if (this.pg !== undefined) {
        return Effect.async<A, SqlError>((resume) => {
          f(this.pg!, resume);
          return makeCancel(pool, this.pg!);
        });
      }
      return Effect.async<A, SqlError>((resume) => {
        let done = false;
        let cancel: Effect.Effect<void> | undefined = undefined;
        let client: Pg.PoolClient | undefined = undefined;

        function onError(cause: Error) {
          cleanup(cause);
          resume(Effect.fail(new SqlError({ cause, message: "Connection error" })));
        }

        function cleanup(cause?: Error) {
          if (!done) client?.release(cause);
          done = true;
          client?.off("error", onError);
        }

        pool.connect((cause, client_) => {
          if (cause) {
            return resume(Effect.fail(new SqlError({ cause, message: "Failed to acquire connection" })));
          }
          if (!client_) {
            return resume(
              Effect.fail(
                new SqlError({ message: "Failed to acquire connection", cause: new Error("No client returned") })
              )
            );
          }
          if (done) {
            client_.release();
            return;
          }
          client = client_;
          client.once("error", onError);
          cancel = makeCancel(pool, client);
          f(client, (eff) => {
            cleanup();
            resume(eff);
          });
        });
        return Effect.suspend(() => {
          if (!cancel) {
            cleanup();
            return Effect.void;
          }
          return Effect.ensuring(cancel, Effect.sync(cleanup));
        });
      });
    }

    private run(query: string, params: ReadonlyArray<unknown>) {
      return this.runWithClient<ReadonlyArray<any>>((client, resume) => {
        client.query(query, params as any, (err, result) => {
          if (err) {
            resume(Effect.fail(new SqlError({ cause: err, message: "Failed to execute statement" })));
          } else {
            // Multi-statement queries return an array of results
            resume(Effect.succeed(Array.isArray(result) ? result.map((r) => r.rows ?? []) : (result.rows ?? [])));
          }
        });
      });
    }

    execute(
      sql: string,
      params: ReadonlyArray<unknown>,
      transformRows: (<A extends object>(row: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined
    ) {
      return transformRows ? Effect.map(this.run(sql, params), transformRows) : this.run(sql, params);
    }

    executeRaw(sql: string, params: ReadonlyArray<unknown>) {
      return this.runWithClient<Pg.Result>((client, resume) => {
        client.query(sql, params as any, (err, result) => {
          if (err) {
            resume(Effect.fail(new SqlError({ cause: err, message: "Failed to execute statement" })));
          } else {
            resume(Effect.succeed(result));
          }
        });
      });
    }

    executeWithoutTransform(sql: string, params: ReadonlyArray<unknown>) {
      return this.run(sql, params);
    }

    executeValues(sql: string, params: ReadonlyArray<unknown>) {
      return this.runWithClient<ReadonlyArray<any>>((client, resume) => {
        client.query(
          {
            text: sql,
            rowMode: "array",
            values: params as Array<string>,
          },
          (err, result) => {
            if (err) {
              resume(Effect.fail(new SqlError({ cause: err, message: "Failed to execute statement" })));
            } else {
              resume(Effect.succeed(result.rows));
            }
          }
        );
      });
    }

    executeUnprepared(
      sql: string,
      params: ReadonlyArray<unknown>,
      transformRows: (<A extends object>(row: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined
    ) {
      return this.execute(sql, params, transformRows);
    }

    executeStream(
      sql: string,
      params: ReadonlyArray<unknown>,
      transformRows: (<A extends object>(row: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined
    ) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      return Effect.gen(function* () {
        const scope = yield* Effect.scope;
        const client = self.pg ?? (yield* reserveRaw);
        yield* Scope.addFinalizer(
          scope,
          Effect.promise(() => cursor.close())
        );
        const cursor = client.query(new Cursor(sql, params as any));
        const pull = Effect.async<Chunk.Chunk<any>, Option.Option<SqlError>>((resume) => {
          cursor.read(128, (err, rows) => {
            if (err) {
              resume(Effect.fail(Option.some(new SqlError({ cause: err, message: "Failed to execute statement" }))));
            } else if (Arr.isNonEmptyArray(rows)) {
              resume(Effect.succeed(Chunk.unsafeFromArray(transformRows ? (transformRows(rows) as any) : rows)));
            } else {
              resume(Effect.fail(Option.none()));
            }
          });
        });
        return Stream.repeatEffectChunkOption(pull);
      }).pipe(Stream.unwrapScoped);
    }
  }

  const reserveRaw = Effect.async<Pg.PoolClient, SqlError, Scope.Scope>((resume) => {
    const fiber = Option.getOrThrow(Fiber.getCurrentFiber());
    const scope = Context.unsafeGet(fiber.currentContext, Scope.Scope);
    let cause: Error | undefined = undefined;
    pool.connect((err, client, release) => {
      if (err) {
        resume(Effect.fail(new SqlError({ cause: err, message: "Failed to acquire connection for transaction" })));
      } else {
        resume(
          Effect.as(
            Scope.addFinalizer(
              scope,
              Effect.sync(() => {
                client!.off("error", onError);
                release(cause);
              })
            ),
            client!
          )
        );
      }

      function onError(cause_: Error) {
        cause = cause_;
      }

      client!.on("error", onError);
    });
  });
  const reserve = Effect.map(reserveRaw, (client) => new ConnectionImpl(client));

  const listenClient = yield* RcRef.make({
    acquire: reserveRaw,
  });

  let config = options;
  if (pool.options.connectionString) {
    try {
      const parsed = PgConnString.parse(pool.options.connectionString);
      config = {
        ...config,
        host: config.host ?? parsed.host ?? undefined,
        port: config.port ?? (parsed.port ? Option.getOrUndefined(Number.parse(parsed.port)) : undefined),
        user: config.user ?? parsed.user ?? undefined,
        password: config.password ?? (parsed.password ? Redacted.make(parsed.password) : undefined),
        database: config.database ?? parsed.database ?? undefined,
      };
    } catch {
      //
    }
  }

  return Object.assign(
    yield* SqlClient.make({
      acquirer: Effect.succeed(new ConnectionImpl()),
      transactionAcquirer: reserve,
      compiler,
      spanAttributes: [
        ...(options.spanAttributes ? Object.entries(options.spanAttributes) : []),
        [ATTR_DB_SYSTEM_NAME, "postgresql"],
        [ATTR_DB_NAMESPACE, options.database ?? options.user ?? "postgres"],
        [ATTR_SERVER_ADDRESS, options.host ?? "localhost"],
        [ATTR_SERVER_PORT, options.port ?? 5432],
      ],
      transformRows,
    }),
    {
      [TypeId]: TypeId as TypeId,
      config,
      json: (_: unknown) => PgJson(_),
      listen: (channel: string) =>
        Stream.asyncPush<string, SqlError>(
          Effect.fnUntraced(function* (emit) {
            const client = yield* RcRef.get(listenClient);

            function onNotification(msg: Pg.Notification) {
              if (msg.channel === channel && msg.payload) {
                emit.single(msg.payload);
              }
            }

            yield* Effect.addFinalizer(() =>
              Effect.promise(() => {
                client.off("notification", onNotification);
                return client.query(`UNLISTEN ${Pg.escapeIdentifier(channel)}`);
              })
            );
            yield* Effect.tryPromise({
              try: () => client.query(`LISTEN ${Pg.escapeIdentifier(channel)}`),
              catch: (cause) => new SqlError({ cause, message: "Failed to listen" }),
            });
            client.on("notification", onNotification);
          })
        ),
      notify: (channel: string, payload: string) =>
        Effect.async<void, SqlError>((resume) => {
          pool.query(`NOTIFY ${Pg.escapeIdentifier(channel)}, $1`, [payload], (err) => {
            if (err) {
              resume(Effect.fail(new SqlError({ cause: err, message: "Failed to notify" })));
            } else {
              resume(Effect.void);
            }
          });
        }),
      pool,
    }
  );
});

const cancelEffects = new WeakMap<Pg.PoolClient, Effect.Effect<void> | undefined>();
const makeCancel = (pool: Pg.Pool, client: Pg.PoolClient) => {
  if (cancelEffects.has(client)) {
    return cancelEffects.get(client)!;
  }
  const processId = (client as any).processID;
  const eff =
    processId !== undefined
      ? // query cancelation is best-effort, so we don't fail if it doesn't work
        Effect.async<void>((resume) => {
          if (pool.ending) return resume(Effect.void);
          pool.query(`SELECT pg_cancel_backend(${processId})`, () => {
            resume(Effect.void);
          });
        }).pipe(Effect.interruptible, Effect.timeoutOption(5000))
      : undefined;
  cancelEffects.set(client, eff);
  return eff;
};

/**
 * @category layers
 * @since 1.0.0
 */

/**
 * @category constructor
 * @since 1.0.0
 */
export const makeCompiler = (transform?: (_: string) => string, transformJson = true): Statement.Compiler => {
  const transformValue = transformJson && transform ? Statement.defaultTransforms(transform).value : undefined;

  return Statement.makeCompiler<PgCustom>({
    dialect: "pg",
    placeholder(_) {
      return `$${_}`;
    },
    onIdentifier: transform
      ? (value, withoutTransform) => (withoutTransform ? escape(value) : escape(transform(value)))
      : escape,
    onRecordUpdate(placeholders, valueAlias, valueColumns, values, returning) {
      return [
        `(values ${placeholders}) AS ${valueAlias}${valueColumns}${returning ? ` RETURNING ${returning[0]}` : ""}`,
        returning ? values.flat().concat(returning[1]) : values.flat(),
      ];
    },
    onCustom(type, placeholder, withoutTransform) {
      switch (type.kind) {
        case "PgJson": {
          return [
            placeholder(undefined),
            [withoutTransform || transformValue === undefined ? type.i0 : transformValue(type.i0)],
          ];
        }
      }
    },
  });
};

const escape = Statement.defaultEscape('"');

/**
 * @category custom types
 * @since 1.0.0
 */
export type PgCustom = PgJson;

/**
 * @category custom types
 * @since 1.0.0
 */
interface PgJson extends Custom<"PgJson", unknown> {}

/**
 * @category custom types
 * @since 1.0.0
 */
const PgJson = Statement.custom<PgJson>("PgJson");

export class TransactionContext extends Context.Tag("TransactionContext")<
  TransactionContext,
  TransactionContextShape
>() {
  public static readonly provide = (
    transaction: TransactionContextShape
  ): (<A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, TransactionContext>>) =>
    Effect.provideService(this, transaction);
}

export interface Shape<TFullSchema extends DbSchema = DbSchema> {
  readonly client: Client<TFullSchema>;
  readonly execute: ExecuteFn<TFullSchema>;
  readonly transaction: Transaction;
  readonly makeQuery: MakeQuery<TFullSchema>;
  readonly makeQueryWithSchema: MakeQueryWithSchema<TFullSchema>;
  readonly effectClient: Effect.Effect.Success<ReturnType<typeof PgDrizzle.make<TFullSchema>>>;
  readonly DbSchema: TFullSchema;
}

export type PgClientServiceEffect<TFullSchema extends DbSchema = DbSchema> = Effect.Effect<
  Shape<TFullSchema>,
  never,
  QueryLogger.QueryLogger | ConnectionPool.ConnectionPool | Reactivity.Reactivity | SqlClient.SqlClient
>;

export type MakeServiceEffect = <TFullSchema extends DbSchema = DbSchema>(
  options: MakeDbServiceOptions<TFullSchema>
) => PgClientServiceEffect<TFullSchema>;

export const make = <const TFullSchema extends DbSchema = DbSchema>({
  schema,
}: MakeDbServiceOptions<TFullSchema>): PgClientServiceEffect<TFullSchema> =>
  Effect.gen(function* () {
    const logger = yield* QueryLogger.QueryLogger;
    const pgClient = yield* makePgClient;

    const client = drizzle({ client: pgClient.pool, logger, casing: "snake_case", schema });

    const execute: ExecuteFn<TFullSchema> = Effect.fn(<T>(fn: (client: Client<TFullSchema>) => Promise<T>) =>
      Effect.tryPromise({
        try: () => fn(client),
        catch: (cause) => {
          const error = DatabaseError.$match(cause);
          if (error !== null) {
            console.error(DatabaseError.format(cause));
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
              client
                .transaction(async (tx: TransactionClient<TFullSchema>) => {
                  const txWrapper = (fn: (client: TransactionClient<TFullSchema>) => Promise<any>) =>
                    Effect.tryPromise({
                      try: () => fn(tx),
                      catch: (cause) => {
                        const error = DatabaseError.$match(cause);
                        if (error !== null) {
                          console.error(DatabaseError.format(cause));
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
                })
                .catch((cause) => {
                  const error = DatabaseError.$match(cause);
                  if (error !== null) {
                    console.error(DatabaseError.format(cause));
                    resume(Effect.fail(error));
                  } else {
                    resume(Effect.die(cause));
                  }
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
          Effect.flatMap((txOrNull) => queryFn((txOrNull ?? execute) as ExecuteFn<TFullSchema>, input))
        );
      };

    const makeQueryWithSchema: MakeQueryWithSchema<TFullSchema> = <
      InputSchema extends S.Schema.AnyNoContext,
      OutputSchema extends S.Schema.AnyNoContext,
      A,
      E,
    >({
      inputSchema,
      outputSchema,
      queryFn,
    }: MakeQueryWithSchemaOptions<TFullSchema, InputSchema, OutputSchema, A, E>) => {
      return (
        input: S.Schema.Type<InputSchema>
      ): Effect.Effect<S.Schema.Type<OutputSchema>, E | DatabaseError, never> =>
        Effect.serviceOption(TransactionContext).pipe(
          Effect.map(Option.getOrNull),
          Effect.flatMap((txOrNull) => {
            const executor = (txOrNull ?? execute) as ExecuteFn<TFullSchema>;

            return Effect.gen(function* () {
              const encodedInput = yield* S.encodeUnknown(inputSchema)(input);

              const result = yield* queryFn(executor, encodedInput);

              return yield* S.decodeUnknown(outputSchema)(result);
            }).pipe(Effect.catchTag("ParseError", Effect.die));
          })
        );
    };
    const effectClient: Effect.Effect.Success<ReturnType<typeof PgDrizzle.make<TFullSchema>>> = yield* PgDrizzle.make({
      schema: schema,
      casing: "snake_case",
    });
    return {
      client,
      execute,
      transaction,
      makeQuery,
      makeQueryWithSchema,
      effectClient,
      DbSchema: schema,
    };
  }).pipe(Effect.scoped, Effect.orDie);

export type SliceDbRequirements =
  | PgClient
  | SqlClient.SqlClient
  | ConnectionPool.ConnectionPool
  | Reactivity.Reactivity
  | QueryLogger.QueryLogger;
export type PgClientServices =
  | PgClient
  | SqlClient.SqlClient
  | ConnectionPool.ConnectionPool
  | Reactivity.Reactivity
  | QueryLogger.QueryLogger;
export type PgClientLayer = Layer.Layer<PgClientServices, never, never>;

export const layer: PgClientLayer = Layer.empty.pipe(
  Layer.provideMerge(
    Layer.scopedContext(
      Effect.map(makePgClient, (client) =>
        Context.make(PgClient, client).pipe(Context.add(SqlClient.SqlClient, client))
      )
    )
  ),
  Layer.provideMerge(Layer.mergeAll(ConnectionPool.layer, Reactivity.layer, QueryLogger.layer)),
  (self) =>
    Layer.retry(
      self,
      Schedule.identity<Layer.Layer.Error<typeof self>>().pipe(
        Schedule.check((input) => input._tag === "SqlError" || input._tag === "DatabaseConnectionLostError"),
        Schedule.intersect(Schedule.exponential("1 second")),
        Schedule.intersect(Schedule.recurs(2)),
        Schedule.onDecision(([[_error, duration], attempt], decision) =>
          decision._tag === "Continue"
            ? Effect.logInfo(`Retrying database connection in ${Duration.format(duration)} (attempt #${++attempt})`)
            : Effect.void
        )
      )
    ),
  Layer.orDie
);

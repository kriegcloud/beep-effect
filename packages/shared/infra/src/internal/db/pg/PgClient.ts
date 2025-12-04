/**
 * @since 1.0.0
 */
import * as Reactivity from "@effect/experimental/Reactivity";
import * as SqlClient from "@effect/sql/SqlClient";
import type {Connection} from "@effect/sql/SqlConnection";
import {SqlError} from "@effect/sql/SqlError";
import type {Custom, Fragment} from "@effect/sql/Statement";
import * as Statement from "@effect/sql/Statement";
import * as Arr from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as RcRef from "effect/RcRef";
import * as Redacted from "effect/Redacted";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import type {ConnectionOptions} from "node:tls";
import * as Pg from "pg";
import * as PgConnString from "pg-connection-string";
import Cursor from "pg-cursor";
import type {
  MakeDbServiceOptions,
  TransactionClient,
  Client,
  TransactionContextShape,
  ExecuteFn,
  Transaction,
  DbSchema,
  MakeQuery,
  MakeQueryWithSchema,
  MakeQueryWithSchemaOptions,
  DatabaseService
} from "./types";
import * as Cause from "effect/Cause";
import * as Exit from "effect/Exit";
import * as Runtime from "effect/Runtime";
import {drizzle} from "drizzle-orm/node-postgres";
import * as pg from "pg";
import {$SharedInfraId} from "@beep/identity/packages";
import * as A from "effect/Array";
import {pipe} from "effect/Function";
import {thunk} from "@beep/utils/thunk";
import * as Str from "effect/String";
import * as S from "effect/Schema";
import type {Logger as DrizzleLogger,} from "drizzle-orm";
import {format} from "sql-formatter";
import {DatabaseError} from "./errors.ts";

const ATTR_DB_SYSTEM_NAME = "db.system.name";
const ATTR_DB_NAMESPACE = "db.namespace";
const ATTR_SERVER_ADDRESS = "server.address";
const ATTR_SERVER_PORT = "server.port";
const $I = $SharedInfraId.create("Db");
/**
 * @category type ids
 * @since 1.0.0
 */
export const TypeId: TypeId = "~@beep/shared-infra/Db/sql-pg/PgClient";

/**
 * @category type ids
 * @since 1.0.0
 */
export type TypeId = "~@beep/shared-infra/Db/sql-pg/PgClient"

/**
 * @category models
 * @since 1.0.0
 */
export interface PgClient extends SqlClient.SqlClient {
  readonly [TypeId]: TypeId;
  readonly config: PgClientConfig;
  readonly json: (_: unknown) => Fragment;
  readonly listen: (channel: string) => Stream.Stream<string, SqlError>;
  readonly notify: (channel: string, payload: string) => Effect.Effect<void, SqlError>;
  readonly pool: pg.Pool;
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
export interface PgClientConfig {
  readonly url?: Redacted.Redacted | undefined;

  readonly host?: string | undefined;
  readonly port?: number | undefined;
  readonly path?: string | undefined;
  readonly ssl?: boolean | ConnectionOptions | undefined;
  readonly database?: string | undefined;
  readonly username?: string | undefined;
  readonly password?: Redacted.Redacted | undefined;

  readonly idleTimeout?: Duration.DurationInput | undefined;
  readonly connectTimeout?: Duration.DurationInput | undefined;

  readonly maxConnections?: number | undefined;
  readonly minConnections?: number | undefined;
  readonly connectionTTL?: Duration.DurationInput | undefined;

  readonly applicationName?: string | undefined;
  readonly spanAttributes?: Record<string, unknown> | undefined;

  readonly transformResultNames?: ((str: string) => string) | undefined;
  readonly transformQueryNames?: ((str: string) => string) | undefined;
  readonly transformJson?: boolean | undefined;
  readonly types?: Pg.CustomTypesConfig | undefined;
}

export class ConnectionContext extends Context.Tag($I`ConnectionContext`)<
  ConnectionContext,
  PgClientConfig
>() {
  static readonly Live = (connection: PgClientConfig) => Layer.sync(this)(thunk(connection));
}
export const makePoolService = Effect.fn("makePoolService")(function* (
  options: PgClientConfig
) {
  const pool = new Pg.Pool({
      connectionString: options.url ? Redacted.value(options.url) : undefined,
      user: options.username,
      host: options.host,
      database: options.database,
      password: options.password ? Redacted.value(options.password) : undefined,
      ssl: options.ssl,
      port: options.port,
      connectionTimeoutMillis: options.connectTimeout
        ? Duration.toMillis(options.connectTimeout)
        : undefined,
      idleTimeoutMillis: options.idleTimeout
        ? Duration.toMillis(options.idleTimeout)
        : undefined,
      max: options.maxConnections,
      min: options.minConnections,
      maxLifetimeSeconds: options.connectionTTL
        ? Duration.toSeconds(options.connectionTTL)
        : undefined,
      application_name: options.applicationName ?? "@effect/sql-pg",
      types: options.types
    });

    pool.on("error", (_err) => {
    });

    yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: () => pool.query("SELECT 1"),
        catch: (cause) => new SqlError({cause, message: "PgClient: Failed to connect"})
      }),
      () =>
        Effect.promise(() => pool.end()).pipe(
          Effect.interruptible,
          Effect.timeoutOption(1000)
        )
    ).pipe(
      Effect.timeoutFail({
        duration: options.connectTimeout ?? Duration.seconds(5),
        onTimeout: () =>
          new SqlError({
            cause: new Error("Connection timed out"),
            message: "PgClient: Connection timed out"
          })
      })
    );

    return {
      pool,
      options,
    }
});

const connectionContextLayer = Layer.effect(ConnectionContext, Effect.gen(function* () {
  const connectionString = yield* Config.redacted("DB_PG_URL");
  const ssl = yield* Config.boolean("DB_PG_SSL");

  return {
    connectionString,
    ssl
  };
}));

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
}

/**
 * @category constructors
 * @since 1.0.0
 */
export const makePgClient = (

): Effect.Effect<PgClient, SqlError, Scope.Scope | Reactivity.Reactivity | PoolService | ConnectionContext> =>
  Effect.gen(function* () {

    const { options, pool } = yield* PoolService;

    const compiler = makeCompiler(
      options.transformQueryNames,
      options.transformJson
    );
    const transformRows = options.transformResultNames ?
      Statement.defaultTransforms(
        options.transformResultNames,
        options.transformJson
      ).array :
      undefined;



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
            resume(Effect.fail(new SqlError({cause, message: "Connection error"})));
          }

          function cleanup(cause?: Error) {
            if (!done) client?.release(cause);
            done = true;
            client?.off("error", onError);
          }

          pool.connect((cause, client_) => {
            if (cause) {
              return resume(Effect.fail(new SqlError({cause, message: "Failed to acquire connection"})));
            } else if (!client_) {
              return resume(
                Effect.fail(
                  new SqlError({message: "Failed to acquire connection", cause: new Error("No client returned")})
                )
              );
            } else if (done) {
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
              resume(Effect.fail(new SqlError({cause: err, message: "Failed to execute statement"})));
            } else {
              // Multi-statement queries return an array of results
              resume(Effect.succeed(
                Array.isArray(result)
                  ? result.map((r) => r.rows ?? [])
                  : result.rows ?? []
              ));
            }
          });
        });
      }

      execute(
        sql: string,
        params: ReadonlyArray<unknown>,
        transformRows: (<A extends object>(row: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined
      ) {
        return transformRows
          ? Effect.map(this.run(sql, params), transformRows)
          : this.run(sql, params);
      }

      executeRaw(sql: string, params: ReadonlyArray<unknown>) {
        return this.runWithClient<Pg.Result>((client, resume) => {
          client.query(sql, params as any, (err, result) => {
            if (err) {
              resume(Effect.fail(new SqlError({cause: err, message: "Failed to execute statement"})));
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
              values: params as Array<string>
            },
            (err, result) => {
              if (err) {
                resume(Effect.fail(new SqlError({cause: err, message: "Failed to execute statement"})));
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
          yield* Scope.addFinalizer(scope, Effect.promise(() => cursor.close()));
          const cursor = client.query(new Cursor(sql, params as any));
          const pull = Effect.async<Chunk.Chunk<any>, Option.Option<SqlError>>((resume) => {
            cursor.read(128, (err, rows) => {
              if (err) {
                resume(Effect.fail(Option.some(new SqlError({cause: err, message: "Failed to execute statement"}))));
              } else if (Arr.isNonEmptyArray(rows)) {
                resume(Effect.succeed(Chunk.unsafeFromArray(transformRows ? transformRows(rows) as any : rows)));
              } else {
                resume(Effect.fail(Option.none()));
              }
            });
          });
          return Stream.repeatEffectChunkOption(pull);
        }).pipe(
          Stream.unwrapScoped
        );
      }
    }

    const reserveRaw = Effect.async<Pg.PoolClient, SqlError, Scope.Scope>((resume) => {
      const fiber = Option.getOrThrow(Fiber.getCurrentFiber());
      const scope = Context.unsafeGet(fiber.currentContext, Scope.Scope);
      let cause: Error | undefined = undefined;
      pool.connect((err, client, release) => {
        if (err) {
          resume(Effect.fail(new SqlError({cause: err, message: "Failed to acquire connection for transaction"})));
        } else {
          resume(Effect.as(
            Scope.addFinalizer(
              scope,
              Effect.sync(() => {
                client!.off("error", onError);
                release(cause);
              })
            ),
            client!
          ));
        }

        function onError(cause_: Error) {
          cause = cause_;
        }

        client!.on("error", onError);
      });
    });
    const reserve = Effect.map(reserveRaw, (client) => new ConnectionImpl(client));

    const listenClient = yield* RcRef.make({
      acquire: reserveRaw
    });

    let config = options;
    if (pool.options.connectionString) {
      try {
        const parsed = PgConnString.parse(pool.options.connectionString);
        config = {
          ...config,
          host: config.host ?? parsed.host ?? undefined,
          port: config.port ?? (parsed.port ? Option.getOrUndefined(Number.parse(parsed.port)) : undefined),
          username: config.username ?? parsed.user ?? undefined,
          password: config.password ?? (parsed.password ? Redacted.make(parsed.password) : undefined),
          database: config.database ?? parsed.database ?? undefined
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
          [ATTR_DB_NAMESPACE, options.database ?? options.username ?? "postgres"],
          [ATTR_SERVER_ADDRESS, options.host ?? "localhost"],
          [ATTR_SERVER_PORT, options.port ?? 5432]
        ],
        transformRows
      }),
      {
        [TypeId]: TypeId as TypeId,
        config,
        json: (_: unknown) => PgJson(_),
        listen: (channel: string) =>
          Stream.asyncPush<string, SqlError>(Effect.fnUntraced(function* (emit) {
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
              catch: (cause) => new SqlError({cause, message: "Failed to listen"})
            });
            client.on("notification", onNotification);
          })),
        notify: (channel: string, payload: string) =>
          Effect.async<void, SqlError>((resume) => {
            pool.query(`NOTIFY ${Pg.escapeIdentifier(channel)}, $1`, [payload], (err) => {
              if (err) {
                resume(Effect.fail(new SqlError({cause: err, message: "Failed to notify"})));
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
  const eff = processId !== undefined
    // query cancelation is best-effort, so we don't fail if it doesn't work
    ? Effect.async<void>((resume) => {
      if (pool.ending) return resume(Effect.void);
      pool.query(`SELECT pg_cancel_backend(${processId})`, () => {
        resume(Effect.void);
      });
    }).pipe(
      Effect.interruptible,
      Effect.timeoutOption(5000)
    )
    : undefined;
  cancelEffects.set(client, eff);
  return eff;
};


/**
 * @category layers
 * @since 1.0.0
 */
export const layer = (
  config: PgClientConfig
) =>
  Layer.scopedContext(
    Effect.map(makePgClient(), (client) =>
      Context.make(PgClient, client).pipe(
        Context.add(SqlClient.SqlClient, client)
      ))
  ).pipe(Layer.provideMerge(
    Layer.provideMerge(
      Layer.provideMerge(
        Reactivity.layer,
        Logger.Default
      ),
      Layer.provideMerge(
        ConnectionContext.Live(config),
        PoolService.Default
      )
    )
  ));

/**
 * @category constructor
 * @since 1.0.0
 */
export const makeCompiler = (
  transform?: (_: string) => string,
  transformJson = true
): Statement.Compiler => {
  const transformValue = transformJson && transform
    ? Statement.defaultTransforms(transform).value
    : undefined;

  return Statement.makeCompiler<PgCustom>({
    dialect: "pg",
    placeholder(_) {
      return `$${_}`;
    },
    onIdentifier: transform ?
      function (value, withoutTransform) {
        return withoutTransform ? escape(value) : escape(transform(value));
      } :
      escape,
    onRecordUpdate(placeholders, valueAlias, valueColumns, values, returning) {
      return [
        `(values ${placeholders}) AS ${valueAlias}${valueColumns}${returning ? ` RETURNING ${returning[0]}` : ""}`,
        returning ?
          values.flat().concat(returning[1]) :
          values.flat()
      ];
    },
    onCustom(type, placeholder, withoutTransform) {
      switch (type.kind) {
        case "PgJson": {
          return [
            placeholder(undefined),
            [
              withoutTransform || transformValue === undefined
                ? type.i0
                : transformValue(type.i0)
            ]
          ];
        }
      }
    }
  });
};

const escape = Statement.defaultEscape("\"");

/**
 * @category custom types
 * @since 1.0.0
 */
export type PgCustom = PgJson

/**
 * @category custom types
 * @since 1.0.0
 */
interface PgJson extends Custom<"PgJson", unknown> {
}

/**
 * @category custom types
 * @since 1.0.0
 */
const PgJson = Statement.custom<PgJson>("PgJson");

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


export const make = <const TFullSchema extends DbSchema = DbSchema>(
  {schema}: MakeDbServiceOptions<TFullSchema>
): Effect.Effect<DatabaseService<TFullSchema>, SqlError, ConnectionContext | Logger | Reactivity.Reactivity | Scope.Scope | PoolService> => Effect.gen(function* () {


  const logger = yield* Logger;

  const pgClient = yield* makePgClient();


  const client = drizzle(pgClient.pool, {logger, casing: "snake_case", schema});

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


// export const _layer = (
//   connection: ClientConnectionOptions,
// ) => Layer.scopedContext(
//   Effect.map(makePgClient(), (client) =>
//     Context.make(PgClient, client).pipe(
//       Context.add(SqlClient.SqlClient, client)
//     ))
// );


export const liveLayer = (
  connection: PgClientConfig,
) => layer(connection)
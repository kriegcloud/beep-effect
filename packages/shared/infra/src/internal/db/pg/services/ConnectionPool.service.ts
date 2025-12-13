import { $SharedInfraId } from "@beep/identity/packages";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import type * as Scope from "effect/Scope";
import * as Pg from "pg";
import { DatabaseConnectionLostError } from "../errors";
import * as ConnectionConfig from "./ConnectionConfig.service";

const $I = $SharedInfraId.create("internal/db/pg/services/ConnectionPoolService");
export type Shape = {
  readonly pool: Pg.Pool;
  readonly setupConnectionListeners: Effect.Effect<void, DatabaseConnectionLostError, never>;
  readonly options: ConnectionConfig.PgClientConfig;
};

export type ServiceEffect = Effect.Effect<
  Shape,
  DatabaseConnectionLostError,
  Scope.Scope | ConnectionConfig.ConnectionConfig
>;

const serviceEffect: ServiceEffect = Effect.gen(function* () {
  const { config } = yield* ConnectionConfig.ConnectionConfig;

  const pool = new Pg.Pool({
    user: config.user,
    host: config.host,
    database: config.database,
    password: Redacted.value(config.password),
    port: config.port,
    ssl: config.ssl,
    connectionTimeoutMillis: Duration.toMillis(config.connectTimeout),
    idleTimeoutMillis: Duration.toMillis(config.idleTimeout),
    max: config.maxConnections,
    min: config.minConnections,
    maxLifetimeSeconds: config.connectionTTL ? Duration.toSeconds(config.connectionTTL) : undefined,
    application_name: config.application_name,
    types: config.types,
  });

  pool.on("error", (_err) => {});

  yield* Effect.acquireRelease(
    Effect.tryPromise({
      try: () => pool.query("SELECT 1"),
      catch: (cause) => new DatabaseConnectionLostError({ cause, message: "PgClient: Failed to connect" }),
    }),
    () => Effect.promise(() => pool.end()).pipe(Effect.interruptible, Effect.timeoutOption(1000))
  ).pipe(
    Effect.timeoutFail({
      duration: config.connectTimeout ?? Duration.seconds(5),
      onTimeout: DatabaseConnectionLostError.constNew({
        cause: new Error("Connection timed out"),
        message: "PgClient: Connection timed out",
      }),
    })
  );

  const setupConnectionListeners: Shape["setupConnectionListeners"] = Effect.zipRight(
    Effect.async<void, DatabaseConnectionLostError>((resume) => {
      pool.on("error", (error) => {
        resume(
          Effect.fail(
            new DatabaseConnectionLostError({
              cause: error,
              message: error.message,
            })
          )
        );
      });

      return Effect.sync(() => {
        pool.removeAllListeners("error");
      });
    }),
    Effect.logInfo("[Database client]: Connection error listeners initialized."),
    {
      concurrent: true,
    }
  );

  return {
    pool,
    setupConnectionListeners,
    options: config,
  };
});

export class ConnectionPool extends Effect.Service<ConnectionPool>()($I`ConnectionPool`, {
  accessors: true,
  dependencies: [ConnectionConfig.layer],
  scoped: serviceEffect,
}) {}

export const layer: Layer.Layer<ConnectionPool, DatabaseConnectionLostError, never> = ConnectionPool.Default.pipe(
  Layer.provide(ConnectionConfig.layer)
);

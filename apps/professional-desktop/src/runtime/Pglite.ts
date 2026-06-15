/**
 * File-backed PGlite database provisioning for the desktop chat sidecar.
 *
 * SPEC: "PGlite runs in the sidecar via pglite-socket." This module boots a
 * file-backed {@link PGlite} instance, exposes it over the PostgreSQL wire
 * protocol with a {@link PGLiteSocketServer} bound to loopback, and points the
 * repo's {@link PostgresClient}/{@link PostgresDrizzle} layers at that socket so
 * every slice repository (the Drizzle ThreadStore, the Drizzle usage-record
 * sink) runs against the same in-process database the integration tests already
 * prove. The db-admin Drizzle migrations are applied on boot.
 *
 * The PGlite instance and its socket server are owned by a {@link Scope}: the
 * socket server is acquired with {@link Effect.acquireRelease} and torn down
 * (`server.stop()` + `db.close()`) when the runtime scope closes, so the
 * sidecar leaves no orphaned listener or open database handle.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { fileURLToPath } from "node:url";
import { makeDrizzle, makeDrizzleLayer, migrate, PostgresClient } from "@beep/postgres";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { Config, Data, Effect, Layer, Redacted } from "effect";
import type { PostgresDrizzle } from "@beep/postgres";
import type * as Pg from "@effect/sql-pg/PgClient";
import type * as SqlClient from "effect/unstable/sql/SqlClient";

/**
 * Tagged provisioning failure for the sidecar's PGlite socket database. The
 * underlying defect (PGlite create / socket-server start) is preserved in
 * `cause`. These failures are unrecoverable at boot, so callers promote them to
 * defects (`Layer.orDie`).
 *
 * @category errors
 * @since 0.0.0
 */
class PgliteSocketError extends Data.TaggedError("PgliteSocketError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

// pglite-socket exposes a trust-auth PostgreSQL endpoint whose fixed database
// and role are both `postgres` (see its connection URL:
// `postgresql://postgres:postgres@host:port/postgres`).
const PGLITE_DATABASE = "postgres";
const PGLITE_USERNAME = "postgres";
const PGLITE_PASSWORD = "postgres";
const PGLITE_HOST = "127.0.0.1";

// The db-admin Drizzle migrations live under packages/_internal/db-admin and
// are applied into the default `drizzle` schema, matching the integration
// harness (TestDatabaseInfo.schema getOrElse "drizzle").
const migrationsFolder = fileURLToPath(new URL("../../../../packages/_internal/db-admin/drizzle", import.meta.url));
const migrationsSchema = "drizzle";

/**
 * Sidecar database configuration resolved from the environment.
 *
 * - `CHAT_DB_PATH` — directory PGlite persists into. Defaults to a repo-local
 *   `.beep/professional-desktop/chat-db` so dev runs are durable without extra
 *   setup; the packaged Tauri app points this at its data directory.
 * - `CHAT_DB_PORT` — loopback TCP port the pglite-socket server binds. Defaults
 *   to `54399` (off the standard 5432 to avoid colliding with a local
 *   PostgreSQL).
 *
 * @category configuration
 * @since 0.0.0
 */
const ChatDbConfig = Config.all({
  dataDir: Config.string("CHAT_DB_PATH").pipe(
    Config.withDefault(fileURLToPath(new URL("../../../../.beep/professional-desktop/chat-db", import.meta.url)))
  ),
  port: Config.port("CHAT_DB_PORT").pipe(Config.withDefault(54_399)),
});

/**
 * Boot a file-backed {@link PGlite} instance and expose it over the PostgreSQL
 * wire protocol via {@link PGLiteSocketServer}, scoped to the calling lifetime.
 * The server starts on acquire and is stopped (with the database closed) on
 * release.
 *
 * @category constructors
 * @since 0.0.0
 */
const acquirePgliteSocket = (dataDir: string, port: number) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const db = yield* Effect.tryPromise({
        try: () => PGlite.create(dataDir),
        catch: (cause) =>
          new PgliteSocketError({ message: `Failed to create file-backed PGlite at ${dataDir}`, cause }),
      });
      const server = new PGLiteSocketServer({ db, host: PGLITE_HOST, port });
      yield* Effect.tryPromise({
        try: () => server.start(),
        catch: (cause) =>
          new PgliteSocketError({ message: `Failed to start PGLiteSocketServer on ${PGLITE_HOST}:${port}`, cause }),
      });
      yield* Effect.logInfo("pglite socket server started").pipe(
        Effect.annotateLogs({ component: "chat-sidecar", dataDir, host: PGLITE_HOST, port })
      );
      return { db, server } as const;
    }),
    ({ db, server }) =>
      Effect.gen(function* () {
        yield* Effect.promise(() => server.stop());
        yield* Effect.promise(() => db.close());
      }).pipe(
        Effect.catchCause((cause) =>
          Effect.logWarning("pglite socket server teardown failed").pipe(Effect.annotateLogs({ cause }))
        )
      )
  );

/**
 * Live {@link PostgresClient} layer backed by a file-backed PGlite instance
 * exposed through pglite-socket. The socket server is started/stopped with the
 * layer scope; the native Effect PostgreSQL client connects to it over loopback
 * TCP. Connection/provisioning failures are unrecoverable here, so they are
 * promoted to defects (`Layer.orDie`).
 *
 * @category layers
 * @since 0.0.0
 */
const PgliteClientLive: Layer.Layer<PostgresClient | Pg.PgClient | SqlClient.SqlClient> = Layer.unwrap(
  Effect.gen(function* () {
    const { dataDir, port } = yield* ChatDbConfig;
    yield* acquirePgliteSocket(dataDir, port);
    return PostgresClient.makeLayer({
      database: PGLITE_DATABASE,
      host: PGLITE_HOST,
      maxConnections: 1,
      password: Redacted.make(PGLITE_PASSWORD),
      port,
      ssl: false,
      username: PGLITE_USERNAME,
    });
  })
).pipe(Layer.orDie);

/**
 * Apply the db-admin Drizzle migrations against the PGlite database on boot.
 * Idempotent: Drizzle's migration journal skips already-applied migrations on
 * subsequent runs.
 *
 * @category constructors
 * @since 0.0.0
 */
const migrateOnBoot: Effect.Effect<void, never, Pg.PgClient> = Effect.gen(function* () {
  const db = yield* makeDrizzle();
  yield* migrate(db, { migrationsFolder, migrationsSchema });
  yield* Effect.logInfo("chat sidecar migrations applied").pipe(
    Effect.annotateLogs({ component: "chat-sidecar", migrationsSchema })
  );
}).pipe(Effect.orDie);

/**
 * Live {@link PostgresDrizzle} layer over a file-backed PGlite instance, with
 * the db-admin migrations applied on boot. This is the shared database every
 * sidecar repository (the Drizzle ThreadStore, the Drizzle usage-record sink)
 * runs against.
 *
 * @category layers
 * @since 0.0.0
 */
export const PgliteDrizzleLive: Layer.Layer<PostgresDrizzle> = makeDrizzleLayer().pipe(
  Layer.tap(() => migrateOnBoot),
  Layer.provide(PgliteClientLive),
  Layer.orDie
);

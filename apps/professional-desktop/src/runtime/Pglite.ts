/**
 * In-process PGlite database provisioning for the desktop chat sidecar.
 *
 * Boots a file-backed {@link https://pglite.dev | PGlite} instance in-process via
 * the `@beep/pglite` driver (which wraps `@effect/sql-pglite` and aliases the
 * client under the `@effect/sql-pg` PgClient tag), then layers the repo's
 * {@link PostgresDrizzle} composition on top so every sidecar repository (the
 * Drizzle ThreadStore, the Drizzle usage-record sink) runs against the same
 * embedded database the integration tests prove. The sidecar's bundled Drizzle
 * migrations are applied on boot.
 *
 * Operational note: `CHAT_DB_PATH` is owned by this sidecar build's bundled
 * PGlite runtime. Existing unmarked directories are moved aside before first
 * in-process boot so older socket-bridge stores do not block startup.
 *
 * The PGlite instance is owned by the layer {@link Scope}: it is acquired and
 * released (`pglite.close()`) by `@beep/pglite` when the runtime scope closes, so
 * the sidecar leaves no open database handle behind. Provisioning failures are
 * unrecoverable at boot, so they are promoted to defects (`Layer.orDie`).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { fileURLToPath } from "node:url";
import * as Pglite from "@beep/pglite";
import { makeDrizzleLayer } from "@beep/postgres";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Clock, Config, Effect, FileSystem, Layer, Path } from "effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import { migrateOnBoot } from "./Migrations.js";
import type { PostgresDrizzle } from "@beep/postgres";
import type { Context } from "effect";

/**
 * Directory PGlite persists into, resolved from the environment.
 *
 * `CHAT_DB_PATH` defaults to a repo-local `.beep/professional-desktop/chat-db`
 * so dev runs are durable without extra setup; the packaged Tauri app points it
 * at its data directory.
 *
 * @category configuration
 * @since 0.0.0
 */
const ChatDbDataDir = Config.string("CHAT_DB_PATH").pipe(
  Config.withDefault(fileURLToPath(new URL("../../../../.beep/professional-desktop/chat-db", import.meta.url)))
);

/**
 * Marker written into data directories already validated for the in-process
 * desktop PGlite runtime.
 *
 * @category configuration
 * @since 0.0.0
 */
export const ChatDbCompatibilityMarker = ".beep-pglite-inprocess-v1";

const PgliteDataDirRequiredEntries = ["PG_VERSION", "base", "global"] as const;

const pathExists = (fs: FileSystem.FileSystem, target: string): Effect.Effect<boolean> =>
  fs.exists(target).pipe(Effect.orElseSucceed(() => false));

const hasPgliteDataDirShape = (entries: ReadonlyArray<string>): boolean =>
  PgliteDataDirRequiredEntries.every((entry) => entries.includes(entry));

const writeCompatibilityMarker = Effect.fn("ProfessionalDesktop.Pglite.writeCompatibilityMarker")(function* (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  dataDir: string
) {
  yield* fs.makeDirectory(dataDir, { recursive: true });
  const createdAtMillis = yield* Clock.currentTimeMillis;
  yield* fs.writeFileString(
    path.join(dataDir, ChatDbCompatibilityMarker),
    ["runtime=professional-desktop-pglite-inprocess", "version=1", `createdAtMillis=${createdAtMillis}`, ""].join("\n")
  );
});

const canOpenInProcessPgliteDataDir = Effect.fn("ProfessionalDesktop.Pglite.canOpenInProcessPgliteDataDir")(function* (
  dataDir: string
) {
  return yield* Effect.scoped(
    Layer.build(Pglite.makeLayer({ dataDir })).pipe(
      Effect.flatMap((context) =>
        Effect.gen(function* () {
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          yield* sql`SELECT 1`;
        }).pipe(Effect.provide(context))
      )
    )
  ).pipe(
    Effect.as(true),
    Effect.catchCause((cause) =>
      Effect.logWarning("existing chat db data dir is not compatible with in-process PGlite").pipe(
        Effect.annotateLogs({
          cause,
          component: "professional-desktop",
          dataDir,
        }),
        Effect.as(false)
      )
    )
  );
});

/**
 * Ensure a desktop chat database directory is safe for the current in-process
 * PGlite runtime.
 *
 * Fresh and already-marked directories are preserved. Unmarked PGlite-looking
 * directories are first opened through the new driver; compatible stores are
 * marked in-place so user history is retained, while incompatible populated
 * stores are moved aside with a timestamped backup before a fresh marked store
 * is created. Unreadable directories fail boot instead of being quarantined.
 *
 * @category runtime
 * @since 0.0.0
 */
export const ensureCompatibleChatDbDataDir = Effect.fn("ProfessionalDesktop.Pglite.ensureCompatibleChatDbDataDir")(
  function* (dataDir: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const markerPath = path.join(dataDir, ChatDbCompatibilityMarker);
    const dataDirExists = yield* pathExists(fs, dataDir);
    const markerExists = dataDirExists ? yield* pathExists(fs, markerPath) : false;

    if (markerExists) {
      return;
    }

    if (!dataDirExists) {
      yield* writeCompatibilityMarker(fs, path, dataDir);
      return;
    }

    const entries = yield* fs.readDirectory(dataDir);
    if (entries.length === 0) {
      yield* writeCompatibilityMarker(fs, path, dataDir);
      return;
    }

    if (hasPgliteDataDirShape(entries) && (yield* canOpenInProcessPgliteDataDir(dataDir))) {
      yield* writeCompatibilityMarker(fs, path, dataDir);
      yield* Effect.logInfo("existing chat db data dir preserved for in-process PGlite compatibility").pipe(
        Effect.annotateLogs({
          component: "professional-desktop",
          dataDir,
        })
      );
      return;
    }

    const backupPath = `${dataDir}.pre-inprocess-${yield* Clock.currentTimeMillis}`;
    yield* fs.rename(dataDir, backupPath);
    yield* writeCompatibilityMarker(fs, path, dataDir);
    yield* Effect.logWarning("chat db data dir moved for in-process PGlite compatibility").pipe(
      Effect.annotateLogs({
        backupPath,
        component: "professional-desktop",
        dataDir,
      })
    );
  }
);

/**
 * Live in-process PGlite client layer (file-backed), exposed under the
 * `@effect/sql-pg` PgClient / generic SqlClient tags so the Drizzle composition
 * binds to it. Provisioning failures are promoted to defects (`Layer.orDie`).
 *
 * @category layers
 * @since 0.0.0
 */
const PgliteClientLive = Layer.unwrap(
  Effect.gen(function* () {
    const dataDir = yield* ChatDbDataDir;
    yield* ensureCompatibleChatDbDataDir(dataDir);
    return Pglite.makeLayer({ dataDir });
  })
).pipe(Layer.orDie);

const MigrationPlatformLive = Layer.mergeAll(BunFileSystem.layer, BunPath.layer);

/**
 * Live {@link PostgresDrizzle} layer over a file-backed in-process PGlite
 * database, with the sidecar migrations applied on boot. This is the shared
 * database every sidecar repository (the Drizzle ThreadStore, the Drizzle
 * usage-record sink) runs against.
 *
 * @category layers
 * @since 0.0.0
 */
export const PgliteDrizzleLive: Layer.Layer<PostgresDrizzle> = makeDrizzleLayer().pipe(
  Layer.tap((context: Context.Context<PostgresDrizzle>) => Effect.provide(migrateOnBoot, context)),
  Layer.provide(PgliteClientLive),
  Layer.provide(MigrationPlatformLive),
  Layer.orDie
);

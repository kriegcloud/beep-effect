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
 * Operational note: `CHAT_DB_PATH` should be treated as owned by this sidecar
 * build's bundled PGlite runtime. Back up or reset existing directories created
 * by an older socket-bridge PGlite runtime before first in-process boot if the
 * embedded client cannot open them.
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
import { Config, Effect, Layer } from "effect";
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

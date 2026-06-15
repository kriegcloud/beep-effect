/**
 * ThreadStore server layers.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import * as ThreadStoreServer from "@beep/workspace-use-cases/server";
import { Layer } from "effect";
import { makeDrizzleThreadStore, makeInMemoryThreadStore } from "./ThreadStore.repo.ts";

const ThreadStore = ThreadStoreServer.Thread.ThreadStore;

/**
 * In-memory ThreadStore layer for fast workspace proofs.
 *
 * @example
 * ```ts
 * import { ThreadStoreInMemoryLayer } from "@beep/workspace-server/aggregates/Thread"
 *
 * console.log(ThreadStoreInMemoryLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const ThreadStoreInMemoryLayer = Layer.effect(ThreadStore, makeInMemoryThreadStore());

/**
 * Drizzle-backed ThreadStore layer requiring a {@link @beep/postgres#PostgresDrizzle} database.
 *
 * @example
 * ```ts
 * import { ThreadStoreDrizzleLayer } from "@beep/workspace-server/aggregates/Thread"
 *
 * console.log(ThreadStoreDrizzleLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const ThreadStoreDrizzleLayer = Layer.effect(ThreadStore, makeDrizzleThreadStore());

/**
 * Default ThreadStore layer (in-memory) for normal slice tests.
 *
 * @example
 * ```ts
 * import { ThreadStoreLive } from "@beep/workspace-server/aggregates/Thread"
 *
 * console.log(ThreadStoreLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const ThreadStoreLive = ThreadStoreInMemoryLayer;

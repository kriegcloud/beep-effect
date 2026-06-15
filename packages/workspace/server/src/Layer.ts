/**
 * Workspace server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { ThreadStoreDrizzleLayer, ThreadStoreInMemoryLayer } from "./aggregates/Thread/index.ts";

/**
 * Live workspace server layer backed by Drizzle persistence.
 *
 * @example
 * ```ts
 * import { WorkspaceServerLive } from "@beep/workspace-server/layer"
 *
 * console.log(WorkspaceServerLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WorkspaceServerLive = ThreadStoreDrizzleLayer;

/**
 * In-memory workspace server layer for fast proofs.
 *
 * @example
 * ```ts
 * import { WorkspaceServerInMemory } from "@beep/workspace-server/layer"
 *
 * console.log(WorkspaceServerInMemory)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WorkspaceServerInMemory = ThreadStoreInMemoryLayer;

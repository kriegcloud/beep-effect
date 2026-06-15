/**
 * Workspace server test layer.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.0.0
 */

import { ThreadStoreInMemoryLayer } from "./aggregates/Thread/index.ts";

/**
 * In-memory workspace server layer for tests.
 *
 * @example
 * ```ts
 * import { WorkspaceServerTest } from "@beep/workspace-server/test"
 *
 * console.log(WorkspaceServerTest)
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const WorkspaceServerTest = ThreadStoreInMemoryLayer;

/**
 * installer server test layer.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.0.0
 */

import { InstallerServerLive } from "./Layer.js";

/**
 * Deterministic test layer for the installer slice.
 *
 * @example
 * ```ts
 * import { InstallerServerTest } from "@beep/installer-server/test"
 *
 * console.log(InstallerServerTest)
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const InstallerServerTest = InstallerServerLive;

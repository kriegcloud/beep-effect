/**
 * Canvas server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { CanvasProjectServerLayer } from "./aggregates/CanvasProject/index.ts";

/**
 * Canvas project server service tag.
 *
 * @example
 * ```ts
 * import { CanvasProjectServer } from "@beep/canvas-server/layer"
 *
 * console.log(CanvasProjectServer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export { CanvasProjectServer } from "./aggregates/CanvasProject/CanvasProject.layer.js";

/**
 * Live canvas server layer.
 *
 * @example
 * ```ts
 * import { CanvasServerLive } from "@beep/canvas-server/layer"
 *
 * console.log(CanvasServerLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const CanvasServerLive = CanvasProjectServerLayer;

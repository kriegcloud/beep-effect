/**
 * Package entry point for `@beep/canvas-server`.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.0.0
 */

/**
 * Package version for the canvas server role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/canvas-server"
 *
 * console.log(VERSION)
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Direct CanvasProject server namespace export.
 *
 * @category handlers
 * @since 0.0.0
 */
export * as CanvasProject from "./aggregates/CanvasProject/index.js";
/**
 * Direct Worker server namespace export.
 *
 * @category handlers
 * @since 0.0.0
 */
export * as Worker from "./entities/Worker/index.js";
/**
 * Architecture lab server layer export.
 *
 * @category layers
 * @since 0.0.0
 */
export * from "./Layer.js";

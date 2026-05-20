/**
 * Package entry point for `@beep/canvas-domain`.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

/**
 * Package version for the canvas domain role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/canvas-domain"
 *
 * console.log(VERSION)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Direct CanvasProject aggregate namespace export.
 *
 * @category aggregates
 * @since 0.0.0
 */
export * as CanvasProject from "./aggregates/CanvasProject/index.js";
/**
 * Aggregate namespace exports for the canvas domain package.
 *
 * @category aggregates
 * @since 0.0.0
 */
export * as Aggregates from "./aggregates/index.js";
/**
 * Identity namespace exports for the canvas domain package.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export * as Identity from "./identity/index.js";

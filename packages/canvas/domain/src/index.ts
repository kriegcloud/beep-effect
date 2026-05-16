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
 * Entity namespace exports for the canvas domain package.
 *
 * @category entities
 * @since 0.0.0
 */
export * as Entities from "./entities/index.js";
/**
 * Direct Worker entity namespace export.
 *
 * @category entities
 * @since 0.0.0
 */
export * as Worker from "./entities/Worker/index.js";
/**
 * Identity namespace exports for the canvas domain package.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export * as Identity from "./identity/index.js";
/**
 * Value-object namespace exports for the canvas domain package.
 *
 * @category value-objects
 * @since 0.0.0
 */
export * as Values from "./values/index.js";
/**
 * Direct WorkPriority value-object namespace export.
 *
 * @category value-objects
 * @since 0.0.0
 */
export * as WorkPriority from "./values/WorkPriority/index.js";

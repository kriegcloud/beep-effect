/**
 * Package entry point for `@beep/architecture-lab-domain`.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

/**
 * Aggregate namespace exports for the architecture lab domain package.
 *
 * @category aggregates
 * @since 0.0.0
 */
export * as Aggregates from "./aggregates/index.js";
/**
 * Direct WorkItem aggregate namespace export.
 *
 * @category aggregates
 * @since 0.0.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
/**
 * Entity namespace exports for the architecture lab domain package.
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
 * Identity namespace exports for the architecture lab domain package.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export * as Identity from "./identity/index.js";
/**
 * Value-object namespace exports for the architecture lab domain package.
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

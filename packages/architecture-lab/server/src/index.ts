/**
 * Package entry point for `@beep/architecture-lab-server`.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.0.0
 */

/**
 * Direct WorkItem server namespace export.
 *
 * @category handlers
 * @since 0.0.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
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

/**
 * Package entry point for `@beep/architecture-lab-tables`.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

/**
 * Direct WorkItem table namespace export.
 *
 * @category tables
 * @since 0.0.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
/**
 * Direct Worker table namespace export.
 *
 * @category tables
 * @since 0.0.0
 */
export * as Worker from "./entities/Worker/index.js";
/**
 * Architecture lab Drizzle schema exports.
 *
 * @category tables
 * @since 0.0.0
 */
export * from "./tables.js";

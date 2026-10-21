/**
 * Client-facing facade for the architecture lab proof slice.
 *
 * **Details**
 *
 * This entry point exposes namespace barrels for browser or edge clients that
 * need WorkItem command/query contracts without depending on server repository
 * layers.
 *
 * @packageDocumentation
 * @category clients
 * @since 0.0.0
 */

/**
 * Namespace barrel for WorkItem client contracts.
 *
 * **Details**
 *
 * The exported namespace keeps WorkItem client symbols grouped at the package
 * root while the owning declarations remain documented in the aggregate module.
 *
 * @category clients
 * @since 0.0.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.ts";

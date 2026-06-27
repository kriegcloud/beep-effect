/**
 * Package entry point for `@beep/architecture-lab-config`.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.0.0
 */

/**
 * Browser-safe WorkItem public configuration exports.
 *
 * @example
 * ```ts
 * import {
 *   defaultWorkItemPublicConfig,
 *   WorkItemPublicConfig,
 * } from "@beep/architecture-lab-config"
 *
 * const config = WorkItemPublicConfig.make({
 *   assignmentEnabled: defaultWorkItemPublicConfig.assignmentEnabled,
 *   reopenCompletedEnabled: true,
 * })
 *
 * console.log(config.reopenCompletedEnabled)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export { defaultWorkItemPublicConfig, WorkItemPublicConfig } from "./public.js";

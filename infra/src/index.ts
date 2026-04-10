/**
 * Project-level constants and helpers for the infra workspace.
 *
 * @example
 * ```ts
 * import { infraProjectName } from "@beep/infra"
 *
 * console.log(infraProjectName)
 * // "beep-effect"
 * ```
 *
 * @since 0.0.0
 */

/**
 * Canonical Pulumi project name for this repository's infrastructure workspace.
 *
 * @category constants
 * @since 0.0.0
 */
export const infraProjectName = "beep-effect";

/**
 * V2T workstation automation surfaces.
 *
 * @since 0.0.0
 */
export * from "./V2T.js";

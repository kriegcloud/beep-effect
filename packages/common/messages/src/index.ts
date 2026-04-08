/**
 * Schema-aware i18n message formatting for `@beep/messages`.
 *
 * Provides pre-configured i18next translations and schema issue formatting hooks
 * for human-readable validation error messages.
 *
 * @since 0.0.0
 * @module @beep/messages
 */

export type { GetLogIssuesOptions } from "./i18n.js";
/**
 * @example
 * ```typescript
 * import { t, logIssues } from "@beep/messages"
 *
 * console.log(t("struct.missingKey")) // "This field is required"
 * void logIssues
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export { getLogIssues, leafHook, logIssues, t } from "./i18n.js";
// bench

/**
 * Schema-aware i18n message formatting for `@beep/messages`.
 *
 * Provides pre-configured i18next translations and schema issue formatting hooks
 * for human-readable validation error messages.
 *
 * @since 0.0.0
 * @module
 */

/**
 * Public i18n message formatting exports.
 *
 * @example
 * ```typescript
 * import { t, logIssues } from "@beep/messages"
 *
 * console.log(t("struct.missingKey")) // "This field is required"
 * void logIssues
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./i18n.js";
// bench

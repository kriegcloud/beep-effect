/**
 * CourtListener driver package boundary.
 *
 * @remarks
 * The current public surface exposes package metadata only. CourtListener API
 * schemas and services should be documented on their owning modules before
 * they are re-exported here.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/courtlistener"
 *
 * const packageLabel = `@beep/courtlistener@${VERSION}`
 * console.log(packageLabel) // "@beep/courtlistener@0.0.0"
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version for the CourtListener driver package.
 *
 * @remarks
 * This is the package release marker, not a CourtListener REST API version.
 * Model upstream API versions separately when endpoint modules are added.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/courtlistener"
 *
 * const isInitialPackageVersion = VERSION === "0.0.0"
 * console.log(isInitialPackageVersion) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

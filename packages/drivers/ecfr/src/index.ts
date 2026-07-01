/**
 * eCFR driver package boundary for Electronic Code of Federal Regulations
 * integrations.
 *
 * @remarks
 * The current public surface exposes package metadata only. eCFR endpoint
 * clients, schemas, and services should be documented on their owning modules
 * before they are re-exported here.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { VERSION } from "@beep/ecfr"
 *
 * const packageLabel = `@beep/ecfr@${VERSION}`
 *
 * strictEqual(packageLabel, "@beep/ecfr@0.0.0")
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version for the eCFR driver package.
 *
 * @remarks
 * This is the package release marker, not an eCFR API or Code of Federal
 * Regulations title version. Model upstream regulatory versioning separately
 * when endpoint modules are added.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { VERSION } from "@beep/ecfr"
 *
 * strictEqual(VERSION, "0.0.0")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Internal schema helpers that are not part of the primary public surface.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Re-export internal email schema helpers.
 *
 * @example
 * ```ts
 * import { Email } from "@beep/schema/internal"
 *
 * void Email
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./email.ts";

/**
 * Re-export internal IP address schema helpers.
 *
 * @example
 * ```ts
 * import { IpV4 } from "@beep/schema/internal"
 *
 * void IpV4
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./ip.ts";

/**
 * @fileoverview
 * Email sign-in module re-exports for contract schemas and handler.
 *
 * @module @beep/iam-client/sign-in/email/mod
 * @category SignIn/Email
 * @since 0.1.0
 */

/**
 * Re-exports email sign-in contract schemas (Payload, Success, Wrapper).
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/iam-client/sign-in"
 *
 * const payload = Email.Payload.make({
 *   email: "user@example.com",
 *   password: "securePassword123"
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./contract.ts";

/**
 * Re-exports email sign-in handler implementation.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Email } from "@beep/iam-client/sign-in"
 *
 * const program = Email.Handler({ email: "...", password: "..." })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./handler.ts";

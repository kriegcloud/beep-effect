/**
 * @fileoverview Email sign-up module exports.
 *
 * This module re-exports all contract schemas and handler implementations
 * for email-based user registration.
 *
 * @module @beep/iam-client/sign-up/email/mod
 * @category SignUp/Email
 * @since 0.1.0
 */

/**
 * Re-exports email sign-up contract schemas.
 *
 * Includes PayloadFrom, Payload, Success, and Wrapper for type-safe
 * sign-up flow implementation.
 *
 * @example
 * ```typescript
 * import { PayloadFrom, Payload, Success, Wrapper } from "@beep/iam-client/sign-up/email"
 *
 * const formData = PayloadFrom.make({
 *   firstName: "Jane",
 *   lastName: "Doe",
 *   email: "jane@example.com",
 *   password: "Pass123!",
 *   passwordConfirm: "Pass123!",
 *   rememberMe: true
 * })
 * ```
 *
 * @category SignUp/Email
 * @since 0.1.0
 */
export * from "./contract.ts";

/**
 * Re-exports email sign-up handler implementation.
 *
 * Provides the Handler function that executes the email sign-up flow
 * with captcha validation and session management.
 *
 * @example
 * ```typescript
 * import { Handler } from "@beep/iam-client/sign-up/email"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Handler(formData)
 *   console.log(result.user.id)
 * })
 * ```
 *
 * @category SignUp/Email
 * @since 0.1.0
 */
export * from "./handler.ts";

/**
 * @fileoverview Email sign-up namespace export.
 *
 * This module exports all email sign-up functionality under the Email namespace.
 * Provides access to contract schemas, handler implementation, and type utilities.
 *
 * @module @beep/iam-client/sign-up/email
 * @category SignUp/Email
 * @since 0.1.0
 */

/**
 * Email sign-up namespace containing all schemas and handlers.
 *
 * This namespace provides a structured API for email-based user registration:
 * - PayloadFrom: Form input schema with firstName/lastName
 * - Payload: Transform schema for API encoding
 * - Success: Response schema with user and token
 * - Handler: Implementation function
 * - Wrapper: Contract wrapper with captcha middleware
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/iam-client/sign-up"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const formData = Email.PayloadFrom.make({
 *     firstName: "John",
 *     lastName: "Smith",
 *     email: "john@example.com",
 *     password: "SecurePass123!",
 *     passwordConfirm: "SecurePass123!",
 *     rememberMe: true,
 *     redirectTo: "/dashboard"
 *   })
 *
 *   const result = yield* Email.Handler(formData)
 *   console.log(result.user.email) // "john@example.com"
 * })
 * ```
 *
 * @category SignUp/Email
 * @since 0.1.0
 */
export * as Email from "./mod.ts";

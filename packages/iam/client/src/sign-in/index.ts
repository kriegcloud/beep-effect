/**
 * @fileoverview
 * SignIn namespace aggregating email and username authentication flows.
 *
 * @module @beep/iam-client/sign-in
 * @category SignIn
 * @since 0.1.0
 */

/**
 * Sign-in namespace providing contracts, handlers, forms, and atoms for authentication.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 *
 * // Use forms with automatic validation
 * const { emailForm } = SignIn.Form.use()
 *
 * // Access email contract directly
 * const payload = SignIn.Email.Payload.make({ email: "user@example.com", password: "secret" })
 * ```
 *
 * @category SignIn
 * @since 0.1.0
 */
export * as SignIn from "./mod.ts";

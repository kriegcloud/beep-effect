/**
 * @fileoverview Sign-up namespace export.
 *
 * Exports the complete sign-up module as a namespace for hierarchical access
 * to contracts, forms, and handlers.
 *
 * @module @beep/iam-client/sign-up
 * @category SignUp
 * @since 0.1.0
 */

/**
 * Sign-up namespace containing email registration contracts, forms, and handlers.
 *
 * @example
 * ```typescript
 * import { SignUp } from "@beep/iam-client"
 *
 * // Access email contract
 * const payload = SignUp.Email.PayloadFrom.make({
 *   email: "user@example.com",
 *   password: "secret"
 * })
 *
 * // Access form hooks
 * const { emailForm } = SignUp.Form.use()
 * ```
 *
 * @category SignUp
 * @since 0.1.0
 */
export * as SignUp from "./mod.ts";

/**
 * @fileoverview Sign-up module barrel exports.
 *
 * Re-exports sign-up contracts, forms, and handlers for consumption by UI layers.
 *
 * @module @beep/iam-client/sign-up/mod
 * @category SignUp
 * @since 0.1.0
 */

/**
 * Re-exports reactive atoms for sign-up flows with toast feedback.
 *
 * @example
 * ```typescript
 * import { SignUp } from "@beep/iam-client"
 *
 * const { email } = SignUp.Atoms.use()
 * await email({ email: "user@example.com", password: "secret", ... })
 * ```
 *
 * @category SignUp/Exports
 * @since 0.1.0
 */
export * as Atoms from "./atoms";

/**
 * Re-exports email sign-up contract and handler.
 *
 * @example
 * ```typescript
 * import { SignUp } from "@beep/iam-client"
 *
 * const payload = SignUp.Email.PayloadFrom.make({
 *   email: "user@example.com",
 *   password: "secret"
 * })
 * ```
 *
 * @category SignUp/Exports
 * @since 0.1.0
 */
export { Email } from "./email";

/**
 * Re-exports sign-up form hooks.
 *
 * @example
 * ```typescript
 * import { SignUp } from "@beep/iam-client"
 *
 * const { emailForm } = SignUp.Form.use()
 * ```
 *
 * @category SignUp/Exports
 * @since 0.1.0
 */
export * as Form from "./form";

/**
 * Re-exports WrapperGroup and composed Layer for sign-up handlers.
 *
 * @example
 * ```typescript
 * import { SignUp } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Sign-up handlers available via dependency injection
 * }).pipe(Effect.provide(SignUp.layer))
 * ```
 *
 * @category SignUp/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports Effect service and runtime for sign-up operations.
 *
 * @example
 * ```typescript
 * import { SignUp } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const signUp = yield* SignUp.Service
 *   yield* signUp.Email({ email: "user@example.com", password: "secret", ... })
 * })
 * ```
 *
 * @category SignUp/Exports
 * @since 0.1.0
 */
export { runtime, Service } from "./service";

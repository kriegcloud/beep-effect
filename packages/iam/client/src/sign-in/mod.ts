/**
 * @fileoverview
 * Sign-in module re-exports for email and username authentication.
 *
 * @module @beep/iam-client/sign-in/mod
 * @category SignIn
 * @since 0.1.0
 */

/**
 * Re-exports reactive atoms for sign-in flows with toast feedback.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 *
 * const { email, username } = SignIn.Atoms.use()
 * await email({ email: "user@example.com", password: "secret" })
 * ```
 *
 * @category SignIn/Exports
 * @since 0.1.0
 */
export * as Atoms from "./atoms";

/**
 * Re-exports email sign-in contract and implementation.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 *
 * const emailPayload = SignIn.Email.Payload.make({ email: "user@example.com", password: "secret" })
 * ```
 *
 * @category SignIn/Exports
 * @since 0.1.0
 */
export { Email } from "./email";

/**
 * Re-exports form utilities for sign-in flows.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 *
 * const { emailForm, usernameForm } = SignIn.Form.use()
 * ```
 *
 * @category SignIn/Exports
 * @since 0.1.0
 */
export * as Form from "./form";

/**
 * Re-exports WrapperGroup and composed Layer for sign-in handlers.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Sign-in handlers available via dependency injection
 * }).pipe(Effect.provide(SignIn.layer))
 * ```
 *
 * @category SignIn/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports Effect service and runtime for sign-in operations.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const signIn = yield* SignIn.Service
 *   yield* signIn.Email({ email: "user@example.com", password: "secret" })
 * })
 * ```
 *
 * @category SignIn/Exports
 * @since 0.1.0
 */
export { runtime, Service } from "./service";

/**
 * Re-exports username sign-in contract and implementation.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 *
 * const usernamePayload = SignIn.Username.Payload.make({ username: "johndoe", password: "secret" })
 * ```
 *
 * @category SignIn/Exports
 * @since 0.1.0
 */
export { Username } from "./username";

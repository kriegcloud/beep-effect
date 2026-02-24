/**
 * @fileoverview
 * Password module re-exports for password management functionality.
 *
 * @module @beep/iam-client/password/mod
 * @category Password
 * @since 0.1.0
 */

/**
 * Re-exports reactive atoms for password flows with toast feedback.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 *
 * const { change, requestReset, reset } = Password.Atoms.use()
 * await change({ currentPassword: Redacted.make("old"), newPassword: Redacted.make("new") })
 * ```
 *
 * @category Password/Exports
 * @since 0.1.0
 */
export * as Atoms from "./atoms";

/**
 * Re-exports change password contract and implementation.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 *
 * const result = yield* Password.Change.Handler({
 *   currentPassword: Redacted.make("old"),
 *   newPassword: Redacted.make("new")
 * })
 * ```
 *
 * @category Password/Exports
 * @since 0.1.0
 */
export { Change } from "./change";

/**
 * Re-exports form utilities for password flows.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 *
 * const { changeForm, requestResetForm, resetForm } = Password.Form.use()
 * ```
 *
 * @category Password/Exports
 * @since 0.1.0
 */
export * as Form from "./form";

/**
 * Re-exports WrapperGroup and composed Layer for password handlers.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Password handlers available via dependency injection
 * }).pipe(Effect.provide(Password.layer))
 * ```
 *
 * @category Password/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports request password reset contract and implementation.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 *
 * const result = yield* Password.RequestReset.Handler({ email: "user@example.com" })
 * ```
 *
 * @category Password/Exports
 * @since 0.1.0
 */
export { RequestReset } from "./request-reset";

/**
 * Re-exports reset password contract and implementation.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 *
 * const result = yield* Password.Reset.Handler({
 *   newPassword: Redacted.make("new"),
 *   token: "reset-token"
 * })
 * ```
 *
 * @category Password/Exports
 * @since 0.1.0
 */
export { Reset } from "./reset";

/**
 * Re-exports Effect service and runtime for password operations.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const service = yield* Password.Service
 *   yield* service.Change({ currentPassword: Redacted.make("old"), newPassword: Redacted.make("new") })
 * })
 * ```
 *
 * @category Password/Exports
 * @since 0.1.0
 */
export { runtime, Service } from "./service";

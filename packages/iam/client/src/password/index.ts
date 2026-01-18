/**
 * @fileoverview
 * Password module namespace export.
 *
 * Re-exports Password module from mod.ts for unified namespace consumption.
 *
 * @module @beep/iam-client/password
 * @category Password
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client/password"
 *
 * // Access features
 * Password.Change.Handler
 * Password.RequestReset.Handler
 * Password.Reset.Handler
 *
 * // Use atoms
 * const { change, requestReset, reset } = Password.Atoms.use()
 *
 * // Use forms
 * const { changeForm, requestResetForm, resetForm } = Password.Form.use()
 *
 * // Use service
 * const password = yield* Password.Service
 * yield* password.Change({ currentPassword, newPassword })
 * ```
 */
export * as Password from "./mod.ts";

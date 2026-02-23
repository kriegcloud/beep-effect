/**
 * @fileoverview
 * TwoFactor module namespace export.
 *
 * Re-exports TwoFactor module from mod.ts for unified namespace consumption.
 *
 * @module @beep/iam-client/two-factor
 * @category TwoFactor
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client/two-factor"
 *
 * // Top-level handlers
 * TwoFactor.Enable.Handler
 * TwoFactor.Disable.Handler
 *
 * // Submodule handlers
 * TwoFactor.Backup.Generate.Handler
 * TwoFactor.OTP.Send.Handler
 * TwoFactor.TOTP.Verify.Handler
 *
 * // Use atoms
 * const { enable, disable } = TwoFactor.Atoms.use()
 * ```
 */

// Re-export the common user schema for backwards compatibility
export { TwoFactorUser } from "./_common/user.schema.ts";

export * as TwoFactor from "./mod.ts";

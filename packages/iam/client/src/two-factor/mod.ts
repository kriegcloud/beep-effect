/**
 * @fileoverview
 * TwoFactor module re-exports for two-factor authentication management.
 *
 * @module @beep/iam-client/two-factor/mod
 * @category TwoFactor
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * // Top-level handlers
 * yield* TwoFactor.Enable.Handler({ password })
 * yield* TwoFactor.Disable.Handler({ password })
 *
 * // Submodule handlers
 * yield* TwoFactor.Backup.Generate.Handler({ password })
 * yield* TwoFactor.OTP.Send.Handler({})
 * yield* TwoFactor.TOTP.Verify.Handler({ code: "123456" })
 *
 * // Atoms
 * const { enable, disable } = TwoFactor.Atoms.use()
 * ```
 */

/**
 * Re-exports reactive atoms for two-factor flows with toast feedback.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export * as Atoms from "./atoms.ts";

/**
 * Re-exports Backup submodule for backup code management.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export { Backup } from "./backup";

/**
 * Re-exports Disable two-factor contract and implementation.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export { Disable } from "./disable";

/**
 * Re-exports Enable two-factor contract and implementation.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export { Enable } from "./enable";

/**
 * Re-exports WrapperGroup and composed Layer for two-factor handlers.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer.ts";

/**
 * Re-exports OTP submodule for OTP verification.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export { OTP } from "./otp";

/**
 * Re-exports Effect service and runtime for two-factor operations.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export { runtime, Service } from "./service.ts";

/**
 * Re-exports TOTP submodule for TOTP verification.
 *
 * @category TwoFactor/Exports
 * @since 0.1.0
 */
export { TOTP } from "./totp";

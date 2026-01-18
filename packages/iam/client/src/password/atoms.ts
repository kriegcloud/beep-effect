/**
 * @fileoverview
 * Reactive atoms for password flows with toast feedback.
 *
 * Provides runtime-powered atoms that wrap password handlers with toast feedback.
 * Atoms are bound to the password service runtime and expose React hooks for
 * component integration.
 *
 * @module @beep/iam-client/password/atoms
 * @category Password
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";

const ChangeAtom = runtime.fn(
  F.flow(
    Service.Change,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Password changed successfully",
      onWaiting: "Changing password...",
    }),
    Effect.asVoid
  )
);

const RequestResetAtom = runtime.fn(
  F.flow(
    Service.RequestReset,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Password reset email sent",
      onWaiting: "Sending reset email...",
    }),
    Effect.asVoid
  )
);

const ResetAtom = runtime.fn(
  F.flow(
    Service.Reset,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Password reset successfully",
      onWaiting: "Resetting password...",
    }),
    Effect.asVoid
  )
);

/**
 * React hook providing password atoms.
 *
 * @example
 * ```tsx
 * import { Password } from "@beep/iam-client"
 *
 * function PasswordManager() {
 *   const { change, requestReset, reset } = Password.Atoms.use()
 *
 *   return (
 *     <>
 *       <button onClick={async () => change({
 *         currentPassword: Redacted.make("old"),
 *         newPassword: Redacted.make("new")
 *       })}>
 *         Change Password
 *       </button>
 *       <button onClick={async () => requestReset({ email: "user@example.com" })}>
 *         Forgot Password
 *       </button>
 *     </>
 *   )
 * }
 * ```
 *
 * @category Password/Hooks
 * @since 0.1.0
 */
export const use = () => ({
  change: useAtomSet(ChangeAtom, Common.modePromise),
  requestReset: useAtomSet(RequestResetAtom, Common.modePromise),
  reset: useAtomSet(ResetAtom, Common.modePromise),
});

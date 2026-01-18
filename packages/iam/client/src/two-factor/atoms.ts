/**
 * @fileoverview
 * Reactive atoms for two-factor flows with toast feedback.
 *
 * Provides runtime-powered atoms that wrap two-factor handlers with toast feedback.
 * Atoms are bound to the two-factor service runtime and expose React hooks for
 * component integration.
 *
 * @module @beep/iam-client/two-factor/atoms
 * @category TwoFactor
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";

const EnableAtom = runtime.fn(
  F.flow(
    Service.Enable,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e: Common.IamBetterAuthError | Common.UnknownIamError) => e.message,
      onSuccess: "Two-factor authentication initialized",
      onWaiting: "Enabling two-factor...",
    })
  )
);

const DisableAtom = runtime.fn(
  F.flow(
    Service.Disable,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e: Common.IamBetterAuthError | Common.UnknownIamError) => e.message,
      onSuccess: "Two-factor authentication disabled",
      onWaiting: "Disabling two-factor...",
    }),
    Effect.asVoid
  )
);

/**
 * React hook providing top-level two-factor atoms.
 *
 * @example
 * ```tsx
 * import { TwoFactor } from "@beep/iam-client"
 *
 * function TwoFactorSettings() {
 *   const { enable, disable } = TwoFactor.Atoms.use()
 *
 *   return (
 *     <>
 *       <button onClick={() => enable({ password: Redacted.make("pass") })}>
 *         Enable 2FA
 *       </button>
 *       <button onClick={() => disable({ password: Redacted.make("pass") })}>
 *         Disable 2FA
 *       </button>
 *     </>
 *   )
 * }
 * ```
 *
 * @category TwoFactor/Hooks
 * @since 0.1.0
 */
export const use = () => ({
  enable: useAtomSet(EnableAtom, Common.modePromise),
  disable: useAtomSet(DisableAtom, Common.modePromise),
});

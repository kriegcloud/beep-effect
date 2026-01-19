"use client";
/**
 * @fileoverview
 * Reactive atoms for email verification flows with toast feedback.
 *
 * Provides runtime-powered atoms that wrap email verification handlers with toast feedback.
 * Atoms are bound to the email verification service runtime and expose React hooks for
 * component integration.
 *
 * @module @beep/iam-client/email-verification/atoms
 * @category EmailVerification
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";

const SendVerificationAtom = runtime.fn(
  F.flow(
    Service.SendVerification,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Verification email sent",
      onWaiting: "Sending verification email...",
    }),
    Effect.asVoid
  )
);

/**
 * React hook providing email verification atoms.
 *
 * @example
 * ```tsx
 * import { EmailVerification } from "@beep/iam-client"
 *
 * function ResendVerificationButton() {
 *   const { sendVerification } = EmailVerification.Atoms.use()
 *
 *   return (
 *     <button onClick={async () => sendVerification({ email: "user@example.com" })}>
 *       Resend Verification Email
 *     </button>
 *   )
 * }
 * ```
 *
 * @category EmailVerification/Hooks
 * @since 0.1.0
 */
export const use = () => ({
  sendVerification: useAtomSet(SendVerificationAtom, Common.modePromise),
});

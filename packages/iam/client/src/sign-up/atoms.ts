"use client";
/**
 * @fileoverview Sign-up atoms for reactive email registration.
 *
 * Provides runtime-powered atoms that wrap sign-up handlers with toast feedback.
 * Atoms are bound to the sign-up service runtime and expose React hooks for
 * component integration.
 *
 * @module @beep/iam-client/sign-up/atoms
 * @category SignUp
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { toastEffect } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { runtime, Service } from "./service.ts";

const EmailAtom = runtime.fn(
  F.flow(
    Service.Email,
    Effect.catchTag("UnknownIamError", Effect.die),
    toastEffect({
      whenFailure: (e) =>
        Cause.failureOption(e.cause).pipe(
          O.match({
            onNone: O.none<string>,
            onSome: (e) => O.some(e.message),
          })
        ),
      whenSuccess: "Signed up successfully",
      whenLoading: "Signing up...",
    }),
    Effect.asVoid
  )
);

/**
 * Returns sign-up atom hooks bound to the sign-up service runtime.
 *
 * @example
 * ```tsx
 * import { use } from "@beep/iam-client/sign-up/atoms"
 * import * as React from "react"
 *
 * const MyComponent = () => {
 *   const { email } = use()
 *
 *   const handleSignUp = async () => {
 *     email({ email: "user@example.com", password: "secret" })
 *   }
 *
 *   return <button onClick={handleSignUp}>Sign Up</button>
 * }
 * ```
 *
 * @category SignUp/Hooks
 * @since 0.1.0
 */
export const use = () => ({
  email: useAtomSet(EmailAtom, Common.modePromise),
});

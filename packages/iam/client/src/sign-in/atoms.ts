"use client";
/**
 * @fileoverview
 * Reactive atoms for sign-in flows with toast feedback.
 *
 * Provides runtime-powered atoms that wrap sign-in handlers with toast feedback.
 * Atoms are bound to the sign-in service runtime and expose React hooks for
 * component integration.
 *
 * @module @beep/iam-client/sign-in/atoms
 * @category SignIn
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
    toastEffect({
      onFailure: (e) =>
        Cause.failureOption(e.cause).pipe(
          O.match({
            onNone: O.none<string>,
            onSome: (e) => O.some(e.message),
          })
        ),
      onSuccess: "Signed in successfully",
      onWaiting: "Signing in...",
    }),
    Effect.asVoid
  )
);

const UsernameAtom = runtime.fn(
  F.flow(
    Service.Username,
    toastEffect({
      onFailure: (e) =>
        Cause.failureOption(e.cause).pipe(
          O.match({
            onNone: O.none<string>,
            onSome: (e) => O.some(e.message),
          })
        ),
      onSuccess: "Signed in successfully",
      onWaiting: "Signing in...",
    }),
    Effect.asVoid
  )
);

/**
 * React hook providing sign-in atoms for email and username authentication.
 *
 * @example
 * ```tsx
 * import { SignIn } from "@beep/iam-client"
 *
 * function SignInComponent() {
 *   const { email, username } = SignIn.Atoms.use()
 *
 *   return (
 *     <>
 *       <button onClick={async () => email({ email: "user@example.com", password: "secret" })}>
 *         Sign in with Email
 *       </button>
 *       <button onClick={async () => username({ username: "johndoe", password: "secret" })}>
 *         Sign in with Username
 *       </button>
 *     </>
 *   )
 * }
 * ```
 *
 * @category SignIn/Hooks
 * @since 0.1.0
 */
export const use = () => ({
  email: useAtomSet(EmailAtom, Common.modePromise),
  username: useAtomSet(UsernameAtom, Common.modePromise),
});

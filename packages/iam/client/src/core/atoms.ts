"use client";
/**
 * @fileoverview Core authentication atoms for React integration.
 *
 * Provides runtime-powered atoms that wrap core authentication handlers with
 * toast feedback. Atoms are bound to the core service runtime and expose
 * React hooks for component integration.
 *
 * @module @beep/iam-client/core/atoms
 * @category Core
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { withToast } from "@beep/ui/common";
import { useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";

const SignOutAtom = runtime.fn(
  F.flow(
    Service.SignOut,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Signed out successfully",
      onWaiting: "Signing out...",
    }),
    Effect.asVoid
  )
);

const SessionAtom = runtime.atom(Service.GetSession());

/**
 * React hook providing core authentication operations and session state.
 *
 * Returns sign-out handler, current session result, and session refresh function
 * for use in React components. Session state automatically refreshes when
 * `$sessionSignal` is notified by session-mutating handlers.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/iam-client"
 *
 * function MyComponent() {
 *   const { signOut, sessionResult, sessionRefresh } = Core.Atoms.use()
 *
 *   return (
 *     <button onClick={() => signOut()}>
 *       Sign Out
 *     </button>
 *   )
 * }
 * ```
 *
 * @category Core/Hooks
 * @since 0.1.0
 */
export const use = () => ({
  signOut: useAtomSet(SignOutAtom, Common.modePromise),
  sessionResult: useAtomValue(SessionAtom),
  sessionRefresh: useAtomRefresh(SessionAtom),
});

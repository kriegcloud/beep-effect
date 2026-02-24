"use client";
/**
 * @fileoverview
 * Reactive atoms for multi-session flows with toast feedback.
 *
 * Provides runtime-powered atoms that wrap multi-session handlers with toast feedback.
 * Atoms are bound to the multi-session service runtime and expose React hooks for
 * component integration.
 *
 * @module @beep/iam-client/multi-session/atoms
 * @category MultiSession
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";

const ListSessionsAtom = runtime.fn(
  F.flow(
    Service.ListSessions,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Sessions loaded",
      onWaiting: "Loading sessions...",
    }),
    Effect.asVoid
  )
);

const RevokeAtom = runtime.fn(
  F.flow(
    Service.Revoke,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Session revoked",
      onWaiting: "Revoking session...",
    }),
    Effect.asVoid
  )
);

const SetActiveAtom = runtime.fn(
  F.flow(
    Service.SetActive,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Session activated",
      onWaiting: "Activating session...",
    }),
    Effect.asVoid
  )
);

/**
 * React hook providing multi-session atoms.
 *
 * @example
 * ```tsx
 * import { MultiSession } from "@beep/iam-client"
 *
 * function SessionManager() {
 *   const { listSessions, revoke, setActive } = MultiSession.Atoms.use()
 *
 *   return (
 *     <>
 *       <button onClick={async () => listSessions()}>
 *         List Sessions
 *       </button>
 *       <button onClick={async () => revoke({ sessionToken: "..." })}>
 *         Revoke Session
 *       </button>
 *     </>
 *   )
 * }
 * ```
 *
 * @category MultiSession/Hooks
 * @since 0.1.0
 */
export const use = () => ({
  listSessions: useAtomSet(ListSessionsAtom, Common.modePromise),
  revoke: useAtomSet(RevokeAtom, Common.modePromise),
  setActive: useAtomSet(SetActiveAtom, Common.modePromise),
});

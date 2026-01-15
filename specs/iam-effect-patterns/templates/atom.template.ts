/**
 * Atom Template
 *
 * This template demonstrates the canonical pattern for creating
 * Effect-atom atoms that wrap IAM handlers with toast integration.
 *
 * Copy this template when implementing new IAM UI atoms.
 */

import { {{Service}}, {{runtime}} } from "@beep/iam-client/{{domain}}";
import { withToast } from "@beep/ui/common/index";
import { useAtomSet, useAtomValue, useAtomRefresh } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import type * as Common from "@beep/iam-client/_common";

/**
 * Function atom with toast integration
 *
 * Pattern breakdown:
 * 1. Use runtime.fn to create a function atom
 * 2. Use F.flow to compose handler with toast
 * 3. Toast options provide user feedback during async operation
 */
export const {{method}}Atom = {{runtime}}.fn(
  F.flow(
    {{Service}}.{{method}},
    withToast({
      // Message shown while operation is in progress
      onWaiting: "{{waitingMessage}}",

      // Message shown on success
      // Can be string or function: (result) => string
      onSuccess: "{{successMessage}}",

      // Message shown on failure
      // Receives the typed error from the handler
      onFailure: (e) => e.message,

      // Optional: Custom message for defects (unexpected errors)
      // onDefect: "An unexpected error occurred",
    })
  )
);

/**
 * Payload type for handler
 *
 * Export this type so form components can use it for type safety.
 */
export type {{Method}}Payload = {
  readonly payload: Parameters<typeof {{Service}}.{{method}}>[0]["payload"];
  readonly fetchOptions?: Common.ClientFetchOption | undefined;
};

/**
 * Hook exposing the atom
 *
 * Pattern:
 * - Use useAtomSet with mode: "promise" to get Promise<T> return
 * - Export as named hook for consistent API
 */
export const use{{Domain}} = () => {
  const {{method}} = useAtomSet({{method}}Atom, {
    mode: "promise" as const,
  });

  return {
    {{method}},
  };
};

/**
 * Alternative: Hook with multiple actions
 *
 * For domains with multiple related operations:
 *
 * export const signInEmailAtom = signInRuntime.fn(
 *   F.flow(SignInService.email, withToast({...}))
 * );
 *
 * export const signInSocialAtom = signInRuntime.fn(
 *   F.flow(SignInService.social, withToast({...}))
 * );
 *
 * export const useSignIn = () => {
 *   const email = useAtomSet(signInEmailAtom, { mode: "promise" });
 *   const social = useAtomSet(signInSocialAtom, { mode: "promise" });
 *
 *   return { email, social };
 * };
 */

/**
 * Alternative: Hook with read + refresh (for query atoms)
 *
 * For atoms that fetch data (like getSession):
 *
 * export const getSessionAtom = coreRuntime.atom(CoreService.getSession());
 *
 * export const useSession = () => {
 *   const sessionResult = useAtomValue(getSessionAtom);
 *   const sessionRefresh = useAtomRefresh(getSessionAtom);
 *
 *   return {
 *     sessionResult,
 *     sessionRefresh,
 *   };
 * };
 */

/**
 * Alternative: Combined action + session refresh
 *
 * For actions that should refresh session state after completion:
 *
 * export const useCore = () => {
 *   const signOutSetter = useAtomSet(signOutAtom, { mode: "promise" });
 *   const sessionResult = useAtomValue(getSessionAtom);
 *   const sessionRefresh = useAtomRefresh(getSessionAtom);
 *
 *   const signOut = async (payload?: SignOutPayload) => {
 *     await signOutSetter(payload);
 *     sessionRefresh(); // Trigger session re-fetch
 *   };
 *
 *   return {
 *     signOut,
 *     sessionResult,
 *     sessionRefresh,
 *   };
 * };
 */

/**
 * State Machine Pattern (Advanced)
 *
 * For multi-step flows that need coordinated state:
 *
 * import { Atom, Registry } from "@effect-atom/atom-react";
 * import * as Effect from "effect/Effect";
 * import * as O from "effect/Option";
 *
 * // Define state machine states
 * type FlowState =
 *   | { readonly _tag: "Idle" }
 *   | { readonly _tag: "AwaitingInput"; readonly email: string }
 *   | { readonly _tag: "Processing" }
 *   | { readonly _tag: "AwaitingVerification"; readonly userId: string }
 *   | { readonly _tag: "Complete"; readonly user: Common.DomainUser }
 *   | { readonly _tag: "Error"; readonly error: Common.IamError };
 *
 * // State atom
 * export const flowStateAtom = Atom.make<FlowState>({ _tag: "Idle" });
 *
 * // Transition atom
 * export const beginFlowAtom = runtime.fn(
 *   Effect.fn(function* (email: string) {
 *     const registry = yield* Registry.AtomRegistry;
 *
 *     // Update state to processing
 *     registry.set(flowStateAtom, { _tag: "Processing" });
 *
 *     try {
 *       const result = yield* SomeService.begin({ payload: { email } });
 *       registry.set(flowStateAtom, {
 *         _tag: "AwaitingVerification",
 *         userId: result.userId,
 *       });
 *       return result;
 *     } catch (error) {
 *       registry.set(flowStateAtom, {
 *         _tag: "Error",
 *         error: Common.IamError.fromUnknown(error),
 *       });
 *       throw error;
 *     }
 *   })
 * );
 *
 * // Usage in component
 * export const useFlow = () => {
 *   const state = useAtomValue(flowStateAtom);
 *   const begin = useAtomSet(beginFlowAtom, { mode: "promise" });
 *
 *   return { state, begin };
 * };
 */

import { withToast } from "@beep/ui/common/with-toast";
import { useAtomSet, useAtomRefresh, useAtomValue } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import { CoreService, coreRuntime } from "./service.ts";
import type * as Common from "../_common";

const signOutAtom = coreRuntime.fn(
  F.flow(
    CoreService.signOut,
    withToast({
      onWaiting: "Signing out...",
      onSuccess: "Signed out successfully",
      onFailure: (e) => e.message,
    })
  )
);

const getSessionAtom = coreRuntime.atom(CoreService.getSession());

export type SignOutPayload =
  | undefined
  | {
      readonly fetchOptions?: undefined | Common.ClientFetchOption;
    };

export const useCore = () => {
  const signOutSetter = useAtomSet(signOutAtom, {
    mode: "promise" as const,
  });

  const sessionResult = useAtomValue(getSessionAtom);
  const sessionRefresh = useAtomRefresh(getSessionAtom);

  const signOut = async (payload?: SignOutPayload) => {
    await signOutSetter(payload);
    sessionRefresh();
  };

  return {
    signOut,
    sessionResult,
    sessionRefresh,
  };
};
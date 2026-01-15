import { useAtomSet, useAtomRefresh, useAtomValue } from "@effect-atom/atom-react";
import { CoreService, coreRuntime } from "./service";
import type * as Common from "../_common";

const signOutAtom = coreRuntime.fn(CoreService.signOut);

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
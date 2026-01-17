import { withToast } from "@beep/ui/common/with-toast";
import { useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";

const signOutAtom = runtime.fn(
  F.flow(
    Service.SignOut,
    withToast({
      onWaiting: "Signing out...",
      onSuccess: "Signed out successfully",
      onFailure: (e) => e.message,
    }),
    Effect.asVoid
  )
);

const getSessionAtom = runtime.atom(Service.GetSession());

export const useCore = () => {
  const signOutSetter = useAtomSet(signOutAtom, {
    mode: "promise" as const,
  });

  const sessionResult = useAtomValue(getSessionAtom);
  const sessionRefresh = useAtomRefresh(getSessionAtom);

  const signOut = async () => {
    await signOutSetter();
    sessionRefresh();
  };

  return {
    signOut,
    sessionResult,
    sessionRefresh,
  };
};

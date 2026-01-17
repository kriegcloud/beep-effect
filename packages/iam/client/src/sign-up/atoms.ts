import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";
export const signUpEmailAtom = runtime.fn(
  F.flow(
    Service.Email,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Signed in successfully",
      onWaiting: "Signing in...",
    }),
    Effect.asVoid
  )
);

export const useSignUp = () => {
  const email = useAtomSet(signUpEmailAtom, {
    mode: "promise" as const,
  });

  return {
    email,
  };
};

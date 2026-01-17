import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { runtime, Service } from "./service.ts";

export const signInEmailAtom = runtime.fn(
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

export const signInUsernameAtom = runtime.fn(
  F.flow(
    Service.Username,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Signed in successfully",
      onWaiting: "Signing in...",
    }),
    Effect.asVoid
  )
);

export const useSignIn = () => {
  const email = useAtomSet(signInEmailAtom, {
    mode: "promise" as const,
  });
  const username = useAtomSet(signInUsernameAtom, {
    mode: "promise" as const,
  });

  return {
    email,
    username,
  };
};

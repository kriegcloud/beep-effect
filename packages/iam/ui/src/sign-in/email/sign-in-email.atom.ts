import { SignInService, signInRuntime } from "@beep/iam-client/v1/sign-in";
import { withToast } from "@beep/ui/common/index";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";

export const signInEmailAtoms = signInRuntime.fn(
  F.flow(
    SignInService.email,
    withToast({
      onWaiting: "Signing in...",
      onSuccess: "Signed in successfully",
      onFailure: (e) => e.message,
    })
  )
);

export const useSignIn = () => {
  const email = useAtomSet(signInEmailAtoms, {
    mode: "promise" as const,
  });

  return {
    email,
  };
};
import { SignUpService, signUpRuntime } from "@beep/iam-client/sign-up";
import { withToast } from "@beep/ui/common/index";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";

export const signUpEmailAtoms = signUpRuntime.fn(
  F.flow(
    SignUpService.email,
    withToast({
      onWaiting: "Signing up...",
      onSuccess: "Signed up successfully",
      onFailure: (e) => e.message,
    })
  )
);

export const useSignUp = () => {
  const email = useAtomSet(signUpEmailAtoms, {
    mode: "promise" as const,
  });

  return {
    email,
  };
};

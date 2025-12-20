"use client";
import { SignUpService } from "@beep/iam-client/clients/sign-up/sign-up.service";
import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";

const signUpRuntime = makeAtomRuntime(SignUpService.Live);

const signUpEmailAtom = signUpRuntime.fn(
  F.flow(
    SignUpService.SignUpEmail,
    withToast({
      onWaiting: "Signing up",
      onSuccess: "Signed up successfully",
      onFailure: (e) => e.message,
    })
  )
);

export const useSignUpEmail = () => {
  const signUpEmail = useAtomSet(signUpEmailAtom);
  return {
    signUpEmail,
  };
};

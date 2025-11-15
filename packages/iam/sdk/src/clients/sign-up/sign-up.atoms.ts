"use client";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { SignUpService } from "./sign-up.service";

const signUpRuntime = makeAtomRuntime(SignUpService.Live);

const signUpToastOptions = {
  onWaiting: "Signing up",
  onSuccess: "Signed up successfully",
  onFailure: O.match({
    onNone: () => "Failed with unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
} as const;

const signUpEmailAtom = signUpRuntime.fn(F.flow(SignUpService.SignUpEmail, withToast(signUpToastOptions)));
export const useSignUpEmail = () => {
  const [signUpResult, signUpEmail] = useAtom(signUpEmailAtom);
  return {
    signUpResult,
    signUpEmail,
  };
};

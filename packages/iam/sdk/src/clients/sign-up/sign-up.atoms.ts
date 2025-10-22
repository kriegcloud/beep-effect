"use client";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { SignUpImplementations } from "./sign-up.implementations";

const signUpToastOptions = {
  onWaiting: "Signing up",
  onSuccess: "Signed up successfully",
  onFailure: O.match({
    onNone: () => "Failed with unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
} as const;

const signUpEmailAtom = iamAtomRuntime.fn(F.flow(SignUpImplementations.SignUpEmail, withToast(signUpToastOptions)));
export const useSignUpEmail = () => {
  const [signUpResult, signUpEmail] = useAtom(signUpEmailAtom);
  return {
    signUpResult,
    signUpEmail,
  };
};

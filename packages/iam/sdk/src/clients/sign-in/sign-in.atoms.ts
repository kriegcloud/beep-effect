"use client";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { SignInService } from "./sign-in.service";

const signInRuntime = makeAtomRuntime(SignInService.Live);

const signInToastOptions = {
  onWaiting: "Signing in",
  onSuccess: "Signed in successfully",
  onFailure: O.match({
    onNone: () => "Failed with unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
};

export const signInPasskeyAtom = signInRuntime.fn(F.flow(SignInService.SignInPasskey, withToast(signInToastOptions)));
export const useSignInPasskey = () => {
  const [signInPasskeyResult, signInPasskey] = useAtom(signInPasskeyAtom);
  return {
    signInPasskeyResult,
    signInPasskey,
  };
};

export const signInSocialAtom = signInRuntime.fn(F.flow(SignInService.SignInSocial, withToast(signInToastOptions)));
export const useSignInSocial = () => {
  const [signInSocialResult, signInSocial] = useAtom(signInSocialAtom);
  return {
    signInSocialResult,
    signInSocial,
  };
};

export const signInEmailAtom = signInRuntime.fn(F.flow(SignInService.SignInEmail, withToast(signInToastOptions)));
export const useSignInEmail = () => {
  const [signInEmailResult, signInEmail] = useAtom(signInEmailAtom);
  return {
    signInEmailResult,
    signInEmail,
  };
};

export const signInPhoneNumberAtom = signInRuntime.fn(
  F.flow(SignInService.SignInPhoneNumber, withToast(signInToastOptions))
);
export const useSignInPhoneNumber = () => {
  const [signInPhoneNumberResult, signInPhoneNumber] = useAtom(signInPhoneNumberAtom);
  return {
    signInPhoneNumberResult,
    signInPhoneNumber,
  };
};

export const signInUsernameAtom = signInRuntime.fn(F.flow(SignInService.SignInUsername, withToast(signInToastOptions)));
export const useSignInUsername = () => {
  const [signInUsernameResult, signInUsername] = useAtom(signInUsernameAtom);
  return {
    signInUsernameResult,
    signInUsername,
  };
};

export const signInOneTapAtom = signInRuntime.fn(F.flow(SignInService.SignInOneTap, withToast(signInToastOptions)));
export const useSignInOneTap = () => {
  const [signInOneTapResult, signInOneTap] = useAtom(signInOneTapAtom);
  return {
    signInOneTapResult,
    signInOneTap,
  };
};

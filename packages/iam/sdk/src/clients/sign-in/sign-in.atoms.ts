"use client";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { SignInImplementations } from "./sign-in.implementations";

const signInToastOptions = {
  onWaiting: "Signing in",
  onSuccess: "Signed in successfully",
  onFailure: O.match({
    onNone: () => "Failed with unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
};

export const signInPasskeyAtom = iamAtomRuntime.fn(
  F.flow(SignInImplementations.SignInPasskey, withToast(signInToastOptions))
);
export const useSignInPasskey = () => {
  const [signInPasskeyResult, signInPasskey] = useAtom(signInPasskeyAtom);
  return {
    signInPasskeyResult,
    signInPasskey,
  };
};

export const signInSocialAtom = iamAtomRuntime.fn(
  F.flow(SignInImplementations.SignInSocial, withToast(signInToastOptions))
);
export const useSignInSocial = () => {
  const [signInSocialResult, signInSocial] = useAtom(signInSocialAtom);
  return {
    signInSocialResult,
    signInSocial,
  };
};

export const signInEmailAtom = iamAtomRuntime.fn(
  F.flow(SignInImplementations.SignInEmail, withToast(signInToastOptions))
);
export const useSignInEmail = () => {
  const [signInEmailResult, signInEmail] = useAtom(signInEmailAtom);
  return {
    signInEmailResult,
    signInEmail,
  };
};

export const signInPhoneNumberAtom = iamAtomRuntime.fn(
  F.flow(SignInImplementations.SignInPhoneNumber, withToast(signInToastOptions))
);
export const useSignInPhoneNumber = () => {
  const [signInPhoneNumberResult, signInPhoneNumber] = useAtom(signInPhoneNumberAtom);
  return {
    signInPhoneNumberResult,
    signInPhoneNumber,
  };
};

export const signInUsernameAtom = iamAtomRuntime.fn(
  F.flow(SignInImplementations.SignInUsername, withToast(signInToastOptions))
);
export const useSignInUsername = () => {
  const [signInUsernameResult, signInUsername] = useAtom(signInUsernameAtom);
  return {
    signInUsernameResult,
    signInUsername,
  };
};

export const signInOneTapAtom = iamAtomRuntime.fn(
  F.flow(SignInImplementations.SignInOneTap, withToast(signInToastOptions))
);
export const useSignInOneTap = () => {
  const [signInOneTapResult, signInOneTap] = useAtom(signInOneTapAtom);
  return {
    signInOneTapResult,
    signInOneTap,
  };
};

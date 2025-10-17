"use client";
import { SignInImplementations } from "@beep/iam-sdk";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const runtime = makeAtomRuntime(Layer.empty);
const signInToastOptions = {
  onWaiting: "Signing in",
  onSuccess: "Signed in successfully",
  onFailure: O.match({
    onNone: () => "Failed with unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
};

export const signInPasskeyAtom = runtime.fn(F.flow(SignInImplementations.SignInPasskey, withToast(signInToastOptions)));
export const useSignInPasskey = () => {
  const [signInPasskeyResult, signInPasskey] = useAtom(signInPasskeyAtom);
  return {
    signInPasskeyResult,
    signInPasskey,
  };
};

export const signInSocialAtom = runtime.fn(F.flow(SignInImplementations.SignInSocial, withToast(signInToastOptions)));
export const useSignInSocial = () => {
  const [signInSocialResult, signInSocial] = useAtom(signInSocialAtom);
  return {
    signInSocialResult,
    signInSocial,
  };
};

export const signInEmailAtom = runtime.fn(F.flow(SignInImplementations.SignInEmail, withToast(signInToastOptions)));
export const useSignInEmail = () => {
  const [signInEmailResult, signInEmail] = useAtom(signInEmailAtom);
  return {
    signInEmailResult,
    signInEmail,
  };
};

export const signInPhoneNumberAtom = runtime.fn(
  F.flow(SignInImplementations.SignInPhoneNumber, withToast(signInToastOptions))
);
export const useSignInPhoneNumber = () => {
  const [signInPhoneNumberResult, signInPhoneNumber] = useAtom(signInPhoneNumberAtom);
  return {
    signInPhoneNumberResult,
    signInPhoneNumber,
  };
};

export const signInUsernameAtom = runtime.fn(
  F.flow(SignInImplementations.SignInUsername, withToast(signInToastOptions))
);
export const useSignInUsername = () => {
  const [signInUsernameResult, signInUsername] = useAtom(signInUsernameAtom);
  return {
    signInUsernameResult,
    signInUsername,
  };
};

export const signInOneTapAtom = runtime.fn(F.flow(SignInImplementations.SignInOneTap, withToast(signInToastOptions)));
export const useSignInOneTap = () => {
  const [signInOneTapResult, signInOneTap] = useAtom(signInOneTapAtom);
  return {
    signInOneTapResult,
    signInOneTap,
  };
};

"use client";
import { atomPromise } from "@beep/iam-sdk/clients/_internal";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { SignInService } from "./sign-in.service";

const signInRuntime = makeAtomRuntime(SignInService.Live);

const signInToastOptions = {
  onWaiting: "Signing in",
  onSuccess: "Signed in successfully",
  onFailure: (e: Effect.Effect.Error<ReturnType<(typeof SignInService)["SignInPasskey"]>>) => e.message,
} as const;

export const signInPasskeyAtom = signInRuntime.fn(F.flow(SignInService.SignInPasskey, withToast(signInToastOptions)));
export const useSignInPasskey = () => {
  const signInPasskey = useAtomSet(signInPasskeyAtom);
  return {
    signInPasskey,
  };
};

export const signInSocialAtom = signInRuntime.fn(SignInService.SignInSocial);
export const useSignInSocial = () => {
  const signInSocial = useAtomSet(signInSocialAtom);
  return {
    signInSocial,
  };
};

export const signInEmailAtom = signInRuntime.fn(F.flow(SignInService.SignInEmail, withToast(signInToastOptions)));
export const useSignInEmail = () => {
  const signInEmail = useAtomSet(signInEmailAtom, atomPromise);
  return {
    signInEmail,
  };
};

export const signInPhoneNumberAtom = signInRuntime.fn(
  F.flow(SignInService.SignInPhoneNumber, withToast(signInToastOptions))
);
export const useSignInPhoneNumber = () => {
  const signInPhoneNumber = useAtomSet(signInPhoneNumberAtom);
  return {
    signInPhoneNumber,
  };
};

export const signInUsernameAtom = signInRuntime.fn(F.flow(SignInService.SignInUsername, withToast(signInToastOptions)));
export const useSignInUsername = () => {
  const signInUsername = useAtomSet(signInUsernameAtom);
  return {
    signInUsername,
  };
};

export const signInOneTapAtom = signInRuntime.fn(F.flow(SignInService.SignInOneTap, withToast(signInToastOptions)));
export const useSignInOneTap = () => {
  const signInOneTap = useAtomSet(signInOneTapAtom);
  return {
    signInOneTap,
  };
};

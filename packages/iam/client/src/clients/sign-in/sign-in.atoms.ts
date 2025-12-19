"use client";
import { atomPromise } from "@beep/iam-client/clients/_internal";
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
export const signInSocialAtom = signInRuntime.fn(SignInService.SignInSocial);
export const signInEmailAtom = signInRuntime.fn(F.flow(SignInService.SignInEmail, withToast(signInToastOptions)));
export const signInPhoneNumberAtom = signInRuntime.fn(
  F.flow(SignInService.SignInPhoneNumber, withToast(signInToastOptions))
);
export const signInUsernameAtom = signInRuntime.fn(F.flow(SignInService.SignInUsername, withToast(signInToastOptions)));

export const useSignIn = () => {
  const signInUsername = useAtomSet(signInUsernameAtom);
  const signInPhoneNumber = useAtomSet(signInPhoneNumberAtom);
  const signInEmail = useAtomSet(signInEmailAtom, atomPromise);
  const signInSocial = useAtomSet(signInSocialAtom);
  const signInPasskey = useAtomSet(signInPasskeyAtom);

  return {
    signInUsername,
    signInPhoneNumber,
    signInEmail,
    signInSocial,
    signInPasskey,
  };
};

"use client";
import { atomPromise } from "@beep/iam-sdk/clients/_internal";
import { getURL } from "@beep/iam-sdk/constants/AuthCallback/AuthCallback";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
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
export const signInOneTapAtom = signInRuntime.fn(F.flow(SignInService.SignInOneTap, withToast(signInToastOptions)));

export const useSignIn = () => {
  const signInOneTap = useAtomSet(signInOneTapAtom, atomPromise);
  const signInUsername = useAtomSet(signInUsernameAtom);
  const signInPhoneNumber = useAtomSet(signInPhoneNumberAtom);
  const signInEmail = useAtomSet(signInEmailAtom, atomPromise);
  const signInSocial = useAtomSet(signInSocialAtom);
  const signInPasskey = useAtomSet(signInPasskeyAtom);
  const router = useRouter();
  const params = useSearchParams();
  React.useEffect(() => {
    void signInOneTap()
      .then(() => {
        router.push(getURL(params));
      })
      .catch(() => undefined);
  }, [params, router, signInOneTap]);

  return {
    signInOneTap,
    signInUsername,
    signInPhoneNumber,
    signInEmail,
    signInSocial,
    signInPasskey,
  };
};

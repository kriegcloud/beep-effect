"use client";

import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { SignOutService } from "./sign-out.service";

const signOutRuntime = makeAtomRuntime(SignOutService.Live);

export const signOutAtom = signOutRuntime.fn(
  F.flow(
    SignOutService.SignOut,
    withToast({
      onWaiting: "Signing out",
      onSuccess: "Signed out successfully",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);
export const useSignOut = () => {
  const [signOutResult, signOut] = useAtom(signOutAtom);
  return {
    signOutResult,
    signOut,
  };
};

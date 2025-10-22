"use client";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { SignOutImplementations } from "./sign-out.implementations";

export const signOutAtom = iamAtomRuntime.fn(
  F.flow(
    SignOutImplementations.SignOut,
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

"use client";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";

import { PasskeyImplementations } from "./passkey.implementations";

const mutationToastOptions = {
  onWaiting: "Processing passkey request",
  onSuccess: "Passkey action completed successfully",
  onFailure: O.match({
    onNone: () => "Passkey action failed with an unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
} as const;

const addToastOptions = {
  onWaiting: "Registering passkey",
  onSuccess: "Passkey registered successfully",
  onFailure: O.match({
    onNone: () => "Failed to register passkey.",
    onSome: (e: { message: string }) => e.message,
  }),
} as const;

const listAtom = iamAtomRuntime.fn(PasskeyImplementations.PasskeyList);
const addAtom = iamAtomRuntime.fn(F.flow(PasskeyImplementations.PasskeyAdd, withToast(addToastOptions)));
const deleteAtom = iamAtomRuntime.fn(F.flow(PasskeyImplementations.PasskeyDelete, withToast(mutationToastOptions)));
const updateAtom = iamAtomRuntime.fn(F.flow(PasskeyImplementations.PasskeyUpdate, withToast(mutationToastOptions)));

export const usePasskeyList = () => {
  const [result, run] = useAtom(listAtom);
  return {
    passkeyListResult: result,
    listPasskeys: run,
  };
};

export const usePasskeyAdd = () => {
  const [result, run] = useAtom(addAtom);
  return {
    passkeyAddResult: result,
    addPasskey: run,
  };
};

export const usePasskeyDelete = () => {
  const [result, run] = useAtom(deleteAtom);
  return {
    passkeyDeleteResult: result,
    deletePasskey: run,
  };
};

export const usePasskeyUpdate = () => {
  const [result, run] = useAtom(updateAtom);
  return {
    passkeyUpdateResult: result,
    updatePasskey: run,
  };
};

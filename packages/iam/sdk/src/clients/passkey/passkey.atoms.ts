"use client";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { withToast } from "@beep/ui/common";
import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { PasskeyImplementations } from "./passkey.implementations";

const passkeysAtom = iamAtomRuntime.atom(PasskeyImplementations.PasskeyList).pipe(Atom.withReactivity(["passkeys"]));

const addPasskeyAtom = iamAtomRuntime.fn(
  F.flow(
    PasskeyImplementations.PasskeyAdd,
    withToast({
      onWaiting: "Registering passkey",
      onSuccess: "Passkey registered successfully",
      onFailure: O.match({
        onNone: () => "Failed to register passkey.",
        onSome: (e: { message: string }) => e.message,
      }),
    })
  ),
  { reactivityKeys: ["passkeys"] }
);

const deletePasskeyAtom = iamAtomRuntime.fn(
  F.flow(
    PasskeyImplementations.PasskeyDelete,
    withToast({
      onWaiting: "Deleting passkey",
      onSuccess: "Passkey deleted successfully",
      onFailure: O.match({
        onNone: () => "Failed to delete passkey.",
        onSome: (e: { message: string }) => e.message,
      }),
    })
  ),
  { reactivityKeys: ["passkeys"] }
);

const updatePasskeyAtom = iamAtomRuntime.fn(
  F.flow(
    PasskeyImplementations.PasskeyUpdate,
    withToast({
      onWaiting: "Updating passkey",
      onSuccess: "Passkey updated successfully",
      onFailure: O.match({
        onNone: () => "Failed to update passkey.",
        onSome: (e: { message: string }) => e.message,
      }),
    })
  ),
  { reactivityKeys: ["passkeys"] }
);

export const usePasskeyCRUD = () => {
  const passkeysResult = useAtomValue(passkeysAtom);
  const addPasskey = useAtomSet(addPasskeyAtom);
  const deletePasskey = useAtomSet(deletePasskeyAtom);
  const updatePasskey = useAtomSet(updatePasskeyAtom);

  return {
    passkeysResult,
    addPasskey,
    deletePasskey,
    updatePasskey,
  };
};

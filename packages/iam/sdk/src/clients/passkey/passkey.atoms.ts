"use client";
import {iamAtomRuntime} from "@beep/iam-sdk/clients/runtime";
import {withToast} from "@beep/ui/common";
import {useAtom, useAtomSet} from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Effect from "effect/Effect";
import {PasskeyImplementations} from "./passkey.implementations";

export const listPasskeyAtom = iamAtomRuntime.fn(PasskeyImplementations.PasskeyList);

const addAtom = iamAtomRuntime.fn(
  F.flow(
    PasskeyImplementations.PasskeyAdd,
    withToast({
      onWaiting: "Registering passkey",
      onSuccess: "Passkey registered successfully",
      onFailure: O.match({
        onNone: () => "Failed to register passkey.",
        onSome: (e: { message: string }) => e.message,
      }),
    }),
    Effect.asVoid
  )
);
const deleteAtom = iamAtomRuntime.fn(F.flow(PasskeyImplementations.PasskeyDelete, withToast({
  onWaiting: "deleting passkey...",
  onSuccess: "Passkey Deleted!",
  onFailure: O.match({
    onNone: () => "Passkey action failed with an unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
})));

const updateAtom = iamAtomRuntime.fn(F.flow(PasskeyImplementations.PasskeyUpdate, withToast({
  onWaiting: "Updating Passkey...",
  onSuccess: "Passkey updated!",
  onFailure: O.match({
    onNone: () => "Passkey action failed with an unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
})));

export const usePasskeyList = () => {
  const [passkeyListResult, listPasskeys] = useAtom(listPasskeyAtom);
  return {
    passkeyListResult,
    listPasskeys,
  };
};

export const usePasskeyAdd = () => {
  const addPasskey = useAtomSet(addAtom, {
    mode: "promise"
  });
  return {
    addPasskey,
  };
};

export const usePasskeyDelete = () => {
  const [passkeyDeleteResult, deletePasskey] = useAtom(deleteAtom, {mode: "promiseExit"});
  return {
    passkeyDeleteResult,
    deletePasskey,
  };
};

export const usePasskeyUpdate = () => {
  const [passkeyUpdateResult, updatePasskey] = useAtom(updateAtom);
  return {
    passkeyUpdateResult,
    updatePasskey,
  };
};

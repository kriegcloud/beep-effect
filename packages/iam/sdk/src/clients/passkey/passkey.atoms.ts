"use client";
import type {
  PasskeyAddPayload,
  PasskeyDeletePayload,
  PasskeyUpdatePayload,
  PasskeyView,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { PasskeyImplementations } from "@beep/iam-sdk/clients/passkey/passkey.implementations";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { withToast } from "@beep/ui/common";
import { Atom, Registry, Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const remoteAtom = iamAtomRuntime.atom(PasskeyImplementations.PasskeyList);

type Action = Data.TaggedEnum<{
  Update: { readonly passkey: PasskeyView.Type };
  Del: { readonly id: PasskeyView.Type["id"] };
  Add: { readonly passkey: PasskeyView.Type };
}>;

const Action = Data.taggedEnum<Action>();

export const passkeysAtom = Object.assign(
  Atom.writable(
    (get: Atom.Context) => get(remoteAtom),
    (ctx, action: Action) => {
      const result = ctx.get(passkeysAtom);
      if (!Result.isSuccess(result)) return;

      const update = Action.$match(action, {
        Del: ({ id }) => A.filter(result.value, (passkey) => passkey.id === id),
        Update: ({ passkey }) => {
          const existing = result.value.find((p) => p.id === passkey.id);
          if (existing) return A.map(result.value, (p) => (p.id === passkey.id ? passkey : p));
          return result.value;
        },
        Add: ({ passkey }) => A.prepend(result.value, passkey),
      });

      ctx.setSelf(Result.success(update));
    }
  ),
  {
    remote: remoteAtom,
  }
);

export const updatePasskeyAtom = iamAtomRuntime.fn(
  Effect.fnUntraced(
    function* (payload: PasskeyUpdatePayload.Type) {
      const registry = yield* Registry.AtomRegistry;
      const updateResult = yield* PasskeyImplementations.PasskeyUpdate(payload);
      registry.set(
        passkeysAtom,
        Action.Update({
          passkey: updateResult.passkey,
        })
      );
    },
    withToast({
      onWaiting: "Updating passkey",
      onSuccess: "Passkey updated successfully",
      onFailure: O.match({
        onNone: () => "Failed to update passkey.",
        onSome: (e: { message: string }) => e.message,
      }),
    })
  )
);

export const deletePasskeyAtom = iamAtomRuntime.fn(
  Effect.fnUntraced(
    function* (payload: PasskeyDeletePayload.Type) {
      const registry = yield* Registry.AtomRegistry;
      yield* PasskeyImplementations.PasskeyDelete(payload);
      registry.set(
        passkeysAtom,
        Action.Del({
          id: payload.id,
        })
      );
    },
    withToast({
      onWaiting: "Deleting passkey",
      onSuccess: "Passkey deleted successfully",
      onFailure: O.match({
        onNone: () => "Failed to delete passkey.",
        onSome: (e: { message: string }) => e.message,
      }),
    })
  )
);

export const addPasskeyAtom = iamAtomRuntime.fn(
  Effect.fnUntraced(
    function* (payload: PasskeyAddPayload.Type) {
      const registry = yield* Registry.AtomRegistry;
      yield* PasskeyImplementations.PasskeyAdd(payload);
      registry.set(
        passkeysAtom,
        Action.Add({
          passkey: {
            id: payload.id,
            name: payload.name,
          },
        })
      );
    },
    withToast({
      onWaiting: "Registering passkey",
      onSuccess: "Passkey registered successfully",
      onFailure: O.match({
        onNone: () => "Failed to register passkey.",
        onSome: (e: { message: string }) => e.message,
      }),
    })
  )
);

export const editingPasskeyAtom = Atom.make<PasskeyView.Type | undefined>(undefined);

export const usePasskeyCRUD = () => {
  const passkeysResult = useAtomValue(passkeysAtom);
  const addPasskey = useAtomSet(addPasskeyAtom, {
    mode: "promise" as const,
  });
  const deletePasskey = useAtomSet(deletePasskeyAtom);
  const updatePasskey = useAtomSet(updatePasskeyAtom, {
    mode: "promise" as const,
  });

  return {
    passkeysResult,
    addPasskey,
    deletePasskey,
    updatePasskey,
  };
};

import type { Contract } from "@beep/contract";
import type { PasskeyDTO } from "@beep/iam-client";
import { atomPromise, withReactivityKeys } from "@beep/iam-client/clients/_internal";
import type {
  PasskeyAddContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract,
} from "@beep/iam-client/clients/passkey/passkey.contracts";
import { PasskeyService } from "@beep/iam-client/clients/passkey/passkey.service";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { IamEntityIds } from "@beep/shared-domain";
import { withToast } from "@beep/ui/common";
import { Atom, Registry, Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";

const passkeyRuntime = makeAtomRuntime(PasskeyService.Live);
type ActionPayload = { readonly passkey: PasskeyDTO };

type Action = Data.TaggedEnum<{
  Update: ActionPayload;
  Remove: ActionPayload;
  Add: ActionPayload;
}>;

const Action = Data.taggedEnum<Action>();

const remoteAtom = passkeyRuntime.atom(PasskeyService.listUserPasskeys()).pipe(Atom.withReactivity(["passkeys"]));

export const passkeysAtom = Object.assign(
  Atom.writable(
    (get: Atom.Context) => get(remoteAtom),
    (ctx, action: Action) => {
      const result = ctx.get(passkeysAtom);
      if (!Result.isSuccess(result)) return;

      const update = Action.$match(action, {
        Remove: ({ passkey }) => A.filter(result.value, (p) => p.id === passkey.id),
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

export const updatePasskeyAtom = passkeyRuntime.fn(
  Effect.fnUntraced(
    function* (payload: typeof PasskeyUpdateContract.payloadSchema.Type) {
      const { update } = yield* PasskeyService;
      const registry = yield* Registry.AtomRegistry;

      yield* update(payload);

      registry.set(passkeysAtom, Action.Update(payload));
    },
    withToast({
      onWaiting: "Updating passkey",
      onSuccess: "Passkey updated successfully",
      onFailure: (e) => e.message,
    })
  ),
  withReactivityKeys("passkeys")
);

export const removePasskeyAtom = passkeyRuntime.fn(
  Effect.fn(
    function* (payload: typeof PasskeyRemoveContract.payloadSchema.Type) {
      const { remove } = yield* PasskeyService;
      const registry = yield* Registry.AtomRegistry;
      yield* remove(payload);

      registry.set(passkeysAtom, Action.Remove(payload));
    },
    withToast({
      onWaiting: "Deleting passkey",
      onSuccess: "Passkey deleted successfully",
      onFailure: (e) => e.message,
    })
  ),
  withReactivityKeys("passkeys")
);

export const addPasskeyAtom = passkeyRuntime.fn(
  (payload: typeof PasskeyAddContract.payloadSchema.Type) =>
    Effect.gen(function* () {
      const { add } = yield* PasskeyService;

      yield* add(payload);

      const registry = yield* Registry.AtomRegistry;

      registry.set(
        passkeysAtom,
        Action.Add({
          passkey: payload,
        })
      );
    }).pipe(
      withToast({
        onWaiting: "Adding passkey",
        onSuccess: "Passkey added successfully",
        onFailure: (e) => e.message,
      })
    ),
  withReactivityKeys("passkeys")
);

export const editingPasskeyAtom = Atom.make<PasskeyDTO | undefined>(undefined);

export const usePasskeyCRUD = () => {
  const passkeysResult = useAtomValue(passkeysAtom);
  const _addPasskey = useAtomSet(addPasskeyAtom, atomPromise);
  const deletePasskey = useAtomSet(removePasskeyAtom);
  const updatePasskey = useAtomSet(updatePasskeyAtom, atomPromise);

  const addPasskey = async (payload: Pick<Contract.Payload<typeof PasskeyAddContract>, "name">) => {
    await _addPasskey({
      ...payload,
      id: IamEntityIds.PasskeyId.create(),
    });
  };

  return {
    passkeysResult,
    addPasskey,
    deletePasskey,
    updatePasskey,
  };
};

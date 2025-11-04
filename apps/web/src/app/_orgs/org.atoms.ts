import type { OrganizationCreateContract, OrganizationDeleteContract, OrganizationUpdateContract } from "@beep/iam-sdk";
import { OrganizationImplementations, OrganizationListContract } from "@beep/iam-sdk";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common/with-toast";
import { Atom, Registry, Result } from "@effect-atom/atom-react";
import { Array as A, Data, Effect, Layer, Option as O } from "effect";

export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});

makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);

const atomRuntime = makeAtomRuntime(Layer.empty);

type Action = Data.TaggedEnum<{
  Update: typeof OrganizationUpdateContract.successSchema.Type;
  Create: typeof OrganizationCreateContract.successSchema.Type;
  Del: typeof OrganizationDeleteContract.successSchema.Type;
}>;

const Action = Data.taggedEnum<Action>();

export const remoteUserOrganizationsAtom = iamAtomRuntime.atom(OrganizationImplementations.OrganizationList).pipe(
  Atom.serializable({
    key: "userOrganizations",
    schema: Result.Schema({
      success: OrganizationListContract.successSchema,
      error: OrganizationListContract.failureSchema,
    }),
  }),
  Atom.withReactivity(["userOrganizations"])
);

const userOrganizationsAtom = Object.assign(
  Atom.writable(
    (get: Atom.Context) => get(remoteUserOrganizationsAtom),
    (ctx, action: Action) => {
      const result = ctx.get(userOrganizationsAtom);
      if (!Result.isSuccess(result)) return;

      const update = Action.$match(action, {
        Del: (payload) => A.filter(result.value, (org) => org.id === payload.id),
        Update: (payload) => {
          const existing = result.value.find((org) => org.id === payload.id);
          if (existing) return A.map(result.value, (org) => (org.id === payload.id ? payload : org));
          return result.value;
        },
        Create: (payload) => A.prepend(result.value, payload),
      } as const);

      ctx.setSelf(Result.success(update));
    }
  ),
  {
    remote: remoteUserOrganizationsAtom,
  } as const
);

export const updateUserOrganizationAtom = atomRuntime.fn(
  Effect.fnUntraced(
    function* (payload: typeof OrganizationUpdateContract.payloadSchema.Type) {
      const registry = yield* Registry.AtomRegistry;
      const updateResult = yield* OrganizationImplementations.OrganizationUpdate(payload);
      registry.set(userOrganizationsAtom, Action.Update(updateResult));
    },
    (effect, { data: { name } }) =>
      effect.pipe(
        withToast({
          onWaiting: `Updating ${name}`,
          onSuccess: `${name} updated successfully`,
          onFailure: O.match({
            onNone: () => `Failed to update ${name}`,
            onSome: (e: { message: string }) => e.message,
          }),
        })
      )
  ),
  {
    reactivityKeys: ["userOrganizations"],
  }
);

export const deleteUserOrganizationAtom = atomRuntime.fn(
  Effect.fnUntraced(
    function* (payload: typeof OrganizationDeleteContract.payloadSchema.Type) {
      const registry = yield* Registry.AtomRegistry;
      const deleteResult = yield* OrganizationImplementations.OrganizationDelete(payload);
      registry.set(userOrganizationsAtom, Action.Del(deleteResult));
    },
    (effect, { name }) =>
      effect.pipe(
        withToast({
          onWaiting: `Deleting ${name}`,
          onSuccess: `${name} deleted successfully`,
          onFailure: O.match({
            onNone: () => `Failed to delete ${name}`,
            onSome: (e: { message: string }) => e.message,
          }),
        })
      )
  ),
  {
    reactivityKeys: ["userOrganizations"],
  }
);

export const createUserOrganizationAtom = atomRuntime.fn(
  Effect.fnUntraced(
    function* (payload: typeof OrganizationCreateContract.payloadSchema.Type) {
      const registry = yield* Registry.AtomRegistry;
      const createResult = yield* OrganizationImplementations.OrganizationCreate(payload);
      registry.set(userOrganizationsAtom, Action.Create(createResult));
    },
    (effect, { name }) =>
      effect.pipe(
        withToast({
          onWaiting: `Creating ${name}...`,
          onSuccess: `${name} created successfully`,
          onFailure: O.match({
            onNone: () => `Failed to create ${name}`,
            onSome: (e: { message: string }) => e.message,
          }),
        })
      )
  ),
  {
    reactivityKeys: ["userOrganizations"],
  }
);

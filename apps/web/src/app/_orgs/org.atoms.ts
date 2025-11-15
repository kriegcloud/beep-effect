import {
  type OrganizationCreateContract,
  type OrganizationDeleteContract,
  OrganizationListContract,
  OrganizationService,
  type OrganizationUpdateContract,
} from "@beep/iam-sdk";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common/with-toast";
import { Atom, Registry, Result } from "@effect-atom/atom-react";
import { Array as A, Data, Effect, Option as O } from "effect";

const organizationRuntime = makeAtomRuntime(OrganizationService.Live);

type Action = Data.TaggedEnum<{
  Update: typeof OrganizationUpdateContract.successSchema.Type;
  Create: typeof OrganizationCreateContract.successSchema.Type;
  Del: typeof OrganizationDeleteContract.successSchema.Type;
}>;

const Action = Data.taggedEnum<Action>();

export const remoteUserOrganizationsAtom = organizationRuntime
  .atom(
    Effect.gen(function* () {
      const service = yield* OrganizationService;
      return yield* service.OrganizationList({});
    }).pipe(Effect.catchTag("UnknownError", (e) => Effect.die(e)))
  )
  .pipe(
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

export const updateUserOrganizationAtom = organizationRuntime.fn(
  Effect.fnUntraced(
    function* (payload: typeof OrganizationUpdateContract.payloadSchema.Type) {
      const service = yield* OrganizationService;
      const registry = yield* Registry.AtomRegistry;
      const updateResult = yield* service.OrganizationUpdate(payload);
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

export const deleteUserOrganizationAtom = organizationRuntime.fn(
  Effect.fnUntraced(
    function* (payload: typeof OrganizationDeleteContract.payloadSchema.Type) {
      const service = yield* OrganizationService;
      const registry = yield* Registry.AtomRegistry;
      const deleteResult = yield* service.OrganizationDelete(payload);
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

export const createUserOrganizationAtom = organizationRuntime.fn(
  Effect.fnUntraced(
    function* (payload: typeof OrganizationCreateContract.payloadSchema.Type) {
      const service = yield* OrganizationService;
      const registry = yield* Registry.AtomRegistry;
      const createResult = yield* service.OrganizationCreate(payload);
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

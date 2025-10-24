import { Atom, Result } from "@effect-atom/atom-react";
import * as Data from "effect/Data";
import { listPasskeyAtom } from "./passkey.atoms";
import type { PasskeyDeletePayload } from "./passkey.contracts";
// import * as A from "effect/Array";
export type PasskeyAction = Data.TaggedEnum<{
  // Add: { readonly payload: PasskeyAddPayload.Type }
  // Update: { readonly payload: PasskeyUpdatePayload.Type }
  Del: { readonly payload: PasskeyDeletePayload.Type };
}>;
const PasskeyAction = Data.taggedEnum<PasskeyAction>();

export const passkeyAtom = Object.assign(
  Atom.writable(
    (get: Atom.Context) => get(listPasskeyAtom),
    (ctx, action: PasskeyAction) => {
      const result = ctx.get(listPasskeyAtom);
      if (!Result.isSuccess(result)) return;

      const update = PasskeyAction.$match(action, {
        // Add: ({payload}) => {
        //   const existing = result.value.find((s) => s.name === payload.name);
        //   if (existing) return result.value.map((p) => (p.name === payload.name ? payload : p))
        //   return A.prepend(result.value, payload)
        // },
        Del: ({ payload }) => result.value.filter((p) => p.id !== payload.id),
      });

      ctx.setSelf(Result.success(update));
    }
  ),
  {
    remote: listPasskeyAtom,
  }
);

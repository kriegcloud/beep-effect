import { $WebId } from "@beep/identity/packages";
import { useAtomValue } from "@effect/atom-react";
import { Effect, Equal as Eq, Hash, Layer, Scope, ServiceMap } from "effect";
import * as P from "effect/Predicate";
import { Atom, type AtomRegistry } from "effect/unstable/reactivity";

const $I = $WebId.create("app/runtime");

const VMKeyTypeId: unique symbol = Symbol.for($I`VMKey`);
type VMKeyTypeId = typeof VMKeyTypeId;

interface VmKey<Id, Value, E = never> extends Eq.Equal {
  readonly [VMKeyTypeId]: VMKeyTypeId;
  readonly tag: ServiceMap.Service<ServiceMap.Service.Identifier<Id>, Value>;
  readonly layer: Layer.Layer<Id, E, Scope.Scope | AtomRegistry.AtomRegistry>;
}
const isVmKey = (u: unknown): u is VmKey<unknown, unknown, unknown> => P.hasProperty(u, VMKeyTypeId);
const VmKeyProto: Eq.Equal = {
  [Hash.symbol](this: VmKey<unknown, unknown, unknown>) {
    console.log(this.tag.key);
    return Hash.string(this.tag.key);
  },
  [Eq.symbol](this: VmKey<unknown, unknown, unknown>, that: unknown) {
    return isVmKey(that) && this.tag.key === that.tag.key;
  },
};

const makeVmKey = <Id, Value, E>(
  tag: ServiceMap.Service<ServiceMap.Service.Identifier<Id>, Value>,
  layer: Layer.Layer<Id, E, Scope.Scope | AtomRegistry.AtomRegistry>
): VmKey<Id, Value, E> =>
  ({
    ...VmKeyProto,
    [VMKeyTypeId]: VMKeyTypeId,
    tag,
    layer,
  }) as never;

// --- vmAtom: family that lazily builds layers ---
const memoMap = Layer.makeMemoMap.pipe(Effect.runSync);
const vmAtom = Atom.family(<Id, Value, E>(key: VmKey<Id, Value, E>) =>
  Atom.make(
    Effect.gen(function* () {
      const scope = yield* Scope.Scope;
      const ctx = yield* Layer.buildWithMemoMap(key.layer, memoMap, scope);
      return ServiceMap.getUnsafe(ctx, key.tag);
    })
  )
);

export const useVM = <Id, Value, E>(
  tag: ServiceMap.Service<ServiceMap.Service.Identifier<Id>, Value>,
  layer: Layer.Layer<Id, E, Scope.Scope | AtomRegistry.AtomRegistry>
) => {
  const key = makeVmKey(tag, layer);
  return useAtomValue(vmAtom(key));
};

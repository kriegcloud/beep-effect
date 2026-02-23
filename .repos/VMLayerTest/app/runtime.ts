import { Context, Effect, Hash, Equal, Layer, Scope, Predicate, pipe } from "effect";
import * as Atom from "@effect-atom/atom/Atom";
import * as Result from "@effect-atom/atom/Result";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import { useAtomValue } from "@effect-atom/atom-react";

// --- VmKey: hashable key for Atom.family caching ---
const VMKeyTypeId: unique symbol = Symbol.for("VMKey")
type VMKeyTypeId = typeof VMKeyTypeId

interface VmKey<Id, Value, E = never> extends Equal.Equal {
  readonly [VMKeyTypeId]: VMKeyTypeId
  readonly tag: Context.Tag<Id, Value>;
  readonly layer: Layer.Layer<Id, E, Scope.Scope | AtomRegistry>;
}

const VmKeyProto: Equal.Equal = {
  [Hash.symbol](this: VmKey<unknown, unknown, unknown>) {
    console.log(this.tag.key)
    return Hash.string(this.tag.key);
  },
  [Equal.symbol](this: VmKey<unknown, unknown, unknown>, that: unknown) {
    return isVmKey(that) && this.tag.key === that.tag.key;
  },
};

const isVmKey = (u: unknown): u is VmKey<unknown, unknown, unknown> =>
  Predicate.hasProperty(u, VMKeyTypeId)

const makeVmKey = <Id, Value, E>(
  tag: Context.Tag<Id, Value>,
  layer: Layer.Layer<Id, E, Scope.Scope | AtomRegistry>
): VmKey<Id, Value, E> =>
  Object.assign({
    [VMKeyTypeId]: VMKeyTypeId,
    tag,
    layer,
  }, VmKeyProto) as never;

// --- vmAtom: family that lazily builds layers ---
const memoMap = Layer.makeMemoMap.pipe(Effect.runSync)
const vmAtom = Atom.family(<Id, Value, E>(key: VmKey<Id, Value, E>) =>
  Atom.make(
    Effect.gen(function* () {
      const scope = yield* Scope.Scope
      const ctx = yield* Layer.buildWithMemoMap(key.layer, memoMap, scope)
      return Context.get(ctx, key.tag)
    })
  )
);

// --- useVM: hook to get a VM from tag + layer ---

export const useVM = <Id, Value, E>(
  tag: Context.Tag<Id, Value>,
  layer: Layer.Layer<Id, E, Scope.Scope | AtomRegistry>
): Result.Result<Value, E> => {
  const key = makeVmKey(tag, layer);
  return useAtomValue(vmAtom(key));
};

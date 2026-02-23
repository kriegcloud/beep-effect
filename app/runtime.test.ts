import { describe, it, expect } from "vitest";
import { Context, Effect, Hash, Equal, Layer, Scope, Predicate } from "effect";
import * as Atom from "@effect-atom/atom/Atom";
import * as Registry from "@effect-atom/atom/Registry";
import { AtomRegistry } from "@effect-atom/atom/Registry";

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

// Test tag
interface TestService {
  readonly value: number;
}
const TestService = Context.GenericTag<TestService>("TestService");

describe("VmKey memoization", () => {
  it("should have equal hash for same tag", () => {
    const layer1 = Layer.succeed(TestService, { value: 1 });
    const layer2 = Layer.succeed(TestService, { value: 2 });

    const key1 = makeVmKey(TestService, layer1);
    const key2 = makeVmKey(TestService, layer2);

    const hash1 = Hash.hash(key1);
    const hash2 = Hash.hash(key2);

    console.log("Hash 1:", hash1);
    console.log("Hash 2:", hash2);
    console.log("Equal:", Equal.equals(key1, key2));

    expect(hash1).toBe(hash2);
    expect(Equal.equals(key1, key2)).toBe(true);
  });

  it("should memoize with Atom.family", async () => {
    let buildCount = 0;

    const vmAtom = Atom.family(<Id, Value, E>(key: VmKey<Id, Value, E>) => {
      buildCount++;
      console.log("Building atom for key:", key.tag.key, "build count:", buildCount);
      return Atom.make(
        key.tag.pipe(Effect.provide(key.layer), Effect.tap(() => Effect.log("Layer built for:", key.tag.key)))
      );
    });

    const layer1 = Layer.succeed(TestService, { value: 1 });
    const layer2 = Layer.succeed(TestService, { value: 2 });

    const key1 = makeVmKey(TestService, layer1);
    const key2 = makeVmKey(TestService, layer2);

    const program = Effect.gen(function* () {
      const registry = yield* AtomRegistry;

      console.log("Getting atom with key1...");
      const atom1 = vmAtom(key1);
      const value1 = registry.get(atom1);
      console.log("value1:", value1);

      console.log("Getting atom with key2 (should be cached)...");
      const atom2 = vmAtom(key2);
      const value2 = registry.get(atom2);
      console.log("value2:", value2);

      console.log("atom1 === atom2:", atom1 === atom2);
      console.log("Final build count:", buildCount);

      return { atom1, atom2, value1, value2 };
    });

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(Registry.layer),
        Effect.scoped
      )
    );

    expect(buildCount).toBe(1); // Should only build once!
    expect(result.atom1).toBe(result.atom2);
  });

  it("VmKey implements Hash.symbol correctly", () => {
    const layer = Layer.succeed(TestService, { value: 1 });
    const key = makeVmKey(TestService, layer);

    // Check that Hash.symbol is actually on the object
    console.log("Has Hash.symbol:", Hash.symbol in key);
    console.log("Hash.symbol value:", (key as any)[Hash.symbol]);

    // Call it directly
    const hashFn = (key as any)[Hash.symbol];
    if (typeof hashFn === "function") {
      console.log("Direct hash call:", hashFn.call(key));
    }

    expect(Hash.symbol in key).toBe(true);
  });
});

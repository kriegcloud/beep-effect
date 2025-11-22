import { afterEach, it } from "@beep/testkit";
import * as KeyValueStore from "@effect/platform/KeyValueStore";
import { assertNone, assertSome, strictEqual } from "@effect/vitest/utils";
import { Effect, type Layer } from "effect";

export const testLayer = <E>(layer: Layer.Layer<KeyValueStore.KeyValueStore, E>) => {
  const run = <E, A>(effect: Effect.Effect<A, E, KeyValueStore.KeyValueStore>) =>
    Effect.runPromise(Effect.provide(effect, layer));

  afterEach(() =>
    run(
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;
        yield* kv.clear;
      })
    )
  );

  it("set", () =>
    run(
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;
        yield* kv.set("/foo/bar", "bar");

        const value = yield* kv.get("/foo/bar");
        const length = yield* kv.size;

        assertSome(value, "bar");
        strictEqual(length, 1);
      })
    ));

  it("get/ missing", () =>
    run(
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;
        yield* kv.clear;
        const value = yield* kv.get("foo");

        assertNone(value);
      })
    ));

  it("remove", () =>
    run(
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;
        yield* kv.set("foo", "bar");
        yield* kv.remove("foo");

        const value = yield* kv.get("foo");
        const length = yield* kv.size;

        assertNone(value);
        strictEqual(length, 0);
      })
    ));

  it("clear", () =>
    run(
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;
        yield* kv.set("foo", "bar");
        yield* kv.clear;

        const value = yield* kv.get("foo");
        const length = yield* kv.size;

        assertNone(value);
        strictEqual(length, 0);
      })
    ));

  it("modify", () =>
    run(
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;
        yield* kv.set("foo", "bar");

        const value = yield* kv.modify("foo", (v) => v + "bar");
        const length = yield* kv.size;

        assertSome(value, "barbar");
        strictEqual(length, 1);
      })
    ));

  it("modify - none", () =>
    run(
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;

        const value = yield* kv.modify("foo", (v) => v + "bar");
        const length = yield* kv.size;

        assertNone(value);
        strictEqual(length, 0);
      })
    ));
};

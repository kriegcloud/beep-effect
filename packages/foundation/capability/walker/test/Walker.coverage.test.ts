import { Walker } from "@beep/walker/Walker";
import { assert, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";

it.effect("the runtime constructor creates an empty Walker instance with static traversal operations", () =>
  Effect.sync(() => {
    const instance: unknown = Reflect.construct(Walker, []);
    assertTrue(instance instanceof Walker);
    assert.deepStrictEqual(instance instanceof Walker ? Reflect.ownKeys(instance) : ["not a Walker"], []);
    assert.strictEqual(typeof Walker.ascend, "function");
    assert.strictEqual(typeof Walker.findRoot, "function");
  })
);

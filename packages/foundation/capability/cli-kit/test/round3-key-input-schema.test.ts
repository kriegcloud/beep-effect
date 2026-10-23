import { KeyInput, TestTerminal } from "@beep/cli-kit/TestTerminal";
import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, describe, it } from "@effect/vitest";
import { assertExitSuccess, assertFalse } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Queue from "effect/Queue";
import * as S from "effect/Schema";
import * as Terminal from "effect/Terminal";

const decode = S.decodeUnknownExit(KeyInput);
const encode = S.encodeUnknownExit(KeyInput);

describe("KeyInput schema", () => {
  it("decodes arbitrary key names with no modifiers", () => {
    assert.deepStrictEqual<unknown>(decode({ name: "not-a-known-key" }), Exit.succeed({ name: "not-a-known-key" }));
    assert.deepStrictEqual<unknown>(decode({ name: "" }), Exit.succeed({ name: "" }));
  });

  it("keeps every modifier when present", () => {
    const key = { name: "c", ctrl: true, meta: false, shift: true };
    assert.deepStrictEqual<unknown>(decode(key), Exit.succeed(key));
    assert.deepStrictEqual(encode(key), Exit.succeed(key));
  });

  it("accepts and preserves explicit undefined modifiers", () => {
    const key = { name: "enter", ctrl: undefined, meta: undefined, shift: undefined };
    const decoded = decode(key);
    assertExitSuccess(decoded, KeyInput.make(key));
    assert.isTrue("ctrl" in decoded.value);
    assert.isTrue(S.is(KeyInput)(key));
  });

  it("rejects a missing name and non-boolean modifiers", () => {
    for (const input of [{}, { name: 1 }, { name: "a", ctrl: "yes" }, { name: "a", shift: null }]) {
      assertFalse(S.is(KeyInput)(input));
    }
  });

  it.effect("queues decoded keys with undefined modifiers read as not held", () =>
    Effect.gen(function* () {
      const terminal = yield* TestTerminal.make();
      const key = yield* S.decodeEffect(KeyInput)({ name: "x", ctrl: undefined, meta: true });
      yield* terminal.input([key]);
      const queue = yield* Effect.scopedWith((scope) =>
        Effect.flatMap(Layer.buildWithScope(terminal.layer, scope), (context) =>
          Effect.provideContext(
            Effect.gen(function* () {
              const service = yield* Terminal.Terminal;
              return yield* service.readInput;
            }),
            context
          )
        )
      );
      const first = yield* Queue.take(queue);
      assert.deepStrictEqual(first.key, { name: "x", ctrl: false, meta: true, shift: false });
    })
  );
});

it.effect.prop(
  "generated KeyInput values survive codec round trips",
  [Arbitrary.schema(KeyInput)],
  ([value]) =>
    Effect.gen(function* () {
      const encoded = yield* S.encodeEffect(KeyInput)(value);
      const decoded = yield* S.decodeEffect(KeyInput)(encoded);
      assert.deepStrictEqual(decoded, value);
    }),
  { arbitrary: fcRuns(100) }
);

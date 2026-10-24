import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { UnstubbedMemberError, unstubbed } from "@beep/utils/TestDouble";
import { assert, describe, it } from "@effect/vitest";
import { assertExitFailure } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

describe("TestDouble", () => {
  it.effect.prop(
    "UnstubbedMemberError decodes its encoded tag and message",
    [Arbitrary.schema(UnstubbedMemberError)],
    ([value]) =>
      Effect.gen(function* () {
        const encoded = yield* S.encodeEffect(UnstubbedMemberError)(value);
        const decoded = yield* S.decodeEffect(UnstubbedMemberError)(encoded);
        assert.strictEqual(decoded._tag, value._tag);
        assert.strictEqual(decoded.message, value.message);
      }),
    { arbitrary: fcRuns(100) }
  );

  it.effect("an unstubbed member dies naming the double, the member and its override", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(unstubbed("Cache")("save"));
      const expected = Cause.die(
        UnstubbedMemberError.make({
          message: "Cache: save() was called but not stubbed — pass a `save` override.",
        })
      );
      assertExitFailure(exit, expected);
    })
  );
});

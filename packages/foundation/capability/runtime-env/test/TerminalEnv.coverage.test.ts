import { StreamEnv } from "@beep/runtime-env/TerminalEnv";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("StreamEnv finite column domain", () => {
  it.effect("round-trips finite columns through its codec and rejects NaN and both infinities", () =>
    Effect.gen(function* () {
      const value = StreamEnv.make({ isTerminal: true, color: "none", hyperlinks: false, columns: O.some(120) });
      const decoded = yield* S.decodeEffect(StreamEnv)(yield* S.encodeEffect(StreamEnv)(value));
      assert.deepStrictEqual(decoded, value);
      for (const columns of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        assert.isFalse(
          S.is(StreamEnv)({ isTerminal: true, color: "none", hyperlinks: false, columns: O.some(columns) })
        );
      }
    })
  );
});

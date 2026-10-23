import { displayWidth, graphemes, stripAnsi } from "@beep/cli-kit/internal/displayWidth";
import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const runs = { arbitrary: fcRuns(100) };
it.effect.prop(
  "grapheme parsing reconstructs input and survives stringify/reparse",
  [Arbitrary.schema(S.String)],
  ([text]) =>
    Effect.sync(() => {
      const parsed = graphemes(text);
      assert.strictEqual(A.join(parsed, ""), text);
      assert.deepStrictEqual(graphemes(A.join(parsed, "")), parsed);
      const visible = stripAnsi(text);
      assert.strictEqual(
        displayWidth(visible),
        A.reduce(graphemes(visible), 0, (sum, segment) => sum + displayWidth(segment))
      );
    }),
  runs
);
it.effect.prop(
  "stripping is idempotent and ANSI rendering preserves visible text and width",
  [Arbitrary.schema(S.String)],
  ([input]) =>
    Effect.sync(() => {
      const text = stripAnsi(input);
      assert.strictEqual(stripAnsi(text), text);
      const painted = `\x1b[31m${text}\x1b[39m`;
      assert.strictEqual(stripAnsi(painted), text);
      assert.strictEqual(displayWidth(painted), displayWidth(text));
    }),
  runs
);

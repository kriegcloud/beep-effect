import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { balanced, range } from "@beep/glob/internal/balancedMatch";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const runs = { arbitrary: fcRuns(100) };
const text = Arbitrary.schema(S.Literals(["a", "b", " ", "é", "{nested}"])).pipe(
  Arbitrary.flatMap((atom) => Arbitrary.schema(S.Int).pipe(Arbitrary.map((n) => Str.repeat(Math.abs(n % 10))(atom))))
);
describe("balanced parser property floor", () => {
  it.effect.prop(
    "reconstruction preserves parse fidelity and is idempotent",
    [text, text, text],
    ([pre, body, post]) =>
      Effect.sync(() => {
        const input = `${pre}{${body}}${post}`;
        const parsed = balanced("{", "}", input);
        assert.notStrictEqual(parsed, false);
        if (parsed === false) return;
        const rendered = `${parsed.pre}{${parsed.body}}${parsed.post}`;
        assert.strictEqual(rendered, input);
        assert.deepStrictEqual(balanced("{", "}", rendered), parsed);
        assert.deepStrictEqual(range("{", "}", rendered), [parsed.start, parsed.end]);
        const reparsed = balanced("{", "}", rendered);
        if (reparsed === false) return;
        assert.strictEqual(`${reparsed.pre}{${reparsed.body}}${reparsed.post}`, rendered);
      }),
    runs
  );
});

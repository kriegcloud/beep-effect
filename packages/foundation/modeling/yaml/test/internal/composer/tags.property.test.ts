import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { composeFlowMap, composeFlowSeq } from "@beep/yaml/internal/composer/flow";
import { createState } from "@beep/yaml/internal/composer/state";
import { parseDirective, resolveTagHandle } from "@beep/yaml/internal/composer/tags";
import { RawDirective } from "@beep/yaml/internal/raw-document";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const runs = { arbitrary: fcRuns(100) };
const word = S.Literals(["A", "B", "C", "0", "1"]).pipe(
  S.Array,
  Arbitrary.schema,
  Arbitrary.map((value) => `D${A.join(value, "")}`)
);
describe("tag parser properties", () => {
  it.effect.prop(
    "directive canonical rendering is idempotent and preserves parsed names and parameters",
    [Arbitrary.schema(S.String)],
    ([source]) =>
      Effect.sync(() => {
        const input = `%${source}`;
        const parsed = O.getOrNull(parseDirective(input));
        if (parsed === null) {
          assert.strictEqual(O.getOrNull(parseDirective(input.trim())), null);
        } else {
          const canonical = `%${A.join([parsed.name, ...parsed.parameters], " ")}`;
          const reparsed = O.getOrNull(parseDirective(canonical));
          assert.deepStrictEqual(reparsed, parsed);
          if (reparsed !== null)
            assert.strictEqual(`%${A.join([reparsed.name, ...reparsed.parameters], " ")}`, canonical);
        }
      }),
    runs
  );
  it.effect.prop(
    "directive parsing retains parameters but discards only the trailing comment",
    [
      word,
      S.Literals(["alpha", "beta", "1.2", "!app!", "urn:app"]).pipe(S.Array, Arbitrary.schema),
      Arbitrary.schema(S.String),
    ],
    ([name, parameters, comment]) =>
      Effect.sync(() => {
        const text = `%${name} ${A.join(parameters, "\t")} # ${comment.replaceAll("\n", " ")}`;
        assert.deepStrictEqual(O.getOrNull(parseDirective(text)), RawDirective.make({ name, parameters }));
      }),
    runs
  );
  it.effect.prop(
    "percent-encoded suffixes resolve faithfully and resolved URIs are idempotent",
    [Arbitrary.schema(S.String).pipe(Arbitrary.filter((value) => value.isWellFormed()))],
    ([suffix]) =>
      Effect.sync(() => {
        const state = createState("", { composeFlowMap, composeFlowSeq });
        MutableHashMap.set(state.tagMap, "!app!", "urn:app:");
        const resolved = resolveTagHandle(`!app!${encodeURIComponent(suffix)}`, state);
        assert.strictEqual(resolved, `urn:app:${suffix}`);
        assert.strictEqual(resolveTagHandle(resolved, state), resolved);
        assert.strictEqual(resolveTagHandle(`!<${resolved}>`, state), resolved);
        assert.deepStrictEqual(state.errors, []);
      }),
    runs
  );
});

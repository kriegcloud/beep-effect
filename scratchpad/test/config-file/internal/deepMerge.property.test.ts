import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { canMerge, deepMerge, isPlainObject } from "../../../effected/config-file/internal/deepMerge.ts";

const runs = { arbitrary: fcRuns(100) };
const Fields = S.Struct({ constructor: S.String, prototype: S.String, payload: S.Json });
// Recursively merged records filter __proto__; arbitrary JSON stays atomic in arrays.
const Document = S.Struct({
  section: S.Struct({
    constructor: S.String,
    prototype: S.String,
    payload: S.Struct({ text: S.String, values: S.Array(S.Json) }),
  }),
  items: S.Array(S.Json),
});

describe("deepMerge structural properties", () => {
  it.effect("self-merge filters a nested own __proto__ key while preserving ordinary fields and input", () =>
    Effect.gen(function* () {
      const payload: Record<string, unknown> = { ["__proto__"]: [], retained: "safe" };
      const value = { section: { constructor: "", prototype: "", payload }, items: [] };
      const once = deepMerge(value, value);
      assert.deepStrictEqual(once, {
        section: { constructor: "", prototype: "", payload: { retained: "safe" } },
        items: [],
      });
      assert.strictEqual(Object.getPrototypeOf(once.section.payload), Object.prototype);
      assert.isFalse(R.has(once.section.payload, "__proto__"));
      assert.isTrue(R.has(payload, "__proto__"));
      assert.deepStrictEqual(payload["__proto__"], []);
      assert.deepStrictEqual(deepMerge(once, value), once);
      assert.strictEqual(once.items, value.items);
    }));

  it.effect.prop("self-merge is idempotent and preserves own constructor/prototype fields", [Arbitrary.schema(Document)], ([value]) =>
    Effect.gen(function* () {
      assert.isTrue(isPlainObject(value));
      assert.isTrue(canMerge(value, value));
      const once = deepMerge(value, value);
      assert.deepStrictEqual(once, value);
      assert.deepStrictEqual(deepMerge(once, value), once);
      assert.strictEqual(once.items, value.items);
    }), runs);

  it.effect.prop("nested own fields keep target priority while absent fields are filled, without mutating either input", [Arbitrary.schema(Fields), Arbitrary.schema(Fields)], ([higher, lower]) =>
    Effect.gen(function* () {
      const target: Record<string, unknown> = { section: { constructor: higher.constructor, payload: [higher.payload] } };
      const source = { section: { constructor: lower.constructor, prototype: lower.prototype, payload: [lower.payload] }, fallback: lower.payload };
      const actual = deepMerge(source)(target);
      assert.deepStrictEqual(actual, {
        section: { constructor: higher.constructor, prototype: lower.prototype, payload: [higher.payload] },
        fallback: lower.payload,
      });
      assert.deepStrictEqual(target, { section: { constructor: higher.constructor, payload: [higher.payload] } });
      assert.deepStrictEqual(source, { section: { constructor: lower.constructor, prototype: lower.prototype, payload: [lower.payload] }, fallback: lower.payload });
    }), runs);
});

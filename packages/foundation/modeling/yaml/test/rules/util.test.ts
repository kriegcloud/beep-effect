import { nonNegativeIntegerOption, positiveIntegerOption, ScalarRole } from "@beep/yaml/internal/rules/util";
import { assert, describe, it } from "@effect/vitest";
import * as S from "effect/Schema";

type IntegerOptionSchema = typeof nonNegativeIntegerOption | typeof positiveIntegerOption;
type IntegerOptionCheck = NonNullable<IntegerOptionSchema["ast"]["checks"]>[number];

const assertIdentityAnnotations = (annotations: IntegerOptionCheck["annotations"] | undefined): void => {
  assert.isString(annotations?.identifier);
  assert.isString(annotations?.title);
  assert.isString(annotations?.description);
};

const assertAbortingFilter = (check: IntegerOptionCheck | undefined): void => {
  assert.strictEqual(check?._tag, "Filter");
  if (check?._tag === "Filter") assert.isTrue(check.aborted);
};

describe("shared rule schemas", () => {
  it("numeric schemas and reusable integer checks carry identity metadata and abort", () => {
    for (const schema of [nonNegativeIntegerOption, positiveIntegerOption]) {
      const check = schema.ast.checks?.[0];
      for (const annotations of [schema.ast.annotations, check?.annotations]) assertIdentityAnnotations(annotations);
      assertAbortingFilter(check);
    }
  });
  it("integer constraints retain acceptance beyond the safe-integer range", () => {
    for (const schema of [nonNegativeIntegerOption, positiveIntegerOption]) {
      const accepts = S.is(schema);
      assert.isTrue(accepts(2 ** 60));
      assert.isTrue(accepts(1));
      assert.isFalse(accepts(-1));
      assert.isFalse(accepts(1.25));
      assert.isFalse(accepts(Number.NaN));
      assert.isFalse(accepts(Number.POSITIVE_INFINITY));
    }
    assert.isTrue(S.is(nonNegativeIntegerOption)(0));
    assert.isFalse(S.is(positiveIntegerOption)(0));
  });
  it("ScalarRole keeps the walker literals and LiteralKit helpers", () => {
    assert.deepStrictEqual(ScalarRole.literals, ["key", "value", "item", "root"]);
    assert.strictEqual(ScalarRole.Enum.key, "key");
    assert.isTrue(ScalarRole.is.root("root"));
    assert.isFalse(S.is(ScalarRole)("other"));
    assert.isString(ScalarRole.ast.annotations?.identifier);
  });
});

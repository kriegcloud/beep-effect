import { computeEdits, RawEdit } from "@beep/yaml/internal/diff";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("diff boundary contracts", () => {
  it.effect("distinguishes identity, insertion, deletion and replacement", () =>
    Effect.sync(() => {
      assert.deepStrictEqual(computeEdits("", ""), []);
      assert.deepStrictEqual(computeEdits("abc", "abc"), []);
      assert.deepStrictEqual(computeEdits("", "abc"), [RawEdit.make({ offset: 0, length: 0, content: "abc" })]);
      assert.deepStrictEqual(computeEdits("abc", ""), [RawEdit.make({ offset: 0, length: 3, content: "" })]);
      assert.deepStrictEqual(computeEdits("abc", "abXc"), [RawEdit.make({ offset: 2, length: 0, content: "X" })]);
      assert.deepStrictEqual(computeEdits("abXc", "abc"), [RawEdit.make({ offset: 2, length: 1, content: "" })]);
      assert.deepStrictEqual(computeEdits("abc", "XYZ"), [RawEdit.make({ offset: 0, length: 3, content: "XYZ" })]);
      assert.deepStrictEqual(computeEdits("abc", "abd"), [RawEdit.make({ offset: 2, length: 1, content: "d" })]);
    })
  );
  it.effect("splits changed lines and retains equal interior lines and CRLF offsets", () =>
    Effect.sync(() => {
      assert.deepStrictEqual(computeEdits("a\nkeep\nb", "x\nkeep\ny"), [
        RawEdit.make({ offset: 0, length: 1, content: "x" }),
        RawEdit.make({ offset: 7, length: 1, content: "y" }),
      ]);
      assert.deepStrictEqual(computeEdits("a\r\nkeep\r\nb", "x\r\nkeep\r\ny"), [
        RawEdit.make({ offset: 0, length: 2, content: "x\r" }),
        RawEdit.make({ offset: 9, length: 1, content: "y" }),
      ]);
      assert.deepStrictEqual(computeEdits("a\nb", "xyz"), [RawEdit.make({ offset: 0, length: 3, content: "xyz" })]);
    })
  );
});

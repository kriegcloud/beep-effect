import { hashIdAttrs } from "@beep/rete/network/utils";
import { describe, expect, it } from "@effect/vitest";

describe("hashing idAttrs...", () => {
  it("different arrays of idAttrs hash uniquely", () => {
    const arr1 = [
      [1, "Color"],
      [8, "LeftOf"],
      [0, "Color"],
      [8, "RightOf"],
      [4, "Height"],
    ];

    const arr2 = [
      [1, "Color"],
      [8, "LeftOf"],
      [0, "Color"],
      [8, "RightOf"],
      [6, "Height"],
    ];
    expect(hashIdAttrs(arr1 as string[][])).not.toBe(hashIdAttrs(arr2 as string[][]));
  });
});

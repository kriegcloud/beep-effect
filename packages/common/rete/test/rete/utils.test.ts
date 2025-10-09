import { describe, expect, it } from "bun:test";
import { hashIdAttrs } from "../../src/network/utils";

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

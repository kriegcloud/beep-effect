import { describe, expect, it } from "bun:test";
import { wrapArray } from "@beep/build-utils/secure-headers/helpers";

describe("wrapArray", () => {
  describe("when giving a value not array", () => {
    it("should wrap the value as array", () => {
      const value = 123;
      expect(wrapArray(value)).toEqual([value]);
    });
  });

  describe("when giving an array", () => {
    it("should return the value", () => {
      const value = [123];
      expect(wrapArray(value)).toEqual(value);
    });
  });
});

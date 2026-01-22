import { describe, expect, it } from "bun:test";
import { assert } from "@beep/testkit";

describe("assert namespace", () => {
  describe("assert.ok", () => {
    it("should pass for truthy values", () => {
      assert.ok(true);
      assert.ok(1);
      assert.ok("string");
      assert.ok([]);
      assert.ok({});
    });

    it("should fail for falsy values", () => {
      expect(() => assert.ok(false)).toThrow();
      expect(() => assert.ok(0)).toThrow();
      expect(() => assert.ok("")).toThrow();
      expect(() => assert.ok(null)).toThrow();
      expect(() => assert.ok(undefined)).toThrow();
    });

    it("should include custom message in error", () => {
      expect(() => assert.ok(false, "custom message")).toThrow("custom message");
    });
  });

  describe("assert.isOk", () => {
    it("should be an alias for assert.ok", () => {
      // isOk should behave identically to ok
      assert.isOk(true);
      assert.isOk(1);
      assert.isOk("string");

      expect(() => assert.isOk(false)).toThrow();
      expect(() => assert.isOk(0)).toThrow();
      expect(() => assert.isOk("")).toThrow();
    });

    it("should include custom message in error", () => {
      expect(() => assert.isOk(null, "isOk custom message")).toThrow("isOk custom message");
    });
  });

  describe("assert() direct call", () => {
    it("should pass for truthy values", () => {
      assert(true);
      assert(1);
      assert("truthy");
    });

    it("should fail for falsy values", () => {
      expect(() => assert(false)).toThrow();
      expect(() => assert(0)).toThrow();
    });
  });

  describe("existing assertions", () => {
    it("assert.isTrue should work", () => {
      assert.isTrue(true);
      expect(() => assert.isTrue(false)).toThrow();
    });

    it("assert.isFalse should work", () => {
      assert.isFalse(false);
      expect(() => assert.isFalse(true)).toThrow();
    });

    it("assert.isDefined should work", () => {
      assert.isDefined("value");
      assert.isDefined(0);
      expect(() => assert.isDefined(undefined)).toThrow();
      expect(() => assert.isDefined(null)).toThrow();
    });

    it("assert.isUndefined should work", () => {
      assert.isUndefined(undefined);
      expect(() => assert.isUndefined("value")).toThrow();
    });

    it("assert.isString should work", () => {
      assert.isString("hello");
      expect(() => assert.isString(123)).toThrow();
    });

    it("assert.isNumber should work", () => {
      assert.isNumber(42);
      expect(() => assert.isNumber("42")).toThrow();
    });

    it("assert.isNotEmpty should work", () => {
      assert.isNotEmpty("hello");
      assert.isNotEmpty([1, 2, 3]);
      expect(() => assert.isNotEmpty("")).toThrow();
      expect(() => assert.isNotEmpty([])).toThrow();
    });

    it("assert.strictEqual should work", () => {
      assert.strictEqual(1, 1);
      assert.strictEqual("a", "a");
      expect(() => assert.strictEqual(1, 2)).toThrow();
    });
  });
});

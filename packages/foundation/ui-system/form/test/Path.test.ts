import {
  getNestedValue,
  isPathOrParentDirty,
  isPathUnderRoot,
  schemaPathToFieldPath,
  setNestedValue,
} from "@beep/form/core/Path";
import * as HashSet from "effect/HashSet";
import { describe, expect, it } from "vitest";

describe("@beep/form Path", () => {
  describe("schemaPathToFieldPath", () => {
    it("formats nested and array segments", () => {
      expect(schemaPathToFieldPath(["items", 0, "name"])).toBe("items[0].name");
      expect(schemaPathToFieldPath(["user", "address", "city"])).toBe("user.address.city");
    });

    it("returns an empty string for empty or missing paths", () => {
      expect(schemaPathToFieldPath([])).toBe("");
      expect(schemaPathToFieldPath(undefined)).toBe("");
    });
  });

  describe("getNestedValue / setNestedValue", () => {
    it("reads and writes nested and array paths immutably", () => {
      const source = { items: [{ name: "A" }] };
      expect(getNestedValue(source, "items[0].name")).toBe("A");

      const next = setNestedValue(source, { path: "items[0].name", value: "B" });
      expect(getNestedValue(next, "items[0].name")).toBe("B");
      // Original is untouched.
      expect(getNestedValue(source, "items[0].name")).toBe("A");
    });

    it("refuses to read or write prototype-sensitive segments", () => {
      expect(getNestedValue("__proto__")({ a: 1 })).toBeUndefined();
      const target: Record<string, unknown> = {};
      setNestedValue(target, { path: "__proto__.polluted", value: true });
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe("isPathUnderRoot", () => {
    it("matches the root itself and nested or indexed descendants", () => {
      expect(isPathUnderRoot("items", "items")).toBe(true);
      expect(isPathUnderRoot("items[0].name", "items")).toBe(true);
      expect(isPathUnderRoot("items.name", "items")).toBe(true);
      expect(isPathUnderRoot("other", "items")).toBe(false);
    });
  });

  describe("isPathOrParentDirty", () => {
    it("treats a dirty parent as making its children dirty", () => {
      const dirty = HashSet.make("user");
      expect(isPathOrParentDirty(dirty, "user")).toBe(true);
      expect(isPathOrParentDirty(dirty, "user.name")).toBe(true);
      expect(isPathOrParentDirty(dirty, "account.name")).toBe(false);
    });
  });
});

import { getJSDocTagMetadata } from "@beep/repo-utils/JSDoc/models/JSDocTagAnnotation.model";
import * as JSDocTagDefinition from "@beep/repo-utils/JSDoc/models/JSDocTagDefinition.model";
import { AccessValue, AsyncValue, ParamValue, TagName, TagValue } from "@beep/repo-utils/JSDoc/models/TagValue.model";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("JSDocTagFibration", () => {
  describe("TagValue is a TaggedUnion", () => {
    it("exposes .cases with per-tag schemas", () => {
      expect(TagValue.cases.param).toBeDefined();
      expect(TagValue.cases.async).toBeDefined();
      expect(TagValue.cases.access).toBeDefined();
    });

    it("has 113 cases", () => {
      expect(Object.keys(TagValue.cases).length).toBe(113);
    });

    it("exposes .match for exhaustive pattern matching", () => {
      expect(typeof TagValue.match).toBe("function");
    });

    it("exposes .guards for per-tag type guards", () => {
      expect(typeof TagValue.guards.param).toBe("function");
      expect(typeof TagValue.guards.async).toBe("function");
    });

    it("exposes .isAnyOf for multi-tag discrimination", () => {
      expect(typeof TagValue.isAnyOf).toBe("function");
    });
  });

  describe("TagName LiteralKit", () => {
    it("TagName.is.param recognises 'param'", () => {
      expect(TagName.is.param("param")).toBe(true);
    });

    it("TagName.is.param rejects other strings", () => {
      expect(TagName.is.param("notATag")).toBe(false);
    });

    it("TagName.Enum.param equals 'param'", () => {
      expect(TagName.Enum.param).toBe("param");
    });

    it("decodes a valid tag name", () => {
      const result = S.decodeSync(TagName)("param");
      expect(result).toBe("param");
    });

    it("rejects an invalid tag name", () => {
      // @ts-expect-error - testing runtime rejection of invalid input
      expect(() => S.decodeSync(TagName)("notATag")).toThrow();
    });
  });

  describe("individual TaggedClass members", () => {
    it("ParamValue has _tag 'param'", () => {
      const decoded = S.decodeSync(ParamValue)({ _tag: "param", name: "x" });
      expect(decoded._tag).toBe("param");
      expect(decoded).toBeInstanceOf(ParamValue);
    });

    it("ParamValue decodes with all fields", () => {
      const decoded = S.decodeSync(ParamValue)({
        _tag: "param",
        name: "x",
        type: "string",
        description: "a param",
      });
      expect(decoded.name).toBe("x");
      expect(decoded.type).toBe("string");
      expect(decoded.description).toBe("a param");
    });

    it("AsyncValue decodes as empty-field tag", () => {
      const decoded = S.decodeSync(AsyncValue)({ _tag: "async" });
      expect(decoded._tag).toBe("async");
      expect(decoded).toBeInstanceOf(AsyncValue);
    });

    it("AccessValue decodes with constrained level", () => {
      const decoded = S.decodeSync(AccessValue)({ _tag: "access", level: "public" });
      expect(decoded._tag).toBe("access");
      expect(decoded.level).toBe("public");
    });

    it("TagValue.cases.param decodes same shape as ParamValue", () => {
      const fromCases = S.decodeSync(TagValue.cases.param)({ _tag: "param", name: "x" });
      const fromClass = S.decodeSync(ParamValue)({ _tag: "param", name: "x" });
      expect(fromCases._tag).toBe(fromClass._tag);
      expect(fromCases.name).toBe(fromClass.name);
    });
  });

  describe("lean decode via cases", () => {
    it("decodes a param occurrence with fields", () => {
      const result = S.decodeSync(TagValue.cases.param)({
        _tag: "param",
        name: "x",
        type: "string",
      });
      expect(result._tag).toBe("param");
      expect(result.name).toBe("x");
      expect(result.type).toBe("string");
    });

    it("decodes an empty-field tag (async)", () => {
      const result = S.decodeSync(TagValue.cases.async)({ _tag: "async" });
      expect(result._tag).toBe("async");
    });

    it("decodes a constrained tag (access)", () => {
      const result = S.decodeSync(TagValue.cases.access)({
        _tag: "access",
        level: "public",
      });
      expect(result._tag).toBe("access");
      expect(result.level).toBe("public");
    });

    it("rejects invalid access level", () => {
      expect(() =>
        S.decodeSync(TagValue.cases.access)({
          _tag: "access",
          // @ts-expect-error - testing runtime rejection
          level: "invalid",
        })
      ).toThrow();
    });
  });

  describe("double discrimination", () => {
    it("param requires name field", () => {
      // @ts-expect-error - testing runtime rejection of missing required field
      expect(() => S.decodeSync(TagValue.cases.param)({ _tag: "param" })).toThrow();
    });

    it("class has optional name", () => {
      const result = S.decodeSync(TagValue.cases.class)({ _tag: "class" });
      expect(result._tag).toBe("class");
      expect(result.name).toBeUndefined();
    });
  });

  describe("JSDocTagDefinition.make", () => {
    it("returns a schema with _tag and value fields", () => {
      const schema = JSDocTagDefinition.make("param", {
        synonyms: ["arg"],
        overview: "test",
        tagKind: "block",
        specifications: ["jsdoc3"],
        applicableTo: ["function"],
        astDerivable: "partial",
        astDerivableNote: "test",
        parameters: {
          syntax: "@param {Type} name - desc",
          acceptsType: true,
          acceptsName: true,
          acceptsDescription: true,
        },
        relatedTags: ["returns"],
        isDeprecated: false,
        example: "/** @param x */",
      });
      expect(schema.fields._tag).toBeDefined();
      expect(schema.fields.value).toBeDefined();
    });

    it("attaches jsDocTagMetadata annotation", () => {
      const schema = JSDocTagDefinition.make("param", {
        synonyms: ["arg"],
        overview: "test",
        tagKind: "block",
        specifications: ["jsdoc3"],
        applicableTo: ["function"],
        astDerivable: "partial",
        astDerivableNote: "test",
        parameters: {
          syntax: "@param {Type} name - desc",
          acceptsType: true,
          acceptsName: true,
          acceptsDescription: true,
        },
        relatedTags: ["returns"],
        isDeprecated: false,
        example: "/** @param x */",
      });
      const meta = getJSDocTagMetadata(schema);
      expect(meta).toBeDefined();
      expect(meta?._tag).toBe("param");
      expect(meta?.astDerivable).toBe("partial");
    });

    it("decodes with nested value shape", () => {
      const schema = JSDocTagDefinition.make("async", {
        synonyms: [],
        overview: "test",
        tagKind: "modifier",
        specifications: ["jsdoc3"],
        applicableTo: ["function"],
        astDerivable: "full",
        astDerivableNote: "test",
        parameters: {
          syntax: "@async",
          acceptsType: false,
          acceptsName: false,
          acceptsDescription: false,
        },
        relatedTags: [],
        isDeprecated: false,
        example: "/** @async */",
      });
      const decoded = S.decodeSync(schema)({
        _tag: "async",
        value: { _tag: "async" },
      });
      expect(decoded._tag).toBe("async");
      expect(decoded.value._tag).toBe("async");
    });
  });
});

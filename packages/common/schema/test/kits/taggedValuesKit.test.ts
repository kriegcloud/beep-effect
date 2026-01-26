import { describe, expect, it } from "bun:test";
import { TaggedValuesKit, TaggedValuesKitFromObject } from "@beep/schema/derived/kits/tagged-values-kit";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";

// =============================================================================
// Test Fixtures
// =============================================================================

const AllowedAttrs = TaggedValuesKit(
  ["a", ["href", "target", "rel"]],
  ["img", ["src", "alt", "width"]],
  ["input", ["type", "name", "value"]]
);

const MixedTypesKit = TaggedValuesKit(
  ["numbers", [1, 2, 3]],
  ["booleans", [true, false]],
  ["strings", ["foo", "bar", "baz"]]
);

const SingleEntryKit = TaggedValuesKit(["only", ["single", "entry"]]);

// =============================================================================
// Tests
// =============================================================================

describe("TaggedValuesKit", () => {
  describe("basic decode/encode", () => {
    it("decodes a tag literal to tagged struct", () => {
      const result = S.decodeSync(AllowedAttrs)("a");
      expect(result).toEqual({ _tag: "a", values: ["href", "target", "rel"] });
    });

    it("decodes different tags correctly", () => {
      const img = S.decodeSync(AllowedAttrs)("img");
      expect(img).toEqual({ _tag: "img", values: ["src", "alt", "width"] });

      const input = S.decodeSync(AllowedAttrs)("input");
      expect(input).toEqual({
        _tag: "input",
        values: ["type", "name", "value"],
      });
    });

    it("encodes tagged struct back to tag literal", () => {
      const encoded = S.encodeSync(AllowedAttrs)({
        _tag: "a",
        values: ["href", "target", "rel"],
      });
      expect(encoded).toBe("a");
    });

    it("throws on unknown tag during decode", () => {
      // The literal union schema rejects invalid tags before our decode runs
      expect(() => S.decodeSync(AllowedAttrs)("unknown" as "a")).toThrow();
    });
  });

  describe("roundtrip property", () => {
    it("encode(decode(tag)) === tag for all tags", () => {
      F.pipe(
        AllowedAttrs.Tags,
        A.forEach((tag) => {
          const decoded = S.decodeSync(AllowedAttrs)(tag);
          const encoded = S.encodeSync(AllowedAttrs)(decoded);
          expect(encoded).toBe(tag);
        })
      );
    });

    it("roundtrips for mixed types kit", () => {
      F.pipe(
        MixedTypesKit.Tags,
        A.forEach((tag) => {
          const decoded = S.decodeSync(MixedTypesKit)(tag);
          const encoded = S.encodeSync(MixedTypesKit)(decoded);
          expect(encoded).toBe(tag);
        })
      );
    });
  });

  describe("static properties", () => {
    it("Tags contains all tag literals", () => {
      expect(AllowedAttrs.Tags).toEqual(["a", "img", "input"]);
    });

    it("TagsEnum provides enum-like access", () => {
      expect(AllowedAttrs.TagsEnum.a).toBe("a");
      expect(AllowedAttrs.TagsEnum.img).toBe("img");
      expect(AllowedAttrs.TagsEnum.input).toBe("input");
    });

    it("Entries contains all tag-values pairs", () => {
      expect(AllowedAttrs.Entries).toEqual([
        ["a", ["href", "target", "rel"]],
        ["img", ["src", "alt", "width"]],
        ["input", ["type", "name", "value"]],
      ]);
    });

    it("Configs is an object accessor with decoded tagged structs", () => {
      expect(AllowedAttrs.Configs.a).toEqual({
        _tag: "a",
        values: ["href", "target", "rel"],
      });
      expect(AllowedAttrs.Configs.img).toEqual({
        _tag: "img",
        values: ["src", "alt", "width"],
      });
      expect(AllowedAttrs.Configs.input).toEqual({
        _tag: "input",
        values: ["type", "name", "value"],
      });
    });

    it("Configs values include _tag field", () => {
      expect(AllowedAttrs.Configs.a._tag).toBe("a");
      expect(AllowedAttrs.Configs.img._tag).toBe("img");
      expect(AllowedAttrs.Configs.input._tag).toBe("input");
    });
  });

  describe("ValuesFor accessor", () => {
    it("returns values array for existing tag", () => {
      expect(AllowedAttrs.ValuesFor.a).toEqual(["href", "target", "rel"]);
      expect(AllowedAttrs.ValuesFor.img).toEqual(["src", "alt", "width"]);
      expect(AllowedAttrs.ValuesFor.input).toEqual(["type", "name", "value"]);
    });

    it("returns values for mixed type kit", () => {
      expect(MixedTypesKit.ValuesFor.numbers).toEqual([1, 2, 3]);
      expect(MixedTypesKit.ValuesFor.booleans).toEqual([true, false]);
      expect(MixedTypesKit.ValuesFor.strings).toEqual(["foo", "bar", "baz"]);
    });

    it("preserves exact literal types", () => {
      const values = AllowedAttrs.ValuesFor.a;
      // Type-level check: values should be readonly ["href", "target", "rel"]
      expect(values).toContain("href");
      expect(values).toContain("target");
      expect(values).toContain("rel");
    });
  });

  describe("LiteralKitFor accessor", () => {
    it("returns a LiteralKit for the tag's values", () => {
      const aKit = AllowedAttrs.LiteralKitFor.a;
      expect(aKit).toBeDefined();
      expect(aKit.Options).toEqual(["href", "target", "rel"]);
    });

    it("LiteralKit validates individual values (oneOf)", () => {
      const aKit = AllowedAttrs.LiteralKitFor.a;

      // Valid values should decode successfully
      expect(S.decodeSync(aKit)("href")).toBe("href");
      expect(S.decodeSync(aKit)("target")).toBe("target");
      expect(S.decodeSync(aKit)("rel")).toBe("rel");
    });

    it("LiteralKit rejects values not in tag's list", () => {
      const aKit = AllowedAttrs.LiteralKitFor.a;

      // "src" is in img's values, not a's values
      expect(() => S.decodeSync(aKit)("src" as "href")).toThrow();
      expect(() => S.decodeSync(aKit)("invalid" as "href")).toThrow();
    });

    it("different tags have independent LiteralKits", () => {
      const aKit = AllowedAttrs.LiteralKitFor.a;
      const imgKit = AllowedAttrs.LiteralKitFor.img;

      // a's values work in aKit
      expect(S.decodeSync(aKit)("href")).toBe("href");
      // img's values work in imgKit
      expect(S.decodeSync(imgKit)("src")).toBe("src");

      // Cross-validation fails
      expect(() => S.decodeSync(aKit)("src" as "href")).toThrow();
      expect(() => S.decodeSync(imgKit)("href" as "src")).toThrow();
    });

    it("works with mixed type values", () => {
      const numbersKit = MixedTypesKit.LiteralKitFor.numbers;
      const booleansKit = MixedTypesKit.LiteralKitFor.booleans;

      expect(S.decodeSync(numbersKit)(1)).toBe(1);
      expect(S.decodeSync(numbersKit)(2)).toBe(2);
      expect(() => S.decodeSync(numbersKit)(4 as 1)).toThrow();

      expect(S.decodeSync(booleansKit)(true)).toBe(true);
      expect(S.decodeSync(booleansKit)(false)).toBe(false);
    });
  });

  describe("encode validation", () => {
    it("succeeds when all values match exactly in order", () => {
      const encoded = S.encodeSync(AllowedAttrs)({
        _tag: "a",
        values: ["href", "target", "rel"],
      });
      expect(encoded).toBe("a");
    });

    it("throws on reordered values (tuple requires exact order)", () => {
      // The values schema uses S.Tuple which enforces positional matching
      // @ts-expect-error - testing invalid input (wrong order)
      expect(() => S.encodeSync(AllowedAttrs)({ _tag: "a", values: ["rel", "href", "target"] })).toThrow();
    });

    it("throws on partial values (missing some)", () => {
      // @ts-expect-error - testing invalid input (missing values)
      expect(() => S.encodeSync(AllowedAttrs)({ _tag: "a", values: ["href", "target"] })).toThrow();
    });

    it("throws on extra values", () => {
      // @ts-expect-error - testing invalid input (extra values)
      expect(() => S.encodeSync(AllowedAttrs)({ _tag: "a", values: ["href", "target", "rel", "extra"] })).toThrow();
    });

    it("throws on wrong values for tag", () => {
      // Runtime test: values from different tag should fail encode validation
      expect(() => S.encodeSync(AllowedAttrs)({ _tag: "a", values: ["src", "alt", "width"] })).toThrow();
    });

    it("validates mixed type values correctly", () => {
      // Values must be in the exact order specified
      const encoded = S.encodeSync(MixedTypesKit)({
        _tag: "numbers",
        values: [1, 2, 3], // correct order
      });
      expect(encoded).toBe("numbers");

      // @ts-expect-error - testing invalid input (missing numeric value)
      expect(() => S.encodeSync(MixedTypesKit)({ _tag: "numbers", values: [1, 2] })).toThrow();
    });
  });

  describe("different value types", () => {
    it("handles string literals", () => {
      const kit = TaggedValuesKit(["status", ["active", "inactive", "pending"]]);

      const decoded = S.decodeSync(kit)("status");
      expect(decoded.values).toEqual(["active", "inactive", "pending"]);
    });

    it("handles number literals", () => {
      const kit = TaggedValuesKit(["priorities", [1, 2, 3, 4, 5]]);

      const decoded = S.decodeSync(kit)("priorities");
      expect(decoded.values).toEqual([1, 2, 3, 4, 5]);
    });

    it("handles boolean literals", () => {
      const kit = TaggedValuesKit(["flags", [true, false]]);

      const decoded = S.decodeSync(kit)("flags");
      expect(decoded.values).toEqual([true, false]);
    });

    it("handles mixed literal types in same kit", () => {
      // Each entry can have different value types
      expect(MixedTypesKit.ValuesFor.numbers).toEqual([1, 2, 3]);
      expect(MixedTypesKit.ValuesFor.booleans).toEqual([true, false]);
      expect(MixedTypesKit.ValuesFor.strings).toEqual(["foo", "bar", "baz"]);
    });
  });

  describe("single entry", () => {
    it("works with single tag kit", () => {
      const decoded = S.decodeSync(SingleEntryKit)("only");
      expect(decoded).toEqual({ _tag: "only", values: ["single", "entry"] });
    });

    it("Tags has single element", () => {
      expect(SingleEntryKit.Tags).toEqual(["only"]);
    });

    it("roundtrips single entry", () => {
      const decoded = S.decodeSync(SingleEntryKit)("only");
      const encoded = S.encodeSync(SingleEntryKit)(decoded);
      expect(encoded).toBe("only");
    });

    it("single entry has correct Configs", () => {
      expect(SingleEntryKit.Configs.only).toEqual({
        _tag: "only",
        values: ["single", "entry"],
      });
    });
  });

  describe("referential stability", () => {
    it("Configs values are frozen", () => {
      expect(Object.isFrozen(AllowedAttrs.Configs.a)).toBe(true);
      expect(Object.isFrozen(AllowedAttrs.Configs.img)).toBe(true);
      expect(Object.isFrozen(AllowedAttrs.Configs.input)).toBe(true);
    });

    it("returns same reference for same Configs access", () => {
      const first = AllowedAttrs.Configs.a;
      const second = AllowedAttrs.Configs.a;
      expect(first).toBe(second);
    });

    it("returns same reference for same ValuesFor access", () => {
      const first = AllowedAttrs.ValuesFor.a;
      const second = AllowedAttrs.ValuesFor.a;
      expect(first).toBe(second);
    });
  });

  describe("annotations", () => {
    it("supports adding annotations", () => {
      const Annotated = TaggedValuesKit(["A", ["v1", "v2"]], ["B", ["v3", "v4"]]).annotations({
        identifier: "TestValuesKit",
        description: "Test values kit schema",
      });

      expect(Annotated.Entries).toEqual([
        ["A", ["v1", "v2"]],
        ["B", ["v3", "v4"]],
      ]);
      expect(Annotated.Configs.A).toEqual({ _tag: "A", values: ["v1", "v2"] });
      expect(S.decodeSync(Annotated)("A")).toEqual({ _tag: "A", values: ["v1", "v2"] });
    });

    it("preserves all properties after annotation", () => {
      const Annotated = TaggedValuesKit(["X", ["x1", "x2"]], ["Y", ["y1", "y2"]]).annotations({
        identifier: "CoordinateValues",
      });

      // All properties should still work
      expect(Annotated.Tags).toEqual(["X", "Y"]);
      expect(Annotated.TagsEnum.X).toBe("X");
      expect(Annotated.TagsEnum.Y).toBe("Y");
      expect(Annotated.Configs.X).toEqual({ _tag: "X", values: ["x1", "x2"] });
      expect(Annotated.Configs.Y).toEqual({ _tag: "Y", values: ["y1", "y2"] });
      expect(Annotated.ValuesFor.X).toEqual(["x1", "x2"]);
      expect(Annotated.LiteralKitFor.X.Options).toEqual(["x1", "x2"]);
    });
  });

  describe("type safety", () => {
    it("preserves literal types in decoded values", () => {
      const decoded = S.decodeSync(AllowedAttrs)("a");

      // Type-level: decoded._tag should be "a" | "img" | "input"
      // Type-level: decoded.values should be the union of all values arrays
      expect(decoded._tag).toBe("a");
      expect(decoded.values).toContain("href");
    });

    it("Configs values have correct literal types", () => {
      // These should compile and have correct literal types
      const aConfig = AllowedAttrs.Configs.a;
      const aTag: "a" = aConfig._tag;
      expect(aTag).toBe("a");

      const imgConfig = AllowedAttrs.Configs.img;
      const imgTag: "img" = imgConfig._tag;
      expect(imgTag).toBe("img");
    });

    it("TagsEnum values have correct types", () => {
      const aTag: "a" = AllowedAttrs.TagsEnum.a;
      const imgTag: "img" = AllowedAttrs.TagsEnum.img;

      expect(aTag).toBe("a");
      expect(imgTag).toBe("img");
    });
  });

  describe("type guards (is)", () => {
    it("provides is guards for each tag", () => {
      expect(typeof AllowedAttrs.is.a).toBe("function");
      expect(typeof AllowedAttrs.is.img).toBe("function");
      expect(typeof AllowedAttrs.is.input).toBe("function");
    });

    it("correctly identifies matching configs", () => {
      const aConfig = S.decodeSync(AllowedAttrs)("a");
      expect(AllowedAttrs.is.a(aConfig)).toBe(true);
      expect(AllowedAttrs.is.img(aConfig)).toBe(false);
      expect(AllowedAttrs.is.input(aConfig)).toBe(false);
    });

    it("correctly identifies all config types", () => {
      const imgConfig = S.decodeSync(AllowedAttrs)("img");
      const inputConfig = S.decodeSync(AllowedAttrs)("input");

      expect(AllowedAttrs.is.img(imgConfig)).toBe(true);
      expect(AllowedAttrs.is.input(inputConfig)).toBe(true);
    });

    it("works in conditional narrowing", () => {
      const config = S.decodeSync(AllowedAttrs)("a");

      if (AllowedAttrs.is.a(config)) {
        // Type is narrowed to a config
        expect(config._tag).toBe("a");
        expect(config.values).toEqual(["href", "target", "rel"]);
      } else {
        throw new Error("Expected is.a to return true");
      }
    });

    it("can be used with Array.filter for type narrowing", () => {
      const allConfigs = F.pipe(
        AllowedAttrs.Tags,
        A.map((tag) => S.decodeSync(AllowedAttrs)(tag))
      );

      const aConfigs = F.pipe(allConfigs, A.filter(AllowedAttrs.is.a));

      expect(aConfigs).toHaveLength(1);
      expect(aConfigs[0]?._tag).toBe("a");
    });
  });

  describe("HashMap (ConfigMap)", () => {
    it("provides ConfigMap as Effect HashMap", () => {
      expect(HashMap.isHashMap(AllowedAttrs.ConfigMap)).toBe(true);
    });

    it("contains all configs keyed by tag", () => {
      const aResult = HashMap.get(AllowedAttrs.ConfigMap, "a");
      const imgResult = HashMap.get(AllowedAttrs.ConfigMap, "img");
      const inputResult = HashMap.get(AllowedAttrs.ConfigMap, "input");

      expect(O.isSome(aResult)).toBe(true);
      expect(O.isSome(imgResult)).toBe(true);
      expect(O.isSome(inputResult)).toBe(true);
    });

    it("returns correct config values", () => {
      const aOption = HashMap.get(AllowedAttrs.ConfigMap, "a");
      expect(O.isSome(aOption)).toBe(true);

      const aConfig = F.pipe(
        aOption,
        // Fallback only used if Option is None (shouldn't happen per test above)
        O.getOrElse(() => ({ _tag: "a" as const, values: ["href", "target", "rel"] as const }))
      );

      expect(aConfig).toEqual({
        _tag: "a",
        values: ["href", "target", "rel"],
      });
    });

    it("returns None for non-existent tags", () => {
      // Type system prevents this at compile time, but runtime check
      const result = HashMap.get(AllowedAttrs.ConfigMap, "INVALID" as "a");
      expect(O.isNone(result)).toBe(true);
    });

    it("has correct size", () => {
      expect(HashMap.size(AllowedAttrs.ConfigMap)).toBe(3);
    });

    it("supports iteration", () => {
      const tags = F.pipe(AllowedAttrs.ConfigMap, HashMap.keys, A.fromIterable, A.sort(Order.string));

      expect(tags).toEqual(["a", "img", "input"]);
    });
  });

  describe("derive", () => {
    it("creates a subset kit with specified tags", () => {
      const Subset = AllowedAttrs.derive("a", "img");

      // Order preserved from original entries order
      const sortedTags = F.pipe([...Subset.Tags] as string[], A.sort(Order.string));
      expect(sortedTags).toEqual(["a", "img"]);
    });

    it("derived kit has correct Configs", () => {
      const Subset = AllowedAttrs.derive("img", "input");

      expect(Subset.Configs.img).toEqual({
        _tag: "img",
        values: ["src", "alt", "width"],
      });
      expect(Subset.Configs.input).toEqual({
        _tag: "input",
        values: ["type", "name", "value"],
      });
    });

    it("derived kit decodes correctly", () => {
      const Subset = AllowedAttrs.derive("a", "img");

      expect(S.decodeSync(Subset)("a")).toEqual({
        _tag: "a",
        values: ["href", "target", "rel"],
      });
    });

    it("derived kit rejects excluded tags", () => {
      const Subset = AllowedAttrs.derive("a", "img");

      // input is not in the derived kit
      expect(() => S.decodeSync(Subset)("input" as "a")).toThrow();
    });

    it("derived kit has all interface properties", () => {
      const Single = AllowedAttrs.derive("a");

      expect(Single.Configs).toBeDefined();
      expect(Single.ValuesFor).toBeDefined();
      expect(Single.LiteralKitFor).toBeDefined();
      expect(Single.Tags).toBeDefined();
      expect(Single.TagsEnum).toBeDefined();
      expect(Single.Entries).toBeDefined();
      expect(Single.is).toBeDefined();
      expect(Single.ConfigMap).toBeDefined();
      expect(Single.derive).toBeDefined();
    });

    it("supports chained derive calls", () => {
      const ThreeTags = AllowedAttrs.derive("a", "img", "input");
      const TwoTags = ThreeTags.derive("a", "img");

      expect(TwoTags.Tags).toHaveLength(2);
      expect(() => S.decodeSync(TwoTags)("input" as "a")).toThrow();
    });
  });

  describe("TaggedValuesKitFromObject", () => {
    describe("basic usage", () => {
      const ALLOWED_ATTRS = {
        a: ["href", "target", "rel"],
        img: ["src", "alt", "width"],
      } as const;

      const AttrsKit = TaggedValuesKitFromObject(ALLOWED_ATTRS);

      it("creates kit from object", () => {
        expect(AttrsKit.Configs.a).toEqual({
          _tag: "a",
          values: ["href", "target", "rel"],
        });
        expect(AttrsKit.Configs.img).toEqual({
          _tag: "img",
          values: ["src", "alt", "width"],
        });
      });

      it("provides Tags array", () => {
        // Note: order may vary based on object key iteration
        const tags = [...AttrsKit.Tags] as string[];
        tags.sort((a, b) => a.localeCompare(b));
        expect(tags).toEqual(["a", "img"]);
      });

      it("provides TagsEnum", () => {
        expect(AttrsKit.TagsEnum.a).toBe("a");
        expect(AttrsKit.TagsEnum.img).toBe("img");
      });

      it("decodes and encodes correctly", () => {
        expect(S.decodeSync(AttrsKit)("a")).toEqual({
          _tag: "a",
          values: ["href", "target", "rel"],
        });
        expect(
          S.encodeSync(AttrsKit)({
            _tag: "img",
            values: ["src", "alt", "width"],
          })
        ).toBe("img");
      });
    });

    describe("with existing value maps", () => {
      const PRIORITY_VALUES = {
        LOW: ["email", "slack"],
        MEDIUM: ["email", "slack", "sms"],
        HIGH: ["email", "slack", "sms", "call"],
      } as const;

      const Priority = TaggedValuesKitFromObject(PRIORITY_VALUES);

      it("preserves all values", () => {
        expect(Priority.ValuesFor.LOW).toEqual(["email", "slack"]);
        expect(Priority.ValuesFor.MEDIUM).toEqual(["email", "slack", "sms"]);
        expect(Priority.ValuesFor.HIGH).toEqual(["email", "slack", "sms", "call"]);
      });

      it("provides LiteralKitFor each tag", () => {
        expect(Priority.LiteralKitFor.LOW.Options).toEqual(["email", "slack"]);
        expect(Priority.LiteralKitFor.HIGH.Options).toEqual(["email", "slack", "sms", "call"]);
      });
    });
  });

  describe("edge cases", () => {
    it("handles single value array", () => {
      const kit = TaggedValuesKit(["single", ["only"]]);

      const decoded = S.decodeSync(kit)("single");
      expect(decoded.values).toEqual(["only"]);

      const encoded = S.encodeSync(kit)(decoded);
      expect(encoded).toBe("single");
    });

    it("handles many entries", () => {
      const kit = TaggedValuesKit(["t1", ["v1"]], ["t2", ["v2"]], ["t3", ["v3"]], ["t4", ["v4"]], ["t5", ["v5"]]);

      expect(kit.Tags.length).toBe(5);
      expect(HashMap.size(kit.ConfigMap)).toBe(5);
    });

    it("handles special string values", () => {
      const kit = TaggedValuesKit(["special", ["with space", "with-dash", "with_underscore", "CamelCase"]]);

      expect(kit.ValuesFor.special).toEqual(["with space", "with-dash", "with_underscore", "CamelCase"]);
    });

    it("handles numeric-like string tags", () => {
      const kit = TaggedValuesKit(["100", ["one"]], ["200", ["two"]]);

      const decoded = S.decodeSync(kit)("100");
      expect(decoded._tag).toBe("100");
    });
  });
});

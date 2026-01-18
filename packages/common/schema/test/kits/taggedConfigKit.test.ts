import { describe, expect, it } from "bun:test";
import { TaggedConfigKit, TaggedConfigKitFromObject } from "@beep/schema/derived/kits/tagged-config-kit";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";

describe("TaggedConfigKit", () => {
  describe("basic decode/encode", () => {
    const LabelColor = TaggedConfigKit(
      ["GRAY", { textColor: "#FFFFFF", backgroundColor: "#202020" }],
      ["GREEN", { textColor: "#D1F0D9", backgroundColor: "#12341D" }],
      ["BLUE", { textColor: "#B3D9FF", backgroundColor: "#0A3D6E" }]
    );

    it("decodes literal to tagged struct", () => {
      const decoded = S.decodeSync(LabelColor)("GRAY");
      expect(decoded).toEqual({
        _tag: "GRAY",
        textColor: "#FFFFFF",
        backgroundColor: "#202020",
      });
    });

    it("decodes all tags correctly", () => {
      expect(S.decodeSync(LabelColor)("GRAY")).toEqual({
        _tag: "GRAY",
        textColor: "#FFFFFF",
        backgroundColor: "#202020",
      });
      expect(S.decodeSync(LabelColor)("GREEN")).toEqual({
        _tag: "GREEN",
        textColor: "#D1F0D9",
        backgroundColor: "#12341D",
      });
      expect(S.decodeSync(LabelColor)("BLUE")).toEqual({
        _tag: "BLUE",
        textColor: "#B3D9FF",
        backgroundColor: "#0A3D6E",
      });
    });

    it("encodes tagged struct to literal", () => {
      const encoded = S.encodeSync(LabelColor)({
        _tag: "GRAY",
        textColor: "#FFFFFF",
        backgroundColor: "#202020",
      });
      expect(encoded).toBe("GRAY");
    });

    it("encodes all tagged structs correctly", () => {
      expect(
        S.encodeSync(LabelColor)({
          _tag: "GRAY",
          textColor: "#FFFFFF",
          backgroundColor: "#202020",
        })
      ).toBe("GRAY");
      expect(
        S.encodeSync(LabelColor)({
          _tag: "GREEN",
          textColor: "#D1F0D9",
          backgroundColor: "#12341D",
        })
      ).toBe("GREEN");
      expect(
        S.encodeSync(LabelColor)({
          _tag: "BLUE",
          textColor: "#B3D9FF",
          backgroundColor: "#0A3D6E",
        })
      ).toBe("BLUE");
    });

    it("rejects invalid tag on decode", () => {
      expect(() => S.decodeSync(LabelColor)("INVALID" as "GRAY")).toThrow();
      expect(() => S.decodeSync(LabelColor)("gray" as "GRAY")).toThrow();
      expect(() => S.decodeSync(LabelColor)(123 as unknown as "GRAY")).toThrow();
    });
  });

  describe("roundtrip property", () => {
    const Priority = TaggedConfigKit(
      ["LOW", { level: 1, urgent: false }],
      ["MEDIUM", { level: 2, urgent: false }],
      ["HIGH", { level: 3, urgent: true }]
    );

    it("encode(decode(tag)) === tag", () => {
      const tags = ["LOW", "MEDIUM", "HIGH"] as const;
      F.pipe(
        tags,
        A.forEach((tag) => {
          const decoded = S.decodeSync(Priority)(tag);
          const encoded = S.encodeSync(Priority)(decoded);
          expect(encoded).toBe(tag);
        })
      );
    });
  });

  describe("static properties", () => {
    const Status = TaggedConfigKit(
      ["ACTIVE", { color: "green", priority: 1 }],
      ["PENDING", { color: "yellow", priority: 2 }],
      ["INACTIVE", { color: "gray", priority: 3 }]
    );

    it("exposes Entries as the original tuples", () => {
      expect(Status.Entries).toEqual([
        ["ACTIVE", { color: "green", priority: 1 }],
        ["PENDING", { color: "yellow", priority: 2 }],
        ["INACTIVE", { color: "gray", priority: 3 }],
      ]);
    });

    it("provides Tags array", () => {
      expect(Status.Tags).toEqual(["ACTIVE", "PENDING", "INACTIVE"]);
    });

    it("provides TagsEnum for direct tag access", () => {
      expect(Status.TagsEnum.ACTIVE).toBe("ACTIVE");
      expect(Status.TagsEnum.PENDING).toBe("PENDING");
      expect(Status.TagsEnum.INACTIVE).toBe("INACTIVE");
    });

    it("provides Configs accessor with full config objects", () => {
      expect(Status.Configs.ACTIVE).toEqual({
        _tag: "ACTIVE",
        color: "green",
        priority: 1,
      });
      expect(Status.Configs.PENDING).toEqual({
        _tag: "PENDING",
        color: "yellow",
        priority: 2,
      });
      expect(Status.Configs.INACTIVE).toEqual({
        _tag: "INACTIVE",
        color: "gray",
        priority: 3,
      });
    });

    it("Configs values include _tag field", () => {
      expect(Status.Configs.ACTIVE._tag).toBe("ACTIVE");
      expect(Status.Configs.PENDING._tag).toBe("PENDING");
      expect(Status.Configs.INACTIVE._tag).toBe("INACTIVE");
    });
  });

  describe("different value types", () => {
    const Mixed = TaggedConfigKit(
      ["STRING", { value: "hello", count: 0 }],
      ["NUMBER", { value: "world", count: 42 }],
      ["BOOLEAN", { value: "test", count: -1 }]
    );

    it("handles string config values", () => {
      const decoded = S.decodeSync(Mixed)("STRING") as typeof Mixed.Configs.STRING;
      expect(decoded.value).toBe("hello");
    });

    it("handles number config values", () => {
      const decoded = S.decodeSync(Mixed)("NUMBER") as typeof Mixed.Configs.NUMBER;
      expect(decoded.count).toBe(42);
    });

    it("preserves literal types in Configs", () => {
      // Type check: these should be the exact literal types
      const stringConfig = Mixed.Configs.STRING;
      expect(stringConfig.value).toBe("hello");
      expect(stringConfig.count).toBe(0);
    });
  });

  describe("single entry", () => {
    const SingleStatus = TaggedConfigKit(["ONLY", { description: "The only status" }]);

    it("works with a single entry", () => {
      expect(SingleStatus.Entries).toEqual([["ONLY", { description: "The only status" }]]);
      expect(SingleStatus.Tags).toEqual(["ONLY"]);
      expect(SingleStatus.TagsEnum.ONLY).toBe("ONLY");
      expect(SingleStatus.Configs.ONLY).toEqual({
        _tag: "ONLY",
        description: "The only status",
      });
    });

    it("decodes and encodes single entry", () => {
      expect(S.decodeSync(SingleStatus)("ONLY")).toEqual({
        _tag: "ONLY",
        description: "The only status",
      });
      expect(S.encodeSync(SingleStatus)({ _tag: "ONLY", description: "The only status" })).toBe("ONLY");
    });
  });

  describe("empty config support", () => {
    const EmptyConfig = TaggedConfigKit(["ACTIVE", {}], ["INACTIVE", {}]);

    it("supports configs with no additional fields", () => {
      expect(EmptyConfig.Configs.ACTIVE).toEqual({ _tag: "ACTIVE" });
      expect(EmptyConfig.Configs.INACTIVE).toEqual({ _tag: "INACTIVE" });
    });

    it("decodes to struct with only _tag", () => {
      expect(S.decodeSync(EmptyConfig)("ACTIVE")).toEqual({ _tag: "ACTIVE" });
    });

    it("encodes struct with only _tag", () => {
      expect(S.encodeSync(EmptyConfig)({ _tag: "INACTIVE" })).toBe("INACTIVE");
    });
  });

  describe("referential stability", () => {
    const Color = TaggedConfigKit(["RED", { hex: "#FF0000" }], ["GREEN", { hex: "#00FF00" }]);

    it("Configs values are frozen", () => {
      expect(Object.isFrozen(Color.Configs.RED)).toBe(true);
      expect(Object.isFrozen(Color.Configs.GREEN)).toBe(true);
    });

    it("Configs returns same reference on repeated access", () => {
      expect(Color.Configs.RED).toBe(Color.Configs.RED);
      expect(Color.Configs.GREEN).toBe(Color.Configs.GREEN);
    });
  });

  describe("annotations", () => {
    it("supports adding annotations", () => {
      const Annotated = TaggedConfigKit(["A", { value: 1 }], ["B", { value: 2 }]).annotations({
        identifier: "TestConfig",
        description: "Test configuration schema",
      });

      expect(Annotated.Entries).toEqual([
        ["A", { value: 1 }],
        ["B", { value: 2 }],
      ]);
      expect(Annotated.Configs.A).toEqual({ _tag: "A", value: 1 });
      expect(S.decodeSync(Annotated)("A")).toEqual({ _tag: "A", value: 1 });
    });

    it("preserves all properties after annotation", () => {
      const Annotated = TaggedConfigKit(["X", { x: 10 }], ["Y", { x: 20 }]).annotations({
        identifier: "CoordinateConfig",
      });

      // All properties should still work
      expect(Annotated.Tags).toEqual(["X", "Y"]);
      expect(Annotated.TagsEnum.X).toBe("X");
      expect(Annotated.TagsEnum.Y).toBe("Y");
      expect(Annotated.Configs.X).toEqual({ _tag: "X", x: 10 });
      expect(Annotated.Configs.Y).toEqual({ _tag: "Y", x: 20 });
    });
  });

  describe("type safety", () => {
    const TypedConfig = TaggedConfigKit(
      ["SUCCESS", { code: 200, message: "OK" }],
      ["ERROR", { code: 500, message: "Internal Server Error" }]
    );

    it("Configs values have correct types", () => {
      // These should compile and have correct literal types
      const successCode: 200 = TypedConfig.Configs.SUCCESS.code;
      const successMessage: "OK" = TypedConfig.Configs.SUCCESS.message;
      const successTag: "SUCCESS" = TypedConfig.Configs.SUCCESS._tag;

      expect(successCode).toBe(200);
      expect(successMessage).toBe("OK");
      expect(successTag).toBe("SUCCESS");
    });

    it("TagsEnum values have correct types", () => {
      const successTag: "SUCCESS" = TypedConfig.TagsEnum.SUCCESS;
      const errorTag: "ERROR" = TypedConfig.TagsEnum.ERROR;

      expect(successTag).toBe("SUCCESS");
      expect(errorTag).toBe("ERROR");
    });

    it("Tags array has correct type", () => {
      const tags: readonly ["SUCCESS", "ERROR"] = TypedConfig.Tags;
      expect(tags).toEqual(["SUCCESS", "ERROR"]);
    });
  });

  describe("comprehensive example: label colors", () => {
    const LabelColor = TaggedConfigKit(
      ["GRAY", { textColor: "#FFFFFF", backgroundColor: "#202020" }],
      ["GREEN", { textColor: "#D1F0D9", backgroundColor: "#12341D" }],
      ["BLUE", { textColor: "#B3D9FF", backgroundColor: "#0A3D6E" }],
      ["YELLOW", { textColor: "#FEF9C3", backgroundColor: "#854D0E" }],
      ["RED", { textColor: "#FEE2E2", backgroundColor: "#991B1B" }]
    );

    it("provides complete config access", () => {
      // Direct field access from Configs
      expect(LabelColor.Configs.GRAY.textColor).toBe("#FFFFFF");
      expect(LabelColor.Configs.GRAY.backgroundColor).toBe("#202020");
      expect(LabelColor.Configs.GREEN.textColor).toBe("#D1F0D9");
      expect(LabelColor.Configs.RED.backgroundColor).toBe("#991B1B");
    });

    it("supports iteration over tags", () => {
      const allColors = F.pipe(
        LabelColor.Tags,
        A.map((tag) => ({
          tag,
          config: LabelColor.Configs[tag as keyof typeof LabelColor.Configs],
        }))
      );

      expect(allColors).toHaveLength(5);
      expect(allColors[0]).toEqual({
        tag: "GRAY",
        config: { _tag: "GRAY", textColor: "#FFFFFF", backgroundColor: "#202020" },
      });
    });

    it("works as database schema", () => {
      // Simulate: database stores only the tag
      const storedValue = "BLUE" as const;

      // Decode: expand to full config
      const fullConfig = S.decodeSync(LabelColor)(storedValue) as typeof LabelColor.Configs.BLUE;
      expect(fullConfig.textColor).toBe("#B3D9FF");
      expect(fullConfig.backgroundColor).toBe("#0A3D6E");

      // Encode: compress back to tag for storage
      const toStore = S.encodeSync(LabelColor)(fullConfig);
      expect(toStore).toBe("BLUE");
    });
  });

  describe("edge cases", () => {
    it("handles special characters in config values", () => {
      const Special = TaggedConfigKit(
        ["A", { path: "/foo/bar", query: "?a=1&b=2" }],
        ["B", { path: "/baz", query: "?c=3" }]
      );

      expect(Special.Configs.A.path).toBe("/foo/bar");
      expect(Special.Configs.A.query).toBe("?a=1&b=2");
    });

    it("handles numeric string tags", () => {
      const NumericTags = TaggedConfigKit(["100", { label: "one hundred" }], ["200", { label: "two hundred" }]);

      expect(NumericTags.Tags).toEqual(["100", "200"]);
      expect(NumericTags.Configs["100"]).toEqual({ _tag: "100", label: "one hundred" });
      expect(S.decodeSync(NumericTags)("100")).toEqual({ _tag: "100", label: "one hundred" });
    });

    it("handles null config values", () => {
      const WithNull = TaggedConfigKit(
        ["PRESENT", { value: "exists", meta: null }],
        ["ABSENT", { value: "missing", meta: null }]
      );

      expect(WithNull.Configs.PRESENT.meta).toBe(null);
      const decoded = S.decodeSync(WithNull)("PRESENT") as typeof WithNull.Configs.PRESENT;
      expect(decoded.meta).toBe(null);
    });

    it("handles boolean config values", () => {
      const WithBool = TaggedConfigKit(
        ["ENABLED", { active: true, visible: true }],
        ["DISABLED", { active: false, visible: false }]
      );

      expect(WithBool.Configs.ENABLED.active).toBe(true);
      expect(WithBool.Configs.DISABLED.active).toBe(false);
    });
  });
});

describe("TaggedConfigKitFromObject", () => {
  describe("basic usage", () => {
    const LABEL_COLORS = {
      GRAY: { textColor: "#FFFFFF", backgroundColor: "#202020" },
      GREEN: { textColor: "#D1F0D9", backgroundColor: "#12341D" },
    } as const;

    const LabelColor = TaggedConfigKitFromObject(LABEL_COLORS);

    it("creates kit from object", () => {
      expect(LabelColor.Configs.GRAY).toEqual({
        _tag: "GRAY",
        textColor: "#FFFFFF",
        backgroundColor: "#202020",
      });
      expect(LabelColor.Configs.GREEN).toEqual({
        _tag: "GREEN",
        textColor: "#D1F0D9",
        backgroundColor: "#12341D",
      });
    });

    it("provides Tags array", () => {
      // Note: order may vary based on object key iteration
      const tags = [...LabelColor.Tags] as string[];
      tags.sort((a, b) => a.localeCompare(b));
      expect(tags).toEqual(["GRAY", "GREEN"]);
    });

    it("provides TagsEnum", () => {
      expect(LabelColor.TagsEnum.GRAY).toBe("GRAY");
      expect(LabelColor.TagsEnum.GREEN).toBe("GREEN");
    });

    it("decodes and encodes correctly", () => {
      expect(S.decodeSync(LabelColor)("GRAY")).toEqual({
        _tag: "GRAY",
        textColor: "#FFFFFF",
        backgroundColor: "#202020",
      });
      expect(
        S.encodeSync(LabelColor)({
          _tag: "GREEN",
          textColor: "#D1F0D9",
          backgroundColor: "#12341D",
        })
      ).toBe("GREEN");
    });
  });

  describe("with existing config objects", () => {
    const PRIORITY_CONFIG = {
      LOW: { level: 1, color: "gray" },
      MEDIUM: { level: 2, color: "yellow" },
      HIGH: { level: 3, color: "red" },
      CRITICAL: { level: 4, color: "purple" },
    } as const;

    const Priority = TaggedConfigKitFromObject(PRIORITY_CONFIG);

    it("preserves all configs", () => {
      expect(Priority.Configs.LOW.level).toBe(1);
      expect(Priority.Configs.MEDIUM.level).toBe(2);
      expect(Priority.Configs.HIGH.level).toBe(3);
      expect(Priority.Configs.CRITICAL.level).toBe(4);
    });

    it("adds _tag to each config", () => {
      expect(Priority.Configs.LOW._tag).toBe("LOW");
      expect(Priority.Configs.HIGH._tag).toBe("HIGH");
    });
  });

  describe("migration from plain object", () => {
    // This demonstrates the migration pattern from plain objects

    // Old pattern (before TaggedConfigKit)
    const OLD_CONFIG = {
      DRAFT: { status: "pending", editable: true },
      PUBLISHED: { status: "live", editable: false },
      ARCHIVED: { status: "hidden", editable: false },
    } as const;

    // New pattern (with TaggedConfigKit)
    const Status = TaggedConfigKitFromObject(OLD_CONFIG);

    it("maintains backward compatibility for config access", () => {
      // Old access pattern: OLD_CONFIG.DRAFT.status
      // New access pattern: Status.Configs.DRAFT.status
      expect(Status.Configs.DRAFT.status).toBe("pending");
      expect(Status.Configs.DRAFT.editable).toBe(true);
    });

    it("adds new discriminated union capability", () => {
      // New capability: decode/encode for persistence
      const decoded = S.decodeSync(Status)("DRAFT") as typeof Status.Configs.DRAFT;
      expect(decoded._tag).toBe("DRAFT");
      expect(decoded.status).toBe("pending");
    });
  });
});

describe("TaggedConfigKit type guards (is)", () => {
  const LabelColor = TaggedConfigKit(
    ["GRAY", { textColor: "#FFFFFF", backgroundColor: "#202020" }],
    ["GREEN", { textColor: "#D1F0D9", backgroundColor: "#12341D" }],
    ["BLUE", { textColor: "#B3D9FF", backgroundColor: "#0A3D6E" }]
  );

  it("provides is guards for each tag", () => {
    expect(typeof LabelColor.is.GRAY).toBe("function");
    expect(typeof LabelColor.is.GREEN).toBe("function");
    expect(typeof LabelColor.is.BLUE).toBe("function");
  });

  it("correctly identifies matching configs", () => {
    const grayConfig = S.decodeSync(LabelColor)("GRAY");
    expect(LabelColor.is.GRAY(grayConfig)).toBe(true);
    expect(LabelColor.is.GREEN(grayConfig)).toBe(false);
    expect(LabelColor.is.BLUE(grayConfig)).toBe(false);
  });

  it("correctly identifies all config types", () => {
    const greenConfig = S.decodeSync(LabelColor)("GREEN");
    const blueConfig = S.decodeSync(LabelColor)("BLUE");

    expect(LabelColor.is.GREEN(greenConfig)).toBe(true);
    expect(LabelColor.is.BLUE(blueConfig)).toBe(true);
  });

  it("works in conditional narrowing", () => {
    const config = S.decodeSync(LabelColor)("GRAY");

    if (LabelColor.is.GRAY(config)) {
      // Type is narrowed to GRAY config
      expect(config._tag).toBe("GRAY");
      expect(config.textColor).toBe("#FFFFFF");
    } else {
      throw new Error("Expected GRAY config");
    }
  });

  it("can be used with Array.filter for type narrowing", () => {
    const allConfigs = F.pipe(
      LabelColor.Tags,
      A.map((tag) => S.decodeSync(LabelColor)(tag))
    );

    const grayConfigs = F.pipe(allConfigs, A.filter(LabelColor.is.GRAY));

    expect(grayConfigs).toHaveLength(1);
    expect(grayConfigs[0]?._tag).toBe("GRAY");
  });
});

describe("TaggedConfigKit HashMap (ConfigMap)", () => {
  const Priority = TaggedConfigKit(
    ["LOW", { level: 1, urgent: false }],
    ["MEDIUM", { level: 2, urgent: false }],
    ["HIGH", { level: 3, urgent: true }]
  );

  it("provides ConfigMap as Effect HashMap", () => {
    expect(HashMap.isHashMap(Priority.ConfigMap)).toBe(true);
  });

  it("contains all configs keyed by tag", () => {
    const lowResult = HashMap.get(Priority.ConfigMap, "LOW");
    const mediumResult = HashMap.get(Priority.ConfigMap, "MEDIUM");
    const highResult = HashMap.get(Priority.ConfigMap, "HIGH");

    expect(O.isSome(lowResult)).toBe(true);
    expect(O.isSome(mediumResult)).toBe(true);
    expect(O.isSome(highResult)).toBe(true);
  });

  it("returns correct config values", () => {
    const lowOption = HashMap.get(Priority.ConfigMap, "LOW");
    expect(O.isSome(lowOption)).toBe(true);

    const lowConfig = F.pipe(
      lowOption,
      O.getOrElse(() => ({ _tag: "LOW", level: 0, urgent: false }) as const)
    );

    expect(lowConfig).toEqual({
      _tag: "LOW",
      level: 1,
      urgent: false,
    });
  });

  it("returns None for non-existent tags", () => {
    // Type system prevents this at compile time, but runtime check
    const result = HashMap.get(Priority.ConfigMap, "INVALID" as "LOW");
    expect(O.isNone(result)).toBe(true);
  });

  it("has correct size", () => {
    expect(HashMap.size(Priority.ConfigMap)).toBe(3);
  });

  it("supports iteration", () => {
    const tags = F.pipe(Priority.ConfigMap, HashMap.keys, A.fromIterable, A.sort(Order.string));

    expect(tags).toEqual(["HIGH", "LOW", "MEDIUM"]);
  });
});

describe("TaggedConfigKit derive", () => {
  const LabelColor = TaggedConfigKit(
    ["GRAY", { textColor: "#FFFFFF", backgroundColor: "#202020" }],
    ["GREEN", { textColor: "#D1F0D9", backgroundColor: "#12341D" }],
    ["BLUE", { textColor: "#B3D9FF", backgroundColor: "#0A3D6E" }],
    ["YELLOW", { textColor: "#FEF9C3", backgroundColor: "#854D0E" }],
    ["RED", { textColor: "#FEE2E2", backgroundColor: "#991B1B" }]
  );

  it("creates a subset kit with specified tags", () => {
    const PrimaryColors = LabelColor.derive("RED", "GREEN", "BLUE");

    expect(PrimaryColors.Tags).toHaveLength(3);
    // Note: order may change based on filtering, sort for comparison
    const sortedTags = F.pipe([...PrimaryColors.Tags] as string[], A.sort(Order.string));
    expect(sortedTags).toEqual(["BLUE", "GREEN", "RED"]);
  });

  it("derived kit has correct Configs", () => {
    const Warm = LabelColor.derive("RED", "YELLOW");

    expect(Warm.Configs.RED).toEqual({
      _tag: "RED",
      textColor: "#FEE2E2",
      backgroundColor: "#991B1B",
    });
    expect(Warm.Configs.YELLOW).toEqual({
      _tag: "YELLOW",
      textColor: "#FEF9C3",
      backgroundColor: "#854D0E",
    });
  });

  it("derived kit decodes correctly", () => {
    const Cool = LabelColor.derive("BLUE", "GREEN");

    expect(S.decodeSync(Cool)("BLUE")).toEqual({
      _tag: "BLUE",
      textColor: "#B3D9FF",
      backgroundColor: "#0A3D6E",
    });
  });

  it("derived kit rejects excluded tags", () => {
    const Cool = LabelColor.derive("BLUE", "GREEN");

    // RED is not in the derived kit
    expect(() => S.decodeSync(Cool)("RED" as "BLUE")).toThrow();
  });

  it("derived kit has all interface properties", () => {
    const Single = LabelColor.derive("GRAY");

    expect(Single.Configs).toBeDefined();
    expect(Single.Tags).toBeDefined();
    expect(Single.TagsEnum).toBeDefined();
    expect(Single.Entries).toBeDefined();
    expect(Single.is).toBeDefined();
    expect(Single.ConfigMap).toBeDefined();
    expect(Single.derive).toBeDefined();
  });

  it("supports chained derive calls", () => {
    const ThreeColors = LabelColor.derive("RED", "GREEN", "BLUE");
    const TwoColors = ThreeColors.derive("RED", "GREEN");

    expect(TwoColors.Tags).toHaveLength(2);
    expect(() => S.decodeSync(TwoColors)("BLUE" as "RED")).toThrow();
  });
});

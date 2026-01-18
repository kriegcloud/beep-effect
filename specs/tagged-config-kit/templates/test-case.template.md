# Test Case Template: TaggedConfigKit

## Test Structure

```typescript
import { describe, expect, it } from "vitest";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { TaggedConfigKit } from "@beep/schema/derived/kits/tagged-config-kit";

describe("TaggedConfigKit", () => {
  // Define test fixture
  const LabelColor = TaggedConfigKit(
    ["GRAY", { textColor: '#FFFFFF', backgroundColor: '#202020' }],
    ["GREEN", { textColor: '#D1F0D9', backgroundColor: '#12341D' }],
    ["ORANGE", { textColor: '#FDECCE', backgroundColor: '#413111' }],
  );

  describe("decoding", () => {
    it("should decode literal to tagged struct", () => {
      const result = S.decodeSync(LabelColor)("GRAY");
      expect(result).toEqual({
        _tag: "GRAY",
        textColor: '#FFFFFF',
        backgroundColor: '#202020',
      });
    });

    it("should reject invalid literals", () => {
      expect(() => S.decodeSync(LabelColor)("INVALID")).toThrow();
    });
  });

  describe("encoding", () => {
    it("should encode tagged struct to literal", () => {
      const config = {
        _tag: "GREEN" as const,
        textColor: '#D1F0D9',
        backgroundColor: '#12341D',
      };
      const result = S.encodeSync(LabelColor)(config);
      expect(result).toBe("GREEN");
    });
  });

  describe("accessors", () => {
    describe(".Configs", () => {
      it("should provide direct config access", () => {
        expect(LabelColor.Configs.GRAY).toEqual({
          _tag: "GRAY",
          textColor: '#FFFFFF',
          backgroundColor: '#202020',
        });
      });

      it("should be correctly typed", () => {
        // Type assertion test
        const gray: {
          readonly _tag: "GRAY";
          readonly textColor: '#FFFFFF';
          readonly backgroundColor: '#202020';
        } = LabelColor.Configs.GRAY;
        expect(gray._tag).toBe("GRAY");
      });
    });

    describe(".Tags", () => {
      it("should return array of all tags", () => {
        expect(LabelColor.Tags).toEqual(["GRAY", "GREEN", "ORANGE"]);
      });
    });

    describe(".TagsEnum", () => {
      it("should provide enum-like tag access", () => {
        expect(LabelColor.TagsEnum.GRAY).toBe("GRAY");
        expect(LabelColor.TagsEnum.GREEN).toBe("GREEN");
      });
    });
  });

  describe("type inference", () => {
    it("should infer Encoded type correctly", () => {
      type Encoded = typeof LabelColor.Encoded;
      // Should be: "GRAY" | "GREEN" | "ORANGE"
      const valid: Encoded = "GRAY";
      expect(valid).toBe("GRAY");
    });

    it("should infer Type correctly", () => {
      type Decoded = typeof LabelColor.Type;
      // Should be union of tagged structs
      const valid: Decoded = {
        _tag: "GREEN",
        textColor: '#D1F0D9',
        backgroundColor: '#12341D',
      };
      expect(valid._tag).toBe("GREEN");
    });
  });

  describe("edge cases", () => {
    it("should handle single entry", () => {
      const Single = TaggedConfigKit(
        ["ONLY", { value: 42 }],
      );
      expect(S.decodeSync(Single)("ONLY")).toEqual({
        _tag: "ONLY",
        value: 42,
      });
    });

    it("should handle numeric config values", () => {
      const WithNumbers = TaggedConfigKit(
        ["A", { count: 1, enabled: true }],
        ["B", { count: 2, enabled: false }],
      );
      expect(WithNumbers.Configs.A.count).toBe(1);
      expect(WithNumbers.Configs.B.enabled).toBe(false);
    });

    it("should handle empty config (tag only)", () => {
      const TagOnly = TaggedConfigKit(
        ["EMPTY", {}],
      );
      expect(S.decodeSync(TagOnly)("EMPTY")).toEqual({
        _tag: "EMPTY",
      });
    });
  });
});
```

## Checklist

- [ ] Basic decode test
- [ ] Basic encode test
- [ ] Invalid input rejection
- [ ] `.Configs` accessor test
- [ ] `.Tags` array test
- [ ] `.TagsEnum` accessor test
- [ ] Type inference verification
- [ ] Single entry edge case
- [ ] Numeric values test
- [ ] Boolean values test
- [ ] Empty config test
- [ ] Effect-based decode/encode test

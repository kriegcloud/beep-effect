import * as Field from "@beep/form/core/Field";
import { identity, SchemaTransformation } from "effect";
import { describe, expect, it } from "vitest";
import * as S from "../helpers/SchemaCompat.ts";

describe("Field", () => {
  describe("getDefaultFromSchema", () => {
    it("returns defaults for primitive keywords", () => {
      expect(Field.getDefaultFromSchema(S.Number)).toBe(0);
      expect(Field.getDefaultFromSchema(S.Boolean)).toBe(false);
    });

    it("unwraps refinements and transformations", () => {
      const refined = S.Number.check(S.isGreaterThan(1));
      const transformed = S.flip(S.NumberFromString);

      expect(Field.getDefaultFromSchema(refined)).toBe(0);
      expect(Field.getDefaultFromSchema(transformed)).toBe(0);
    });

    it("returns defaults for literals, enums, and unions", () => {
      const literal = S.Literal("pending");
      const enums = S.Enum({ Red: "red", Blue: "blue" });
      const union = S.Literals(["a", "b"]);

      expect(Field.getDefaultFromSchema(literal)).toBe("pending");
      expect(Field.getDefaultFromSchema(enums)).toBe("red");
      expect(Field.getDefaultFromSchema(union)).toBe("a");
    });

    it("returns undefined for empty enums and unions", () => {
      const emptyEnums = S.Enum({});
      const emptyUnion = S.Union([]);

      expect(Field.getDefaultFromSchema(emptyEnums)).toBeUndefined();
      expect(Field.getDefaultFromSchema(emptyUnion)).toBeUndefined();
    });
  });

  describe("getDefaultEncodedValues", () => {
    it("returns empty string for scalar fields", () => {
      const EmailField = Field.makeField("email", S.String);
      const AgeField = Field.makeField("age", S.Number);

      const fields = {
        email: EmailField,
        age: AgeField,
      };

      const defaults = Field.getDefaultEncodedValues(fields);

      expect(defaults).toEqual({ email: "", age: 0 });
    });

    it("returns empty array for array fields", () => {
      const TitleField = Field.makeField("title", S.String);
      const ItemsField = Field.makeArrayField("items", S.Struct({ name: S.String }));

      const fields = {
        title: TitleField,
        items: ItemsField,
      };

      const defaults = Field.getDefaultEncodedValues(fields);

      expect(defaults).toEqual({ title: "", items: [] });
    });
  });

  describe("extractStructFieldDefs", () => {
    it("returns field defs for struct schema", () => {
      const schema = S.Struct({ name: S.String, age: S.Number });
      const defs = Field.extractStructFieldDefs(schema);

      expect(defs).toBeDefined();
      expect(defs).toHaveLength(2);
      expect(defs![0]!.key).toBe("name");
      expect(defs![1]!.key).toBe("age");
    });

    it("unwraps refinements, transformations, and suspends", () => {
      const base = S.Struct({ name: S.String, age: S.Number });
      const refined = base.check(S.makeFilter(() => true));
      const transformed = base.pipe(
        S.decodeTo(
          base,
          SchemaTransformation.transform({
            decode: identity,
            encode: identity,
          })
        )
      );
      const suspended = S.suspend(() => base);

      const refinedDefs = Field.extractStructFieldDefs(refined);
      const transformedDefs = Field.extractStructFieldDefs(transformed);
      const suspendedDefs = Field.extractStructFieldDefs(suspended);

      expect(refinedDefs).toBeDefined();
      expect(refinedDefs).toHaveLength(2);
      expect(refinedDefs![0]!.key).toBe("name");
      expect(refinedDefs![1]!.key).toBe("age");

      expect(transformedDefs).toBeDefined();
      expect(transformedDefs).toHaveLength(2);
      expect(transformedDefs![0]!.key).toBe("name");
      expect(transformedDefs![1]!.key).toBe("age");

      expect(suspendedDefs).toBeDefined();
      expect(suspendedDefs).toHaveLength(2);
      expect(suspendedDefs![0]!.key).toBe("name");
      expect(suspendedDefs![1]!.key).toBe("age");
    });

    it("returns undefined for non-struct schema", () => {
      const defs = Field.extractStructFieldDefs(S.String);
      expect(defs).toBeUndefined();
    });
  });

  describe("type guards", () => {
    it("isFieldDef identifies scalar field definitions", () => {
      const EmailField = Field.makeField("email", S.String);
      const ItemsField = Field.makeArrayField("items", S.Struct({ name: S.String }));

      expect(Field.isFieldDef(EmailField)).toBe(true);
      expect(Field.isFieldDef(ItemsField)).toBe(false);
    });

    it("isArrayFieldDef identifies array field definitions", () => {
      const EmailField = Field.makeField("email", S.String);
      const ItemsField = Field.makeArrayField("items", S.Struct({ name: S.String }));

      expect(Field.isArrayFieldDef(ItemsField)).toBe(true);
      expect(Field.isArrayFieldDef(EmailField)).toBe(false);
    });
  });
});

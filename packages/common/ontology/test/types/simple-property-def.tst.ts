import { describe, expect, it } from "tstyche";
import type { PropertyDef } from "../../src/ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "../../src/ontology/SimplePropertyDef.js";

describe("SimplePropertyDef", () => {
  it("extracts multiplicity correctly", () => {
    expect<SimplePropertyDef.ExtractMultiplicity<Array<"string">>>().type.toBe<"array">();
    expect<SimplePropertyDef.ExtractMultiplicity<Array<"string"> | undefined>>().type.toBe<"array">();
    expect<SimplePropertyDef.ExtractMultiplicity<"string">>().type.toBe<"single">();
    expect<SimplePropertyDef.ExtractMultiplicity<"string" | undefined>>().type.toBe<"single">();
  });

  it("extracts nullable marker correctly", () => {
    expect<SimplePropertyDef.ExtractNullable<Array<"string">>>().type.toBe<"non-nullable">();
    expect<SimplePropertyDef.ExtractNullable<Array<"string"> | undefined>>().type.toBe<"nullable">();
    expect<SimplePropertyDef.ExtractNullable<"string">>().type.toBe<"non-nullable">();
    expect<SimplePropertyDef.ExtractNullable<"string" | undefined>>().type.toBe<"nullable">();
  });

  it("extracts wire property type correctly", () => {
    expect<SimplePropertyDef.ExtractWirePropertyType<Array<"string">>>().type.toBe<"string">();
    expect<SimplePropertyDef.ExtractWirePropertyType<Array<"string"> | undefined>>().type.toBe<"string">();
    expect<SimplePropertyDef.ExtractWirePropertyType<"string">>().type.toBe<"string">();
    expect<SimplePropertyDef.ExtractWirePropertyType<"string" | undefined>>().type.toBe<"string">();
  });

  it("converts from property metadata correctly", () => {
    expect<SimplePropertyDef.FromPropertyMetadata<PropertyDef<"string", "nullable", "array">>>().type.toBe<
      Array<"string"> | undefined
    >();

    expect<SimplePropertyDef.FromPropertyMetadata<PropertyDef<"string", "non-nullable", "array">>>().type.toBe<
      Array<"string">
    >();

    expect<
      SimplePropertyDef.FromPropertyMetadata<PropertyDef<"string", "non-nullable", "single">>
    >().type.toBe<"string">();

    expect<SimplePropertyDef.FromPropertyMetadata<PropertyDef<"string", "nullable", "single">>>().type.toBe<
      "string" | undefined
    >();
  });

  it("maps to runtime property values", () => {
    expect<SimplePropertyDef.ToRuntimeProperty<"string">>().type.toBe<string>();
    expect<SimplePropertyDef.ToRuntimeProperty<"string" | undefined>>().type.toBe<string | undefined>();
  });
});

import * as VariantSchema from "@beep/schema/VariantSchema";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const { Class, Field, FieldExcept, FieldOnly, Struct, Union, extract, fieldEvolve } = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});

const variantTitle = (schema: S.Top): unknown => schema.ast.annotations.title;

const baseFields = {
  id: Field({
    select: S.Number,
    json: S.Number,
  }),
  name: S.String,
  secret: FieldExcept(["json", "jsonCreate", "jsonUpdate"])(S.String),
} as const;

describe("VariantSchema.Class", () => {
  it("accepts raw fields and VariantSchema.Struct inputs", () => {
    class RawModel extends Class<RawModel>("RawModel")(baseFields) {}
    class StructModel extends Class<StructModel>("StructModel")(Struct(baseFields)) {}

    expect(Object.keys(RawModel.select.fields).sort()).toEqual(["id", "name", "secret"]);
    expect(Object.keys(RawModel.json.fields).sort()).toEqual(["id", "name"]);
    expect(Object.keys(StructModel.select.fields).sort()).toEqual(["id", "name", "secret"]);
    expect(Object.keys(StructModel.json.fields).sort()).toEqual(["id", "name"]);
  });

  it("keeps variant statics after raw-field and struct-based extension", () => {
    class BaseModel extends Class<BaseModel>("BaseModel")(baseFields) {}
    class RawChild extends BaseModel.extend<RawChild>("RawChild")({
      childOnly: S.Boolean,
    }) {}
    class StructChild extends BaseModel.extend<StructChild>("StructChild")(
      Struct({
        childOnly: Field({
          select: S.Boolean,
          json: S.Boolean,
        }),
      })
    ) {}

    expect(Object.keys(RawChild.select.fields).sort()).toEqual(["childOnly", "id", "name", "secret"]);
    expect(Object.keys(RawChild.jsonCreate.fields).sort()).toEqual(["childOnly", "name"]);
    expect(Object.keys(StructChild.select.fields).sort()).toEqual(["childOnly", "id", "name", "secret"]);
    expect(Object.keys(StructChild.insert.fields).sort()).toEqual(["name", "secret"]);
    expect(Object.keys(StructChild.json.fields).sort()).toEqual(["childOnly", "id", "name"]);
  });

  it("lets child fields override parent fields by key", () => {
    class BaseModel extends Class<BaseModel>("OverrideBase")({
      name: S.String,
      source: S.String,
    }) {}
    class OverrideChild extends BaseModel.extend<OverrideChild>("OverrideChild")({
      name: S.Number,
    }) {}

    expect(OverrideChild.select.fields.name).toBe(S.Number);
    expect(OverrideChild.insert.fields.name).toBe(S.Number);
    expect(OverrideChild.select.fields.source).toBe(S.String);
  });

  it("preserves inherited custom statics while replacing variant statics", () => {
    class BaseModel extends Class<BaseModel>("StaticBase")(baseFields) {
      static readonly customStatic = "custom-static";
    }
    class StaticChild extends BaseModel.extend<StaticChild, typeof BaseModel>("StaticChild")({
      childOnly: S.Boolean,
    }) {}

    expect(StaticChild.customStatic).toBe("custom-static");
    expect(variantTitle(StaticChild.select)).toBe("StaticChild.select");
    expect(variantTitle(StaticChild.insert)).toBe("StaticChild.insert");
  });

  it("returns variant structs from mapFields that feed Class and extend", () => {
    class BaseModel extends Class<BaseModel>("MapBase")(baseFields) {}

    const mapped = BaseModel.mapFields((fields) => ({
      ...fields,
      mappedOnly: Field({
        select: S.Boolean,
        json: S.Boolean,
      }),
    }));

    class FromMapped extends Class<FromMapped>("FromMapped")(mapped) {}
    class ChildFromMapped extends BaseModel.extend<ChildFromMapped>("ChildFromMapped")(mapped) {}

    expect(VariantSchema.isStruct(mapped)).toBe(true);
    expect(Object.keys(FromMapped.select.fields).sort()).toEqual(["id", "mappedOnly", "name", "secret"]);
    expect(Object.keys(FromMapped.json.fields).sort()).toEqual(["id", "mappedOnly", "name"]);
    expect(Object.keys(ChildFromMapped.select.fields).sort()).toEqual(["id", "mappedOnly", "name", "secret"]);
    expect(Object.keys(ChildFromMapped.jsonCreate.fields).sort()).toEqual(["name"]);
  });

  it("supports helper structs, fields, curried extract, field evolution, and unions", () => {
    const struct = Struct({
      name: S.String,
      jsonOnly: FieldOnly(["json"])(S.Boolean),
    });
    const select = extract("select")(struct);
    const selectAgain = extract(struct, "select");
    const evolved = fieldEvolve(Field({ select: S.String, insert: S.String }), {
      select: (schema) => S.optional(schema),
    });
    const union = Union([
      Struct({ _tag: S.Literal("A"), value: S.String }),
      Struct({ _tag: S.Literal("B"), count: S.Number }),
    ]);

    expect(struct.pipe(VariantSchema.fields)).toBe(struct[VariantSchema.TypeId]);
    expect(Field({ select: S.String }).pipe((field) => field.schemas.select)).toBe(S.String);
    expect(selectAgain).toBe(select);
    expect(Object.keys(select.fields)).toEqual(["name"]);
    expect(S.isSchema(evolved.schemas.select)).toBe(true);
    expect(S.isSchema(union.select)).toBe(true);
    expect(S.isSchema(union.json)).toBe(true);
  });

  it("preserves nested classes on default variant extraction", () => {
    class Nested extends Class<Nested>("Nested")({
      value: S.String,
    }) {}
    class Parent extends Class<Parent>("Parent")({
      nested: Nested,
    }) {}

    expect(Object.keys(Parent.select.fields.nested.fields)).toEqual(["value"]);
    expect(Object.keys(Parent.insert.fields.nested.fields)).toEqual(["value"]);
  });

  it("exposes override helpers", () => {
    const overrideable = VariantSchema.Overrideable(S.String, {
      defaultValue: Effect.succeed("generated"),
    });

    expect(VariantSchema.Override("manual")).toBe("manual");
    expect(S.isSchema(overrideable)).toBe(true);
  });
});

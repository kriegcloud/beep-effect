import { DomainModel } from "@beep/schema/DomainModel";
import * as Model from "@beep/schema/Model";
import * as VariantSchema from "@beep/schema/VariantSchema";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

const { Class, Field, Struct } = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});

const baseFields = {
  id: Field({
    select: S.Number,
    json: S.Number,
  }),
  name: S.String,
} as const;

class BaseModel extends Class<BaseModel>("BaseModel")(baseFields) {
  static readonly customStatic = "custom-static";
}

class RawChild extends BaseModel.extend<RawChild, typeof BaseModel>("RawChild")({
  childOnly: S.Boolean,
}) {}

class StructChild extends BaseModel.extend<StructChild, typeof BaseModel>("StructChild")(
  Struct({
    childOnly: Field({
      select: S.Boolean,
      json: S.Boolean,
    }),
  })
) {}

const mappedFields = BaseModel.mapFields((fields) => ({
  ...fields,
  mappedOnly: S.Boolean,
}));

class FromMapped extends Class<FromMapped>("FromMapped")(mappedFields) {}
class ExtendedFromMapped extends BaseModel.extend<ExtendedFromMapped, typeof BaseModel>("ExtendedFromMapped")(
  mappedFields
) {}

const EntityId = S.String.pipe(S.brand("EntityId"));
class Entity extends DomainModel.extend<Entity, typeof DomainModel>("Entity")({
  id: Model.Generated(EntityId),
}) {}

describe("VariantSchema.Class", () => {
  it("types variant statics on derived classes", () => {
    expect<S.Schema.Type<typeof RawChild.select>>().type.toBe<{
      readonly id: number;
      readonly name: string;
      readonly childOnly: boolean;
    }>();
    expect<S.Schema.Type<typeof StructChild.insert>>().type.toBe<{
      readonly name: string;
    }>();
    expect<S.Schema.Type<typeof StructChild.json>>().type.toBe<{
      readonly id: number;
      readonly name: string;
      readonly childOnly: boolean;
    }>();
  });

  it("preserves inherited custom static members when Static is supplied", () => {
    expect(RawChild.customStatic).type.toBe<"custom-static">();
    expect(StructChild.customStatic).type.toBe<"custom-static">();
  });

  it("types mapFields as a variant struct accepted by Class and extend", () => {
    expect(mappedFields).type.toBe<
      VariantSchema.Struct<{
        readonly id: VariantSchema.Field<{
          readonly select: typeof S.Number;
          readonly json: typeof S.Number;
        }>;
        readonly name: typeof S.String;
        readonly mappedOnly: typeof S.Boolean;
      }>
    >();
    expect<S.Schema.Type<typeof FromMapped.select>["mappedOnly"]>().type.toBe<boolean>();
    expect<S.Schema.Type<typeof ExtendedFromMapped.select>["mappedOnly"]>().type.toBe<boolean>();
  });

  it("types the new DomainModel base as an extendable model without id", () => {
    expect<"id">().type.not.toBeAssignableTo<keyof S.Schema.Type<typeof DomainModel.select>>();
    expect<S.Schema.Type<typeof Entity.select>["id"]>().type.toBe<typeof EntityId.Type>();
    expect<"id">().type.not.toBeAssignableTo<keyof S.Schema.Type<typeof Entity.insert>>();
  });

  it("keeps the missing Self guidance unchanged", () => {
    const MissingSelf = Class("MissingSelf")({
      extraField: S.String,
    });

    expect(MissingSelf).type.toBe<"Missing `Self` generic - use `class Self extends Class<Self>()({ ... })`">();
  });
});

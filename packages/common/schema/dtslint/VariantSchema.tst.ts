import { NonNegativeInt } from "@beep/schema";
import * as Model from "@beep/schema/Model";
import * as VariantSchema from "@beep/schema/VariantSchema";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

const { Class } = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});
export const defaultFields = {
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
  deletedAt: Model.FieldOption(S.DateTimeUtcFromString),
  createdBy: S.String,
  updatedBy: S.String,
  deletedBy: Model.FieldOption(S.String),
  version: Model.Generated(NonNegativeInt),
  source: S.NonEmptyString,
} as const;
const ClassWithDefaults = Model.ClassFactory(defaultFields);

class FactoryModel extends ClassWithDefaults<FactoryModel>("FactoryModel")({
  createdAt: S.String,
  extraField: S.String,
}) {}

class DirectModel extends Class<DirectModel>("DirectModel")({
  ...defaultFields,
  createdAt: S.String,
  extraField: S.String,
}) {}

describe("Model.ClassFactory", () => {
  it("preserves the same static variant schema shape as Class", () => {
    expect<S.Schema.Type<typeof FactoryModel.select>>().type.toBe<S.Schema.Type<typeof DirectModel.select>>();
    expect<S.Schema.Type<typeof FactoryModel.insert>>().type.toBe<S.Schema.Type<typeof DirectModel.insert>>();
    expect<S.Schema.Type<typeof FactoryModel.update>>().type.toBe<S.Schema.Type<typeof DirectModel.update>>();
    expect<S.Schema.Type<typeof FactoryModel.json>>().type.toBe<S.Schema.Type<typeof DirectModel.json>>();
    expect<S.Schema.Type<typeof FactoryModel.jsonCreate>>().type.toBe<S.Schema.Type<typeof DirectModel.jsonCreate>>();
    expect<S.Schema.Type<typeof FactoryModel.jsonUpdate>>().type.toBe<S.Schema.Type<typeof DirectModel.jsonUpdate>>();
  });

  it("merges default fields and lets explicit fields override them in variant types", () => {
    expect<S.Schema.Type<typeof FactoryModel.select>["source"]>().type.toBe<string>();
    expect<S.Schema.Type<typeof FactoryModel.insert>["extraField"]>().type.toBe<string>();
    expect<S.Schema.Type<typeof FactoryModel.update>["createdAt"]>().type.toBe<string>();
    expect<S.Schema.Type<typeof FactoryModel.jsonCreate>["source"]>().type.toBe<string>();
    expect<S.Schema.Type<typeof FactoryModel.jsonUpdate>["extraField"]>().type.toBe<string>();
  });

  it("keeps the missing Self guidance unchanged", () => {
    const MissingSelf = ClassWithDefaults("MissingSelf")({
      extraField: S.String,
    });

    expect(MissingSelf).type.toBe<"Missing `Self` generic - use `class Self extends Class<Self>()({ ... })`">();
  });
});

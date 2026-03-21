import { NonNegativeInt } from "@beep/schema";
import * as Model from "@beep/schema/Model";
import * as VariantSchema from "@beep/schema/VariantSchema";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const { Class, ClassFactory } = VariantSchema.make({
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
const ClassWithDefaults = ClassFactory(defaultFields);

const mergedFields = {
  ...defaultFields,
  createdAt: S.String,
  extraField: S.String,
} as const;

class FactoryModel extends ClassWithDefaults<FactoryModel>("FactoryModel")({
  createdAt: S.String,
  extraField: S.String,
}) {}

class DirectModel extends Class<DirectModel>("DirectModel")(mergedFields) {}

const variantSchemas = [
  [FactoryModel.select, DirectModel.select],
  [FactoryModel.insert, DirectModel.insert],
  [FactoryModel.update, DirectModel.update],
  [FactoryModel.json, DirectModel.json],
  [FactoryModel.jsonCreate, DirectModel.jsonCreate],
  [FactoryModel.jsonUpdate, DirectModel.jsonUpdate],
] as const;

describe("VariantSchema.ClassFactory", () => {
  it("merges default fields and lets explicit fields win", () => {
    const rawFields = FactoryModel[VariantSchema.TypeId];

    expect(Object.keys(rawFields).sort()).toEqual(Object.keys(mergedFields).sort());
    expect(rawFields.createdAt).toBe(S.String);
    expect(rawFields.extraField).toBe(S.String);
    expect(rawFields.updatedAt).toBe(defaultFields.updatedAt);
    expect(rawFields.source).toBe(defaultFields.source);
  });

  it("matches Class with explicitly merged fields for every variant schema", () => {
    for (const [factorySchema, directSchema] of variantSchemas) {
      expect(Object.keys(factorySchema.fields).sort()).toEqual(Object.keys(directSchema.fields).sort());
      expect(factorySchema.fields.createdAt).toBe(directSchema.fields.createdAt);
      expect(factorySchema.fields.extraField).toBe(directSchema.fields.extraField);
      expect(factorySchema.fields.source).toBe(directSchema.fields.source);
    }
  });
});

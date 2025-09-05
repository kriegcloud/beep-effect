import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

const structureFactory = new CategoryFactory({
  category: "structure",
  description: "object structure operators",
  fields: {
    field: BS.JsonPath,
  },
});
const common = {
  fields: {
    field: BS.JsonPath,
    value: BS.Json,
  },
  requiresValue: true,
  isNegatable: true,
} as const;
export const HasKey = structureFactory.createKind({
  operator: "has_key",
  symbol: "∋ key",
  description: "Checks if the field value has the key",
  ...common,
  fields: {
    ...common.fields,
    deep: BS.BoolWithDefault(false),
  },
});

export const NotHasKey = structureFactory.createKind({
  operator: "not_has_key",
  symbol: "∉ key",
  description: "Checks if the field value does not have the key",
  ...common,
  fields: {
    ...common.fields,
    deep: BS.BoolWithDefault(false),
  },
});

export const HasEveryKey = structureFactory.createKind({
  operator: "has_every_key",
  symbol: "∋ all(keys)",
  description: "Checks if the field value has every key",
  ...common,
});

export const HasAnyKey = structureFactory.createKind({
  operator: "has_any_key",
  symbol: "∋ any(key)",
  description: "Checks if the field value has any key",
  ...common,
});

export const HasPath = structureFactory.createKind({
  operator: "has_path",
  symbol: "∋ path",
  description: "Checks if the field value has the path",
  ...common,
});

export const NotHasPath = structureFactory.createKind({
  operator: "not_has_path",
  symbol: "∉ path",
  description: "Checks if the field value does not have the path",
  ...common,
});

import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

export const Factory = new CategoryFactory({
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
export const HasKey = Factory.createKind({
  operator: "has_key",
  symbol: "∋ key",
  description: "Checks if the field value has the key",
  ...common,
  fields: {
    ...common.fields,
    deep: BS.BoolWithDefault(false),
  },
});

export const NotHasKey = Factory.createKind({
  operator: "not_has_key",
  symbol: "∉ key",
  description: "Checks if the field value does not have the key",
  ...common,
  fields: {
    ...common.fields,
    deep: BS.BoolWithDefault(false),
  },
});

export const HasEveryKey = Factory.createKind({
  operator: "has_every_key",
  symbol: "∋ all(keys)",
  description: "Checks if the field value has every key",
  ...common,
});

export const HasAnyKey = Factory.createKind({
  operator: "has_any_key",
  symbol: "∋ any(key)",
  description: "Checks if the field value has any key",
  ...common,
});

export const HasPath = Factory.createKind({
  operator: "has_path",
  symbol: "∋ path",
  description: "Checks if the field value has the path",
  ...common,
});

export const NotHasPath = Factory.createKind({
  operator: "not_has_path",
  symbol: "∉ path",
  description: "Checks if the field value does not have the path",
  ...common,
});

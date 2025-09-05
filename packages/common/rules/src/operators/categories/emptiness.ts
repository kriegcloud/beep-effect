import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

const emptinessFactory = new CategoryFactory({
  category: "emptiness",
  description: "emptiness operators",
  fields: {
    field: BS.JsonPath,
  },
});

const common = {
  isNegatable: true,
  requiresValue: false,
  fields: {
    field: BS.JsonPath,
  },
} as const;

export const IsEmpty = emptinessFactory.createKind({
  operator: "is_empty",
  symbol: "∅",
  description: "Checks if the field value is empty",
  ...common,
});

export const IsNotEmpty = emptinessFactory.createKind({
  operator: "is_not_empty",
  symbol: "¬∅",
  description: "Checks if the field value is not empty",
  ...common,
});

export const IsBlank = emptinessFactory.createKind({
  operator: "is_blank",
  symbol: `""(trim)`,
  description: "Checks if the field value is blank",
  requiresValue: false,
  isNegatable: true,
  fields: common.fields,
});

export const IsNotBlank = emptinessFactory.createKind({
  operator: "is_not_blank",
  symbol: `¬""(trim)`,
  description: "Checks if the field value is not blank",
  requiresValue: false,
  isNegatable: true,
  fields: common.fields,
});

export const IsNullishOrEmpty = emptinessFactory.createKind({
  operator: "is_nullish_or_empty",
  symbol: "null|undef|∅",
  description: "Checks if the field value is null, undefined, or empty",
  requiresValue: false,
  isNegatable: true,
  fields: common.fields,
});

export const IsPresent = emptinessFactory.createKind({
  operator: "is_present",
  symbol: "¬(null|undef|∅)",
  description: "Checks if the field value is not null, undefined, or empty",
  requiresValue: false,
  isNegatable: true,
  fields: common.fields,
});

export const IsEmptyDeep = emptinessFactory.createKind({
  operator: "is_empty_deep",
  symbol: "∅(deep)",
  description: "Checks if the field value is deeply empty",
  requiresValue: false,
  isNegatable: true,
  fields: common.fields,
});

export const IsNotEmptyDeep = emptinessFactory.createKind({
  operator: "is_not_empty_deep",
  symbol: "¬∅(deep)",
  description: "Checks if the field value is not deeply empty",
  requiresValue: false,
  isNegatable: true,
  fields: common.fields,
});

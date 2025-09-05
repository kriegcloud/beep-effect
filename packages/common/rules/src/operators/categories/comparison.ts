import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

const comparisonFactory = new CategoryFactory({
  category: "comparison",
  description: "Comparison operators",
  fields: {
    field: BS.JsonPath,
  },
});

const common = {
  fields: {},
  isNegatable: true,
  requiresValue: true,
} as const;

export const Equals = comparisonFactory.createKind({
  operator: "equals",
  symbol: "===",
  description: "Checks if the field value equals the constraint value",
  ...common,
});

export const NotEquals = comparisonFactory.createKind({
  operator: "not_equals",
  symbol: "!==",
  description: "Checks if the field value does not equal the constraint value",
  ...common,
});

export const GreaterThan = comparisonFactory.createKind({
  operator: "greater_than",
  symbol: ">",
  description: "Checks if the field value is greater than the constraint value",
  ...common,
});

export const GreaterThanOrEqual = comparisonFactory.createKind({
  operator: "greater_than_or_equal_to",
  symbol: ">=",
  description: "Checks if the field value is greater than or equal to the constraint value",
  ...common,
});

export const LessThan = comparisonFactory.createKind({
  operator: "less_than",
  symbol: "<",
  description: "Checks if the field value is less than the constraint value",
  ...common,
});

export const LessThanOrEqual = comparisonFactory.createKind({
  operator: "less_than_or_equal_to",
  symbol: "<=",
  description: "Checks if the field value is less than or equal to the constraint value",
  ...common,
});

export const Between = comparisonFactory.createKind({
  operator: "between",
  symbol: `x ∈ [a, b]`,
  description: "Checks if the field value is between the constraint values",
  ...common,
});

export const NotBetween = comparisonFactory.createKind({
  operator: "not_between",
  symbol: `x ∉ [a, b]`,
  description: "Checks if the field value is not between the constraint values",
  ...common,
});

import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

export const Factory = new CategoryFactory({
  category: "type",
  description: "type operators",
  fields: {
    field: BS.JsonPath,
  },
});

const common = {
  fields: {},
  isNegatable: false,
  requiresValue: false,
};

export const IsString = Factory.createKind({
  operator: "is_string",
  description: "Checks if the field value is a string",
  symbol: "∈ String",
  ...common,
});

export const IsNotString = Factory.createKind({
  operator: "is_not_string",
  description: "Checks if the field value is not a string",
  symbol: "∉ String",
  ...common,
});

export const IsTrue = Factory.createKind({
  operator: "is_true",
  description: "Checks if the field value is true",
  symbol: "≡ true",
  ...common,
});

export const IsFalse = Factory.createKind({
  operator: "is_false",
  description: "Checks if the field value is false",
  symbol: "≡ false",
  ...common,
});

export const IsNumber = Factory.createKind({
  operator: "is_number",
  description: "Checks if the field value is a number",
  symbol: "∈ Number",
  ...common,
});

export const IsNotNumber = Factory.createKind({
  operator: "is_not_number",
  description: "Checks if the field value is not a number",
  symbol: "∉ Number",
  ...common,
});

export const IsTruthy = Factory.createKind({
  operator: "is_truthy",
  description: "Checks if the field value is truthy",
  symbol: "¬truthy",
  ...common,
});

export const IsNotTruthy = Factory.createKind({
  operator: "is_not_truthy",
  description: "Checks if the field value is not truthy",
  symbol: "¬truthy",
  ...common,
});

export const IsFalsy = Factory.createKind({
  operator: "is_falsy",
  description: "Checks if the field value is falsy",
  symbol: "¬falsy",
  ...common,
});

export const IsNotFalsy = Factory.createKind({
  operator: "is_not_falsy",
  description: "Checks if the field value is not falsy",
  symbol: "¬falsy",
  ...common,
});

export const IsNull = Factory.createKind({
  operator: "is_null",
  description: "Checks if the field value is null",
  symbol: "≡ null",
  ...common,
});

export const IsNotNull = Factory.createKind({
  operator: "is_not_null",
  description: "Checks if the field value is not null",
  symbol: "≠ null",
  ...common,
});

export const IsUndefined = Factory.createKind({
  operator: "is_undefined",
  description: "Checks if the field value is undefined",
  symbol: "≡ undefined",
  ...common,
});

export const IsDefined = Factory.createKind({
  operator: "is_defined",
  description: "Checks if the field value is defined",
  symbol: "≠ undefined",
  ...common,
});

export const IsBoolean = Factory.createKind({
  operator: "is_boolean",
  description: "Checks if the field value is a boolean",
  symbol: "∈ Boolean",
  ...common,
});

export const IsNotBoolean = Factory.createKind({
  operator: "is_not_boolean",
  description: "Checks if the field value is not a boolean",
  symbol: "∉ Boolean",
  ...common,
});

export const IsArray = Factory.createKind({
  operator: "is_array",
  description: "Checks if the field value is an array",
  symbol: "∈ Array",
  ...common,
});

export const IsNotArray = Factory.createKind({
  operator: "is_not_array",
  description: "Checks if the field value is not an array",
  symbol: "∉ Array",
  ...common,
});

export const IsObject = Factory.createKind({
  operator: "is_object",
  description: "Checks if the field value is an object",
  symbol: "∈ Object",
  ...common,
});

export const IsNotObject = Factory.createKind({
  operator: "is_not_object",
  description: "Checks if the field value is not an object",
  symbol: "∉ Object",
  ...common,
});

export const IsNullish = Factory.createKind({
  operator: "is_nullish",
  description: "Checks if the field value is null or undefined",
  symbol: "≡ null | undefined",
  ...common,
});

export const IsNotNullish = Factory.createKind({
  operator: "is_not_nullish",
  description: "Checks if the field value is not null or undefined",
  symbol: "≠ null | undefined",
  ...common,
});

export const IsInteger = Factory.createKind({
  operator: "is_integer",
  description: "Checks if the field value is an integer",
  symbol: "∈ ℤ",
  ...common,
});

export const IsNotInteger = Factory.createKind({
  operator: "is_not_integer",
  description: "Checks if the field value is not an integer",
  symbol: "∉ ℤ",
  ...common,
});

export const IsFinite = Factory.createKind({
  operator: "is_finite",
  description: "Checks if the field value is finite",
  symbol: "finite",
  ...common,
});

export const IsNotFinite = Factory.createKind({
  operator: "is_not_finite",
  description: "Checks if the field value is not finite",
  symbol: "¬finite",
  ...common,
});

export const IsNaN = Factory.createKind({
  operator: "is_nan",
  description: "Checks if the field value is NaN",
  symbol: "NaN",
  ...common,
});

export const IsNotNaN = Factory.createKind({
  operator: "is_not_nan",
  description: "Checks if the field value is not NaN",
  symbol: "¬NaN",
  ...common,
});

export const IsEven = Factory.createKind({
  operator: "is_even",
  description: "Checks if the field value is even",
  symbol: "≡ 0 (mod 2)",
  ...common,
});

export const IsOdd = Factory.createKind({
  operator: "is_odd",
  description: "Checks if the field value is odd",
  symbol: "≡ 1 (mod 2)",
  ...common,
});

export const IsPositive = Factory.createKind({
  operator: "is_positive",
  description: "Checks if the field value is positive",
  symbol: "> 0",
  ...common,
});

export const IsNonPositive = Factory.createKind({
  operator: "is_non_positive",
  description: "Checks if the field value is non-positive",
  symbol: "≤ 0",
  ...common,
});

export const IsNegative = Factory.createKind({
  operator: "is_negative",
  description: "Checks if the field value is negative",
  symbol: "< 0",
  ...common,
});

export const IsNonNegative = Factory.createKind({
  operator: "is_non_negative",
  description: "Checks if the field value is non-negative",
  symbol: "≥ 0",
  ...common,
});

import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

const typeFactory = new CategoryFactory({
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

export const IsString = typeFactory.createKind({
  operator: "is_string",
  description: "Checks if the field value is a string",
  symbol: "∈ String",
  ...common,
});

export const IsNotString = typeFactory.createKind({
  operator: "is_not_string",
  description: "Checks if the field value is not a string",
  symbol: "∉ String",
  ...common,
});

export const IsTrue = typeFactory.createKind({
  operator: "is_true",
  description: "Checks if the field value is true",
  symbol: "≡ true",
  ...common,
});

export const IsFalse = typeFactory.createKind({
  operator: "is_false",
  description: "Checks if the field value is false",
  symbol: "≡ false",
  ...common,
});

export const IsNumber = typeFactory.createKind({
  operator: "is_number",
  description: "Checks if the field value is a number",
  symbol: "∈ Number",
  ...common,
});

export const IsNotNumber = typeFactory.createKind({
  operator: "is_not_number",
  description: "Checks if the field value is not a number",
  symbol: "∉ Number",
  ...common,
});

export const IsTruthy = typeFactory.createKind({
  operator: "is_truthy",
  description: "Checks if the field value is truthy",
  symbol: "¬truthy",
  ...common,
});

export const IsNotTruthy = typeFactory.createKind({
  operator: "is_not_truthy",
  description: "Checks if the field value is not truthy",
  symbol: "¬truthy",
  ...common,
});

export const IsFalsy = typeFactory.createKind({
  operator: "is_falsy",
  description: "Checks if the field value is falsy",
  symbol: "¬falsy",
  ...common,
});

export const IsNotFalsy = typeFactory.createKind({
  operator: "is_not_falsy",
  description: "Checks if the field value is not falsy",
  symbol: "¬falsy",
  ...common,
});

export const IsNull = typeFactory.createKind({
  operator: "is_null",
  description: "Checks if the field value is null",
  symbol: "≡ null",
  ...common,
});

export const IsNotNull = typeFactory.createKind({
  operator: "is_not_null",
  description: "Checks if the field value is not null",
  symbol: "≠ null",
  ...common,
});

export const IsUndefined = typeFactory.createKind({
  operator: "is_undefined",
  description: "Checks if the field value is undefined",
  symbol: "≡ undefined",
  ...common,
});

export const IsDefined = typeFactory.createKind({
  operator: "is_defined",
  description: "Checks if the field value is defined",
  symbol: "≠ undefined",
  ...common,
});

export const IsBoolean = typeFactory.createKind({
  operator: "is_boolean",
  description: "Checks if the field value is a boolean",
  symbol: "∈ Boolean",
  ...common,
});

export const IsNotBoolean = typeFactory.createKind({
  operator: "is_not_boolean",
  description: "Checks if the field value is not a boolean",
  symbol: "∉ Boolean",
  ...common,
});

export const IsArray = typeFactory.createKind({
  operator: "is_array",
  description: "Checks if the field value is an array",
  symbol: "∈ Array",
  ...common,
});

export const IsNotArray = typeFactory.createKind({
  operator: "is_not_array",
  description: "Checks if the field value is not an array",
  symbol: "∉ Array",
  ...common,
});

export const IsObject = typeFactory.createKind({
  operator: "is_object",
  description: "Checks if the field value is an object",
  symbol: "∈ Object",
  ...common,
});

export const IsNotObject = typeFactory.createKind({
  operator: "is_not_object",
  description: "Checks if the field value is not an object",
  symbol: "∉ Object",
  ...common,
});

export const IsNullish = typeFactory.createKind({
  operator: "is_nullish",
  description: "Checks if the field value is null or undefined",
  symbol: "≡ null | undefined",
  ...common,
});

export const IsNotNullish = typeFactory.createKind({
  operator: "is_not_nullish",
  description: "Checks if the field value is not null or undefined",
  symbol: "≠ null | undefined",
  ...common,
});

export const IsInteger = typeFactory.createKind({
  operator: "is_integer",
  description: "Checks if the field value is an integer",
  symbol: "∈ ℤ",
  ...common,
});

export const IsNotInteger = typeFactory.createKind({
  operator: "is_not_integer",
  description: "Checks if the field value is not an integer",
  symbol: "∉ ℤ",
  ...common,
});

export const IsFinite = typeFactory.createKind({
  operator: "is_finite",
  description: "Checks if the field value is finite",
  symbol: "finite",
  ...common,
});

export const IsNotFinite = typeFactory.createKind({
  operator: "is_not_finite",
  description: "Checks if the field value is not finite",
  symbol: "¬finite",
  ...common,
});

export const IsNaN = typeFactory.createKind({
  operator: "is_nan",
  description: "Checks if the field value is NaN",
  symbol: "NaN",
  ...common,
});

export const IsNotNaN = typeFactory.createKind({
  operator: "is_not_nan",
  description: "Checks if the field value is not NaN",
  symbol: "¬NaN",
  ...common,
});

export const IsEven = typeFactory.createKind({
  operator: "is_even",
  description: "Checks if the field value is even",
  symbol: "≡ 0 (mod 2)",
  ...common,
});

export const IsOdd = typeFactory.createKind({
  operator: "is_odd",
  description: "Checks if the field value is odd",
  symbol: "≡ 1 (mod 2)",
  ...common,
});

export const IsPositive = typeFactory.createKind({
  operator: "is_positive",
  description: "Checks if the field value is positive",
  symbol: "> 0",
  ...common,
});

export const IsNonPositive = typeFactory.createKind({
  operator: "is_non_positive",
  description: "Checks if the field value is non-positive",
  symbol: "≤ 0",
  ...common,
});

export const IsNegative = typeFactory.createKind({
  operator: "is_negative",
  description: "Checks if the field value is negative",
  symbol: "< 0",
  ...common,
});

export const IsNonNegative = typeFactory.createKind({
  operator: "is_non_negative",
  description: "Checks if the field value is non-negative",
  symbol: "≥ 0",
  ...common,
});

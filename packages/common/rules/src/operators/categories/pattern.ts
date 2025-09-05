import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const patternFactory = new CategoryFactory({
  category: "pattern",
  description: "pattern operators",
  fields: {
    field: BS.JsonPath,
  },
});

const common = {
  isNegatable: true,
  requiresValue: true,
};

export const StartsWith = patternFactory.createKind({
  operator: "starts_with",
  symbol: "prefix⋯",
  description: "Checks if the field value starts with the constraint value",
  ...common,
  fields: {
    value: S.String,
    ignoreCase: BS.BoolWithDefault(false),
  },
});

export const NotStartsWith = patternFactory.createKind({
  operator: "not_starts_with",
  symbol: "¬prefix⋯",
  description: "Checks if the field value does not start with the constraint value",
  ...common,
  fields: {
    value: S.String,
    ignoreCase: BS.BoolWithDefault(false),
  },
});

export const EndsWith = patternFactory.createKind({
  operator: "ends_with",
  symbol: "⋯suffix",
  description: "Checks if the field value ends with the constraint value",
  ...common,
  fields: {
    value: S.String,
    ignoreCase: BS.BoolWithDefault(false),
  },
});

export const NotEndsWith = patternFactory.createKind({
  operator: "not_ends_with",
  symbol: "⋯¬suffix",
  description: "Checks if the field value does not end with the constraint value",
  ...common,
  fields: {
    value: S.String,
    ignoreCase: BS.BoolWithDefault(false),
  },
});

export const Contains = patternFactory.createKind({
  operator: "contains",
  symbol: "∋",
  description: "Checks if the field value contains the constraint value",
  ...common,
  fields: {
    value: S.String,
    ignoreCase: BS.BoolWithDefault(false),
  },
});

export const NotContains = patternFactory.createKind({
  operator: "not_contains",
  symbol: "∌",
  description: "Checks if the field value does not contain the constraint value",
  ...common,
  fields: {
    value: S.String,
    ignoreCase: BS.BoolWithDefault(false),
  },
});

export const Matches = patternFactory.createKind({
  operator: "matches",
  symbol: "~",
  description: "Check if the field value matches the constraint regular expression",
  ...common,
  fields: {
    regex: BS.RegexFromString,
  },
});

export const NotMatches = patternFactory.createKind({
  operator: "not_matches",
  symbol: "¬~",
  description: "Check if the field value does not match the constraint regular expression",
  ...common,
  fields: {
    regex: BS.RegexFromString,
  },
});

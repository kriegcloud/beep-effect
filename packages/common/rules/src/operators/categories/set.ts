import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

export const Factory = new CategoryFactory({
  category: "set",
  description: "set operators",
  fields: {
    field: BS.JsonPath,
  },
});

const common = {
  isNegatable: true,
  requiresValue: true,
  fields: {},
} as const;

export const InSet = Factory.createKind({
  operator: "in_set",
  symbol: "∈",
  description: "Checks if the field value is in the set",
  ...common,
});

export const NotInSet = Factory.createKind({
  operator: "not_in_set",
  symbol: "∉",
  description: "Checks if the field value is not in the set",
  ...common,
});

export const In = Factory.createKind({
  operator: "in",
  symbol: "∈",
  description: "Checks if the field value is in the set",
  ...common,
});

export const NotIn = Factory.createKind({
  operator: "not_in",
  symbol: "∉",
  description: "Checks if the field value is not in the set",
  ...common,
});

export const SubSetOf = Factory.createKind({
  operator: "subset_of",
  symbol: "⊆",
  description: "Checks if the field value is a subset of the set",
  ...common,
});

export const NotSubsetOf = Factory.createKind({
  operator: "not_subset_of",
  symbol: "∉",
  description: "Checks if the field value is not a subset of the set",
  ...common,
});

export const SupersetOf = Factory.createKind({
  operator: "superset_of",
  symbol: "⊇",
  description: "Checks if the field value is a superset of the set",
  ...common,
});

export const NotSupersetOf = Factory.createKind({
  operator: "not_superset_of",
  symbol: "⊅",
  description: "Checks if the field value is not a superset of the set",
  ...common,
});

export const Overlaps = Factory.createKind({
  operator: "overlaps",
  symbol: "∩ ≠ ∅",
  description: "Checks if the field value overlaps the set",
  ...common,
});

export const DisjointWith = Factory.createKind({
  operator: "disjoint_with",
  symbol: "∩ = ∅",
  description: "Checks if the field value is disjoint with the set",
  ...common,
});

export const OneOf = Factory.createKind({
  operator: "one_of",
  symbol: "∈",
  description: "Checks if the field value is one of the set",
  ...common,
});

export const AllOf = Factory.createKind({
  operator: "all_of",
  symbol: "⊆",
  description: "Checks if the field value is a subset of the set",
  ...common,
});

export const NoneOf = Factory.createKind({
  operator: "none_of",
  symbol: "∩ = ∅",
  description: "Checks if the field value is none of the set",
  ...common,
});

export const ContainsAny = Factory.createKind({
  operator: "contains_any",
  symbol: "∩ ≠ ∅",
  description: "Checks if the field value contains any of the set",
  ...common,
});

export const ContainsAll = Factory.createKind({
  operator: "contains_all",
  symbol: "⊇",
  description: "Checks if the field value contains all of the set",
  ...common,
});

export const ContainsNone = Factory.createKind({
  operator: "contains_none",
  symbol: "∩ = ∅",
  description: "Checks if the field value contains none of the set",
  ...common,
});

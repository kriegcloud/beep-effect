import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";

const setFactory = new CategoryFactory({
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

export const InSet = setFactory.createKind({
  operator: "in_set",
  symbol: "∈",
  description: "Checks if the field value is in the set",
  ...common,
});

export const NotInSet = setFactory.createKind({
  operator: "not_in_set",
  symbol: "∉",
  description: "Checks if the field value is not in the set",
  ...common,
});

export const In = setFactory.createKind({
  operator: "in",
  symbol: "∈",
  description: "Checks if the field value is in the set",
  ...common,
});

export const NotIn = setFactory.createKind({
  operator: "not_in",
  symbol: "∉",
  description: "Checks if the field value is not in the set",
  ...common,
});

export const SubSetOf = setFactory.createKind({
  operator: "subset_of",
  symbol: "⊆",
  description: "Checks if the field value is a subset of the set",
  ...common,
});

export const NotSubsetOf = setFactory.createKind({
  operator: "not_subset_of",
  symbol: "∉",
  description: "Checks if the field value is not a subset of the set",
  ...common,
});

export const SupersetOf = setFactory.createKind({
  operator: "superset_of",
  symbol: "⊇",
  description: "Checks if the field value is a superset of the set",
  ...common,
});

export const NotSupersetOf = setFactory.createKind({
  operator: "not_superset_of",
  symbol: "⊅",
  description: "Checks if the field value is not a superset of the set",
  ...common,
});

export const Overlaps = setFactory.createKind({
  operator: "overlaps",
  symbol: "∩ ≠ ∅",
  description: "Checks if the field value overlaps the set",
  ...common,
});

export const DisjointWith = setFactory.createKind({
  operator: "disjoint_with",
  symbol: "∩ = ∅",
  description: "Checks if the field value is disjoint with the set",
  ...common,
});

export const OneOf = setFactory.createKind({
  operator: "one_of",
  symbol: "∈",
  description: "Checks if the field value is one of the set",
  ...common,
});

export const AllOf = setFactory.createKind({
  operator: "all_of",
  symbol: "⊆",
  description: "Checks if the field value is a subset of the set",
  ...common,
});

export const NoneOf = setFactory.createKind({
  operator: "none_of",
  symbol: "∩ = ∅",
  description: "Checks if the field value is none of the set",
  ...common,
});

export const ContainsAny = setFactory.createKind({
  operator: "contains_any",
  symbol: "∩ ≠ ∅",
  description: "Checks if the field value contains any of the set",
  ...common,
});

export const ContainsAll = setFactory.createKind({
  operator: "contains_all",
  symbol: "⊇",
  description: "Checks if the field value contains all of the set",
  ...common,
});

export const ContainsNone = setFactory.createKind({
  operator: "contains_none",
  symbol: "∩ = ∅",
  description: "Checks if the field value contains none of the set",
  ...common,
});

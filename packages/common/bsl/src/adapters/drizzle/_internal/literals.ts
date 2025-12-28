import { $BslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $BslId.create("adapters/drizzle/_internal/makeFilter");

export class FilterLiteral extends BS.StringLiteralKit(
  "eq",
  "ne",
  "and",
  "or",
  "not",
  "gt",
  "gte",
  "lt",
  "lte",
  "inArray",
  "notInArray",
  "isNull",
  "isNotNull",
  "exists",
  "notExists",
  "between",
  "notBetween",
  "like",
  "notLike",
  "ilike",
  "notIlike",
  "arrayContains",
  "arrayContained",
  "arrayOverlaps"
).annotations($I.annotations("FilterLiteral")) {}

export declare namespace FilterLiteral {
  export type Type = typeof FilterLiteral.Type;
}

export const drizzleFilterCategories = {
  // Logical/Boolean connectives - combine or negate boolean expressions
  logical: FilterLiteral.pickOptions("and", "or", "not"),

  // Comparison/Relational operators - compare two scalar values
  comparison: FilterLiteral.pickOptions("eq", "ne", "gt", "gte", "lt", "lte"),

  // Null predicates - special handling for NULL (can't use = or <>)
  nullPredicate: FilterLiteral.pickOptions("isNull", "isNotNull"),

  // Membership predicates - test set membership
  membership: FilterLiteral.pickOptions("inArray", "notInArray"),
  // Range predicates - test if value falls within bounds
  range: FilterLiteral.pickOptions("between", "notBetween"),

  // Pattern matching predicates - string pattern matching with wildcards
  patternMatching: FilterLiteral.pickOptions("like", "notLike", "ilike", "notIlike"),

  // Subquery predicates - test properties of subquery results
  subquery: FilterLiteral.pickOptions("exists", "notExists"),

  // Array operators (PostgreSQL-specific) - array containment/overlap
  array: FilterLiteral.pickOptions("arrayContains", "arrayContained", "arrayOverlaps"),
} as const;

// By Arity (number of operands)

export const drizzleFiltersByArity = {
  // Unary - operate on a single expression
  unary: FilterLiteral.pickOptions("not", "isNull", "isNotNull", "exists", "notExists"),

  // Binary - operate on two expressions
  binary: FilterLiteral.pickOptions(
    "eq",
    "ne",
    "gt",
    "gte",
    "lt",
    "lte",
    "like",
    "notLike",
    "ilike",
    "notIlike",
    "inArray",
    "notInArray",
    "arrayContains",
    "arrayContained",
    "arrayOverlaps"
  ),

  // Ternary - operate on three expressions
  ternary: FilterLiteral.pickOptions("between", "notBetween"),

  // Variadic - accept any number of expressions
  variadic: FilterLiteral.pickOptions("and", "or"),
  // Range predicates - test if value falls within bounds
  range: FilterLiteral.pickOptions("between", "notBetween"),

  // Pattern matching predicates - string pattern matching with wildcards
  patternMatching: FilterLiteral.pickOptions("like", "notLike", "ilike", "notIlike"),

  // Subquery predicates - test properties of subquery results
  subquery: FilterLiteral.pickOptions("exists", "notExists"),

  // Array operators (PostgreSQL-specific) - array containment/overlap
  array: FilterLiteral.pickOptions("arrayContains", "arrayContained", "arrayOverlaps"),
} as const;

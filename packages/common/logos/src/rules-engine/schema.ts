import * as S from "effect/Schema";
import { StringTypes } from "../../../types/src";

export const LogosEntityId = S.UUID.annotations({
  identifier: "LogosEntityId",
  title: "Logos Entity Id",
  description: "A unique identifier for a Logos entity",
});
export type LogosEntityId = typeof LogosEntityId.Type;

export namespace Tag {
  export type Type<Tag extends StringTypes.NonEmptyString<string>> = {
    _tag: Tag;
  };
}

export type Combinator = "and" | "or";

export const Combinator = S.Literal("and", "or").annotations({
  identifier: "Combinator",
  title: "Combinator",
  description: "The Union of all possible combinator objects. `and`, `or`",
});

export const BaseRule = S.Struct({
  entity: S.Literal("rule"),
  id: LogosEntityId,
  parentId: LogosEntityId,
}).pipe(S.mutable);

export type BaseRule = {
  entity: "rule";
  id: LogosEntityId;
  parentId: LogosEntityId;
};

export const BaseStringRule = S.TaggedStruct("string", {
  field: S.String,
  operator: S.Literal(
    "is_equal_to",
    "is_not_equal_to",
    "contains",
    "does_not_contain",
    "starts_with",
    "does_not_start_with",
    "ends_with",
    "does_not_end_with",
  ),
  value: S.String,
  ignoreCase: S.Boolean,
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseStringRule",
    title: "Base String Rule",
    description:
      "The `BaseStringRule` object. Used as the input for a new StringRule",
  });
export type BaseStringRule = typeof BaseStringRule.Type;

export const StringRule = S.extend(BaseRule, BaseStringRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "StringRule",
    title: "String Rule",
    description:
      "The `StringRule` object. Used to perform string operations on values",
  });

export type StringRule = BaseRule & {
  _tag: "string";
  field: string;
  operator:
    | "is_equal_to"
    | "is_not_equal_to"
    | "contains"
    | "does_not_contain"
    | "starts_with"
    | "does_not_start_with"
    | "ends_with"
    | "does_not_end_with";
  value: string;
  ignoreCase: boolean;
};

export const BaseNumberRule = S.TaggedStruct("number", {
  field: S.String,
  operator: S.Literal(
    "is_equal_to",
    "is_not_equal_to",
    "is_greater_than",
    "is_greater_than_or_equal_to",
    "is_less_than",
    "is_less_than_or_equal_to",
  ),
  value: S.Number,
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseNumberRule",
    title: "Base Number Rule",
    description:
      "The `BaseNumberRule` object. Used as the input for a new NumberRule.",
  });
export type BaseNumberRule = typeof BaseNumberRule.Type;

export const NumberRule = S.extend(BaseRule, BaseNumberRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "NumberRule",
    title: "Number Rule",
    description:
      "The `NumberRule` object. Used to perform number operations on values",
  });

export type NumberRule = BaseRule & {
  _tag: "number";
  field: string;
  operator:
    | "is_equal_to"
    | "is_not_equal_to"
    | "is_greater_than"
    | "is_greater_than_or_equal_to"
    | "is_less_than"
    | "is_less_than_or_equal_to";
  value: number;
};

export const BaseBooleanRule = S.TaggedStruct("boolean", {
  field: S.String,
  operator: S.Literal("is_true", "is_false"),
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseBooleanRule",
    title: "Base Boolean Rule",
    description:
      "The `BaseBooleanRule` object. Used as the input for a new BooleanRule.",
  });
export type BaseBooleanRule = typeof BaseBooleanRule.Type;

export const BooleanRule = S.extend(BaseRule, BaseBooleanRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "BooleanRule",
    title: "Boolean Rule",
    description:
      "The `BooleanRule` object. Used to perform boolean operations on values",
  });

export type BooleanRule = BaseRule & {
  _tag: "boolean";
  field: string;
  operator: "is_true" | "is_false";
};

export const BaseArrayValueRule = S.TaggedStruct("array_value", {
  field: S.String,
  operator: S.Literal("contains", "does_not_contain", "contains_all"),
  value: S.Any,
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseArrayValueRule",
    title: "Base Array Value Rule",
    description:
      "The `BaseArrayValueRule` object. Used as the input for a new ArrayValueRule.",
  });
export type BaseArrayValueRule = typeof BaseArrayValueRule.Type;

export const ArrayValueRule = S.extend(BaseRule, BaseArrayValueRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "ArrayValueRule",
    title: "Array Value Rule",
    description:
      "The `ArrayValueRule` object. Used to perform array value operations on values",
  });

export type ArrayValueRule = BaseRule & {
  _tag: "array_value";
  field: string;
  operator: "contains" | "does_not_contain" | "contains_all";
  value: any;
};

export const BaseArrayLengthRule = S.TaggedStruct("array_length", {
  field: S.String,
  operator: S.Literal(
    "is_equal_to",
    "is_not_equal_to",
    "is_greater_than",
    "is_greater_than_or_equal_to",
    "is_less_than",
    "is_less_than_or_equal_to",
  ),
  value: S.Number,
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseArrayLengthRule",
    title: "Base Array Length Rule",
    description:
      "The `BaseArrayLengthRule` object. Used as the input for a new ArrayLengthRule.",
  });
export type BaseArrayLengthRule = typeof BaseArrayLengthRule.Type;

export const ArrayLengthRule = S.extend(BaseRule, BaseArrayLengthRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "ArrayLengthRule",
    title: "Array Length Rule",
    description:
      "The `ArrayLengthRule` object. Used to perform array length operations on values",
  });

export type ArrayLengthRule = BaseRule & {
  _tag: "array_length";
  field: string;
  operator:
    | "is_equal_to"
    | "is_not_equal_to"
    | "is_greater_than"
    | "is_greater_than_or_equal_to"
    | "is_less_than"
    | "is_less_than_or_equal_to";
  value: number;
};

export const BaseObjectKeyRule = S.TaggedStruct("object_key", {
  field: S.String,
  operator: S.Literal("contains", "does_not_contain"),
  value: S.String,
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseObjectKeyRule",
    title: "Base Object Key Rule",
    description:
      "The `BaseObjectKeyRule` object. Used as the input for a new ObjectKeyRule.",
  });
export type BaseObjectKeyRule = typeof BaseObjectKeyRule.Type;

export const ObjectKeyRule = S.extend(BaseRule, BaseObjectKeyRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "ObjectKeyRule",
    title: "Object Key Rule",
    description:
      "The `ObjectKeyRule` object. Used to perform object key operations on values",
  });

export type ObjectKeyRule = BaseRule & {
  _tag: "object_key";
  field: string;
  operator: "contains" | "does_not_contain";
  value: string;
};

export const BaseObjectValueRule = S.TaggedStruct("object_value", {
  field: S.String,
  operator: S.Literal("contains", "does_not_contain"),
  value: S.Any,
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseObjectValueRule",
    title: "Base Object Value Rule",
    description:
      "The `BaseObjectValueRule` object. Used as the input for a new ObjectValueRule.",
  });
export type BaseObjectValueRule = typeof BaseObjectValueRule.Type;

export const ObjectValueRule = S.extend(BaseRule, BaseObjectValueRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "ObjectValueRule",
    title: "Object Value Rule",
    description:
      "The `ObjectValueRule` object. Used to perform object value operations on values",
  });

export type ObjectValueRule = BaseRule & {
  _tag: "object_value";
  field: string;
  operator: "contains" | "does_not_contain";
  value: any;
};

export const BaseObjectKeyValuePairRule = S.TaggedStruct(
  "object_key_value_pair",
  {
    field: S.String,
    operator: S.Literal("contains", "does_not_contain"),
    value: S.Struct({
      key: S.String,
      value: S.Any,
    }),
  },
)
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseObjectKeyValuePairRule",
    title: "Base Object Key Value Pair Rule",
    description:
      "The `BaseObjectKeyValuePairRule` object. The input for a new ObjectKeyValuePairRule.",
  });
export type BaseObjectKeyValuePairRule = typeof BaseObjectKeyValuePairRule.Type;

export const ObjectKeyValuePairRule = S.extend(
  BaseRule,
  BaseObjectKeyValuePairRule,
)
  .pipe(S.mutable)
  .annotations({
    identifier: "ObjectKeyValuePairRule",
    title: "Object Key Value Pair Rule",
    description:
      "The `ObjectKeyValuePairRule` object. Used to perform object key value pair operations on values",
  });
export type ObjectKeyValuePairRule = BaseRule & {
  _tag: "object_key_value_pair";
  field: string;
  operator: "contains" | "does_not_contain";
  value: {
    key: string;
    value: any;
  };
};

export const BaseGenericComparisonRule = S.TaggedStruct("generic_comparison", {
  field: S.String,
  operator: S.Literal(
    "is_equal_to",
    "is_not_equal_to",
    "is_greater_than",
    "is_greater_than_or_equal_to",
    "is_less_than",
    "is_less_than_or_equal_to",
  ),
  value: S.Any,
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseGenericComparisonRule",
    title: "Base Generic Comparison Rule",
    description:
      "The `BaseGenericComparisonRule` object. Used as the input for a new GenericComparisonRule.",
  });
export type BaseGenericComparisonRule = typeof BaseGenericComparisonRule.Type;
export const GenericComparisonRule = S.extend(
  BaseRule,
  BaseGenericComparisonRule,
)
  .pipe(S.mutable)
  .annotations({
    identifier: "GenericComparisonRule",
    title: "Generic Comparison Rule",
    description:
      "The `GenericComparisonRule` object. Used to perform generic comparison operations on values",
  });
export type GenericComparisonRule = BaseRule & {
  _tag: "generic_comparison";
  field: string;
  operator:
    | "is_equal_to"
    | "is_not_equal_to"
    | "is_greater_than"
    | "is_greater_than_or_equal_to"
    | "is_less_than"
    | "is_less_than_or_equal_to";
  value: any;
};

export const BaseGenericTypeRule = S.TaggedStruct("generic_type", {
  field: S.String,
  operator: S.Literal(
    "is_string",
    "is_not_string",
    "is_number",
    "is_not_number",
    "is_truthy",
    "is_falsy",
    "is_null",
    "is_not_null",
    "is_undefined",
    "is_not_undefined",
    "is_boolean",
    "is_not_boolean",
    "is_array",
    "is_not_array",
    "is_object",
    "is_not_object",
  ),
})
  .pipe(S.mutable)
  .annotations({
    identifier: "BaseGenericTypeRule",
    title: "Base Generic Type Rule",
    description:
      "The `BaseGenericTypeRule` object. Used as the input for a new GenericTypeRule.",
  });
export type BaseGenericTypeRule = typeof BaseGenericTypeRule.Type;

export const GenericTypeRule = S.extend(BaseRule, BaseGenericTypeRule)
  .pipe(S.mutable)
  .annotations({
    identifier: "GenericTypeRule",
    title: "Generic Type Rule",
    description:
      "The `GenericTypeRule` object. Used to perform generic type operations on values",
  });
export type GenericTypeRule = BaseRule & {
  _tag: "generic_type";
  field: string;
  operator:
    | "is_string"
    | "is_not_string"
    | "is_number"
    | "is_not_number"
    | "is_truthy"
    | "is_falsy"
    | "is_null"
    | "is_not_null"
    | "is_undefined"
    | "is_not_undefined"
    | "is_boolean"
    | "is_not_boolean"
    | "is_array"
    | "is_not_array"
    | "is_object"
    | "is_not_object";
};

export type Rule =
  | StringRule
  | NumberRule
  | BooleanRule
  | ArrayValueRule
  | ArrayLengthRule
  | ObjectKeyRule
  | ObjectValueRule
  | ObjectKeyValuePairRule
  | GenericComparisonRule
  | GenericTypeRule;

export const Rule = S.Union(
  StringRule,
  NumberRule,
  BooleanRule,
  ArrayValueRule,
  ArrayLengthRule,
  ObjectKeyRule,
  ObjectValueRule,
  ObjectKeyValuePairRule,
  GenericComparisonRule,
  GenericTypeRule,
).pipe(S.mutable);

export const NewRule = S.Union(
  BaseStringRule,
  BaseNumberRule,
  BaseBooleanRule,
  BaseArrayValueRule,
  BaseArrayLengthRule,
  BaseObjectKeyRule,
  BaseObjectValueRule,
  BaseObjectKeyValuePairRule,
  BaseGenericComparisonRule,
  BaseGenericTypeRule,
).pipe(S.mutable);
export type NewRule = typeof NewRule.Type;

export type Union = {
  entity: "union";
  id: LogosEntityId;
  parentId: LogosEntityId;
  combinator: Combinator;
  rules: (Rule | Union)[];
};

export const Union = S.Struct({
  entity: S.Literal("union"),
  id: LogosEntityId,
  parentId: LogosEntityId,
  combinator: Combinator,
  rules: S.Array(
    S.Union(
      Rule,
      S.suspend((): S.Schema<Union> => Union),
    ),
  ).pipe(S.mutable),
}).pipe(S.mutable);

export const RootUnion = S.Struct({
  entity: S.Literal("root_union"),
  id: LogosEntityId,
  combinator: Combinator,
  rules: S.Array(S.Union(Rule, Union)).pipe(S.mutable),
}).pipe(S.mutable);
export type RootUnion = typeof RootUnion.Type;

export const NewUnion = S.Struct({
  combinator: Combinator,
});
export type NewUnion = typeof NewUnion.Type;

import {BS} from "@beep/schema";
import * as Equal from "effect/Equal";
import * as A from "effect/Array";

export const OperatorTypeLiteralKit = BS.stringLiteralKit(
  "iLike",
  "notILike",
  "eq",
  "ne",
  "inArray",
  "notInArray",
  "isEmpty",
  "isNotEmpty",
  "lt",
  "lte",
  "gt",
  "gte",
  "isBetween",
  "isRelativeToToday",
);
const {Members} = OperatorTypeLiteralKit.toTagged("operator");

export class OperatorTypeLiteral extends OperatorTypeLiteralKit.Schema {
  static readonly Enum = OperatorTypeLiteralKit.Enum;
  static readonly Options = OperatorTypeLiteralKit.Options;
}

// const Enum = OperatorTypeLiteralKit.Enum;
export namespace OperatorTypeLiteral {
  export type Type = typeof OperatorTypeLiteral.Type;
  export type Encoded = typeof OperatorTypeLiteral.Encoded;
}


export class Eq extends Members.eq.annotations({
  identifier: "EqOperator",
  title: "Equals Operator",
  description: "Checks if the value is equal to the given value",
  schemaId: Symbol.for(`@beep/shared-domain/value-objects/filters/internal/schemas/operator-type-literal/EqOperator`),
  [BS.LabelAnnotationId]: "Equals",
}) {
  static readonly run = <A, B>(a: A, b: B) => Equal.equals(a, b);
}

export class Ne extends Members.ne.annotations({
  identifier: "NeOperator",
  title: "Not Equals Operator",
  description: "Checks if the value is not equal to the given value",
  schemaId: Symbol.for(`@beep/shared-domain/value-objects/filters/internal/schemas/operator-type-literal/NeOperator`),
  [BS.LabelAnnotationId]: "Not Equals",
}) {
  static readonly run = <A, B>(a: A, b: B) => !Equal.equals(a, b);
}

export class InArray extends Members.inArray.annotations({
  identifier: "InArrayOperator",
  title: "In Array Operator",
  description: "Checks if the value is in the given array",
  schemaId: Symbol.for(`@beep/shared-domain/value-objects/filters/internal/schemas/operator-type-literal/InArrayOperator`),
  [BS.LabelAnnotationId]: "In Array",
}) {
  static readonly run = <Array extends any[], ConstraintArray extends A.NonEmptyReadonlyArray<any>>(
    array: Array,
    constraintArray: ConstraintArray,
  ) => {
    return A.intersectionWith(BS.equalsJson)(constraintArray)(array)
  };
}
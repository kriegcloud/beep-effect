import { BoolWithDefault } from "@beep/schema/custom";
import { DiscriminatedStruct } from "@beep/schema/generics";
import type { StringTypes } from "@beep/types";
// import * as Data from "effect/Data";
// import {Operator} from "./operator";
import * as S from "effect/Schema";
import { FieldType } from "./FieldType";
import { OperatorCategory } from "./OperatorCategory";
import { ValueType } from "./ValueType";

export class OperatorMetadata extends S.Class<OperatorMetadata>("OperatorMetadata")({
  category: OperatorCategory,
  label: S.NonEmptyString,
  description: S.NonEmptyString,
  symbol: S.NonEmptyString,
  example: S.optional(S.String),
  requiresValue: S.Boolean,
  isNegatable: BoolWithDefault(false),
}) {}

export namespace OperatorMetadata {
  export type Type = S.Schema.Type<typeof OperatorMetadata>;
  export type Encoded = S.Schema.Encoded<typeof OperatorMetadata>;
}

export namespace OperatorSpecFactory {
  export const make = <const OperatorLiteral extends StringTypes.NonEmptyString<string>>(
    operatorLiteral: OperatorLiteral
  ) =>
    DiscriminatedStruct("operator")(operatorLiteral, {
      ...OperatorMetadata.fields,
      acceptableFieldTypes: FieldType,
      acceptableValueType: ValueType,
    });
}

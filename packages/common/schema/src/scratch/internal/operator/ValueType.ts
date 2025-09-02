import { stringLiteralKit } from "@beep/schema/kits";
import type * as S from "effect/Schema";
import { FieldType } from "./FieldType";

const kit = stringLiteralKit(
  ...FieldType.Options,
  "regex",
  "range",
  "void"
)({
  identifier: "ValueTypeLiteral",
  title: "Value Type Literal",
  description: "Value type literals",
});

export class ValueType extends kit.Schema {
  static readonly Options = kit.Options;
  static readonly pick = kit.pick;
  static readonly omit = kit.omit;
  static readonly Enum = kit.Enum;
}

export namespace ValueType {
  export type Type = S.Schema.Type<typeof ValueType>;
  export type Encoded = S.Schema.Encoded<typeof ValueType>;
}

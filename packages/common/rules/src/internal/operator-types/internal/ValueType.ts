import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import { FieldType } from "./FieldType";

const kit = BS.stringLiteralKit(...FieldType.Options, "regex", "range", "void");

export class ValueType extends kit.Schema.annotations({
  schemaId: Symbol.for("@beep/rules/internal/operator-types/internal/ValueType"),
  identifier: "ValueType",
  title: "Value Type",
  description: "Value type for an operator.",
}) {
  static readonly Enum = kit.Enum;
  static readonly Options = kit.Options;
}

export namespace ValueType {
  export type Type = S.Schema.Type<typeof ValueType>;
  export type Encoded = S.Schema.Encoded<typeof ValueType>;
}

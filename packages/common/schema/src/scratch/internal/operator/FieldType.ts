import { stringLiteralKit } from "@beep/schema/kits";
import type * as S from "effect/Schema";

const kit = stringLiteralKit(
  "string",
  "number",
  "boolean",
  "date",
  "array",
  "object",
  "any",
  "time"
)({
  identifier: "FieldTypeLiteral",
  title: "Field Type Literal",
  description: "Field type literals",
});

export class FieldType extends kit.Schema {
  static readonly Options = kit.Options;
  static readonly pick = kit.pick;
  static readonly omit = kit.omit;
  static readonly Enum = kit.Enum;
}

export namespace FieldType {
  export type Type = S.Schema.Type<typeof FieldType>;
  export type Encoded = S.Schema.Encoded<typeof FieldType>;
}

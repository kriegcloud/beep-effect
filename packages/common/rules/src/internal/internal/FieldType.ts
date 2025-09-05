import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const kit = BS.stringLiteralKit("string", "number", "boolean", "date", "array", "object", "any", "time");

export class FieldType extends kit.Schema.annotations({
  schemaId: Symbol.for("@beep/rules/internal/operator-types/internal/FieldType"),
  identifier: "FieldType",
  title: "Field Type",
  description: "Field type for an operator.",
}) {
  static readonly Enum = kit.Enum;
  static readonly Options = kit.Options;
}

export namespace FieldType {
  export type Type = S.Schema.Type<typeof FieldType>;
  export type Encoded = S.Schema.Encoded<typeof FieldType>;
}

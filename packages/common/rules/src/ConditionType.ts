import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const { Schema, Enum, Options, is } = BS.stringLiteralKit("or", "and", "none");

export class ConditionType extends Schema {
  static readonly Enum = Enum;
  static readonly Options = Options;
  static readonly is = is;
}

export namespace ConditionType {
  export type Type = S.Schema.Type<typeof ConditionType>;
  export type Encoded = S.Schema.Encoded<typeof ConditionType>;
}

import { toOptionalWithDefault } from "@beep/schema/utils";
import * as S from "effect/Schema";

export type BoolSchema = S.PropertySignature<":", boolean, never, "?:", boolean | undefined, true, never>;

export const BoolWithDefault = (defaultValue: boolean): BoolSchema => toOptionalWithDefault(S.Boolean)(defaultValue);

export declare namespace BoolWithDefault {
  export type Type = S.Schema.Type<BoolSchema>;
  export type Encoded = S.Schema.Encoded<BoolSchema>;
}

export const BoolTrue = toOptionalWithDefault(S.Boolean)(true).annotations({
  schemaId: Symbol.for("@beep/schema/custom/BoolTrue"),
  identifier: "BoolTrue",
  title: "Boolean True",
  description: "Boolean who's value is always false",
});

export declare namespace BoolTrue {
  export type Type = S.Schema.Type<typeof BoolTrue>;
  export type Encoded = S.Schema.Encoded<typeof BoolTrue>;
}

export const BoolFalse = toOptionalWithDefault(S.Boolean)(false).annotations({
  schemaId: Symbol.for("@beep/schema/custom/BoolFalse"),
  identifier: "BoolFalse",
  title: "Boolean False",
  description: "Boolean who's value is always false",
});
export declare namespace BoolFalse {
  export type Type = S.Schema.Type<typeof BoolFalse>;
  export type Encoded = S.Schema.Encoded<typeof BoolFalse>;
}

export const TrueLiteral = S.Literal(true);
export const FalseLiteral = S.Literal(false);

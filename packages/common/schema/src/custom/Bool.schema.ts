import { toOptionalWithDefault } from "@beep/schema/utils";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("bool");
export type BoolSchema = S.PropertySignature<":", boolean, never, "?:", boolean | undefined, true, never>;

export const BoolWithDefault = (defaultValue: boolean): BoolSchema => toOptionalWithDefault(S.Boolean)(defaultValue);

export declare namespace BoolWithDefault {
  export type Type = S.Schema.Type<BoolSchema>;
  export type Encoded = S.Schema.Encoded<BoolSchema>;
}

export const BoolTrue = toOptionalWithDefault(S.Boolean)(true).annotations(
  Id.annotations("BoolTrue", {
    description: "Boolean who's value is always false",
  })
);

export declare namespace BoolTrue {
  export type Type = S.Schema.Type<typeof BoolTrue>;
  export type Encoded = S.Schema.Encoded<typeof BoolTrue>;
}

export const BoolFalse = toOptionalWithDefault(S.Boolean)(false).annotations(
  Id.annotations("BoolFalse", {
    description: "Boolean who's value is always false",
  })
);
export declare namespace BoolFalse {
  export type Type = S.Schema.Type<typeof BoolFalse>;
  export type Encoded = S.Schema.Encoded<typeof BoolFalse>;
}

export const TrueLiteral = S.Literal(true);
export const FalseLiteral = S.Literal(false);

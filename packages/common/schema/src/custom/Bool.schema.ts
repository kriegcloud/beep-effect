import * as F from "effect/Function";
import * as S from "effect/Schema";

export type BoolSchema = S.PropertySignature<":", boolean, never, "?:", boolean | undefined, true, never>;

export const BoolWithDefault = (defaultValue: boolean): BoolSchema =>
  F.pipe(
    F.constant(defaultValue),
    (defaultValue): BoolSchema =>
      S.Boolean.pipe(
        S.optional,
        S.withDefaults({
          decoding: defaultValue,
          constructor: defaultValue,
        })
      )
  );

export namespace BoolWithDefault {
  export type Type = S.Schema.Type<BoolSchema>;
  export type Encoded = S.Schema.Encoded<BoolSchema>;
}

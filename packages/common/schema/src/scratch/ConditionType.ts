import * as S from "effect/Schema";

export class ConditionType extends S.Literal("and", "or", "none") {}

export namespace ConditionType {
  export type Type = S.Schema.Type<typeof ConditionType>;
  export type Encoded = S.Schema.Encoded<typeof ConditionType>;
}

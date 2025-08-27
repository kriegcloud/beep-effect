import * as S from "effect/Schema";

export const LogicalOp = S.mutable(S.Literal("and", "or"));
export namespace LogicalOp {
  export type Type = typeof LogicalOp.Type;
  export type Encoded = typeof LogicalOp.Encoded;
}

import * as S from "effect/Schema";
import { Entity, EntityId } from "./internal";
import * as Operators from "./operators";
import { Rule } from "./rules";

export const Union = Entity.make("union", {
  parentId: EntityId,
  logicalOp: Operators.LogicalOp,
  rules: S.Array(
    S.Union(
      Rule,
      S.suspend((): S.Schema<Union.Type, Union.Encoded> => Union),
    ),
  ).pipe(S.mutable),
});
export namespace Union {
  export type Type = Entity.Type<
    "union",
    {
      parentId: EntityId.Type;
      logicalOp: Operators.LogicalOp.Type;
      rules: Array<Rule.Type | Type>;
    }
  >;
  export type Encoded = Entity.Type<
    "union",
    {
      parentId: EntityId.Encoded;
      logicalOp: typeof Operators.LogicalOp.Encoded;
      rules: Array<Rule.Encoded | Encoded>;
    }
  >;
}
export const RootUnion = Entity.make("rootUnion", {
  logicalOp: Operators.LogicalOp,
  rules: S.Array(S.Union(Rule, Union)).pipe(S.mutable),
});
export namespace RootUnion {
  export type Type = typeof RootUnion.Type;
  export type Encoded = typeof RootUnion.Encoded;
}
export const UnionInput = S.Struct({
  logicalOp: Operators.LogicalOp,
});
export namespace UnionInput {
  export type Type = typeof UnionInput.Type;
  export type Encoded = typeof UnionInput.Encoded;
}

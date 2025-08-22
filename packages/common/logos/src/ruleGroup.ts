import * as S from "effect/Schema";
import { Entity, EntityId } from "./internal";
import * as Operators from "./operators";
import { Rule } from "./rules";

export const RuleGroup = Entity.make("group", {
  parentId: EntityId,
  logicalOp: Operators.LogicalOp,
  rules: S.mutable(
    S.Array(
      S.Union(
        Rule,
        S.suspend((): S.Schema<RuleGroup.Type, RuleGroup.Encoded> => RuleGroup),
      ),
    ),
  ),
});
export namespace RuleGroup {
  export type Type = Entity.Type<
    "group",
    {
      parentId: EntityId.Type;
      logicalOp: Operators.LogicalOp.Type;
      rules: Array<Rule.Type | Type>;
    }
  >;
  export type Encoded = Entity.Type<
    "group",
    {
      parentId: EntityId.Encoded;
      logicalOp: typeof Operators.LogicalOp.Encoded;
      rules: Array<Rule.Encoded | Encoded>;
    }
  >;
}
export const RootGroup = Entity.make("root", {
  logicalOp: Operators.LogicalOp,
  rules: S.mutable(S.Array(S.Union(Rule, RuleGroup))),
}).pipe(S.mutable);

export namespace RootGroup {
  export type Type = typeof RootGroup.Type;
  export type Encoded = typeof RootGroup.Encoded;
}

export const GroupInput = S.Struct({
  logicalOp: Operators.LogicalOp,
});
export namespace GroupInput {
  export type Type = typeof GroupInput.Type;
  export type Encoded = typeof GroupInput.Encoded;
}

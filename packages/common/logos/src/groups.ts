import * as F from "effect/Function";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import { Node, NodeId } from "./internal";
import * as Operators from "./operators";
import { Rule } from "./rules";
export const RuleGroup = Node.make("group", {
  parentId: NodeId,
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
  export type Type = Node.Type<
    "group",
    {
      parentId: NodeId.Type;
      logicalOp: Operators.LogicalOp.Type;
      rules: Array<Rule.Type | Type>;
    }
  >;
  export type Encoded = Node.Type<
    "group",
    {
      parentId: NodeId.Encoded;
      logicalOp: typeof Operators.LogicalOp.Encoded;
      rules: Array<Rule.Encoded | Encoded>;
    }
  >;
}
export class RootGroup extends Node.make("root", {
  logicalOp: Operators.LogicalOp,
  rules: S.mutable(S.Array(S.Union(Rule, RuleGroup))).pipe(
    S.propertySignature,
    S.withConstructorDefault(F.constant([])),
  ),
}).pipe(S.mutable) {
  static readonly make = (newGroup: GroupInput.Type): RootGroup.Type => ({
    ...newGroup,
    node: "root",
    id: uuid(),
    rules: [],
  });
}

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

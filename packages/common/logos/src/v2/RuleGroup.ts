import * as S from "effect/Schema";
import { LogicalOp, Node, NodeId } from "./internal";
import { Rule } from "./Rule";

export class RuleGroup extends Node.make("group", {
  parentId: NodeId,
  logicalOp: LogicalOp,
  rules: S.mutable(
    S.Array(
      S.Union(
        Rule,
        S.suspend((): S.Schema<RuleGroup.Type, RuleGroup.Encoded> => RuleGroup),
      ),
    ),
  ),
}) {}

export namespace RuleGroup {
  export type Type = Node.Type<
    "group",
    {
      parentId: NodeId.Type;
      logicalOp: LogicalOp.Type;
      rules: Array<Rule.Type | Type>;
    }
  >;
  export type Encoded = Node.Type<
    "group",
    {
      parentId: NodeId.Encoded;
      logicalOp: LogicalOp.Encoded;
      rules: Array<Rule.Encoded | Encoded>;
    }
  >;
}

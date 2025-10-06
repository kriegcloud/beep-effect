import * as S from "effect/Schema";
import { LogicalOp, Node, NodeId } from "./internal";
import { Rule } from "./Rule";

export class Group extends Node.make("group", {
  parentId: NodeId,
  logicalOp: S.mutable(LogicalOp),
  rules: S.mutable(
    S.Array(
      S.Union(
        Rule,
        S.suspend((): S.Schema<Group.Type, Group.Encoded> => Group)
      )
    )
  ),
}) {}

export namespace Group {
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

export class GroupInput extends S.Struct({
  logicalOp: LogicalOp,
}) {}

export namespace GroupInput {
  export type Type = typeof GroupInput.Type;
  export type Encoded = typeof GroupInput.Encoded;
}

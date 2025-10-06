import { LogicalOp, Node } from "@beep/logos/v2/internal";
import * as S from "effect/Schema";
import type * as Types from "effect/Types";
import { v4 as uuid } from "uuid";
import { Group, type GroupInput } from "./Group";
import { Rule } from "./Rule";
export class RootGroup extends Node.make("root", {
  logicalOp: LogicalOp,
  rules: S.mutable(S.Array(S.Union(Rule, Group))).pipe(
    S.propertySignature,
    S.withConstructorDefault(() => [])
  ),
}) {
  static readonly make = (newRootGroup: GroupInput.Type): RootGroup.Type =>
    ({
      ...newRootGroup,
      node: "root",
      id: uuid(),
      rules: [],
    }) as const;
}

export namespace RootGroup {
  export type Type = Omit<typeof RootGroup.Type, "logicalOp"> & {
    logicalOp: Types.Mutable<typeof LogicalOp.Type>;
  };
  export type Encoded = typeof RootGroup.Encoded;
}

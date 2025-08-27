import { LogicalOp, Node } from "@beep/logos/v2/internal";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import { Rule } from "./Rule";
import { type GroupInput, RuleGroup } from "./RuleGroup";

export class RuleSet extends Node.make("root", {
  logicalOp: LogicalOp,
  rules: S.mutable(S.Array(S.Union(Rule, RuleGroup))).pipe(
    S.propertySignature,
    S.withConstructorDefault(() => []),
  ),
}) {
  static readonly make = (newRuleSet: GroupInput.Type): RuleSet.Type =>
    ({
      ...newRuleSet,
      node: "root",
      id: uuid(),
      rules: [],
    }) as const;
}

export namespace RuleSet {
  export type Type = typeof RuleSet.Type;
  export type Encoded = typeof RuleSet.Encoded;
}

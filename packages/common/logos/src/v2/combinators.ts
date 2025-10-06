import * as A from "effect/Array";
import { addGroup, addRuleToGroup } from "./api";
import { GroupInput } from "./Group";
import type { RuleInput } from "./Rule";
import type { RootOrGroup } from "./types";

export const and =
  (parent: RootOrGroup) =>
  (...rules: A.NonEmptyReadonlyArray<RuleInput.Type>): RootOrGroup => {
    const group = addGroup(
      parent,
      GroupInput.make({
        logicalOp: "and",
      })
    );
    A.forEach(rules, (rule) => addRuleToGroup(group, rule));
    return group;
  };

export const or =
  (parent: RootOrGroup) =>
  (...rules: A.NonEmptyReadonlyArray<RuleInput.Type>): RootOrGroup => {
    const group = addGroup(
      parent,
      GroupInput.make({
        logicalOp: "or",
      })
    );
    A.forEach(rules, (rule) => addRuleToGroup(group, rule));
    return group;
  };

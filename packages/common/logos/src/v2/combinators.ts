import * as A from "effect/Array";
import {addGroup, addRuleToGroup} from "./api";
import type {RuleInput} from "./Rule";
import {GroupInput} from "./RuleGroup";
import type {RuleSetOrGroup} from "./types";


export const and =
  (parent: RuleSetOrGroup) =>
    (...rules: A.NonEmptyReadonlyArray<RuleInput.Type>): RuleSetOrGroup => {
      const group = addGroup(
        parent,
        GroupInput.make({
          logicalOp: "and",
        }),
      );
      A.forEach(rules, (rule) => addRuleToGroup(group, rule));
      return group;
    };

export const or =
  (parent: RuleSetOrGroup) =>
    (...rules: A.NonEmptyReadonlyArray<RuleInput.Type>): RuleSetOrGroup => {
      const group = addGroup(
        parent,
        GroupInput.make({
          logicalOp: "or",
        }),
      );
      A.forEach(rules, (rule) => addRuleToGroup(group, rule));
      return group;
    };



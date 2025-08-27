import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { RuleGroup } from "./groups";
import { Rule } from "./rules";
import type { RootOrRuleGroup, RuleOrRuleGroup } from "./types";

type Options = {
  removeFailedValidations?: boolean;
  removeEmptyGroups?: boolean;
  promoteSingleRuleGroups?: boolean;
  updateParentIds?: boolean;
};
export function normalize<T extends RootOrRuleGroup>(group: T, options?: Options): T {
  const promoteSingleRuleGroups = options?.promoteSingleRuleGroups ?? true;
  const removeEmptyGroups = options?.removeEmptyGroups ?? true;
  const removeFailedValidations = options?.removeFailedValidations ?? true;
  const updateParentIds = options?.updateParentIds ?? true;
  const out: Array<RuleOrRuleGroup> = [];

  for (const item of group.rules) {
    if (item.node === "group") {
      // Validate group shape
      if (removeFailedValidations) {
        const validated = S.encodeOption(RuleGroup)(item);
        if (!O.isSome(validated)) {
          continue;
        }
      }

      // Normalize nested group recursively (in-place)
      const normalizedChild = normalize(item, options);

      // Remove empty groups
      if (A.isEmptyArray(normalizedChild.rules) && removeEmptyGroups) {
        continue;
      }

      // Promote single-rule group
      if (A.isNonEmptyArray(normalizedChild.rules) && normalizedChild.rules.length === 1 && promoteSingleRuleGroups) {
        const only = normalizedChild.rules[0];
        out.push(updateParentIds ? { ...only, parentId: group.id } : only);
        continue;
      }

      // Ensure parentId of group
      out.push(updateParentIds ? { ...normalizedChild, parentId: group.id } : normalizedChild);
      continue;
    }
    // item is a rule
    if (removeFailedValidations) {
      const validated = S.encodeOption(Rule)(item);
      if (!O.isSome(validated)) {
        continue;
      }
    }
    out.push(updateParentIds ? { ...item, parentId: group.id } : item);
  }

  // mutate underlying array in place to avoid reassigning the readonly property
  group.rules.length = 0;
  group.rules.push(...out);
  return group;
}

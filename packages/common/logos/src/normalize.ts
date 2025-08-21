import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Rule } from "./rules";
import type { AnyUnion, RuleOrUnion } from "./types";
import { Union } from "./union";

type Options = {
  removeFailedValidations?: boolean;
  removeEmptyUnions?: boolean;
  promoteSingleRuleUnions?: boolean;
  updateParentIds?: boolean;
};
export function normalize<T extends AnyUnion>(union: T, options?: Options): T {
  const promoteSingleRuleUnions = options?.promoteSingleRuleUnions ?? true;
  const removeEmptyUnions = options?.removeEmptyUnions ?? true;
  const removeFailedValidations = options?.removeFailedValidations ?? true;
  const updateParentIds = options?.updateParentIds ?? true;
  const out: Array<RuleOrUnion> = [];

  for (const item of union.rules) {
    if (item.entity === "union") {
      // Validate union shape
      if (removeFailedValidations) {
        const validated = S.encodeOption(Union)(item);
        if (!O.isSome(validated)) {
          continue;
        }
      }

      // Normalize nested union recursively (in-place)
      const normalizedChild = normalize(item, options);

      // Remove empty unions
      if (A.isEmptyArray(normalizedChild.rules) && removeEmptyUnions) {
        continue;
      }

      // Promote single-rule union
      if (
        A.isNonEmptyArray(normalizedChild.rules) &&
        normalizedChild.rules.length === 1 &&
        promoteSingleRuleUnions
      ) {
        const only = normalizedChild.rules[0];
        out.push(updateParentIds ? { ...only, parentId: union.id } : only);
        continue;
      }

      // Ensure parentId of union
      out.push(
        updateParentIds
          ? { ...normalizedChild, parentId: union.id }
          : normalizedChild,
      );
      continue;
    }
    // item is a rule
    if (removeFailedValidations) {
      const validated = S.encodeOption(Rule)(item);
      if (!O.isSome(validated)) {
        continue;
      }
    }
    out.push(updateParentIds ? { ...item, parentId: union.id } : item);
  }

  // mutate underlying array in place to avoid reassigning the readonly property
  union.rules.length = 0;
  union.rules.push(...out);
  return union;
}

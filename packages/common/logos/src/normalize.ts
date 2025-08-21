import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type * as Types from "effect/Types";
import { create } from "mutative";
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
  const updated = create(union, (draft: Types.Mutable<AnyUnion>) => {
    draft.rules = A.reduce(
      union.rules,
      [] as Array<RuleOrUnion>,
      (acc, item) => {
        if (item.entity === "union") {
          // Validate union shape
          if (removeFailedValidations) {
            const validated = S.encodeOption(Union)(item);
            if (!O.isSome(validated)) {
              return acc;
            }
          }
          // Normalize nested union recursively (in-place)
          const normalizedChild = normalize(item, options);
          // Remove empty unions
          if (A.isEmptyArray(normalizedChild.rules) && removeEmptyUnions) {
            return acc;
          }
          // Promote single-rule union
          if (
            A.isNonEmptyArray(normalizedChild.rules) &&
            normalizedChild.rules.length === 1 &&
            promoteSingleRuleUnions
          ) {
            const only = normalizedChild.rules[0]!;
            acc.push({ ...only, parentId: draft.id });
            return acc;
          }
          // Ensure parentId of union
          acc.push(
            updateParentIds
              ? { ...normalizedChild, parentId: draft.id }
              : normalizedChild,
          );
          return acc;
        }
        // item is a rule
        if (removeFailedValidations) {
          const validated = S.encodeOption(Rule)(item);
          if (!O.isSome(validated)) {
            return acc;
          }
        }
        acc.push(updateParentIds ? { ...item, parentId: draft.id } : item);
        return acc;
      },
    );
  }) as T;

  Object.assign(union, updated);
  return union;
}

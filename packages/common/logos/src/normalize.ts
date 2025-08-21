import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Rule } from "./rules";
import { type RootUnion, Union } from "./union";

type Options = {
  removeFailedValidations?: boolean;
  removeEmptyUnions?: boolean;
  promoteSingleRuleUnions?: boolean;
  updateParentIds?: boolean;
};
export function normalize<T extends Union.Type | RootUnion.Type>(
  union: T,
  options?: Options,
): T {
  const promoteSingleRuleUnions = options?.promoteSingleRuleUnions ?? true;
  const removeEmptyUnions = options?.removeEmptyUnions ?? true;
  const removeFailedValidations = options?.removeFailedValidations ?? true;
  const updateParentIds = options?.updateParentIds ?? true;
  let rules = [...union.rules];
  rules = A.reduce(
    union.rules,
    [] as (Rule.Type | Union.Type)[],
    (rules, ruleOrUnion) => {
      if (ruleOrUnion.entity === "union") {
        // Validate structure of a union
        if (removeFailedValidations) {
          const validated = S.encodeOption(Union)(ruleOrUnion);

          if (!O.isSome(validated)) {
            return rules;
          }
        }
        // Normalize the union
        const normalized = normalize(ruleOrUnion, options);
        // After normalization, if no rules are left, we can skip the union
        if (normalized.rules.length === 0 && removeEmptyUnions) {
          return rules;
        }
        // If there is only one rule left, we can skip the union and add the rule directly
        if (normalized.rules.length === 1 && promoteSingleRuleUnions) {
          rules.push({ ...normalized.rules[0]!, parentId: union.id });
          return rules;
        }
        // Append correct parent_id
        if (updateParentIds) {
          rules.push({ ...normalized, parentId: union.id });
          return rules;
        }
        rules.push(normalized);
        return rules;
      }
      // Validate structure of a rule
      if (removeFailedValidations) {
        const validated = S.encodeOption(Rule)(ruleOrUnion);
        if (!O.isSome(validated)) {
          return rules;
        }
      }
      // Append correct parent_id
      if (updateParentIds) {
        rules.push({ ...ruleOrUnion, parentId: union.id });
        return rules;
      }
      rules.push(ruleOrUnion);
      return rules;
    },
  );
  return {
    ...union,
    rules,
  };
}

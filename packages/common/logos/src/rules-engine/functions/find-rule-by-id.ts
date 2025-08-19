import * as A from "effect/Array";
import { RootUnion, Rule, Union } from "../schema";

/**
 * Find a rule by id.
 * @export
 * @param {(RootUnion | Union)} union
 * @param {string} id
 * @return {*}  {(Rule | undefined)}
 */
export function findRuleById(
  union: RootUnion | Union,
  id: string,
): Rule | undefined {
  return A.reduce(
    union.rules,
    undefined as Rule | undefined,
    (foundRule, ruleOrUnion) => {
      if (foundRule) {
        return foundRule;
      }
      if (ruleOrUnion.entity === "rule") {
        return ruleOrUnion.id === id ? ruleOrUnion : undefined;
      }
      return findRuleById(ruleOrUnion, id);
    },
  );
}

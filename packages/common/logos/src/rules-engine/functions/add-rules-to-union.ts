import type { NewRule, RootUnion, Rule, Union } from "../schema";
import { addRuleToUnion } from "./add-rule-to-union";
/**
 * Add many rules to a union.
 * This function will mutate the parent union.
 * @export
 * @param {(RootUnion | Union)} parent
 * @param {NewRule[]} newRules
 * @return {*}  {Rule[]}
 */
export function addRulesToUnion(
  parent: RootUnion | Union,
  newRules: NewRule[],
): Rule[] {
  return newRules.map((newRule) => addRuleToUnion(parent, newRule));
}

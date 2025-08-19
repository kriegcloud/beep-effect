import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import { NewRule, RootUnion, Rule, Union } from "../schema";

/**
 * Add a rule to a union.
 * This function will mutate the parent union.
 * @export
 * @param {(RootUnion | Union)} parent
 * @param {NewRule} newRule
 * @return {*}  {Rule}
 */
export function addRuleToUnion(
  parent: RootUnion | Union,
  newRule: NewRule,
): Rule {
  const rule = S.decodeSync(Rule)({
    ...newRule,
    id: uuid(),
    parentId: parent.id,
    entity: "rule",
  });
  parent.rules.push(rule);
  return rule;
}

import * as S from "effect/Schema";
import { NewRule, NewUnion, RootUnion, Rule, Union } from "../schema";
import { addRuleToUnion } from "./add-rule-to-union";
import { addUnionToUnion } from "./add-union-to-union";

/**
 * Add a rule to a union.
 * This function will mutate the union.
 * @export
 * @param {(RootUnion | Union)} parent
 * @param {(NewRule | NewUnion)} newRuleOrUnion
 * @return {*}  {(Rule | Union)}
 */
export function addAnyToUnion(
  parent: RootUnion | Union,
  newRuleOrUnion: NewRule | NewUnion,
): Rule | Union {
  const isNewRule = (ruleOrUnion: NewRule | NewUnion): ruleOrUnion is NewRule =>
    S.is(NewRule)(ruleOrUnion);

  if (isNewRule(newRuleOrUnion)) {
    return addRuleToUnion(parent, newRuleOrUnion);
  }

  return addUnionToUnion(parent, S.decodeSync(NewUnion)(newRuleOrUnion));
}

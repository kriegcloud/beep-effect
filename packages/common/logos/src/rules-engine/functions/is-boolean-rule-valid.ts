import * as Eq from "effect/Equal";
import { BaseBooleanRule } from "../schema";
/**
 * Check if a boolean rule is valid.
 * @export
 * @param {BaseBooleanRule} rule
 * @param {boolean} value
 * @return {*}  {boolean}
 */
export function isBooleanRuleValid(
  rule: BaseBooleanRule,
  value: boolean,
): boolean {
  switch (rule.operator) {
    case "is_true":
      return Eq.equals(value)(true);
    case "is_false":
      return Eq.equals(value)(false);
    default:
      return false;
  }
}

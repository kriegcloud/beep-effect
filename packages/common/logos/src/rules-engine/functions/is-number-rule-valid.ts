import type { BaseNumberRule } from "../schema";

/**
 * Check if a number rule is valid.
 * @export
 * @param {BaseNumberRule} rule
 * @param {number} value
 * @return {*}  {boolean}
 */
export function isNumberRuleValid(
  rule: BaseNumberRule,
  value: number,
): boolean {
  switch (rule.operator) {
    case "is_equal_to":
      return value === rule.value;
    case "is_not_equal_to":
      return value !== rule.value;
    case "is_greater_than":
      return value > rule.value;
    case "is_greater_than_or_equal_to":
      return value >= rule.value;
    case "is_less_than":
      return value < rule.value;
    case "is_less_than_or_equal_to":
      return value <= rule.value;
    default:
      return false;
  }
}

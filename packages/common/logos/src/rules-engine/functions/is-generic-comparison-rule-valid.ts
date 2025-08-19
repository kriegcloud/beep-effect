import { BaseGenericComparisonRule } from "../schema";

/**
 * Check if a generic comparison rule is valid.
 * @export
 * @param {BaseGenericComparisonRule} rule
 * @param {*} value
 * @return {*}  {boolean}
 */
export function isGenericComparisonRuleValid(
  rule: BaseGenericComparisonRule,
  value: any,
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

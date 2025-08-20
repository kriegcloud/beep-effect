import type { BaseArrayLengthRule } from "../schema";
/**
 * Check if an array length rule is valid.
 * @export
 * @param {BaseArrayLengthRule} rule
 * @param {any[]} value
 * @return {*}  {boolean}
 */
export function isArrayLengthRuleValid(
  rule: BaseArrayLengthRule,
  value: any[],
): boolean {
  switch (rule.operator) {
    case "is_equal_to":
      return value.length === rule.value;
    case "is_not_equal_to":
      return value.length !== rule.value;
    case "is_greater_than":
      return value.length > rule.value;
    case "is_greater_than_or_equal_to":
      return value.length >= rule.value;
    case "is_less_than":
      return value.length < rule.value;
    case "is_less_than_or_equal_to":
      return value.length <= rule.value;
    default:
      return false;
  }
}

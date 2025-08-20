import type { BaseObjectValueRule } from "../schema";

/**
 * Check if an object value rule is valid.
 * @export
 * @param {BaseObjectValueRule} rule
 * @param {object} value
 * @return {*}  {boolean}
 */
export function isObjectValueRuleValid(
  rule: BaseObjectValueRule,
  value: object,
): boolean {
  const values = Object.values(value);
  const contains = values.includes(rule.value);
  switch (rule.operator) {
    case "contains":
      return contains;
    case "does_not_contain":
      return !contains;
    default:
      return false;
  }
}

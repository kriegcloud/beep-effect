import type { BaseObjectKeyRule } from "../schema";

/**
 * Check if an object key rule is valid.
 * @export
 * @param {BaseObjectKeyRule} rule
 * @param {object} value
 * @return {*}  {boolean}
 */
export function isObjectKeyRuleValid(
  rule: BaseObjectKeyRule,
  value: object,
): boolean {
  const keys = Object.keys(value);
  const contains = keys.includes(rule.value);
  switch (rule.operator) {
    case "contains":
      return contains;
    case "does_not_contain":
      return !contains;
    default:
      return false;
  }
}

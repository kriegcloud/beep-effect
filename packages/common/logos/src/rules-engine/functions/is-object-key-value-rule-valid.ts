import type { BaseObjectKeyValuePairRule } from "../schema";

/**
 * Check if an object key value rule is valid.
 * @export
 * @param {BaseObjectKeyValuePairRule} rule
 * @param {object} value
 * @return {*}  {boolean}
 */
export function isObjectKeyValueRuleValid(
  rule: BaseObjectKeyValuePairRule,
  value: object,
): boolean {
  const entries = Object.entries(value);
  const contains = entries.some(
    ([key, value]) => key === rule.value.key && value === rule.value.value,
  );
  switch (rule.operator) {
    case "contains":
      return contains;
    case "does_not_contain":
      return !contains;
    default:
      return false;
  }
}

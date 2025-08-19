import { BaseStringRule } from "../schema";

/**
 * Check if a string rule is valid.
 * @export
 * @param {BaseStringRule} rule
 * @param {string} value
 * @return {*}  {boolean}
 */
export function isStringRuleValid(
  rule: BaseStringRule,
  value: string,
): boolean {
  const caseValue = rule.ignoreCase ? value.toLowerCase().trim() : value.trim();
  const caseRuleValue = rule.ignoreCase
    ? rule.value.toLowerCase().trim()
    : rule.value.trim();
  switch (rule.operator) {
    case "is_equal_to":
      return caseValue === caseRuleValue;
    case "is_not_equal_to":
      return caseValue !== caseRuleValue;
    case "contains":
      return caseValue.includes(caseRuleValue);
    case "does_not_contain":
      return !caseValue.includes(caseRuleValue);
    case "starts_with":
      return caseValue.startsWith(caseRuleValue);
    case "ends_with":
      return caseValue.endsWith(caseRuleValue);
    default:
      return false;
  }
}

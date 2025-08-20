import isPlainObject from "lodash.isplainobject";
import type { BaseGenericTypeRule } from "../schema";

/**
 * Check if a generic type rule is valid.
 * @export
 * @param {BaseGenericTypeRule} rule
 * @param {*} value
 * @return {*}  {boolean}
 */
export function isGenericTypeRuleValid(
  rule: BaseGenericTypeRule,
  value: any,
): boolean {
  switch (rule.operator) {
    case "is_truthy":
      return !!value;
    case "is_falsy":
      return !value;
    case "is_null":
      return value === null;
    case "is_not_null":
      return value !== null;
    case "is_undefined":
      return value === undefined;
    case "is_not_undefined":
      return value !== undefined;
    case "is_string":
      return typeof value === "string";
    case "is_not_string":
      return typeof value !== "string";
    case "is_number":
      return typeof value === "number";
    case "is_not_number":
      return typeof value !== "number";
    case "is_boolean":
      return typeof value === "boolean";
    case "is_not_boolean":
      return typeof value !== "boolean";
    case "is_array":
      return Array.isArray(value);
    case "is_not_array":
      return !Array.isArray(value);
    case "is_object":
      return isPlainObject(value);
    case "is_not_object":
      return !isPlainObject(value);
    default:
      return false;
  }
}

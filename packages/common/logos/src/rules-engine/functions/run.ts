import * as S from "effect/Schema";
import get from "lodash.get";
import { RootUnion, type Rule, Union } from "../schema";
import { isObject } from "../utils/is-object";
import { isArrayLengthRuleValid } from "./is-array-length-rule-valid";
import { isArrayValueRuleValid } from "./is-array-value-rule-valid";
import { isBooleanRuleValid } from "./is-boolean-rule-valid";
import { isGenericComparisonRuleValid } from "./is-generic-comparison-rule-valid";
import { isGenericTypeRuleValid } from "./is-generic-type-rule-valid";
import { isNumberRuleValid } from "./is-number-rule-valid";
import { isObjectKeyRuleValid } from "./is-object-key-rule-valid";
import { isObjectKeyValueRuleValid } from "./is-object-key-value-rule-valid";
import { isObjectValueRuleValid } from "./is-object-value-rule-valid";
import { isStringRuleValid } from "./is-string-rule-valid";

/**
 * Run the rules engine against a value.
 * @export
 * @param {(RootUnion | Union)} union
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(union: RootUnion | Union, value: any): boolean {
  try {
    const validated = S.decodeSync(S.Union(RootUnion, Union))(union);
    if (validated.rules.length === 0) {
      return true;
    }

    const callback = (ruleOrUnion: Rule | Union) => {
      if (ruleOrUnion.entity === "union") {
        return run(ruleOrUnion, value);
      }
      const resolved = get(value, ruleOrUnion.field);

      if (ruleOrUnion._tag === "string" && typeof resolved === "string") {
        return isStringRuleValid(ruleOrUnion, resolved);
      }

      if (ruleOrUnion._tag === "number" && typeof resolved === "number") {
        return isNumberRuleValid(ruleOrUnion, resolved);
      }

      if (ruleOrUnion._tag === "boolean" && typeof resolved === "boolean") {
        return isBooleanRuleValid(ruleOrUnion, resolved);
      }

      if (Array.isArray(resolved)) {
        if (ruleOrUnion._tag === "array_value") {
          return isArrayValueRuleValid(ruleOrUnion, resolved);
        }

        if (ruleOrUnion._tag === "array_length") {
          return isArrayLengthRuleValid(ruleOrUnion, resolved);
        }
      }

      if (isObject(resolved)) {
        if (ruleOrUnion._tag === "object_key") {
          return isObjectKeyRuleValid(ruleOrUnion, resolved);
        }

        if (ruleOrUnion._tag === "object_value") {
          return isObjectValueRuleValid(ruleOrUnion, resolved);
        }

        if (ruleOrUnion._tag === "object_key_value_pair") {
          return isObjectKeyValueRuleValid(ruleOrUnion, resolved);
        }
      }

      if (ruleOrUnion._tag === "generic_comparison") {
        return isGenericComparisonRuleValid(ruleOrUnion, resolved);
      }

      if (ruleOrUnion._tag === "generic_type") {
        return isGenericTypeRuleValid(ruleOrUnion, resolved);
      }
    };

    // If the joiner is an AND, then all rules must be true
    if (validated.combinator === "and") {
      return union.rules.every(callback);
    }

    // If the joiner is an OR, then at least one rule must be true
    return validated.rules.some(callback);
  } catch (error) {
    throw error;
  }
}

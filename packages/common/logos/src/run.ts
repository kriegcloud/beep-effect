import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import get from "lodash.get";
import * as Rules from "./rules";
import type { AnyUnion, RuleOrUnion } from "./types";
import { RootUnion, Union } from "./union";
import { isObject } from "./utils/is-object";

/**
 * Run the rules engine against a value.
 * @export
 * @param {AnyUnion} union
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(union: AnyUnion, value: any): boolean {
  try {
    const validated = F.pipe(
      union,
      S.encodeSync(S.Union(RootUnion, Union)),
      S.decodeSync(S.Union(RootUnion, Union)),
    );

    if (A.isEmptyArray(validated.rules)) {
      return true;
    }

    const callback = (ruleOrUnion: RuleOrUnion) => {
      if (ruleOrUnion.entity === "union") {
        return run(ruleOrUnion, value);
      }
      const resolved = get(value, ruleOrUnion.field);

      if (ruleOrUnion._tag === "string" && typeof resolved === "string") {
        return Rules.StringRule.validate(ruleOrUnion, resolved);
      }

      if (ruleOrUnion._tag === "number" && typeof resolved === "number") {
        return Rules.NumberRule.validate(ruleOrUnion, resolved);
      }

      if (ruleOrUnion._tag === "boolean" && typeof resolved === "boolean") {
        return Rules.BooleanRule.validate(ruleOrUnion, resolved);
      }

      if (Array.isArray(resolved)) {
        if (ruleOrUnion._tag === "arrayValue") {
          return Rules.ArrayValueRule.validate(ruleOrUnion, resolved);
        }

        if (ruleOrUnion._tag === "arrayLength") {
          return Rules.ArrayLengthRule.validate(ruleOrUnion, resolved);
        }
      }

      if (isObject(resolved)) {
        if (ruleOrUnion._tag === "objectKey") {
          return Rules.ObjectKeyRule.validate(ruleOrUnion, resolved);
        }

        if (ruleOrUnion._tag === "objectValue") {
          return Rules.ObjectValueRule.validate(ruleOrUnion, resolved);
        }

        if (ruleOrUnion._tag === "objectKeyValue") {
          return Rules.ObjectKeyValueRule.validate(ruleOrUnion, resolved);
        }
      }

      if (ruleOrUnion._tag === "genericComparison") {
        return Rules.GenericComparisonRule.validate(ruleOrUnion, resolved);
      }

      if (ruleOrUnion._tag === "genericType") {
        return Rules.GenericTypeRule.validate(ruleOrUnion, resolved);
      }
    };

    // If the joiner is an AND, then all rules must be true
    if (validated.logicalOp === "and") {
      return union.rules.every(callback);
    }

    // If the joiner is an OR, then at least one rule must be true
    return validated.rules.some(callback);
  } catch (error) {
    throw error;
  }
}

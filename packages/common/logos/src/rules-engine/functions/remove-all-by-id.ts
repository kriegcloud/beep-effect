import * as A from "effect/Array";
import type { RootUnion, Rule, Union } from "../schema";

/**
 * Removes all rules or unions from a union and nested unions by id.
 * Mutates the original union.
 * @export
 * @template T
 * @param {T} union
 * @param {string} id
 * @return {*}  {T}
 */
export function removeAllById<T extends RootUnion | Union>(
  union: T,
  id: string,
): T {
  union.rules = A.reduce(
    union.rules,
    [] as (Rule | Union)[],
    (list, ruleOrUnion) => {
      if (ruleOrUnion.id !== id) {
        list.push(
          ruleOrUnion.entity === "union"
            ? removeAllById(ruleOrUnion, id)
            : ruleOrUnion,
        );
      }
      return list;
    },
  );
  return union;
}

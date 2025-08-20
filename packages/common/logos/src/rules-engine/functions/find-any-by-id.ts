import * as A from "effect/Array";
import type { RootUnion, Rule, Union } from "../schema";

/**
 * Find a rule or a union by id.
 * @export
 * @param {(RootUnion | Union)} union
 * @param {string} id
 * @return {*}  {(RootUnion | Union | Rule | undefined)}
 */
export function findAnyById(
  union: RootUnion | Union,
  id: string,
): RootUnion | Union | Rule | undefined {
  if (union.id === id) {
    return union;
  }
  return A.reduce(
    union.rules,
    undefined as Union | RootUnion | Rule | undefined,
    (foundUnion, ruleOrUnion) => {
      if (foundUnion) {
        return foundUnion;
      }
      if (ruleOrUnion.id === id) {
        return ruleOrUnion;
      }
      if (ruleOrUnion.entity === "union") {
        return findAnyById(ruleOrUnion, id);
      }
      return foundUnion;
    },
  );
}

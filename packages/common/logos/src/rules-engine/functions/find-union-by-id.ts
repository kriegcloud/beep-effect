import * as A from "effect/Array";
import type { RootUnion, Union } from "../schema";
/**
 * Find a union by id.
 * @export
 * @param {(RootUnion | Union)} union
 * @param {string} id
 * @return {*}  {(RootUnion | Union | undefined)}
 */
export function findUnionById(
  union: RootUnion | Union,
  id: string,
): RootUnion | Union | undefined {
  if (union.id === id) {
    return union;
  }
  return A.reduce(
    union.rules,
    undefined as Union | RootUnion | undefined,
    (foundUnion, ruleOrUnion) => {
      if (foundUnion || ruleOrUnion.entity === "rule") {
        return foundUnion;
      }
      if (ruleOrUnion.id === id) {
        return ruleOrUnion;
      }
      return findUnionById(ruleOrUnion, id);
    },
  );
}

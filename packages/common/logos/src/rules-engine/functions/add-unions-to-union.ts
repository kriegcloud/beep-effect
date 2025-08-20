import type { NewUnion, RootUnion, Union } from "../schema";

import { addUnionToUnion } from "./add-union-to-union";

/**
 * Add many unions to a union.
 * This function will mutate the parent union.
 * @export
 * @param {(RootUnion | Union)} parent
 * @param {NewUnion[]} newUnions
 * @return {*}  {Union[]}
 */
export function addUnionsToUnion(
  parent: RootUnion | Union,
  newUnions: NewUnion[],
): Union[] {
  return newUnions.map((newUnion) => addUnionToUnion(parent, newUnion));
}

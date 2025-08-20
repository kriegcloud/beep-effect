import type { NewUnion, RootUnion, Union } from "../schema";

import { findUnionById } from "./find-union-by-id";

/**
 * Update a union by id.
 * If the union is not found, return undefined.
 * Mutates the root object.
 * @export
 * @param {RootUnion} root
 * @param {string} id
 * @param {NewUnion} values
 * @return {*}  {(Union | RootUnion | undefined)}
 */
export function updateUnionById(
  root: RootUnion,
  id: string,
  values: NewUnion,
): Union | RootUnion | undefined {
  const foundUnion = findUnionById(root, id);
  if (!foundUnion) {
    return;
  }

  // Update the root union
  if (foundUnion.entity === "root_union") {
    foundUnion.combinator = values.combinator;
    return foundUnion;
  }

  // Get parent union to update rules array
  const parent = findUnionById(root, foundUnion.parentId);
  if (!parent) {
    return;
  }

  // Update parent rules array
  parent.rules = parent.rules.map((ruleOrUnion) => {
    if (ruleOrUnion.entity === "union" && ruleOrUnion.id === foundUnion.id) {
      return { ...ruleOrUnion, ...values };
    }
    return ruleOrUnion;
  });

  return findUnionById(root, id);
}

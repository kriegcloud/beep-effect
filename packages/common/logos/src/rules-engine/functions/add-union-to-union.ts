import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import { NewUnion, RootUnion, Union } from "../schema";

/**
 * Add a new union to a union.
 * This function will mutate the parent union.
 * @export
 * @param {(RootUnion | Union)} parent
 * @param {NewUnion} newUnion
 * @return {*}  {Union}
 */
export function addUnionToUnion(
  parent: RootUnion | Union,
  newUnion: NewUnion,
): Union {
  const union = S.decodeSync(Union)({
    ...newUnion,
    id: uuid(),
    parentId: parent.id,
    entity: "union",
    rules: [],
  });
  parent.rules.push(union);
  return union;
}

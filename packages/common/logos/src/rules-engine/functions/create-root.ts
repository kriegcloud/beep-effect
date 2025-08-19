import { v4 as uuid } from "uuid";
import { NewUnion, RootUnion } from "../schema";

/**
 * Creates a new root union.
 * @export
 * @param {NewUnion} newUnion
 * @return {*}  {RootUnion}
 */
export function createRoot(newUnion: NewUnion): RootUnion {
  return { ...newUnion, entity: "root_union", id: uuid(), rules: [] };
}

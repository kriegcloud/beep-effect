import { v4 as uuid } from "uuid";
import type { RootUnion, UnionInput } from "./union";

/**
 * Creates a new root union.
 * @export
 * @param {NewUnion} newUnion
 * @return {*}  {RootUnion}
 */
export function createRoot(newUnion: UnionInput.Type): RootUnion.Type {
  return { ...newUnion, entity: "rootUnion", id: uuid(), rules: [] };
}

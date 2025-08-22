import { v4 as uuid } from "uuid";
import type { GroupInput, RootGroup } from "./ruleGroup";

/**
 * Creates a new root group.
 * @export
 * @param {GroupInput} newGroup
 * @return {*}  {RootGroup}
 */
export function createRootGroup(newGroup: GroupInput.Type): RootGroup.Type {
  return { ...newGroup, entity: "root", id: uuid(), rules: [] };
}

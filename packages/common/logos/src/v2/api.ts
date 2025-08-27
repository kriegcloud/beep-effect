import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HM from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import { Group, GroupInput } from "./Group";
import type { NodeId } from "./internal";
import { findAnyByIdFast, findGroupByIdFast, findRuleByIdFast, getIdIndex, invalidateIdIndex } from "./internal";
import { invalidatePrepared } from "./prepare";
import type { RootGroup } from "./RootGroup";
import { Rule, RuleInput } from "./Rule";
import type {
  AnyNodeOrUndefined,
  RootOrGroup,
  RootOrGroupOrUndefined,
  RuleOrGroup,
  RuleOrGroupInput,
  RuleOrUndefined,
} from "./types";

/**
 * Find a rule or a group by id.
 * @export
 * @param {(RootOrGroup)} group
 * @param {string} id
 * @return {*}  {(AnyNodeOrUndefined)}
 */

export const findAnyById = (group: RootOrGroup, id: NodeId.Type): AnyNodeOrUndefined => {
  if (group.id === id) {
    return group;
  }

  // Fast path via HashMap index when called with a root group
  if (group.node === "root") {
    const fast = findAnyByIdFast(group, id);
    if (fast !== undefined) return fast;
  }

  return A.reduce(group.rules, undefined as AnyNodeOrUndefined, (foundGroup, ruleOrGroup) => {
    if (foundGroup) {
      return foundGroup;
    }
    if (ruleOrGroup.id === id) {
      return ruleOrGroup;
    }
    if (ruleOrGroup.node === "group") {
      return findAnyById(ruleOrGroup, id);
    }
    return foundGroup;
  });
};

/**
 * Find a rule by id.
 * @export
 * @param {RootOrGroup} group
 * @param {NodeId.Type} id
 * @return {*}  {(RuleOrUndefined)}
 */
export const findRuleById = (group: RootOrGroup, id: NodeId.Type): RuleOrUndefined =>
  group.node === "root"
    ? (() => {
        const fast = findRuleByIdFast(group, id);
        if (fast !== undefined) return fast;
        return A.reduce(group.rules, undefined as RuleOrUndefined, (foundRule, ruleOrGroup) => {
          if (foundRule) {
            return foundRule;
          }

          if (ruleOrGroup.node === "rule") {
            return ruleOrGroup.id === id ? ruleOrGroup : undefined;
          }
          return findRuleById(ruleOrGroup, id);
        });
      })()
    : A.reduce(group.rules, undefined as RuleOrUndefined, (foundRule, ruleOrGroup) => {
        if (foundRule) {
          return foundRule;
        }

        if (ruleOrGroup.node === "rule") {
          return ruleOrGroup.id === id ? ruleOrGroup : undefined;
        }
        return findRuleById(ruleOrGroup, id);
      });

/**
 * Find a group by id.
 * @export
 * @param {(RootGroup | Group)} group
 * @param {string} id
 * @return {*}  {(RootGroup | RuleGroup | undefined)}
 */
export function findGroupById(group: RootOrGroup, id: string): RootOrGroupOrUndefined {
  if (group.id === id) {
    return group;
  }
  if (group.node === "root") {
    const fast = findGroupByIdFast(group, id);
    if (fast !== undefined) return fast;
  }
  return A.reduce(group.rules, undefined as RootOrGroupOrUndefined, (foundGroup, ruleOrGroup) => {
    if (foundGroup || ruleOrGroup.node === "rule") {
      return foundGroup;
    }
    if (ruleOrGroup.id === id) {
      return ruleOrGroup;
    }
    return findGroupById(ruleOrGroup, id);
  });
}

/**
 * Removes all rules or groups from a group and nested groups by id.
 * Mutates the original group.
 * @export
 * @template T
 * @param {T} group
 * @param {string} id
 * @return {*}  {T}
 */
export function removeAllById<T extends RootOrGroup>(group: T, id: NodeId.Type): T {
  for (let i = group.rules.length - 1; i >= 0; i--) {
    const child = O.fromNullable(group.rules[i]).pipe(O.getOrThrow);
    if (child.id === id) {
      group.rules.splice(i, 1);
      continue;
    }
    if (child.node === "group") {
      removeAllById(child, id);
    }
  }
  return group;
}

/**
 * Update a rule by id.
 * If the rule is not found, return undefined.
 * Mutates the root object.
 * @export
 * @param {RootGroup.Type} root
 * @param {NodeId.Type} id
 * @param {RuleInput.Type} values
 * @return {*}  {(RuleOrUndefined)}
 */
export const updateRuleById = (root: RootGroup.Type, id: NodeId.Type, values: RuleInput.Type): RuleOrUndefined => {
  const foundRule = findRuleById(root, id);
  if (!foundRule) {
    return;
  }

  // Respect parentId semantics: if parentId is invalid, bail out
  const parent = findGroupById(root, foundRule.parentId);
  if (!parent) {
    return;
  }

  // Use the ID index to get O(1) parent slot
  const { parentOf, indexInParent } = getIdIndex(root);
  const actualParent = O.getOrUndefined(HM.get(parentOf, id));
  if (actualParent && actualParent.id !== parent.id) {
    // parentId does not match structural parent; treat as invalid
    return;
  }
  const idx = O.getOrUndefined(HM.get(indexInParent, id));
  if (idx === undefined) {
    return;
  }
  const next = { ...(parent.rules[idx] as Rule.Type), ...values };
  parent.rules[idx] = next;
  // Invalidate ID index cache for this root, because we replaced the object reference
  // and value changes are not part of the structural fingerprint.
  invalidateIdIndex(root);
  // Explicitly invalidate prepared runner cache to avoid stale runners
  invalidatePrepared(root);
  return next;
};

/**
 * Update a group by id.
 * If the group is not found, return undefined.
 * Mutates the root object.
 * @export
 * @param {RootGroup} root
 * @param {string} id
 * @param {GroupInput.Type} values
 * @return {*}  {(RuleGroup | RootGroup | undefined)}
 */
export const updateGroupById = (
  root: RootGroup.Type,
  id: NodeId.Type,
  values: GroupInput.Type
): RootOrGroupOrUndefined => {
  const foundGroup = findGroupById(root, id);
  if (!foundGroup) {
    return;
  }

  // If updating the root group, mutate it directly
  if (foundGroup.node === "root") {
    foundGroup.logicalOp = values.logicalOp;
    // Conservative: invalidate to reflect updated reference/props
    invalidateIdIndex(root);
    // Group logicalOp affects evaluation; ensure runner cache is refreshed
    invalidatePrepared(root);
    return foundGroup;
  }

  // Otherwise, update the child within its parent in place
  const parent = findGroupById(root, foundGroup.parentId);
  if (!parent) {
    return;
  }
  const { parentOf, indexInParent } = getIdIndex(root);
  const actualParent = O.getOrUndefined(HM.get(parentOf, id));
  if (actualParent && actualParent.id !== parent.id) {
    return;
  }
  const idx = O.getOrUndefined(HM.get(indexInParent, id));
  if (idx === undefined) {
    return;
  }
  const next = { ...(parent.rules[idx] as Group.Type), ...values };
  parent.rules[idx] = next;
  invalidateIdIndex(root);
  // Group updates can affect evaluation ordering/logic; refresh runner cache
  invalidatePrepared(root);
  return next;
};

/**
 * Add a rule to a group.
 * This function will mutate the parent group.
 * @export
 * @param {RootOrGroup} parent
 * @param {RuleInput.Type} newRule
 * @return {*}  {Rule.Type}
 */
export function addRuleToGroup(parent: RootOrGroup, newRule: RuleInput.Type): Rule.Type {
  const rule = F.pipe(
    {
      ...newRule,
      id: uuid(),
      parentId: parent.id,
      node: "rule",
    },
    S.encodeSync(Rule),
    S.decodeSync(Rule)
  );
  parent.rules.push(rule);
  return rule;
}

/**
 * Add a new group to a group.
 * This function will mutate the parent group.
 * @export
 * @param {RootOrGroup} parent
 * @param {GroupInput.Type} newGroup
 * @return {*}  {RuleGroup.Type}
 */
export function addGroup(parent: RootOrGroup, newGroup: GroupInput.Type): Group.Type {
  const group = S.decodeSync(Group)({
    ...newGroup,
    id: uuid(),
    parentId: parent.id,
    node: "group",
    rules: [],
  });
  parent.rules.push(group);
  return group;
}

/**
 * Add a rule to a group.
 * This function will mutate the group.
 * @export
 * @param {(RootGroup | Group)} parent
 * @param {RuleOrGroupInput} newRuleOrGroup
 * @return {*}  {RuleOrGroup}
 */
export function addAnyToGroup(parent: RootOrGroup, newRuleOrGroup: RuleOrGroupInput): RuleOrGroup {
  const isNewRule = (ruleOrGroup: RuleOrGroupInput): ruleOrGroup is RuleInput.Type => S.is(RuleInput)(ruleOrGroup);

  if (isNewRule(newRuleOrGroup)) {
    return addRuleToGroup(parent, newRuleOrGroup);
  }

  return addGroup(parent, S.decodeSync(GroupInput)(newRuleOrGroup));
}

/**
 * Add many rules or groups to a group.
 * This function will mutate the parent group.
 * @export
 * @param {(RootGroup | Group)} parent
 * @param {(Array<RuleOrGroupInput>)} newRulesOrGroups
 * @return {*}  {(Array<RuleOrGroup>)}
 */
export const addManyToGroup = (parent: RootOrGroup, newRulesOrGroups: Array<RuleOrGroupInput>): Array<RuleOrGroup> =>
  A.map(newRulesOrGroups, (newRuleOrGroup) => addAnyToGroup(parent, newRuleOrGroup));

/**
 * Add many rules to a group.
 * This function will mutate the parent group.
 * @export
 * @param {RootOrGroup} parent
 * @param {Array<RuleInput.Type>} newRules
 * @return {*}  {Array<Rule.Type>}
 */
export const addRulesToGroup = (parent: RootOrGroup, newRules: Array<RuleInput.Type>): Array<Rule.Type> =>
  A.map(newRules, (newRule) => addRuleToGroup(parent, newRule));

/**
 * Add many groups to a group.
 * This function will mutate the parent group.
 * @export
 * @param {RootOrGroup} parent
 * @param {Array<GroupInput.Type>} newGroups
 * @return {*}  {Array<RuleGroup.Type>}
 */
export const addGroups = (parent: RootOrGroup, newGroups: Array<GroupInput.Type>): Array<Group.Type> =>
  A.map(newGroups, (newGroup) => addGroup(parent, newGroup));

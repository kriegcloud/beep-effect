import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HM from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import type { NodeId } from "./internal";
import {
  findAnyByIdFast,
  findGroupByIdFast,
  findRuleByIdFast,
  getIdIndex,
  invalidateIdIndex,
} from "./internal";
import { invalidatePrepared } from "./prepare";
import { Rule, RuleInput } from "./Rule";
// import { GroupInput, type RuleSet, RuleGroup } from "./groups";
import { GroupInput, RuleGroup } from "./RuleGroup";
import type { RuleSet } from "./RuleSet";

import type {
  AnyNodeOrUndefined,
  RuleOrGroup,
  RuleOrGroupInput,
  RuleOrUndefined,
  RuleSetOrGroup,
  SetOrGroupOrUndefined,
} from "./types";

/**
 * Find a rule or a group by id.
 * @export
 * @param {(RuleSetOrGroup)} group
 * @param {string} id
 * @return {*}  {(AnyNodeOrUndefined)}
 */

export const findAnyById = (
  group: RuleSetOrGroup,
  id: NodeId.Type,
): AnyNodeOrUndefined => {
  if (group.id === id) {
    return group;
  }

  // Fast path via HashMap index when called with a root group
  if (group.node === "root") {
    const fast = findAnyByIdFast(group, id);
    if (fast !== undefined) return fast;
  }

  return A.reduce(
    group.rules,
    undefined as AnyNodeOrUndefined,
    (foundGroup, ruleOrGroup) => {
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
    },
  );
};

/**
 * Find a rule by id.
 * @export
 * @param {RuleSetOrGroup} group
 * @param {NodeId.Type} id
 * @return {*}  {(RuleOrUndefined)}
 */
export const findRuleById = (
  group: RuleSetOrGroup,
  id: NodeId.Type,
): RuleOrUndefined =>
  group.node === "root"
    ? (() => {
        const fast = findRuleByIdFast(group, id);
        if (fast !== undefined) return fast;
        return A.reduce(
          group.rules,
          undefined as RuleOrUndefined,
          (foundRule, ruleOrGroup) => {
            if (foundRule) {
              return foundRule;
            }

            if (ruleOrGroup.node === "rule") {
              return ruleOrGroup.id === id ? ruleOrGroup : undefined;
            }
            return findRuleById(ruleOrGroup, id);
          },
        );
      })()
    : A.reduce(
        group.rules,
        undefined as RuleOrUndefined,
        (foundRule, ruleOrGroup) => {
          if (foundRule) {
            return foundRule;
          }

          if (ruleOrGroup.node === "rule") {
            return ruleOrGroup.id === id ? ruleOrGroup : undefined;
          }
          return findRuleById(ruleOrGroup, id);
        },
      );

/**
 * Find a group by id.
 * @export
 * @param {(RuleSet | RuleGroup)} group
 * @param {string} id
 * @return {*}  {(RuleSet | RuleGroup | undefined)}
 */
export function findGroupById(
  group: RuleSetOrGroup,
  id: string,
): SetOrGroupOrUndefined {
  if (group.id === id) {
    return group;
  }
  if (group.node === "root") {
    const fast = findGroupByIdFast(group, id);
    if (fast !== undefined) return fast;
  }
  return A.reduce(
    group.rules,
    undefined as SetOrGroupOrUndefined,
    (foundGroup, ruleOrGroup) => {
      if (foundGroup || ruleOrGroup.node === "rule") {
        return foundGroup;
      }
      if (ruleOrGroup.id === id) {
        return ruleOrGroup;
      }
      return findGroupById(ruleOrGroup, id);
    },
  );
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
export function removeAllById<T extends RuleSetOrGroup>(
  group: T,
  id: NodeId.Type,
): T {
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
 * @param {RuleSet.Type} root
 * @param {NodeId.Type} id
 * @param {RuleInput.Type} values
 * @return {*}  {(RuleOrUndefined)}
 */
export const updateRuleById = (
  root: RuleSet.Type,
  id: NodeId.Type,
  values: RuleInput.Type,
): RuleOrUndefined => {
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
 * @param {RuleSet} root
 * @param {string} id
 * @param {GroupInput.Type} values
 * @return {*}  {(RuleGroup | RuleSet | undefined)}
 */
export const updateGroupById = (
  root: RuleSet.Type,
  id: NodeId.Type,
  values: GroupInput.Type,
): SetOrGroupOrUndefined => {
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
  const next = { ...(parent.rules[idx] as RuleGroup.Type), ...values };
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
 * @param {RuleSetOrGroup} parent
 * @param {RuleInput.Type} newRule
 * @return {*}  {Rule.Type}
 */
export function addRuleToGroup(
  parent: RuleSetOrGroup,
  newRule: RuleInput.Type,
): Rule.Type {
  const rule = F.pipe(
    {
      ...newRule,
      id: uuid(),
      parentId: parent.id,
      node: "rule",
    },
    S.encodeSync(Rule),
    S.decodeSync(Rule),
  );
  parent.rules.push(rule);
  return rule;
}

/**
 * Add a new group to a group.
 * This function will mutate the parent group.
 * @export
 * @param {RuleSetOrGroup} parent
 * @param {GroupInput.Type} newGroup
 * @return {*}  {RuleGroup.Type}
 */
export function addGroup(
  parent: RuleSetOrGroup,
  newGroup: GroupInput.Type,
): RuleGroup.Type {
  const group = S.decodeSync(RuleGroup)({
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
 * @param {(RuleSet | RuleGroup)} parent
 * @param {RuleOrGroupInput} newRuleOrGroup
 * @return {*}  {RuleOrGroup}
 */
export function addAnyToGroup(
  parent: RuleSetOrGroup,
  newRuleOrGroup: RuleOrGroupInput,
): RuleOrGroup {
  const isNewRule = (
    ruleOrGroup: RuleOrGroupInput,
  ): ruleOrGroup is RuleInput.Type => S.is(RuleInput)(ruleOrGroup);

  if (isNewRule(newRuleOrGroup)) {
    return addRuleToGroup(parent, newRuleOrGroup);
  }

  return addGroup(parent, S.decodeSync(GroupInput)(newRuleOrGroup));
}

/**
 * Add many rules or groups to a group.
 * This function will mutate the parent group.
 * @export
 * @param {(RuleSet | RuleGroup)} parent
 * @param {(Array<RuleOrGroupInput>)} newRulesOrGroups
 * @return {*}  {(Array<RuleOrGroup>)}
 */
export const addManyToGroup = (
  parent: RuleSetOrGroup,
  newRulesOrGroups: Array<RuleOrGroupInput>,
): Array<RuleOrGroup> =>
  A.map(newRulesOrGroups, (newRuleOrGroup) =>
    addAnyToGroup(parent, newRuleOrGroup),
  );

/**
 * Add many rules to a group.
 * This function will mutate the parent group.
 * @export
 * @param {RuleSetOrGroup} parent
 * @param {Array<RuleInput.Type>} newRules
 * @return {*}  {Array<Rule.Type>}
 */
export const addRulesToGroup = (
  parent: RuleSetOrGroup,
  newRules: Array<RuleInput.Type>,
): Array<Rule.Type> =>
  A.map(newRules, (newRule) => addRuleToGroup(parent, newRule));

/**
 * Add many groups to a group.
 * This function will mutate the parent group.
 * @export
 * @param {RuleSetOrGroup} parent
 * @param {Array<GroupInput.Type>} newGroups
 * @return {*}  {Array<RuleGroup.Type>}
 */
export const addGroups = (
  parent: RuleSetOrGroup,
  newGroups: Array<GroupInput.Type>,
): Array<RuleGroup.Type> =>
  A.map(newGroups, (newGroup) => addGroup(parent, newGroup));

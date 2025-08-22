import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HM from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import type { EntityId } from "./internal";
import {
  findAnyByIdFast,
  findGroupByIdFast,
  findRuleByIdFast,
  getIdIndex,
  invalidateIdIndex,
} from "./internal/idIndex";
import { GroupInput, type RootGroup, RuleGroup } from "./ruleGroup";
import { Rule, RuleInput } from "./rules";
import type {
  AnyEntityOrUndefined,
  RuleOrRuleGroup,
  RuleOrRuleGroupInput,
  RuleOrUndefined,
  TreeOrRuleGroup,
  TreeOrRuleGroupOrUndefined,
} from "./types";

/**
 * Find a rule or a group by id.
 * @export
 * @param {(TreeOrRuleGroup)} group
 * @param {string} id
 * @return {*}  {(AnyEntityOrUndefined)}
 */

export const findAnyById = (
  group: TreeOrRuleGroup,
  id: EntityId.Type,
): AnyEntityOrUndefined => {
  if (group.id === id) {
    return group;
  }

  // Fast path via HashMap index when called with a root group
  if (group.entity === "root") {
    const fast = findAnyByIdFast(group, id);
    if (fast !== undefined) return fast;
  }

  return A.reduce(
    group.rules,
    undefined as AnyEntityOrUndefined,
    (foundGroup, ruleOrGroup) => {
      if (foundGroup) {
        return foundGroup;
      }
      if (ruleOrGroup.id === id) {
        return ruleOrGroup;
      }
      if (ruleOrGroup.entity === "group") {
        return findAnyById(ruleOrGroup, id);
      }
      return foundGroup;
    },
  );
};

/**
 * Find a rule by id.
 * @export
 * @param {TreeOrRuleGroup} group
 * @param {EntityId.Type} id
 * @return {*}  {(RuleOrUndefined)}
 */
export const findRuleById = (
  group: TreeOrRuleGroup,
  id: EntityId.Type,
): RuleOrUndefined =>
  group.entity === "root"
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

            if (ruleOrGroup.entity === "rule") {
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

          if (ruleOrGroup.entity === "rule") {
            return ruleOrGroup.id === id ? ruleOrGroup : undefined;
          }
          return findRuleById(ruleOrGroup, id);
        },
      );

/**
 * Find a group by id.
 * @export
 * @param {(RootGroup | RuleGroup)} group
 * @param {string} id
 * @return {*}  {(RootGroup | RuleGroup | undefined)}
 */
export function findGroupById(
  group: TreeOrRuleGroup,
  id: string,
): TreeOrRuleGroupOrUndefined {
  if (group.id === id) {
    return group;
  }
  if (group.entity === "root") {
    const fast = findGroupByIdFast(group, id);
    if (fast !== undefined) return fast;
  }
  return A.reduce(
    group.rules,
    undefined as TreeOrRuleGroupOrUndefined,
    (foundGroup, ruleOrGroup) => {
      if (foundGroup || ruleOrGroup.entity === "rule") {
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
export function removeAllById<T extends TreeOrRuleGroup>(
  group: T,
  id: EntityId.Type,
): T {
  for (let i = group.rules.length - 1; i >= 0; i--) {
    const child = O.fromNullable(group.rules[i]).pipe(O.getOrThrow);
    if (child.id === id) {
      group.rules.splice(i, 1);
      continue;
    }
    if (child.entity === "group") {
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
 * @param {EntityId.Type} id
 * @param {RuleInput.Type} values
 * @return {*}  {(RuleOrUndefined)}
 */
export const updateRuleById = (
  root: RootGroup.Type,
  id: EntityId.Type,
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
  id: EntityId.Type,
  values: GroupInput.Type,
): TreeOrRuleGroupOrUndefined => {
  const foundGroup = findGroupById(root, id);
  if (!foundGroup) {
    return;
  }

  // If updating the root group, mutate it directly
  if (foundGroup.entity === "root") {
    foundGroup.logicalOp = values.logicalOp;
    // Conservative: invalidate to reflect updated reference/props
    invalidateIdIndex(root);
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
  return next;
};

/**
 * Add a rule to a group.
 * This function will mutate the parent group.
 * @export
 * @param {TreeOrRuleGroup} parent
 * @param {RuleInput.Type} newRule
 * @return {*}  {Rule.Type}
 */
export function addRuleToGroup(
  parent: TreeOrRuleGroup,
  newRule: RuleInput.Type,
): Rule.Type {
  const rule = F.pipe(
    {
      ...newRule,
      id: uuid(),
      parentId: parent.id,
      entity: "rule",
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
 * @param {TreeOrRuleGroup} parent
 * @param {GroupInput.Type} newGroup
 * @return {*}  {RuleGroup.Type}
 */
export function addGroupToRoot(
  parent: TreeOrRuleGroup,
  newGroup: GroupInput.Type,
): RuleGroup.Type {
  const group = S.decodeSync(RuleGroup)({
    ...newGroup,
    id: uuid(),
    parentId: parent.id,
    entity: "group",
    rules: [],
  });
  parent.rules.push(group);
  return group;
}

/**
 * Add a rule to a group.
 * This function will mutate the group.
 * @export
 * @param {(RootGroup | RuleGroup)} parent
 * @param {RuleOrRuleGroupInput} newRuleOrRuleGroup
 * @return {*}  {RuleOrRuleGroup}
 */
export function addAnyToGroup(
  parent: TreeOrRuleGroup,
  newRuleOrRuleGroup: RuleOrRuleGroupInput,
): RuleOrRuleGroup {
  const isNewRule = (
    ruleOrGroup: RuleOrRuleGroupInput,
  ): ruleOrGroup is RuleInput.Type => S.is(RuleInput)(ruleOrGroup);

  if (isNewRule(newRuleOrRuleGroup)) {
    return addRuleToGroup(parent, newRuleOrRuleGroup);
  }

  return addGroupToRoot(parent, S.decodeSync(GroupInput)(newRuleOrRuleGroup));
}

/**
 * Add many rules or groups to a group.
 * This function will mutate the parent group.
 * @export
 * @param {(RootGroup | RuleGroup)} parent
 * @param {(Array<RuleOrRuleGroupInput>)} newRulesOrGroups
 * @return {*}  {(Array<RuleOrRuleGroup>)}
 */
export const addManyToGroup = (
  parent: TreeOrRuleGroup,
  newRulesOrGroups: Array<RuleOrRuleGroupInput>,
): Array<RuleOrRuleGroup> =>
  A.map(newRulesOrGroups, (newRuleOrRuleGroup) =>
    addAnyToGroup(parent, newRuleOrRuleGroup),
  );

/**
 * Add many rules to a group.
 * This function will mutate the parent group.
 * @export
 * @param {TreeOrRuleGroup} parent
 * @param {Array<RuleInput.Type>} newRules
 * @return {*}  {Array<Rule.Type>}
 */
export const addRulesToGroup = (
  parent: TreeOrRuleGroup,
  newRules: Array<RuleInput.Type>,
): Array<Rule.Type> =>
  A.map(newRules, (newRule) => addRuleToGroup(parent, newRule));

/**
 * Add many groups to a group.
 * This function will mutate the parent group.
 * @export
 * @param {TreeOrRuleGroup} parent
 * @param {Array<GroupInput.Type>} newGroups
 * @return {*}  {Array<RuleGroup.Type>}
 */
export const addGroupsToRoot = (
  parent: TreeOrRuleGroup,
  newGroups: Array<GroupInput.Type>,
): Array<RuleGroup.Type> =>
  A.map(newGroups, (newGroup) => addGroupToRoot(parent, newGroup));

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import type { EntityId } from "./internal";
import { Rule, RuleInput } from "./rules";
import type {
  AnyEntityOrUndefined,
  AnyUnion,
  AnyUnionOrUndefined,
  RuleOrUndefined,
  RuleOrUnion,
  RuleOrUnionInput,
} from "./types";
import { type RootUnion, Union, UnionInput } from "./union";

/**
 * Find a rule or a union by id.
 * @export
 * @param {(AnyUnion)} union
 * @param {string} id
 * @return {*}  {(AnyEntityOrUndefined)}
 */

export const findAnyById = (
  union: AnyUnion,
  id: EntityId.Type,
): AnyEntityOrUndefined => {
  if (union.id === id) {
    return union;
  }

  return A.reduce(
    union.rules,
    undefined as AnyEntityOrUndefined,
    (foundUnion, ruleOrUnion) => {
      if (foundUnion) {
        return foundUnion;
      }
      if (ruleOrUnion.id === id) {
        return ruleOrUnion;
      }
      if (ruleOrUnion.entity === "union") {
        return findAnyById(ruleOrUnion, id);
      }
      return foundUnion;
    },
  );
};

/**
 * Find a rule by id.
 * @export
 * @param {AnyUnion} union
 * @param {EntityId.Type} id
 * @return {*}  {(RuleOrUndefined)}
 */
export const findRuleById = (
  union: AnyUnion,
  id: EntityId.Type,
): RuleOrUndefined =>
  A.reduce(
    union.rules,
    undefined as RuleOrUndefined,
    (foundRule, ruleOrUnion) => {
      if (foundRule) {
        return foundRule;
      }

      if (ruleOrUnion.entity === "rule") {
        return ruleOrUnion.id === id ? ruleOrUnion : undefined;
      }
      return findRuleById(ruleOrUnion, id);
    },
  );

/**
 * Find a union by id.
 * @export
 * @param {(RootUnion | Union)} union
 * @param {string} id
 * @return {*}  {(RootUnion | Union | undefined)}
 */
export function findUnionById(
  union: AnyUnion,
  id: string,
): AnyUnionOrUndefined {
  if (union.id === id) {
    return union;
  }
  return A.reduce(
    union.rules,
    undefined as AnyUnionOrUndefined,
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

/**
 * Removes all rules or unions from a union and nested unions by id.
 * Mutates the original union.
 * @export
 * @template T
 * @param {T} union
 * @param {string} id
 * @return {*}  {T}
 */
export function removeAllById<T extends AnyUnion>(
  union: T,
  id: EntityId.Type,
): T {
  for (let i = union.rules.length - 1; i >= 0; i--) {
    const child = union.rules[i]!;
    if (child.id === id) {
      union.rules.splice(i, 1);
      continue;
    }
    if (child.entity === "union") {
      removeAllById(child, id);
    }
  }
  return union;
}

/**
 * Update a rule by id.
 * If the rule is not found, return undefined.
 * Mutates the root object.
 * @export
 * @param {RootUnion.Type} root
 * @param {EntityId.Type} id
 * @param {RuleInput.Type} values
 * @return {*}  {(RuleOrUndefined)}
 */
export const updateRuleById = (
  root: RootUnion.Type,
  id: EntityId.Type,
  values: RuleInput.Type,
): RuleOrUndefined => {
  const foundRule = findRuleById(root, id);
  if (!foundRule) {
    return;
  }

  const parent = findUnionById(root, foundRule.parentId);
  if (!parent) {
    return;
  }
  const idx = parent.rules.findIndex(
    (n) => n.entity === "rule" && n.id === foundRule.id,
  );
  if (idx < 0) {
    return;
  }
  const next = { ...(parent.rules[idx] as Rule.Type), ...values } as Rule.Type;
  parent.rules[idx] = next;
  return next;
};

/**
 * Update a union by id.
 * If the union is not found, return undefined.
 * Mutates the root object.
 * @export
 * @param {RootUnion} root
 * @param {string} id
 * @param {UnionInput.Type} values
 * @return {*}  {(Union | RootUnion | undefined)}
 */
export const updateUnionById = (
  root: RootUnion.Type,
  id: EntityId.Type,
  values: UnionInput.Type,
): AnyUnionOrUndefined => {
  const foundUnion = findUnionById(root, id);
  if (!foundUnion) {
    return;
  }

  // If updating the root union, mutate it directly
  if (foundUnion.entity === "rootUnion") {
    foundUnion.logicalOp = values.logicalOp;
    return foundUnion;
  }

  // Otherwise, update the child within its parent in place
  const parent = findUnionById(root, foundUnion.parentId);
  if (!parent) {
    return;
  }
  const idx = parent.rules.findIndex(
    (n) => n.entity === "union" && n.id === id,
  );
  if (idx < 0) {
    return;
  }
  const next = { ...(parent.rules[idx] as Union.Type), ...values } as Union.Type;
  parent.rules[idx] = next;
  return next;
};

/**
 * Add a rule to a union.
 * This function will mutate the parent union.
 * @export
 * @param {AnyUnion} parent
 * @param {RuleInput.Type} newRule
 * @return {*}  {Rule.Type}
 */
export function addRuleToUnion(
  parent: AnyUnion,
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
 * Add a new union to a union.
 * This function will mutate the parent union.
 * @export
 * @param {AnyUnion} parent
 * @param {UnionInput.Type} newUnion
 * @return {*}  {Union.Type}
 */
export function addUnionToUnion(
  parent: AnyUnion,
  newUnion: UnionInput.Type,
): Union.Type {
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

/**
 * Add a rule to a union.
 * This function will mutate the union.
 * @export
 * @param {(RootUnion | Union)} parent
 * @param {RuleOrUnionInput} newRuleOrUnion
 * @return {*}  {RuleOrUnion}
 */
export function addAnyToUnion(
  parent: AnyUnion,
  newRuleOrUnion: RuleOrUnionInput,
): RuleOrUnion {
  const isNewRule = (
    ruleOrUnion: RuleOrUnionInput,
  ): ruleOrUnion is RuleInput.Type => S.is(RuleInput)(ruleOrUnion);

  if (isNewRule(newRuleOrUnion)) {
    return addRuleToUnion(parent, newRuleOrUnion);
  }

  return addUnionToUnion(parent, S.decodeSync(UnionInput)(newRuleOrUnion));
}

/**
 * Add many rules or unions to a union.
 * This function will mutate the parent union.
 * @export
 * @param {(RootUnion | Union)} parent
 * @param {(Array<RuleOrUnionInput>)} newRulesOrUnions
 * @return {*}  {(Array<RuleOrUnion>)}
 */
export const addManyToUnion = (
  parent: AnyUnion,
  newRulesOrUnions: Array<RuleOrUnionInput>,
): Array<RuleOrUnion> =>
  A.map(newRulesOrUnions, (newRuleOrUnion) =>
    addAnyToUnion(parent, newRuleOrUnion),
  );

/**
 * Add many rules to a union.
 * This function will mutate the parent union.
 * @export
 * @param {AnyUnion} parent
 * @param {Array<RuleInput.Type>} newRules
 * @return {*}  {Array<Rule.Type>}
 */
export const addRulesToUnion = (
  parent: AnyUnion,
  newRules: Array<RuleInput.Type>,
): Array<Rule.Type> =>
  A.map(newRules, (newRule) => addRuleToUnion(parent, newRule));

/**
 * Add many unions to a union.
 * This function will mutate the parent union.
 * @export
 * @param {AnyUnion} parent
 * @param {Array<UnionInput.Type>} newUnions
 * @return {*}  {Array<Union.Type>}
 */
export const addUnionsToUnion = (
  parent: AnyUnion,
  newUnions: Array<UnionInput.Type>,
): Array<Union.Type> =>
  A.map(newUnions, (newUnion) => addUnionToUnion(parent, newUnion));

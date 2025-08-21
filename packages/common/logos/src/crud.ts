import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type * as Types from "effect/Types";
import { create } from "mutative";
import { v4 as uuid } from "uuid";
import type { EntityId } from "./internal";
import { Rule, RuleInput } from "./rules";
import type {
  AnyEntity,
  AnyUnion,
  RuleOrUnion,
  RuleOrUnionInput,
} from "./types";
import { type RootUnion, Union, UnionInput } from "./union";
/**
 * Find a rule or a union by id.
 * @export
 * @param {(AnyUnion)} union
 * @param {string} id
 * @return {*}  {(AnyEntity | undefined)}
 */

export const findAnyById = (
  union: AnyUnion,
  id: EntityId.Type,
): AnyEntity | undefined => {
  if (union.id === id) {
    return union;
  }

  return A.reduce(
    union.rules,
    undefined as AnyEntity | undefined,
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
 * @return {*}  {(Rule.Type | undefined)}
 */
export const findRuleById = (
  union: AnyUnion,
  id: EntityId.Type,
): Rule.Type | undefined =>
  A.reduce(
    union.rules,
    undefined as Rule.Type | undefined,
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
): AnyUnion | undefined {
  if (union.id === id) {
    return union;
  }
  return A.reduce(
    union.rules,
    undefined as AnyUnion | undefined,
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
  const updated = create(union, (draft: Types.Mutable<AnyUnion>) => {
    // IMPORTANT: build from the ORIGINAL children to recurse on original refs
    const nextRules = A.reduce(
      union.rules,
      [] as Array<RuleOrUnion>,
      (list, child) => {
        if (child.id !== id) {
          if (child.entity === "union") {
            // recurse on ORIGINAL child to update it in-place
            const updatedChild = removeAllById(child, id);
            list.push(updatedChild);
          } else {
            list.push(child);
          }
        }
        return list;
      },
    );
    // TS2540: Cannot assign to rules because it is a read-only property.
    draft.rules = nextRules;
  }) as T;

  // Reflect changes on the original object to preserve current API expectations
  Object.assign(union, updated);
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
 * @return {*}  {(Rule.Type | undefined)}
 */
export const updateRuleById = (
  root: RootUnion.Type,
  id: EntityId.Type,
  values: RuleInput.Type,
): Rule.Type | undefined => {
  const foundRule = findRuleById(root, id);
  if (!foundRule) {
    return;
  }

  const parent = findUnionById(root, foundRule.parentId);
  if (!parent) {
    return;
  }

  let changed = false;
  const updatedParent = create(parent, (draft: Types.Mutable<AnyUnion>) => {
    // TS2540: Cannot assign to rules because it is a read-only property.
    draft.rules = A.map(draft.rules, (ruleOrUnion) => {
      if (ruleOrUnion.entity === "rule" && ruleOrUnion.id === foundRule.id) {
        changed = true;
        return { ...ruleOrUnion, ...values } as Rule.Type;
      }
      return ruleOrUnion;
    });
  }) as AnyUnion;

  if (!changed) {
    return;
  }

  Object.assign(parent, updatedParent);
  return findRuleById(root, id);
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
): AnyUnion | undefined => {
  const foundUnion = findUnionById(root, id);
  if (!foundUnion) {
    return;
  }

  // If updating the root union, mutate it directly
  if (foundUnion.entity === "rootUnion") {
    const updatedRoot = create(foundUnion, (draft: AnyUnion) => {
      (draft as any).logicalOp = values.logicalOp;
    }) as AnyUnion;
    Object.assign(foundUnion, updatedRoot);
    return foundUnion;
  }

  // Otherwise, update the child within its parent in place
  const parent = findUnionById(root, (foundUnion as any).parentId);
  if (!parent) {
    return;
  }

  let changed = false;
  const updatedParent = create(parent, (draft: Types.Mutable<AnyUnion>) => {
    draft.rules = A.map(draft.rules, (ruleOrUnion) => {
      if (ruleOrUnion.entity === "union" && ruleOrUnion.id === id) {
        changed = true;
        return { ...ruleOrUnion, ...values } as Union.Type;
      }
      return ruleOrUnion;
    });
  }) as AnyUnion;

  if (!changed) {
    return;
  }

  Object.assign(parent, updatedParent);
  return findUnionById(root, id);
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

  const updatedParent = create(parent, (draft: AnyUnion) => {
    draft.rules.push(rule);
  }) as AnyUnion;
  Object.assign(parent, updatedParent);
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
  const updatedParent = create(parent, (draft: AnyUnion) => {
    draft.rules.push(union);
  }) as AnyUnion;
  Object.assign(parent, updatedParent);
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

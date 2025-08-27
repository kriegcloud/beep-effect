import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import type { RuleSet } from "../RuleSet";
import type {
  AnyNode,
  AnyNodeOrUndefined,
  RuleSetOrGroup,
  SetOrGroupOrUndefined,
} from "../types";
import { FingerPrint } from "./fingerprint";

export type IdIndex = Readonly<{
  byId: HashMap.HashMap<string, AnyNode>;
  parentOf: HashMap.HashMap<string, RuleSetOrGroup>;
  indexInParent: HashMap.HashMap<string, number>;
  fp: string;
}>;

// In-memory cache keyed by the root group object. Automatically GC'ed with the root.
const cache = new WeakMap<RuleSet.Type, IdIndex>();

export const buildIdIndex = (root: RuleSet.Type, fp: string): IdIndex => {
  let byId = HashMap.empty<string, AnyNode>();
  let parentOf = HashMap.empty<string, RuleSetOrGroup>();
  let indexInParent = HashMap.empty<string, number>();

  const visitGroup = (u: RuleSetOrGroup): void => {
    byId = HashMap.set(byId, u.id, u);
    for (let i = 0; i < u.rules.length; i++) {
      const child = u.rules[i]!;
      if (child.node === "group") {
        parentOf = HashMap.set(parentOf, child.id, u);
        indexInParent = HashMap.set(indexInParent, child.id, i);
        visitGroup(child);
      } else {
        byId = HashMap.set(byId, child.id, child);
        parentOf = HashMap.set(parentOf, child.id, u);
        indexInParent = HashMap.set(indexInParent, child.id, i);
      }
    }
  };

  visitGroup(root);
  return { byId, parentOf, indexInParent, fp };
};

export function getIdIndex(root: RuleSet.Type): IdIndex {
  const fp = FingerPrint.make(root);
  const cached = cache.get(root);
  if (cached && cached.fp === fp) return cached;
  const built = buildIdIndex(root, fp);
  cache.set(root, built);
  return built;
}

export function invalidateIdIndex(root: RuleSet.Type): void {
  cache.delete(root);
}

export function findAnyByIdFast(
  root: RuleSet.Type,
  id: string,
): AnyNodeOrUndefined {
  const { byId } = getIdIndex(root);
  return O.getOrUndefined(HashMap.get(byId, id));
}

export function findGroupByIdFast(
  root: RuleSet.Type,
  id: string,
): SetOrGroupOrUndefined {
  const found = findAnyByIdFast(root, id);
  return found && found.node !== "rule" ? found : undefined;
}

export function findRuleByIdFast(root: RuleSet.Type, id: string) {
  const found = findAnyByIdFast(root, id);
  return found && found.node === "rule" ? found : undefined;
}

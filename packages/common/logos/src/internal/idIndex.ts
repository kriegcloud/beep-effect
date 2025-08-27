import * as HM from "effect/HashMap";
import * as O from "effect/Option";
import type { RootGroup, RuleGroup } from "../groups";
import type { RootOrRuleGroup, RuleOrRuleGroup } from "../types";
import { fingerprint } from "./fingerprint";

// In-memory cache keyed by the root group object. Automatically GC'ed with the root.
const cache = new WeakMap<RootGroup.Type, IdIndex>();

export type IdIndex = Readonly<{
  byId: HM.HashMap<string, RuleOrRuleGroup | RootOrRuleGroup>;
  parentOf: HM.HashMap<string, RootOrRuleGroup>;
  indexInParent: HM.HashMap<string, number>;
  fp: string;
}>;

export function buildIdIndex(root: RootGroup.Type, fp: string): IdIndex {
  let byId = HM.empty<string, RuleOrRuleGroup | RootOrRuleGroup>();
  let parentOf = HM.empty<string, RootOrRuleGroup>();
  let indexInParent = HM.empty<string, number>();

  const visitGroup = (u: RuleGroup.Type | RootGroup.Type): void => {
    byId = HM.set(byId, u.id, u);
    for (let i = 0; i < u.rules.length; i++) {
      const child = u.rules[i]!;
      if (child.node === "group") {
        parentOf = HM.set(parentOf, child.id, u);
        indexInParent = HM.set(indexInParent, child.id, i);
        visitGroup(child);
      } else {
        byId = HM.set(byId, child.id, child);
        parentOf = HM.set(parentOf, child.id, u);
        indexInParent = HM.set(indexInParent, child.id, i);
      }
    }
  };

  visitGroup(root);
  return { byId, parentOf, indexInParent, fp };
}

export function getIdIndex(root: RootGroup.Type): IdIndex {
  const fp = fingerprint(root);
  const cached = cache.get(root);
  if (cached && cached.fp === fp) return cached;
  const built = buildIdIndex(root, fp);
  cache.set(root, built);
  return built;
}

export function invalidateIdIndex(root: RootGroup.Type): void {
  cache.delete(root);
}

export function findAnyByIdFast(root: RootGroup.Type, id: string): RuleOrRuleGroup | RootOrRuleGroup | undefined {
  const { byId } = getIdIndex(root);
  return O.getOrUndefined(HM.get(byId, id));
}

export function findGroupByIdFast(root: RootGroup.Type, id: string): RootOrRuleGroup | undefined {
  const found = findAnyByIdFast(root, id);
  return found && found.node !== "rule" ? found : undefined;
}

export function findRuleByIdFast(root: RootGroup.Type, id: string) {
  const found = findAnyByIdFast(root, id);
  return found && found.node === "rule" ? found : undefined;
}

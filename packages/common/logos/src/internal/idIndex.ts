import * as HM from "effect/HashMap";
import * as O from "effect/Option";
import type { AnyUnion, RuleOrUnion } from "../types";
import type { RootUnion, Union } from "../union";
import { fingerprint } from "./fingerprint";

// In-memory cache keyed by the root union object. Automatically GC'ed with the root.
const cache = new WeakMap<RootUnion.Type, IdIndex>();

export type IdIndex = Readonly<{
  byId: HM.HashMap<string, RuleOrUnion | AnyUnion>;
  parentOf: HM.HashMap<string, AnyUnion>;
  indexInParent: HM.HashMap<string, number>;
  fp: string;
}>;

export function buildIdIndex(root: RootUnion.Type, fp: string): IdIndex {
  let byId = HM.empty<string, RuleOrUnion | AnyUnion>();
  let parentOf = HM.empty<string, AnyUnion>();
  let indexInParent = HM.empty<string, number>();

  const visitUnion = (u: Union.Type | RootUnion.Type): void => {
    byId = HM.set(byId, u.id, u);
    for (let i = 0; i < u.rules.length; i++) {
      const child = u.rules[i]!;
      if (child.entity === "union") {
        parentOf = HM.set(parentOf, child.id, u);
        indexInParent = HM.set(indexInParent, child.id, i);
        visitUnion(child);
      } else {
        byId = HM.set(byId, child.id, child);
        parentOf = HM.set(parentOf, child.id, u);
        indexInParent = HM.set(indexInParent, child.id, i);
      }
    }
  };

  visitUnion(root);
  return { byId, parentOf, indexInParent, fp };
}

export function getIdIndex(root: RootUnion.Type): IdIndex {
  const fp = fingerprint(root);
  const cached = cache.get(root);
  if (cached && cached.fp === fp) return cached;
  const built = buildIdIndex(root, fp);
  cache.set(root, built);
  return built;
}

export function invalidateIdIndex(root: RootUnion.Type): void {
  cache.delete(root);
}

export function findAnyByIdFast(
  root: RootUnion.Type,
  id: string,
): RuleOrUnion | AnyUnion | undefined {
  const { byId } = getIdIndex(root);
  return O.getOrUndefined(HM.get(byId, id));
}

export function findUnionByIdFast(
  root: RootUnion.Type,
  id: string,
): AnyUnion | undefined {
  const found = findAnyByIdFast(root, id);
  return found && found.entity !== "rule" ? found : undefined;
}

export function findRuleByIdFast(root: RootUnion.Type, id: string) {
  const found = findAnyByIdFast(root, id);
  return found && found.entity === "rule" ? found : undefined;
}

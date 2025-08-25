import * as O from "effect/Option";
import type { RootGroup, RuleGroup } from "../groups";
import type { AnyOperator } from "../operators";
import type * as RulesMod from "../rules";
export const getFingerPrintPayload = (operator: AnyOperator.Type) => {
  switch (
    operator
    // etc
  ) {
  }
};

/**
 * Computes a structural fingerprint of a group root to detect changes.
 * Includes logical ops, and full rule payloads that affect evaluation.
 * Excludes volatile rule ids (id, parentId). Serializes RegExp deterministically.
 */
export function fingerprint(u: RuleGroup.Type | RootGroup.Type): string {
  const parts: string[] = [];
  const walk = (node: RuleGroup.Type | RootGroup.Type): void => {
    parts.push(`U:${node.logicalOp}`);
    for (let i = 0; i < node.rules.length; i++) {
      const child = O.fromNullable(node.rules[i]).pipe(O.getOrThrow);
      if (child.node === "group") {
        walk(child);
      } else {
        const r = child as RulesMod.Rule.Type;
        const payload = JSON.stringify(r, (k, v) => {
          if (k === "id" || k === "parentId") return undefined;
          if (v instanceof RegExp) return `re:/${v.source}/${v.flags}`;
          return v;
        });
        parts.push(`R:${payload}`);
      }
    }
  };
  walk(u);
  return parts.join("|");
}

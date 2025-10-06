import * as O from "effect/Option";
import type { RootGroup, RuleGroup } from "../groups";
import { fingerprintOperator } from "../operators";

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
        const payload = JSON.stringify(child, (k, v) => {
          if (k === "id" || k === "parentId") return undefined;
          if (k === "op") return fingerprintOperator(v);
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

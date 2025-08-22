import * as O from "effect/Option";
import type { RootGroup, RuleGroup } from "../groups";
import type { Rule } from "../rules";

/**
 * Computes a structural fingerprint of a group root to detect changes.
 * Includes node ids, logical ops, rule tags, fields, and operator tags.
 */
export function fingerprint(u: RuleGroup.Type | RootGroup.Type): string {
  const parts: string[] = [];
  const walk = (node: RuleGroup.Type | RootGroup.Type): void => {
    parts.push(`U:${node.id}:${node.logicalOp}`);
    for (let i = 0; i < node.rules.length; i++) {
      const child = O.fromNullable(node.rules[i]).pipe(O.getOrThrow);
      if (child.node === "group") {
        walk(child);
      } else {
        const r = child as Rule.Type;
        parts.push(`R:${r.type}:${r.id}:${r.field}:${r.op._tag}`);
      }
    }
  };
  walk(u);
  return parts.join("|");
}

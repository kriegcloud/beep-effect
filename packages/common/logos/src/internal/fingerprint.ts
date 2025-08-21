import * as O from "effect/Option";
import type { Rule } from "../rules";
import type { RootUnion, Union } from "../union";

/**
 * Computes a structural fingerprint of a union tree to detect changes.
 * Includes node ids, logical ops, rule tags, fields, and operator tags.
 */
export function fingerprint(u: Union.Type | RootUnion.Type): string {
  const parts: string[] = [];
  const walk = (node: Union.Type | RootUnion.Type): void => {
    parts.push(`U:${node.id}:${node.logicalOp}`);
    for (let i = 0; i < node.rules.length; i++) {
      const child = O.fromNullable(node.rules[i]).pipe(O.getOrThrow);
      if (child.entity === "union") {
        walk(child);
      } else {
        const r = child as Rule.Type;
        parts.push(`R:${r._tag}:${r.id}:${r.field}:${r.op._tag}`);
      }
    }
  };
  walk(u);
  return parts.join("|");
}

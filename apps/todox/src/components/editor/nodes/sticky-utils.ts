import type { LexicalNode } from "lexical";

import type { StickyNode } from "./StickyNode";

export function $isStickyNode(node: LexicalNode | null | undefined): node is StickyNode {
  return node?.constructor?.name === "StickyNode";
}

import type { LexicalNode } from "lexical";

import type { ExcalidrawNode } from ".";

export function $isExcalidrawNode(node: LexicalNode | null | undefined): node is ExcalidrawNode {
  return node?.constructor?.name === "ExcalidrawNode";
}

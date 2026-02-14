import type { LexicalNode } from "lexical";

import type { EquationNode } from "./EquationNode";

export function $isEquationNode(node: LexicalNode | null | undefined): node is EquationNode {
  return node?.constructor?.name === "EquationNode";
}

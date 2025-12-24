import type { LexicalNode } from "lexical";

import type { InlineImageNode } from "./InlineImageNode";

export type Position = "left" | "right" | "full" | undefined;

export function $isInlineImageNode(node: LexicalNode | null | undefined): node is InlineImageNode {
  // Lazy load InlineImageNode to avoid circular dependency
  const { InlineImageNode: InlineImageNodeClass } = require("./InlineImageNode") as typeof import("./InlineImageNode");
  return node instanceof InlineImageNodeClass;
}

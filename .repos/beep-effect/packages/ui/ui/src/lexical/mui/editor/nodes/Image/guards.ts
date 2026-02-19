import type { LexicalNode } from "lexical";

import type { ImageNode } from "./ImageNode";

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  // Lazy load ImageNode to avoid circular dependency
  const { ImageNode: ImageNodeClass } = require("./ImageNode") as typeof import("./ImageNode");
  return node instanceof ImageNodeClass;
}

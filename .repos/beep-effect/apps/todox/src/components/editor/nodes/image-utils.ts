import type { LexicalNode } from "lexical";
import { $extendCaretToRange, $getChildCaret, $getRoot, $isElementNode } from "lexical";

import type { ImageNode } from "./ImageNode";

export function $isCaptionEditorEmpty(): boolean {
  // Search the document for any non-element node
  // to determine if it's empty or not
  for (const { origin } of $extendCaretToRange($getChildCaret($getRoot(), "next"))) {
    if (!$isElementNode(origin)) {
      return false;
    }
  }
  return true;
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node?.constructor?.name === "ImageNode";
}

"use client";

import type { EditorConfig, LexicalNode, SerializedTextNode } from "lexical";

import { $applyNodeReplacement, TextNode } from "lexical";

export type SerializedKeywordNode = SerializedTextNode;

export class KeywordNode extends TextNode {
  static override getType(): string {
    return "keyword";
  }

  static override clone(node: KeywordNode): KeywordNode {
    return new KeywordNode(node.__text, node.__key);
  }

  static override importJSON(serializedNode: SerializedKeywordNode): KeywordNode {
    return $createKeywordNode().updateFromJSON(serializedNode);
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cursor = "default";
    dom.className = "keyword";
    return dom;
  }

  override canInsertTextBefore(): boolean {
    return false;
  }

  override canInsertTextAfter(): boolean {
    return false;
  }

  override isTextEntity(): true {
    return true;
  }
}

export function $createKeywordNode(keyword = ""): KeywordNode {
  return $applyNodeReplacement(new KeywordNode(keyword));
}

export function $isKeywordNode(node: LexicalNode | null | undefined): boolean {
  return node instanceof KeywordNode;
}

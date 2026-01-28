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
    return $createKeywordNode(serializedNode.text).updateFromJSON(serializedNode);
  }

  override exportJSON(): SerializedKeywordNode {
    return {
      ...super.exportJSON(),
      type: "keyword",
      version: 1,
    };
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cursor = "default";
    // Use theme class if available, fallback to keyword class with Tailwind styling
    dom.className = config.theme.keyword ?? "keyword text-purple-900 font-bold";
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

export function $isKeywordNode(node: LexicalNode | null | undefined): node is KeywordNode {
  return node instanceof KeywordNode;
}

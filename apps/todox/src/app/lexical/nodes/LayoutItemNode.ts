"use client";

import { addClassNamesToElement } from "@lexical/utils";
import * as S from "effect/Schema";
import type { DOMConversionMap, DOMConversionOutput, EditorConfig, LexicalNode, SerializedElementNode } from "lexical";
import { $isParagraphNode, ElementNode } from "lexical";
export type SerializedLayoutItemNode = SerializedElementNode;

function $convertLayoutItemElement(): DOMConversionOutput | null {
  return { node: $createLayoutItemNode() };
}

export function $isEmptyLayoutItemNode(node: LexicalNode): boolean {
  if (!$isLayoutItemNode(node) || node.getChildrenSize() !== 1) {
    return false;
  }
  const firstChild = node.getFirstChild();
  return $isParagraphNode(firstChild) && firstChild.isEmpty();
}

export class LayoutItemNode extends ElementNode {
  static override getType(): string {
    return "layout-item";
  }

  static override clone(node: LayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(node.__key);
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.setAttribute("data-lexical-layout-item", "true");
    if (typeof config.theme.layoutItem === "string") {
      addClassNamesToElement(dom, config.theme.layoutItem);
    }
    return dom;
  }

  override updateDOM(): boolean {
    return false;
  }

  override collapseAtStart(): boolean {
    const parent = this.getParentOrThrow();
    if (this.is(parent.getFirstChild()) && parent.getChildren().every($isEmptyLayoutItemNode)) {
      parent.remove();
      return true;
    }
    return false;
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-layout-item")) {
          return null;
        }
        return {
          conversion: $convertLayoutItemElement,
          priority: 2,
        };
      },
    };
  }

  static override importJSON(serializedNode: SerializedLayoutItemNode): LayoutItemNode {
    return $createLayoutItemNode().updateFromJSON(serializedNode);
  }

  override isShadowRoot(): boolean {
    return true;
  }

  override exportJSON(): SerializedLayoutItemNode {
    return {
      ...super.exportJSON(),
      type: "layout-item",
      version: 1,
    };
  }
}

export function $createLayoutItemNode(): LayoutItemNode {
  return new LayoutItemNode();
}

export function $isLayoutItemNode(node: LexicalNode | null | undefined): node is LayoutItemNode {
  return S.is(S.instanceOf(LayoutItemNode))(node);
}

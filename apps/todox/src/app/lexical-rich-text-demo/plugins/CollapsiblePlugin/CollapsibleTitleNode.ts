"use client";

import { IS_CHROME } from "@lexical/utils";
import * as S from "effect/Schema";
import {
  $createParagraphNode,
  $isElementNode,
  buildImportMap,
  type DOMConversionOutput,
  type EditorConfig,
  ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
} from "lexical";

import { $isCollapsibleContainerNode } from "./CollapsibleContainerNode";
import { $isCollapsibleContentNode } from "./CollapsibleContentNode";

export function $convertSummaryElement(_: HTMLElement): DOMConversionOutput | null {
  const node = $createCollapsibleTitleNode();
  return {
    node,
  };
}

/** @noInheritDoc */
export class CollapsibleTitleNode extends ElementNode {
  /** @internal */
  override $config() {
    return this.config("collapsible-title", {
      $transform(node: CollapsibleTitleNode) {
        if (node.isEmpty()) {
          node.remove();
        }
      },
      extends: ElementNode,
      importDOM: buildImportMap({
        summary: () => ({
          conversion: $convertSummaryElement,
          priority: 1,
        }),
      }),
    });
  }

  override createDOM(_: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("summary");
    dom.classList.add("Collapsible__title");
    if (IS_CHROME) {
      dom.addEventListener("click", () => {
        editor.update(() => {
          const collapsibleContainer = this.getLatest().getParentOrThrow();
          if (!$isCollapsibleContainerNode(collapsibleContainer)) {
            return;
          }
          collapsibleContainer.toggleOpen();
        });
      });
    }
    return dom;
  }

  override updateDOM(_prevNode: this, _dom: HTMLElement): boolean {
    return false;
  }

  override insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
    const containerNode = this.getParentOrThrow();

    if (!$isCollapsibleContainerNode(containerNode)) {
      const paragraph = $createParagraphNode();
      this.insertAfter(paragraph, restoreSelection);
      return paragraph;
    }

    if (containerNode.getOpen()) {
      const contentNode = this.getNextSibling();
      if (!$isCollapsibleContentNode(contentNode)) {
        const paragraph = $createParagraphNode();
        this.insertAfter(paragraph, restoreSelection);
        return paragraph;
      }

      const firstChild = contentNode.getFirstChild();
      if ($isElementNode(firstChild)) {
        return firstChild;
      }
      const paragraph = $createParagraphNode();
      contentNode.append(paragraph);
      return paragraph;
    }
    const paragraph = $createParagraphNode();
    containerNode.insertAfter(paragraph, restoreSelection);
    return paragraph;
  }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
  return new CollapsibleTitleNode();
}

export function $isCollapsibleTitleNode(node: LexicalNode | null | undefined): node is CollapsibleTitleNode {
  return S.is(S.instanceOf(CollapsibleTitleNode))(node);
}

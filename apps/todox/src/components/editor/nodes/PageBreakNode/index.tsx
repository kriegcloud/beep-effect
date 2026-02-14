"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import * as S from "effect/Schema";
import {
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";
import type { JSX } from "react";

import { useEffect } from "react";

export type SerializedPageBreakNode = SerializedLexicalNode;

function PageBreakComponent({ nodeKey }: { readonly nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const pbElem = editor.getElementByKey(nodeKey);

          if (event.target === pbElem) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, nodeKey, setSelected]);

  useEffect(() => {
    const pbElem = editor.getElementByKey(nodeKey);
    if (pbElem !== null) {
      pbElem.className = isSelected ? "selected" : "";
    }
  }, [editor, isSelected, nodeKey]);

  return null;
}

export class PageBreakNode extends DecoratorNode<JSX.Element> {
  static override getType(): string {
    return "page-break";
  }

  static override clone(node: PageBreakNode): PageBreakNode {
    return new PageBreakNode(node.__key);
  }

  static override importJSON(serializedNode: SerializedPageBreakNode): PageBreakNode {
    return $createPageBreakNode().updateFromJSON(serializedNode);
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      figure: (domNode: HTMLElement) => {
        const tp = domNode.getAttribute("type");
        if (tp !== this.getType()) {
          return null;
        }

        return {
          conversion: $convertPageBreakElement,
          priority: COMMAND_PRIORITY_HIGH,
        };
      },
    };
  }

  override createDOM(): HTMLElement {
    const el = document.createElement("figure");
    el.style.breakAfter = "always";
    el.setAttribute("type", this.getType());
    return el;
  }

  override getTextContent(): string {
    return "\n";
  }

  override isInline(): false {
    return false;
  }

  override updateDOM(): boolean {
    return false;
  }

  override decorate(): JSX.Element {
    return <PageBreakComponent nodeKey={this.__key} />;
  }
}

function $convertPageBreakElement(): DOMConversionOutput {
  return { node: $createPageBreakNode() };
}

export function $createPageBreakNode(): PageBreakNode {
  return new PageBreakNode();
}

export function $isPageBreakNode(node: LexicalNode | null | undefined): node is PageBreakNode {
  return S.is(S.instanceOf(PageBreakNode))(node);
}

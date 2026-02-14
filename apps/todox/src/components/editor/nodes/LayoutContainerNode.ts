"use client";

import { addClassNamesToElement } from "@lexical/utils";
import * as S from "effect/Schema";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";
import { ElementNode } from "lexical";
export type SerializedLayoutContainerNode = Spread<
  {
    readonly templateColumns: string;
  },
  SerializedElementNode
>;

function $convertLayoutContainerElement(domNode: HTMLElement): DOMConversionOutput | null {
  const styleAttributes = window.getComputedStyle(domNode);
  const templateColumns = styleAttributes.getPropertyValue("grid-template-columns");
  if (templateColumns) {
    const node = $createLayoutContainerNode(templateColumns);
    return { node };
  }
  return null;
}

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string;

  constructor(templateColumns: string, key?: undefined | NodeKey) {
    super(key);
    this.__templateColumns = templateColumns;
  }

  static override getType(): string {
    return "layout-container";
  }

  static override clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key);
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.style.gridTemplateColumns = this.__templateColumns;
    if (typeof config.theme.layoutContainer === "string") {
      addClassNamesToElement(dom, config.theme.layoutContainer);
    }
    return dom;
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.style.gridTemplateColumns = this.__templateColumns;
    element.setAttribute("data-lexical-layout-container", "true");
    return { element };
  }

  override updateDOM(prevNode: this, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns;
    }
    return false;
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-layout-container")) {
          return null;
        }
        return {
          conversion: $convertLayoutContainerElement,
          priority: 2,
        };
      },
    };
  }

  static override importJSON(json: SerializedLayoutContainerNode): LayoutContainerNode {
    return $createLayoutContainerNode().updateFromJSON(json);
  }

  override updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedLayoutContainerNode>): this {
    return super.updateFromJSON(serializedNode).setTemplateColumns(serializedNode.templateColumns);
  }

  override isShadowRoot(): boolean {
    return true;
  }

  override canBeEmpty(): boolean {
    return false;
  }

  override exportJSON(): SerializedLayoutContainerNode {
    return {
      ...super.exportJSON(),
      templateColumns: this.__templateColumns,
      type: "layout-container",
      version: 1,
    };
  }

  getTemplateColumns(): string {
    return this.getLatest().__templateColumns;
  }

  setTemplateColumns(templateColumns: string): this {
    const self = this.getWritable();
    self.__templateColumns = templateColumns;
    return self;
  }
}

export function $createLayoutContainerNode(templateColumns = ""): LayoutContainerNode {
  return new LayoutContainerNode(templateColumns);
}

export function $isLayoutContainerNode(node: LexicalNode | null | undefined): node is LayoutContainerNode {
  return S.is(S.instanceOf(LayoutContainerNode))(node);
}

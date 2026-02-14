"use client";

import type { DOMExportOutput, EditorConfig, LexicalEditor, NodeKey, SerializedTextNode, Spread } from "lexical";

import { TextNode } from "lexical";

import { uuid as UUID } from "./autocomplete-utils";

export type SerializedAutocompleteNode = Spread<
  {
    readonly uuid: string;
  },
  SerializedTextNode
>;

export class AutocompleteNode extends TextNode {
  /**
   * A unique uuid is generated for each session and assigned to the instance.
   * This helps to:
   * - Ensures max one Autocomplete node per session.
   * - Ensure that when collaboration is enabled, this node is not shown in
   *   other sessions.
   * See https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx
   */
  readonly __uuid: string;

  static override clone(node: AutocompleteNode): AutocompleteNode {
    return new AutocompleteNode(node.__text, node.__uuid, node.__key);
  }

  static override getType(): "autocomplete" {
    return "autocomplete";
  }

  static override importDOM() {
    // Never import from DOM
    return null;
  }

  static override importJSON(serializedNode: SerializedAutocompleteNode): AutocompleteNode {
    return $createAutocompleteNode(serializedNode.text, serializedNode.uuid).updateFromJSON(serializedNode);
  }

  override exportJSON(): SerializedAutocompleteNode {
    return {
      ...super.exportJSON(),
      type: "autocomplete",
      uuid: this.__uuid,
      version: 1,
    };
  }

  constructor(text: string, uuid: string, key?: undefined | NodeKey) {
    super(text, key);
    this.__uuid = uuid;
  }

  override updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    return false;
  }

  override exportDOM(_: LexicalEditor): DOMExportOutput {
    return { element: null };
  }

  excludeFromCopy() {
    return true;
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.classList.add(config.theme.autocomplete);
    if (this.__uuid !== UUID) {
      dom.style.display = "none";
    }
    return dom;
  }
}

export function $createAutocompleteNode(text: string, uuid: string): AutocompleteNode {
  return new AutocompleteNode(text, uuid).setMode("token");
}

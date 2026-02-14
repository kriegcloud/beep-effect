"use client";

import katex from "katex";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode, type DOMExportOutput } from "lexical";
import type { JSX } from "react";
import * as React from "react";

const EquationComponent = React.lazy(() => import("./EquationComponent"));

export type SerializedEquationNode = Spread<
  {
    readonly equation: string;
    readonly inline: boolean;
  },
  SerializedLexicalNode
>;

function $convertEquationElement(domNode: HTMLElement): null | DOMConversionOutput {
  let equation = domNode.getAttribute("data-lexical-equation");
  const inline = domNode.getAttribute("data-lexical-inline") === "true";
  // Decode the equation from base64
  equation = atob(equation || "");
  if (equation) {
    const node = $createEquationNode(equation, inline);
    return { node };
  }

  return null;
}

export class EquationNode extends DecoratorNode<JSX.Element> {
  __equation: string;
  __inline: boolean;

  static override getType(): string {
    return "equation";
  }

  static override clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key);
  }

  constructor(equation: string, inline?: undefined | boolean, key?: undefined | NodeKey) {
    super(key);
    this.__equation = equation;
    this.__inline = inline ?? false;
  }

  static override importJSON(serializedNode: SerializedEquationNode): EquationNode {
    return $createEquationNode(serializedNode.equation, serializedNode.inline).updateFromJSON(serializedNode);
  }

  override exportJSON(): SerializedEquationNode {
    return {
      ...super.exportJSON(),
      equation: this.getEquation(),
      inline: this.__inline,
    };
  }

  override createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement(this.__inline ? "span" : "div");
    // EquationNodes should implement `user-action:none` in their CSS to avoid issues with deletion on Android.
    element.className = "editor-equation";
    return element;
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement(this.__inline ? "span" : "div");
    // Encode the equation as base64 to avoid issues with special characters
    const equation = btoa(this.__equation);
    element.setAttribute("data-lexical-equation", equation);
    element.setAttribute("data-lexical-inline", `${this.__inline}`);
    katex.render(this.__equation, element, {
      displayMode: !this.__inline, // true === block display //
      errorColor: "#cc0000",
      output: "html",
      strict: "warn",
      throwOnError: false,
      trust: false,
    });
    return { element };
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-equation")) {
          return null;
        }
        return {
          conversion: $convertEquationElement,
          priority: 2,
        };
      },
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-equation")) {
          return null;
        }
        return {
          conversion: $convertEquationElement,
          priority: 1,
        };
      },
    };
  }

  override updateDOM(prevNode: this): boolean {
    // If the inline property changes, replace the element
    return this.__inline !== prevNode.__inline;
  }

  override getTextContent(): string {
    return this.__equation;
  }

  getEquation(): string {
    return this.__equation;
  }

  setEquation(equation: string): void {
    const writable = this.getWritable();
    writable.__equation = equation;
  }

  override decorate(): JSX.Element {
    return <EquationComponent equation={this.__equation} inline={this.__inline} nodeKey={this.__key} />;
  }
}

export function $createEquationNode(equation = "", inline = false): EquationNode {
  const equationNode = new EquationNode(equation, inline);
  return $applyNodeReplacement(equationNode);
}

// Re-export from utils to maintain backwards compatibility
export { $isEquationNode } from "./equation-utils";

/**
 * Read-only Lexical plugin that renders `code` nodes with
 * `language="mermaid"` as diagrams while preserving their serialized shape.
 *
 * @packageDocumentation \@beep/editor/mermaid-code-decorator-plugin
 * @since 0.0.0
 */
"use client";

import { $isCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isElementNode } from "lexical";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MermaidView } from "./mermaid-view.tsx";
import type { CodeNode } from "@lexical/code";
import type { LexicalEditor, LexicalNode } from "lexical";
import type { JSX } from "react";

interface MermaidPortalTarget {
  readonly container: HTMLElement;
  readonly key: string;
  readonly source: string;
}

const mermaidLanguage = "mermaid";
const targetAttribute = "data-beep-mermaid-for";

const collectCodeNodes = (node: LexicalNode, codeNodes: Array<CodeNode>): void => {
  if ($isCodeNode(node)) {
    codeNodes.push(node);
    return;
  }

  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      collectCodeNodes(child, codeNodes);
    }
  }
};

const cleanupMermaidTargets = (editor: LexicalEditor, activeKeys: ReadonlyArray<string>): void => {
  const root = editor.getRootElement();
  if (root === null) {
    return;
  }

  for (const target of root.querySelectorAll(`[${targetAttribute}]`)) {
    if (!(target instanceof HTMLElement)) {
      continue;
    }

    const key = target.getAttribute(targetAttribute);
    if (key !== null && activeKeys.includes(key)) {
      continue;
    }

    const code = target.previousElementSibling;
    if (code instanceof HTMLElement && code.getAttribute("data-language") === mermaidLanguage) {
      code.hidden = false;
    }
    target.remove();
  }
};

const collectMermaidTargets = (editor: LexicalEditor): ReadonlyArray<MermaidPortalTarget> => {
  const targets: Array<MermaidPortalTarget> = [];

  editor.getEditorState().read(() => {
    const codeNodes: Array<CodeNode> = [];
    collectCodeNodes($getRoot(), codeNodes);

    for (const node of codeNodes) {
      if (node.getLanguage() !== mermaidLanguage) {
        continue;
      }

      const element = editor.getElementByKey(node.getKey());
      if (element === null) {
        continue;
      }

      element.hidden = true;
      const key = node.getKey();
      const next = element.nextElementSibling;
      const container =
        next instanceof HTMLElement && next.getAttribute(targetAttribute) === key
          ? next
          : document.createElement("div");

      if (container.parentElement === null) {
        container.setAttribute(targetAttribute, key);
        element.after(container);
      }

      targets.push({ key, source: node.getTextContent(), container });
    }
  });

  cleanupMermaidTargets(
    editor,
    targets.map((target) => target.key)
  );

  return targets;
};

/**
 * Decorates read-only Mermaid code blocks in-place.
 *
 * @example
 * ```tsx
 * import { MermaidCodeDecoratorPlugin } from "@beep/editor/mermaid-code-decorator-plugin"
 *
 * function ReadOnlyDiagramDecorators() {
 *   return <MermaidCodeDecoratorPlugin />
 * }
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function MermaidCodeDecoratorPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [targets, setTargets] = useState<ReadonlyArray<MermaidPortalTarget>>([]);

  useEffect(() => {
    const refresh = () => setTargets(collectMermaidTargets(editor));
    refresh();
    const unregister = editor.registerUpdateListener(refresh);

    return () => {
      unregister();
      cleanupMermaidTargets(editor, []);
    };
  }, [editor]);

  return (
    <>
      {targets.map((target) =>
        createPortal(
          <MermaidView renderKey={`lexical:${target.key}`} source={target.source} />,
          target.container,
          target.key
        )
      )}
    </>
  );
}

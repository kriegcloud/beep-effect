/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $isCodeNode } from "@lexical/code";
import { Button } from "@mui/material";
import { $getNearestNodeFromDOMNode, $getSelection, $setSelection, type LexicalEditor } from "lexical";
import { useState } from "react";

import { useDebounce } from "../../utils";

interface ICopyButtonProps {
  readonly editor: LexicalEditor;
  readonly getCodeDOMNode: () => HTMLElement | null;
}

export const CopyButton = ({ editor, getCodeDOMNode }: ICopyButtonProps) => {
  const [isCopyCompleted, setCopyCompleted] = useState<boolean>(false);

  const removeSuccessIcon = useDebounce(() => {
    setCopyCompleted(false);
  }, 1000);

  async function handleClick(): Promise<void> {
    const codeDOMNode = getCodeDOMNode();

    if (!codeDOMNode) {
      return;
    }

    let content = "";

    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }

      const selection = $getSelection();
      $setSelection(selection);
    });

    try {
      await navigator.clipboard.writeText(content);
      setCopyCompleted(true);
      removeSuccessIcon();
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  return (
    <Button className="menu-item" onClick={handleClick} aria-label="copy">
      {isCopyCompleted ? <i className="format success" /> : <i className="format copy" />}
    </Button>
  );
};

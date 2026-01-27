"use client";
import { $isCodeNode } from "@lexical/code";
import { $getNearestNodeFromDOMNode, $getSelection, $setSelection, type LexicalEditor } from "lexical";
import * as Clipboard from "@effect/platform-browser/Clipboard";
import * as Effect from "effect/Effect";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { useState, useCallback } from "react";
import { useDebounce } from "../../utils";
import { ClipboardError } from "../../../../schema/errors";

interface Props {
  readonly editor: LexicalEditor;
  readonly getCodeDOMNode: () => HTMLElement | null;
}

const copyToClipboard = Effect.fn("copyToClipboard")(function* (content: string) {
  const clipboard = yield* Clipboard.Clipboard;
  yield* Effect.tryPromise({
    try: () => clipboard.writeString(content),
    catch: (cause) =>
      new ClipboardError({
        message: "Failed to copy to clipboard",
        cause,
      }),
  }).pipe(Effect.flatten);
});

export function CopyButton({ editor, getCodeDOMNode }: Props) {
  const [isCopyCompleted, setCopyCompleted] = useState<boolean>(false);
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime);

  const removeSuccessIcon = useDebounce(() => {
    setCopyCompleted(false);
  }, 1000);

  const handleClick = useCallback(async (): Promise<void> => {
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

    await runPromise(
      copyToClipboard(content).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            setCopyCompleted(true);
            removeSuccessIcon();
          })
        ),
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("Failed to copy: ", error.message);
          })
        )
      )
    );
  }, [editor, getCodeDOMNode, runPromise, removeSuccessIcon]);

  return (
    <button type="button" className="menu-item" onClick={handleClick} aria-label="copy">
      {isCopyCompleted ? <i className="format success" /> : <i className="format copy" />}
    </button>
  );
}

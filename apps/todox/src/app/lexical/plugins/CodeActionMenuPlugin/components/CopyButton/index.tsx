"use client";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import * as Clipboard from "@effect/platform-browser/Clipboard";
import { $isCodeNode } from "@lexical/code";
import * as Effect from "effect/Effect";
import { $getNearestNodeFromDOMNode, $getSelection, $setSelection, type LexicalEditor } from "lexical";
import { useCallback, useState } from "react";
import { ClipboardError } from "../../../../schema/errors";
import { useDebounce } from "../../utils";

interface Props {
  readonly editor: LexicalEditor;
  readonly getCodeDOMNode: () => HTMLElement | null;
}

const copyToClipboard = Effect.fn("copyToClipboard")(function* (content: string) {
  const clipboard = yield* Clipboard.Clipboard;
  yield* clipboard.writeString(content).pipe(
    Effect.mapError(
      (cause) =>
        new ClipboardError({
          message: "Failed to copy to clipboard",
          cause,
        })
    )
  );
});

export function CopyButton({ editor, getCodeDOMNode }: Props) {
  const [isCopyCompleted, setCopyCompleted] = useState<boolean>(false);
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime);

  const removeSuccessIcon = useDebounce(() => {
    setCopyCompleted(false);
  }, 1000);

  // Fire-and-forget: onClick doesn't need the Promise result, and all
  // success/error handling is done inside the Effect pipeline.
  const handleClick = useCallback((): void => {
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

    runPromise(
      copyToClipboard(content).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            setCopyCompleted(true);
            removeSuccessIcon();
          })
        ),
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("Failed to copy: ", error);
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

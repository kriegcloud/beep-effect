import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
  PASTE_COMMAND,
} from "lexical";
import { type JSX, useEffect, useState } from "react";

import { INSERT_VIDEO_COMMAND } from "../../commands";
import { $createVideoNode } from "../../nodes/Video/VideoNode";
import { Button } from "../../ui/Button";
import { DialogActions } from "../../ui/Dialog";
import { TextInput } from "../../ui/TextInput";
import { parseVideoUrl } from "../../utils/parseVideoUrl";

export function InsertVideoDialog({
  activeEditor,
  onClose,
}: {
  readonly activeEditor: LexicalEditor;
  readonly onClose: () => void;
}): JSX.Element {
  const [url, setUrl] = useState("");

  const isDisabled = url === "";

  return (
    <>
      <TextInput
        label="Video URL"
        placeholder="i.e. https://www.youtube.com"
        onChange={setUrl}
        value={url}
        data-test-id="video-modal-url-input"
      />
      <DialogActions>
        <Button
          data-test-id="video-modal-confirm-btn"
          disabled={isDisabled}
          onClick={() => {
            activeEditor.dispatchCommand(INSERT_VIDEO_COMMAND, { url });
            onClose();
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export const VideoPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeInsert = editor.registerCommand(
      INSERT_VIDEO_COMMAND,
      ({ url }) => {
        const parsed = parseVideoUrl(url);
        if (!parsed) return false;

        editor.update(() => {
          const node = $createVideoNode(parsed);
          const selection = $getSelection();
          void selection;
          $insertNodes([node]);
        });

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );

    const removePaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const text = event.clipboardData?.getData("text/plain");
        if (!text) return false;

        const parsed = parseVideoUrl(text);
        if (!parsed) return false;

        event.preventDefault();
        editor.update(() => {
          const node = $createVideoNode(parsed);
          $insertNodes([node]);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeInsert();
      removePaste();
    };
  }, [editor]);

  return null;
};

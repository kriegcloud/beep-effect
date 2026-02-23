"use client";

import { commentPlugin } from "@beep/notes/registry/components/editor/plugins/comment-kit";
import { MessageSquareTextIcon } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { ToolbarButton } from "./toolbar";

export function CommentToolbarButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.getTransforms(commentPlugin).comment.setDraft();
      }}
      data-plate-prevent-overlay
      shortcut="⌘+Shift+M"
      tooltip="Comment"
    >
      <MessageSquareTextIcon className="mr-1" />
      <span className="hidden sm:inline">Comment</span>
    </ToolbarButton>
  );
}

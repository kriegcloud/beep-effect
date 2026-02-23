"use client";

import { commentPlugin } from "@beep/ui/components/editor/plugins/comment-kit";

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
      tooltip="Comment"
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}

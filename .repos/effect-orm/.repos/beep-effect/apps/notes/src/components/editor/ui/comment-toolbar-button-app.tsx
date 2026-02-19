"use client";

import { useAuthGuard } from "@beep/notes/components/auth/useAuthGuard";
import { commentPlugin } from "@beep/notes/registry/components/editor/plugins/comment-kit";
import { ToolbarButton } from "@beep/notes/registry/ui/toolbar";
import { MessageSquareTextIcon } from "lucide-react";
import { useEditorRef } from "platejs/react";

export function CommentToolbarButton() {
  const editor = useEditorRef();

  const authGuard = useAuthGuard();

  return (
    <ToolbarButton
      onClick={() => {
        authGuard(() => {
          editor.getTransforms(commentPlugin).comment.setDraft();
        });
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

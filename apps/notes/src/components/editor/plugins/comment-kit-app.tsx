"use client";

import { BlockDiscussion } from "@beep/notes/components/editor/ui/block-discussion-app";
import { FloatingDiscussion } from "@beep/notes/components/editor/ui/floating-discussion-app";
import { commentPlugin as CommentPlugin } from "@beep/notes/registry/components/editor/plugins/comment-kit";
import { CommentLeaf } from "@beep/notes/registry/ui/comment-node";
import type { UnsafeTypes } from "@beep/types";
import { debounce } from "@beep/utils";
import { useEditorContainerRef } from "platejs/react";
import { useEffect } from "react";

export const commentPlugin = CommentPlugin.configure({
  render: {
    // Instead of discussion-kit
    aboveNodes: BlockDiscussion as UnsafeTypes.UnsafeAny,
    afterEditable: FloatingDiscussion,
    node: CommentLeaf,
  },
  shortcuts: {
    setDraft: { keys: "mod+shift+m" },
  },
  useHooks: ({ editor, setOption }) => {
    const editorContainerRef = useEditorContainerRef();

    useEffect(() => {
      if (!editorContainerRef.current) return;

      const editable = editor.api.toDOMNode(editor);

      if (!editable) return;

      const handleResize = debounce(() => {
        const styles = window.getComputedStyle(editable);
        const isOverlap = Number.parseInt(styles.paddingRight, 10) < 80 + 288;

        setOption("isOverlapWithEditor", isOverlap);
      }, 100);

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
        handleResize.cancel();
      };
    }, [editor, editorContainerRef, setOption]);
  },
});

export const CommentKit = [commentPlugin];

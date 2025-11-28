"use client";

import { CommentLeaf } from "@beep/notes/registry/ui/comment-node";
import { FloatingDiscussion } from "@beep/notes/registry/ui/floating-discussion";

import { type BaseCommentConfig, BaseCommentPlugin, getDraftCommentKey } from "@platejs/comment";
import type { ExtendConfig, Path } from "platejs";
import { isSlateElement, isSlateString } from "platejs";
import { toTPlatePlugin, useEditorContainerRef } from "platejs/react";
import { useEffect } from "react";

type CommentConfig = ExtendConfig<
  BaseCommentConfig,
  {
    activeId: string | null;
    commentingBlock: Path | null;
    hoverId: string | null;
    isOverlapWithEditor: boolean;
    uniquePathMap: Map<string, Path>;
    updateTimestamp: number | null;
  }
>;

export const commentPlugin = toTPlatePlugin<CommentConfig>(BaseCommentPlugin, {
  handlers: {
    onClick: ({ api, event, setOption, type }) => {
      let leaf = event.target as HTMLElement;
      let isSet = false;

      const unsetActiveSuggestion = () => {
        setOption("activeId", null);
        isSet = true;
      };

      if (!isSlateString(leaf)) unsetActiveSuggestion();

      while (leaf.parentElement && !isSlateElement(leaf.parentElement)) {
        if (leaf.classList.contains(`slate-${type}`)) {
          const commentsEntry = api.comment!.node();

          if (!commentsEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = api.comment!.nodeId(commentsEntry[0]) ?? null;
          const isDraft = commentsEntry[0][getDraftCommentKey()];

          setOption("activeId", isDraft ? getDraftCommentKey() : id);
          isSet = true;

          break;
        }

        leaf = leaf.parentElement;
      }

      if (!isSet) unsetActiveSuggestion();
    },
  },
  options: {
    activeId: null,
    commentingBlock: null,
    hoverId: null,
    isOverlapWithEditor: false,
    uniquePathMap: new Map(),
    updateTimestamp: null,
  },
  useHooks: ({ editor, setOption }) => {
    const editorContainerRef = useEditorContainerRef();

    useEffect(() => {
      if (!editorContainerRef.current) return;

      const editable = editor.api.toDOMNode(editor);

      if (!editable) return;

      const observer = new ResizeObserver((entries) => {
        const width = entries[0].contentRect.width;
        const isOverlap = width < 700;

        setOption("isOverlapWithEditor", isOverlap);
      });

      observer.observe(editable);

      return () => {
        observer.disconnect();
      };
    }, [editor, editorContainerRef, setOption]);
  },
})
  .extendTransforms(
    ({
      editor,
      setOption,
      tf: {
        comment: { setDraft },
      },
    }) => ({
      setDraft: () => {
        if (editor.api.isCollapsed()) {
          editor.tf.select(editor.api.block()![1]);
        }

        setDraft();

        editor.tf.collapse();
        setOption("activeId", getDraftCommentKey());
        setOption("commentingBlock", editor.selection!.focus.path.slice(0, 1));
      },
    })
  )
  .overrideEditor(({ editor, setOption, tf: { apply, insertBreak }, tf, type }) => ({
    transforms: {
      apply(operation) {
        if (
          operation.type !== "set_selection" &&
          operation.type !== "set_node" &&
          operation.type !== "split_node" &&
          operation.type !== "merge_node"
        ) {
          const { newProperties, properties } = operation;

          if (properties?.[getDraftCommentKey()] || newProperties?.[getDraftCommentKey()]) {
            return;
          }

          setOption("updateTimestamp", Date.now());
        }

        apply(operation);
      },
      insertBreak() {
        setOption("updateTimestamp", Date.now());

        tf.comment.removeMark();
        insertBreak();
        editor.tf.unsetNodes([type], {
          at: editor.selection?.focus,
          mode: "lowest",
        });
      },
    },
  }))
  .extend({
    shortcuts: {
      setDraft: { keys: "mod+shift+m" },
    },
  })
  .configure({
    render: {
      afterEditable: FloatingDiscussion,
      node: CommentLeaf,
    },
  });

export const CommentKit = [commentPlugin];

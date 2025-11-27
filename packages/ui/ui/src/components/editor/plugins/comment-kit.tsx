"use client";

import { CommentLeaf } from "@beep/ui/components/comment-node";
import { type BaseCommentConfig, BaseCommentPlugin, getDraftCommentKey } from "@platejs/comment";
import * as A from "effect/Array";
import type { ExtendConfig, Path } from "platejs";
import { isSlateString } from "platejs";
import { toTPlatePlugin } from "platejs/react";

type CommentConfig = ExtendConfig<
  BaseCommentConfig,
  {
    readonly activeId: string | null;
    readonly commentingBlock: Path | null;
    readonly hoverId: string | null;
    readonly uniquePathMap: Map<string, Path>;
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

      while (leaf.parentElement) {
        if (A.contains(leaf.classList, `slate-${type}`)) {
          const commentsEntry = api.comment!.node();

          if (!commentsEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = api.comment!.nodeId(commentsEntry[0]);

          setOption("activeId", id ?? null);
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
    uniquePathMap: new Map(),
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
          editor.tf.select(editor.api.block()?.[1]);
        }

        setDraft();

        editor.tf.collapse();
        setOption("activeId", getDraftCommentKey());
        const focusPath = editor.selection!.focus.path;
        const firstElement = focusPath[0];
        if (firstElement !== undefined) {
          setOption("commentingBlock", [firstElement]);
        }
      },
    })
  )
  .configure({
    node: { component: CommentLeaf },
    shortcuts: {
      setDraft: { keys: "mod+shift+m" },
    },
  });

export const CommentKit = [commentPlugin];

"use client";

import { $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

import { EMAIL_COMPOSE_TRANSFORMERS } from "../plugins/MarkdownTransformers";

/**
 * Registers an editor update listener that serializes the editor state
 * to markdown and calls the provided onChange callback.
 *
 * Uses EMAIL_COMPOSE_TRANSFORMERS which support horizontal rules,
 * images, emojis, checklists, and all standard markdown formatting.
 */
export function useMarkdownOnChange(onChange: ((markdown: string) => void) | undefined): void {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (onChange === undefined) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        editorState.read(() => {
          const markdown = $convertToMarkdownString(EMAIL_COMPOSE_TRANSFORMERS);
          onChange(markdown);
        });
      }, 200);
    });

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      unregister();
    };
  }, [editor, onChange]);
}

/**
 * Read-only renderer for a persisted chat message.
 *
 * Projects an `@beep/md` {@link Md.Document} into a `@beep/lexical-schema`
 * serialized editor state via {@link documentToEditorState} (run synchronously —
 * the codec is pure) and renders it through `@beep/editor`'s
 * {@link EditorViewer}. The decode is wrapped in `Effect.runSyncExit` so a codec
 * failure degrades to a plain-text fallback instead of throwing.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */
"use client";

import { EditorViewer } from "@beep/editor";
import { documentToEditorState } from "@beep/lexical-schema";
import { Effect, Exit } from "effect";
import { useMemo } from "react";
import type * as Md from "@beep/md/Md.model";
import type { JSX } from "react";

/**
 * Renders one persisted message's md-aligned content as read-only rich text.
 *
 * @example
 * ```tsx
 * import { MessageView } from "@/chat/ui/MessageView"
 *
 * console.log(MessageView.name) // "MessageView"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function MessageView({ content }: { readonly content: Md.Document }): JSX.Element {
  // documentToEditorState is a pure schema codec returning an Effect; running it
  // synchronously is safe. Exit-match so a decode failure renders a fallback
  // rather than crashing the timeline.
  const exit = useMemo(() => Effect.runSyncExit(documentToEditorState(content)), [content]);

  return Exit.match(exit, {
    onSuccess: (state) => <EditorViewer state={state} className="relative block focus:outline-none" />,
    onFailure: () => (
      <div className="text-sm text-muted-foreground italic" data-testid="message-decode-failure">
        This message could not be rendered.
      </div>
    ),
  });
}

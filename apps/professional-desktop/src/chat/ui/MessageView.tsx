/**
 * Read-only renderer for a persisted chat message.
 *
 * Projects an `@beep/md` {@link Md.Document} into a `@beep/lexical-schema`
 * serialized editor state via {@link documentToEditorState} and renders it
 * through `@beep/editor/viewer`'s {@link EditorViewer}. The projection runs
 * through an `Atom.runtime` family (no `Effect.runSyncExit` in component code per
 * the repo atom-first law); the codec is pure so the `AsyncResult` resolves
 * immediately, and a codec failure degrades to a plain-text fallback.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */
"use client";

import { EditorViewer } from "@beep/editor/viewer";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { documentEditorStateAtom } from "./editor-state.atoms.ts";
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
  const result = useAtomValue(documentEditorStateAtom(content));

  return AsyncResult.match(result, {
    onInitial: () => <div className="text-sm text-muted-foreground italic" data-testid="message-decode-pending" />,
    onSuccess: (success) => <EditorViewer state={success.value} className="relative block focus:outline-none" />,
    onFailure: () => (
      <div className="text-sm text-muted-foreground italic" data-testid="message-decode-failure">
        This message could not be rendered.
      </div>
    ),
  });
}

/**
 * Read-only viewer rendering a `@beep/lexical-schema` serialized editor
 * state.
 *
 * @packageDocumentation \@beep/editor/viewer
 * @since 0.0.0
 */
"use client";

import { EditorStateFromJson } from "@beep/lexical-schema";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { editorNodes } from "./nodes.ts";
import { editorTheme } from "./theme.ts";
import type { SerializedEditorState } from "@beep/lexical-schema";
import type { JSX } from "react";

const onError = (error: Error) => {
  Effect.runSync(Effect.logError(error));
};

interface EditorViewerProps {
  /** Optional class for the read-only content container. */
  readonly className?: string;
  /** The schema-decoded editor state to render. */
  readonly state: SerializedEditorState.Type;
}

/**
 * Read-only Lexical viewer over the `@beep/lexical-schema` v1 node
 * vocabulary — the render side of the schema → viewer pipeline.
 *
 * @example
 * ```tsx
 * import { EditorViewer } from "@beep/editor/viewer"
 *
 * console.log(EditorViewer.name) // "EditorViewer"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function EditorViewer({ state, className }: EditorViewerProps): JSX.Element {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "beep-editor-viewer",
        editable: false,
        theme: editorTheme,
        nodes: [...editorNodes],
        editorState: S.encodeSync(EditorStateFromJson)(state),
        onError,
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable className={className ?? "relative block px-1 focus:outline-none"} />}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
}

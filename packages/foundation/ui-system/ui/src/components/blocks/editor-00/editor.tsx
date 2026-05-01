"use client";

import { TooltipProvider } from "@beep/ui/components/ui/tooltip";
import { type InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState, SerializedEditorState } from "lexical";

import { editorTheme } from "../../editor/themes/editor-theme.js";

import { nodes } from "./nodes.js";
import { Plugins } from "./plugins.js";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

/**
 * Rich text editor block assembled from the shared editor theme and plugins.
 *
 * @since 0.0.0
 * @category Presentation
 */
export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState !== undefined ? { editorState } : {}),
          ...(editorSerializedState !== undefined ? { editorState: JSON.stringify(editorSerializedState) } : {}),
        }}
      >
        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(nextEditorState) => {
              onChange?.(nextEditorState);
              onSerializedChange?.(nextEditorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

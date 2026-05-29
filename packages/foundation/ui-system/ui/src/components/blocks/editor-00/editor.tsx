import * as O from "@beep/utils/Option";

("use client");

import { TooltipProvider } from "@beep/ui/components/ui/tooltip";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { editorTheme } from "../../editor/themes/editor-theme.js";
import { nodes } from "./nodes.js";
import { Plugins } from "./plugins.js";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState, SerializedEditorState } from "lexical";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    Effect.runSync(Effect.logError(error));
  },
};

/**
 * Rich text editor block assembled from the shared editor theme and plugins.
 *
 * @since 0.0.0
 * @category components
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
          ...O.getSomesStruct({ editorState: O.fromUndefinedOr(editorState) }),
          // TODO(effect-native-migration): model schema
          ...O.getSomesStruct({
            editorState: O.map(O.fromUndefinedOr(editorSerializedState), (editorSerializedState) =>
              S.encodeUnknownSync(S.UnknownFromJsonString)(editorSerializedState)
            ),
          }),
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

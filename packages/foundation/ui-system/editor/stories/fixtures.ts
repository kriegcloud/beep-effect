import { documentToEditorState } from "@beep/lexical-schema";
import * as MdModel from "@beep/md/Md.model";
import { Effect } from "effect";

/**
 * Shared "Draft a reply…" seed editor state for the composer stories (used as
 * `initialState` by both the `EditorComposer` and `ChatComposer` stories).
 */
export const draftReplyInitialState = Effect.runSync(
  documentToEditorState(
    MdModel.Document.make({
      children: [MdModel.P.make({ children: [MdModel.Text.make({ value: "Draft a reply…" })] })],
    })
  )
);

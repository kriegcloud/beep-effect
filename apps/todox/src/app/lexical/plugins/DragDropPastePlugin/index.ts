"use client";

import { BS } from "@beep/schema";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { mediaFileReader } from "@lexical/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { COMMAND_PRIORITY_LOW } from "lexical";
import { useEffect } from "react";
import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin";

export default function DragDropPaste(): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        F.pipe(
          Effect.gen(function* () {
            const filesResult = yield* Effect.tryPromise(() =>
              mediaFileReader(files, A.flatten([BS.ImageMimeType.Options]))
            );
            for (const { file, result } of filesResult) {
              if (S.is(BS.MimeType)(file.type) && S.is(BS.ImageMimeType)(file.type)) {
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  altText: file.name,
                  src: result,
                });
              }
            }
          }),
          Effect.runPromise
        );
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
}

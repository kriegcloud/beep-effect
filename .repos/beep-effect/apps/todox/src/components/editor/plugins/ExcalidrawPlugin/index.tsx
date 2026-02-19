"use client";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { JSX } from "react";
import type { ExcalidrawInitialElements } from "../../ui/ExcalidrawModal";

import "@excalidraw/excalidraw/index.css";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import * as Either from "effect/Either";
import * as S from "effect/Schema";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from "lexical";
import { useEffect, useState } from "react";

import { $createExcalidrawNode, ExcalidrawNode } from "../../nodes/ExcalidrawNode";
import ExcalidrawModal from "../../ui/ExcalidrawModal";

// Schema for Excalidraw data serialization
// Using S.Unknown for complex Excalidraw types from external library
const ExcalidrawDataSchema = S.Struct({
  appState: S.Unknown, // Partial<AppState> from Excalidraw
  elements: S.Unknown, // ExcalidrawInitialElements from Excalidraw
  files: S.Unknown, // BinaryFiles from Excalidraw
});

const encodeExcalidrawData = S.encodeUnknownEither(S.parseJson(ExcalidrawDataSchema));

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand("INSERT_EXCALIDRAW_COMMAND");

export default function ExcalidrawPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!editor.hasNodes([ExcalidrawNode])) {
      throw new Error("ExcalidrawPlugin: ExcalidrawNode not registered on editor");
    }

    return editor.registerCommand(
      INSERT_EXCALIDRAW_COMMAND,
      () => {
        setModalOpen(true);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  const onClose = () => {
    setModalOpen(false);
  };

  const onDelete = () => {
    setModalOpen(false);
  };

  const onSave = (elements: ExcalidrawInitialElements, appState: Partial<AppState>, files: BinaryFiles) => {
    editor.update(() => {
      const excalidrawNode = $createExcalidrawNode();
      const data = { appState, elements, files };
      const encoded = Either.getOrElse(encodeExcalidrawData(data), () => "{}");
      excalidrawNode.setData(encoded);
      $insertNodes([excalidrawNode]);
      if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
        $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
      }
    });
    setModalOpen(false);
  };

  return isModalOpen ? (
    <ExcalidrawModal
      initialElements={[]}
      initialAppState={{} as AppState}
      initialFiles={{}}
      isShown={isModalOpen}
      onDelete={onDelete}
      onClose={onClose}
      onSave={onSave}
      closeOnClickOutside={false}
    />
  ) : null;
}

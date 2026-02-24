"use client";

import type { ExcalidrawElement, NonDeleted } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import type { NodeKey } from "lexical";
import { $getNodeByKey, CLICK_COMMAND, COMMAND_PRIORITY_LOW, isDOMNode } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExcalidrawInitialElements } from "../../ui/ExcalidrawModal";
import ExcalidrawModal from "../../ui/ExcalidrawModal";
import ImageResizer from "../../ui/ImageResizer";
import ExcalidrawImage from "./ExcalidrawImage";
import { $isExcalidrawNode } from "./excalidraw-utils";

// Type for Excalidraw data after decoding from JSON storage
// Uses the actual Excalidraw types for type safety after schema validation
interface ExcalidrawDecodedData {
  readonly appState: AppState;
  readonly elements: NonDeleted<ExcalidrawElement>[];
  readonly files: BinaryFiles;
}

// Schema for Excalidraw data serialization/deserialization
// Uses S.Unknown for complex Excalidraw types from external library
const ExcalidrawDataSchema = S.Struct({
  appState: S.Unknown,
  elements: S.Unknown,
  files: S.Unknown,
});

const encodeExcalidrawData = S.encodeUnknownSync(S.parseJson(ExcalidrawDataSchema));
const decodeExcalidrawData = S.decodeUnknownEither(S.parseJson(ExcalidrawDataSchema));

export default function ExcalidrawComponent({
  nodeKey,
  data,
  width,
  height,
}: {
  readonly data: string;
  readonly nodeKey: NodeKey;
  readonly width: "inherit" | number;
  readonly height: "inherit" | number;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [isModalOpen, setModalOpen] = useState<boolean>(data === "[]" && editor.isEditable());
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const captionButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    if (!isEditable) {
      if (isSelected) {
        clearSelection();
      }
      return;
    }
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const buttonElem = buttonRef.current;
          const eventTarget = event.target;

          if (isResizing) {
            return true;
          }

          if (buttonElem !== null && isDOMNode(eventTarget) && buttonElem.contains(eventTarget)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            if (event.detail > 1) {
              setModalOpen(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, isResizing, setSelected, isEditable]);

  const deleteNode = useCallback(() => {
    setModalOpen(false);
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  const setData = (els: ExcalidrawInitialElements, aps: Partial<AppState>, fls: BinaryFiles) => {
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        if ((els && !A.isEmptyReadonlyArray(els)) || !A.isEmptyReadonlyArray(Struct.keys(fls))) {
          node.setData(
            encodeExcalidrawData({
              appState: aps,
              elements: els,
              files: fls,
            })
          );
        } else {
          node.remove();
        }
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeEnd = (nextWidth: "inherit" | number, nextHeight: "inherit" | number) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if ($isExcalidrawNode(node)) {
        node.setWidth(nextWidth);
        node.setHeight(nextHeight);
      }
    });
  };

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Decode Excalidraw data from JSON string with proper type assertions
  // The schema validates structure, then we assert to Excalidraw's external types
  const { elements, files, appState } = useMemo((): ExcalidrawDecodedData => {
    const defaultData: ExcalidrawDecodedData = {
      elements: [] as NonDeleted<ExcalidrawElement>[],
      files: {} as BinaryFiles,
      appState: { isLoading: false } as AppState,
    };

    return Either.match(decodeExcalidrawData(data), {
      onLeft: () => defaultData,
      onRight: (decoded) => ({
        elements: (decoded.elements ?? []) as NonDeleted<ExcalidrawElement>[],
        files: (decoded.files ?? {}) as BinaryFiles,
        appState: (decoded.appState ?? { isLoading: false }) as AppState,
      }),
    });
  }, [data]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    if (A.isEmptyReadonlyArray(elements)) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) {
          node.remove();
        }
      });
    }
  }, [editor, nodeKey, elements.length]);

  return (
    <>
      {isEditable && isModalOpen && (
        <ExcalidrawModal
          initialElements={elements}
          initialFiles={files}
          initialAppState={appState}
          isShown={isModalOpen}
          onDelete={deleteNode}
          onClose={closeModal}
          onSave={(els, aps, fls) => {
            setData(els, aps, fls);
            setModalOpen(false);
          }}
          closeOnClickOutside={false}
        />
      )}
      {!A.isEmptyReadonlyArray(elements) && (
        <button type={"button"} ref={buttonRef} className={`excalidraw-button ${isSelected ? "selected" : ""}`}>
          <ExcalidrawImage
            imageContainerRef={imageContainerRef}
            className="image"
            elements={elements}
            files={files}
            appState={appState}
            width={width}
            height={height}
          />
          {isSelected && isEditable && (
            <div
              className="image-edit-button"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={openModal}
            />
          )}
          {(isSelected || isResizing) && isEditable && (
            <ImageResizer
              buttonRef={captionButtonRef}
              showCaption={true}
              setShowCaption={() => null}
              imageRef={imageContainerRef}
              editor={editor}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
              captionsEnabled={true}
            />
          )}
        </button>
      )}
    </>
  );
}

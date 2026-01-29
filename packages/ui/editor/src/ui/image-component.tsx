"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified to use Effect utilities and @effect-atom/atom-react.
 */

import {
  Atom,
  AtomRef,
  Result,
  useAtomMount,
  useAtomRef,
  useAtomSuspense,
  useAtomValue,
} from "@effect-atom/atom-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { BaseSelection, LexicalCommand, LexicalEditor, NodeKey } from "lexical";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { type JSX, Suspense, useId } from "react";

import { ImageResizer } from "./image-resizer";

/**
 * Tagged error for image loading failures.
 */
class ImageLoadError extends S.TaggedError<ImageLoadError>()("ImageLoadError", {
  src: S.String,
  cause: S.optional(S.Defect),
}) {}

/**
 * Image loading status type.
 */
interface ImageStatus {
  readonly width: number;
  readonly height: number;
}

/**
 * Effect-based image loader that wraps the browser Image API.
 */
const loadImage = (src: string): Effect.Effect<ImageStatus, ImageLoadError> =>
  Effect.async<ImageStatus, ImageLoadError>((resume) => {
    const img = new Image();
    img.src = src;
    img.onload = () =>
      resume(
        Effect.succeed({
          height: img.naturalHeight,
          width: img.naturalWidth,
        })
      );
    img.onerror = () => resume(Effect.fail(new ImageLoadError({ src })));
  });

/**
 * Atom family for image loading.
 * Creates an async atom per image src that returns Result.Result<ImageStatus, ImageLoadError>.
 * Used with useAtomSuspense for React Suspense integration.
 */
const imageLoadAtomFamily = Atom.family((src: string) => Atom.make(loadImage(src)));

/**
 * Right click image command for context menu support.
 */
export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand("RIGHT_CLICK_IMAGE_COMMAND");

/**
 * Interface for ImageComponent refs state.
 * Contains AtomRefs for all mutable state.
 */
interface ImageComponentRefs {
  readonly imageRef: AtomRef.AtomRef<O.Option<HTMLElement>>;
  readonly buttonRef: AtomRef.AtomRef<O.Option<HTMLButtonElement>>;
  readonly activeEditorRef: AtomRef.AtomRef<O.Option<LexicalEditor>>;
  readonly isResizingRef: AtomRef.AtomRef<boolean>;
  readonly selectionRef: AtomRef.AtomRef<O.Option<BaseSelection>>;
  readonly isLoadErrorRef: AtomRef.AtomRef<boolean>;
}

/**
 * Atom family for creating per-instance refs.
 * Each ImageComponent instance gets its own set of refs keyed by useId().
 */
const imageComponentRefsFamily = Atom.family((_key: string) =>
  Atom.make<ImageComponentRefs>((_get) => ({
    imageRef: AtomRef.make<O.Option<HTMLElement>>(O.none()),
    buttonRef: AtomRef.make<O.Option<HTMLButtonElement>>(O.none()),
    activeEditorRef: AtomRef.make<O.Option<LexicalEditor>>(O.none()),
    isResizingRef: AtomRef.make<boolean>(false),
    selectionRef: AtomRef.make<O.Option<BaseSelection>>(O.none()),
    isLoadErrorRef: AtomRef.make<boolean>(false),
  }))
);

/**
 * Configuration for editor command registration atom.
 */
interface EditorCommandConfig {
  readonly editor: LexicalEditor;
  readonly nodeKey: NodeKey;
  readonly refs: ImageComponentRefs;
  readonly isSelected: boolean;
  readonly setSelected: (selected: boolean) => void;
  readonly clearSelection: () => void;
  readonly showCaption: boolean;
  readonly caption: LexicalEditor;
}

/**
 * Atom family for editor command registration.
 * Uses addFinalizer for cleanup when atom is unmounted.
 */
const editorCommandsAtomFamily = Atom.family((config: EditorCommandConfig) =>
  Atom.make<void>((get) => {
    const { editor, refs, isSelected, setSelected, clearSelection, showCaption, caption } = config;
    const { imageRef, buttonRef, activeEditorRef, selectionRef } = refs;

    const rootElement = editor.getRootElement();

    /**
     * Handler for delete/backspace keys.
     */
    const $onDelete = (payload: KeyboardEvent): boolean => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        payload.preventDefault();
        editor.update(() => {
          deleteSelection.getNodes().forEach((node) => {
            if ("remove" in node && typeof node.remove === "function") {
              node.remove();
            }
          });
        });
      }
      return false;
    };

    /**
     * Handler for enter key.
     */
    const $onEnter = (event: KeyboardEvent): boolean => {
      const latestSelection = $getSelection();
      const buttonElemOption = buttonRef.value;

      if (isSelected && $isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
        if (showCaption) {
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        }

        return F.pipe(
          buttonElemOption,
          O.filter((elem) => elem !== document.activeElement),
          O.match({
            onNone: () => false,
            onSome: (buttonElem) => {
              event.preventDefault();
              buttonElem.focus();
              return true;
            },
          })
        );
      }
      return false;
    };

    /**
     * Handler for escape key.
     */
    const $onEscape = (event: KeyboardEvent): boolean => {
      const activeEditor = activeEditorRef.value;
      const buttonElem = buttonRef.value;

      const isActiveCaption = F.pipe(
        activeEditor,
        O.map((ed) => ed === caption),
        O.getOrElse(() => false)
      );

      const isButtonTarget = F.pipe(
        buttonElem,
        O.map((btn) => btn === event.target),
        O.getOrElse(() => false)
      );

      if (isActiveCaption || isButtonTarget) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    };

    /**
     * Handler for click events.
     */
    const onClick = (payload: MouseEvent): boolean => {
      const isResizing = refs.isResizingRef.value;
      if (isResizing) {
        return true;
      }

      const imageElem = F.pipe(
        imageRef.value,
        O.getOrElse(() => null as HTMLImageElement | null)
      );

      if (payload.target === imageElem) {
        if (payload.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    };

    /**
     * Handler for right-click context menu.
     */
    const onRightClick = (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target;
        if (
          domElement instanceof HTMLElement &&
          domElement.tagName === "IMG" &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event);
        }
      });
    };

    // Register all commands
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        selectionRef.set(O.fromNullable(editorState.read(() => $getSelection())));
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.set(O.some(activeEditor));
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand<MouseEvent>(RIGHT_CLICK_IMAGE_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          const imageElem = F.pipe(
            imageRef.value,
            O.getOrElse(() => null as HTMLImageElement | null)
          );
          if (event.target === imageElem) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW)
    );

    // Add context menu listener
    if (rootElement) {
      rootElement.addEventListener("contextmenu", onRightClick);
    }

    // Register cleanup using addFinalizer
    get.addFinalizer(() => {
      unregister();
      if (rootElement) {
        rootElement.removeEventListener("contextmenu", onRightClick);
      }
    });
  })
);

/**
 * Props for LazyImage component.
 */
interface LazyImageProps {
  readonly altText: string;
  readonly className: string | null;
  readonly height: "inherit" | number;
  readonly imageRef: AtomRef.AtomRef<O.Option<HTMLElement>>;
  readonly maxWidth: number;
  readonly src: string;
  readonly width: "inherit" | number;
  readonly onError: () => void;
}

/**
 * LazyImage component that loads images with Suspense support.
 * Uses useAtomSuspense with imageLoadAtomFamily for proper effect-atom integration.
 * Uses Result.builder() for exhaustive state handling.
 */
function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxWidth,
  onError,
}: LazyImageProps): JSX.Element {
  const imageAtom = imageLoadAtomFamily(src);
  const result = useAtomSuspense(imageAtom, { includeFailure: true });

  return Result.builder(result)
    .onWaiting(() => <BrokenImage />)
    .onError((_error) => {
      // Schedule onError call to avoid render phase side effects
      queueMicrotask(onError);
      return <BrokenImage />;
    })
    .onDefect((_defect) => {
      // Schedule onError call to avoid render phase side effects
      queueMicrotask(onError);
      return <BrokenImage />;
    })
    .onSuccess((_imageStatus) => (
      <img
        className={className || undefined}
        src={src}
        alt={altText}
        ref={(el) => {
          imageRef.set(O.fromNullable(el));
        }}
        style={{
          height,
          maxWidth,
          width,
        }}
        onError={onError}
        draggable="false"
      />
    ))
    .orElse(() => <BrokenImage />);
}

/**
 * BrokenImage component displayed when image fails to load.
 */
function BrokenImage(): JSX.Element {
  return (
    <img
      src=""
      style={{
        height: 200,
        opacity: 0.2,
        width: 200,
      }}
      draggable="false"
      alt="Failed to load"
    />
  );
}

/**
 * Type guard for ImageNode.
 */
function $isImageNode(node: unknown): node is {
  setShowCaption: (show: boolean) => void;
  setWidthAndHeight: (width: "inherit" | number, height: "inherit" | number) => void;
} {
  return P.isObject(node) && P.hasProperty("setShowCaption")(node) && P.hasProperty("setWidthAndHeight")(node);
}

/**
 * Props for ImageComponent.
 */
interface ImageComponentProps {
  readonly altText: string;
  readonly caption: LexicalEditor;
  readonly height: "inherit" | number;
  readonly maxWidth: number;
  readonly nodeKey: NodeKey;
  readonly resizable: boolean;
  readonly showCaption: boolean;
  readonly src: string;
  readonly width: "inherit" | number;
  readonly captionsEnabled: boolean;
}

/**
 * ImageComponent that displays and manages images within Lexical editor.
 *
 * Uses AtomRef from @effect-atom/atom-react for state management:
 * - `imageRef` - Tracks the image DOM element with Option
 * - `buttonRef` - Tracks the caption button DOM element with Option
 * - `activeEditorRef` - Tracks the currently active nested editor with Option
 * - `isResizingRef` - Boolean flag for resize mode
 * - `selectionRef` - Tracks editor selection state with Option
 * - `isLoadErrorRef` - Boolean flag for load error state
 *
 * Uses Atom.family with addFinalizer for Lexical command registration/cleanup.
 *
 * @since 1.0.0
 */
export function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  captionsEnabled,
}: ImageComponentProps): JSX.Element {
  const id = useId();

  // Get stable refs for this component instance via Atom.family
  const refs = useAtomValue(imageComponentRefsFamily(id));
  const { imageRef, buttonRef, isResizingRef, selectionRef, isLoadErrorRef } = refs;

  // Subscribe to AtomRef values for reactivity
  const isResizing = useAtomRef(isResizingRef);
  const selection = useAtomRef(selectionRef);
  const isLoadError = useAtomRef(isLoadErrorRef);

  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();

  // Create and mount editor commands atom with cleanup via addFinalizer
  const commandsAtom = editorCommandsAtomFamily({
    editor,
    nodeKey,
    refs,
    isSelected,
    setSelected,
    clearSelection,
    showCaption,
    caption,
  });
  useAtomMount(commandsAtom);

  // Compute derived state inline
  const isNodeSelection = F.pipe(selection, O.filter($isNodeSelection), O.isSome);
  const draggable = isSelected && isNodeSelection && !isResizing;
  const isFocused = (isSelected || isResizing) && isEditable;

  return (
    <Suspense fallback={null}>
      <>
        <div draggable={draggable}>
          {isLoadError ? (
            <BrokenImage />
          ) : (
            <LazyImage
              className={
                isFocused
                  ? `max-w-full cursor-default focused ring-primary ring-2 ring-offset-2 ${isNodeSelection ? "draggable cursor-grab active:cursor-grabbing" : ""}`
                  : "max-w-full cursor-default"
              }
              src={src}
              altText={altText}
              imageRef={imageRef}
              width={width}
              height={height}
              maxWidth={maxWidth}
              onError={() => isLoadErrorRef.set(true)}
            />
          )}
        </div>

        {resizable && isNodeSelection && isFocused && (
          <ImageResizer
            showCaption={showCaption}
            setShowCaption={(show: boolean) => {
              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node)) {
                  node.setShowCaption(show);
                }
              });
            }}
            editor={editor}
            buttonRef={buttonRef}
            imageRef={imageRef}
            maxWidth={maxWidth}
            onResizeStart={() => {
              isResizingRef.set(true);
            }}
            onResizeEnd={(nextWidth: "inherit" | number, nextHeight: "inherit" | number) => {
              setTimeout(() => {
                isResizingRef.set(false);
              }, 200);

              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node)) {
                  node.setWidthAndHeight(nextWidth, nextHeight);
                }
              });
            }}
            captionsEnabled={!isLoadError && captionsEnabled}
          />
        )}
      </>
    </Suspense>
  );
}

export default ImageComponent;

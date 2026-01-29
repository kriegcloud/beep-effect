"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified to use Effect utilities and @effect-atom/atom-react.
 */
import { Button } from "@beep/ui/components/button";
import { Atom, AtomRef, useAtomValue } from "@effect-atom/atom-react";
import { calculateZoomLevel } from "@lexical/utils";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import type { LexicalEditor } from "lexical";
import type * as React from "react";
import { type JSX, useId } from "react";

/**
 * Direction flags for resize handles.
 * Uses bitwise flags to support combined directions (e.g., north | east for NE corner).
 */
const Direction = {
  east: 1 << 0,
  north: 1 << 3,
  south: 1 << 1,
  west: 1 << 2,
} as const;

/**
 * State for tracking user-select CSS property to restore after resize.
 */
interface UserSelectState {
  readonly priority: string;
  readonly value: string;
}

/**
 * State for tracking resize positioning and dimensions.
 */
interface PositioningState {
  readonly currentHeight: "inherit" | number;
  readonly currentWidth: "inherit" | number;
  readonly direction: number;
  readonly isResizing: boolean;
  readonly ratio: number;
  readonly startHeight: number;
  readonly startWidth: number;
  readonly startX: number;
  readonly startY: number;
}

/**
 * Initial positioning state used for reset.
 */
const initialPositioningState: PositioningState = {
  currentHeight: 0,
  currentWidth: 0,
  direction: 0,
  isResizing: false,
  ratio: 0,
  startHeight: 0,
  startWidth: 0,
  startX: 0,
  startY: 0,
};

/**
 * Initial user select state.
 */
const initialUserSelectState: UserSelectState = {
  priority: "",
  value: "default",
};

/**
 * Combined refs state for an ImageResizer instance.
 */
interface ImageResizerRefs {
  readonly controlWrapperRef: AtomRef.AtomRef<O.Option<HTMLDivElement>>;
  readonly userSelectRef: AtomRef.AtomRef<UserSelectState>;
  readonly positioningRef: AtomRef.AtomRef<PositioningState>;
}

/**
 * Atom family for creating per-instance refs.
 * Each ImageResizer component gets its own set of refs keyed by useId().
 */
const imageResizerRefsFamily = Atom.family((_key: string) =>
  Atom.make<ImageResizerRefs>((_get) => ({
    controlWrapperRef: AtomRef.make<O.Option<HTMLDivElement>>(O.none()),
    userSelectRef: AtomRef.make<UserSelectState>(initialUserSelectState),
    positioningRef: AtomRef.make<PositioningState>(initialPositioningState),
  }))
);

/**
 * Hook to get the refs for an ImageResizer instance.
 */
function useImageResizerRefs(): ImageResizerRefs {
  const id = useId();
  const atom = imageResizerRefsFamily(id);
  return useAtomValue(atom);
}

/**
 * Props for the ImageResizer component.
 */
interface ImageResizerProps {
  readonly editor: LexicalEditor;
  readonly buttonRef: AtomRef.AtomRef<O.Option<HTMLButtonElement>>;
  readonly imageRef: AtomRef.AtomRef<O.Option<HTMLElement>>;
  readonly maxWidth?: undefined | number;
  readonly onResizeEnd: (width: "inherit" | number, height: "inherit" | number) => void;
  readonly onResizeStart: () => void;
  readonly setShowCaption: (show: boolean) => void;
  readonly showCaption: boolean;
  readonly captionsEnabled: boolean;
}

/**
 * ImageResizer component that provides resize handles around an image.
 *
 * Uses AtomRef from @effect-atom/atom-react for state management:
 * - `controlWrapperRef` - Tracks the wrapper DOM element with Option
 * - `userSelectRef` - Stores cursor state for restoration after resize
 * - `positioningRef` - Complex resize state tracking
 *
 * AtomRefs are created via Atom.family keyed by useId() to ensure
 * each component instance gets its own stable refs.
 *
 * Uses Effect utilities:
 * - `O.Option` for nullable DOM element handling
 * - `Num.clamp` instead of native Math.min/Math.max
 * - `F.pipe` for functional composition
 *
 * @example
 * ```tsx
 * import { ImageResizer } from "./ui/image-resizer";
 *
 * function ImageComponent({ editor, imageRef, buttonRef }) {
 *   const [showCaption, setShowCaption] = useState(false);
 *
 *   return (
 *     <ImageResizer
 *       editor={editor}
 *       imageRef={imageRef}
 *       buttonRef={buttonRef}
 *       showCaption={showCaption}
 *       setShowCaption={setShowCaption}
 *       captionsEnabled={true}
 *       onResizeStart={() => console.log("Resize started")}
 *       onResizeEnd={(width, height) => console.log("Resized to", width, height)}
 *     />
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 */
export function ImageResizer({
  onResizeStart,
  onResizeEnd,
  buttonRef,
  imageRef,
  maxWidth,
  editor,
  showCaption,
  setShowCaption,
  captionsEnabled,
}: ImageResizerProps): JSX.Element {
  // Get stable refs for this component instance via Atom.family
  const { controlWrapperRef, userSelectRef, positioningRef } = useImageResizerRefs();

  const editorRootElement = editor.getRootElement();

  // Find max width, accounting for editor padding
  const maxWidthContainer = F.pipe(
    O.fromNullable(maxWidth),
    O.orElse(() =>
      F.pipe(
        O.fromNullable(editorRootElement),
        O.map((el) => el.getBoundingClientRect().width - 20)
      )
    ),
    O.getOrElse(() => 100)
  );

  const maxHeightContainer = F.pipe(
    O.fromNullable(editorRootElement),
    O.map((el) => el.getBoundingClientRect().height - 20),
    O.getOrElse(() => 100)
  );

  const minWidth = 100;
  const minHeight = 100;

  /**
   * Sets the resize cursor based on the direction.
   */
  const setStartCursor = (direction: number): void => {
    const ew = direction === Direction.east || direction === Direction.west;
    const ns = direction === Direction.north || direction === Direction.south;
    const nwse =
      (direction & Direction.north && direction & Direction.west) ||
      (direction & Direction.south && direction & Direction.east);

    const cursorDir = ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw";

    F.pipe(
      O.fromNullable(editorRootElement),
      O.map((el) => {
        el.style.setProperty("cursor", `${cursorDir}-resize`, "important");
      })
    );

    if (document.body !== null) {
      document.body.style.setProperty("cursor", `${cursorDir}-resize`, "important");

      // Store current user-select values for restoration
      userSelectRef.set({
        value: document.body.style.getPropertyValue("-webkit-user-select"),
        priority: document.body.style.getPropertyPriority("-webkit-user-select"),
      });

      document.body.style.setProperty("-webkit-user-select", "none", "important");
    }
  };

  /**
   * Restores the cursor after resize is complete.
   */
  const setEndCursor = (): void => {
    F.pipe(
      O.fromNullable(editorRootElement),
      O.map((el) => {
        el.style.setProperty("cursor", "text");
      })
    );

    if (document.body !== null) {
      const { value, priority } = userSelectRef.value;
      document.body.style.setProperty("cursor", "default");
      document.body.style.setProperty("-webkit-user-select", value, priority);
    }
  };

  /**
   * Handles pointer down on resize handles.
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, direction: number): void => {
    if (!editor.isEditable()) {
      return;
    }

    const imageOption = imageRef.value;
    const controlWrapperOption = controlWrapperRef.value;

    F.pipe(
      imageOption,
      O.flatMap((img) =>
        F.pipe(
          controlWrapperOption,
          O.map((controlWrapper) => {
            event.preventDefault();
            const { width, height } = img.getBoundingClientRect();
            const zoom = calculateZoomLevel(img);

            // Update positioning state
            positioningRef.set({
              startWidth: width,
              startHeight: height,
              ratio: width / height,
              currentWidth: width,
              currentHeight: height,
              startX: event.clientX / zoom,
              startY: event.clientY / zoom,
              isResizing: true,
              direction,
            });

            setStartCursor(direction);
            onResizeStart();

            controlWrapper.classList.add("touch-action-none");
            img.style.height = `${height}px`;
            img.style.width = `${width}px`;

            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerUp);
          })
        )
      )
    );
  };

  /**
   * Handles pointer move during resize.
   */
  const handlePointerMove = (event: PointerEvent): void => {
    const imageOption = imageRef.value;
    const positioning = positioningRef.value;

    const isHorizontal = positioning.direction & (Direction.east | Direction.west);
    const isVertical = positioning.direction & (Direction.south | Direction.north);

    F.pipe(
      imageOption,
      O.filter(() => positioning.isResizing),
      O.map((img) => {
        const zoom = calculateZoomLevel(img);

        // Corner cursor - resize both dimensions proportionally
        if (isHorizontal && isVertical) {
          let diff = Math.floor(positioning.startX - event.clientX / zoom);
          diff = positioning.direction & Direction.east ? -diff : diff;

          const width = Num.clamp(positioning.startWidth + diff, {
            minimum: minWidth,
            maximum: maxWidthContainer,
          });

          const height = width / positioning.ratio;
          img.style.width = `${width}px`;
          img.style.height = `${height}px`;

          positioningRef.update((p) => ({
            ...p,
            currentHeight: height,
            currentWidth: width,
          }));
        } else if (isVertical) {
          // Vertical-only resize
          let diff = Math.floor(positioning.startY - event.clientY / zoom);
          diff = positioning.direction & Direction.south ? -diff : diff;

          const height = Num.clamp(positioning.startHeight + diff, {
            minimum: minHeight,
            maximum: maxHeightContainer,
          });

          img.style.height = `${height}px`;

          positioningRef.update((p) => ({
            ...p,
            currentHeight: height,
          }));
        } else {
          // Horizontal-only resize
          let diff = Math.floor(positioning.startX - event.clientX / zoom);
          diff = positioning.direction & Direction.east ? -diff : diff;

          const width = Num.clamp(positioning.startWidth + diff, {
            minimum: minWidth,
            maximum: maxWidthContainer,
          });

          img.style.width = `${width}px`;

          positioningRef.update((p) => ({
            ...p,
            currentWidth: width,
          }));
        }
      })
    );
  };

  /**
   * Handles pointer up to complete resize.
   */
  const handlePointerUp = (): void => {
    const imageOption = imageRef.value;
    const positioning = positioningRef.value;
    const controlWrapperOption = controlWrapperRef.value;

    F.pipe(
      imageOption,
      O.filter(() => positioning.isResizing),
      O.flatMap((_img) =>
        F.pipe(
          controlWrapperOption,
          O.map((controlWrapper) => {
            const width = positioning.currentWidth;
            const height = positioning.currentHeight;

            // Reset positioning state
            positioningRef.set(initialPositioningState);

            controlWrapper.classList.remove("touch-action-none");

            setEndCursor();
            onResizeEnd(width, height);

            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
          })
        )
      )
    );
  };

  return (
    <div
      ref={(el) => {
        controlWrapperRef.set(O.fromNullable(el));
      }}
    >
      {!showCaption && captionsEnabled && (
        <Button
          className="image-caption-button absolute bottom-1 left-1/2 -translate-x-1/2"
          ref={(el) => {
            buttonRef.set(O.fromNullable(el));
          }}
          variant="outline"
          onClick={() => {
            setShowCaption(!showCaption);
          }}
        >
          Add Caption
        </Button>
      )}
      <div
        className="image-resizer image-resizer-n bg-primary absolute -top-2.5 left-1/2 h-2 w-2 -translate-x-1/2 cursor-ns-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.north);
        }}
      />
      <div
        className="image-resizer image-resizer-ne bg-primary absolute -top-2.5 -right-2.5 h-2 w-2 cursor-nesw-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.north | Direction.east);
        }}
      />
      <div
        className="image-resizer image-resizer-e bg-primary absolute top-1/2 -right-2.5 h-2 w-2 -translate-y-1/2 cursor-ew-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.east);
        }}
      />
      <div
        className="image-resizer image-resizer-se bg-primary absolute -right-2.5 -bottom-2.5 h-2 w-2 cursor-nwse-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south | Direction.east);
        }}
      />
      <div
        className="image-resizer image-resizer-s bg-primary absolute -bottom-2.5 left-1/2 h-2 w-2 -translate-x-1/2 cursor-ns-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south);
        }}
      />
      <div
        className="image-resizer image-resizer-sw bg-primary absolute -bottom-2.5 -left-2.5 h-2 w-2 cursor-nesw-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south | Direction.west);
        }}
      />
      <div
        className="image-resizer image-resizer-w bg-primary absolute top-1/2 -left-2.5 h-2 w-2 -translate-y-1/2 cursor-ew-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.west);
        }}
      />
      <div
        className="image-resizer image-resizer-nw bg-primary absolute -top-2.5 -left-2.5 h-2 w-2 cursor-nwse-resize"
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.north | Direction.west);
        }}
      />
    </div>
  );
}

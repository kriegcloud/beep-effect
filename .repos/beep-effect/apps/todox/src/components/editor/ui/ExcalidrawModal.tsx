"use client";

import { Button } from "@beep/todox/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@beep/todox/components/ui/dialog";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), {
  ssr: false,
});

import { isDOMNode } from "lexical";
import type { JSX } from "react";
import { type ReactPortal, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ExcalidrawInitialElements = ExcalidrawInitialDataState["elements"];

type Props = {
  readonly closeOnClickOutside?: undefined | boolean;
  /**
   * The initial set of elements to draw into the scene
   */
  readonly initialElements: ExcalidrawInitialElements;
  /**
   * The initial set of elements to draw into the scene
   */
  readonly initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  readonly initialFiles: BinaryFiles;
  /**
   * Controls the visibility of the modal
   */
  readonly isShown?: undefined | boolean;
  /**
   * Callback when closing and discarding the new changes
   */
  readonly onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  readonly onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  readonly onSave: (elements: ExcalidrawInitialElements, appState: Partial<AppState>, files: BinaryFiles) => void;
};

/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
 */
export default function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose,
}: Props): ReactPortal | null {
  const excaliDrawModelRef = useRef<HTMLDivElement | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] = useState<ExcalidrawInitialElements>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);

  useEffect(() => {
    excaliDrawModelRef.current?.focus();
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelRef.current !== null &&
        isDOMNode(target) &&
        !excaliDrawModelRef.current.contains(target) &&
        closeOnClickOutside
      ) {
        onDelete();
      }
    };

    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      modalOverlayElement?.addEventListener("click", clickOutsideHandler);
    }

    return () => {
      modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
    };
  }, [closeOnClickOutside, onDelete]);

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDelete();
      }
    };

    currentModalRef?.addEventListener("keydown", onKeyDown);

    return () => {
      currentModalRef?.removeEventListener("keydown", onKeyDown);
    };
  }, [elements, files, onDelete]);

  const save = () => {
    if (elements?.some((el) => !el.isDeleted)) {
      const appState = excalidrawAPI?.getAppState();
      // We only need a subset of the state
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === "dark",
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(elements, partialState, files);
    } else {
      // delete node if the scene is clear
      onDelete();
    }
  };

  const discard = () => {
    setDiscardModalOpen(true);
  };

  function ShowDiscardDialog(): JSX.Element {
    return (
      <Dialog open onOpenChange={(open) => !open && setDiscardModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to discard the changes?</p>
          <div className="mt-[60px] text-center flex gap-2 justify-center">
            <Button
              onClick={() => {
                setDiscardModalOpen(false);
                onClose();
              }}
            >
              Discard
            </Button>
            <Button
              onClick={() => {
                setDiscardModalOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isShown === false) {
    return null;
  }

  const onChange = (els: ExcalidrawInitialElements, _: AppState, fls: BinaryFiles) => {
    setElements(els);
    setFiles(fls);
  };

  return createPortal(
    <div className="flex items-center fixed inset-0 flex-col shrink z-[100] bg-black/60" role="dialog">
      <div
        className="relative z-10 top-[50px] w-auto left-0 flex justify-center items-center rounded-lg bg-muted overflow-visible"
        ref={excaliDrawModelRef}
        tabIndex={-1}
      >
        <div className="relative p-[40px_5px_5px] w-[70vw] h-[70vh] rounded-lg shadow-xl [&>div]:rounded overflow-visible">
          {discardModalOpen && <ShowDiscardDialog />}
          <Excalidraw
            onChange={onChange}
            excalidrawAPI={setExcalidrawAPI}
            initialData={{
              appState: initialAppState || { isLoading: false },
              elements: initialElements,
              files: initialFiles,
            }}
          />
          <div className="text-end absolute right-1.5 top-1.5 z-[1] [&>button]:bg-background [&>button]:rounded [&>button]:px-2 [&>button]:py-1 [&>button]:mx-1">
            <button type="button" onClick={discard}>
              Discard
            </button>
            <button type="button" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

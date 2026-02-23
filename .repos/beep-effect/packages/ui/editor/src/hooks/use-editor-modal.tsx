"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified to use Effect utilities and @effect-atom/atom-react.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@beep/ui/components/dialog";
import { thunkNull } from "@beep/utils";
import { Atom, useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { JSX } from "react";

/**
 * Modal content state interface.
 */
interface ModalContent {
  readonly title: string;
  readonly content: JSX.Element;
  readonly closeOnClickOutside: boolean;
}

/**
 * Creates an atom for editor modal state.
 * Uses `Atom.family` for keyed instances to support multiple modals.
 */
const modalAtomFamily = Atom.family((_key: string) => Atom.make(O.none<ModalContent>()));

/**
 * Default atom for single-modal usage.
 * Most editor use cases only need one modal at a time.
 */
const defaultModalAtom = Atom.make(O.none<ModalContent>());

/**
 * Options for the useEditorModal hook.
 */
export interface UseEditorModalOptions {
  /**
   * Optional unique key for this modal instance.
   * Use when you need multiple independent modal systems.
   * If not provided, uses a shared default atom.
   */
  readonly key?: undefined | string;
}

/**
 * Hook for managing editor modals using Effect-Atom patterns.
 *
 * This hook provides a modal system that can display any JSX content
 * in a dialog with a title. It uses @effect-atom/atom-react for state
 * management instead of React hooks.
 *
 * @example
 * ```tsx
 * import { useEditorModal } from "./use-editor-modal";
 *
 * function EditorToolbar() {
 *   const [modal, showModal] = useEditorModal();
 *
 *   const handleClick = () => {
 *     showModal("Insert Image", (onClose) => (
 *       <ImageForm onSubmit={(url) => {
 *         // Insert image...
 *         onClose();
 *       }} />
 *     ));
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleClick}>Insert Image</button>
 *       {modal}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With a unique key for multiple modal instances
 * function MultiEditorApp() {
 *   const [modal1, showModal1] = useEditorModal({ key: "editor-1" });
 *   const [modal2, showModal2] = useEditorModal({ key: "editor-2" });
 *
 *   return (
 *     <>
 *       <Editor1 showModal={showModal1} />
 *       <Editor2 showModal={showModal2} />
 *       {modal1}
 *       {modal2}
 *     </>
 *   );
 * }
 * ```
 *
 * @param options - Optional configuration including a unique key
 * @returns A tuple containing:
 *   - `modal`: JSX.Element | null - The modal element to render
 *   - `showModal`: Function to display a modal with a title and content
 *
 * @since 0.1.0
 */
export function useEditorModal(
  options?: undefined | UseEditorModalOptions
): [
  JSX.Element | null,
  (title: string, getContent: (onClose: () => void) => JSX.Element, closeOnClickOutside?: undefined | boolean) => void,
] {
  // Use keyed atom from family if key provided, otherwise use default atom
  const modalAtom = F.pipe(
    O.fromNullable(options?.key),
    O.match({
      onNone: () => defaultModalAtom,
      onSome: modalAtomFamily,
    })
  );

  const [modalContent, setModalContent] = useAtom(modalAtom);

  /**
   * Closes the modal by setting state to O.none().
   */
  const onClose = (): void => {
    setModalContent(O.none<ModalContent>());
  };

  /**
   * Shows a modal with the given title and content.
   */
  const showModal = (
    title: string,
    getContent: (onClose: () => void) => JSX.Element,
    closeOnClickOutside = false
  ): void => {
    setModalContent(
      O.some({
        title,
        content: getContent(onClose),
        closeOnClickOutside,
      })
    );
  };

  /**
   * Renders the modal using O.match for Option pattern matching.
   */
  const modal = F.pipe(
    modalContent,
    O.match({
      onNone: thunkNull,
      onSome: ({ title, content, closeOnClickOutside }) => (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              onClose();
            }
          }}
          disablePointerDismissal={!closeOnClickOutside}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      ),
    })
  );

  return [modal, showModal];
}

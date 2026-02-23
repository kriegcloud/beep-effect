"use client";

import { thunkNoOp, thunkNoOpTyped } from "@beep/utils";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified to use Effect utilities and @effect-atom/atom-react.
 */
import { AtomRef, useAtomRef } from "@effect-atom/atom-react";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { LexicalEditor } from "lexical";
import type { JSX, ReactNode } from "react";

/**
 * Error thrown when toolbar context is accessed before the provider is mounted.
 */
export class ToolbarContextNotMountedError extends S.TaggedError<ToolbarContextNotMountedError>()(
  "ToolbarContextNotMountedError",
  {
    message: S.String,
    hook: S.String,
  }
) {}

/**
 * Type for the modal show function.
 */
type ShowModalFn = (title: string, showModal: (onClose: () => void) => JSX.Element) => void;

/**
 * Type for the toolbar context state accessible via atoms.
 */
interface ToolbarContextState {
  readonly activeEditor: LexicalEditor;
  readonly $updateToolbar: () => void;
  readonly blockType: string;
  readonly setBlockType: (blockType: string) => void;
  readonly showModal: ShowModalFn;
}

/**
 * Internal state for toolbar refs.
 */
interface ToolbarRefsState {
  readonly activeEditor: O.Option<LexicalEditor>;
  readonly $updateToolbar: O.Option<() => void>;
  readonly setBlockType: O.Option<(blockType: string) => void>;
  readonly showModal: O.Option<ShowModalFn>;
  readonly blockType: string;
}

/**
 * AtomRef for toolbar state.
 * Using AtomRef provides reactive updates with .set() and .value access.
 */
const toolbarRef = AtomRef.make<ToolbarRefsState>({
  activeEditor: O.none(),
  $updateToolbar: O.none(),
  setBlockType: O.none(),
  showModal: O.none(),
  blockType: "paragraph",
});

/**
 * Derived refs for individual properties.
 */
const activeEditorRef = toolbarRef.prop("activeEditor");
const updateToolbarRef = toolbarRef.prop("$updateToolbar");
const setBlockTypeRef = toolbarRef.prop("setBlockType");
const showModalRef = toolbarRef.prop("showModal");
const blockTypeRef = toolbarRef.prop("blockType");

/**
 * Props for the ToolbarContext provider component.
 */
interface ToolbarContextProps {
  readonly activeEditor: LexicalEditor;
  readonly $updateToolbar: () => void;
  readonly blockType: string;
  readonly setBlockType: (blockType: string) => void;
  readonly showModal: ShowModalFn;
  readonly children: ReactNode;
}

/**
 * ToolbarContext provider component.
 *
 * This component syncs props to AtomRef, allowing child components to access
 * toolbar state via useAtomRef hooks.
 *
 * Uses AtomRef from @effect-atom/atom-react:
 * - .set() for updating values
 * - .value for reading current value
 * - useAtomRef() for reactive subscriptions
 *
 * @example
 * ```tsx
 * import { ToolbarContext, useToolbarContext } from "./toolbar-context";
 *
 * function Toolbar() {
 *   return (
 *     <ToolbarContext
 *       activeEditor={editor}
 *       $updateToolbar={handleUpdate}
 *       blockType="paragraph"
 *       setBlockType={setBlockType}
 *       showModal={showModal}
 *     >
 *       <ToolbarButtons />
 *     </ToolbarContext>
 *   );
 * }
 *
 * function ToolbarButtons() {
 *   const { activeEditor, blockType, setBlockType } = useToolbarContext();
 *   // Use the context values...
 * }
 * ```
 *
 * @since 0.1.0
 */
export function ToolbarContext({
  activeEditor,
  $updateToolbar,
  blockType,
  setBlockType,
  showModal,
  children,
}: ToolbarContextProps): ReactNode {
  // Sync props to AtomRef

  toolbarRef.set({
    activeEditor: O.some(activeEditor),
    $updateToolbar: O.some($updateToolbar),
    setBlockType: O.some(setBlockType),
    showModal: O.some(showModal),
    blockType,
  });

  return <>{children}</>;
}

/**
 * Hook to access the full toolbar context.
 *
 * Returns an object with all toolbar context values, providing backwards
 * compatibility with the original React context-based implementation.
 *
 * @example
 * ```tsx
 * import { useToolbarContext } from "./toolbar-context";
 *
 * function FormatButton() {
 *   const { activeEditor, blockType, setBlockType, showModal } = useToolbarContext();
 *
 *   const handleFormat = () => {
 *     activeEditor.update(() => {
 *       // Format logic...
 *     });
 *     setBlockType("heading");
 *   };
 *
 *   return <button onClick={handleFormat}>Format</button>;
 * }
 * ```
 *
 * @throws ToolbarContextNotMountedError if context is accessed before provider is mounted
 * @returns The toolbar context state object
 *
 * @since 0.1.0
 */
export function useToolbarContext(): ToolbarContextState {
  const state = useAtomRef(toolbarRef);

  const activeEditor = O.getOrThrowWith(
    state.activeEditor,
    () =>
      new ToolbarContextNotMountedError({
        message: "activeEditor is not set. Ensure ToolbarContext provider is mounted.",
        hook: "useToolbarContext",
      })
  );

  const $updateToolbar = O.getOrElse(state.$updateToolbar, thunkNoOp);
  const setBlockTypeFn = O.getOrElse(state.setBlockType, thunkNoOpTyped<string>);
  const showModalFn = O.getOrElse(state.showModal, () => (_: string, __: (onClose: () => void) => JSX.Element) => {});

  return {
    activeEditor,
    $updateToolbar,
    blockType: state.blockType,
    setBlockType: setBlockTypeFn,
    showModal: showModalFn,
  };
}

/**
 * Hook to access only the activeEditor.
 *
 * Use this for more granular access when you only need the editor instance.
 *
 * @example
 * ```tsx
 * import { useActiveEditor } from "./toolbar-context";
 *
 * function EditorAction() {
 *   const activeEditor = useActiveEditor();
 *   // Use editor...
 * }
 * ```
 *
 * @throws ToolbarContextNotMountedError if context is accessed before provider is mounted
 * @returns The active LexicalEditor instance
 *
 * @since 0.1.0
 */
export function useActiveEditor(): LexicalEditor {
  const editorOption = useAtomRef(activeEditorRef);
  return O.getOrThrowWith(
    editorOption,
    () =>
      new ToolbarContextNotMountedError({
        message: "activeEditor is not set. Ensure ToolbarContext provider is mounted.",
        hook: "useActiveEditor",
      })
  );
}

/**
 * Hook to access only the blockType and setBlockType.
 *
 * Use this for components that only need block type state.
 *
 * @example
 * ```tsx
 * import { useBlockType } from "./toolbar-context";
 *
 * function BlockTypeSelector() {
 *   const [blockType, setBlockType] = useBlockType();
 *   return (
 *     <select value={blockType} onChange={(e) => setBlockType(e.target.value)}>
 *       <option value="paragraph">Paragraph</option>
 *       <option value="heading">Heading</option>
 *     </select>
 *   );
 * }
 * ```
 *
 * @returns A tuple of [blockType, setBlockType]
 *
 * @since 0.1.0
 */
export function useBlockType(): [string, (blockType: string) => void] {
  const blockType = useAtomRef(blockTypeRef);
  const setBlockTypeFn = O.getOrElse(setBlockTypeRef.value, thunkNoOpTyped<string>);

  return [blockType, setBlockTypeFn];
}

/**
 * Hook to access only the $updateToolbar function.
 *
 * Use this for components that need to trigger toolbar updates.
 *
 * @example
 * ```tsx
 * import { useUpdateToolbar } from "./toolbar-context";
 *
 * function FormatAction() {
 *   const $updateToolbar = useUpdateToolbar();
 *   const handleAction = () => {
 *     // Perform action...
 *     $updateToolbar();
 *   };
 *   return <button onClick={handleAction}>Format</button>;
 * }
 * ```
 *
 * @returns The $updateToolbar function
 *
 * @since 0.1.0
 */
export function useUpdateToolbar(): () => void {
  const updateToolbarOption = useAtomRef(updateToolbarRef);
  return O.getOrElse(updateToolbarOption, thunkNoOp);
}

/**
 * Hook to access only the showModal function.
 *
 * Use this for components that need to show modals.
 *
 * @example
 * ```tsx
 * import { useShowModal } from "./toolbar-context";
 *
 * function InsertImageButton() {
 *   const showModal = useShowModal();
 *   const handleClick = () => {
 *     showModal("Insert Image", (onClose) => (
 *       <ImagePicker onSelect={(url) => { insertImage(url); onClose(); }} />
 *     ));
 *   };
 *   return <button onClick={handleClick}>Insert Image</button>;
 * }
 * ```
 *
 * @returns The showModal function
 *
 * @since 0.1.0
 */
export function useShowModal(): ShowModalFn {
  const showModalOption = useAtomRef(showModalRef);
  return O.getOrElse(showModalOption, () => (_: string, __: (onClose: () => void) => JSX.Element) => {});
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified to use Effect utilities and @effect-atom/atom-react.
 */
import { AtomRef } from "@effect-atom/atom-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { $getSelection, type BaseSelection, COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from "lexical";

import { useActiveEditor } from "../context/toolbar-context";

/**
 * Internal state for the update toolbar subscription.
 */
interface UpdateToolbarState {
  readonly callback: O.Option<(selection: BaseSelection) => void>;
  readonly unregister: O.Option<() => void>;
}

/**
 * Registry of per-editor subscription refs.
 * Each editor gets its own AtomRef for managing callback and unregister.
 */
const editorSubscriptions = AtomRef.make<Record<string, AtomRef.AtomRef<UpdateToolbarState>>>({});

/**
 * Gets or creates a subscription ref for a specific editor.
 */
const getOrCreateSubscriptionRef = (editorKey: string): AtomRef.AtomRef<UpdateToolbarState> => {
  const existing = R.get(editorSubscriptions.value, editorKey);

  if (O.isSome(existing)) {
    return existing.value;
  }

  // Create new ref for this editor
  const newRef = AtomRef.make<UpdateToolbarState>({
    callback: O.none<(selection: BaseSelection) => void>(),
    unregister: O.none<() => void>(),
  });

  // Add to registry
  editorSubscriptions.update((current) => ({
    ...current,
    [editorKey]: newRef,
  }));

  return newRef;
};

/**
 * Hook that registers a callback to be called when the editor selection changes.
 *
 * This hook manages the subscription to Lexical's SELECTION_CHANGE_COMMAND and
 * ensures the callback is called with the current selection. It uses AtomRef
 * from @effect-atom/atom-react for state management.
 *
 * Key features:
 * - Uses AtomRef to always call the latest callback version
 * - Per-editor subscriptions via registry
 * - Performs initial read of editor state on registration
 *
 * @example
 * ```tsx
 * import { useUpdateToolbarHandler } from "./use-update-toolbar";
 *
 * function ToolbarPlugin() {
 *   const [isBold, setIsBold] = useState(false);
 *
 *   useUpdateToolbarHandler((selection) => {
 *     // Update toolbar state based on selection
 *     if ($isRangeSelection(selection)) {
 *       setIsBold(selection.hasFormat("bold"));
 *     }
 *   });
 *
 *   return <div>Bold: {isBold ? "Yes" : "No"}</div>;
 * }
 * ```
 *
 * @param callback - Function to call when selection changes
 *
 * @since 1.0.0
 */
export function useUpdateToolbarHandler(callback: (selection: BaseSelection) => void): void {
  // Get the Lexical editor from context
  useLexicalComposerContext();

  // Get the active editor from our atom-based context
  const activeEditor = useActiveEditor();

  // Get the subscription ref for this editor
  const subscriptionRef = getOrCreateSubscriptionRef(activeEditor._key);

  // Update the callback ref to always have the latest callback
  subscriptionRef.update((state) => ({
    ...state,
    callback: O.some(callback),
  }));

  // Check if we need to register the command listener
  if (O.isNone(subscriptionRef.value.unregister)) {
    // Create the selection change handler that reads from the ref
    const handleSelectionChange = (): boolean => {
      const selection = $getSelection();
      if (selection !== null) {
        const cb = subscriptionRef.value.callback;
        if (O.isSome(cb)) {
          cb.value(selection);
        }
      }
      return false;
    };

    // Register the command listener
    const unregister = activeEditor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      handleSelectionChange,
      COMMAND_PRIORITY_CRITICAL
    );

    // Store the unregister function
    subscriptionRef.update((state) => ({
      ...state,
      unregister: O.some(unregister),
    }));

    // Perform initial read of editor state
    activeEditor.getEditorState().read(() => {
      const selection = $getSelection();
      if (selection !== null) {
        const cb = subscriptionRef.value.callback;
        if (O.isSome(cb)) {
          cb.value(selection);
        }
      }
    });
  }
}

/**
 * Minimal editor interface for the useUpdateToolbarHandlerWithEditor hook.
 */
export interface MinimalEditor {
  readonly _key: string;
  readonly registerCommand: <TCommand>(
    command: TCommand,
    listener: (payload: unknown, editor: unknown) => boolean,
    priority: number
  ) => () => void;
  readonly getEditorState: () => { readonly read: (callback: () => void) => void };
}

/**
 * Hook variant that accepts an editor instance directly.
 *
 * Use this when you have direct access to the editor and don't want to rely
 * on the toolbar context. Useful for standalone components.
 *
 * @example
 * ```tsx
 * import { useUpdateToolbarHandlerWithEditor } from "./use-update-toolbar";
 * import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
 *
 * function StandalonePlugin() {
 *   const [editor] = useLexicalComposerContext();
 *   const [format, setFormat] = useState({ bold: false, italic: false });
 *
 *   useUpdateToolbarHandlerWithEditor(editor, (selection) => {
 *     if ($isRangeSelection(selection)) {
 *       setFormat({
 *         bold: selection.hasFormat("bold"),
 *         italic: selection.hasFormat("italic"),
 *       });
 *     }
 *   });
 *
 *   return <div>Bold: {format.bold}, Italic: {format.italic}</div>;
 * }
 * ```
 *
 * @param editor - The LexicalEditor instance to listen to
 * @param callback - Function to call when selection changes
 *
 * @since 1.0.0
 */
export function useUpdateToolbarHandlerWithEditor(
  editor: MinimalEditor,
  callback: (selection: BaseSelection) => void
): void {
  // Get the subscription ref for this editor
  const subscriptionRef = getOrCreateSubscriptionRef(editor._key);

  // Update the callback ref to always have the latest callback
  subscriptionRef.update((state) => ({
    ...state,
    callback: O.some(callback),
  }));

  // Check if we need to register the command listener
  if (O.isNone(subscriptionRef.value.unregister)) {
    // Create the selection change handler
    const handleSelectionChange = (): boolean => {
      const selection = $getSelection();
      if (selection !== null) {
        const cb = subscriptionRef.value.callback;
        if (O.isSome(cb)) {
          cb.value(selection);
        }
      }
      return false;
    };

    // Register the command listener
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      handleSelectionChange,
      COMMAND_PRIORITY_CRITICAL
    );

    // Store the unregister function
    subscriptionRef.update((state) => ({
      ...state,
      unregister: O.some(unregister),
    }));

    // Perform initial read
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (selection !== null) {
        const cb = subscriptionRef.value.callback;
        if (O.isSome(cb)) {
          cb.value(selection);
        }
      }
    });
  }
}

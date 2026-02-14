"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  KEY_ESCAPE_COMMAND,
} from "lexical";
import { Suspense, useEffect } from "react";

import { useAiContext } from "../../context/AiContext";
import { useSettings } from "../../context/SettingsContext";
import { RESTORE_SELECTION_COMMAND, SAVE_SELECTION_COMMAND } from "../PreserveSelectionPlugin";
import {
  CLOSE_AI_PANEL_COMMAND,
  INSERT_AI_TEXT_COMMAND,
  type InsertAiTextPayload,
  OPEN_AI_PANEL_COMMAND,
} from "./commands";
import { CollaborativeFloatingAiPanel } from "./components/CollaborativeFloatingAiPanel";
import { FloatingAiPanel } from "./components/FloatingAiPanel";
import { $insertAiText } from "./utils/insertAiText";

interface AiAssistantPluginProps {
  readonly anchorElem?: HTMLElement;
}

/**
 * Main plugin entry point that registers Lexical commands for AI panel control
 * and renders the FloatingAiPanel component.
 *
 * Commands:
 * - OPEN_AI_PANEL_COMMAND: Saves current selection, extracts selected text, opens panel
 * - CLOSE_AI_PANEL_COMMAND: Closes the AI panel
 */
export function AiAssistantPlugin({ anchorElem }: AiAssistantPluginProps) {
  const [editor] = useLexicalComposerContext();
  const { isAiPanelOpen, setAiPanelOpen, setSelectedText } = useAiContext();
  const {
    settings: { isCollab },
  } = useSettings();

  useEffect(() => {
    // Register OPEN command handler
    const unregisterOpen = editor.registerCommand(
      OPEN_AI_PANEL_COMMAND,
      () => {
        // First preserve the current selection for later restoration
        editor.dispatchCommand(SAVE_SELECTION_COMMAND, null);

        // Read the current selection and extract text content
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const text = selection.getTextContent();
            setSelectedText(text);
          }
        });

        // Open the AI panel
        setAiPanelOpen(true);

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Register CLOSE command handler
    const unregisterClose = editor.registerCommand(
      CLOSE_AI_PANEL_COMMAND,
      () => {
        setAiPanelOpen(false);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Register INSERT command handler
    const unregisterInsert = editor.registerCommand(
      INSERT_AI_TEXT_COMMAND,
      (payload: InsertAiTextPayload) => {
        // First restore the saved selection
        editor.dispatchCommand(RESTORE_SELECTION_COMMAND, null);

        // Then perform the insertion in an update
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $insertAiText(selection, payload.content, payload.mode);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Register ESC to close panel
    const unregisterEsc = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (isAiPanelOpen) {
          setAiPanelOpen(false);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Register Cmd/Ctrl+Shift+I to open AI panel
    const unregisterShortcut = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "i") {
          event.preventDefault();
          editor.dispatchCommand(OPEN_AI_PANEL_COMMAND, null);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      unregisterOpen();
      unregisterClose();
      unregisterInsert();
      unregisterEsc();
      unregisterShortcut();
    };
  }, [editor, isAiPanelOpen, setAiPanelOpen, setSelectedText]);

  // Use collaborative panel in collaboration mode, standard panel otherwise
  // Suspense boundary required for Liveblocks hooks
  if (isCollab) {
    return (
      <Suspense fallback={<FloatingAiPanel anchorElem={anchorElem} />}>
        <CollaborativeFloatingAiPanel anchorElem={anchorElem} />
      </Suspense>
    );
  }

  return <FloatingAiPanel anchorElem={anchorElem} />;
}

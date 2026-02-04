/**
 * Lexical Editor Context Exports
 *
 * This module provides React contexts for managing editor state:
 * - ToolbarContext: Toolbar state and active editor management
 * - FlashMessageContext: Temporary notification messages
 * - SharedHistoryContext: Undo/redo history state
 * - SettingsContext: Editor settings and preferences
 */

// Flash Message Context - Temporary notification display
export { FlashMessageContext, type ShowFlashMessage, useFlashMessageContext } from "./FlashMessageContext";
// Settings Context - Editor preferences and configuration
export { SettingsContext, useSettings } from "./SettingsContext";

// Shared History Context - Undo/redo history management
export { SharedHistoryContext, useSharedHistoryContext } from "./SharedHistoryContext";
// Toolbar Context - Main context for toolbar state and editor commands
export {
  // Types
  type BlockType,
  blockTypeToBlockName,
  DEFAULT_FONT_SIZE,
  MAX_ALLOWED_FONT_SIZE,
  // Constants
  MIN_ALLOWED_FONT_SIZE,
  type RootType,
  type ShowModalFn,
  // Components
  ToolbarContextProvider,
  ToolbarContextWrapper,
  type ToolbarState,
  type ToolbarStateKey,
  type ToolbarStateValue,
  // Hooks
  useToolbarContext,
  useToolbarState,
} from "./toolbar-context";

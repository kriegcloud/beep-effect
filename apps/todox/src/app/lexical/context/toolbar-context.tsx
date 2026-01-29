"use client";

import type { ElementFormatType, LexicalEditor } from "lexical";
import type { JSX, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ============================================================================
// Constants
// ============================================================================

export const MIN_ALLOWED_FONT_SIZE = 8;
export const MAX_ALLOWED_FONT_SIZE = 72;
export const DEFAULT_FONT_SIZE = 15;

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
} as const;

export const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
} as const;

export type BlockType = keyof typeof blockTypeToBlockName;
export type RootType = keyof typeof rootTypeToRootName;

// ============================================================================
// Toolbar State
// ============================================================================

const INITIAL_TOOLBAR_STATE = {
  bgColor: "#fff",
  blockType: "paragraph" as BlockType,
  canRedo: false,
  canUndo: false,
  codeLanguage: "",
  codeTheme: "",
  elementFormat: "left" as ElementFormatType,
  fontColor: "#000",
  fontFamily: "Arial",
  fontSize: `${DEFAULT_FONT_SIZE}px`,
  fontSizeInputValue: `${DEFAULT_FONT_SIZE}`,
  isBold: false,
  isCode: false,
  isHighlight: false,
  isImageCaption: false,
  isItalic: false,
  isLink: false,
  isRTL: false,
  isStrikethrough: false,
  isSubscript: false,
  isSuperscript: false,
  isUnderline: false,
  isLowercase: false,
  isUppercase: false,
  isCapitalize: false,
  rootType: "root" as RootType,
  listStartNumber: null as number | null,
  selectedElementKey: null as string | null,
};

export type ToolbarState = typeof INITIAL_TOOLBAR_STATE;
export type ToolbarStateKey = keyof ToolbarState;
export type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];

// ============================================================================
// Modal Types
// ============================================================================

export type ShowModalFn = (title: string, getContent: (onClose: () => void) => JSX.Element) => void;

// ============================================================================
// Context Shape
// ============================================================================

/**
 * Combined toolbar context that provides:
 * 1. Toolbar state (formatting flags, font settings, etc.)
 * 2. Active editor reference for dispatching commands
 * 3. Modal display capabilities for dialogs
 * 4. Update callbacks for syncing state with editor
 */
interface ToolbarContextShape {
  // Toolbar state management (from original ToolbarContext)
  readonly toolbarState: ToolbarState;
  readonly updateToolbarState: <Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => void;

  // Active editor reference (from shadcn-editor pattern)
  readonly activeEditor: LexicalEditor;
  readonly setActiveEditor: (editor: LexicalEditor) => void;

  // Block type (convenience accessors, also in toolbarState)
  readonly blockType: BlockType;
  readonly setBlockType: (blockType: BlockType) => void;

  // Update toolbar callback (triggered on selection/state changes)
  readonly $updateToolbar: () => void;

  // Modal display function
  readonly showModal: ShowModalFn;
}

// ============================================================================
// Context Creation
// ============================================================================

const ToolbarStateContext = createContext<ToolbarContextShape | undefined>(undefined);

// ============================================================================
// Provider Component Props
// ============================================================================

interface ToolbarContextProviderProps {
  readonly children: ReactNode;
  /**
   * The initial/root editor instance. This should be the main editor
   * from useLexicalComposerContext(). The activeEditor may change
   * when the user focuses nested editors (e.g., image captions).
   */
  readonly editor: LexicalEditor;
  /**
   * Function to show modal dialogs. Should be provided by useEditorModal hook.
   */
  readonly showModal: ShowModalFn;
  /**
   * Optional callback triggered when toolbar needs updating.
   * Use this to perform custom toolbar update logic.
   */
  readonly onUpdateToolbar?: () => void;
}

// ============================================================================
// Provider Component
// ============================================================================

export function ToolbarContextProvider({
  children,
  editor,
  showModal,
  onUpdateToolbar,
}: ToolbarContextProviderProps): JSX.Element {
  const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);
  const [activeEditor, setActiveEditor] = useState<LexicalEditor>(editor);

  const selectionFontSize = toolbarState.fontSize;

  // Update toolbar state for a specific key
  const updateToolbarState = useCallback(<Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => {
    setToolbarState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Convenience setter for block type (also updates toolbarState)
  const setBlockType = useCallback(
    (blockType: BlockType) => {
      updateToolbarState("blockType", blockType);
    },
    [updateToolbarState]
  );

  // Sync font size input value when font size changes
  useEffect(() => {
    updateToolbarState("fontSizeInputValue", selectionFontSize.slice(0, -2));
  }, [selectionFontSize, updateToolbarState]);

  // Toolbar update callback
  const $updateToolbar = useCallback(() => {
    onUpdateToolbar?.();
  }, [onUpdateToolbar]);

  const contextValue = useMemo(
    (): ToolbarContextShape => ({
      toolbarState,
      updateToolbarState,
      activeEditor,
      setActiveEditor,
      blockType: toolbarState.blockType,
      setBlockType,
      $updateToolbar,
      showModal,
    }),
    [toolbarState, updateToolbarState, activeEditor, setBlockType, $updateToolbar, showModal]
  );

  return <ToolbarStateContext.Provider value={contextValue}>{children}</ToolbarStateContext.Provider>;
}

// ============================================================================
// Legacy Provider (Backward Compatibility)
// ============================================================================

/**
 * @deprecated Use ToolbarContextProvider instead for full functionality.
 * This is kept for backward compatibility with existing code.
 */
export function ToolbarContext({ children }: { readonly children: ReactNode }): JSX.Element {
  const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);
  const selectionFontSize = toolbarState.fontSize;

  const updateToolbarState = useCallback(<Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => {
    setToolbarState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  useEffect(() => {
    updateToolbarState("fontSizeInputValue", selectionFontSize.slice(0, -2));
  }, [selectionFontSize, updateToolbarState]);

  // Create a minimal context value for legacy usage
  // This won't have activeEditor, showModal, etc.
  const contextValue = useMemo(
    () => ({
      toolbarState,
      updateToolbarState,
    }),
    [toolbarState, updateToolbarState]
  );

  return <LegacyToolbarContext.Provider value={contextValue}>{children}</LegacyToolbarContext.Provider>;
}

// Legacy context for backward compatibility
interface LegacyContextShape {
  readonly toolbarState: ToolbarState;
  readonly updateToolbarState: <Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => void;
}

const LegacyToolbarContext = createContext<LegacyContextShape | undefined>(undefined);

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the full toolbar context including active editor and modal capabilities.
 * Use this in new shadcn-style toolbar components.
 *
 * @throws Error if used outside of ToolbarContextProvider
 */
export function useToolbarContext(): ToolbarContextShape {
  const context = useContext(ToolbarStateContext);

  if (context === undefined) {
    throw new Error("useToolbarContext must be used within a ToolbarContextProvider");
  }

  return context;
}

/**
 * Access just the toolbar state (formatting flags, font settings, etc.)
 * Compatible with both old and new context providers.
 *
 * @throws Error if used outside of ToolbarContext or ToolbarContextProvider
 */
export function useToolbarState(): LegacyContextShape {
  // Try new context first
  const newContext = useContext(ToolbarStateContext);
  if (newContext !== undefined) {
    return {
      toolbarState: newContext.toolbarState,
      updateToolbarState: newContext.updateToolbarState,
    };
  }

  // Fall back to legacy context
  const legacyContext = useContext(LegacyToolbarContext);
  if (legacyContext !== undefined) {
    return legacyContext;
  }

  throw new Error("useToolbarState must be used within a ToolbarProvider");
}

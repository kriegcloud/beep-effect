import type { ElementFormatType } from "lexical";
import type { JSX } from "react";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

export const MIN_ALLOWED_FONT_SIZE = 8;
export const MAX_ALLOWED_FONT_SIZE = 72;

interface IRootTypeToRootName {
  root: "Root";
  table: "Table";
}

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
};

//disable eslint sorting rule for quick reference to toolbar state
const INITIAL_TOOLBAR_STATE = {
  bgColor: "#fff",
  blockType: "paragraph" as keyof typeof blockTypeToBlockName,
  canRedo: false,
  canUndo: false,
  codeLanguage: "",
  elementFormat: "left" as ElementFormatType,
  isBold: false,
  isCode: false,
  isHighlight: false,
  isImageCaption: false,
  isItalic: false,
  isLink: false,
  isRTL: false,
  isStrikethrough: false,
  isUnderline: false,
  isRightAlign: false,
  isLeftAlign: false,
  isCenterAlign: false,
  rootType: "root" as keyof IRootTypeToRootName,
};

export type ToolbarState = typeof INITIAL_TOOLBAR_STATE;

// Utility type to get keys and infer value types
type ToolbarStateKey = keyof ToolbarState;
type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];

interface IContextShape {
  readonly toolbarState: ToolbarState;
  updateToolbarState<Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>): void;
}

const Context = createContext<IContextShape | undefined>(undefined);

export const ToolbarContext = ({ children }: { children: ReactNode }): JSX.Element => {
  const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);

  const updateToolbarState = useCallback(<Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => {
    setToolbarState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const contextValue = useMemo(() => {
    return {
      toolbarState,
      updateToolbarState,
    };
  }, [toolbarState, updateToolbarState]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useToolbarState = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useToolbarState must be used within a ToolbarProvider");
  }

  return context;
};

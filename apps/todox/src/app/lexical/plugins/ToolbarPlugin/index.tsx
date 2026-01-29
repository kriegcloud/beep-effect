"use client";

import { cn } from "@beep/todox/lib/utils";
import { Button } from "@beep/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import {
  $isCodeNode,
  getCodeLanguageOptions as getCodeLanguageOptionsPrism,
  normalizeCodeLanguage as normalizeCodeLanguagePrism,
} from "@lexical/code";
import {
  getCodeLanguageOptions as getCodeLanguageOptionsShiki,
  getCodeThemeOptions as getCodeThemeOptionsShiki,
  normalizeCodeLanguage as normalizeCodeLanguageShiki,
} from "@lexical/code-shiki";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/extension";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getSelectionStyleValueForProperty, $isParentElementRTL, $patchStyleText } from "@lexical/selection";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import { $findMatchingParent, $getNearestNodeOfType, $isEditorIsNestedEditor, mergeRegister } from "@lexical/utils";
import {
  CalendarIcon,
  CaretDownIcon,
  CaretRightIcon,
  ChartBarIcon,
  CodeIcon,
  ColumnsIcon,
  ImageIcon,
  LinkIcon,
  ListBulletsIcon,
  ListChecksIcon,
  ListNumbersIcon,
  MathOperationsIcon,
  MinusIcon,
  NoteIcon,
  PencilIcon,
  PlusIcon,
  QuotesIcon,
  SplitHorizontalIcon,
  TableIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextHFiveIcon,
  TextHFourIcon,
  TextHOneIcon,
  TextHSixIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextIndentIcon,
  TextOutdentIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import {
  $addUpdateTag,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type CommandPayloadType,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  HISTORIC_TAG,
  INDENT_CONTENT_COMMAND,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  OUTDENT_CONTENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  SKIP_DOM_SELECTION_TAG,
  SKIP_SELECTION_FOCUS_TAG,
} from "lexical";
import type { JSX } from "react";
import { type Dispatch, useCallback, useEffect, useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import { blockTypeToBlockName, useToolbarState } from "../../context/toolbar-context";
import useModal from "../../hooks/useModal";
import { $createStickyNode } from "../../nodes/StickyNode";

import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { AiToolbarButton } from "../AiAssistantPlugin/components/AiToolbarButton";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { INSERT_DATETIME_COMMAND } from "../DateTimePlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { InsertImageDialog } from "../ImagesPlugin";
import InsertLayoutDialog from "../LayoutPlugin/InsertLayoutDialog";
import { INSERT_PAGE_BREAK } from "../PageBreakPlugin";
import { InsertPollDialog } from "../PollPlugin";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { InsertTableDialog } from "../TablePlugin";
import {
  AdvancedTextFormattingMenu,
  ColorPickerGroup,
  FontControls,
  TextFormatButtonGroup,
  UndoRedoControls,
} from "./components";
import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from "./utils";

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

// Map block types to Phosphor icons
const blockTypeToIcon: Record<string, JSX.Element> = {
  paragraph: <TextTIcon className="size-4" />,
  h1: <TextHOneIcon className="size-4" />,
  h2: <TextHTwoIcon className="size-4" />,
  h3: <TextHThreeIcon className="size-4" />,
  h4: <TextHFourIcon className="size-4" />,
  h5: <TextHFiveIcon className="size-4" />,
  h6: <TextHSixIcon className="size-4" />,
  number: <ListNumbersIcon className="size-4" />,
  bullet: <ListBulletsIcon className="size-4" />,
  check: <ListChecksIcon className="size-4" />,
  quote: <QuotesIcon className="size-4" />,
  code: <CodeIcon className="size-4" />,
};

const CODE_LANGUAGE_OPTIONS_PRISM: [string, string][] = getCodeLanguageOptionsPrism().filter((option) =>
  [
    "c",
    "clike",
    "cpp",
    "css",
    "html",
    "java",
    "js",
    "javascript",
    "markdown",
    "objc",
    "objective-c",
    "plain",
    "powershell",
    "py",
    "python",
    "rust",
    "sql",
    "swift",
    "typescript",
    "xml",
  ].includes(option[0])
);

const CODE_LANGUAGE_OPTIONS_SHIKI: [string, string][] = getCodeLanguageOptionsShiki().filter((option) =>
  [
    "c",
    "clike",
    "cpp",
    "css",
    "html",
    "java",
    "js",
    "javascript",
    "markdown",
    "objc",
    "objective-c",
    "plain",
    "powershell",
    "py",
    "python",
    "rust",
    "sql",
    "typescript",
    "xml",
  ].includes(option[0])
);

const CODE_THEME_OPTIONS_SHIKI: [string, string][] = getCodeThemeOptionsShiki().filter((option) =>
  [
    "catppuccin-latte",
    "everforest-light",
    "github-light",
    "gruvbox-light-medium",
    "kanagawa-lotus",
    "dark-plus",
    "light-plus",
    "material-theme-lighter",
    "min-light",
    "one-light",
    "rose-pine-dawn",
    "slack-ochin",
    "snazzy-light",
    "solarized-light",
    "vitesse-light",
  ].includes(option[0])
);

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    icon: JSX.Element;
    iconRTL: JSX.Element;
    name: string;
  };
} = {
  center: {
    icon: <TextAlignCenterIcon className="size-4" />,
    iconRTL: <TextAlignCenterIcon className="size-4" />,
    name: "Center Align",
  },
  end: {
    icon: <TextAlignRightIcon className="size-4" />,
    iconRTL: <TextAlignLeftIcon className="size-4" />,
    name: "End Align",
  },
  justify: {
    icon: <TextAlignJustifyIcon className="size-4" />,
    iconRTL: <TextAlignJustifyIcon className="size-4" />,
    name: "Justify Align",
  },
  left: {
    icon: <TextAlignLeftIcon className="size-4" />,
    iconRTL: <TextAlignLeftIcon className="size-4" />,
    name: "Left Align",
  },
  right: {
    icon: <TextAlignRightIcon className="size-4" />,
    iconRTL: <TextAlignRightIcon className="size-4" />,
    name: "Right Align",
  },
  start: {
    icon: <TextAlignLeftIcon className="size-4" />,
    iconRTL: <TextAlignRightIcon className="size-4" />,
    name: "Start Align",
  },
};

function dropDownActiveClass(active: boolean) {
  if (active) {
    return "active dropdown-item-active";
  }
  return "";
}

function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label="Formatting options for text style"
          className={cn("gap-1", "toolbar-item block-controls")}
        >
          {blockTypeToIcon[blockType] || <TextTIcon className="size-4" />}
          <span className="text dropdown-button-text">{blockTypeToBlockName[blockType]}</span>
          <CaretDownIcon className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="min-w-40">
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "paragraph")}`)}
          onClick={() => formatParagraph(editor)}
        >
          <div className="icon-text-container">
            <TextTIcon className="size-4" />
            <span className="text">Normal</span>
          </div>
          <span className="shortcut">{SHORTCUTS.NORMAL}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "h1")}`)}
          onClick={() => formatHeading(editor, blockType, "h1")}
        >
          <div className="icon-text-container">
            <TextHOneIcon className="size-4" />
            <span className="text">Heading 1</span>
          </div>
          <span className="shortcut">{SHORTCUTS.HEADING1}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "h2")}`)}
          onClick={() => formatHeading(editor, blockType, "h2")}
        >
          <div className="icon-text-container">
            <TextHTwoIcon className="size-4" />
            <span className="text">Heading 2</span>
          </div>
          <span className="shortcut">{SHORTCUTS.HEADING2}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "h3")}`)}
          onClick={() => formatHeading(editor, blockType, "h3")}
        >
          <div className="icon-text-container">
            <TextHThreeIcon className="size-4" />
            <span className="text">Heading 3</span>
          </div>
          <span className="shortcut">{SHORTCUTS.HEADING3}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "number")}`)}
          onClick={() => formatNumberedList(editor, blockType)}
        >
          <div className="icon-text-container">
            <ListNumbersIcon className="size-4" />
            <span className="text">Numbered List</span>
          </div>
          <span className="shortcut">{SHORTCUTS.NUMBERED_LIST}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "bullet")}`)}
          onClick={() => formatBulletList(editor, blockType)}
        >
          <div className="icon-text-container">
            <ListBulletsIcon className="size-4" />
            <span className="text">Bullet List</span>
          </div>
          <span className="shortcut">{SHORTCUTS.BULLET_LIST}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "check")}`)}
          onClick={() => formatCheckList(editor, blockType)}
        >
          <div className="icon-text-container">
            <ListChecksIcon className="size-4" />
            <span className="text">Check List</span>
          </div>
          <span className="shortcut">{SHORTCUTS.CHECK_LIST}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "quote")}`)}
          onClick={() => formatQuote(editor, blockType)}
        >
          <div className="icon-text-container">
            <QuotesIcon className="size-4" />
            <span className="text">Quote</span>
          </div>
          <span className="shortcut">{SHORTCUTS.QUOTE}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", `item wide ${dropDownActiveClass(blockType === "code")}`)}
          onClick={() => formatCode(editor, blockType)}
        >
          <div className="icon-text-container">
            <CodeIcon className="size-4" />
            <span className="text">Code Block</span>
          </div>
          <span className="shortcut">{SHORTCUTS.CODE_BLOCK}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label="Formatting options for text alignment"
          className={cn("gap-1", "toolbar-item spaced alignment")}
        >
          {isRTL ? formatOption.iconRTL : formatOption.icon}
          <span className="text dropdown-button-text">{formatOption.name}</span>
          <CaretDownIcon className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="min-w-40">
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          <div className="icon-text-container">
            <TextAlignLeftIcon className="size-4" />
            <span className="text">Left Align</span>
          </div>
          <span className="shortcut">{SHORTCUTS.LEFT_ALIGN}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          <div className="icon-text-container">
            <TextAlignCenterIcon className="size-4" />
            <span className="text">Center Align</span>
          </div>
          <span className="shortcut">{SHORTCUTS.CENTER_ALIGN}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          <div className="icon-text-container">
            <TextAlignRightIcon className="size-4" />
            <span className="text">Right Align</span>
          </div>
          <span className="shortcut">{SHORTCUTS.RIGHT_ALIGN}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          <div className="icon-text-container">
            <TextAlignJustifyIcon className="size-4" />
            <span className="text">Justify Align</span>
          </div>
          <span className="shortcut">{SHORTCUTS.JUSTIFY_ALIGN}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          {isRTL ? ELEMENT_FORMAT_OPTIONS.start.iconRTL : ELEMENT_FORMAT_OPTIONS.start.icon}
          <span className="text">Start Align</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          {isRTL ? ELEMENT_FORMAT_OPTIONS.end.iconRTL : ELEMENT_FORMAT_OPTIONS.end.icon}
          <span className="text">End Align</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          <div className="icon-text-container">
            {isRTL ? <TextIndentIcon className="size-4" /> : <TextOutdentIcon className="size-4" />}
            <span className="text">Outdent</span>
          </div>
          <span className="shortcut">{SHORTCUTS.OUTDENT}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
          }}
          className={cn("cursor-pointer", "item wide")}
        >
          <div className="icon-text-container">
            {isRTL ? <TextOutdentIcon className="size-4" /> : <TextIndentIcon className="size-4" />}
            <span className="text">Indent</span>
          </div>
          <span className="shortcut">{SHORTCUTS.INDENT}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function $findTopLevelElement(node: LexicalNode) {
  let topLevelElement =
    node.getKey() === "root"
      ? node
      : $findMatchingParent(node, (e) => {
          const parent = e.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        });

  if (topLevelElement === null) {
    topLevelElement = node.getTopLevelElementOrThrow();
  }
  return topLevelElement;
}

export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  const dispatchToolbarCommand = <T extends LexicalCommand<unknown>>(
    command: T,
    payload: CommandPayloadType<T> | undefined = undefined,
    skipRefocus = false
  ) => {
    activeEditor.update(() => {
      if (skipRefocus) {
        $addUpdateTag(SKIP_DOM_SELECTION_TAG);
      }

      // Re-assert on Type so that payload can have a default param
      activeEditor.dispatchCommand(command, payload as CommandPayloadType<T>);
    });
  };

  const $handleHeadingNode = useCallback(
    (selectedElement: LexicalNode) => {
      const type = $isHeadingNode(selectedElement) ? selectedElement.getTag() : selectedElement.getType();

      if (type in blockTypeToBlockName) {
        updateToolbarState("blockType", type as keyof typeof blockTypeToBlockName);
      }
    },
    [updateToolbarState]
  );

  const {
    settings: { isCodeHighlighted, isCodeShiki },
  } = useSettings();

  const $handleCodeNode = useCallback(
    (element: LexicalNode) => {
      if ($isCodeNode(element)) {
        const language = element.getLanguage();
        updateToolbarState(
          "codeLanguage",
          language
            ? (isCodeHighlighted &&
                (isCodeShiki ? normalizeCodeLanguageShiki(language) : normalizeCodeLanguagePrism(language))) ||
                language
            : ""
        );
        const theme = element.getTheme();
        updateToolbarState("codeTheme", theme || "");
        return;
      }
    },
    [updateToolbarState, isCodeHighlighted, isCodeShiki]
  );

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        updateToolbarState(
          "isImageCaption",
          !!rootElement?.parentElement?.classList.contains("image-caption-container")
        );
      } else {
        updateToolbarState("isImageCaption", false);
      }

      const anchorNode = selection.anchor.getNode();
      const element = $findTopLevelElement(anchorNode);
      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      updateToolbarState("isRTL", $isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState("isLink", isLink);

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        updateToolbarState("rootType", "table");
      } else {
        updateToolbarState("rootType", "root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();

          updateToolbarState("blockType", type);
        } else {
          $handleHeadingNode(element);
          $handleCodeNode(element);
        }
      }

      // Handle buttons
      updateToolbarState("fontColor", $getSelectionStyleValueForProperty(selection, "color", "#000"));
      updateToolbarState("bgColor", $getSelectionStyleValueForProperty(selection, "background-color", "#fff"));
      updateToolbarState("fontFamily", $getSelectionStyleValueForProperty(selection, "font-family", "Arial"));
      let matchingParent: LexicalNode | null = null;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      // If matchingParent is a valid node, pass it's format type
      updateToolbarState(
        "elementFormat",
        $isElementNode(matchingParent)
          ? matchingParent?.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left"
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      // Update text format
      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
      updateToolbarState("isUnderline", selection.hasFormat("underline"));
      updateToolbarState("isStrikethrough", selection.hasFormat("strikethrough"));
      updateToolbarState("isSubscript", selection.hasFormat("subscript"));
      updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
      updateToolbarState("isHighlight", selection.hasFormat("highlight"));
      updateToolbarState("isCode", selection.hasFormat("code"));
      updateToolbarState("fontSize", $getSelectionStyleValueForProperty(selection, "font-size", "15px"));
      updateToolbarState("isLowercase", selection.hasFormat("lowercase"));
      updateToolbarState("isUppercase", selection.hasFormat("uppercase"));
      updateToolbarState("isCapitalize", selection.hasFormat("capitalize"));
    }
    if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes();
      for (const selectedNode of nodes) {
        const parentList = $getNearestNodeOfType<ListNode>(selectedNode, ListNode);
        if (parentList) {
          const type = parentList.getListType();
          updateToolbarState("blockType", type);
        } else {
          const selectedElement = $findTopLevelElement(selectedNode);
          $handleHeadingNode(selectedElement);
          $handleCodeNode(selectedElement);
          // Update elementFormat for node selection (e.g., images)
          if ($isElementNode(selectedElement)) {
            updateToolbarState("elementFormat", selectedElement.getFormatType());
          }
        }
      }
    }
  }, [activeEditor, editor, updateToolbarState, $handleHeadingNode, $handleCodeNode]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(
      () => {
        $updateToolbar();
      },
      { editor: activeEditor }
    );
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            $updateToolbar();
          },
          { editor: activeEditor }
        );
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState("canUndo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState("canRedo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean, skipRefocus = false) => {
      activeEditor.update(
        () => {
          if (skipRefocus) {
            $addUpdateTag(SKIP_DOM_SELECTION_TAG);
          }
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: HISTORIC_TAG } : {}
      );
    },
    [activeEditor]
  );

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );
  const onCodeThemeSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setTheme(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );
  const canViewerSeeInsertDropdown = !toolbarState.isImageCaption;
  const canViewerSeeInsertCodeButton = !toolbarState.isImageCaption;

  return (
    <div className="toolbar">
      <UndoRedoControls editor={activeEditor} canUndo={toolbarState.canUndo} canRedo={toolbarState.canRedo} />
      <Divider />
      {toolbarState.blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={toolbarState.blockType}
            rootType={toolbarState.rootType}
            editor={activeEditor}
          />
          <Divider />
        </>
      )}
      {toolbarState.blockType === "code" && isCodeHighlighted ? (
        <>
          {!isCodeShiki && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!isEditable}
                  aria-label="Select language"
                  className={cn("gap-1", "toolbar-item code-language")}
                >
                  <span className="text dropdown-button-text">
                    {
                      (CODE_LANGUAGE_OPTIONS_PRISM.find(
                        (opt) => opt[0] === normalizeCodeLanguagePrism(toolbarState.codeLanguage)
                      ) || ["", ""])[1]
                    }
                  </span>
                  <CaretDownIcon className="size-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="min-w-40">
                {CODE_LANGUAGE_OPTIONS_PRISM.map(([value, name]) => {
                  return (
                    <DropdownMenuItem
                      className={cn(
                        "cursor-pointer",
                        `item ${dropDownActiveClass(value === toolbarState.codeLanguage)}`
                      )}
                      onClick={() => onCodeLanguageSelect(value)}
                      key={value}
                    >
                      <span className="text">{name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isCodeShiki && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isEditable}
                    aria-label="Select language"
                    className={cn("gap-1", "toolbar-item code-language")}
                  >
                    <span className="text dropdown-button-text">
                      {
                        (CODE_LANGUAGE_OPTIONS_SHIKI.find(
                          (opt) => opt[0] === normalizeCodeLanguageShiki(toolbarState.codeLanguage)
                        ) || ["", ""])[1]
                      }
                    </span>
                    <CaretDownIcon className="size-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="min-w-40">
                  {CODE_LANGUAGE_OPTIONS_SHIKI.map(([value, name]) => {
                    return (
                      <DropdownMenuItem
                        className={cn(
                          "cursor-pointer",
                          `item ${dropDownActiveClass(value === toolbarState.codeLanguage)}`
                        )}
                        onClick={() => onCodeLanguageSelect(value)}
                        key={value}
                      >
                        <span className="text">{name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isEditable}
                    aria-label="Select theme"
                    className={cn("gap-1", "toolbar-item code-language")}
                  >
                    <span className="text dropdown-button-text">
                      {(CODE_THEME_OPTIONS_SHIKI.find((opt) => opt[0] === toolbarState.codeTheme) || ["", ""])[1]}
                    </span>
                    <CaretDownIcon className="size-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="min-w-40">
                  {CODE_THEME_OPTIONS_SHIKI.map(([value, name]) => {
                    return (
                      <DropdownMenuItem
                        className={cn(
                          "cursor-pointer",
                          `item ${dropDownActiveClass(value === toolbarState.codeTheme)}`
                        )}
                        onClick={() => onCodeThemeSelect(value)}
                        key={value}
                      >
                        <span className="text">{name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </>
      ) : (
        <>
          <FontControls editor={activeEditor} disabled={!isEditable} />
          <Divider />
          <TextFormatButtonGroup editor={activeEditor} showCodeButton={canViewerSeeInsertCodeButton} />
          <button
            disabled={!isEditable}
            onClick={insertLink}
            className={`toolbar-item spaced ${toolbarState.isLink ? "active" : ""}`}
            aria-label="Insert link"
            title={`Insert link (${SHORTCUTS.INSERT_LINK})`}
            type="button"
          >
            <LinkIcon className="size-4" />
          </button>
          <ColorPickerGroup applyStyleText={applyStyleText} disabled={!isEditable} />
          <AdvancedTextFormattingMenu editor={activeEditor} disabled={!isEditable} />
          {canViewerSeeInsertDropdown && (
            <>
              <Divider />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isEditable}
                    aria-label="Insert specialized editor node"
                    className={cn("gap-1", "toolbar-item spaced")}
                  >
                    <PlusIcon className="size-4" />
                    <span className="text dropdown-button-text">Insert</span>
                    <CaretDownIcon className="size-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="min-w-40">
                  <DropdownMenuItem
                    onClick={() => dispatchToolbarCommand(INSERT_HORIZONTAL_RULE_COMMAND)}
                    className={cn("cursor-pointer", "item")}
                  >
                    <MinusIcon className="size-4" />
                    <span className="text">Horizontal Rule</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => dispatchToolbarCommand(INSERT_PAGE_BREAK)}
                    className={cn("cursor-pointer", "item")}
                  >
                    <SplitHorizontalIcon className="size-4" />
                    <span className="text">Page Break</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      showModal("Insert Image", (onClose) => (
                        <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
                      ));
                    }}
                    className={cn("cursor-pointer", "item")}
                  >
                    <ImageIcon className="size-4" />
                    <span className="text">Image</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => dispatchToolbarCommand(INSERT_EXCALIDRAW_COMMAND)}
                    className={cn("cursor-pointer", "item")}
                  >
                    <PencilIcon className="size-4" />
                    <span className="text">Excalidraw</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      showModal("Insert Table", (onClose) => (
                        <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
                      ));
                    }}
                    className={cn("cursor-pointer", "item")}
                  >
                    <TableIcon className="size-4" />
                    <span className="text">Table</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      showModal("Insert Poll", (onClose) => (
                        <InsertPollDialog activeEditor={activeEditor} onClose={onClose} />
                      ));
                    }}
                    className={cn("cursor-pointer", "item")}
                  >
                    <ChartBarIcon className="size-4" />
                    <span className="text">Poll</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      showModal("Insert Columns Layout", (onClose) => (
                        <InsertLayoutDialog activeEditor={activeEditor} onClose={onClose} />
                      ));
                    }}
                    className={cn("cursor-pointer", "item")}
                  >
                    <ColumnsIcon className="size-4" />
                    <span className="text">Columns Layout</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      showModal("Insert Equation", (onClose) => (
                        <InsertEquationDialog activeEditor={activeEditor} onClose={onClose} />
                      ));
                    }}
                    className={cn("cursor-pointer", "item")}
                  >
                    <MathOperationsIcon className="size-4" />
                    <span className="text">Equation</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      editor.update(() => {
                        $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
                        const root = $getRoot();
                        const stickyNode = $createStickyNode(0, 0);
                        root.append(stickyNode);
                      });
                    }}
                    className={cn("cursor-pointer", "item")}
                  >
                    <NoteIcon className="size-4" />
                    <span className="text">Sticky Note</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => dispatchToolbarCommand(INSERT_COLLAPSIBLE_COMMAND)}
                    className={cn("cursor-pointer", "item")}
                  >
                    <CaretRightIcon className="size-4" />
                    <span className="text">Collapsible container</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const dateTime = new Date();
                      dateTime.setHours(0, 0, 0, 0);
                      dispatchToolbarCommand(INSERT_DATETIME_COMMAND, { dateTime });
                    }}
                    className={cn("cursor-pointer", "item")}
                  >
                    <CalendarIcon className="size-4" />
                    <span className="text">Date</span>
                  </DropdownMenuItem>
                  {EmbedConfigs.map((embedConfig) => (
                    <DropdownMenuItem
                      key={embedConfig.type}
                      onClick={() => dispatchToolbarCommand(INSERT_EMBED_COMMAND, embedConfig.type)}
                      className={cn("cursor-pointer", "item")}
                    >
                      {embedConfig.icon}
                      <span className="text">{embedConfig.contentName}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </>
      )}
      <Divider />
      <ElementFormatDropdown
        disabled={!isEditable}
        value={toolbarState.elementFormat}
        editor={activeEditor}
        isRTL={toolbarState.isRTL}
      />
      <Divider />
      <AiToolbarButton disabled={!isEditable} />

      {modal}
    </div>
  );
}

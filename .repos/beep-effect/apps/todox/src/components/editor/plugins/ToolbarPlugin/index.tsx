"use client";

import { Button } from "@beep/todox/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@beep/todox/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { cn } from "@beep/todox/lib/utils";
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
import { $isHeadingNode } from "@lexical/rich-text";
import { $getSelectionStyleValueForProperty, $isParentElementRTL, $patchStyleText } from "@lexical/selection";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import { $findMatchingParent, $getNearestNodeOfType, $isEditorIsNestedEditor, mergeRegister } from "@lexical/utils";
import {
  CaretDownIcon,
  CodeIcon,
  ImageIcon,
  LinkIcon,
  ListBulletsIcon,
  ListChecksIcon,
  ListNumbersIcon,
  MinusIcon,
  PlusIcon,
  QuotesIcon,
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
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  $addUpdateTag,
  $getNodeByKey,
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
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { AiToolbarButton } from "../AiAssistantPlugin/components/AiToolbarButton";
import { InsertImageDialog } from "../ImagesPlugin";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
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

const ALLOWED_LANGUAGES = [
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
];

const CODE_LANGUAGE_OPTIONS_PRISM: [string, string][] = A.filter(getCodeLanguageOptionsPrism(), (option) =>
  ALLOWED_LANGUAGES.includes(option[0])
);

const CODE_LANGUAGE_OPTIONS_SHIKI: [string, string][] = A.filter(getCodeLanguageOptionsShiki(), (option) =>
  ALLOWED_LANGUAGES.includes(option[0])
);

const ALLOWED_THEMES = [
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
];

const CODE_THEME_OPTIONS_SHIKI: [string, string][] = A.filter(getCodeThemeOptionsShiki(), (option) =>
  ALLOWED_THEMES.includes(option[0])
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
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <DropdownMenuTrigger
              {...props}
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label={`Block type: ${blockTypeToBlockName[blockType]}`}
                  className="gap-0.5 px-1.5 toolbar-item block-controls"
                >
                  {blockTypeToIcon[blockType] || <TextTIcon className="size-4" />}
                  <CaretDownIcon className="size-3 opacity-50" />
                </Button>
              }
            />
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          {blockTypeToBlockName[blockType]}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" sideOffset={4} className="w-56">
        <DropdownMenuItem
          className={cn(blockType === "paragraph" && "bg-accent")}
          onClick={() => formatParagraph(editor)}
        >
          <TextTIcon />
          Normal
          <DropdownMenuShortcut>{SHORTCUTS.NORMAL}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(blockType === "h1" && "bg-accent")}
          onClick={() => formatHeading(editor, blockType, "h1")}
        >
          <TextHOneIcon />
          Heading 1<DropdownMenuShortcut>{SHORTCUTS.HEADING1}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(blockType === "h2" && "bg-accent")}
          onClick={() => formatHeading(editor, blockType, "h2")}
        >
          <TextHTwoIcon />
          Heading 2<DropdownMenuShortcut>{SHORTCUTS.HEADING2}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(blockType === "h3" && "bg-accent")}
          onClick={() => formatHeading(editor, blockType, "h3")}
        >
          <TextHThreeIcon />
          Heading 3<DropdownMenuShortcut>{SHORTCUTS.HEADING3}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(blockType === "number" && "bg-accent")}
          onClick={() => formatNumberedList(editor, blockType)}
        >
          <ListNumbersIcon />
          Numbered List
          <DropdownMenuShortcut>{SHORTCUTS.NUMBERED_LIST}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(blockType === "bullet" && "bg-accent")}
          onClick={() => formatBulletList(editor, blockType)}
        >
          <ListBulletsIcon />
          Bullet List
          <DropdownMenuShortcut>{SHORTCUTS.BULLET_LIST}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(blockType === "check" && "bg-accent")}
          onClick={() => formatCheckList(editor, blockType)}
        >
          <ListChecksIcon />
          Check List
          <DropdownMenuShortcut>{SHORTCUTS.CHECK_LIST}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(blockType === "quote" && "bg-accent")}
          onClick={() => formatQuote(editor, blockType)}
        >
          <QuotesIcon />
          Quote
          <DropdownMenuShortcut>{SHORTCUTS.QUOTE}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function Spacer(): JSX.Element {
  return <div className="spacer" />;
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
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <DropdownMenuTrigger
              {...props}
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label={`Alignment: ${formatOption.name}`}
                  className="gap-0.5 px-1.5 toolbar-item spaced alignment"
                >
                  {isRTL ? formatOption.iconRTL : formatOption.icon}
                  <CaretDownIcon className="size-3 opacity-50" />
                </Button>
              }
            />
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          {formatOption.name}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" sideOffset={4} className="w-56">
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
        >
          <TextAlignLeftIcon />
          Left Align
          <DropdownMenuShortcut>{SHORTCUTS.LEFT_ALIGN}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
        >
          <TextAlignCenterIcon />
          Center Align
          <DropdownMenuShortcut>{SHORTCUTS.CENTER_ALIGN}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
        >
          <TextAlignRightIcon />
          Right Align
          <DropdownMenuShortcut>{SHORTCUTS.RIGHT_ALIGN}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
          }}
        >
          <TextAlignJustifyIcon />
          Justify Align
          <DropdownMenuShortcut>{SHORTCUTS.JUSTIFY_ALIGN}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
          }}
        >
          {isRTL ? ELEMENT_FORMAT_OPTIONS.start.iconRTL : ELEMENT_FORMAT_OPTIONS.start.icon}
          Start Align
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
          }}
        >
          {isRTL ? ELEMENT_FORMAT_OPTIONS.end.iconRTL : ELEMENT_FORMAT_OPTIONS.end.icon}
          End Align
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
          }}
        >
          {isRTL ? <TextIndentIcon /> : <TextOutdentIcon />}
          Outdent
          <DropdownMenuShortcut>{SHORTCUTS.OUTDENT}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
          }}
        >
          {isRTL ? <TextOutdentIcon /> : <TextIndentIcon />}
          Indent
          <DropdownMenuShortcut>{SHORTCUTS.INDENT}</DropdownMenuShortcut>
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
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isEditable}
                    aria-label="Select language"
                    className="gap-1 px-2 toolbar-item code-language"
                  >
                    <CodeIcon className="size-4" />
                    <span className="text-xs">
                      {
                        O.getOrElse(
                          A.findFirst(
                            CODE_LANGUAGE_OPTIONS_PRISM,
                            (opt) => opt[0] === normalizeCodeLanguagePrism(toolbarState.codeLanguage)
                          ),
                          () => ["", ""] as [string, string]
                        )[1]
                      }
                    </span>
                    <CaretDownIcon className="size-3 opacity-50" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" sideOffset={4} className="w-48 max-h-80 overflow-y-auto">
                {A.map(CODE_LANGUAGE_OPTIONS_PRISM, ([value, name]) => (
                  <DropdownMenuItem
                    className={cn(value === toolbarState.codeLanguage && "bg-accent")}
                    onClick={() => onCodeLanguageSelect(value)}
                    key={value}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isCodeShiki && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!isEditable}
                      aria-label="Select language"
                      className="gap-1 px-2 toolbar-item code-language"
                    >
                      <CodeIcon className="size-4" />
                      <span className="text-xs">
                        {
                          O.getOrElse(
                            A.findFirst(
                              CODE_LANGUAGE_OPTIONS_SHIKI,
                              (opt) => opt[0] === normalizeCodeLanguageShiki(toolbarState.codeLanguage)
                            ),
                            () => ["", ""] as [string, string]
                          )[1]
                        }
                      </span>
                      <CaretDownIcon className="size-3 opacity-50" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" sideOffset={4} className="w-48 max-h-80 overflow-y-auto">
                  {A.map(CODE_LANGUAGE_OPTIONS_SHIKI, ([value, name]) => (
                    <DropdownMenuItem
                      className={cn(value === toolbarState.codeLanguage && "bg-accent")}
                      onClick={() => onCodeLanguageSelect(value)}
                      key={value}
                    >
                      {name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!isEditable}
                      aria-label="Select theme"
                      className="gap-1 px-2 toolbar-item code-language"
                    >
                      <span className="text-xs">
                        {
                          O.getOrElse(
                            A.findFirst(CODE_THEME_OPTIONS_SHIKI, (opt) => opt[0] === toolbarState.codeTheme),
                            () => ["", ""] as [string, string]
                          )[1]
                        }
                      </span>
                      <CaretDownIcon className="size-3 opacity-50" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" sideOffset={4} className="w-48 max-h-80 overflow-y-auto">
                  {A.map(CODE_THEME_OPTIONS_SHIKI, ([value, name]) => (
                    <DropdownMenuItem
                      className={cn(value === toolbarState.codeTheme && "bg-accent")}
                      onClick={() => onCodeThemeSelect(value)}
                      key={value}
                    >
                      {name}
                    </DropdownMenuItem>
                  ))}
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
          <Tooltip>
            <TooltipTrigger
              render={(props) => (
                <button
                  {...props}
                  disabled={!isEditable}
                  onClick={insertLink}
                  className={`toolbar-item spaced ${toolbarState.isLink ? "active" : ""}`}
                  aria-label="Insert link"
                  type="button"
                >
                  <LinkIcon className="size-4" />
                </button>
              )}
            />
            <TooltipContent side="bottom" sideOffset={4}>
              Insert link ({SHORTCUTS.INSERT_LINK})
            </TooltipContent>
          </Tooltip>
          <ColorPickerGroup applyStyleText={applyStyleText} disabled={!isEditable} />
          <AdvancedTextFormattingMenu editor={activeEditor} disabled={!isEditable} />
          {canViewerSeeInsertDropdown && (
            <>
              <Divider />
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger
                    render={(props) => (
                      <DropdownMenuTrigger
                        {...props}
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!isEditable}
                            aria-label="Insert"
                            className="gap-0.5 px-1.5 toolbar-item spaced"
                          >
                            <PlusIcon className="size-4" />
                            <CaretDownIcon className="size-3 opacity-50" />
                          </Button>
                        }
                      />
                    )}
                  />
                  <TooltipContent side="bottom" sideOffset={4}>
                    Insert
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start" sideOffset={4} className="min-w-40">
                  <DropdownMenuItem
                    onClick={() => dispatchToolbarCommand(INSERT_HORIZONTAL_RULE_COMMAND)}
                    className={cn("cursor-pointer", "item")}
                  >
                    <MinusIcon className="size-4" />
                    <span className="text">Horizontal Rule</span>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </>
      )}
      <Spacer />
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

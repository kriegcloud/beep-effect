"use client";

import { Toggle } from "@beep/todox/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  ChatCenteredDotsIcon,
  CodeIcon,
  LinkIcon,
  TextAaIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextSubscriptIcon,
  TextSuperscriptIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import * as Str from "effect/String";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import type { JSX } from "react";
import { type Dispatch, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getDOMRangeRect } from "../../utils/getDOMRangeRect";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { setFloatingElemPosition } from "../../utils/setFloatingElemPosition";
import { INSERT_INLINE_COMMAND } from "../CommentPlugin";

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isUppercase,
  isLowercase,
  isCapitalize,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  setIsLinkEditMode,
}: {
  readonly editor: LexicalEditor;
  readonly anchorElem: HTMLElement;
  readonly isBold: boolean;
  readonly isCode: boolean;
  readonly isItalic: boolean;
  readonly isLink: boolean;
  readonly isUppercase: boolean;
  readonly isLowercase: boolean;
  readonly isCapitalize: boolean;
  readonly isStrikethrough: boolean;
  readonly isSubscript: boolean;
  readonly isSuperscript: boolean;
  readonly isUnderline: boolean;
  readonly setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  const insertComment = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
  };

  function mouseMoveListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current && (e.buttons === 1 || e.buttons === 3)) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "none") {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = "none";
        }
      }
    }
  }
  function mouseUpListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "auto") {
        popupCharStylesEditorRef.current.style.pointerEvents = "auto";
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = getDOMSelection(editor._window);

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem, isLink);
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, $updateTextFormatFloatingToolbar]);

  const iconSize = 16;

  return (
    <div
      ref={popupCharStylesEditorRef}
      className="floating-text-format-popup flex items-center gap-0.5 bg-popover text-popover-foreground p-1 absolute top-0 left-0 z-10 opacity-0 shadow-lg border border-border rounded-lg transition-opacity duration-300 will-change-transform"
    >
      {editor.isEditable() && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isBold}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                  aria-label="Bold"
                >
                  <TextBIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Bold (⌘B)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isItalic}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                  aria-label="Italic"
                >
                  <TextItalicIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Italic (⌘I)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isUnderline}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                  aria-label="Underline"
                >
                  <TextUnderlineIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Underline (⌘U)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isStrikethrough}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                  aria-label="Strikethrough"
                >
                  <TextStrikethroughIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Strikethrough
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isSubscript}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
                  aria-label="Subscript"
                >
                  <TextSubscriptIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Subscript
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isSuperscript}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}
                  aria-label="Superscript"
                >
                  <TextSuperscriptIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Superscript
            </TooltipContent>
          </Tooltip>
          <div className="w-px h-5 bg-border mx-1" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isUppercase}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase")}
                  aria-label="Uppercase"
                >
                  <TextAaIcon size={iconSize} weight="bold" />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Uppercase
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isLowercase}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase")}
                  aria-label="Lowercase"
                >
                  <TextAaIcon size={iconSize} weight="thin" />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Lowercase
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isCapitalize}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "capitalize")}
                  aria-label="Capitalize"
                >
                  <TextAaIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Capitalize
            </TooltipContent>
          </Tooltip>
          <div className="w-px h-5 bg-border mx-1" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={isCode}
                  onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                  aria-label="Code"
                >
                  <CodeIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Inline Code
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle size="sm" pressed={isLink} onPressedChange={insertLink} aria-label="Link">
                  <LinkIcon size={iconSize} />
                </Toggle>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Insert Link
            </TooltipContent>
          </Tooltip>
        </>
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle
              size="sm"
              pressed={false}
              onPressedChange={insertComment}
              aria-label="Comment"
              className="hidden lg:flex"
            >
              <ChatCenteredDotsIcon size={iconSize} />
            </Toggle>
          }
        />
        <TooltipContent side="top" sideOffset={8}>
          Add Comment
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  setIsLinkEditMode: Dispatch<boolean>
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [isLowercase, setIsLowercase] = useState(false);
  const [isCapitalize, setIsCapitalize] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = getDOMSelection(editor._window);
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsUppercase(selection.hasFormat("uppercase"));
      setIsLowercase(selection.hasFormat("lowercase"));
      setIsCapitalize(selection.hasFormat("capitalize"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== "") {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = Str.replace(/\n/g, "")(selection.getTextContent());
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isUppercase={isUppercase}
      isLowercase={isLowercase}
      isCapitalize={isCapitalize}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem
  );
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
  setIsLinkEditMode,
}: {
  readonly anchorElem?: undefined | HTMLElement;
  readonly setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  getDOMSelection,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import type { Dispatch, JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toolbarDefaultControls } from "../../constants";
import type { IControlsMap, TToolbarTextFormatControl } from "../../types";
import {
  BoldButton,
  CenterAlignButton,
  CodeButton,
  ItalicButton,
  LeftAlignButton,
  LinkButton,
  RightAlignButton,
  StrikethroughButton,
  UnderlineButton,
} from "../../ui";
import { getDOMRangeRect, getSelectedNode, setFloatingElemPosition } from "../../utils";

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isLeftAlign,
  isCenterAlign,
  isRightAlign,
  setIsLinkEditMode,
  controls = toolbarDefaultControls.textFormat,
}: {
  readonly editor: LexicalEditor;
  readonly anchorElem: HTMLElement;
  readonly isBold: boolean;
  readonly isCode: boolean;
  readonly isItalic: boolean;
  readonly isLink: boolean;
  readonly isStrikethrough: boolean;
  readonly isUnderline: boolean;
  readonly isLeftAlign: boolean;
  readonly isCenterAlign: boolean;
  readonly isRightAlign: boolean;
  readonly setIsLinkEditMode: Dispatch<boolean>;
  readonly controls?: undefined | Array<TToolbarTextFormatControl>;
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

  function mouseUpListener(_e: MouseEvent) {
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
    return;
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
      !!rootElement &&
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

  const controlsMap: Pick<IControlsMap, TToolbarTextFormatControl> = {
    bold: <BoldButton activeEditor={editor} isBold={isBold} />,
    italic: <ItalicButton activeEditor={editor} isItalic={isItalic} />,
    underline: <UnderlineButton activeEditor={editor} isUnderline={isUnderline} />,
    strikethrough: <StrikethroughButton activeEditor={editor} isStrikethrough={isStrikethrough} />,
    code: <CodeButton activeEditor={editor} isCode={isCode} />,
    link: <LinkButton insertLink={insertLink} isLink={isLink} />,
    leftAlign: <LeftAlignButton activeEditor={editor} isLeftAlign={isLeftAlign} />,
    centerAlign: <CenterAlignButton activeEditor={editor} isCenterAlign={isCenterAlign} />,
    rightAlign: <RightAlignButton activeEditor={editor} isRightAlign={isRightAlign} />,
  };

  return (
    <div ref={popupCharStylesEditorRef} className="floating-text-format-popup">
      {editor.isEditable() && !!controls?.length && <>{controls.map((c) => controlsMap[c])}</>}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  setIsLinkEditMode: Dispatch<boolean>,
  controls?: undefined | Array<TToolbarTextFormatControl>
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLeftAlign, setIsLeftAlign] = useState(false);
  const [isCenterAlign, setIsCenterAlign] = useState(false);
  const [isRightAlign, setIsRightAlign] = useState(false);

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
        (!$isRangeSelection(selection) || !rootElement?.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }
      const node = getSelectedNode(selection);
      const element = node.getTopLevelElementOrThrow();
      const align = element.getFormatType();

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsLeftAlign(align === "left");
      setIsCenterAlign(align === "center");
      setIsRightAlign(align === "right");

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

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
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
      isStrikethrough={isStrikethrough}
      isUnderline={isUnderline}
      isCode={isCode}
      isLeftAlign={isLeftAlign}
      isCenterAlign={isCenterAlign}
      isRightAlign={isRightAlign}
      setIsLinkEditMode={setIsLinkEditMode}
      controls={controls}
    />,
    anchorElem
  );
}

export const FloatingTextFormatToolbarPlugin = ({
  anchorElem = document.body,
  setIsLinkEditMode,
  controls,
}: {
  anchorElem?: undefined | HTMLElement;
  setIsLinkEditMode: Dispatch<boolean>;
  controls?: undefined | Array<TToolbarTextFormatControl>;
}): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode, controls);
};

export { floatTextFormatToolbarPluginStyles } from "./floatTextFormatToolbarPluginStyles";

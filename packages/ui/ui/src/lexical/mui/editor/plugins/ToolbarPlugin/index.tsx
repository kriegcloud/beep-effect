/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isCodeNode, CODE_LANGUAGE_MAP } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isParentElementRTL } from "@lexical/selection";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import { $findMatchingParent, $getNearestNodeOfType, $isEditorIsNestedEditor, mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type LexicalEditor,
  type NodeKey,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { type Dispatch, type FC, Fragment, type JSX, useCallback, useEffect, useState } from "react";
import { toolbarDefaultControls } from "../../constants";
import { blockTypeToBlockName, useToolbarState } from "../../context";
import { useModal } from "../../hooks";
import type { IControlsMap, IToolbarControls } from "../../types";
import {
  BlockFormatDropDown,
  BoldButton,
  CenterAlignButton,
  ClearEditorButton,
  ClearFormattingButton,
  CodeButton,
  CodeLanguageDropdown,
  Divider,
  HorizontalRuleButton,
  ImageButton,
  ItalicButton,
  LeftAlignButton,
  LinkButton,
  RedoButton,
  RightAlignButton,
  StrikethroughButton,
  TableButton,
  UnderlineButton,
  UndoButton,
  VideoButton,
} from "../../ui";
import { getSelectedNode, sanitizeUrl } from "../../utils";
import { clearEditor, clearFormatting } from "./utils";

interface IToolbarPluginProps {
  readonly editor: LexicalEditor;
  readonly activeEditor: LexicalEditor;
  readonly setActiveEditor: Dispatch<LexicalEditor>;
  readonly setIsLinkEditMode: Dispatch<boolean>;
  readonly controls?: undefined | IToolbarControls;
}

export const ToolbarPlugin: FC<IToolbarPluginProps> = ({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
  controls = toolbarDefaultControls,
}): JSX.Element => {
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  const $updateToolbar = useCallback(() => {
    activeEditor.read(() => {
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
        let element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : $findMatchingParent(anchorNode, (e) => {
                const parent = e.getParent();
                return parent !== null && $isRootOrShadowRoot(parent);
              });

        if (element === null) {
          element = anchorNode.getTopLevelElementOrThrow();
        }

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
            const type = $isHeadingNode(element) ? element.getTag() : element.getType();
            if (type in blockTypeToBlockName) {
              updateToolbarState("blockType", type as keyof typeof blockTypeToBlockName);
            }
            if ($isCodeNode(element)) {
              const language = element.getLanguage()!;
              updateToolbarState("codeLanguage", language ? CODE_LANGUAGE_MAP[language] || language : "");
              return;
            }
          }
        }
        let matchingParent;
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
            ? matchingParent.getFormatType()
            : $isElementNode(node)
              ? node.getFormatType()
              : parent?.getFormatType() || "left"
        );
      }
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getTopLevelElementOrThrow();
        // Update text format
        updateToolbarState("isBold", selection.hasFormat("bold"));
        updateToolbarState("isItalic", selection.hasFormat("italic"));
        updateToolbarState("isUnderline", selection.hasFormat("underline"));
        updateToolbarState("isStrikethrough", selection.hasFormat("strikethrough"));
        updateToolbarState("isHighlight", selection.hasFormat("highlight"));
        updateToolbarState("isCode", selection.hasFormat("code"));
        if (element) {
          const align = element.getFormatType();
          updateToolbarState("isRightAlign", align === "right");
          updateToolbarState("isLeftAlign", align === "left");
          updateToolbarState("isCenterAlign", align === "center");
        }
      }
    });
  }, [activeEditor, editor, updateToolbarState]);

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
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
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

  const onClearFormatting = useCallback(() => {
    clearFormatting(activeEditor);
  }, [activeEditor]);

  const onClearEditor = useCallback(() => {
    clearEditor(activeEditor);
  }, [activeEditor]);

  const canViewerSeeInsertDropdown = !toolbarState.isImageCaption;
  const canViewerSeeInsertCodeButton = !toolbarState.isImageCaption;

  const controlsMap: IControlsMap = {
    undo: <UndoButton disabled={!toolbarState.canUndo || !isEditable} activeEditor={activeEditor} />,
    redo: <RedoButton disabled={!toolbarState.canRedo || !isEditable} activeEditor={activeEditor} />,
    blockFormat: (
      <Fragment key={"toolbar-format-dropdown"}>
        {toolbarState.blockType in blockTypeToBlockName && activeEditor === editor && (
          <BlockFormatDropDown
            {...(controls.blockFormat ? { controls: controls.blockFormat } : {})}
            disabled={!isEditable}
            blockType={toolbarState.blockType}
            editor={activeEditor}
          />
        )}
        {!!controls.history?.length && <Divider />}
      </Fragment>
    ),
    codeLanguages: (
      <Fragment key={"toolbar-code-dropdown"}>
        <CodeLanguageDropdown
          disabled={!isEditable}
          toolbarState={toolbarState}
          onCodeLanguageSelect={onCodeLanguageSelect}
          controls={controls.codeLanguages}
        />
      </Fragment>
    ),
    bold: <BoldButton disabled={!isEditable} activeEditor={activeEditor} isBold={toolbarState.isBold} />,
    italic: <ItalicButton disabled={!isEditable} activeEditor={activeEditor} isItalic={toolbarState.isItalic} />,
    underline: (
      <UnderlineButton disabled={!isEditable} activeEditor={activeEditor} isUnderline={toolbarState.isUnderline} />
    ),
    strikethrough: (
      <StrikethroughButton
        disabled={!isEditable}
        activeEditor={activeEditor}
        isStrikethrough={toolbarState.isStrikethrough}
      />
    ),
    code: (
      <Fragment key={"toolbar-code-button"}>
        {canViewerSeeInsertCodeButton && (
          <CodeButton disabled={!isEditable} activeEditor={activeEditor} isCode={toolbarState.isCode} />
        )}
      </Fragment>
    ),
    link: <LinkButton disabled={!isEditable} insertLink={insertLink} isLink={toolbarState.isLink} />,
    leftAlign: (
      <LeftAlignButton disabled={!isEditable} activeEditor={activeEditor} isLeftAlign={toolbarState.isLeftAlign} />
    ),
    centerAlign: (
      <CenterAlignButton
        disabled={!isEditable}
        activeEditor={activeEditor}
        isCenterAlign={toolbarState.isCenterAlign}
      />
    ),
    rightAlign: (
      <RightAlignButton disabled={!isEditable} activeEditor={activeEditor} isRightAlign={toolbarState.isRightAlign} />
    ),
    formatting: <ClearFormattingButton disabled={!isEditable} onClick={onClearFormatting} />,
    editor: <ClearEditorButton disabled={!isEditable} onClick={onClearEditor} />,
    horizontal: <HorizontalRuleButton activeEditor={activeEditor} />,
    image: <ImageButton activeEditor={activeEditor} showModal={showModal} />,
    video: <VideoButton activeEditor={activeEditor} showModal={showModal} />,
    table: <TableButton activeEditor={activeEditor} showModal={showModal} />,
  };

  return (
    <div className="toolbar">
      {!!controls.history?.length && (
        <Fragment key={"toolbar-history-block"}>
          {controls.history.map((c) => controlsMap[c])}
          <Divider />
        </Fragment>
      )}

      {!!controls.blockFormat?.length && controlsMap.blockFormat}
      {toolbarState.blockType === "code" ? (
        controlsMap.codeLanguages
      ) : (
        <Fragment key={"toolbar-formats-block"}>
          {!!controls.textFormat?.length && (
            <Fragment key={"toolbar-text-format-block"}>
              {controls.textFormat.map((c) => controlsMap[c])}
              {!!controls.clear?.length && <Divider />}
            </Fragment>
          )}

          {!!controls.clear?.length && (
            <Fragment key={"toolbar-clear-format-block"}>
              {controls.clear.map((c) => controlsMap[c])}
              {!!controls.viewFormat?.length && <Divider />}
            </Fragment>
          )}

          {canViewerSeeInsertDropdown && !!controls.viewFormat?.length && (
            <Fragment key={"toolbar-view-format-block"}>{controls.viewFormat.map((c) => controlsMap[c])}</Fragment>
          )}
        </Fragment>
      )}

      {modal}
    </div>
  );
};

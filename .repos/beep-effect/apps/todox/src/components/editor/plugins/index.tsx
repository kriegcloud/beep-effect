"use client";

/**
 * Plugin composition for the canonical email compose LexicalEditor.
 *
 * Mounts 16 custom plugins from the POC + 6 built-in Lexical plugins.
 * Plugins are organized into groups: toolbar, formatting, content, navigation, and built-in.
 */
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import type { JSX } from "react";
import { useState } from "react";

import { useSharedHistoryContext } from "../context/SharedHistoryContext";
import ContentEditable from "../ui/ContentEditable";
import ActionsPlugin from "./ActionsPlugin";
import AutoLinkPlugin from "./AutoLinkPlugin";
import ComponentPickerPlugin from "./ComponentPickerPlugin";
import DragDropPaste from "./DragDropPastePlugin";
import EmojiPickerPlugin from "./EmojiPickerPlugin";
import EmojisPlugin from "./EmojisPlugin";
import FloatingLinkEditorPlugin from "./FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./FloatingTextFormatToolbarPlugin";
import ImagesPlugin from "./ImagesPlugin";
import LinkPlugin from "./LinkPlugin";
import MarkdownShortcutPlugin from "./MarkdownShortcutPlugin";
import { EMAIL_COMPOSE_TRANSFORMERS } from "./MarkdownTransformers";
import MentionsPlugin from "./MentionsPlugin";
import { PreserveSelectionPlugin } from "./PreserveSelectionPlugin";
import ShortcutsPlugin from "./ShortcutsPlugin";
import TabFocusPlugin from "./TabFocusPlugin";
import ToolbarPlugin from "./ToolbarPlugin";

interface EmailComposePluginsProps {
  readonly placeholder: string;
  readonly onToggleFullscreen?: () => void;
  readonly isFullscreen?: boolean;
}

export function EmailComposePlugins({
  placeholder,
  onToggleFullscreen,
  isFullscreen,
}: EmailComposePluginsProps): JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const isEditable = useLexicalEditable();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const onRef = (elem: HTMLDivElement) => {
    if (elem !== null) {
      setFloatingAnchorElem(elem);
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Toolbar plugins                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div role="toolbar" aria-label="Formatting options">
        <ToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
        {onToggleFullscreen !== undefined && (
          <div className="toolbar-fullscreen-wrapper">
            <button
              type="button"
              className="toolbar-item"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen === true ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen === true ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
            >
              {isFullscreen === true ? "\u229F" : "\u229E"}
            </button>
          </div>
        )}
      </div>
      <ShortcutsPlugin editor={activeEditor} setIsLinkEditMode={setIsLinkEditMode} />

      {/* ------------------------------------------------------------------ */}
      {/* Editor container                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="editor-container">
        <DragDropPaste />
        <AutoFocusPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <MentionsPlugin />
        <EmojisPlugin />
        <AutoLinkPlugin />
        <PreserveSelectionPlugin />

        {/* Built-in plugins */}
        <HistoryPlugin externalHistoryState={historyState} />
        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div
                className="editor"
                ref={onRef}
                role="textbox"
                aria-multiline="true"
                aria-label={placeholder || "Rich text editor"}
              >
                <ContentEditable placeholder={placeholder} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <MarkdownShortcutPlugin transformers={EMAIL_COMPOSE_TRANSFORMERS} />
        <ListPlugin />
        <CheckListPlugin />
        <HorizontalRulePlugin />
        <ImagesPlugin />
        <LinkPlugin />
        <ClickableLinkPlugin disabled={isEditable} />
        <TabFocusPlugin />

        {/* Floating plugins - require anchor element to be mounted */}
        {floatingAnchorElem && (
          <>
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} setIsLinkEditMode={setIsLinkEditMode} />
          </>
        )}

        <ActionsPlugin
          shouldPreserveNewLinesInMarkdown={false}
          useCollabV2={false}
          transformers={EMAIL_COMPOSE_TRANSFORMERS}
        />
      </div>
    </>
  );
}

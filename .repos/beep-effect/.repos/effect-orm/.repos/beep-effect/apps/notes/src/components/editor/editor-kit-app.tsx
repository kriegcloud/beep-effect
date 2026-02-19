"use client";

import { AutoformatKit } from "@beep/notes/registry/components/editor/plugins/autoformat-kit";
import { BasicBlocksKit } from "@beep/notes/registry/components/editor/plugins/basic-blocks-kit";
import { BasicMarksKit } from "@beep/notes/registry/components/editor/plugins/basic-marks-kit";
import { BlockMenuKit } from "@beep/notes/registry/components/editor/plugins/block-menu-kit";
import { BlockPlaceholderKit } from "@beep/notes/registry/components/editor/plugins/block-placeholder-kit";
import { CalloutKit } from "@beep/notes/registry/components/editor/plugins/callout-kit";
import { CodeBlockKit } from "@beep/notes/registry/components/editor/plugins/code-block-kit";
import { ColumnKit } from "@beep/notes/registry/components/editor/plugins/column-kit";
import { CopilotKit } from "@beep/notes/registry/components/editor/plugins/copilot-kit";
import { CursorOverlayKit } from "@beep/notes/registry/components/editor/plugins/cursor-overlay-kit";
import { DateKit } from "@beep/notes/registry/components/editor/plugins/date-kit";
import { DndKit } from "@beep/notes/registry/components/editor/plugins/dnd-kit";
import { DocxKit } from "@beep/notes/registry/components/editor/plugins/docx-kit";
import { EmojiKit } from "@beep/notes/registry/components/editor/plugins/emoji-kit";
import { ExitBreakKit } from "@beep/notes/registry/components/editor/plugins/exit-break-kit";
import { FontKit } from "@beep/notes/registry/components/editor/plugins/font-kit";
import { ListKit } from "@beep/notes/registry/components/editor/plugins/list-kit";
import { MarkdownKit } from "@beep/notes/registry/components/editor/plugins/markdown-kit";
import { MathKit } from "@beep/notes/registry/components/editor/plugins/math-kit";
import { SlashKit } from "@beep/notes/registry/components/editor/plugins/slash-kit";
import { TableKit } from "@beep/notes/registry/components/editor/plugins/table-kit";
import { TocKit } from "@beep/notes/registry/components/editor/plugins/toc-kit";
import { ToggleKit } from "@beep/notes/registry/components/editor/plugins/toggle-kit";
import { TrailingBlockPlugin, type Value } from "platejs";
import { type TPlateEditor, useEditorRef } from "platejs/react";

import { AIKit } from "./plugins/ai-kit-app";
import { BlockSelectionKit } from "./plugins/block-selection-kit-app";
import { CommentKit } from "./plugins/comment-kit-app";
import { FloatingToolbarKit } from "./plugins/floating-toolbar-kit-app";
import { LinkKit } from "./plugins/link-kit-app";
import { MediaKit } from "./plugins/media-kit-app";
import { MentionKit } from "./plugins/mention-kit-app";
import { SuggestionKit } from "./plugins/suggestion-kit-app";

export const EditorKit = [
  ...CopilotKit,
  ...AIKit,
  ...BlockMenuKit,
  ...BlockSelectionKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...CalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...MentionKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,

  // Collaboration
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();

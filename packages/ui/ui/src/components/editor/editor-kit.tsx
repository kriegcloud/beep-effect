"use client";

import { AIKit } from "@beep/ui/components/editor/plugins/ai-kit";
import { AlignKit } from "@beep/ui/components/editor/plugins/align-kit";
import { AutoformatKit } from "@beep/ui/components/editor/plugins/autoformat-kit";
import { BasicBlocksKit } from "@beep/ui/components/editor/plugins/basic-blocks-kit";
import { BasicMarksKit } from "@beep/ui/components/editor/plugins/basic-marks-kit";
import { BlockMenuKit } from "@beep/ui/components/editor/plugins/block-menu-kit";
import { BlockPlaceholderKit } from "@beep/ui/components/editor/plugins/block-placeholder-kit";
import { CalloutKit } from "@beep/ui/components/editor/plugins/callout-kit";
import { CodeBlockKit } from "@beep/ui/components/editor/plugins/code-block-kit";
import { ColumnKit } from "@beep/ui/components/editor/plugins/column-kit";
import { CommentKit } from "@beep/ui/components/editor/plugins/comment-kit";
import { CopilotKit } from "@beep/ui/components/editor/plugins/copilot-kit";
import { CursorOverlayKit } from "@beep/ui/components/editor/plugins/cursor-overlay-kit";
import { DateKit } from "@beep/ui/components/editor/plugins/date-kit";
import { DiscussionKit } from "@beep/ui/components/editor/plugins/discussion-kit";
import { DndKit } from "@beep/ui/components/editor/plugins/dnd-kit";
import { DocxKit } from "@beep/ui/components/editor/plugins/docx-kit";
import { EmojiKit } from "@beep/ui/components/editor/plugins/emoji-kit";
import { ExitBreakKit } from "@beep/ui/components/editor/plugins/exit-break-kit";
import { FixedToolbarKit } from "@beep/ui/components/editor/plugins/fixed-toolbar-kit";
import { FloatingToolbarKit } from "@beep/ui/components/editor/plugins/floating-toolbar-kit";
import { FontKit } from "@beep/ui/components/editor/plugins/font-kit";
import { LineHeightKit } from "@beep/ui/components/editor/plugins/line-height-kit";
import { LinkKit } from "@beep/ui/components/editor/plugins/link-kit";
import { ListKit } from "@beep/ui/components/editor/plugins/list-kit";
import { MarkdownKit } from "@beep/ui/components/editor/plugins/markdown-kit";
import { MathKit } from "@beep/ui/components/editor/plugins/math-kit";
import { MediaKit } from "@beep/ui/components/editor/plugins/media-kit";
import { MentionKit } from "@beep/ui/components/editor/plugins/mention-kit";
import { SlashKit } from "@beep/ui/components/editor/plugins/slash-kit";
import { SuggestionKit } from "@beep/ui/components/editor/plugins/suggestion-kit";
import { TableKit } from "@beep/ui/components/editor/plugins/table-kit";
import { TocKit } from "@beep/ui/components/editor/plugins/toc-kit";
import { ToggleKit } from "@beep/ui/components/editor/plugins/toggle-kit";
import { TrailingBlockPlugin, type Value } from "platejs";
import { type TPlateEditor, useEditorRef } from "platejs/react";

export const EditorKit = [
  ...CopilotKit,
  ...AIKit,

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
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...BlockMenuKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();

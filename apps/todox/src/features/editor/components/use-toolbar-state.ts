import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import type { TextTransformValue } from "../extension/text-transform";
import type { TextHeadingLevel } from "./heading-block";

// ----------------------------------------------------------------------

export type TextAlignValue = "left" | "center" | "right" | "justify";

export type UseToolbarStateReturn = {
  isBold: boolean;
  isCode: boolean;
  isLink: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isUnderline: boolean;
  isCodeBlock: boolean;
  isBulletList: boolean;
  isBlockquote: boolean;
  isOrderedList: boolean;
  isAlign: (value: TextAlignValue) => boolean;
  isTextLevel: (value: TextHeadingLevel) => boolean;
  isTextTransform: (value: TextTransformValue) => boolean;
  canUndo: boolean;
  canRedo: boolean;
};

export function useToolbarState(editor: Editor): UseToolbarStateReturn {
  const toolbarState = useEditorState({
    editor,
    selector: (ctx) => {
      const canRun = ctx.editor.can().chain().focus();

      return {
        isBold: ctx.editor.isActive("bold"),
        isCode: ctx.editor.isActive("code"),
        isLink: ctx.editor.isActive("link"),
        isItalic: ctx.editor.isActive("italic"),
        isStrike: ctx.editor.isActive("strike"),
        isUnderline: ctx.editor.isActive("underline"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isBulletList: ctx.editor.isActive("bulletList"),
        isBlockquote: ctx.editor.isActive("blockquote"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isAlign: (value: TextAlignValue) => ctx.editor.isActive({ textAlign: value }),
        isTextTransform: (value: TextTransformValue) => ctx.editor.isActive("textTransform", { textTransform: value }),
        isTextLevel: (value: TextHeadingLevel) =>
          value ? ctx.editor.isActive("heading", { level: value }) : ctx.editor.isActive("paragraph"),
        canUndo: canRun.undo().run(),
        canRedo: canRun.redo().run(),
      };
    },
  });

  return toolbarState;
}

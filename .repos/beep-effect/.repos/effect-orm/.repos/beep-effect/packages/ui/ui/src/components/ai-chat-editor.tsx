"use client";

import { BaseEditorKit } from "@beep/ui/components/editor/editor-base-kit";

import { useAIChatEditor } from "@platejs/ai/react";
import { usePlateEditor } from "platejs/react";
import React from "react";

import { EditorStatic } from "./editor-static";
// Unresolved function or method memo()
export const AIChatEditor = React.memo(function AIChatEditor({ content }: { readonly content: string }) {
  const aiEditor = usePlateEditor({
    plugins: BaseEditorKit,
  });

  useAIChatEditor(aiEditor, content);

  return <EditorStatic variant="aiChat" editor={aiEditor} />;
});

"use client";

import { BaseEditorKit } from "@beep/notes/registry/components/editor/editor-base-kit";

import { useAIChatEditor } from "@platejs/ai/react";
import { usePlateEditor } from "platejs/react";
import * as React from "react";

import { EditorStatic } from "./editor-static";

export const AIChatEditor = React.memo(function AIChatEditor({ content }: { content: string }) {
  const aiEditor = usePlateEditor({
    plugins: BaseEditorKit,
  });

  useAIChatEditor(aiEditor, content);

  return <EditorStatic variant="aiChat" editor={aiEditor} />;
});

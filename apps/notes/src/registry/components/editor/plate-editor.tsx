"use client";

import { EditorKit } from "@beep/notes/registry/components/editor/editor-kit";
import { playgroundValue } from "@beep/notes/registry/examples/values/playground-value";
import { Editor, EditorContainer } from "@beep/notes/registry/ui/editor";
import { TocSidebar } from "@beep/notes/registry/ui/toc-sidebar";
import { Plate, usePlateEditor } from "platejs/react";

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: playgroundValue,
  });

  return (
    <Plate editor={editor}>
      <TocSidebar className="top-[130px]" topOffset={30} />

      <EditorContainer>
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}

"use client";

import { EditorKit } from "@beep/notes/registry/components/editor/editor-kit";
import { tocValue } from "@beep/notes/registry/examples/values/toc-value";
import { Editor, EditorContainer } from "@beep/notes/registry/ui/editor";
import { TocSidebar } from "@beep/notes/registry/ui/toc-sidebar";
import { Plate, usePlateEditor } from "platejs/react";

export default function TocDemo() {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: tocValue,
  });

  return (
    <Plate editor={editor}>
      <TocSidebar className="*:top-12" topOffset={30} />

      <EditorContainer variant="demo" className="flex">
        <Editor variant="demo" className="h-fit" />
      </EditorContainer>
    </Plate>
  );
}

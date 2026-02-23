import { EditorKit } from "@beep/notes/registry/components/editor/editor-kit";
import { DEMO_VALUES } from "@beep/notes/registry/examples/values/demo-values";
import { Editor, EditorContainer } from "@beep/notes/registry/ui/editor";
import { Plate, usePlateEditor } from "platejs/react";

export default function Demo({ id }: { id: keyof typeof DEMO_VALUES }) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: DEMO_VALUES[id],
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor variant="demo" />
      </EditorContainer>
    </Plate>
  );
}

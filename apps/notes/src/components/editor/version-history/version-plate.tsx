import { EditorKit } from "@beep/notes/components/editor/editor-kit-app";
import { Editor } from "@beep/notes/registry/ui/editor";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

export function VersionPlate({
  children,
  ...props
}: React.PropsWithChildren<{
  id: string;
  value: Value;
}>) {
  const { id, value } = props;

  const editor = usePlateEditor({
    id,
    plugins: EditorKit,
    readOnly: true,
    value,
  });

  return (
    <Plate readOnly editor={editor}>
      <Editor variant="versionHistory" autoFocus />
    </Plate>
  );
}

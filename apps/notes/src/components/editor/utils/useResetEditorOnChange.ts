import type { Value } from "platejs";
import type { PlateEditor } from "platejs/react";
import { useEffect } from "react";

export function useResetEditorOnChange(
  { id, editor, value }: { editor: PlateEditor; id?: string; value?: Value },
  deps: any[]
) {
  useEffect(() => {
    if (value && value !== editor.children) {
      editor.tf.replaceNodes(value, {
        at: [],
        children: true,
      });

      editor.id = id ?? editor.id;
      editor.meta.resetting = true;
      editor.history.undos = [];
      editor.history.redos = [];
      editor.operations = [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
}

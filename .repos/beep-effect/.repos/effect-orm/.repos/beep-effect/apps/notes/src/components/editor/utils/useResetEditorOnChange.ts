import type { UnsafeTypes } from "@beep/types";
import type { Value } from "platejs";
import type { PlateEditor } from "platejs/react";
import { useEffect } from "react";

export function useResetEditorOnChange(
  {
    id,
    editor,
    value,
  }: { readonly editor: PlateEditor; readonly id?: undefined | string; readonly value?: undefined | Value },
  deps: UnsafeTypes.UnsafeAny[]
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
  }, [...deps]);
}

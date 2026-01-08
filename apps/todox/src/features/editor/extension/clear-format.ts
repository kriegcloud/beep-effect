import { Extension } from "@tiptap/core";

// ----------------------------------------------------------------------

export const ClearFormat = Extension.create({
  name: "clearFormat",
  /********/
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-X": ({ editor }) => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    };
  },
});

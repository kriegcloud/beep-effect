import type { Editor } from "platejs";

import scrollIntoView from "scroll-into-view-if-needed";

export const scrollSelectionIntoView = (editor: Editor) => {
  const domRange: Range | null | undefined = editor.selection && editor.api.toDOMRange(editor.selection);

  if (!domRange) return;
  if (domRange.getBoundingClientRect) {
    const leafEl = domRange.startContainer.parentElement!;
    leafEl.getBoundingClientRect = domRange.getBoundingClientRect.bind(domRange);
    scrollIntoView(leafEl, {
      scrollMode: "if-needed",
    });

    delete (leafEl as any).getBoundingClientRect;
  }
};

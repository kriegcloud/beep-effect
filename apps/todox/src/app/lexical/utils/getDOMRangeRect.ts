export function getDOMRangeRect(nativeSelection: Selection, rootElement: HTMLElement): DOMRect {
  const domRange = nativeSelection.getRangeAt(0);

  let rect: DOMRect;

  if (nativeSelection.anchorNode === rootElement) {
    let inner: HTMLElement = rootElement;
    while (inner.firstElementChild != null) {
      const firstChild = inner.firstElementChild;
      if (!(firstChild instanceof HTMLElement)) {
        // Stop traversal if child is not an HTMLElement (e.g., SVGElement)
        break;
      }
      inner = firstChild;
    }
    rect = inner.getBoundingClientRect();
  } else {
    rect = domRange.getBoundingClientRect();
  }

  return rect;
}

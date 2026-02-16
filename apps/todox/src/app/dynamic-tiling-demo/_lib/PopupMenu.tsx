import * as A from "effect/Array";
import type * as React from "react";
import * as ReactDOM from "react-dom/client";

// -----------------------------------------------------------------------------
// Type definitions
// -----------------------------------------------------------------------------

interface IPopupMenuProps {
  readonly title: string;
  readonly items: ReadonlyArray<string>;
  readonly currentDocument: Document;
  readonly onHide: (item: string | undefined) => void;
}

// -----------------------------------------------------------------------------
// showPopup function
// -----------------------------------------------------------------------------

/** @hidden @internal */
export function showPopup(
  title: string,
  layoutDiv: HTMLElement,
  x: number,
  y: number,
  items: ReadonlyArray<string>,
  onSelect: (item: string | undefined) => void
): void {
  const currentDocument = layoutDiv.ownerDocument;
  const layoutRect = layoutDiv.getBoundingClientRect();

  const elm = currentDocument.createElement("div");
  elm.className = "popup_menu_container";

  if (x < layoutRect.left + layoutRect.width / 2) {
    elm.style.left = `${x - layoutRect.left}px`;
  } else {
    elm.style.right = `${layoutRect.right - x}px`;
  }

  if (y < layoutRect.top + layoutRect.height / 2) {
    elm.style.top = `${y - layoutRect.top}px`;
  } else {
    elm.style.bottom = `${layoutRect.bottom - y}px`;
  }

  layoutDiv.appendChild(elm);

  const root = ReactDOM.createRoot(elm);

  const onHide = (item: string | undefined): void => {
    onSelect(item);
    layoutDiv.removeChild(elm);
    root.unmount();
    elm.removeEventListener("pointerdown", onElementPointerDown);
    currentDocument.removeEventListener("pointerdown", onDocPointerDown);
  };

  const onElementPointerDown = (event: Event): void => {
    event.stopPropagation();
  };

  const onDocPointerDown = (_event: Event): void => {
    onHide(undefined);
  };

  elm.addEventListener("pointerdown", onElementPointerDown);
  currentDocument.addEventListener("pointerdown", onDocPointerDown);

  root.render(<PopupMenu currentDocument={currentDocument} onHide={onHide} title={title} items={items} />);
}

// -----------------------------------------------------------------------------
// PopupMenu Component
// -----------------------------------------------------------------------------

/** @hidden @internal */
const PopupMenu = (props: IPopupMenuProps): React.ReactElement => {
  const { title, items, onHide } = props;

  const onItemClick = (item: string, event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    onHide(item);
    event.stopPropagation();
  };

  const itemElements = A.map(items, (item) => (
    <div key={item} className="popup_menu_item" onClick={(event) => onItemClick(item, event)}>
      {item}
    </div>
  ));

  return (
    <div className="popup_menu">
      <div className="popup_menu_title">{title}</div>
      {itemElements}
    </div>
  );
};

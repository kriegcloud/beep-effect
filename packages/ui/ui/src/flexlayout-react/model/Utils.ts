import { BS } from "@beep/schema";
import { BorderNode } from "./BorderNode";
import type { RowNode } from "./RowNode";
import type { TabNode } from "./TabNode";
import { TabSetNode } from "./TabSetNode";

/** @internal */
export function adjustSelectedIndexAfterDock(node: TabNode) {
  const parent = node.getParent();
  if (parent !== null && (parent instanceof TabSetNode || parent instanceof BorderNode)) {
    const children = parent.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as TabNode;
      if (child === node) {
        parent.setSelected(i);
        return;
      }
    }
  }
}

/** @internal */
export function adjustSelectedIndex(parent: TabSetNode | BorderNode | RowNode, removedIndex: number) {
  // for the tabset/border being removed from set the selected index
  if (parent !== undefined && (parent instanceof TabSetNode || parent instanceof BorderNode)) {
    const selectedIndex = (parent as TabSetNode | BorderNode).getSelected();
    if (selectedIndex !== -1) {
      if (removedIndex === selectedIndex && parent.getChildren().length > 0) {
        if (removedIndex >= parent.getChildren().length) {
          // removed last tab; select new last tab
          parent.setSelected(parent.getChildren().length - 1);
        } else {
          // leave selected index as is, selecting next tab after this one
        }
      } else if (removedIndex < selectedIndex) {
        parent.setSelected(selectedIndex - 1);
      } else if (removedIndex > selectedIndex) {
        // leave selected index as is
      } else {
        parent.setSelected(-1);
      }
    }
  }
}

export function randomUUID(): string {
  return BS.UUIDLiteralEncoded.create();
}

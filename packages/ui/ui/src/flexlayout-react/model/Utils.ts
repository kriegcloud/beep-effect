import { BS } from "@beep/schema";
import type { Node } from "./Node";

/** Interface for nodes that support popout capability */
interface IPopoutCapable {
  isEnablePopout(): boolean;
}

/** Interface for nodes that support selection (TabSetNode, BorderNode) */
interface ISelectable {
  getSelected(): number;
  setSelected(index: number): void;
  getChildren(): Node[];
}

/** Type guard to check if a node has isEnablePopout method */
function hasPopoutCapability(node: Node): node is Node & IPopoutCapable {
  return "isEnablePopout" in node && typeof (node as IPopoutCapable).isEnablePopout === "function";
}

/** Type guard to check if a node has selection capabilities (tabset or border) */
function isSelectableNode(node: Node): node is Node & ISelectable {
  const nodeType = node.getType();
  return (nodeType === "tabset" || nodeType === "border") && "getSelected" in node && "setSelected" in node;
}

/**
 * Check if a node can be docked to a popout window.
 * TabNodes must have enablePopout=true, TabSetNodes require all children to have enablePopout=true.
 */
export function canDockToWindow(node: Node): boolean {
  const nodeType = node.getType();

  if (nodeType === "tab") {
    return hasPopoutCapability(node) && node.isEnablePopout();
  }

  if (nodeType === "tabset") {
    for (const child of node.getChildren()) {
      if (!hasPopoutCapability(child) || !child.isEnablePopout()) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/** @internal */
export function adjustSelectedIndexAfterDock(node: Node) {
  const parent = node.getParent();
  if (parent !== null && parent !== undefined && isSelectableNode(parent)) {
    const children = parent.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child === node) {
        parent.setSelected(i);
        return;
      }
    }
  }
}

/** @internal */
export function adjustSelectedIndex(parent: Node, removedIndex: number) {
  // for the tabset/border being removed from set the selected index
  if (parent !== undefined && isSelectableNode(parent)) {
    const selectedIndex = parent.getSelected();
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

import type { JoinNode } from "@beep/rete/network";

export const isAncestor = <T extends object>(x: JoinNode<T>, y: JoinNode<T>): boolean => {
  let node = y;
  while (node?.parent) {
    if (node.parent.parent === x) {
      return true;
    }
    node = node.parent.parent;
  }
  return false;
};

export default isAncestor;

import { type Descendant, ElementApi, type Path } from "platejs";

export function traverseTextNodes(
  nodes: Descendant[],
  callback: (node: Descendant, path: Path) => boolean | void,
  path: Path = []
  // from?: Point
): boolean | void {
  for (const [index, childNode] of nodes.entries()) {
    const childPath = path.concat(index);

    // If the node is an element and has children, traverse them
    if (ElementApi.isElement(childNode) && childNode.children) {
      if (traverseTextNodes(childNode.children, callback, childPath)) {
        return true;
      }

      continue;
    }
    // Execute the callback for each node
    if (callback(childNode, childPath)) {
      return true;
    }
  }
  return undefined;
}

import { type Descendant, ElementApi, type Path } from "platejs";

export function traverseElementNodes(
  nodes: Descendant[],
  callback: (node: Descendant, path: Path) => boolean | void,
  path: Path = []
): boolean | void {
  for (const [index, childNode] of nodes.entries()) {
    const childPath = path.concat(index);

    // If the node is an element and has children, traverse them
    if (ElementApi.isElement(childNode) && childNode.children) {
      if (callback(childNode, childPath)) {
        return true;
      }
      if (traverseElementNodes(childNode.children, callback, childPath)) {
        return true;
      }
    }
  }
  return undefined;
}

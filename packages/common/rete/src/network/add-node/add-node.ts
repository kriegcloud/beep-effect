import type { $Schema, AlphaNode } from "../../network/types";

export const addNode = <T extends $Schema>(node: AlphaNode<T>, newNode: AlphaNode<T>): AlphaNode<T> => {
  for (let i = 0; i < node.children.length; i++) {
    if (node.children[i]?.testField === newNode.testField && node.children[i]?.testValue === newNode.testValue) {
      return node.children[i]!;
    }
  }
  node.children.push(newNode);
  return newNode;
};

export default addNode;

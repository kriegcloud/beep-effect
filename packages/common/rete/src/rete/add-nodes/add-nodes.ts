import type { AlphaNode, FactId, Field, Session } from "@beep/rete/rete";
import { addNode } from "../add-node";

export const addNodes = <T extends object>(
  session: Session<T>,
  nodes: [Field.Type, keyof T | FactId.Type][]
): AlphaNode<T> => {
  let result = session.alphaNode;
  for (const node of nodes) {
    result = addNode(result, {
      id: session.nextId(),
      testField: node[0],
      testValue: node[1],
      successors: [],
      children: [],
      facts: new Map(),
    });
  }
  return result;
};

export default addNodes;

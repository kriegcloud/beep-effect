import { type AlphaNode, type Fact, Field, type Session } from "@beep/rete/network";

export const getAlphaNodesForFact = <T extends object>(
  session: Session<T>,
  node: AlphaNode<T>,
  fact: Fact<T>,
  root: boolean,
  nodes: Set<AlphaNode<T>>
) => {
  if (root) {
    for (const child of node.children) {
      getAlphaNodesForFact(session, child, fact, false, nodes);
    }
  } else {
    const val =
      node.testField === Field.Enum.IDENTIFIER
        ? fact[0]
        : node.testField === Field.Enum.ATTRIBUTE
          ? fact[1]
          : node.testField === Field.Enum.VALUE
            ? fact[2]
            : undefined;
    if (val != node.testValue) {
      return;
    }
    nodes.add(node);
    for (const child of node.children) {
      getAlphaNodesForFact(session, child, fact, false, nodes);
    }
  }
};

export default getAlphaNodesForFact;

import { ExpectedToHaveAlphaFactsForNode } from "@beep/rete/network/left-activation-without-alpha/errors";
import type { $Schema, Binding, IdAttrs, JoinNode, Session, Token } from "@beep/rete/network/types";
import { getValFromBindings } from "../get-val-from-bindings";
import { leftActivationFromVars } from "../left-activation-from-vars";

export const leftActivationWithoutAlpha = <T extends $Schema>(
  session: Session<T>,
  node: JoinNode<T>,
  idAttrs: IdAttrs<T>,
  token: Token<T>,
  binding: Binding<T>
) => {
  if (node.idName && node.idName != "") {
    const id = getValFromBindings(binding, node.idName); //vars.get(node.idName)
    const idStr = id !== undefined ? `${String(id)}` : undefined;
    if (idStr !== undefined && node.alphaNode.facts.get(idStr)) {
      const alphaFacts = node.alphaNode.facts.get(idStr)?.values();
      if (!alphaFacts) throw new ExpectedToHaveAlphaFactsForNode(node);
      for (const alphaFact of alphaFacts) {
        leftActivationFromVars(session, node, idAttrs, token, alphaFact, binding);
      }
    }
  } else {
    for (const fact of node.alphaNode.facts.values()) {
      for (const alphaFact of fact.values()) {
        leftActivationFromVars(session, node, idAttrs, token, alphaFact, binding);
      }
    }
  }
};

export default leftActivationWithoutAlpha;

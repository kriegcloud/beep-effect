import {
  ExpectedFactIdToExist,
  ExpectedTokenToHaveAnOldFact,
} from "@beep/rete/network/right-activation-with-alpha-node/errors";
import { type $Schema, type AlphaNode, type Fact, type Session, type Token, TokenKind } from "@beep/rete/network/types";
import { getIdAttr } from "../get-id-attr";
import { rightActivationWithJoinNode } from "../right-activation-with-join-node";
import { hashIdAttr } from "../utils";

const rightActivationWithAlphaNode = <T extends $Schema>(session: Session<T>, node: AlphaNode<T>, token: Token<T>) => {
  const idAttr = getIdAttr(token.fact);
  const idAttrHash = hashIdAttr(idAttr);
  const [id, attr] = idAttr;
  if (token.kind === TokenKind.Enum.INSERT) {
    if (!node.facts.has(id.toString())) {
      node.facts.set(id.toString(), new Map<string, Fact<T>>());
    }
    node.facts.get(id.toString())!.set(attr.toString(), token.fact);
    if (!session.idAttrNodes.has(idAttrHash)) {
      session.idAttrNodes.set(idAttrHash, {
        alphaNodes: new Set<AlphaNode<T>>(),
        idAttr,
      });
    }
    session.idAttrNodes.get(idAttrHash)!.alphaNodes.add(node);
  } else if (token.kind === TokenKind.Enum.RETRACT) {
    node.facts.get(id.toString())?.delete(attr.toString());
    session.idAttrNodes.get(idAttrHash)!.alphaNodes.delete(node);
    if (session.idAttrNodes.get(idAttrHash)!.alphaNodes.size == 0) {
      session.idAttrNodes.delete(idAttrHash);
    }
  } else if (token.kind === TokenKind.Enum.UPDATE) {
    const idAttr = node.facts.get(id.toString());
    if (idAttr === undefined) throw new ExpectedFactIdToExist(id);
    idAttr.set(attr.toString(), token.fact);
  }
  for (const child of node.successors) {
    if (token.kind === TokenKind.Enum.UPDATE && child.disableFastUpdates) {
      if (token.oldFact === undefined) throw new ExpectedTokenToHaveAnOldFact(token);

      rightActivationWithJoinNode(session, child, idAttr, {
        fact: token.oldFact,
        kind: TokenKind.Enum.RETRACT,
      });
      rightActivationWithJoinNode(session, child, idAttr, {
        fact: token.fact,
        kind: TokenKind.Enum.INSERT,
      });
    } else {
      rightActivationWithJoinNode(session, child, idAttr, token);
    }
  }
};

export default rightActivationWithAlphaNode;

import type { $Schema, IdAttr, JoinNode, Session, Token } from "@beep/rete/network/types";
import { bindVarsFromFact } from "../bind-vars-from-fact";
import { getValFromBindings } from "../get-val-from-bindings";
import { leftActivationOnMemoryNode } from "../left-activation-from-vars";
import { UnexpectedNullChildForNode, UnexpectedUndefinedChildForNode } from "./errors";

const rightActivationWithJoinNode = <T extends $Schema>(
  session: Session<T>,
  node: JoinNode<T>,
  idAttr: IdAttr<T>,
  token: Token<T>
) => {
  if (node.parent === undefined) {
    const bindings = bindVarsFromFact(node.condition, token.fact, token);
    if (bindings.didBindVar) {
      if (!node.child) {
        throw new UnexpectedUndefinedChildForNode(node.idName);
      }
      leftActivationOnMemoryNode(session, node.child, [idAttr], token, true, bindings.binding!);
    }
  } else {
    const matches = node.parent.matches.values();
    for (const match of matches) {
      // TODO: We need to find call sites where we need to consolidate the bindings into a match
      const idName = node.idName;
      if (idName && idName !== "" && getValFromBindings(match.match.bindings, idName) != token.fact[0]) {
        continue;
      }
      const bindings = bindVarsFromFact(node.condition, token.fact, token, match.match.bindings);
      if (bindings.didBindVar) {
        const newIdAttrs = [...match.idAttrs];
        newIdAttrs.push(idAttr);
        const child = node.child;
        if (!child) throw new UnexpectedNullChildForNode(node.idName);

        leftActivationOnMemoryNode(session, child, newIdAttrs, token, true, bindings.binding!);
      }
    }
  }
};

export default rightActivationWithJoinNode;

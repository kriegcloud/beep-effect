import type { Binding, Fact, IdAttrs, JoinNode, Session, Token } from "@beep/rete/rete";
import { bindVarsFromFact } from "../bind-vars-from-fact";
import { getIdAttr } from "../get-id-attr";
import { leftActivationOnMemoryNode } from "../left-activation-on-memory-node";
import { hashIdAttr } from "../utils";

export const leftActivationFromVars = <T extends object>(
  session: Session<T>,
  node: JoinNode<T>,
  idAttrs: IdAttrs<T>,
  token: Token<T>,
  alphaFact: Fact<T>,
  bindings: Binding<T>
) => {
  const bindResults = bindVarsFromFact(node.condition, alphaFact, token, bindings);
  if (bindResults.didBindVar) {
    const idAttr = getIdAttr<T>(alphaFact);
    const newIdAttrs = [...idAttrs];
    newIdAttrs.push(idAttr);
    const newToken = { fact: alphaFact, kind: token.kind };
    const isNew = !node.oldIdAttrs?.has(hashIdAttr(idAttr));
    const child = node.child;
    if (!child) {
      console.error("Session", JSON.stringify(session));
      console.error(`Node ${node.idName}`, JSON.stringify(node));
      throw new Error("Expected node to have child!");
    }
    leftActivationOnMemoryNode(session, child, newIdAttrs, newToken, isNew, bindResults.binding!);
  }
};

export default leftActivationFromVars;

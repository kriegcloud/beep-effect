import { type AlphaNode, AuditAction, AuditRecordType, type Session, TokenKind } from "@beep/rete/rete";
import { fireRules } from "../fire-rules";
import { rightActivationWithAlphaNode } from "../right-activation-with-alpha-node";
import { hashIdAttr } from "../utils";

const retractFactByIdAndAttr = <T extends object>(
  session: Session<T>,
  id: string,
  attr: keyof T,
  autoFire?: boolean
) => {
  // Make a copy of idAttrNodes[idAttr], since rightActivationWithAlphaNode will modify it
  const idAttrNodes = new Set<AlphaNode<T>>();
  const alphaNodes = session.idAttrNodes.get(hashIdAttr([id, attr]))?.alphaNodes ?? [];
  for (const alpha of alphaNodes) {
    idAttrNodes.add(alpha);
  }

  for (const node of idAttrNodes) {
    const fact = node.facts.get(id)?.get(attr.toString());
    if (fact) {
      session.auditor?.log?.({
        tag: AuditRecordType.FACT,
        action: AuditAction.RETRACTION,
        fact,
      });
      rightActivationWithAlphaNode(session, node, {
        fact,
        kind: TokenKind.Enum.RETRACT,
      });
    } else {
      console.warn("Missing fact during retraction?");
    }
  }
  if (autoFire ?? session.autoFire) {
    fireRules(session);
  }
};

export default retractFactByIdAndAttr;

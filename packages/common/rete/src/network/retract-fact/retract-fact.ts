import { deepEqual } from "@beep/utils";
import { AuditAction, AuditRecordType } from "../../network/audit";
import { ExpectedFactToBeInNodeFacts } from "../../network/retract-fact/errors";
import { type $Schema, type AlphaNode, type Fact, type Session, TokenKind } from "../../network/types";
import { fireRules } from "../fire-rules";
import { getIdAttr } from "../get-id-attr";
import { rightActivationWithAlphaNode } from "../right-activation-with-alpha-node";
import { hashIdAttr } from "../utils";

export const retractFact = <T extends $Schema>(session: Session<T>, fact: Fact<T>) => {
  try {
    const idAttr = getIdAttr(fact);
    const idAttrHash = hashIdAttr(idAttr);
    // Make a copy of idAttrNodes[idAttr], since rightActivationWithAlphaNode will modify it
    const idAttrNodes = new Set<AlphaNode<T>>();
    const alphaNodes = session.idAttrNodes.get(idAttrHash)?.alphaNodes ?? [];

    for (const alpha of alphaNodes) {
      idAttrNodes.add(alpha);
    }

    for (const node of idAttrNodes) {
      const otherFact = node.facts.get(idAttr[0].toString())?.get(idAttr[1].toString());
      if (!deepEqual(fact, otherFact)) {
        throw new ExpectedFactToBeInNodeFacts(fact, idAttr);
      }
      session.auditor?.log?.({
        action: AuditAction.RETRACTION,
        fact,
        tag: AuditRecordType.FACT,
      });
      rightActivationWithAlphaNode(session, node, {
        fact,
        kind: TokenKind.Enum.RETRACT,
      });
    }
    if (session.autoFire) {
      fireRules(session);
    }
  } catch (e) {
    session.auditor?.flush?.();
    throw e;
  }
};
export default retractFact;

import { type AlphaNode, AuditAction, AuditRecordType, type Fact, type Session, TokenKind } from "@beep/rete/rete";
import { getIdAttr } from "../get-id-attr";
import { rightActivationWithAlphaNode } from "../right-activation-with-alpha-node";
import { hashIdAttr } from "../utils";

export const upsertFact = <T extends object>(session: Session<T>, fact: Fact<T>, nodes: Set<AlphaNode<T>>) => {
  try {
    const idAttr = getIdAttr<T>(fact);
    const idAttrHash = hashIdAttr(idAttr);
    if (!session.idAttrNodes.has(idAttrHash)) {
      session.auditor?.log?.({
        tag: AuditRecordType.FACT,
        fact,
        action: AuditAction.INSERTION,
      });
      for (const n of nodes) {
        rightActivationWithAlphaNode(session, n, {
          fact,
          kind: TokenKind.Enum.INSERT,
        });
      }
    } else {
      const existingNodes = session.idAttrNodes.get(idAttrHash);
      if (existingNodes === undefined) {
        return;
      }
      let didRetract = false;
      // retract any facts from nodes that the new fact wasn't inserted in
      // we use toSeq here to make a copy of the existingNodes, because
      // rightActivation will modify it
      const existingNodesCopy = new Set<AlphaNode<T>>(existingNodes.alphaNodes);
      for (const n of existingNodesCopy) {
        if (!nodes.has(n)) {
          const oldFact = n.facts.get(fact[0].toString())?.get(fact[1].toString());
          if (oldFact === undefined) {
            console.warn("Old fact doesn't exist?");
            continue;
          }
          didRetract = true;
          rightActivationWithAlphaNode(session, n, {
            fact: oldFact,
            kind: TokenKind.Enum.RETRACT,
          });
        }
      }
      if (didRetract) {
        session.auditor?.log?.({
          tag: AuditRecordType.FACT,
          fact,
          action: AuditAction.RETRACTION,
        });
      }

      // biome-ignore lint/complexity/noUselessUndefinedInitialization: <explanation>
      let didUpdate = undefined;
      // biome-ignore lint/complexity/noUselessUndefinedInitialization: <explanation>
      let oldFactRecord = undefined;
      // update or insert facts, depending on whether the node already exists
      for (const n of nodes) {
        if (existingNodes.alphaNodes.has(n)) {
          const oldFact = n.facts.get(fact[0].toString())?.get(fact[1].toString());
          didUpdate = true;
          oldFactRecord = oldFact;
          if (oldFact && fact[2] === oldFact[2]) {
            continue;
          }
          rightActivationWithAlphaNode(session, n, {
            fact,
            kind: TokenKind.Enum.UPDATE,
            oldFact,
          });
        } else {
          didUpdate = false;
          rightActivationWithAlphaNode(session, n, {
            fact,
            kind: TokenKind.Enum.INSERT,
          });
        }
      }
      if (didUpdate === true) {
        session.auditor?.log?.({
          tag: AuditRecordType.FACT,
          fact,
          action: AuditAction.UPDATE,
          oldFact: oldFactRecord,
        });
      } else if (didUpdate === false) {
        session.auditor?.log?.({
          tag: AuditRecordType.FACT,
          fact,
          action: AuditAction.INSERTION,
        });
      }
    }
  } catch (e) {
    session.auditor?.flush?.();
    throw e;
  }
};

export default upsertFact;

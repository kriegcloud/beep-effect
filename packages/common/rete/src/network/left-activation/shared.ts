import { bindVarsFromFact } from "../bind-vars-from-fact";
import { bindingsToMatch } from "../bindings-to-match";
import { getIdAttr } from "../get-id-attr";
import { getValFromBindings } from "../get-val-from-bindings";
import { ExpectedToHaveAlphaFactsForNode as ExpectedToHaveAlphaFactsForNodeFromVars } from "../left-activation-from-vars/errors";
import { ExpectedToHaveAlphaFactsForNode as ExpectedToHaveAlphaFactsForNodeWithoutAlpha } from "../left-activation-without-alpha/errors";
import type { $Schema, Binding, Fact, IdAttrs, JoinNode, Match, MemoryNode, Session, Token } from "../types";
import { MEMORY_NODE_TYPE, TokenKind } from "../types";
import { hashIdAttr, hashIdAttrs } from "../utils";

export const leftActivationWithoutAlpha = <T extends $Schema>(
  session: Session<T>,
  node: JoinNode<T>,
  idAttrs: IdAttrs<T>,
  token: Token<T>,
  binding: Binding<T>
) => {
  if (node.idName && node.idName !== "") {
    const id = getValFromBindings(binding, node.idName);
    const idStr = id !== undefined ? `${String(id)}` : undefined;
    if (idStr !== undefined && node.alphaNode.facts.get(idStr)) {
      const alphaFacts = node.alphaNode.facts.get(idStr)?.values();
      if (!alphaFacts) {
        throw new ExpectedToHaveAlphaFactsForNodeWithoutAlpha(node);
      }
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

export const leftActivationFromVars = <T extends $Schema>(
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
      throw new ExpectedToHaveAlphaFactsForNodeFromVars(node, session);
    }
    leftActivationOnMemoryNode(session, child, newIdAttrs, newToken, isNew, bindResults.binding!);
  }
};

export const leftActivationOnMemoryNode = <T extends $Schema>(
  session: Session<T>,
  node: MemoryNode<T>,
  idAttrs: IdAttrs<T>,
  token: Token<T>,
  isNew: boolean,
  bindings: Binding<T>
) => {
  const idAttr = idAttrs[idAttrs.length - 1]!;
  const idAttrsHash = hashIdAttrs(idAttrs);
  if (
    isNew &&
    (token.kind === TokenKind.Enum.INSERT || token.kind === TokenKind.Enum.UPDATE) &&
    node.condition.shouldTrigger &&
    node.leafNode &&
    node.leafNode.nodeType
  ) {
    node.leafNode.nodeType.trigger = true;
  }

  if (token.kind === TokenKind.Enum.INSERT || token.kind === TokenKind.Enum.UPDATE) {
    let match: Match<T>;
    if (node.matches.has(idAttrsHash)) {
      match = node.matches.get(idAttrsHash)!.match!;
    } else {
      node.lastMatchId += 1;
      match = { id: node.lastMatchId };
    }
    match.bindings = bindings;
    match.enabled =
      node.type !== MEMORY_NODE_TYPE.Enum.LEAF ||
      !node.nodeType?.condFn ||
      (node.nodeType?.condFn(bindingsToMatch(bindings)) ?? true);
    node.matchIds.set(match.id, idAttrs);
    node.matches.set(idAttrsHash, { idAttrs, match });
    if (node.type === MEMORY_NODE_TYPE.Enum.LEAF && node.nodeType?.trigger) {
      session.triggeredSubscriptionQueue.add(node.ruleName);
      if (node.nodeType?.thenFn) {
        session.thenQueue.add([node, idAttrsHash]);
      }
      if (node.nodeType.thenFinallyFn) {
        session.thenFinallyQueue.add(node);
      }
    }
    node.parent.oldIdAttrs.add(hashIdAttr(idAttr));
  } else if (token.kind === TokenKind.Enum.RETRACT) {
    const idToDelete = node.matches.get(idAttrsHash);
    if (idToDelete) {
      node.matchIds.delete(idToDelete.match.id);
    }
    node.matches.delete(idAttrsHash);
    node.parent.oldIdAttrs.delete(hashIdAttr(idAttr));
    if (node.type === MEMORY_NODE_TYPE.Enum.LEAF && node.nodeType) {
      session.triggeredSubscriptionQueue.add(node.ruleName);
      if (node.nodeType.thenFinallyFn) {
        session.thenFinallyQueue.add(node);
      }
    }
  }
  if (node.type !== MEMORY_NODE_TYPE.Enum.LEAF && node.child) {
    leftActivationWithoutAlpha(session, node.child, idAttrs, token, bindings);
  }
};

export default leftActivationWithoutAlpha;

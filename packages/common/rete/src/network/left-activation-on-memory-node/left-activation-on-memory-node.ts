import {
  type Binding,
  type IdAttrs,
  type Match,
  MEMORY_NODE_TYPE,
  type MemoryNode,
  type Session,
  type Token,
  TokenKind,
} from "@beep/rete/network";
import { bindingsToMatch } from "../bindings-to-match";
import { leftActivationWithoutAlpha } from "../left-activation-without-alpha";
import { hashIdAttr, hashIdAttrs } from "../utils";

export const leftActivationOnMemoryNode = <T extends object>(
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

export default leftActivationOnMemoryNode;

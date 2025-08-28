import type { AlphaNode, Auditor, Fact, IdAttr, IdAttrsHash, MemoryNode, Session } from "@beep/rete/rete";
import { defaultInitMatch } from "../default-init-match";

export const initSession = <T extends object>(autoFire = true, auditor?: Auditor): Session<T> => {
  let nodeIdCounter = 0;
  const nextId = () => nodeIdCounter++;
  const alphaNode: AlphaNode<T> = {
    id: nodeIdCounter,
    facts: new Map<string, Map<string, Fact<T>>>(),
    successors: [],
    children: [],
  };
  nextId();
  const leafNodes = new Map<string, MemoryNode<T>>();

  const idAttrNodes = new Map<number, { alphaNodes: Set<AlphaNode<T>>; idAttr: IdAttr<T> }>();

  const thenQueue = new Set<[MemoryNode<T>, IdAttrsHash.Type]>();

  const thenFinallyQueue = new Set<MemoryNode<T>>();

  const triggeredNodeIds = new Set<MemoryNode<T>>();

  const subscriptionQueue = new Map<string, () => void>();

  const initMatch = () => defaultInitMatch();

  return {
    auditor,
    alphaNode,
    leafNodes,
    idAttrNodes,
    thenQueue,
    thenFinallyQueue,
    triggeredNodeIds,
    initMatch,
    insideRule: false,
    subscriptionsOnProductions: subscriptionQueue,
    triggeredSubscriptionQueue: new Set<string>(),
    autoFire,
    nextId,
  };
};

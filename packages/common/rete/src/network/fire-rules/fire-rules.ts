import type {
  $Schema,
  ExecutedNodes,
  IdAttrs,
  IdAttrsHash,
  Match,
  MemoryNode,
  Session,
} from "@beep/rete/network/types";
import { AuditEntryState, AuditRecordType, AuditRuleTrigger } from "../audit";
import { bindingsToMatch } from "../bindings-to-match";
import { RecursionLimitError } from "../raise-recursion-limit";

const DEFAULT_RECURSION_LIMIT = 16;
export const fireRules = <T extends $Schema>(session: Session<T>, recursionLimit: number = DEFAULT_RECURSION_LIMIT) => {
  try {
    if (session.insideRule) {
      return;
    }
    session.insideRule = true;
    session.auditor?.log?.({
      state: AuditEntryState.ENTER,
      tag: AuditRecordType.FIRE,
    });

    // Only for debugging purposes, should we remove for prod usage?
    const executedNodes: ExecutedNodes<T> = [];

    let recurCount = 0;
    // `raiseRecursionLimit(recursionLimit, executedNodes) will explode
    // noinspection InfiniteLoopJS
    let notFinishedExecuting = true;
    while (notFinishedExecuting) {
      if (recursionLimit >= 0) {
        if (recurCount == recursionLimit) {
          throw new RecursionLimitError(recursionLimit, executedNodes);
        }
        recurCount += 1;
      }

      const thenQueue = [...session.thenQueue];
      const thenFinallyQueue = [...session.thenFinallyQueue];
      if (thenQueue.length == 0 && thenFinallyQueue.length == 0) {
        notFinishedExecuting = false;
        break;
      }

      // reset state
      session.thenQueue.clear();
      session.thenFinallyQueue.clear();
      for (const nodeArr of thenQueue) {
        const node = nodeArr[0];
        if (node.nodeType) {
          node.nodeType!.trigger = false;
        }
      }

      for (const node of thenFinallyQueue) {
        if (node.nodeType) {
          node.nodeType!.trigger = false;
        }
      }

      const nodeToTriggeredNodeIds = new Map<MemoryNode<T>, Set<MemoryNode<T>>>();
      const add = (t: Map<MemoryNode<T>, Set<MemoryNode<T>>>, nodeId: MemoryNode<T>, s: Set<MemoryNode<T>>) => {
        if (!t.has(nodeId)) {
          t.set(nodeId, new Set<MemoryNode<T>>());
        }
        const existing = t.get(nodeId) ?? new Set<MemoryNode<T>>();
        const ns = new Set<MemoryNode<T>>();
        for (const e of s) {
          ns.add(e);
        }

        for (const e of existing) {
          ns.add(e);
        }
        t.set(nodeId, ns);
      };

      //  keep a copy of the matches before executing the :then functions.
      //  if we pull the matches from inside the for loop below,
      //  it'll produce non-deterministic results because `matches`
      //  could be modified by the for loop itself. see test: "non-deterministic behavior"

      const nodeToMatches: Map<
        MemoryNode<T>,
        Map<IdAttrsHash.Type, { idAttrs: IdAttrs<T>; match: Match<T> }>
      > = new Map();

      for (const nodeArr of thenQueue) {
        const node = nodeArr[0];
        if (!nodeToMatches.has(node)) {
          nodeToMatches.set(node, node.matches);
        }
      }

      // Execute `then` blocks
      for (const then of thenQueue) {
        const node = then[0];
        const idAttrsHash = then[1];

        const matches = nodeToMatches.get(node);
        if (matches?.has(idAttrsHash)) {
          const match = matches.get(idAttrsHash);
          if (match?.match?.enabled && match?.match?.bindings) {
            if (node.nodeType?.thenFn !== undefined) {
              session.auditor?.log?.({
                tag: AuditRecordType.RULE,
                rule: node.ruleName,
                trigger: AuditRuleTrigger.THEN,
                state: AuditEntryState.ENTER,
              });
              node.nodeType.thenFn(bindingsToMatch(match.match.bindings));
              session.auditor?.log?.({
                tag: AuditRecordType.RULE,
                rule: node.ruleName,
                trigger: AuditRuleTrigger.THEN,
                state: AuditEntryState.EXIT,
              });
            }
            add(nodeToTriggeredNodeIds, node, session.triggeredNodeIds);
          }
        }
      }

      // Execute `thenFinally` blocks
      for (const node of thenFinallyQueue) {
        session.triggeredNodeIds.clear();
        if (node.nodeType?.thenFinallyFn !== undefined) {
          session.auditor?.log?.({
            tag: AuditRecordType.RULE,
            rule: node.ruleName,
            trigger: AuditRuleTrigger.THEN_FINALLY,
            state: AuditEntryState.ENTER,
          });
          node.nodeType.thenFinallyFn();
          session.auditor?.log?.({
            tag: AuditRecordType.RULE,
            rule: node.ruleName,
            trigger: AuditRuleTrigger.THEN_FINALLY,
            state: AuditEntryState.EXIT,
          });
        }
        add(nodeToTriggeredNodeIds, node, session.triggeredNodeIds);
      }

      executedNodes.push(nodeToTriggeredNodeIds);
    }

    if (session.subscriptionsOnProductions.size > 0 && session.triggeredSubscriptionQueue.size > 0) {
      for (const ts of session.triggeredSubscriptionQueue) {
        const fn = session.subscriptionsOnProductions.get(ts);
        if (fn) fn();
      }
    }
    session.triggeredSubscriptionQueue.clear();
    session.auditor?.log?.({
      state: AuditEntryState.ENTER,
      tag: AuditRecordType.FIRE,
    });
    session.insideRule = false;
    return { executedNodes, session };
  } catch (e) {
    session.insideRule = false;
    session.auditor?.flush?.();
    throw e;
  }
};

export default fireRules;
